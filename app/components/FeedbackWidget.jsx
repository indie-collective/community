import { Alert, Box, Button, Dialog, Field, Image, Input, Link as ChakraLink, Portal, RadioGroup, Stack, Text, Textarea } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { LuCamera, LuMessageSquareWarning } from 'react-icons/lu';
import { useFetcher, useRouteLoaderData } from 'react-router';

import Link from './Link';

// Marks the widget's own parts (its button, the dialog and its backdrop),
// which the screenshot leaves out.
const OWN = 'data-feedback-widget';

// The page as a PNG, only when asked for (#376), without the widget in it:
// the dialog stays open, so what's typed stays too. Null when it can't be.
async function capture() {
  try {
    const { domToBlob } = await import('modern-screenshot');
    return await domToBlob(document.body, {
      type: 'image/png',
      scale: Math.min(1, 1600 / window.innerWidth),
      // The page's own background, not a transparent one.
      backgroundColor: getComputedStyle(document.body).backgroundColor,
      filter: (node) => !(node instanceof Element && node.closest(`[${OWN}]`)),
    });
  } catch {
    return null;
  }
}

/**
 * Report a bug or ask for a feature (#320), from any page: filed as a GitHub
 * issue with a screenshot of the page, which can be left out. Members only.
 */
const FeedbackWidget = () => {
  const { currentUser } = useRouteLoaderData('root') ?? {};
  const fetcher = useFetcher();
  const [open, setOpen] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState(null);
  const [type, setType] = useState('bug');

  useEffect(() => {
    if (!screenshot) return setPreview(null);
    const url = URL.createObjectURL(screenshot);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [screenshot]);

  // Opens at once (#376): the screenshot is taken only when asked for.
  const [capturing, setCapturing] = useState(false);
  const [failed, setFailed] = useState(false);
  const takeScreenshot = async () => {
    setCapturing(true);
    setFailed(false);
    const blob = await capture();
    setScreenshot(blob);
    setFailed(!blob);
    setCapturing(false);
  };

  const send = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    data.set('page', window.location.href);
    data.set('browser', navigator.userAgent);
    data.set('viewport', `${window.innerWidth}×${window.innerHeight}`);
    if (screenshot) data.set('screenshot', screenshot, 'screenshot.png');
    fetcher.submit(data, { method: 'post', action: '/feedback', encType: 'multipart/form-data' });
  };

  const issue = fetcher.data?.issue;
  return (
    <>
      <Button size="xs" variant="ghost" onClick={() => setOpen(true)} {...{ [OWN]: '' }}>
        <LuMessageSquareWarning />
        Feedback
      </Button>
      <Dialog.Root
        open={open}
        onOpenChange={({ open: next }) => {
          setOpen(next);
          // A screenshot is of the page it was taken on: not kept for the next.
          if (!next) {
            setScreenshot(null);
            setFailed(false);
          }
        }}
        size="md"
      >
        <Portal>
          <Dialog.Backdrop {...{ [OWN]: '' }} />
          <Dialog.Positioner {...{ [OWN]: '' }}>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Report a bug or suggest a feature</Dialog.Title>
              </Dialog.Header>
              <Dialog.CloseTrigger />
              <Dialog.Body pb={6}>
                {!currentUser ? (
                  <Text>
                    <ChakraLink asChild>
                      <Link to="/signin">Sign in</Link>
                    </ChakraLink>{' '}
                    to send feedback, or tell us on Discord.
                  </Text>
                ) : issue ? (
                  <Alert.Root status="success">
                    <Alert.Indicator />
                    <Alert.Title>
                      Thanks! It&apos;s{' '}
                      <ChakraLink href={issue.url} target="_blank" rel="noopener noreferrer">
                        issue #{issue.number}
                      </ChakraLink>
                      .
                    </Alert.Title>
                  </Alert.Root>
                ) : (
                  <form onSubmit={send}>
                    <Stack gap={4}>
                      <RadioGroup.Root name="type" value={type} onValueChange={({ value }) => setType(value)}>
                        <Stack direction="row" gap={4}>
                          {[
                            ['bug', 'Bug'],
                            ['feature', 'Feature request'],
                          ].map(([value, label]) => (
                            <RadioGroup.Item key={value} value={value}>
                              <RadioGroup.ItemHiddenInput />
                              <RadioGroup.ItemIndicator />
                              <RadioGroup.ItemText>{label}</RadioGroup.ItemText>
                            </RadioGroup.Item>
                          ))}
                        </Stack>
                      </RadioGroup.Root>
                      <Field.Root required>
                        <Field.Label htmlFor="feedback-title">Title</Field.Label>
                        <Input id="feedback-title" name="title" maxLength={200} required />
                      </Field.Root>
                      <Field.Root required>
                        <Field.Label htmlFor="feedback-description">
                          {type === 'bug' ? 'What happened, and what you expected' : 'What you’d like, and why'}
                        </Field.Label>
                        <Textarea id="feedback-description" name="description" minH="7rem" required />
                      </Field.Root>
                      {preview ? (
                        <Box>
                          <Image src={preview} alt="Screenshot of this page" borderWidth="1px" borderRadius="md" maxH="10rem" />
                          <Button size="xs" variant="ghost" mt={1} onClick={() => setScreenshot(null)}>
                            Remove the screenshot
                          </Button>
                        </Box>
                      ) : (
                        <Box>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={takeScreenshot}
                            loading={capturing}
                            loadingText="Taking the screenshot…"
                          >
                            <LuCamera />
                            Add a screenshot of this page
                          </Button>
                          <Text fontSize="xs" color="muted" mt={1}>
                            {failed
                              ? 'The screenshot couldn’t be taken in this browser. Send it without one.'
                              : 'Optional: it helps us see what you see.'}
                          </Text>
                        </Box>
                      )}
                      <Text fontSize="xs" color="muted">
                        It becomes a public issue on GitHub, with this page&apos;s address, your browser and your username.
                      </Text>
                      {fetcher.data?.error && (
                        <Alert.Root status="error">
                          <Alert.Indicator />
                          <Alert.Title>{fetcher.data.error}</Alert.Title>
                        </Alert.Root>
                      )}
                      <Button type="submit" colorPalette="green" loading={fetcher.state !== 'idle'}>
                        Send
                      </Button>
                    </Stack>
                  </form>
                )}
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};

export default FeedbackWidget;
