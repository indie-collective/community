import { Remarkable } from 'remarkable';
import { linkify } from 'remarkable/linkify';
import RemarkableReactRenderer from 'remarkable-react';
import { Text, Link, Box, Divider, List, ListItem, Icon } from '@chakra-ui/core';

const Blockquote = props => (
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

const ImgLink = ({title, alt, src}) => (
  <>
    <Link href={src} title={title}>{alt}</Link>
    {' '}
    <Icon name="external-link" />
  </>
);

const A = (props) => (
  <>
    <Link {...props} />
    {' '}
    <Icon name="external-link" />
  </>
);

const Paragraph = props => <Text mb={2} {...props} />;

const OrderedList = props => <List as="ol" styleType="decimal" stylePos="outside" pl={10} paddingY={5} {...props} />;

const UnorderedList = props => <List styleType="disc" stylePos="outside" pl={10} paddingY={5} {...props} />;

const Li = props => <ListItem {...props} />;

const md = new Remarkable().use(linkify);
md.block.ruler.disable([ 'code', 'fences', 'table', 'footnote', 'heading', 'lheading', 'htmlblock' ]);
md.renderer = new RemarkableReactRenderer({
  components: {
    a: A,
    blockquote: Blockquote,
    hr: Divider,
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
