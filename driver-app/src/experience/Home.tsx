import React,{useEffect,useState} from 'react';
import {Pressable,View} from 'react-native';
import {router} from 'expo-router';
import {useSession,useTrip} from './session';
import {usePreferences} from './preferences';
import {useInbox} from './inbox';
import {Button,Card,Icon,Label,Notice,Row,Screen} from './ui';
import {RoadArt,VehicleArt} from './art';
export default function Home(){const s=useSession(),trip=useTrip(),inbox=useInbox();const {t,colors}=usePreferences();const [vehicleError,setVehicleError]=useState(false);
 useEffect(()=>{let alive=true;void trip.changeVehicle().catch(()=>{if(alive)setVehicleError(true);});return()=>{alive=false;}; // Assignment is rechecked again before every start.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[s.profile!.driver.id]);
 const vehicle=trip.vehicles?.find(v=>v.id===s.profile!.driver.current_vehicle_id);
 return <Screen action={<Pressable accessibilityRole="button" accessibilityLabel={t('bell')} onPress={()=>router.push('/notifications')} style={{padding:12,borderRadius:16,backgroundColor:colors.surface}}><Icon name="notifications-outline"/>{inbox.unreadNotifications>0&&<View style={{position:'absolute',top:7,right:7,width:9,height:9,borderRadius:5,backgroundColor:colors.accent}}/>}</Pressable>} title="JOUW DRIVER">
 <View style={{gap:5}}><Label muted>{t('hello')}، {s.profile!.driver.full_name}</Label><Row><View style={{width:6,height:6,borderRadius:4,backgroundColor:colors.accent}}/><Label muted size={12}>{s.profile!.company.name} · {t('available')}</Label></Row></View>
 <Card style={{overflow:'hidden',paddingBottom:18}}><Label size={29} bold>{trip.trip?t('active'):t('ready')}</Label><Label muted size={14}>{t('readyNote')}</Label><RoadArt/><Button label={t(trip.trip?'resume':'start')} icon={trip.trip?'navigate':'arrow-forward'} onPress={()=>router.push('/active')}/></Card>
 {s.error&&<Notice error>{t(s.error==='security'?'securityError':'error')}</Notice>}
 {trip.pending>0&&<Notice>{t('pending')}: {trip.pending}</Notice>}
 <Card><Row style={{justifyContent:'space-between'}}><Label bold size={18}>{t('vehicle')}</Label><Icon name="car-sport-outline" color={colors.accent}/></Row><VehicleArt/><Row style={{justifyContent:'space-between'}}><View style={{flex:1}}><Label bold size={18}>{vehicle?[vehicle.brand,vehicle.model].filter(Boolean).join(' ')||vehicle.plate_number:t('noVehicle')}</Label>{vehicle&&<Label muted>{vehicle.plate_number}</Label>}</View></Row><Label muted size={11}>{t('vehicleNote')}</Label><Button secondary label={t('chooseVehicle')} icon="swap-horizontal" onPress={()=>router.push('/active')}/>{vehicleError&&<Notice error>{t('error')}</Notice>}</Card>
 <Card><Row><Icon name="chatbubbles-outline" color={colors.accent}/><View style={{flex:1}}><Label bold>{t('messages')}{inbox.unreadMessages?` · ${inbox.unreadMessages} ${t('unread')}`:''}</Label><Label muted size={13}>{inbox.messages[0]?.subject??t('inboxNote')}</Label></View></Row><Button secondary label={t('messages')} onPress={()=>router.push('/messages')}/></Card>
 <Row><View style={{flex:1}}><Button secondary label={t('trips')} icon="receipt-outline" onPress={()=>router.push('/trips')}/></View><View style={{flex:1}}><Button secondary label={t('account')} icon="person-circle-outline" onPress={()=>router.push('/account')}/></View></Row>
 </Screen>;}
