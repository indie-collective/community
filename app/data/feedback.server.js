// The feedback widget (#320): a member's bug report or feature request,
// filed as an issue in the site's GitHub repository with a screenshot. The
// token stays on the server (GITHUB_TOKEN); GITHUB_API stands in for tests.
import { env } from 'cloudflare:workers';

import { getValue, setValue } from './kv.server';

const githubApi = () => process.env.GITHUB_API || 'https://api.github.com';
const repo = () => process.env.GITHUB_REPO || 'indie-collective/community';

export const MAX_SCREENSHOT = 2 * 1024 * 1024;
const PER_HOUR = 5;

/** A message for the form, as an Error the route shows. */
class FeedbackError extends Error {}
export { FeedbackError };

// At most PER_HOUR reports an hour per member.
async function checkLimit(personId, now) {
  const key = `feedback:${personId}:${Math.floor(now.getTime() / 3600000)}`;
  const sent = Number((await getValue(key))?.value ?? 0);
  if (sent >= PER_HOUR) throw new FeedbackError('You sent a lot of feedback this hour: thanks! Try again a little later.');
  await setValue(key, String(sent + 1), { expiresAt: new Date(now.getTime() + 2 * 3600000) });
}

/** The issue's body: what they wrote, where, on what, by whom, and the screenshot. */
export function issueBody({ description, page, browser, viewport, username, screenshotUrl }) {
  return [
    description.trim(),
    '',
    screenshotUrl ? `![Screenshot](${screenshotUrl})\n` : null,
    '---',
    `- Page: ${page}`,
    `- Browser: ${browser || 'unknown'}`,
    `- Viewport: ${viewport || 'unknown'}`,
    `- Sent by: @${username} on the site's feedback widget`,
  ]
    .filter((line) => line !== null)
    .join('\n');
}

/**
 * Files feedback as a GitHub issue: `type` bug or feature, a title and
 * description, the page it's about, and an optional PNG screenshot (bytes).
 * Throws a FeedbackError with a message for the form.
 *
 * @returns {Promise<{ url: string, number: number }>} the issue
 */
export async function sendFeedback({ type, title, description, page, browser, viewport, screenshot, person, origin, now = new Date() }) {
  if (!['bug', 'feature'].includes(type)) throw new FeedbackError('Is it a bug or a feature request?');
  if (!title?.trim() || !description?.trim()) throw new FeedbackError('Give it a title and say what happened, or what you’d like.');
  if (title.length > 200) throw new FeedbackError('Keep the title short: 200 characters at most.');
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn('GITHUB_TOKEN is not configured');
    throw new FeedbackError('Feedback isn’t set up on this site yet. Please tell us on Discord instead.');
  }
  await checkLimit(person.id, now);

  let screenshotUrl = null;
  if (screenshot?.byteLength) {
    if (screenshot.byteLength > MAX_SCREENSHOT) throw new FeedbackError('The screenshot is too big: remove it, or send a smaller one.');
    const key = `feedback/${crypto.randomUUID()}.png`;
    await env.IMAGES.put(key, screenshot, { httpMetadata: { contentType: 'image/png' } });
    const cdn = process.env.CDN_HOST;
    screenshotUrl = cdn ? `${/^https?:\/\//.test(cdn) ? cdn : `https://${cdn}`}/${key}` : `${origin}/images/${key}`;
  }

  const response = await fetch(`${githubApi()}/repos/${repo()}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'indieco-community-feedback',
    },
    body: JSON.stringify({
      title: title.trim(),
      body: issueBody({ description, page, browser, viewport, username: person.username, screenshotUrl }),
      labels: [type === 'bug' ? 'bug' : 'enhancement', 'needs-triage'],
    }),
  });
  if (!response.ok) {
    console.error('Filing feedback failed', response.status, await response.text());
    throw new FeedbackError('GitHub didn’t take it. Please try again later.');
  }
  const issue = await response.json();
  return { url: issue.html_url, number: issue.number };
}
