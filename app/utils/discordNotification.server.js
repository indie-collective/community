import { toOrigin } from './origin.server';

export async function notifyDiscord(content) {
  const webhookUrl = process.env.DISCORD_NOTIFICATION_WEBHOOK;
  if (!webhookUrl) {
    console.warn('DISCORD_NOTIFICATION_WEBHOOK is not configured');
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Messages include names people typed: never let them ping anyone
      // (e.g. a game called "@everyone").
      body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
    });
  } catch (err) {
    console.error('Failed to send Discord notification', err);
  }
}

/**
 * Tells the team someone joined (#34). Called wherever an account is
 * created, whichever way they signed in. No email or other private field.
 */
export function notifyNewMember({ username, first_name }) {
  const base = toOrigin(process.env.BASE_URL);
  const membersPage = base ? ` ${base}/admin/users` : '';
  return notifyDiscord(`👋 New member: **@${username}** (${first_name}) joined Community.${membersPage}`);
}
