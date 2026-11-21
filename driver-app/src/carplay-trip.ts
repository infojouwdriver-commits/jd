import {requireOptionalNativeModule} from 'expo';
import {Platform} from 'react-native';

type TripTarget = {key: string; title: string; latitude: number; longitude: number};
type CarPlayModule = {setTrip: (target: TripTarget | null) => void};

const carPlay = Platform.OS === 'ios'
  ? requireOptionalNativeModule<CarPlayModule>('JdCarPlay')
  : null;

export function syncCarPlayTrip(trip: TripTarget | null) {
  carPlay?.setTrip(trip);
}
