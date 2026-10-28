// The feedback widget's action (#320): members only.
import { FeedbackError, MAX_SCREENSHOT, sendFeedback } from '../data/feedback.server';
import { authorizer } from '../utils/auth.server';
import getOrigin from '../utils/origin.server';

export async function action(args) {
  const currentUser = await authorizer.authorize(args);
  const { request } = args;
  // The form, with its screenshot, is small: refuse anything bigger.
  if (Number(request.headers.get('content-length')) > MAX_SCREENSHOT + 100000) {
    return { error: 'The screenshot is too big: remove it, or send a smaller one.' };
  }
  const data = await request.formData();
  const file = data.get('screenshot');
  try {
    const issue = await sendFeedback({
      type: data.get('type'),
      title: data.get('title'),
      description: data.get('description'),
      page: data.get('page'),
      browser: data.get('browser'),
      viewport: data.get('viewport'),
      screenshot: file && typeof file !== 'string' && file.size > 0 ? await file.arrayBuffer() : null,
      person: currentUser,
      origin: getOrigin(request),
    });
    return { issue };
  } catch (error) {
    if (error instanceof FeedbackError) return { error: error.message };
    throw error;
  }
}
