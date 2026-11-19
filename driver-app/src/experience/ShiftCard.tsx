import React,{useState} from 'react';
import {Modal,View} from 'react-native';
import * as Crypto from 'expo-crypto';
import {router} from 'expo-router';
import {declaration} from '../shift-model';
import {driverApi} from '../api';
import {usePreferences} from './preferences';
import {useSession} from './session';
import {useShifts} from './shift-state';
import {nativeShiftCopy,shiftReadingCopy} from './shift-copy';
import {Button,Card,Field,Icon,Label,Notice,Row,Screen} from './ui';
import {RoadArt} from './art';
export function shiftDate(value:string,locale:string){return new Intl.DateTimeFormat(locale,{timeZone:'Europe/Brussels',dateStyle:'short',timeStyle:'short',hour12:false}).format(new Date(value));}
type StartForm = {vehicle:number;plate?:string;odometer:string;suggested:boolean;loading:boolean;failed:boolean};
export default function ShiftCard(){
 const q=useShifts(),s=useSession(),{colors,language,locale,t}=usePreferences(),c=nativeShiftCopy[language],copy=shiftReadingCopy[language];
 const [form,setForm]=useState<StartForm|null>(null),[invalid,setInvalid]=useState(false);
 const vehicle=s.profile!.driver.current_vehicle_id;
 const active=q.active,disabled=q.busy||q.blocked||!!q.pending||!q.ready;
 const startForm=!active&&!q.pending&&form?.vehicle===vehicle?form:null;
 const shiftError=q.error==='payment'?copy.payment:c[q.error as 'failed']||c.failed;
 const metric=(n:number)=>n.toLocaleString(locale,{maximumFractionDigits:2});
 async function openStart(){
  if(!vehicle||disabled)return;
  const draft={vehicle,odometer:'',suggested:false,loading:true,failed:false};
  setInvalid(false);setForm(draft);
  try{
   const value=await driverApi.shiftStartReading(s.profile!.driver.id,vehicle);
   setForm(current=>current===draft?{...draft,plate:value?.plate,odometer:value?.odometer==null?'':String(value.odometer),suggested:value?.odometer!=null,loading:false}:current);
  }catch{setForm(current=>current===draft?{...draft,loading:false,failed:true}:current);}
 }
 async function start(){
  if(!startForm||startForm.loading||disabled)return;
  try{setInvalid(false);if(await q.submit(declaration('start',startForm.odometer,'',null,Crypto.randomUUID())))setForm(null);}
  catch{setInvalid(true);}
 }
 return <View style={{gap:16}}><Card style={{backgroundColor:colors.hero,borderColor:colors.artRoad,gap:18,overflow:'hidden'}}>
  <Row style={{justifyContent:'space-between'}}><Row><View style={{width:42,height:42,borderRadius:14,backgroundColor:colors.artRoad,alignItems:'center',justifyContent:'center'}}><Icon name="time-outline" color={colors.accent}/></View><Label color={colors.heroMuted} size={14}>{c.title}</Label></Row><Label color={colors.heroMuted} size={12}>JOUW DRIVER</Label></Row>
  <Label color={colors.heroText} size={28} bold>{active?c[active.work_status]:c.newShift}</Label>
  <Label color={colors.heroMuted} size={14}>{active?`${active.plate_number} · ${c.keepOpen}`:c.subtitle}</Label>
  {active&&<View style={{borderTopWidth:1,borderColor:colors.artRoad,paddingTop:16,gap:14}}><View style={{gap:14}}><View style={{gap:5}}><Label color={colors.heroMuted} size={12}>{c.last}</Label><Label color={colors.heroText} direction="ltr" numeric bold size={26}>{metric(active.odometer)} km</Label></View><View style={{gap:5}}><Label color={colors.heroMuted} size={12}>{c.startTime}</Label><Label color={colors.heroText} size={14}>{shiftDate(active.started_at,locale)}</Label></View></View><Button label={active.work_status==='break'?c.resume:c.pause} icon={active.work_status==='break'?'play-outline':'pause-outline'} disabled={disabled||active.work_status==='with_passenger'} busy={q.busy} onPress={()=>void q.submit({action:'status',request_id:Crypto.randomUUID(),shift_id:active.id,expected_version:active.version,work_status:active.work_status==='break'?'available':'break'})}/></View>}
 {!active&&q.ready&&!q.pending&&<Card>{!vehicle&&<Notice>{c.selectVehicle}</Notice>}<Button label={c.start} icon="play-circle-outline" busy={q.busy} disabled={disabled||!vehicle} onPress={()=>void openStart()}/><Label muted size={13}>{c.notice}</Label></Card>}
 <RoadArt/>
 </Card>

 {q.loading&&!q.data&&<Notice>{t('loading')}</Notice>}
 {q.pending&&<><Notice>{c.uncertain}</Notice><Button label={c.retry} busy={q.busy} disabled={q.blocked} onPress={()=>void q.submit()}/></>}
 {q.error&&<><Notice error>{shiftError}</Notice><Button secondary label={c.refresh} disabled={q.busy} onPress={()=>void q.refresh()}/></>}
 {q.blocked&&<Notice>{c.blocked}</Notice>}
 <Button secondary label={c.sheet} icon="document-text-outline" onPress={()=>router.push('/shifts')}/>
 {startForm&&<Modal visible onRequestClose={()=>{if(!q.busy)setForm(null);}}>
  <Screen title={c.start} action={<Button secondary label={c.cancel} disabled={q.busy} onPress={()=>setForm(null)}/>}>
   <Card>
    {startForm.plate&&<Label bold>{startForm.plate}</Label>}
    {startForm.loading&&<Notice>{t('loading')}</Notice>}
    {startForm.suggested&&<Notice>{copy.suggested}</Notice>}
    {startForm.failed&&<Notice>{copy.unavailable}</Notice>}
    <Field label={c.odometer} value={startForm.odometer} onChangeText={odometer=>setForm({...startForm,odometer})} keyboardType="decimal-pad" editable={!disabled&&!startForm.loading} maxLength={12}/>
    {invalid&&<Notice error>{c.invalid}</Notice>}
    {q.error&&!invalid&&<Notice error>{shiftError}</Notice>}
    <Button label={c.start} busy={q.busy} disabled={disabled||startForm.loading||!startForm.odometer.trim()} onPress={()=>void start()}/>
   </Card>
  </Screen>
 </Modal>}
 </View>;
}
