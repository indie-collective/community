import { Box, Code, Flex, Heading, Stack, Text, Theme } from '@chakra-ui/react';

/** The parts the Theme pages are made of. */
/** The value as written in the theme, both modes when they differ. */
export const TokenValue = ({ value }) =>
  typeof value === 'string' ? (
    <Code size="sm" alignSelf="flex-start">
      {value}
    </Code>
  ) : (
    <Stack gap={1} align="flex-start">
      <Code size="sm">light {value.base}</Code>
      <Code size="sm">dark {value._dark}</Code>
    </Stack>
  );

/** Its children twice, in a light panel and a dark one. */
export const BothModes = ({ children, h = '120px', ...rest }) => (
  <Flex
    gap={0}
    borderRadius="card"
    overflow="hidden"
    borderWidth="1px"
    borderColor="rule"
  >
    {['light', 'dark'].map((mode) => (
      <Theme key={mode} appearance={mode} flex={1} hasBackground={false}>
        <Flex
          data-mode={mode}
          bg="canvas"
          color="ink"
          h={h}
          align="center"
          justify="center"
          gap={4}
          px={4}
          {...rest}
        >
          {children}
        </Flex>
      </Theme>
    ))}
  </Flex>
);

/** One token: its demonstration, then its name, what it is for and its value. */
export const TokenRow = ({ name, description, value, children }) => (
  <Flex
    data-token={name}
    gap={5}
    py={4}
    borderTopWidth="1px"
    borderColor="rule"
    direction={{ base: 'column', md: 'row' }}
  >
    <Box flex={{ md: '0 0 50%' }}>{children}</Box>
    <Stack gap={1.5} flex={1} minW={0}>
      <Heading as="h3" size="sm" fontFamily="mono">
        {name}
      </Heading>
      {description && <Text color="muted">{description}</Text>}
      <TokenValue value={value} />
    </Stack>
  </Flex>
);

export const TokenPage = ({ title, intro, children }) => (
  <Stack gap={6} maxW="960px">
    <Stack gap={2}>
      <Heading as="h1" size="2xl">
        {title}
      </Heading>
      {intro && <Text color="muted">{intro}</Text>}
    </Stack>
    {children}
  </Stack>
);

export const TokenSection = ({ title, intro, children }) => (
  <Stack gap={0}>
    <Heading as="h2" size="lg" mb={1}>
      {title}
    </Heading>
    {intro && (
      <Text color="muted" mb={3}>
        {intro}
      </Text>
    )}
    {children}
  </Stack>
);
