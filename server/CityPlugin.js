const { makeExtendSchemaPlugin, gql } = require('graphile-utils');

const CityPlugin = makeExtendSchemaPlugin((build) => {
  // Get any helpers we need from `build`
  const { pgSql: sql, inflection } = build;

  return {
    typeDefs: gql`
      extend type City {
        orgs: EntitiesConnection
        events: EventsConnection
      }
    `,
    resolvers: {
      City: {
        orgs: async (_query, args, context, resolveInfo) => {
          const { rows } = await context.pgClient.query(
            `select id from indieco.location where city = $1 and region = $2 and country_code = $3`,
            [_query.name, _query.region, _query.countryCode]
          );

          return resolveInfo.graphile.selectGraphQLResultFromTable(
            sql.fragment`indieco.entity`,
            (tableAlias, queryBuilder) => {
              queryBuilder.where(
                sql.fragment`${tableAlias}.location_id = ${sql.value(
                  rows[0].id
                )}`
              );
            }
          );
        },

        events: async (_query, args, context, resolveInfo) => {
          const { rows } = await context.pgClient.query(
            `select id from indieco.location where city = $1 and region = $2 and country_code = $3`,
            [_query.name, _query.region, _query.countryCode]
          );

          return resolveInfo.graphile.selectGraphQLResultFromTable(
            sql.fragment`indieco.event`,
            (tableAlias, queryBuilder) => {
              queryBuilder.where(
                sql.fragment`${tableAlias}.location_id = ${sql.value(
                  rows[0].id
                )}`
              );
            }
          );
        },
      },
    },
  };
});

module.exports = CityPlugin;
