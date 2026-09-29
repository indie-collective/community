import { Remarkable } from 'remarkable';
import { linkify } from 'remarkable/linkify';
import RemarkableReactRenderer from 'remarkable-react';
import { Text, Link, Box, Separator, List } from '@chakra-ui/react';
import { LuExternalLink } from 'react-icons/lu';

const Blockquote = (props) => (
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

// Everything a description links to is off-site.
const ExternalLink = ({ children, ...props }) => (
  <Link target="_blank" rel="noopener noreferrer" {...props}>
    {children}
    <LuExternalLink />
  </Link>
);

const ImgLink = ({ title, alt, src }) => (
  <ExternalLink href={src} title={title}>
    {alt}
  </ExternalLink>
);

const Paragraph = ({ tight, ...props }) => <Text mb={2} {...props} />;

const OrderedList = (props) => (
  <List.Root
    as="ol"
    listStyleType="decimal"
    listStylePosition="outside"
    pl={10}
    paddingY={5}
    {...props}
  />
);

const UnorderedList = (props) => (
  <List.Root
    listStyleType="disc"
    listStylePosition="outside"
    pl={10}
    paddingY={5}
    {...props}
  />
);

const Li = (props) => <List.Item {...props} />;

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
    hr: Separator,
    p: Paragraph,
    ol: OrderedList,
    ul: UnorderedList,
    li: Li,
    img: ImgLink,
  },
});

const Markdown = ({ value }) => (value ? md.render(value) : null);

export default Markdown;
