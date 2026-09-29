import { Remarkable } from 'remarkable';
import { linkify } from 'remarkable/linkify';
import RemarkableReactRenderer from 'remarkable-react';
import { Text, Link, Box, Separator, List } from '@chakra-ui/react';
import { LuExternalLink } from 'react-icons/lu';

// remarkable-react passes each token's `type` (e.g. "paragraph_open") and
// `tight` to these components; they aren't DOM attributes, so drop them.
const Blockquote = ({ type, ...props }) => (
  <Box
    as="blockquote"
    borderLeft="5px solid"
    borderColor={{ base: 'black', _dark: 'whiteAlpha.600' }}
    backgroundColor={{ base: 'gray.100', _dark: 'gray.800' }}
    padding={5}
    pb={3}
    mb={5}
    {...props}
  />
);

// Everything a description links to is off-site. target/rel come after the
// spread: remarkable-react passes its own (empty) target.
const ExternalLink = ({ children, type, ...props }) => (
  <Link {...props} target="_blank" rel="noopener noreferrer">
    {children}
    <LuExternalLink />
  </Link>
);

const ImgLink = ({ title, alt, src }) => (
  <ExternalLink href={src} title={title}>
    {alt}
  </ExternalLink>
);

const Paragraph = ({ tight, type, ...props }) => <Text mb={2} {...props} />;

const OrderedList = ({ tight, type, ...props }) => (
  <List.Root
    as="ol"
    listStyleType="decimal"
    listStylePosition="outside"
    pl={10}
    paddingY={5}
    {...props}
  />
);

const UnorderedList = ({ tight, type, ...props }) => (
  <List.Root
    listStyleType="disc"
    listStylePosition="outside"
    pl={10}
    paddingY={5}
    {...props}
  />
);

const Li = ({ tight, type, ...props }) => <List.Item {...props} />;

const md = new Remarkable().use(linkify);
md.block.ruler.disable([
  'code',
  'fences',
  'table',
  'footnote',
  'heading',
  'lheading',
  'htmlblock',
]);
md.renderer = new RemarkableReactRenderer({
  components: {
    a: ExternalLink,
    blockquote: Blockquote,
    hr: ({ type, ...props }) => <Separator {...props} />,
    p: Paragraph,
    ol: OrderedList,
    ul: UnorderedList,
    li: Li,
    img: ImgLink,
  },
});

const Markdown = ({ value }) => (value ? md.render(value) : null);

export default Markdown;
