// Work after the response (#309): the Worker keeps running it with
// ctx.waitUntil, from wherever it's started, through the request's scope
// (workers/app.js). Outside a request (tests, scripts), it just runs.
import { AsyncLocalStorage } from 'node:async_hooks';

export const requestScope = new AsyncLocalStorage();

/** Runs `task` after the response; its errors are logged, never thrown. */
export function inBackground(task) {
  const promise = Promise.resolve()
    .then(task)
    .catch((error) => console.error('Background task failed:', error));
  requestScope.getStore()?.ctx?.waitUntil?.(promise);
  return promise;
}
