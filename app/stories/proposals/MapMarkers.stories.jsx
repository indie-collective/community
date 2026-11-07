import { Box, Flex, HStack, Text } from '@chakra-ui/react';

import AtlasMark from '../../components/AtlasMark';
import ClusterMarker from '../../components/ClusterMarker';
import MapPin from '../../components/MapPin';
import { pinColor } from '../../utils/orgTypes';
import { Board, Row } from './shared';

export default {
  title: 'Proposals/8 Map markers',
  parameters: { layout: 'fullscreen' },
};

// A patch of map-coloured paper to set the marks on.
const Patch = ({ children, w = '96px' }) => (
  <Flex position="relative" w={w} h="72px" bg="#f2efe9" rounded="lg" align="center" justify="center" gap={3} borderWidth="1px" borderColor="rule">
    {children}
  </Flex>
);

const Named = ({ name, children }) => (
  <Box textAlign="center">
    <Patch>{children}</Patch>
    <Text fontSize="xs" color="muted" mt={1}>
      {name}
    </Text>
  </Box>
);

export const Today = {
  render: () => (
    <Board title="Map markers today">
      <Row label="MapPin" where="Studio, association, event and venue pages: a drop in Chakra yellow, green or purple">
        {['studio', 'association', 'event'].map((type) => (
          <Named key={type} name={type}>
            <MapPin color={pinColor(type)} size={44} />
          </Named>
        ))}
      </Row>
      <Row label="AtlasMark" where="The atlas: green circle, lilac diamond, coral triangle">
        {['studio', 'association', 'event'].map((type) => (
          <Named key={type} name={type}>
            <AtlasMark type={type} size={18} />
          </Named>
        ))}
      </Row>
      <Row label="ClusterMarker" where="The atlas: a bold number in a ring">
        <Named name="cluster">
          <Box position="relative" w="32px" h="32px">
            <ClusterMarker left={16} top={16} count={12} />
          </Box>
        </Named>
      </Row>
      <Row label="Homepage dots" where="The homepage's map: every organisation a coral dot">
        <Named name="any">
          <Box w="10px" h="10px" bg="coral" borderRadius="full" border="2px solid #10201d" />
        </Named>
      </Row>
    </Board>
  ),
};

// One table of marks: a shape and a colour per kind, everywhere. The pin on
// a record's page takes its kind's colour and keeps the logo in its hole.
const MARK_COLOR = { studio: 'brand', association: 'lilac', event: 'coral' };

const Cluster = ({ count }) => (
  <Flex w="30px" h="30px" rounded="full" bg="surface" borderWidth="2px" borderColor="ink" align="center" justify="center" fontSize="sm" fontWeight="600" fontFamily="heading">
    {count}
  </Flex>
);

export const Proposed = {
  render: () => (
    <Board title="Map markers, proposed: one set of marks">
      <Row label="Marks" where="Atlas and homepage map: shape and colour by kind">
        {['studio', 'association', 'event'].map((type) => (
          <Named key={type} name={type}>
            <AtlasMark type={type} size={18} />
          </Named>
        ))}
      </Row>
      <Row label="Pins" where="Record pages: the same colours, the logo in the hole">
        {['studio', 'association', 'event'].map((type) => (
          <Named key={type} name={type}>
            <Box color={MARK_COLOR[type]} filter="drop-shadow(0 0 0.5px #10201d) drop-shadow(0 0 0.5px #10201d)">
              <MapPin color={MARK_COLOR[type]} size={44} />
            </Box>
          </Named>
        ))}
      </Row>
      <Row label="Cluster" where="A count in an ink ring, the site's heading type at 600">
        <Named name="cluster">
          <Cluster count={12} />
        </Named>
      </Row>
      <Row label="Homepage map" where="Small marks by kind instead of one coral dot for everything">
        <Patch w="200px">
          <AtlasMark type="studio" size={11} />
          <AtlasMark type="association" size={11} />
          <AtlasMark type="studio" size={11} />
          <AtlasMark type="studio" size={11} />
          <AtlasMark type="association" size={11} />
        </Patch>
      </Row>
    </Board>
  ),
};
