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
      body: JSON.stringify({ content }),
    });
  } catch (err) {
    console.error('Failed to send Discord notification', err);
  }
}
