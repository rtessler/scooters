import { Stack } from 'expo-router';

import Map from '~/components/Map';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Scooters' }} />
      <Map />
    </>
  );
}
