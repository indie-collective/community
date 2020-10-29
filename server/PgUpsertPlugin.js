module.exports = function PgUpsertPlugin(
  builder,
  { pgDisableDefaultMutations }
) {
  if (pgDisableDefaultMutations) {
    return;
  }

  builder.hook("inflection", (inflection, build) =>
    build.extend(inflection, {
      upsertPayloadType(table) {
        return this.upperCamelCase(
          `upsert-${this._singularizedTableName(table)}-payload`
        );
      },
      upsertByConstraint(constraint) {
        if (constraint.tags.upsertFieldName) {
          return constraint.tags.upsertFieldName;
        }
        return this.camelCase(
          `upsert-${this._singularizedTableName(
            constraint.class
          )}-by-${constraint.keyAttributes
            .map(key => this.column(key))
            .join("-and-")}`
        );
      },
      upsertByConstraintInputType(constraint) {
        return this.camelCase(`${this.upsertByConstraint(constraint)}-input`);
      },
    })
  );

  builder.hook("GraphQLObjectType:fields", (fields, build, context) => {
    const {
      newWithHooks,
      extend,
      parseResolveInfo,
      getTypeByName,
      gql2pg,
      pgGetGqlTypeByTypeIdAndModifier,
      pgGetGqlInputTypeByTypeIdAndModifier,
      pgIntrospectionResultsByKind: introspectionResultsByKind,
      pgSql: sql,
      graphql: {
        GraphQLNonNull,
        GraphQLInputObjectType,
        GraphQLString,
        GraphQLObjectType,
      },
      inflection,
      pgQueryFromResolveData: queryFromResolveData,
      pgOmit: omit,
      pgViaTemporaryTable: viaTemporaryTable,
      describePgEntity,
      pgField,
    } = build;
    const {
      scope: { isRootMutation },
      fieldWithHooks,
    } = context;

    if (!isRootMutation) {
      return fields;
    }

    function upsertFieldsForTable(table) {
      if (
        !table.namespace ||
        !table.isUpdatable ||
        !table.isInsertable ||
        omit(table, "upsert")
      ) {
        return {};
      }

      const TableType = pgGetGqlTypeByTypeIdAndModifier(table.type.id, null);
      if (!TableType) {
        return {};
      }
      const uniqueConstraints = table.constraints.filter(
        con => con.type === "u" || con.type === "p"
      );
      const tableTypeName = TableType.name;
      const TableInput = pgGetGqlInputTypeByTypeIdAndModifier(
        table.type.id,
        null
      );
      const TablePatch = getTypeByName(inflection.patchType(tableTypeName));
      const PayloadType = newWithHooks(
        GraphQLObjectType,
        {
          name: inflection.upsertPayloadType(table),
          description: `The output of our upsert \`${tableTypeName}\` mutation.`,
          // eslint-disable-next-line no-shadow
          fields: ({ fieldWithHooks }) => {
            const tableName = inflection.tableFieldName(table);
            return Object.assign({
              clientMutationId: {
                description:
                  "The exact same `clientMutationId` that was provided in the mutation input, unchanged and unused. May be used by a client to track mutations.",
                type: GraphQLString,
              },
              [tableName]: pgField(
                build,
                fieldWithHooks,
                tableName,
                {
                  description: `The \`${tableTypeName}\` that was upserted by this mutation.`,
                  type: TableType,
                },
                {},
                false
              ),
            });
          },
        },
        {
          __origin: `Adding table upsert mutation payload type for ${describePgEntity(
            table
          )}.`,
          isMutationPayload: true,
          isPgUpsertPayloadType: true,
          pgIntrospection: table,
        }
      );
      return uniqueConstraints.reduce((memo, constraint) => {
        if (omit(constraint, "upsert")) return memo;
        if (!constraint.tags.upsert && !table.tags.upsert) return memo;
        const keys = constraint.keyAttributes;
        if (keys.some(key => omit(key, "read"))) {
          return memo;
        }
        const fieldName = inflection.upsertByConstraint(constraint);
        const InputType = newWithHooks(
          GraphQLInputObjectType,
          {
            description: `All input for the \`${fieldName}\` mutation.`,
            name: inflection.upsertByConstraintInputType(constraint),
            fields: Object.assign({
              clientMutationId: {
                type: GraphQLString,
              },
              [inflection.tableFieldName(table)]: {
                description: `The \`${tableTypeName}\` to be created by this mutation.`,
                type: new GraphQLNonNull(TableInput),
              },
              [inflection.patchField(inflection.tableFieldName(table))]: {
                description: `An object where the defined keys will be set on the \`${tableTypeName}\` being updated.`,
                type: new GraphQLNonNull(TablePatch),
              },
            }),
          },
          {
            __origin: `Adding table upsert mutation input type for ${describePgEntity(
              constraint
            )}.`,
            isPgUpsertByKeysInputType: true,
            pgIntrospection: table,
            pgFieldIntrospection: constraint,
            pgKeys: keys,
            isMutationInput: true,
          }
        );

        return extend(
          memo,
          {
            [fieldName]: fieldWithHooks(
              fieldName,
              fieldContext => {
                const { getDataFromParsedResolveInfoFragment } = fieldContext;
                return {
                  description: `Inserts a single \`${tableTypeName}\`; if the record already exists then insteads updates the record.`,
                  type: PayloadType,
                  args: {
                    input: {
                      type: new GraphQLNonNull(InputType),
                    },
                  },
                  async resolve(parent, args, resolveContext, resolveInfo) {
                    const { input } = args;
                    const { pgClient } = resolveContext;
                    const parsedResolveInfoFragment = parseResolveInfo(
                      resolveInfo
                    );
                    parsedResolveInfoFragment.args = args; // Allow overriding via makeWrapResolversPlugin
                    const resolveData = getDataFromParsedResolveInfoFragment(
                      parsedResolveInfoFragment,
                      PayloadType
                    );

                    const sqlTypeIdentifier = sql.identifier(
                      table.namespace.name,
                      table.name
                    );

                    const inputCreate = input[inflection.tableFieldName(table)];
                    const inputPatch =
                      input[
                        inflection.patchField(inflection.tableFieldName(table))
                      ];
                    const columnsToInsert = [];
                    const valuesToInsert = [];
                    const updateStatements = [];

                    table.attributes.forEach(attr => {
                      const attrFieldName = inflection.column(attr);
                      if (!omit(attr, "insert")) {
                        if (attrFieldName in inputCreate) {
                          columnsToInsert.push(sql.identifier(attr.name));
                          valuesToInsert.push(
                            gql2pg(
                              inputCreate[attrFieldName],
                              attr.type,
                              attr.typeModifier
                            )
                          );
                        }
                      }

                      if (!omit(attr, "update")) {
                        if (attrFieldName in inputPatch) {
                          updateStatements.push(
                            sql.fragment`${sql.identifier(
                              attr.name
                            )} = ${gql2pg(
                              inputPatch[attrFieldName],
                              attr.type,
                              attr.typeModifier
                            )}`
                          );
                        }
                      }
                    });

                    const sqlMutationQuery = sql.query`
                      insert into ${sql.identifier(
                        table.namespace.name,
                        table.name
                      )} (${sql.join(columnsToInsert, ", ")})
                      values(${sql.join(valuesToInsert, ", ")})
                      on conflict (${sql.join(
                        keys.map(key => sql.identifier(key.name)),
                        ", "
                      )})
                      do ${
                        updateStatements.length === 0
                          ? sql.fragment`nothing`
                          : sql.fragment`update set
                      ${sql.join(updateStatements, ", ")}
                      returning *`
                      }`;
                    const modifiedRowAlias = sql.identifier(
                      Symbol("modified_row")
                    );
                    const query = queryFromResolveData(
                      modifiedRowAlias,
                      modifiedRowAlias,
                      resolveData,
                      {},
                      null,
                      resolveContext
                    );
                    let row;
                    try {
                      await pgClient.query("SAVEPOINT graphql_mutation");
                      const rows = await viaTemporaryTable(
                        pgClient,
                        sqlTypeIdentifier,
                        sqlMutationQuery,
                        modifiedRowAlias,
                        query
                      );
                      row = rows[0];
                      await pgClient.query(
                        "RELEASE SAVEPOINT graphql_mutation"
                      );
                    } catch (e) {
                      await pgClient.query(
                        "ROLLBACK TO SAVEPOINT graphql_mutation"
                      );
                      throw e;
                    }
                    if (!row) {
                      throw new Error(
                        `Could not upsert that record - check your permissions`
                      );
                    }
                    return {
                      clientMutationId: input.clientMutationId,
                      data: row,
                    };
                  },
                };
              },
              {
                isPgNodeMutation: false,
                pgFieldIntrospection: table,
                pgFieldConstraint: constraint,
                isPgUpsertMutationField: true,
              }
            ),
          },
          `Adding upsert mutation for ${describePgEntity(constraint)}`
        );
      }, {});
    }

    return extend(
      fields,
      introspectionResultsByKind.class.reduce(
        (memo, table) =>
          extend(
            memo,
            upsertFieldsForTable(table),
            `Adding upsert mutations for ${describePgEntity(table)}`
          ),
        {}
      ),
      `Adding upsert mutations to root Mutation type`
    );
  });
};