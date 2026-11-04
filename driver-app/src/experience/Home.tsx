import React from 'react';
import {View} from 'react-native';
import {router} from 'expo-router';
import DriverMap from '../DriverMap';
import BillingReminder from './BillingReminder';
import ShiftCard from './ShiftCard';
import {useSession,useTrip} from './session';
import {usePreferences} from './preferences';
import {useInbox} from './inbox';
import {useShifts} from './shift-state';
import {nativeShiftCopy} from './shift-copy';
import {Button,Card,Icon,IconButton,Label,Notice,Row,Screen,SectionHeading} from './ui';

export default function Home(){
 const {profile,position,error}=useSession();
 const trip=useTrip(),inbox=useInbox(),shift=useShifts();
 const {t,colors,rtl,language}=usePreferences();
 const copy=nativeShiftCopy[language];
 const {company,driver}=profile!;
 const tripDisabled=!trip.trip&&(shift.active?.work_status==='break'||!!shift.pending||shift.busy||trip.pending>0);

 return <Screen>
  <Row style={{justifyContent:'space-between'}}>
   <Row style={{flex:1}}>
    <View style={{width:42,height:42,borderRadius:13,backgroundColor:colors.accent,alignItems:'center',justifyContent:'center'}}>
     <Icon name="navigate" color={colors.accentText}/>
    </View>
    <View style={{flex:1,gap:2}}>
     <Label size={15} bold>JOUW DRIVER</Label>
     <Label muted size={12}>{company.name}</Label>
    </View>
   </Row>
   <IconButton label={`${t('bell')}${inbox.unreadNotifications?` · ${inbox.unreadNotifications}`:''}`}
    icon="notifications-outline" count={inbox.unreadNotifications} onPress={()=>router.push('/notifications')}/>
  </Row>
  <BillingReminder/>
  {company.is_test&&<Notice>{t('trialAccount')}</Notice>}
  <View style={{gap:4}}>
   <Label muted size={14}>{t('hello')}</Label>
   <Label size={32} bold>{driver.full_name}</Label>
   <Row style={{gap:7}}>
    <Icon name="person-circle-outline" size={16} color={colors.icon}/>
    <Label muted size={13}>{t(driver.status==='active'?'activeStatus':'otherStatus')}</Label>
   </Row>
  </View>
  {(trip.trip||shift.active)&&<Card style={{borderColor:colors.icon,gap:12}}>
   <SectionHeading title={trip.trip?t('active'):copy.nextTrip} icon="navigate-circle-outline"/>
   <Label muted size={14}>{trip.trip?t('syncLocal'):t('readyNote')}</Label>
   <Button label={t(trip.trip?'resume':'start')} icon={trip.trip?'navigate':rtl?'arrow-back':'arrow-forward'}
    disabled={tripDisabled} onPress={()=>router.push('/active')}/>
  </Card>}
  {error&&<Notice error>{t(error==='security'?'securityError':error as 'error')}</Notice>}
  {trip.pending>0&&<Notice>{t('syncPending')}: {trip.pending}</Notice>}
  <ShiftCard/>
  <DriverMap compact position={position} showLocate={false}/>
  <Card>
   <SectionHeading title={t('messages')} icon="chatbubbles-outline"
    detail={inbox.unreadMessages?`${inbox.unreadMessages} ${t('unread')}`:undefined}/>
   {inbox.messages[0]&&<Label bold size={15}>{inbox.messages[0].subject}</Label>}
   <Label muted size={13}>{t('inboxNote')}</Label>
   <Button secondary label={t('messages')} icon={rtl?'arrow-back':'arrow-forward'} onPress={()=>router.push('/messages')}/>
  </Card>
 </Screen>;
}
