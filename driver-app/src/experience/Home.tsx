import React,{useEffect,useState} from 'react';
import {View} from 'react-native';
import {router} from 'expo-router';
import {useSession,useTrip} from './session';
import {usePreferences} from './preferences';
import {useInbox} from './inbox';
import {Button,Card,Icon,IconButton,Label,Notice,Row,Screen,SectionHeading} from './ui';
import {RoadArt,VehicleArt} from './art';
export default function Home(){
 const s=useSession(),trip=useTrip(),inbox=useInbox();const {t,colors,rtl}=usePreferences();const [vehicleError,setVehicleError]=useState(false);
 useEffect(()=>{let alive=true;void trip.changeVehicle().catch(()=>{if(alive)setVehicleError(true);});return()=>{alive=false;};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[s.profile!.driver.id]);
 const vehicle=trip.vehicles?.find(v=>v.id===s.profile!.driver.current_vehicle_id);
 return <Screen>
 <Row style={{justifyContent:'space-between'}}><View style={{flex:1,gap:5}}><Row style={{gap:7}}><View style={{width:25,height:25,borderRadius:8,backgroundColor:colors.accent,alignItems:'center',justifyContent:'center'}}><Icon name="navigate" size={15} color={colors.accentText}/></View><Label size={15} bold>JOUW DRIVER</Label></Row><Label muted size={12}>{s.profile!.company.name}</Label></View><IconButton label={`${t('bell')}${inbox.unreadNotifications?` · ${inbox.unreadNotifications}`:''}`} icon="notifications-outline" count={inbox.unreadNotifications} onPress={()=>router.push('/notifications')}/></Row>
 <View style={{gap:5}}><Label muted size={14}>{t('hello')}،</Label><Row style={{justifyContent:'space-between',alignItems:'flex-start'}}><View style={{flex:1}}><Label size={28} bold>{s.profile!.driver.full_name}</Label></View><View style={{paddingVertical:7,paddingHorizontal:10,borderRadius:12,backgroundColor:colors.raised}}><Row style={{gap:6}}><Icon name="cloud-done-outline" size={15} color={colors.icon}/><Label size={10}>{t('available')}</Label></Row></View></Row></View>
 <Card style={{backgroundColor:colors.hero,borderColor:colors.artRoad,overflow:'hidden',gap:12,padding:20}}><Row style={{justifyContent:'space-between'}}><View style={{height:4,width:36,borderRadius:4,backgroundColor:colors.accent}}/><Icon name={trip.trip?'navigate-circle-outline':'compass-outline'} color={colors.heroMuted} size={24}/></Row><Label color={colors.heroText} size={29} bold>{trip.trip?t('active'):t('ready')}</Label><Label color={colors.heroMuted} size={13}>{t('readyNote')}</Label><RoadArt/><Button label={t(trip.trip?'resume':'start')} icon={trip.trip?'navigate':rtl?'arrow-back':'arrow-forward'} onPress={()=>router.push('/active')}/></Card>
 {s.error&&<Notice error>{t(s.error==='security'?'securityError':'error')}</Notice>}
 {trip.pending>0&&<Notice>{t('pending')}: {trip.pending}</Notice>}
 <View style={{gap:12}}><SectionHeading title={t('vehicle')} icon="car-sport-outline"/><Card style={{paddingBottom:16,gap:10}}><Row style={{justifyContent:'space-between',alignItems:'flex-start'}}><View style={{flex:1}}><Label bold size={20}>{vehicle?[vehicle.brand,vehicle.model].filter(Boolean).join(' ')||vehicle.plate_number:t('noVehicle')}</Label>{vehicle&&<View style={{alignSelf:rtl?'flex-end':'flex-start',marginTop:7,paddingVertical:4,paddingHorizontal:10,backgroundColor:colors.raised,borderRadius:8}}><Label size={12} numeric>{vehicle.plate_number}</Label></View>}</View><Icon name="car-sport-outline" color={colors.muted} size={25}/></Row><View style={{marginHorizontal:-6}}><VehicleArt/></View><Row style={{justifyContent:'space-between'}}><View style={{flex:1}}><Label muted size={10}>{t('vehicleNote')}</Label></View><View style={{maxWidth:'60%'}}><Button secondary label={t('chooseVehicle')} icon="swap-horizontal" onPress={()=>router.push('/active')}/></View></Row>{vehicleError&&<Notice error>{t('error')}</Notice>}</Card></View>
 <View style={{gap:12}}><SectionHeading title={t('messages')} icon="chatbubbles-outline" detail={inbox.unreadMessages?`${inbox.unreadMessages} ${t('unread')}`:undefined}/><Card><Row style={{alignItems:'flex-start'}}><View style={{width:40,height:40,borderRadius:14,backgroundColor:colors.raised,alignItems:'center',justifyContent:'center'}}><Icon name="mail-unread-outline" color={colors.icon} size={21}/></View><View style={{flex:1,gap:5}}><Label bold size={15}>{inbox.messages[0]?.subject??t('messages')}</Label><Label muted size={12}>{t('inboxNote')}</Label></View></Row><Button secondary label={t('messages')} icon={rtl?'arrow-back':'arrow-forward'} onPress={()=>router.push('/messages')}/></Card></View>
 <Row><View style={{flex:1}}><Button secondary label={t('trips')} icon="receipt-outline" onPress={()=>router.push('/trips')}/></View><View style={{flex:1}}><Button secondary label={t('account')} icon="person-circle-outline" onPress={()=>router.push('/account')}/></View></Row>
 </Screen>;
}
