import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';

const token = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim();
if (token?.startsWith('pk.')) Mapbox.setAccessToken(token);
export default function DriverMap() {
  const [point, setPoint] = useState<[number, number] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let stopped = false;
    let watcher: Location.LocationSubscription | undefined;
    Location.watchPositionAsync({accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10}, location => {
      if (stopped) return;
      if (Date.now() - location.timestamp > 30000 || (location.coords.accuracy ?? Infinity) > 50) {
        setError('قياس الموقع غير دقيق. انتظر إشارة GPS أفضل.'); return;
      }
      setPoint([location.coords.longitude, location.coords.latitude]); setError('');
    }).then(value => {if (stopped) value.remove(); else watcher = value;})
      .catch(() => {if (!stopped) setError('تعذّر قراءة الموقع. تحقق من إذن الهاتف.');});
    return () => {stopped = true; watcher?.remove();};
  }, [enabled]);
  async function locate() {
    setBusy(true); setError('');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {setError('اسمح بالموقع من إعدادات الهاتف لعرض موقعك.'); return;}
      setEnabled(true);
    } catch {setError('تعذّر طلب إذن الموقع.');} finally {setBusy(false);}
  }
  if (!token?.startsWith('pk.')) return <View style={styles.placeholder}><Text style={styles.text}>الخريطة غير متاحة في هذه النسخة.</Text></View>;
  return <View style={styles.wrapper}>
    <Mapbox.MapView style={styles.map} styleURL={Mapbox.StyleURL.Street} onMapLoadingError={() => setError('تعذّر تحميل الخريطة. تحقق من الاتصال.')}>
      <Mapbox.Camera centerCoordinate={point ?? [4.3517, 50.8503]} zoomLevel={point ? 15 : 11} animationDuration={600}/>
      {point && <Mapbox.PointAnnotation id="driver-location" coordinate={point}><View style={styles.point}/></Mapbox.PointAnnotation>}
    </Mapbox.MapView>
    <Pressable accessibilityRole="button" accessibilityLabel="عرض موقعي على الخريطة" disabled={busy} onPress={locate} style={styles.locate}>{busy ? <ActivityIndicator/> : <Text>موقعي</Text>}</Pressable>
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
  </View>;
}
const styles = StyleSheet.create({wrapper:{height:340,borderRadius:22,overflow:'hidden'},map:{flex:1},placeholder:{height:340,backgroundColor:'#18232d',justifyContent:'center',alignItems:'center',borderRadius:22},text:{color:'#d9e5ef'},locate:{position:'absolute',bottom:20,right:16,padding:14,backgroundColor:'#a8e86c',borderRadius:16},point:{width:18,height:18,borderRadius:9,backgroundColor:'#367cff',borderWidth:3,borderColor:'#fff'},error:{position:'absolute',top:12,left:12,right:12,backgroundColor:'#19222d',color:'#fff',padding:12,borderRadius:12,textAlign:'right'}});
