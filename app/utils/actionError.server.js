/**
 * What a form shows when its action fails: the message of a refusal (a 429
 * over the hourly limit, #309), else `fallback`, else the error's message.
 */
export async function actionErrorMessage(err, fallback) {
  if (err instanceof Response) return (await err.text()) || err.statusText;
  return fallback ?? err?.message;
}
