import { Remarkable } from 'remarkable';
import { linkify } from 'remarkable/linkify';
import RemarkableReactRenderer from 'remarkable-react';
import {
  Text,
  Link,
  Box,
  List,
  ListItem,
} from '@chakra-ui/react';
import { FiExternalLink } from 'react-icons/fi';

const Blockquote = (props) => (
  <Box
    as="blockquote"
    borderLeft="5px solid #000"
    backgroundColor="gray.100"
    padding={5}
    pb={3}
    mb={5}
    {...props}
  />
);

const ImgLink = ({ title, alt, src }) => (
  <>
    <Link href={src} title={title}>
      {alt}
    </Link>{' '}
    <FiExternalLink />
  </>
);

const A = (props) => (
  <>
    <Link {...props} /> <FiExternalLink />
  </>
);

const Paragraph = ({tight, ...props}) => <Text mb={2} {...props} />;

const OrderedList = (props) => (
  <List
    as="ol"
    styleType="decimal"
    stylePosition="outside"
    pl={10}
    paddingY={5}
    {...props}
  />
);

const UnorderedList = (props) => (
  <List styleType="disc" stylePosition="outside" pl={10} paddingY={5} {...props} />
);

const Li = (props) => <ListItem {...props} />;

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
    a: A,
    blockquote: Blockquote,
    p: Paragraph,
    ol: OrderedList,
    ul: UnorderedList,
    li: Li,
    img: ImgLink,
  },
});

const Markdown = ({ value }) => {
  return md.render(value);
};

export default Markdown;
