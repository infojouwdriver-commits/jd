import React,{useEffect,useRef,useState} from 'react';
import {ActivityIndicator,Linking,Pressable,StyleSheet,Text,View} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import type {MeterPoint} from './trip-meter';
import {validPoint} from './trip-engine';
import {fetchNativeRoute,navigationUrl,routeBounds,type NativeRoute,type RouteCoordinate} from './native-route';
const token=process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim();
if(token?.startsWith('pk.'))Mapbox.setAccessToken(token);
export default function DriverMap({position}:{position?:MeterPoint|null}){
 const [point,setPoint]=useState<MeterPoint|null>(null),[destination,setDestination]=useState<RouteCoordinate|null>(null),[route,setRoute]=useState<NativeRoute|null>(null);
 const [gpsError,setGpsError]=useState('');
 const [error,setError]=useState(''),[busy,setBusy]=useState(false),[routing,setRouting]=useState(false),[enabled,setEnabled]=useState(false),[following,setFollowing]=useState(true);
 const camera=useRef<React.ComponentRef<typeof Mapbox.Camera>|null>(null),request=useRef<AbortController|null>(null),generation=useRef(0);
 const hasExternalPosition=position!=null&&validPoint(position),gps=(hasExternalPosition?position:point)??position;
 const displayPoint:[number,number]|undefined=gps?[gps.lon,gps.lat]:undefined;
 useEffect(()=>()=>{generation.current++;request.current?.abort();},[]);
 useEffect(()=>{
  if(!enabled||hasExternalPosition)return;let stopped=false;let watcher:Location.LocationSubscription|undefined;
  Location.watchPositionAsync({accuracy:Location.Accuracy.High,timeInterval:5000,distanceInterval:10},location=>{
   if(stopped)return;const next={lat:location.coords.latitude,lon:location.coords.longitude,timestamp:location.timestamp,accuracy:location.coords.accuracy??Infinity};
   if(location.mocked||!validPoint(next)){setGpsError('قياس الموقع غير دقيق. انتظر إشارة GPS أفضل.');return;}setPoint(next);setGpsError('');
  }).then(value=>{if(stopped)value.remove();else watcher=value;}).catch(()=>{if(!stopped)setGpsError('تعذّر قراءة الموقع. تحقق من إذن الهاتف.');});
  return()=>{stopped=true;watcher?.remove();};
 },[enabled,hasExternalPosition]);
 useEffect(()=>{if(!route||following)return;const bounds=routeBounds(route);camera.current?.fitBounds(bounds.ne,bounds.sw,40,600);},[route,following]);
 async function locate(){setBusy(true);setError('');setFollowing(true);try{const permission=await Location.requestForegroundPermissionsAsync();if(!permission.granted){setError('اسمح بالموقع من إعدادات الهاتف لعرض موقعك.');return;}setEnabled(true);}catch{setError('تعذّر طلب إذن الموقع.');}finally{setBusy(false);}}
 function chooseDestination(coordinates:number[]){const [lon,lat]=coordinates;if(!Number.isFinite(lon)||!Number.isFinite(lat)||Math.abs(lon)>180||Math.abs(lat)>90)return;generation.current++;request.current?.abort();request.current=null;setRouting(false);setRoute(null);setError('');setDestination({lon,lat});setFollowing(false);}
 async function calculateRoute(){
  if(!gps||!validPoint(gps)){setError('حدّث موقعك قبل حساب المسار.');return;}if(!destination||!token||request.current)return;
  const controller=new AbortController();request.current=controller;const version=++generation.current;setRouting(true);setRoute(null);setError('');
  try{const next=await fetchNativeRoute(gps,destination,token,controller.signal);if(version===generation.current){setRoute(next);setFollowing(false);}}
  catch(error){if(version===generation.current)setError(error instanceof Error?error.message:'تعذّر حساب المسار.');}
  finally{if(version===generation.current){request.current=null;setRouting(false);}}
 }
 async function navigate(provider:'google'|'waze'){if(!destination)return;try{await Linking.openURL(navigationUrl(provider,destination));}catch{setError('تعذّر فتح تطبيق الخرائط الخارجي.');}}
 if(!token?.startsWith('pk.'))return <View style={styles.placeholder}><Text style={styles.text}>الخريطة غير متاحة في هذه النسخة.</Text></View>;
 return <View style={styles.panel}>
  <Text style={styles.heading}>الخريطة والمسار</Text><Text style={styles.note}>اضغط مطولاً على الخريطة لتحديد وجهة المسار.</Text>
  <View style={styles.wrapper}>
   <Mapbox.MapView style={styles.map} styleURL={Mapbox.StyleURL.Street} onLongPress={feature=>chooseDestination(feature.geometry.coordinates)} onMapLoadingError={()=>setError('تعذّر تحميل الخريطة. تحقق من الاتصال.')}>
    <Mapbox.Camera ref={camera} defaultSettings={{centerCoordinate:[4.3517,50.8503],zoomLevel:11}} centerCoordinate={following?displayPoint:undefined} zoomLevel={following&&displayPoint?15:undefined} animationDuration={600}/>
    {route&&<Mapbox.ShapeSource id="trip-route" shape={{type:'Feature',properties:{},geometry:{type:'LineString',coordinates:route.coordinates}}}><Mapbox.LineLayer id="trip-route-line" style={{lineColor:'#367cff',lineWidth:5,lineCap:'round',lineJoin:'round'}}/></Mapbox.ShapeSource>}
    {displayPoint&&<Mapbox.PointAnnotation id="driver-location" coordinate={displayPoint}><View style={styles.point}/></Mapbox.PointAnnotation>}
    {destination&&<Mapbox.PointAnnotation id="route-destination" coordinate={[destination.lon,destination.lat]}><View style={[styles.point,{backgroundColor:'#a8e86c'}]}/></Mapbox.PointAnnotation>}
   </Mapbox.MapView>
   <Pressable accessibilityRole="button" accessibilityLabel="عرض موقعي على الخريطة" disabled={busy} onPress={locate} style={styles.locate}>{busy?<ActivityIndicator/>:<Text>موقعي</Text>}</Pressable>
  </View>
  {destination&&<>
   <Text style={styles.note}>وجهة المسار: {destination.lat.toFixed(5)}, {destination.lon.toFixed(5)}</Text>
   <Pressable accessibilityRole="button" disabled={routing} onPress={calculateRoute} style={styles.button}>{routing?<ActivityIndicator/>:<Text>حساب المسار من موقعي الحالي</Text>}</Pressable>
   {route&&<><Text style={styles.text}>المسار المتوقع: {(route.distanceMeters/1000).toFixed(1)} كم · {Math.ceil(route.durationSeconds/60)} دقيقة</Text><Text style={styles.note}>تقدير من الموقع وقت الحساب؛ المسافة الفعلية والسعر المتفق عليه يظهران في العداد.</Text><Pressable accessibilityRole="button" onPress={()=>{setFollowing(false);const bounds=routeBounds(route);camera.current?.fitBounds(bounds.ne,bounds.sw,40,600);}}><Text style={styles.text}>عرض المسار كاملاً</Text></Pressable></>}
   <View style={styles.links}>{(['google','waze']as const).map(provider=><Pressable key={provider} accessibilityRole="link" onPress={()=>navigate(provider)} style={styles.link}><Text style={styles.text}>{provider==='google'?'Google Maps':'Waze'} ↗</Text></Pressable>)}</View>
  </>}
  {!!gpsError&&<Text accessibilityRole="alert" style={styles.error}>{gpsError}</Text>}
  {!!error&&<Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
 </View>;
}
const styles=StyleSheet.create({panel:{gap:12},heading:{color:'#fff',fontSize:22,fontWeight:'700',textAlign:'right'},wrapper:{height:340,borderRadius:22,overflow:'hidden'},map:{flex:1},placeholder:{height:340,backgroundColor:'#18232d',justifyContent:'center',alignItems:'center',borderRadius:22},text:{color:'#d9e5ef',textAlign:'right'},note:{color:'#a6b5c4',textAlign:'right',lineHeight:22},button:{backgroundColor:'#a8e86c',padding:14,borderRadius:14,alignItems:'center'},links:{flexDirection:'row',gap:12},link:{flex:1,padding:14,borderWidth:1,borderColor:'#334655',borderRadius:14},locate:{position:'absolute',bottom:20,right:16,padding:14,backgroundColor:'#a8e86c',borderRadius:16},point:{width:18,height:18,borderRadius:9,backgroundColor:'#367cff',borderWidth:3,borderColor:'#fff'},error:{backgroundColor:'#442525',color:'#ffc9c9',padding:12,borderRadius:12,textAlign:'right',lineHeight:22}});
