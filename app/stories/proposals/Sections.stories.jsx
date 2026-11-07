import { Box, Flex, Heading, Link as ChakraLink, Text } from '@chakra-ui/react';

import Link from '../../components/Link';
import { Department, PageSection } from '../../components/Page';
import SectionHeading from '../../components/SectionHeading';
import { Board, Row } from './shared';

export default {
  title: 'Proposals/2 Section headings',
  parameters: { layout: 'fullscreen' },
};

const Content = () => (
  <Box h="40px" w="100%" bg="surface" borderWidth="1px" borderColor="rule" rounded="lg" />
);

const Cell = ({ children }) => <Box w="640px">{children}</Box>;

export const Today = {
  render: () => (
    <Board title="Section headings today">
      <Row label="Department" where="Homepage sections">
        <Cell>
          <Department kicker="Recently updated" title="Games" to="/games" linkLabel="All games" mb={0}>
            <Content />
          </Department>
        </Cell>
      </Row>
      <Row label="PageSection" where="Most pages, the events agenda">
        <Cell>
          <PageSection title="Recently" aside={<Text color="muted">12</Text>} mb={0}>
            <Content />
          </PageSection>
        </Cell>
      </Row>
      <Row label="SectionHeading" where="Organisation page: its games and events, a grey count badge">
        <Cell>
          <SectionHeading mb={4} count={8} countLabel="games">
            Games
          </SectionHeading>
          <Content />
        </Cell>
      </Row>
      <Row label="Hand-written h2" where="Event page: About, Organizers, Editions">
        <Cell>
          <Heading as="h2" size="xl" mb={4}>
            Organizers
          </Heading>
          <Content />
        </Cell>
      </Row>
      <Row label="Hand-written h2 with count" where="Search results">
        <Cell>
          <Heading as="h2" size="xl" mb={4}>
            Games{' '}
            <Text as="span" color="muted" fontWeight="normal">
              24
            </Text>
          </Heading>
          <Content />
        </Cell>
      </Row>
    </Board>
  ),
};

// One Section: a rule, the title, a count beside it, and a link to the
// whole list. Two sizes: the homepage's big one, and every other page's.
const Section = ({ title, kicker, count, to, linkLabel, big = false }) => (
  <Box as="section">
    <Flex
      align="flex-end"
      gap={3}
      wrap="wrap"
      borderTop={big ? '2px solid' : '1px solid'}
      borderColor={big ? 'ink' : 'rule'}
      pt={big ? 2 : 3}
      mb={big ? 5 : 4}
    >
      <Box minW={0}>
        {kicker && (
          <Text fontSize="sm" color="muted">
            {kicker}
          </Text>
        )}
        <Heading
          as="h2"
          fontSize={big ? { base: '3xl', md: '4xl' } : { base: 'xl', md: '2xl' }}
          fontWeight="600"
          letterSpacing="-0.02em"
          lineHeight="1.1"
        >
          {title}
          {count != null && (
            <Text as="span" color="muted" fontWeight="400" ms={2} fontSize="0.7em">
              {count}
            </Text>
          )}
        </Heading>
      </Box>
      {to && (
        <ChakraLink
          asChild
          ml="auto"
          fontWeight="semibold"
          fontSize="sm"
          borderBottom="2px solid"
          borderColor="brand"
          _hover={{ color: 'brand', textDecoration: 'none' }}
        >
          <Link to={to}>{linkLabel} →</Link>
        </ChakraLink>
      )}
    </Flex>
    <Content />
  </Box>
);

export const Proposed = {
  render: () => (
    <Board title="Section headings, proposed: one Section">
      <Row label="Section big" where="Homepage only: heavy ink rule, large title">
        <Cell>
          <Section big kicker="Recently updated" title="Games" to="/games" linkLabel="All games" />
        </Cell>
      </Row>
      <Row label="Section" where="Every other page: hairline rule">
        <Cell>
          <Section title="Recently" />
        </Cell>
      </Row>
      <Row label="Section with count" where="Organisation games and events, search results (the count is read as “8 games”)">
        <Cell>
          <Section title="Games" count={8} to="/games?org=s1" linkLabel="All 8" />
        </Cell>
      </Row>
      <Row label="Section, plain" where="Event page: About, Organizers, Editions">
        <Cell>
          <Section title="Organizers" />
        </Cell>
      </Row>
    </Board>
  ),
};
