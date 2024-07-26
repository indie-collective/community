// Mostly taken from `pigeon-cluster` but some changes needed to make it work

import memoize from 'memoize-one';
import { Map } from 'pigeon-maps';
import React, { Component } from 'react';
import Supercluster from 'supercluster';

import ClusterMarker from './ClusterMarker';

export default class ClusterMap extends Component {
  rebuildData = memoize((elements) => {
    const pointsMap = this.generatePointsMap(elements);
    const index = this.loadPoints(pointsMap);
    return {
      pointsMap,
      index,
    };
  });

  generatePointsMap(elements) {
    let pointsMap = {};

    elements.forEach((child) => {
      const { key, type, props } = child;

      // TODO: name is different when built, cannot filter out UI elements
      // if (type.name !== 'Overlay') return;

      if (!key) {
        console.warn('Markers must have a key property', child);
        return;
      }
      if (!props.anchor) {
        console.warn('Markers must have an anchor property', child);
        return;
      }

      pointsMap[key] = {
        vNode: child,
        geometry: {
          // pigeon maps is [lat, lng] but supercluster needs [lng, lat]
          coordinates: [props.anchor[1], props.anchor[0]],
        },
        id: key,
      };
    });

    return pointsMap;
  }

  loadPoints(pointsMap) {
    const index = new Supercluster({
      radius: this.props.clusterMarkerRadius || 40,
      maxZoom: this.props.maxZoom || 16,
    });

    index.load(Object.keys(pointsMap).map((id) => pointsMap[id]));
    return index;
  }

  render() {
    const { bounds, zoom, children, ...props } = this.props;
    const { ne, sw } = bounds || { ne: [0, 0], sw: [0, 0] };
    const [southLat, westLng, northLat, eastLng] = [sw[0], sw[1], ne[0], ne[1]];

    const { index, pointsMap } = this.rebuildData(
      React.Children.toArray(children)
    );

    const markersAndClusters =
      index &&
      index.getClusters(
        [westLng, southLat, eastLng, northLat],
        Math.floor(zoom)
      );

    const displayElements = (markersAndClusters || []).map(
      (markerOrCluster) => {
        const isCluster =
          markerOrCluster &&
          markerOrCluster.properties &&
          markerOrCluster.properties.cluster;

        if (isCluster) {
          const clusterElementKey =
            markerOrCluster.geometry.coordinates.toString();

          return (
            <ClusterMarker
              key={clusterElementKey}
              count={markerOrCluster.properties.point_count}
              pixelOffset={[0, 0]}
              // supercluster is [lng, lat] but pigeon-maps needs [lat, lng]
              anchor={[
                markerOrCluster.geometry.coordinates[1],
                markerOrCluster.geometry.coordinates[0],
              ]}
            />
          );
        }

        return pointsMap[markerOrCluster.id].vNode;
      }
    );

    return (
      <Map zoom={zoom} {...props}>
        {React.Children.toArray(children).filter(
          (child) => !child.key || !child.props.anchor
        )}
        {displayElements}
      </Map>
    );
  }
}
