import { print } from 'graphql';
import { filter, pipe, tap } from 'wonka';

const fileExchange = ({ forward }) => {
  return ops$ => {
    const preFlight$ = pipe(
      ops$,
      filter(operation => {
        if (operation.operationName !== 'mutation') {
          return true;
        }

        if (!operation.variables.file) {
          return true;
        }

        const { url } = operation.context;
        const { file } = operation.variables;

        const extraOptions =
          typeof operation.context.fetchOptions === 'function'
            ? operation.context.fetchOptions()
            : operation.context.fetchOptions || {};

        const fetchOptions = {
          method: 'POST',
          headers: {
            ...extraOptions.headers,
          },
        };

        fetchOptions.body = new FormData()

        fetchOptions.body.append(
          'operations',
          JSON.stringify({
            query: print(operation.query),
            variables: Object.assign({}, operation.variables, { file: null }),
          }),
        )

        fetchOptions.body.append(
          'map',
          JSON.stringify({
            0: ['variables.file'],
          })
        )

        fetchOptions.body.append(0, file, file.name)

        fetch(url, fetchOptions)
          .then(res => res.json())
          .then(json => console.log(json));

        return false;
      })
    );

    return forward(preFlight$);
  };
}

export default fileExchange;
