import React,{useEffect,useState} from 'react';
import {ActivityIndicator, Pressable, Text, View} from 'react-native';
import {driverApi} from '../api';
import type {NativeRoute,RouteCoordinate} from '../native-route';
import type {NativeTrip} from '../trip-engine';
import {usePreferences} from './preferences';
import {design} from './tokens';
import {Button,Label,Notice,Row} from './ui';

export type FarePreview={start:RouteCoordinate;end:RouteCoordinate;route:NativeRoute};
type Tariff={code:string;name:string;description:string};
const words={
 ar:{estimate:'السعر التقديري',note:'تقدير مبني على بيانات الخرائط',final:'السعر المتفق عليه',unavailable:'تعذّر تحميل التعرفات أو تحديث التقدير.',empty:'لا توجد تعرفات سارية.',retry:'تحديث التعرفات'},
 fr:{estimate:'Prix estimé',note:'Estimation basée sur les données cartographiques',final:'Prix convenu',unavailable:'Tarifs ou estimation indisponibles.',empty:'Aucun tarif en vigueur.',retry:'Actualiser les tarifs'},
 nl:{estimate:'Geschatte prijs',note:'Raming op basis van kaartgegevens',final:'Afgesproken prijs',unavailable:'Tarieven of prijsraming niet beschikbaar.',empty:'Geen geldige tarieven.',retry:'Tarieven vernieuwen'},
 en:{estimate:'Estimated fare',note:'Estimate based on map data',final:'Agreed fare',unavailable:'Tariffs or estimate unavailable.',empty:'No active tariffs.',retry:'Refresh tariffs'},
};
function same(a:RouteCoordinate,b:RouteCoordinate|null|undefined){return !!b&&a.lat===b.lat&&a.lon===b.lon;}
export function useClassicFare(company:number, enabled:boolean, preview:FarePreview|null, start?:RouteCoordinate|null,end?:RouteCoordinate|null) {
 const [tariffs,setTariffs]=useState<{key:string;rows:Tariff[]}|null>(null);
 const [selection,setSelection]=useState('');
 const [refresh,setRefresh]=useState(0);
 const [failure,setFailure]=useState<string|null>(null);
 const [result,setResult]=useState<{key:string;quote:NonNullable<NativeTrip['tariffQuote']>}|null>(null);
 const listKey=`list:${company}:${refresh}`;
 const rows=enabled&&tariffs?.key===listKey?tariffs.rows:undefined;
 const code=rows?.find(row=>row.code===selection)?.code??rows?.[0]?.code;
 const route=preview&&same(preview.start,start)&&same(preview.end,end)?preview.route:null;
 const km=route?Number((route.distanceMeters/1000).toFixed(2)):null;
 const minutes=route?Math.max(1,Math.ceil(route.durationSeconds/60)):null;
 const key=code&&km!=null&&minutes!=null?`${company}:${code}:${start?.lat}:${start?.lon}:${end?.lat}:${end?.lon}:${km}:${minutes}:${refresh}`:null;
 useEffect(()=>{
  if(!enabled)return;
  let live=true;
  void driverApi.tariffs().then(data=>{
   if(!live)return;
   if(Number(data.company_id)!==company){setFailure(listKey);return;}
   setTariffs({key:listKey,rows:data.tariffs??[]});
  }).catch(()=>{if(live)setFailure(listKey);});
  return()=>{live=false;};
 },[company,enabled,listKey]);
 useEffect(()=>{
  if(!key||!code||km==null||minutes==null)return;
  let live=true;
  void driverApi.tariffQuote(code,km,minutes).then(quote=>{
   if(live)setResult({key,quote:{...quote,code,km,minutes}});
  }).catch(()=>{if(live)setFailure(key);});
  return()=>{live=false;};
 },[key,code,km,minutes]);
 return {rows,code,select:setSelection,quote:key&&result?.key===key?result.quote:undefined,km,minutes,
  loading:!!key&&key!==result?.key&&key!==failure, error:failure===listKey||!!key&&failure===key,
  reload:()=>setRefresh(n=>n+1)};
}

export function ClassicDisplay({state,amount,minutes,km,tariff,clock,agreed=false}:{
 state:'LIBRE'|'OCCUPÉ'|'À PAYER';amount?:number;minutes?:number|null;km?:number|null;tariff?:string;clock?:string;agreed?:boolean;
}) {
 const {language,locale,t}=usePreferences();
 const green='#81F7AA', dim='#9ABBA9';
 return <View style={{backgroundColor:'#101E33',borderColor:'#34485F',borderWidth:2,borderRadius:16,padding:13,gap:9}}>
  <Row style={{justifyContent:'space-between',flexWrap:'wrap'}}>
   <Text style={{color:'#D8E2EF',fontSize:12,fontWeight:'800',letterSpacing:1}}>JOUW TAXIMETER</Text>
   <Text style={{color:green,fontSize:12,fontWeight:'800'}}>{state}{tariff?' · '+tariff:''}</Text>
  </Row>
  <View style={{backgroundColor:'#091710',borderColor:'#325344',borderWidth:1,borderRadius:8,padding:12,gap:4}}>
   <Text style={{color:dim,textAlign:'center',fontSize:12}}>{agreed?words[language].final:words[language].estimate}</Text>
   <Text adjustsFontSizeToFit numberOfLines={1} style={{color:green,textAlign:'center',fontSize:40,fontFamily:design.font.data,fontWeight:'700'}}>
    {amount==null?'— —':new Intl.NumberFormat(locale,{style:'currency',currency:'EUR'}).format(amount)}
   </Text>
   <Text style={{color:dim,textAlign:'center',fontFamily:design.font.data,fontSize:13}}>
    {km==null?'—':km.toFixed(2)} {t('km')}   ·   {clock??(minutes==null?'—':`${minutes} ${t('minute')}`)}
   </Text>
  </View>
  {!agreed&&<Text style={{color:'#B6C4D8',fontSize:12,textAlign:'center'}}>{words[language].note}</Text>}
 </View>;
}

export function FareControls({fare}:{fare:ReturnType<typeof useClassicFare>}) {
 const {language,colors}=usePreferences();
 const copy=words[language];
 return <>
  <ClassicDisplay state="LIBRE" amount={fare.quote?.price??undefined} km={fare.km} minutes={fare.minutes} tariff={fare.code}/>
  {!!fare.rows?.length&&<Row style={{flexWrap:'wrap'}}>
   {fare.rows.map(row=><Pressable key={row.code} accessibilityRole="button" accessibilityLabel={`${row.code} · ${row.name}`}
    accessibilityState={{selected:row.code===fare.code}} onPress={()=>fare.select(row.code)}
    style={{minHeight:48,paddingHorizontal:14,borderRadius:10,justifyContent:'center',borderWidth:1,borderColor:row.code===fare.code?colors.accent:colors.line,backgroundColor:colors.raised}}>
    <Label bold>{row.code} · {row.name}</Label>
   </Pressable>)}
  </Row>}
  {fare.loading&&<ActivityIndicator color={colors.icon}/>}
  {fare.error&&<Notice error>{copy.unavailable}</Notice>}
  {(fare.error||fare.rows!==undefined)&&<Button secondary label={copy.retry} onPress={fare.reload}/>}
  {fare.rows?.length===0&&<Notice>{copy.empty}</Notice>}
 </>;
}
