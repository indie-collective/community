import { Alert, Box, Button, Dialog, Field, Image, Input, Link as ChakraLink, Portal, RadioGroup, Stack, Text, Textarea } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { LuMessageSquareWarning } from 'react-icons/lu';
import { useFetcher, useRouteLoaderData } from 'react-router';

import Link from './Link';

// The page as a PNG, taken before the dialog opens; null when it can't be.
async function capture() {
  try {
    const { domToBlob } = await import('modern-screenshot');
    return await domToBlob(document.body, { type: 'image/png', scale: Math.min(1, 1600 / window.innerWidth) });
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

  const start = async () => {
    if (currentUser) setScreenshot(await capture());
    setOpen(true);
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
      <Button size="xs" variant="ghost" onClick={start}>
        <LuMessageSquareWarning />
        Feedback
      </Button>
      <Dialog.Root open={open} onOpenChange={({ open: next }) => setOpen(next)} size="md">
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
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
                            Don&apos;t send the screenshot
                          </Button>
                        </Box>
                      ) : (
                        <Text fontSize="sm" color="muted">
                          No screenshot.
                        </Text>
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
