import React,{useCallback,useEffect,useRef,useState} from 'react';
import {Alert,View} from 'react-native';
import * as Crypto from 'expo-crypto';
import {useFocusEffect} from 'expo-router';
import {driverApi} from '../api';
import {declaration,shiftMetrics,shiftMinutes,type ShiftDetail,type ShiftList,type ShiftStatus} from '../shift-model';
import {useSession} from './session';
import {usePreferences} from './preferences';
import {useShifts} from './shift-state';
import {nativeShiftCopy} from './shift-copy';
import {shareShiftReport} from './receipt';
import {shiftDate} from './ShiftCard';
import {Button,Card,Choice,Field,Icon,Label,Loading,Notice,Row,Screen,SectionHeading} from './ui';
export default function Shifts(){
 const s=useSession(),q=useShifts(),{language,locale,t,colors}=usePreferences(),c=nativeShiftCopy[language],owner=s.profile!.driver.id;
 const [rows,setRows]=useState<ShiftList|null>(null),[offset,setOffset]=useState(0),[selected,setSelected]=useState<string|null>(null),[detail,setDetail]=useState<ShiftDetail|null>(null),[loading,setLoading]=useState(false),[failed,setFailed]=useState(false),[pdfBusy,setPdfBusy]=useState(false),[pdfError,setPdfError]=useState(false);
 const [form,setForm]=useState<'record'|'end'|null>(null),[odometer,setOdometer]=useState(''),[passenger,setPassenger]=useState(''),[invalid,setInvalid]=useState(false),[status,setStatus]=useState<ShiftStatus>('available');
 const generation=useRef(0),sharing=useRef(false);
 const load=useCallback(async()=>{const gen=++generation.current;await Promise.resolve();if(gen!==generation.current)return;setLoading(true);setFailed(false);try{const [list,report]=await Promise.all([driverApi.shifts(owner,{offset}),selected?driverApi.shifts(owner,{id:selected}):Promise.resolve(null)]);if(gen===generation.current){setRows(list as ShiftList);setDetail(report as ShiftDetail|null);}}catch{if(gen===generation.current)setFailed(true);}finally{if(gen===generation.current)setLoading(false);}},[owner,offset,selected]);
 const refresh=q.refresh;
 useFocusEffect(useCallback(()=>{void load();void refresh();return()=>{++generation.current;};},[load,refresh]));
 useEffect(()=>{const timer=setTimeout(()=>void load(),0);return()=>clearTimeout(timer);},[q.active?.version,q.saved,load]);
 const disabled=q.busy||q.blocked||!!q.pending||!q.ready||loading;
 async function save(){if(!form||!q.active)return;try{setInvalid(false);const body=declaration(form,odometer,passenger,q.active,Crypto.randomUUID());if(body.action!=='status'&&form==='record')body.work_status=status;if(await q.submit(body))clearForm();}catch{setInvalid(true);}}
 function commit(){if(form==='end')Alert.alert(c.confirmEnd,c.endNote,[{text:c.cancel,style:'cancel'},{text:c.end,style:'destructive',onPress:()=>void save()}]);else void save();}
 function clearForm(){setForm(null);setOdometer('');setPassenger('');}
 async function retry(){if(await q.submit())clearForm();}
 async function pdf(){if(!detail||sharing.current)return;sharing.current=true;setPdfBusy(true);setPdfError(false);try{await shareShiftReport(owner,detail.shift.id);}catch{setPdfError(true);}finally{sharing.current=false;setPdfBusy(false);}}
 const number=(value:number)=>value.toLocaleString(locale,{maximumFractionDigits:2});const metrics=detail?shiftMetrics(detail.shift):null,minutes=detail?shiftMinutes(detail):null;
 return <Screen title={c.sheet}>
 <Notice>{c.notice}</Notice>
 <Card><Row style={{justifyContent:'space-between'}}><Icon name="time-outline" color={colors.icon}/><View style={{flex:1}}><Label bold size={20}>{q.active?c[q.active.work_status]:c.empty}</Label>{q.active&&<Label muted>{q.active.plate_number}</Label>}</View></Row>
 {q.active&&!form&&<><Button label={c.record} disabled={disabled} onPress={()=>{setForm('record');setStatus(q.active!.work_status);setInvalid(false);}}/><Button secondary label={c.end} disabled={disabled} onPress={()=>{setForm('end');setInvalid(false);}}/></>}
 {!q.active&&<Label muted>{c.newShift}</Label>}
 {form&&q.active&&<><Label bold size={19}>{c[form]}</Label><Label muted size={13}>{c.last}: {number(q.active.odometer)} km · {number(q.active.passenger_km)} km</Label><Field label={c.odometer} value={odometer} onChangeText={setOdometer} keyboardType="decimal-pad" editable={!disabled} maxLength={12}/><Field label={c.passenger} value={passenger} onChangeText={setPassenger} keyboardType="decimal-pad" editable={!disabled} maxLength={12}/>{form==='record'&&!disabled&&<><Label bold>{c.state}</Label><Row style={{flexWrap:'wrap'}}>{(['available','driving_empty','with_passenger','break'] as ShiftStatus[]).map(value=><Choice key={value} label={c[value]} selected={status===value} onPress={()=>setStatus(value)}/>)}</Row></>}{form==='end'&&<Notice>{c.endNote}</Notice>}{invalid&&<Notice error>{c.invalid}</Notice>}<Button label={form==='end'?c.end:c.save} danger={form==='end'} busy={q.busy} disabled={disabled||!odometer.trim()||!passenger.trim()} onPress={commit}/><Button secondary label={c.cancel} disabled={q.busy||!!q.pending} onPress={()=>{setForm(null);setOdometer('');setPassenger('');}}/></>}
 {q.blocked&&<Notice>{c.blocked}</Notice>}{q.pending&&<><Notice>{c.uncertain}</Notice><Button label={c.retry} busy={q.busy} disabled={q.blocked} onPress={()=>void retry()}/></>}{q.error&&<Notice error>{c[q.error as 'failed']||c.failed}</Notice>}{q.saved&&<Notice>{c.saved}</Notice>}
 </Card>
 <Button secondary label={c.refresh} disabled={q.busy||loading} onPress={()=>{void q.refresh();void load();}}/>
 {loading&&!rows&&<Loading label={t('loading')}/>}{failed&&<Notice error>{c.failed}</Notice>}
 {detail&&metrics&&<Card><SectionHeading title={detail.shift.ended_at?c.closed:c.open} icon="document-text-outline"/><Label bold>{detail.shift.company_name} · {detail.shift.driver_name}</Label><Label muted>{detail.shift.plate_number} · {shiftDate(detail.shift.started_at,locale)}</Label><Row style={{alignItems:'flex-start'}}>{[[c.total,metrics.total],[c.passenger,metrics.passenger],[c.emptyKm,metrics.empty]].map(([label,value])=><View key={String(label)} style={{flex:1,gap:5}}><Label muted size={12}>{label}</Label><Label numeric bold size={19}>{number(Number(value))}</Label></View>)}</Row>
 {minutes&&<View style={{gap:12}}>{Object.entries(minutes).map(([state,value])=><Row key={state} style={{justifyContent:'space-between'}}><Label muted size={14}>{c[state as 'available']}</Label><Label numeric size={14}>{number(value)} {c.minutes}</Label></Row>)}</View>}
 {detail.summary&&<><SectionHeading title={c.payments}/><Label>{c.tripCount}: {detail.summary.trip_count}</Label>{detail.summary.payments.map(payment=><View key={payment.currency} style={{gap:6}}><Label bold numeric>{number(payment.total)} {payment.currency}</Label>{payment.missing_amounts>0&&<Label muted>{c.missing}: {payment.missing_amounts}</Label>}</View>)}</>}
 <Button label={c.pdf} icon="share-outline" busy={pdfBusy} onPress={()=>void pdf()}/>{pdfError&&<Notice error>{c.pdfFailed}</Notice>}
 <SectionHeading title={c.readings}/>{detail.events.map(e=><View key={e.version} style={{borderTopWidth:1,borderColor:colors.line,paddingTop:12,gap:4}}><Label size={14}>{shiftDate(e.recorded_at,locale)} · {c[e.action==='start'?'start':e.action==='end'?'end':'record']}</Label><Label numeric size={14}>{number(e.odometer)} km · {number(e.passenger_km)} km</Label><Label muted size={13}>{c[e.work_status]}</Label></View>)}
 <SectionHeading title={c.activity}/>{detail.activity?.filter(a=>a.kind!=='declaration').map(a=><View key={a.id} style={{borderTopWidth:1,borderColor:colors.line,paddingTop:12,gap:4}}><Label size={14}>{shiftDate(a.occurred_at,locale)} · {c[a.kind]}</Label><Label muted size={13}>{a.work_status?c[a.work_status]:''}{a.trip_id?` #${a.trip_id} · ${a.source||''}`:''}</Label></View>)}
 </Card>}
 <SectionHeading title={c.history} icon="archive-outline"/>{rows?.shifts.length===0&&<Notice>{c.empty}</Notice>}{rows?.shifts.map(row=><Card key={row.id}><Label bold>{row.plate_number}</Label><Label muted size={14}>{shiftDate(row.started_at,locale)} · {row.ended_at?c.closed:c.open}</Label><Button secondary label={c.details} disabled={loading} onPress={()=>{setSelected(row.id);setPdfError(false);}}/></Card>)}
 <Row>{offset>0&&<View style={{flex:1}}><Button secondary label={c.back} disabled={loading} onPress={()=>{setSelected(null);setOffset(Math.max(0,offset-25));}}/></View>}{rows?.shifts.length===25&&<View style={{flex:1}}><Button secondary label={c.more} disabled={loading} onPress={()=>{setSelected(null);setOffset(offset+25);}}/></View>}</Row>
 </Screen>;
}
