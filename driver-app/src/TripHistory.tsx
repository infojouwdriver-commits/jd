import React,{useEffect,useRef,useState} from 'react';
import {ActivityIndicator,Pressable,StyleSheet,Text,View} from 'react-native';
import {driverApi,type DriverTripSummary} from './api';
function date(value:string|null){if(!value)return 'وقت غير مسجل';try{return new Intl.DateTimeFormat('fr-BE',{timeZone:'Europe/Brussels',dateStyle:'short',timeStyle:'short'}).format(new Date(value));}catch{return value;}}
function chiron(trip:DriverTripSummary){return trip.chiron_sync_state==='COMPLETED'&&(trip.chiron_environment==='production'||trip.chiron_environment==='test')?trip.chiron_environment==='production'?'إقرار Chiron في الإنتاج':'إقرار Chiron في الاختبار':'إقرار Chiron غير مؤكد';}
export default function TripHistory({owner}:{owner:number}){
 const [trips,setTrips]=useState<DriverTripSummary[]|null>(null),[next,setNext]=useState<number|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');const generation=useRef(0),reading=useRef(false);
 useEffect(()=>{const lifetime=generation;return()=>{lifetime.current++;};},[]);
 async function load(more=false){if(reading.current)return;reading.current=true;const version=generation.current;setBusy(true);setError('');try{const page=await driverApi.history(owner,more?next??0:0);if(version===generation.current){setTrips(previous=>more?[...new Map([...(previous??[]),...page.trips].map(trip=>[trip.id,trip])).values()]:page.trips);setNext(page.next_offset);}}catch{if(version===generation.current){setTrips(null);setNext(null);setError('تعذّر تحديث السجل. لا تُعرض رحلات محفوظة على الهاتف حتى يُقر الخادم حفظها.');}}finally{reading.current=false;if(version===generation.current)setBusy(false);}}
 return <View style={styles.panel}><Text style={styles.heading}>سجل رحلاتك</Text><Text style={styles.note}>الرحلات المحفوظة على الخادم · الأوقات بتوقيت بروكسل</Text>
 <Pressable accessibilityRole="button" disabled={busy} onPress={()=>load()} style={styles.button}>{busy?<ActivityIndicator/>:<Text>تحديث السجل</Text>}</Pressable>
 {!!error&&<Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
 {trips&&trips.length===0&&<Text style={styles.note}>لا توجد رحلات محفوظة.</Text>}
 {trips?.map(trip=><View key={trip.id} style={styles.trip}><Text style={styles.text}>رحلة #{trip.id} · {trip.price.toFixed(2)} €</Text><Text style={styles.note}>{date(trip.start_time)} ← {date(trip.end_time)}</Text><Text numberOfLines={2} style={styles.text}>{trip.start_address ?? 'عنوان الانطلاق غير مسجل'}</Text><Text numberOfLines={2} style={styles.text}>← {trip.end_address ?? 'عنوان الوصول غير مسجل'}</Text><Text style={styles.note}>{trip.distance !== null ? `${trip.distance.toFixed(2)} كم` : 'المسافة غير مسجلة'} · {trip.duration !== null ? `${trip.duration} دقيقة` : 'المدة غير مسجلة'}</Text><Text style={styles.note}>{chiron(trip)}</Text></View>)}
 {next!==null&&<Pressable accessibilityRole="button" disabled={busy} onPress={()=>load(true)}><Text style={styles.text}>تحميل رحلات أقدم</Text></Pressable>}
 </View>;
}
const styles=StyleSheet.create({panel:{backgroundColor:'#15212c',padding:20,borderRadius:24,gap:12},heading:{color:'#fff',fontSize:22,fontWeight:'700',textAlign:'right'},note:{color:'#a6b5c4',textAlign:'right',lineHeight:22},text:{color:'#dbe5ee',textAlign:'right',fontSize:15},button:{backgroundColor:'#a8e86c',padding:14,borderRadius:14,alignItems:'center'},trip:{borderWidth:1,borderColor:'#334655',padding:14,borderRadius:14,gap:8},error:{color:'#ffc9c9',textAlign:'right',lineHeight:22}});
