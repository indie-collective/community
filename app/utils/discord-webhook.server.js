import { EmbedBuilder, WebhookClient } from 'discord.js';

const { UPDATE_WEBHOOK_ID, UPDATE_WEBHOOK_TOKEN } = process.env;

const webhookClient = new WebhookClient({ id: UPDATE_WEBHOOK_ID, token: UPDATE_WEBHOOK_TOKEN });

export function sendMessage(content, artefacts = []) {
  if (!content) return;

  const embeds = artefacts.map(({ author, title, description, url, color }) =>
    new EmbedBuilder()
      .setAuthor(author)
      .setTitle(title)
      .setDescription(description)
      .setURL(url)
      .setColor(color || 0xffffff)
  );

  webhookClient.send({
    content,
    embeds,
  });
}

export function sendGameAdded(author, game) {
  if (!author || !game) return;
  const { title, description, url } = game;

  sendMessage('Game added.', [
    {
      author,
      title,
      description,
      url,
      color: 0xff0000,
    },
  ]);
}

export function sendAssociationAdded(author, association) {
  if (!author || !association) return;
  const { title, description, url } = association;

  sendMessage('Association added.', [
    {
      author,
      title,
      description,
      url,
      color: 0x00ff00,
    },
  ]);
}

export function sendStudioAdded(author, studio) {
  if (!author || !studio) return;
  const { title, description, url } = studio;

  sendMessage('Studio added.', [
    {
      author,
      title,
      description,
      url,
      color: 0x0000ff,
    },
  ]);
}

export function sendEventAdded(author, event) {
  if (!author || !event) return;
  const { title, description, url } = event;

  sendMessage('Event added.', [
    {
      author,
      title,
      description,
      url,
      color: 0xffff00, 
    },
  ]);
}
