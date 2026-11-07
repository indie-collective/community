import { Overlay } from 'pigeon-maps';

import AtlasMark from './AtlasMark';
import ClusterMap from './ClusterMap';
import { associations, studios } from '../stories/fixtures';

export default {
  title: 'Map/ClusterMap',
  component: ClusterMap,
  decorators: [(Story) => <div style={{ height: 420 }}><Story /></div>],
};

// The atlas's map: nearby marks gather into a numbered cluster until you zoom
// in. Tiles come from OpenStreetMap, so they only show with a connection.
export const Default = {
  render: () => (
    <ClusterMap defaultCenter={[48, 2]} defaultZoom={4} clusterMarkerRadius={40} maxZoom={14}>
      {[...studios, ...associations].map((org) => (
        <Overlay key={org.id} anchor={[org.location.latitude, org.location.longitude]} offset={[8, 8]}>
          <AtlasMark type={org.type} />
        </Overlay>
      ))}
    </ClusterMap>
  ),
};
