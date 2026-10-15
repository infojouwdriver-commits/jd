import React,{useEffect,useRef,useState} from 'react';
import {ActivityIndicator,Linking,Pressable,StyleSheet,Text,View} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import {usePreferences} from './experience/preferences';
import * as Location from 'expo-location';
import type {MeterPoint} from './trip-meter';
import {validPoint} from './trip-engine';
import {fetchNativeRoute,navigationUrl,routeBounds,type NativeRoute,type RouteCoordinate} from './native-route';
const token=process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim();
if(token?.startsWith('pk.'))Mapbox.setAccessToken(token);
interface DriverMapProps {position?:MeterPoint|null;previewStart?:RouteCoordinate|null;initialDestination?:RouteCoordinate|null;onDestinationChange?:(point:RouteCoordinate)=>void}
export default function DriverMap(props:DriverMapProps){return <DriverMapView key={`${props.previewStart?.lat}:${props.previewStart?.lon}:${props.initialDestination?.lat}:${props.initialDestination?.lon}`} {...props}/>;}
function DriverMapView({position,previewStart,initialDestination,onDestinationChange}:DriverMapProps){
 const {t,colors,isDark,rtl}=usePreferences();
 const styles=StyleSheet.create({panel:{gap:12},heading:{color:colors.text,fontSize:22,fontWeight:'700',textAlign:rtl?'right':'left'},wrapper:{height:340,borderRadius:22,overflow:'hidden'},map:{flex:1},placeholder:{height:340,backgroundColor:colors.surface,justifyContent:'center',alignItems:'center',borderRadius:22},text:{color:colors.text,textAlign:rtl?'right':'left'},note:{color:colors.muted,textAlign:rtl?'right':'left',lineHeight:22},button:{backgroundColor:colors.accent,padding:14,borderRadius:14,alignItems:'center'},links:{flexDirection:'row',gap:12},link:{flex:1,padding:14,borderWidth:1,borderColor:colors.line,borderRadius:14},locate:{position:'absolute',bottom:20,right:16,padding:14,backgroundColor:colors.accent,borderRadius:16},point:{width:18,height:18,borderRadius:9,backgroundColor:'#367cff',borderWidth:3,borderColor:'#fff'},error:{backgroundColor:colors.dangerBg,color:colors.danger,padding:12,borderRadius:12,textAlign:rtl?'right':'left',lineHeight:22}});
 const validCoordinate=(p:RouteCoordinate|null|undefined)=>!!p&&Number.isFinite(p.lat)&&Number.isFinite(p.lon)&&Math.abs(p.lat)<=90&&Math.abs(p.lon)<=180;
 const [point,setPoint]=useState<MeterPoint|null>(null),[destination,setDestination]=useState<RouteCoordinate|null>(()=>validCoordinate(initialDestination)?{lat:initialDestination!.lat,lon:initialDestination!.lon}:null),[route,setRoute]=useState<NativeRoute|null>(null);
 const [gpsError,setGpsError]=useState('');
 const [error,setError]=useState(''),[busy,setBusy]=useState(false),[routing,setRouting]=useState(false),[enabled,setEnabled]=useState(false),[following,setFollowing]=useState(!initialDestination);
 const camera=useRef<React.ComponentRef<typeof Mapbox.Camera>|null>(null),request=useRef<AbortController|null>(null),generation=useRef(0);
 const origin=validCoordinate(previewStart)?previewStart:null;
 const hasExternalPosition=position!=null&&validPoint(position),gps=(hasExternalPosition?position:point)??position;
 const displayPoint:[number,number]|undefined=gps?[gps.lon,gps.lat]:undefined;
 useEffect(()=>()=>{generation.current++;request.current?.abort();},[]);
 useEffect(()=>{
  if(!enabled||hasExternalPosition)return;let stopped=false;let watcher:Location.LocationSubscription|undefined;
  Location.watchPositionAsync({accuracy:Location.Accuracy.High,timeInterval:5000,distanceInterval:10},location=>{
   if(stopped)return;const next={lat:location.coords.latitude,lon:location.coords.longitude,timestamp:location.timestamp,accuracy:location.coords.accuracy??Infinity};
   if(location.mocked||!validPoint(next)){setGpsError('gpsError');return;}setPoint(next);setGpsError('');
  }).then(value=>{if(stopped)value.remove();else watcher=value;}).catch(()=>{if(!stopped)setGpsError('gpsError');});
  return()=>{stopped=true;watcher?.remove();};
 },[enabled,hasExternalPosition]);
 useEffect(()=>{if(!route||following)return;const bounds=routeBounds(route);camera.current?.fitBounds(bounds.ne,bounds.sw,40,600);},[route,following]);
 async function locate(){setBusy(true);setError('');setFollowing(true);try{const permission=await Location.requestForegroundPermissionsAsync();if(!permission.granted){setError('gpsPermission');return;}setEnabled(true);}catch{setError('gpsPermission');}finally{setBusy(false);}}
 function chooseDestination(coordinates:number[]){const [lon,lat]=coordinates;if(!Number.isFinite(lon)||!Number.isFinite(lat)||Math.abs(lon)>180||Math.abs(lat)>90)return;generation.current++;request.current?.abort();request.current=null;setRouting(false);setRoute(null);setError('');setDestination({lon,lat});onDestinationChange?.({lon,lat});setFollowing(false);}
 async function calculateRoute(){
  const start=origin??(gps&&validPoint(gps)?gps:null);if(!start){setError('gpsError');return;}if(!destination||!token||request.current)return;
  const controller=new AbortController();request.current=controller;const version=++generation.current;setRouting(true);setRoute(null);setError('');
  try{const next=await fetchNativeRoute(start,destination,token,controller.signal);if(version===generation.current){setRoute(next);setFollowing(false);}}
  catch{if(version===generation.current)setError('mapError');}
  finally{if(version===generation.current){request.current=null;setRouting(false);}}
 }
 async function navigate(provider:'google'|'waze'){if(!destination)return;try{await Linking.openURL(navigationUrl(provider,destination));}catch{setError('mapError');}}
 if(!token?.startsWith('pk.'))return <View style={styles.placeholder}><Text style={styles.text}>{t('mapUnavailable')}</Text></View>;
 return <View style={styles.panel}>
  <Text style={styles.heading}>{t('map')}</Text><Text style={styles.note}>{t('mapHint')}</Text>
  <View style={styles.wrapper}>
   <Mapbox.MapView style={styles.map} styleURL={isDark?Mapbox.StyleURL.Dark:Mapbox.StyleURL.Street} onLongPress={feature=>chooseDestination(feature.geometry.coordinates)} onMapLoadingError={()=>setError('mapError')}>
    <Mapbox.Camera ref={camera} defaultSettings={{centerCoordinate:destination?[destination.lon,destination.lat]:[4.3517,50.8503],zoomLevel:11}} centerCoordinate={following?displayPoint:undefined} zoomLevel={following&&displayPoint?15:undefined} animationDuration={600}/>
    {route&&<Mapbox.ShapeSource id="trip-route" shape={{type:'Feature',properties:{},geometry:{type:'LineString',coordinates:route.coordinates}}}><Mapbox.LineLayer id="trip-route-line" style={{lineColor:'#367cff',lineWidth:5,lineCap:'round',lineJoin:'round'}}/></Mapbox.ShapeSource>}
    {origin&&<Mapbox.PointAnnotation id="preview-origin" coordinate={[origin.lon,origin.lat]}><View style={[styles.point,{backgroundColor:'#fff'}]}/></Mapbox.PointAnnotation>}
    {displayPoint&&<Mapbox.PointAnnotation id="driver-location" coordinate={displayPoint}><View style={styles.point}/></Mapbox.PointAnnotation>}
    {destination&&<Mapbox.PointAnnotation id="route-destination" coordinate={[destination.lon,destination.lat]}><View style={[styles.point,{backgroundColor:'#a8e86c'}]}/></Mapbox.PointAnnotation>}
   </Mapbox.MapView>
   <Pressable accessibilityRole="button" accessibilityLabel={t('locate')} disabled={busy} onPress={locate} style={styles.locate}>{busy?<ActivityIndicator/>:<Text>{t('locate')}</Text>}</Pressable>
  </View>
  {destination&&<>
   <Text style={styles.note}>{t('destination')}: {destination.lat.toFixed(5)}, {destination.lon.toFixed(5)}</Text>
   <Pressable accessibilityRole="button" disabled={routing} onPress={calculateRoute} style={styles.button}>{routing?<ActivityIndicator/>:<Text>{t('route')}</Text>}</Pressable>
   {route&&<><Text style={styles.text}>{t('route')}: {(route.distanceMeters/1000).toFixed(1)} {t('km')} · {Math.ceil(route.durationSeconds/60)} {t('minute')}</Text><Text style={styles.note}>{t('routeEstimate')}</Text><Pressable accessibilityRole="button" onPress={()=>{setFollowing(false);const bounds=routeBounds(route);camera.current?.fitBounds(bounds.ne,bounds.sw,40,600);}}><Text style={styles.text}>{t('wholeRoute')}</Text></Pressable></>}
   <View style={styles.links}>{(['google','waze']as const).map(provider=><Pressable key={provider} accessibilityRole="link" onPress={()=>navigate(provider)} style={styles.link}><Text style={styles.text}>{provider==='google'?'Google Maps':'Waze'} ↗</Text></Pressable>)}</View>
  </>}
  {!!gpsError&&<Text accessibilityRole="alert" style={styles.error}>{t(gpsError==='gpsError'?'gpsError':'mapError')}</Text>}
  {!!error&&<Text accessibilityRole="alert" style={styles.error}>{t(error==='gpsPermission'?'gpsPermission':error==='gpsError'?'gpsError':'mapError')}</Text>}
 </View>;
}
