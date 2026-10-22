import React from 'react';
import BillingReminder from './BillingReminder';
import {View} from 'react-native';
import {router} from 'expo-router';
import {useSession,useTrip} from './session';
import {usePreferences} from './preferences';
import {useInbox} from './inbox';
import {Button,Card,Icon,IconButton,Label,Notice,Row,Screen,SectionHeading} from './ui';
import ShiftCard from './ShiftCard';
import {useShifts} from './shift-state';
import {nativeShiftCopy} from './shift-copy';
export default function Home(){
 const s=useSession(),trip=useTrip(),inbox=useInbox(),shift=useShifts();const {t,colors,rtl,language}=usePreferences();const c=nativeShiftCopy[language];
 return <Screen>
 <BillingReminder/>
 {s.profile!.company.is_test&&<Notice>{t('trialAccount')}</Notice>}
 <Row style={{justifyContent:'space-between'}}><View style={{flex:1,gap:5}}><Row style={{gap:7}}><View style={{width:25,height:25,borderRadius:8,backgroundColor:colors.accent,alignItems:'center',justifyContent:'center'}}><Icon name="navigate" size={15} color={colors.accentText}/></View><Label size={15} bold>JOUW DRIVER</Label></Row><Label muted size={12}>{s.profile!.company.name}</Label></View><IconButton label={`${t('bell')}${inbox.unreadNotifications?` · ${inbox.unreadNotifications}`:''}`} icon="notifications-outline" count={inbox.unreadNotifications} onPress={()=>router.push('/notifications')}/></Row>
 <View style={{gap:5}}><Label muted size={14}>{t('hello')}،</Label><Row style={{justifyContent:'space-between',alignItems:'flex-start'}}><View style={{flex:1}}><Label size={28} bold>{s.profile!.driver.full_name}</Label></View><View style={{paddingVertical:7,paddingHorizontal:10,borderRadius:12,backgroundColor:colors.raised}}><Row style={{gap:6}}><Icon name="person-circle-outline" size={15} color={colors.icon}/><Label size={10}>{t(s.profile!.driver.status==='active'?'activeStatus':'otherStatus')}</Label></Row></View></Row></View>
 <ShiftCard/>
 {(trip.trip||shift.active)&&<Card style={{gap:16}}><Row style={{justifyContent:'space-between',alignItems:'flex-start'}}><View style={{flex:1,gap:6}}><Label size={22} bold>{trip.trip?t('active'):c.nextTrip}</Label><Label muted size={14}>{trip.trip?t('syncLocal'):t('readyNote')}</Label></View><Icon name={trip.trip?'navigate-circle-outline':'compass-outline'} color={colors.icon} size={28}/></Row><Button label={t(trip.trip?'resume':'start')} icon={trip.trip?'navigate':rtl?'arrow-back':'arrow-forward'} disabled={!trip.trip&&(shift.active?.work_status==='break'||!!shift.pending||shift.busy||trip.pending>0)} onPress={()=>router.push('/active')}/></Card>}
 {s.error&&<Notice error>{t(s.error==='security'?'securityError':s.error as 'error')}</Notice>}
 {trip.trip&&<Notice>{t('syncLocal')}</Notice>}
 {trip.pending>0&&<Notice>{t('syncPending')}: {trip.pending}</Notice>}
 <View style={{gap:12}}><SectionHeading title={t('messages')} icon="chatbubbles-outline" detail={inbox.unreadMessages?`${inbox.unreadMessages} ${t('unread')}`:undefined}/><Card><Row style={{alignItems:'flex-start'}}><View style={{width:40,height:40,borderRadius:14,backgroundColor:colors.raised,alignItems:'center',justifyContent:'center'}}><Icon name="mail-unread-outline" color={colors.icon} size={21}/></View><View style={{flex:1,gap:5}}><Label bold size={15}>{inbox.messages[0]?.subject??t('messages')}</Label><Label muted size={12}>{t('inboxNote')}</Label></View></Row><Button secondary label={t('messages')} icon={rtl?'arrow-back':'arrow-forward'} onPress={()=>router.push('/messages')}/></Card></View>
 <Row><View style={{flex:1}}><Button secondary label={t('trips')} icon="receipt-outline" onPress={()=>router.push('/trips')}/></View><View style={{flex:1}}><Button secondary label={t('revenues')} icon="bar-chart-outline" onPress={()=>router.push('/revenues')}/></View></Row>
 </Screen>;
}
