import React,{useState} from 'react';
import {Linking,Modal,ScrollView,StyleSheet,Text,View,useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {router} from 'expo-router';
import DriverMap,{type RouteStatus} from '../DriverMap';
import {navigationUrl,type RouteCoordinate} from '../native-route';
import type {MeterPoint} from '../trip-meter';
import type {NativeTrip} from '../trip-engine';
import AddressField from './AddressField';
import {usePreferences} from './preferences';
import {design} from './tokens';
import {Button,Card,Field,Icon,IconButton,Label,Notice,Row,RouteStops,Screen} from './ui';

const guidance = {
 ar:{details:'تفاصيل الرحلة',close:'إغلاق',waitingGps:'بانتظار موقع GPS دقيق',routing:'جارٍ تحديث المسار',ready:'المسار متاح',failed:'المسار غير متاح. نحاول مجددًا عند تحديث الموقع.',idle:'حدّد الوجهة لتفعيل المسار'},
 fr:{details:'Détails de la course',close:'Fermer',waitingGps:'En attente d’une position GPS précise',routing:'Actualisation de l’itinéraire…',ready:'Itinéraire disponible',failed:'Itinéraire indisponible. Nouvel essai à la prochaine mise à jour de la position.',idle:'Choisissez une destination pour afficher l’itinéraire'},
 en:{details:'Ride details',close:'Close',waitingGps:'Waiting for an accurate GPS fix',routing:'Updating the route…',ready:'Route available',failed:'Route unavailable. Retrying when your location updates.',idle:'Choose a destination to show the route'},
 nl:{details:'Ritdetails',close:'Sluiten',waitingGps:'Wachten op een nauwkeurige gps-positie',routing:'Route wordt bijgewerkt…',ready:'Route beschikbaar',failed:'Route niet beschikbaar. Nieuwe poging zodra je positie wordt bijgewerkt.',idle:'Kies een bestemming voor de route'},
} as const;

interface Props {
 trip: NativeTrip;
 position: MeterPoint|null;
 clock: string;
 fare: number|undefined;
 fareInput: string;
 onFareInput: (value:string)=>void;
 onEnd: ()=>void;
 endDisabled: boolean;
 busy: boolean;
 background: boolean;
 departure: 'accepted'|'pending'|'review'|undefined;
 error: string;
}

export default function ActiveTripMap({trip,position,clock,fare,fareInput,onFareInput,onEnd,endDisabled,busy,background,departure,error}:Props) {
 const {t,colors,language,rtl}=usePreferences();
 const insets=useSafeAreaInsets();
 const {height}=useWindowDimensions();
 const words=guidance[language];
 const [routeState,setRouteState]=useState<RouteStatus>('idle');
 const [destination,setDestination]=useState<(RouteCoordinate & {label:string})|null>(()=>trip.navigationDestination?{...trip.navigationDestination,label:trip.endAddress}:null);
 const [destinationText,setDestinationText]=useState(trip.endAddress);
 const [details,setDetails]=useState(false);
 const [navigationError,setNavigationError]=useState(false);
 const [topHeight,setTopHeight]=useState(90);
 const [bottomHeight,setBottomHeight]=useState(174);
 const currency=new Intl.NumberFormat(`${language}-BE`,{style:'currency',currency:'EUR'});
 const distance=new Intl.NumberFormat(`${language}-BE`,{maximumFractionDigits:2}).format(trip.meter.distanceKm);
 const lastPosition=position??trip.meter.lastPoint??trip.start;
 const destinationLabel=destination?.label??trip.endAddress;
 function selectMapDestination(point:RouteCoordinate){
  const label=`${point.lat.toFixed(5)}, ${point.lon.toFixed(5)}`;
  setDestination({...point,label});
  setDestinationText(label);
 }
 const departureLabel=trip.realtimeChiron?t(departure==='accepted'?'chironStartAccepted':departure==='review'?'chironReview':'chironStartPending'):null;

 async function openNavigation(provider:'google'|'waze'){
  if(!destination)return;
  setNavigationError(false);
  try{await Linking.openURL(navigationUrl(provider,destination));}
  catch{setNavigationError(true);}
 }

 return <View testID="active-trip-full-map" style={{flex:1,backgroundColor:colors.bg}}>
  <View style={StyleSheet.absoluteFill}>
   <DriverMap fullScreen={{top:Math.min(insets.top+topHeight+16,height*.32),bottom:Math.min(insets.bottom+bottomHeight+12,height*.57)}}
    position={lastPosition} navigationDestination={destination}
    onDestinationChange={selectMapDestination} onRouteStatus={setRouteState}/>
  </View>
  <View pointerEvents="box-none" style={[styles.overlay,{top:insets.top+8,left:Math.max(12,insets.left),right:Math.max(12,insets.right)}]}
   onLayout={event=>setTopHeight(event.nativeEvent.layout.height)}>
   <Card style={{padding:11,gap:6}}>
    <Row style={{gap:9}}>
     <IconButton label={t('home')} icon={rtl?'arrow-forward':'arrow-back'} onPress={()=>router.replace('/')}/>
     <View style={{flex:1,gap:3,minWidth:0}}>
      <Label bold size={14}>{t('active')}</Label>
      <Text numberOfLines={1} accessibilityLabel={`${t('to')} ${destinationLabel}`}
       style={{color:colors.muted,fontFamily:design.font.body,fontSize:13,textAlign:rtl?'right':'left'}}>{destinationLabel}</Text>
     </View>
     <IconButton label={words.details} icon="ellipsis-horizontal" onPress={()=>setDetails(true)}/>
    </Row>
    {routeState!=='ready'&&<Text accessibilityLiveRegion="polite" style={{color:colors.muted,fontFamily:design.font.body,fontSize:12,textAlign:rtl?'right':'left'}}>{words[routeState]}</Text>}
   </Card>
  </View>
  <View pointerEvents="box-none" style={[styles.overlay,{bottom:insets.bottom+8,left:Math.max(12,insets.left),right:Math.max(12,insets.right)}]}
   onLayout={event=>setBottomHeight(event.nativeEvent.layout.height)}>
   <Card style={{padding:12,gap:9}}>
    <ScrollView bounces={false} style={{maxHeight:Math.max(70,height*.25)}} contentContainerStyle={{gap:8}}>
     <Row style={{justifyContent:'space-between',gap:8}}>
      <View style={{flex:1,gap:2}}>
       <Label muted size={12}>{t('price')}</Label>
       <Label bold numeric size={27}>{Number.isFinite(fare)?currency.format(fare!):'—'}</Label>
      </View>
      {trip.tariffQuote?.code&&<Label size={13} bold color={colors.icon}>{trip.tariffQuote.code}</Label>}
     </Row>
     <Row style={{borderTopWidth:1,borderTopColor:colors.line,paddingTop:8,gap:10}}>
      <View style={{flex:1,gap:2}}>
       <Label muted size={12}>{t('duration')}</Label>
       <Label bold numeric size={18}>{clock}</Label>
      </View>
      <View style={{flex:1,gap:2}}>
       <Label muted size={12}>{t('distance')}</Label>
       <Label bold numeric size={18}>{distance} {t('km')}</Label>
      </View>
     </Row>
     {!!error&&<Notice error>{error}</Notice>}
     {departure==='review'&&departureLabel&&<Notice>{departureLabel}</Notice>}
    </ScrollView>
    <Button danger label={t(busy?'endBusy':'end')} icon="stop-circle-outline" busy={busy} disabled={endDisabled} onPress={onEnd}/>
   </Card>
  </View>
  <Modal visible={details} onRequestClose={()=>setDetails(false)} animationType="none">
   <Screen title={words.details} action={<IconButton label={words.close} icon="close" onPress={()=>setDetails(false)}/>}>
    <Card>
     {(!trip.platform||trip.platform==='INTERNAL')&&<Field label={t('price')} placeholder={trip.proposedPrice.toFixed(2)}
      value={fareInput} keyboardType="decimal-pad" editable={!busy} onChangeText={onFareInput}/>}
     <Row><Icon name={trip.paymentMethod==='card'?'card-outline':'cash-outline'}/><Label>{t(trip.paymentMethod==='card'?'card':'cash')} · {trip.platform&&trip.platform!=='INTERNAL'?trip.platform:t('meter')}</Label></Row>
     <Label muted size={12}>{t(background?'background':'foreground')}</Label>
     {departureLabel&&<Notice>{departureLabel}</Notice>}
    </Card>
    <Card><RouteStops from={trip.startAddress} to={trip.endAddress}/>
     <AddressField label={t('destination')} value={destinationText} position={lastPosition} disabled={busy}
      onChange={setDestinationText} onSelect={point=>{setDestinationText(point.label);setDestination({lat:point.lat,lon:point.lon,label:point.label});setDetails(false);}}/>
     {destination&&<Row style={{flexWrap:'wrap'}}>
      <Button secondary label="Waze" icon="navigate-outline" onPress={()=>void openNavigation('waze')}/>
      <Button secondary label="Google Maps" icon="map-outline" onPress={()=>void openNavigation('google')}/>
     </Row>}
     {navigationError&&<Notice error>{t('mapError')}</Notice>}
     <Label muted size={12}>{t('routeEstimate')}</Label>
    </Card>
    <Label muted size={11}>{t('locationNote')}</Label>
   </Screen>
  </Modal>
 </View>;
}

const styles=StyleSheet.create({overlay:{position:'absolute'}});
