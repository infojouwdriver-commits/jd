import React,{useEffect,useRef,useState} from 'react';
import {ActivityIndicator,Linking,Pressable,StyleSheet,Text,View} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import Ionicons from '@expo/vector-icons/Ionicons';
import {usePreferences} from './experience/preferences';
import * as Location from 'expo-location';
import type {MeterPoint} from './trip-meter';
import {validPoint} from './trip-engine';
import {fetchNativeRoute,navigationUrl,routeBounds,trackRouteFix,type RouteTracking,type NativeRoute,type RouteCoordinate} from './native-route';
import type {RoadReport} from './road-alerts';
const token=process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim();
if(token?.startsWith('pk.'))Mapbox.setAccessToken(token);
interface DriverMapProps {reports?:RoadReport[]; onRoute?:(route:NativeRoute|null)=>void; onSelectReport?:(report:RoadReport)=>void; alternateRequested?:number;fullScreen?: {top:number;bottom:number}; navigationDestination?:RouteCoordinate|null; onRouteStatus?:(status:RouteStatus)=>void; compact?:boolean;autoPreview?:boolean; showLocate?:boolean; onPreview?:(value:{start:RouteCoordinate;end:RouteCoordinate;route:NativeRoute})=>void;position?:MeterPoint|null;previewStart?:RouteCoordinate|null;initialDestination?:RouteCoordinate|null;onDestinationChange?:(point:RouteCoordinate)=>void}
export type RouteStatus = 'idle'|'waitingGps'|'routing'|'ready'|'failed';
export default function DriverMap(props:DriverMapProps){return <DriverMapView key={`${props.previewStart?.lat}:${props.previewStart?.lon}:${props.initialDestination?.lat}:${props.initialDestination?.lon}:${props.navigationDestination?.lat}:${props.navigationDestination?.lon}`} {...props}/>;}
function DriverMapView({position,previewStart,initialDestination,onDestinationChange,autoPreview=false,showLocate=true,onPreview,compact=false,fullScreen,navigationDestination,onRouteStatus,onRoute,reports,onSelectReport,alternateRequested}:DriverMapProps){
 const {t,colors,isDark,rtl,animate,language}=usePreferences();
 const styles=StyleSheet.create({panel:{gap:12},heading:{color:colors.text,fontSize:22,fontWeight:'700',textAlign:rtl?'right':'left'},wrapper:{height:compact?215:340,borderRadius:22,overflow:'hidden'},map:{flex:1},placeholder:{height:compact?215:340,backgroundColor:colors.surface,justifyContent:'center',alignItems:'center',borderRadius:22},text:{color:colors.text,textAlign:rtl?'right':'left'},note:{color:colors.muted,textAlign:rtl?'right':'left',lineHeight:22},button:{backgroundColor:colors.accent,padding:14,borderRadius:14,alignItems:'center'},links:{flexDirection:'row',gap:12},link:{flex:1,padding:14,borderWidth:1,borderColor:colors.line,borderRadius:14},locate:{position:'absolute',bottom:20,right:16,padding:14,backgroundColor:colors.accent,borderRadius:16},point:{width:18,height:18,borderRadius:9,backgroundColor:'#367cff',borderWidth:3,borderColor:'#fff'},error:{backgroundColor:colors.dangerBg,color:colors.danger,padding:12,borderRadius:12,textAlign:rtl?'right':'left',lineHeight:22}});
 const validCoordinate=(p:RouteCoordinate|null|undefined)=>!!p&&Number.isFinite(p.lat)&&Number.isFinite(p.lon)&&Math.abs(p.lat)<=90&&Math.abs(p.lon)<=180;
 const [point,setPoint]=useState<MeterPoint|null>(null),[destination,setDestination]=useState<RouteCoordinate|null>(()=>validCoordinate(initialDestination)?{lat:initialDestination!.lat,lon:initialDestination!.lon}:null),[route,setRoute]=useState<NativeRoute|null>(null);
 const [gpsError,setGpsError]=useState('');
 const [error,setError]=useState(''),[busy,setBusy]=useState(false),[routing,setRouting]=useState(false),[enabled,setEnabled]=useState(false),[following,setFollowing]=useState(!!fullScreen||!initialDestination);
 const camera=useRef<React.ComponentRef<typeof Mapbox.Camera>|null>(null),request=useRef<AbortController|null>(null),generation=useRef(0);
 const guided=!!fullScreen;
 const [showTraffic,setShowTraffic]=useState(true);
 const trafficLabel={ar:'حركة المرور',fr:'Circulation',nl:'Verkeer',en:'Traffic'}[language];
 const handledAlternate=useRef(alternateRequested);
 useEffect(()=>{
  if(handledAlternate.current===alternateRequested) return;
  handledAlternate.current=alternateRequested;
  const current=displayedRoute.current;
  if(!current?.alternative) return;
  const {alternative,...original}=current;
  const next={...alternative,alternative:original};
  displayedRoute.current=next;
  setRoute(next);
  onRoute?.(next);
 },[alternateRequested,onRoute]);
 const departureChecks=useRef<RouteTracking>({timestamp:0,offRouteFixes:0,lastRequestedAt:0});
 const displayedRoute=useRef<NativeRoute|null>(null);
 const origin=validCoordinate(previewStart)?previewStart:null;
 const hasExternalPosition=position!=null&&validPoint(position),gps=(hasExternalPosition?position:point)??position;
 const displayPoint:[number,number]|undefined=gps?[gps.lon,gps.lat]:undefined;
 const target=guided?navigationDestination:destination;
 const freshGps=gps&&validPoint(gps)?gps:null;
 const navPosition=navigationDestination&&validCoordinate(navigationDestination)?navigationDestination:null;
 const padding=fullScreen?{paddingTop:fullScreen.top,paddingBottom:fullScreen.bottom,paddingLeft:30,paddingRight:30}:undefined;
 useEffect(()=>()=>{generation.current++;request.current?.abort();request.current=null;departureChecks.current={timestamp:0,offRouteFixes:0,lastRequestedAt:0};},[]);
 useEffect(()=>{
  if(!enabled||hasExternalPosition)return;let stopped=false;let watcher:Location.LocationSubscription|undefined;
  Location.watchPositionAsync({accuracy:Location.Accuracy.High,timeInterval:5000,distanceInterval:10},location=>{
   if(stopped)return;const next={lat:location.coords.latitude,lon:location.coords.longitude,timestamp:location.timestamp,accuracy:location.coords.accuracy??Infinity};
   if(location.mocked||!validPoint(next)){setGpsError('gpsError');return;}setPoint(next);setGpsError('');
  }).then(value=>{if(stopped)value.remove();else watcher=value;}).catch(()=>{if(!stopped)setGpsError('gpsError');});
  return()=>{stopped=true;watcher?.remove();};
 },[enabled,hasExternalPosition]);
 useEffect(()=>{
  if(!guided)return;
  if(!navPosition){onRouteStatus?.('idle');return;}
  if(!token?.startsWith('pk.')){onRouteStatus?.('failed');return;}
  if(!freshGps){if(!request.current)onRouteStatus?.('waitingGps');return;}
  if(request.current)return;
  const decision=trackRouteFix(departureChecks.current,freshGps,displayedRoute.current,Date.now());
  departureChecks.current=decision.tracking;
  const refreshTraffic=displayedRoute.current && Date.now()-departureChecks.current.lastRequestedAt>=90_000;
  if(!decision.refresh&&!refreshTraffic)return;
  if(refreshTraffic) departureChecks.current.lastRequestedAt=Date.now();
  const controller=new AbortController();
  const version=++generation.current;
  request.current=controller;
  setRouting(true);
  setError('');
  onRouteStatus?.('routing');
  void fetchNativeRoute(freshGps,navPosition,token,controller.signal,fetch,true).then(next=>{
   if(version!==generation.current||controller.signal.aborted)return;
   displayedRoute.current=next;
   setRoute(next);
   onRoute?.(next);
   onRouteStatus?.('ready');
  }).catch(()=>{
   if(version!==generation.current||controller.signal.aborted)return;
   setError('mapError');
   onRouteStatus?.('failed');
  }).finally(()=>{
   if(version===generation.current){request.current=null;setRouting(false);}
  });
 },[guided,freshGps,navPosition,onRouteStatus,onRoute]);
 useEffect(()=>{
  if(!autoPreview||!previewStart||!initialDestination||!token)return;
  const controller=new AbortController();
  request.current=controller;
  const version=++generation.current;
  void Promise.resolve().then(()=>{
   if(!controller.signal.aborted&&version===generation.current)setRouting(true);
   return fetchNativeRoute(previewStart,initialDestination,token,controller.signal);
  }).then(next=>{
   if(!controller.signal.aborted&&version===generation.current){setRoute(next);setFollowing(false);onPreview?.({start:previewStart,end:initialDestination,route:next});}
  }).catch(()=>{if(!controller.signal.aborted&&version===generation.current)setError('mapError');}).finally(()=>{
   if(!controller.signal.aborted&&version===generation.current){request.current=null;setRouting(false);}
  });
  return()=>{controller.abort();};
 },[autoPreview,previewStart,initialDestination,onPreview]);
 useEffect(()=>{if(guided||!route||following)return;const bounds=routeBounds(route);camera.current?.fitBounds(bounds.ne,bounds.sw,40,600);},[guided,route,following]);
 async function locate(){setBusy(true);setError('');setFollowing(true);try{const permission=await Location.requestForegroundPermissionsAsync();if(!permission.granted){setError('gpsPermission');return;}setEnabled(true);}catch{setError('gpsPermission');}finally{setBusy(false);}}
 function chooseDestination(coordinates:number[]){const [lon,lat]=coordinates;if(!Number.isFinite(lon)||!Number.isFinite(lat)||Math.abs(lon)>180||Math.abs(lat)>90)return;if(guided){onDestinationChange?.({lon,lat});return;}generation.current++;request.current?.abort();request.current=null;setRouting(false);setRoute(null);setError('');setDestination({lon,lat});onDestinationChange?.({lon,lat});setFollowing(false);}
 async function calculateRoute(){
  const start=origin??(gps&&validPoint(gps)?gps:null);if(!start){setError('gpsError');return;}if(!destination||!token||request.current)return;
  const controller=new AbortController();request.current=controller;const version=++generation.current;setRouting(true);setRoute(null);setError('');
  try{const next=await fetchNativeRoute(start,destination,token,controller.signal);if(version===generation.current){setRoute(next);setFollowing(false);if(origin)onPreview?.({start:origin,end:destination,route:next});}}
  catch{if(version===generation.current)setError('mapError');}
  finally{if(version===generation.current){request.current=null;setRouting(false);}}
 }
 async function navigate(provider:'google'|'waze'){if(!destination)return;try{await Linking.openURL(navigationUrl(provider,destination));}catch{setError('mapError');}}
 if(!token?.startsWith('pk.'))return <View style={[styles.placeholder,guided&&{height:'100%',borderRadius:0,padding:24}]}><Text style={styles.text}>{t('mapUnavailable')}</Text></View>;
 const animationDuration=animate?600:0;
 function showWholeRoute(){
  if(!route)return;
  setFollowing(false);
  const bounds=routeBounds(route);
  camera.current?.fitBounds(bounds.ne,bounds.sw,fullScreen?[fullScreen.top,30,fullScreen.bottom,30]:40,animationDuration);
 }
 return <View style={[styles.panel,guided&&{flex:1}]}>
  {!guided&&<><Text style={styles.heading}>{t('map')}</Text>{!compact&&<Text style={styles.note}>{t('mapHint')}</Text>}</>}
  <View style={[styles.wrapper,guided&&{flex:1,height:undefined,borderRadius:0}]}>
   <Mapbox.MapView style={styles.map} styleURL={isDark?Mapbox.StyleURL.Dark:Mapbox.StyleURL.Street}
    surfaceView={!guided}
    attributionPosition={fullScreen?{bottom:fullScreen.bottom,left:12}:undefined}
    logoPosition={fullScreen?{bottom:fullScreen.bottom,right:12}:undefined}
    compassPosition={fullScreen?{top:fullScreen.top,right:12}:undefined}
    scaleBarEnabled={!guided}
    onCameraChanged={guided?state=>{if(state.gestures.isGestureActive)setFollowing(false);}:undefined}
    onLongPress={compact?undefined:feature=>chooseDestination(feature.geometry.coordinates)}
    onMapLoadingError={()=>{setError('mapError');if(guided)onRouteStatus?.('failed');}}>
    <Mapbox.Camera ref={camera} defaultSettings={{centerCoordinate:displayPoint??(target?[target.lon,target.lat]:[4.3517,50.8503]),zoomLevel:guided&&displayPoint?15:11}}
     centerCoordinate={following?displayPoint:undefined} zoomLevel={following&&displayPoint?15:undefined} padding={padding} animationDuration={animationDuration}/>
    {guided&&showTraffic&&<Mapbox.VectorSource id="live-traffic" url="mapbox://mapbox.mapbox-traffic-v1">
     <Mapbox.LineLayer id="live-traffic-roads" sourceLayerID="traffic" minZoomLevel={10}
      style={{lineColor:['match',['get','congestion'],'low','#237e60','moderate','#edaa30','heavy','#f26636','severe','#cb2941','#8a909c'],lineWidth:['interpolate',['linear'],['zoom'],10,1,16,4],lineOpacity:0.9,lineCap:'round'}}/>
    </Mapbox.VectorSource>}
    {guided&&route?.alternative&&<Mapbox.ShapeSource id="alternate-trip-route" shape={{type:'Feature',properties:{},geometry:{type:'LineString',coordinates:route.alternative.coordinates}}}>
     <Mapbox.LineLayer id="alternate-trip-route-line" style={{lineColor:colors.icon,lineWidth:4,lineOpacity:0.7,lineDasharray:[2,2]}}/>
    </Mapbox.ShapeSource>}
    {route&&<Mapbox.ShapeSource id="trip-route" shape={{type:'Feature',properties:{},geometry:{type:'LineString',coordinates:route.coordinates}}}>
     {[
      ...(guided ? [<Mapbox.LineLayer key="edge" id="trip-route-edge" style={{lineColor:colors.hero,lineWidth:9,lineCap:'round',lineJoin:'round'}}/>] : []),
      <Mapbox.LineLayer key="line" id="trip-route-line" style={{lineColor:guided?colors.accent:'#367cff',lineWidth:guided?6:5,lineCap:'round',lineJoin:'round'}}/>,
     ]}
    </Mapbox.ShapeSource>}
    {origin&&<Mapbox.PointAnnotation id="preview-origin" coordinate={[origin.lon,origin.lat]}><View style={[styles.point,{backgroundColor:'#fff'}]}/></Mapbox.PointAnnotation>}
    {displayPoint&&<Mapbox.PointAnnotation id="driver-location" coordinate={displayPoint}>
     {guided?<View style={{width:42,height:42,borderRadius:21,borderWidth:3,borderColor:colors.hero,backgroundColor:colors.accent,alignItems:'center',justifyContent:'center'}}><Ionicons name="car-sport" size={26} color={colors.accentText}/></View>:<View style={styles.point}/>}
    </Mapbox.PointAnnotation>}
    {guided&&reports?.map(report=><Mapbox.PointAnnotation key={String(report.id)} id={`road-report-${report.id}`} coordinate={[report.lon,report.lat]} onSelected={()=>onSelectReport?.(report)}>
     <View style={{backgroundColor:'#a51e3c',width:34,height:34,borderRadius:17,alignItems:'center',justifyContent:'center',borderColor:'#fff',borderWidth:2}}>
      <Ionicons name={report.kind==='closure'?'ban-outline':report.kind==='collision'?'car-outline':'warning-outline'} size={18} color="#fff"/>
     </View>
    </Mapbox.PointAnnotation>)}
    {target&&<Mapbox.PointAnnotation id="route-destination" coordinate={[target.lon,target.lat]}><View style={[styles.point,{backgroundColor:'#a8e86c'}]}/></Mapbox.PointAnnotation>}
   </Mapbox.MapView>
   {showLocate&&<View style={guided?{position:'absolute',right:14,bottom:(fullScreen?.bottom??0)+31,gap:8}:undefined}>
    {guided&&<Pressable accessibilityRole="switch" accessibilityLabel={trafficLabel} accessibilityState={{checked:showTraffic}} onPress={()=>setShowTraffic(value=>!value)} style={[styles.button,{backgroundColor:showTraffic?colors.accent:colors.surface,minWidth:48,minHeight:48}]}><Ionicons name="layers-outline" size={20} color={showTraffic?colors.accentText:colors.text}/></Pressable>}
    {guided&&route&&<Pressable accessibilityRole="button" accessibilityLabel={t('wholeRoute')} onPress={showWholeRoute} style={[styles.button,{backgroundColor:colors.surface,minWidth:48,minHeight:48}]}><Ionicons name="map-outline" size={20} color={colors.text}/></Pressable>}
    <Pressable accessibilityRole="button" accessibilityLabel={t('locate')} disabled={busy} onPress={locate} style={guided?[styles.button,{backgroundColor:colors.surface,minWidth:48,minHeight:48}]:styles.locate}>
     {busy?<ActivityIndicator/>:guided?<Ionicons name="locate-outline" size={22} color={colors.text}/>:<Text>{t('locate')}</Text>}
    </Pressable>
   </View>}
  </View>
  {!guided&&destination&&<>
   <Text style={styles.note}>{t('destination')}: {destination.lat.toFixed(5)}, {destination.lon.toFixed(5)}</Text>
   <Pressable accessibilityRole="button" disabled={routing} onPress={calculateRoute} style={styles.button}>{routing?<ActivityIndicator/>:<Text>{t('route')}</Text>}</Pressable>
   {route&&<><Text style={styles.text}>{t('route')}: {(route.distanceMeters/1000).toFixed(1)} {t('km')} · {Math.ceil(route.durationSeconds/60)} {t('minute')}</Text><Text style={styles.note}>{t('routeEstimate')}</Text><Pressable accessibilityRole="button" onPress={showWholeRoute}><Text style={styles.text}>{t('wholeRoute')}</Text></Pressable></>}
   <View style={styles.links}>{(['google','waze']as const).map(provider=><Pressable key={provider} accessibilityRole="link" onPress={()=>navigate(provider)} style={styles.link}><Text style={styles.text}>{provider==='google'?'Google Maps':'Waze'} ↗</Text></Pressable>)}</View>
  </>}
  {!guided&&!!gpsError&&<Text accessibilityRole="alert" style={styles.error}>{t(gpsError==='gpsError'?'gpsError':'mapError')}</Text>}
  {!guided&&!!error&&<Text accessibilityRole="alert" style={styles.error}>{t(error==='gpsPermission'?'gpsPermission':error==='gpsError'?'gpsError':'mapError')}</Text>}
 </View>;
}
