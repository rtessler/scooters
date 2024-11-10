import MapBox, {
  Camera,
  LocationPuck,
  MapView,
  ShapeSource,
  SymbolLayer,
  Images,
  CircleLayer,
  LineLayer,
} from '@rnmapbox/maps';
import { OnPressEvent } from '@rnmapbox/maps/lib/typescript/src/types/OnPressEvent';
import { featureCollection, point } from '@turf/helpers';
import { useState } from 'react';

import pin from '~/assets/pin.png';
import moped from '~/assets/moped.png';
import scooters from '~/data/scooters.json';
import { getDirections } from '~/services/directions';

MapBox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY || '');

export default function Map() {
  const [direction, setDirection] = useState<any>(null);
  const points = scooters.map((s) => point([s.long, s.lat]));
  const directionCoordinates = direction?.routes?.[0]?.geometry.coordinates;

  const onPointPress = async (event: OnPressEvent) => {
    const newDirection = await getDirections(
      [2.1744, 41.4046],
      [event.coordinates.longitude, event.coordinates.latitude]
    );
    setDirection(newDirection);
  };

  // https://www.youtube.com/watch?v=uxj8jnlooP8
  // cluster means when we are zoomed out we just see 1 symbol
  // iconAnchor is what of the symbol we want to pin the lat lon to, eg bottom of the icon
  // here we have 2 layers, a circle and a symbol
  // show the circle if its a cluster
  // ShapeSource is a data source eg a feature collection
  // SymbolLayers are for text or images
  // CircleLayer is for circles

  return (
    <MapView style={{ flex: 1 }} styleURL="mapbox://styles/mapbox/streets-v12">
      <Camera followZoomLevel={15} followUserLocation />
      <LocationPuck puckBearingEnabled puckBearing="heading" />

      <ShapeSource id="scooters" cluster shape={featureCollection(points)} onPress={onPointPress}>
        <SymbolLayer
          id="clusters-count"
          style={{
            textField: ['get', 'point_count'],
            textColor: '#ffffff',
            textSize: 18,
            textPitchAlignment: 'map',
          }}
        />

        <CircleLayer
          id="clusters"
          belowLayerID="clusters-count" // show below cluster-count
          filter={['has', 'point_count']}
          style={{
            circlePitchAlignment: 'map',
            circleColor: '#42e100',
            circleRadius: 20,
            circleOpacity: 1,
            circleStrokeWidth: 2,
            circleStrokeColor: 'white',
          }}
        />
        <SymbolLayer
          id="scooter-icons"
          filter={['!', ['has', 'point_count']]}
          style={{
            iconImage: 'pin',
            iconSize: 0.5,
            iconAllowOverlap: true,
            iconAnchor: 'bottom',
          }}
        />

        <Images images={{ pin }} />
      </ShapeSource>

      {directionCoordinates && (
        <ShapeSource
          id="routeSource"
          lineMetrics
          shape={{
            properties: {},
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: directionCoordinates,
            },
          }}>
          <LineLayer
            id="exampleLineLayer"
            style={{
              lineColor: '#42A2D9',
              lineCap: 'round',
              lineJoin: 'round',
              lineWidth: 6,
              lineDasharray: [0, 4, 3],
            }}
          />
        </ShapeSource>
      )}
    </MapView>
  );
}
