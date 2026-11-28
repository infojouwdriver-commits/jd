import React,{useMemo,useState} from 'react';
import {Linking,Modal,ScrollView,StyleSheet,Text,View,useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {router} from 'expo-router';
import DriverMap,{type RouteStatus} from '../DriverMap';
import {navigationUrl,type RouteCoordinate,type NativeRoute} from '../native-route';
import type {MeterPoint} from '../trip-meter';
import type {NativeTrip} from '../trip-engine';
import AddressField from './AddressField';
import {usePreferences} from './preferences';
import {nextRouteAlert,type RoadReport} from '../road-alerts';
import {useRoadReports} from './useRoadReports';
import {design} from './tokens';
import {Button,Card,Field,Icon,IconButton,Label,Notice,Row,RouteStops,Screen} from './ui';

const guidance = {
 ar:{details:'تفاصيل الرحلة',close:'إغلاق',waitingGps:'بانتظار موقع GPS دقيق',routing:'جارٍ تحديث المسار',ready:'المسار متاح',failed:'المسار غير متاح. نحاول مجددًا عند تحديث الموقع.',idle:'حدّد الوجهة لتفعيل المسار'},
 fr:{details:'Détails de la course',close:'Fermer',waitingGps:'En attente d’une position GPS précise',routing:'Actualisation de l’itinéraire…',ready:'Itinéraire disponible',failed:'Itinéraire indisponible. Nouvel essai à la prochaine mise à jour de la position.',idle:'Choisissez une destination pour afficher l’itinéraire'},
 en:{details:'Ride details',close:'Close',waitingGps:'Waiting for an accurate GPS fix',routing:'Updating the route…',ready:'Route available',failed:'Route unavailable. Retrying when your location updates.',idle:'Choose a destination to show the route'},
 nl:{details:'Ritdetails',close:'Sluiten',waitingGps:'Wachten op een nauwkeurige gps-positie',routing:'Route wordt bijgewerkt…',ready:'Route beschikbaar',failed:'Route niet beschikbaar. Nieuwe poging zodra je positie wordt bijgewerkt.',idle:'Kies een bestemming voor de route'},
} as const;

const roadCopy = {
 ar:{report:'إبلاغ عن الطريق',congestion:'ازدحام',collision:'حادث',hazard:'خطر على الطريق',closure:'طريق مغلق',ahead:'أمامك',stopped:'استخدم الإبلاغ بعد التوقف، مع إشارة GPS حديثة.',failed:'تعذّر إرسال البلاغ. تحقّق من الموقع والاتصال وحاول مجددًا.',present:'ما زال موجودًا',gone:'انتهى',eta:'وقت الوصول',alternate:'اختر الطريق البديل',faster:'أسرع بـ',slower:'أبطأ بـ',same:'وقت مماثل',sent:'تم تسجيل البلاغ'},
 fr:{report:'Signaler sur la route',congestion:'Embouteillage',collision:'Accident',hazard:'Danger sur la route',closure:'Route fermée',ahead:'devant vous',stopped:'Signalez à l’arrêt, avec une position GPS récente.',failed:'Signalement impossible. Vérifiez votre position et votre connexion, puis réessayez.',present:'Toujours présent',gone:'Terminé',eta:'Arrivée estimée',alternate:'Choisir l’itinéraire alternatif',faster:'plus rapide de',slower:'plus lent de',same:'durée similaire',sent:'Signalement enregistré'},
 nl:{report:'Melden op de weg',congestion:'File',collision:'Ongeval',hazard:'Gevaar op de weg',closure:'Weg afgesloten',ahead:'voor u',stopped:'Meld terwijl u stilstaat en met een recente gps-positie.',failed:'Melding mislukt. Controleer uw locatie en verbinding en probeer opnieuw.',present:'Nog aanwezig',gone:'Voorbij',eta:'Verwachte aankomst',alternate:'Kies de alternatieve route',faster:'sneller met',slower:'trager met',same:'vergelijkbare reistijd',sent:'Melding opgeslagen'},
 en:{report:'Report a road issue',congestion:'Congestion',collision:'Collision',hazard:'Road hazard',closure:'Road closed',ahead:'ahead',stopped:'Report while stopped, with a recent GPS fix.',failed:'Could not send your report. Check GPS and your connection and try again.',present:'Still there',gone:'Cleared',eta:'Estimated arrival',alternate:'Choose alternate route',faster:'faster by',slower:'slower by',same:'similar time',sent:'Report saved'},
} as const;
const airportCopy = {
 ar:{meeting_changed:'تغيير نقطة الالتقاء',taxi_entrance_closed:'مدخل موقف التاكسي مغلق'},
 fr:{meeting_changed:'Point de rencontre modifié',taxi_entrance_closed:'Accès taxi fermé'},
 nl:{meeting_changed:'Ontmoetingspunt gewijzigd',taxi_entrance_closed:'Taxitoegang afgesloten'},
 en:{meeting_changed:'Meeting point changed',taxi_entrance_closed:'Taxi entrance closed'},
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
 const roadWords=roadCopy[language];
 const [route,setRoute]=useState<NativeRoute|null>(null);
 const [alternateRequested,setAlternateRequested]=useState(0);
 const [reportPicker,setReportPicker]=useState(false);
 const [selectedReport,setSelectedReport]=useState<RoadReport|null>(null);
 const [reportSent,setReportSent]=useState(false);
 const [routeState,setRouteState]=useState<RouteStatus>('idle');
 const [destination,setDestination]=useState<(RouteCoordinate & {label:string})|null>(()=>trip.navigationDestination?{...trip.navigationDestination,label:trip.endAddress}:null);
 const [destinationText,setDestinationText]=useState(trip.endAddress);
 const [details,setDetails]=useState(false);
 const [navigationError,setNavigationError]=useState(false);
 const [topHeight,setTopHeight]=useState(90);
 const [bottomHeight,setBottomHeight]=useState(130);
 const currency=new Intl.NumberFormat(`${language}-BE`,{style:'currency',currency:'EUR'});
 const distance=new Intl.NumberFormat(`${language}-BE`,{maximumFractionDigits:2}).format(trip.meter.distanceKm);
 const lastPosition=position??trip.meter.lastPoint??trip.start;
 const roads=useRoadReports(lastPosition);
 const alert=useMemo(()=>lastPosition&&route ? nextRouteAlert(lastPosition,route,[...(route.alerts??[]),...roads.reports]) : null,[lastPosition,route,roads.reports]);
 const alternateDifference=route?.alternative?Math.round((route.alternative.durationSeconds-route.durationSeconds)/60):null;
 const alternateNote=alternateDifference===null?null:alternateDifference===0?roadWords.same:`${alternateDifference<0?roadWords.faster:roadWords.slower} ${Math.abs(alternateDifference)} ${t('minute')}`;
 const chooseAlternative=()=>{setAlternateRequested(value=>value+1);setDetails(false);};
 const destinationLabel=destination?.label??trip.endAddress;
 function selectMapDestination(point:RouteCoordinate){
  const label=`${point.lat.toFixed(5)}, ${point.lon.toFixed(5)}`;
  setRoute(null);
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
    onDestinationChange={selectMapDestination} onRouteStatus={setRouteState} onRoute={setRoute}
    alternateRequested={alternateRequested} reports={roads.reports}
    onSelectReport={report=>{roads.clearError();setSelectedReport(report);setReportPicker(true);}}/>
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
    {route&&<Label muted size={13}>{roadWords.eta} · {Math.ceil(route.durationSeconds/60)} {t('minute')}</Label>}
    {alert&&<Notice error>{roadWords[alert.kind]} · {alert.distance} m {roadWords.ahead}</Notice>}
    {roads.airport[0]&&<Notice>Brussels Airport · {airportCopy[language][roads.airport[0].kind]} · {roads.airport[0].detail}</Notice>}
    {alternateDifference!==null&&alternateDifference<0&&<Button secondary label={`${roadWords.alternate} · ${alternateNote}`} icon="git-compare-outline" onPress={chooseAlternative}/>}
    {reportSent&&<Notice>{roadWords.sent}</Notice>}
    {routeState!=='ready'&&<Text accessibilityLiveRegion="polite" style={{color:colors.muted,fontFamily:design.font.body,fontSize:12,textAlign:rtl?'right':'left'}}>{words[routeState]}</Text>}
   </Card>
  </View>
  <View pointerEvents="box-none" style={[styles.overlay,{bottom:insets.bottom+8,left:Math.max(12,insets.left),right:Math.max(12,insets.right)}]}
   onLayout={event=>setBottomHeight(event.nativeEvent.layout.height)}>
   <Card style={{padding:10,gap:8}}>
    <ScrollView bounces={false} style={{maxHeight:Math.max(70,height*.25)}} contentContainerStyle={{gap:8}}>
     <Row style={{alignItems:'stretch',flexWrap:'wrap',gap:8}}>
      <View style={styles.metric}>
       <Label muted size={12}>{t('price')}</Label>
       <Label bold numeric size={18}>{Number.isFinite(fare)?currency.format(fare!):'—'}</Label>
      </View>
      <View style={styles.metric}>
       <Label muted size={12}>{t('duration')}</Label>
       <Label bold numeric size={16}>{clock}</Label>
      </View>
      <View style={styles.metric}>
       <Label muted size={12}>{t('distance')}</Label>
       <Label bold numeric size={16}>{distance} {t('km')}</Label>
      </View>
      {trip.tariffQuote?.code&&<View style={{justifyContent:'center'}}><Label size={12} bold color={colors.icon}>{trip.tariffQuote.code}</Label></View>}
     </Row>
     {!!error&&<Notice error>{error}</Notice>}
     {departure==='review'&&departureLabel&&<Notice>{departureLabel}</Notice>}
    </ScrollView>
    <Row>
     <Button secondary label={roadWords.report} icon="warning-outline" onPress={()=>{roads.clearError();setReportSent(false);setSelectedReport(null);setReportPicker(true);}}/>
    </Row>
    <Button danger label={t(busy?'endBusy':'end')} icon="stop-circle-outline" busy={busy} disabled={endDisabled} onPress={onEnd}/>
   </Card>
  </View>
  <Modal visible={reportPicker} onRequestClose={()=>setReportPicker(false)} animationType="none">
   <Screen title={roadWords.report} action={<IconButton label={words.close} icon="close" onPress={()=>setReportPicker(false)}/>}>
    <Notice>{roadWords.stopped}</Notice>
    {selectedReport?<Card>
     <Label bold>{roadWords[selectedReport.kind]}</Label>
     {([true,false] as const).map(present=><Button key={String(present)} secondary label={present?roadWords.present:roadWords.gone} disabled={roads.busy} busy={roads.busy} onPress={()=>{void roads.submit({id:selectedReport.id,present}).then(ok=>{if(ok){setReportPicker(false);setReportSent(true);}});}}/>)}
    </Card>:<Card>
     {(['collision','hazard','closure','congestion'] as const).map(kind=><Button key={kind} secondary label={roadWords[kind]} disabled={roads.busy} busy={roads.busy} onPress={()=>{void roads.submit({kind}).then(ok=>{if(ok){setReportPicker(false);setReportSent(true);}});}}/>)}
    </Card>}
    {roads.failed&&<Notice error>{roadWords.failed}</Notice>}
   </Screen>
  </Modal>
  <Modal visible={details} onRequestClose={()=>setDetails(false)} animationType="none">
   <Screen title={words.details} action={<IconButton label={words.close} icon="close" onPress={()=>setDetails(false)}/>}>
    <Card>
     {(!trip.platform||trip.platform==='INTERNAL')&&<Field label={t('price')} placeholder={trip.proposedPrice.toFixed(2)}
      value={fareInput} keyboardType="decimal-pad" editable={!busy} onChangeText={onFareInput}/>}
     <Row><Icon name={trip.paymentMethod==='card'?'card-outline':'cash-outline'}/><Label>{t(trip.paymentMethod==='card'?'card':'cash')} · {trip.platform&&trip.platform!=='INTERNAL'?trip.platform:t('meter')}</Label></Row>
     <Label muted size={12}>{t(background?'background':'foreground')}</Label>
     {departureLabel&&<Notice>{departureLabel}</Notice>}
    </Card>
    {alternateNote&&<Card><Button secondary label={`${roadWords.alternate} · ${alternateNote}`} icon="git-compare-outline" onPress={chooseAlternative}/></Card>}
    <Card><RouteStops from={trip.startAddress} to={trip.endAddress}/>
     <AddressField label={t('destination')} value={destinationText} position={lastPosition} disabled={busy}
      onChange={setDestinationText} onSelect={point=>{setRoute(null);setDestinationText(point.label);setDestination({lat:point.lat,lon:point.lon,label:point.label});setDetails(false);}}/>
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

const styles=StyleSheet.create({
 overlay:{position:'absolute'},
 metric:{flexGrow:1,flexShrink:1,flexBasis:'24%',minWidth:74,gap:2},
});
