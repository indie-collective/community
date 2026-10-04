// Spike only: stands in for the Node-only libraries the migration replaces
// (jimp, aws-sdk, discord.js, remix-auth-discord, igdb-api-node,
// memory-cache, pg-tsquery), so the rest of the bundle can be measured.
const handler = {
  get: (_, prop) => (prop === 'then' ? undefined : new Proxy(function () {}, handler)),
  apply: () => new Proxy(function () {}, handler),
  construct: () => new Proxy(function () {}, handler),
};
const stub = new Proxy(function () {}, handler);
export default stub;
export const Jimp = stub, REST = stub, Routes = stub, DiscordStrategy = stub;
