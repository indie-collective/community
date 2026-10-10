// The Indie Collective Discord server, read with the bot token (a fetch,
// where discord.js needed Node).
const GUILD_ID = '84687138729259008';

/**
 * The guild member for a Discord user (`{ roles, … }`), or null when they
 * aren't one. Throws when Discord can't answer.
 */
export async function getGuildMember(userId) {
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${userId}`,
    { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
  );
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Discord guild member request failed: ${response.status}`);
  }
  return response.json();
}
