import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Pressable, View} from 'react-native';
import * as Location from 'expo-location';
import {freshSearchPoint, reverseBelgianAddress, type NativeAddress} from '../native-addresses';
import {usePreferences} from './preferences';
import {Icon, Label, Notice} from './ui';

const messages = {
 ar:{label:'استخدم موقعي الحالي للانطلاق', hint:'يُستخدم موقعك لتحويل نقطة الانطلاق إلى عنوان.', off:'فعّل خدمات الموقع ثم أعد المحاولة.', denied:'اسمح بالوصول إلى الموقع أثناء استخدام التطبيق أو اكتب العنوان.', failed:'تعذّر تحديد الموقع. أعد المحاولة أو اكتب العنوان.', accuracy:'دقة الموقع غير كافية. أعد المحاولة في مكان مفتوح.', timeout:'انتهت مهلة تحديد الموقع. أعد المحاولة أو اكتب العنوان.', address:'تعذّر العثور على عنوان. عُرضت الإحداثيات ويمكنك كتابة العنوان.', retry:'إعادة المحاولة'},
 fr:{label:'Utiliser ma position comme départ', hint:'Votre position sert à trouver l’adresse de départ.', off:'Activez la localisation, puis réessayez.', denied:'Autorisez la localisation pendant l’utilisation ou saisissez l’adresse.', failed:'Position indisponible. Réessayez ou saisissez l’adresse.', accuracy:'Position trop imprécise. Réessayez à ciel ouvert.', timeout:'Délai de localisation dépassé. Réessayez ou saisissez l’adresse.', address:'Adresse introuvable. Les coordonnées sont affichées et vous pouvez saisir l’adresse.', retry:'Réessayer'},
 nl:{label:'Mijn locatie als vertrekpunt gebruiken', hint:'Je locatie wordt gebruikt om het vertrekadres te vinden.', off:'Schakel locatievoorzieningen in en probeer opnieuw.', denied:'Sta locatie toe tijdens gebruik of voer het adres in.', failed:'Locatie niet beschikbaar. Probeer opnieuw of voer het adres in.', accuracy:'Locatie is te onnauwkeurig. Probeer het buiten opnieuw.', timeout:'De locatiebepaling duurde te lang. Probeer opnieuw of voer het adres in.', address:'Adres niet gevonden. De coördinaten staan ingevuld. Je kunt het adres zelf invoeren.', retry:'Opnieuw proberen'},
 en:{label:'Use my location as pickup', hint:'Your location is used to find the pickup address.', off:'Turn on location services and try again.', denied:'Allow location while using the app or enter the address.', failed:'Location unavailable. Try again or enter the address.', accuracy:'Location is too imprecise. Try again outdoors.', timeout:'Location request timed out. Try again or enter the address.', address:'Address unavailable. Coordinates are shown and you can enter the address manually.', retry:'Try again'},
};
type Failure = 'off'|'denied'|'failed'|'accuracy'|'timeout'|'address';

export default function PickupLocation({enabled, value, disabled, onSelect, children}: {
 enabled:boolean; value:string; disabled:boolean;
 onSelect:(address:NativeAddress)=>void; children:(accessory?:React.ReactNode)=>React.ReactNode;
}) {
 const {language, colors} = usePreferences();
 const copy = messages[language];
 const request = useRef<AbortController | null>(null);
 const [busy, setBusy] = useState(false);
 const [failure, setFailure] = useState<{kind:Failure;value:string} | null>(null);
 useEffect(() => () => request.current?.abort(), [value, language, disabled, enabled]);

 async function locate() {
  if (request.current || disabled) return;
  const controller = new AbortController();
  request.current = controller;
  setBusy(true);
  setFailure(null);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let failureKind: Failure = 'failed';
  try {
   if (!await Location.hasServicesEnabledAsync()) {failureKind = 'off'; throw Error();}
   if (controller.signal.aborted) return;
   const current = await Location.getForegroundPermissionsAsync();
   if (controller.signal.aborted) return;
   const permission = current.granted ? current : await Location.requestForegroundPermissionsAsync();
   if (!permission.granted) {failureKind = 'denied'; throw Error();}
   if (controller.signal.aborted) return;
   const position = await Promise.race([
    Location.getCurrentPositionAsync({accuracy:Location.Accuracy.High, mayShowUserSettingsDialog:false}),
    new Promise<never>((_, reject) => {timer = setTimeout(() => {failureKind = 'timeout'; reject(Error());}, 15000);}),
   ]);
   clearTimeout(timer);
   if (controller.signal.aborted) return;
   const point = !position.mocked && freshSearchPoint({lat:position.coords.latitude, lon:position.coords.longitude, accuracy:position.coords.accuracy, timestamp:position.timestamp});
   if (!point) {failureKind = 'accuracy'; throw Error();}
   const lookup = new AbortController();
   const cancelLookup = () => lookup.abort();
   controller.signal.addEventListener('abort', cancelLookup, {once:true});
   let address:NativeAddress|null = null;
   try {
    address = await Promise.race([
     reverseBelgianAddress(point, language, lookup.signal),
     new Promise<never>((_, reject) => {timer = setTimeout(() => {lookup.abort(); reject(Error());}, 8000);}),
    ]);
   } catch { /* The measured coordinates remain available for the route. */ }
   finally {controller.signal.removeEventListener('abort', cancelLookup);}
   if (controller.signal.aborted) return;
   const selection = address ?? {...point, label:`${point.lat.toFixed(5)}, ${point.lon.toFixed(5)}`};
   onSelect(selection);
   if (!address) setFailure({kind:'address', value:selection.label});
  } catch {
   if (!controller.signal.aborted) setFailure({kind:failureKind, value});
  } finally {
   clearTimeout(timer);
   if (request.current === controller) {request.current = null; setBusy(false);}
  }
 }

 if (!enabled) return children();
 return <View style={{gap:8}}>
  {children(<Pressable accessibilityRole="button" accessibilityLabel={copy.label} accessibilityHint={copy.hint}
   accessibilityState={{busy, disabled:disabled||busy}} disabled={disabled||busy} onPress={() => void locate()}
   style={({pressed}) => ({width:54,height:54,borderRadius:16,borderWidth:1,borderColor:colors.line,alignItems:'center',justifyContent:'center',backgroundColor:pressed?colors.raised:colors.surface,opacity:disabled?.5:1})}>
   {busy ? <ActivityIndicator color={colors.icon}/> : <Icon name="locate-outline" color={colors.icon}/>}
  </Pressable>)}
  {failure?.value===value && <Notice error>{copy[failure.kind]}</Notice>}
  {failure?.value===value && <Pressable accessibilityRole="button" disabled={disabled||busy} onPress={() => void locate()} style={{minHeight:44,justifyContent:'center'}}><Label>{copy.retry}</Label></Pressable>}
 </View>;
}
