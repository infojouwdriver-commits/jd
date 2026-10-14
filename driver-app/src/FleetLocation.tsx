import React, {useEffect, useState} from 'react';
import {Text} from 'react-native';
import * as Location from 'expo-location';
import {createDriverApi} from './api';
import {validPoint} from './trip-engine';
export default function FleetLocation({owner, registerStop}: {owner: number; registerStop: (stop: (() => Promise<void>) | null) => void}) {
  const [status, setStatus] = useState('مشاركة الموقع: بانتظار إذن الهاتف أو GPS');
  useEffect(() => {
    const api = createDriverApi();
    let stopped = false;
    let watcher: Location.LocationSubscription | undefined;
    let inFlight: Promise<unknown> | null = null;
    let lastAttempt = 0;
    const stop = async () => {
      stopped = true; watcher?.remove();
      try {await inFlight;} catch { /* Logout still clears server fleet state afterwards. */ }
    };
    registerStop(stop);
    Location.requestForegroundPermissionsAsync().then(async permission => {
      if (stopped) return;
      if (!permission.granted) {setStatus('مشاركة الموقع: لم يُمنح إذن الهاتف'); return;}
      watcher = await Location.watchPositionAsync({accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 5}, value => {
        if (stopped || inFlight || Date.now() - lastAttempt < 20000) return;
        const point = {lat: value.coords.latitude, lon: value.coords.longitude, timestamp: value.timestamp, accuracy: value.coords.accuracy ?? Infinity};
        if (value.mocked || !validPoint(point)) {setStatus('مشاركة الموقع: بانتظار GPS حديث ودقيق'); return;}
        lastAttempt = Date.now();
        inFlight = api.reportFleet(owner, point).then(() => {if (!stopped) setStatus('آخر موقع مشترك مع الشركة والإدارة');})
          .catch(() => {if (!stopped) setStatus('تعذّر تحديث الموقع على الخادم');})
          .finally(() => {inFlight = null;});
      });
      if (stopped) watcher.remove();
    }).catch(() => {if (!stopped) setStatus('تعذّر تشغيل مشاركة الموقع');});
    return () => {registerStop(null); void stop();};
  }, [owner, registerStop]);
  return <Text accessibilityRole="text" accessibilityLabel={`${status}. مشاركة أثناء الجلسة بإذن الهاتف. يُحفظ آخر موقع فقط؛ الشركة ترى سائقيها والإدارة ترى الجميع. القياس الخلفي لهذه الدفعة يخص العداد فقط.`} style={{color:'#a6b5c4',fontSize:12,textAlign:'right',lineHeight:20}}>{status} · أثناء فتح التطبيق · للشركة والإدارة · آخر موقع فقط</Text>;
}
