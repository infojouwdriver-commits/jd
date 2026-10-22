import React,{useState} from 'react';
import {View} from 'react-native';
import * as Crypto from 'expo-crypto';
import {router} from 'expo-router';
import {declaration} from '../shift-model';
import {usePreferences} from './preferences';
import {useSession} from './session';
import {useShifts} from './shift-state';
import {nativeShiftCopy} from './shift-copy';
import {Button,Card,Field,Icon,Label,Notice,Row} from './ui';
import {RoadArt} from './art';
export function shiftDate(value:string,locale:string){return new Intl.DateTimeFormat(locale,{timeZone:'Europe/Brussels',dateStyle:'short',timeStyle:'short',hour12:false}).format(new Date(value));}
export default function ShiftCard(){
 const q=useShifts(),s=useSession(),{colors,language,locale,t}=usePreferences(),c=nativeShiftCopy[language];const [odometer,setOdometer]=useState(''),[invalid,setInvalid]=useState(false);
 const active=q.active,disabled=q.busy||q.blocked||!!q.pending||!q.ready;
 const metric=(n:number)=>n.toLocaleString(locale,{maximumFractionDigits:2});
 async function start(){try{setInvalid(false);await q.submit(declaration('start',odometer,'',null,Crypto.randomUUID()));}catch{setInvalid(true);}}
 return <View style={{gap:16}}><Card style={{backgroundColor:colors.hero,borderColor:colors.artRoad,gap:18,overflow:'hidden'}}>
  <Row style={{justifyContent:'space-between'}}><Row><View style={{width:42,height:42,borderRadius:14,backgroundColor:colors.artRoad,alignItems:'center',justifyContent:'center'}}><Icon name="time-outline" color={colors.accent}/></View><Label color={colors.heroMuted} size={14}>{c.title}</Label></Row><Label color={colors.heroMuted} size={12}>JOUW DRIVER</Label></Row>
  <Label color={colors.heroText} size={28} bold>{active?c[active.work_status]:c.newShift}</Label>
  <Label color={colors.heroMuted} size={14}>{active?`${active.plate_number} · ${c.keepOpen}`:c.subtitle}</Label>
  {active&&<View style={{borderTopWidth:1,borderColor:colors.artRoad,paddingTop:16,gap:14}}><View style={{gap:14}}><View style={{gap:5}}><Label color={colors.heroMuted} size={12}>{c.last}</Label><Label color={colors.heroText} direction="ltr" numeric bold size={26}>{metric(active.odometer)} km</Label></View><View style={{gap:5}}><Label color={colors.heroMuted} size={12}>{c.startTime}</Label><Label color={colors.heroText} size={14}>{shiftDate(active.started_at,locale)}</Label></View></View><Button label={active.work_status==='break'?c.resume:c.pause} icon={active.work_status==='break'?'play-outline':'pause-outline'} disabled={disabled||active.work_status==='with_passenger'} busy={q.busy} onPress={()=>void q.submit({action:'status',request_id:Crypto.randomUUID(),shift_id:active.id,expected_version:active.version,work_status:active.work_status==='break'?'available':'break'})}/></View>}
 <RoadArt/>
 </Card>
 {!active&&q.ready&&!q.pending&&<Card><Field label={c.odometer} value={odometer} onChangeText={setOdometer} keyboardType="decimal-pad" editable={!disabled} maxLength={12}/>{!s.profile!.driver.current_vehicle_id&&<Notice>{c.selectVehicle}</Notice>}<Button label={c.start} icon="play-circle-outline" busy={q.busy} disabled={disabled||!odometer.trim()||!s.profile!.driver.current_vehicle_id} onPress={()=>void start()}/>{invalid&&<Notice error>{c.invalid}</Notice>}<Label muted size={13}>{c.notice}</Label></Card>}
 {q.loading&&!q.data&&<Notice>{t('loading')}</Notice>}
 {q.pending&&<><Notice>{c.uncertain}</Notice><Button label={c.retry} busy={q.busy} disabled={q.blocked} onPress={()=>void q.submit()}/></>}
 {q.error&&<><Notice error>{c[q.error as 'failed']||c.failed}</Notice><Button secondary label={c.refresh} disabled={q.busy} onPress={()=>void q.refresh()}/></>}
 {q.blocked&&<Notice>{c.blocked}</Notice>}
 <Button secondary label={c.sheet} icon="document-text-outline" onPress={()=>router.push('/shifts')}/>
 </View>;
}
