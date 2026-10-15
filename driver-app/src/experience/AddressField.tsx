import React,{useEffect,useRef,useState} from 'react';
import {Linking,Pressable,View} from 'react-native';
import {freshSearchPoint,searchBelgianAddresses,type NativeAddress} from '../native-addresses';
import type {MeterPoint} from '../trip-meter';
import {usePreferences} from './preferences';
import {Button,Field,Icon,Label,Notice,Row} from './ui';
export default function AddressField({label,value,onChange,onSelect,selected,position,disabled}:{label:string;value:string;onChange:(value:string)=>void;onSelect:(address:NativeAddress)=>void;selected?:NativeAddress|null;position?:MeterPoint|null;disabled:boolean}){
 const {t,colors,language}=usePreferences();const [rows,setRows]=useState<NativeAddress[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState(false),[searched,setSearched]=useState(false),[scope,setScope]=useState({value:'',language:''});const flight=useRef<AbortController|null>(null),generation=useRef(0);
 const cancel=()=>{generation.current++;flight.current?.abort();flight.current=null;};
 useEffect(()=>()=>{generation.current++;flight.current?.abort();},[]);
 useEffect(()=>()=>{generation.current++;flight.current?.abort();flight.current=null;},[value,language,disabled]);
 const current=scope.value===value&&scope.language===language;const visibleRows=current?rows:[];
 async function search(){if(disabled||flight.current)return;const controller=new AbortController();flight.current=controller;const version=++generation.current;setScope({value,language});setBusy(true);setError(false);setSearched(false);setRows([]);try{const found=await searchBelgianAddresses(value,language,freshSearchPoint(position),controller.signal);if(version===generation.current){setRows(found);setSearched(true);}}catch{if(version===generation.current)setError(true);}finally{if(version===generation.current){flight.current=null;setBusy(false);}}}
 return <View style={{gap:10}}><Field label={label} value={value} maxLength={500} editable={!disabled} onChangeText={text=>{cancel();setRows([]);setBusy(false);onChange(text);}} returnKeyType="search" onSubmitEditing={()=>{if(value.trim().length>=3&&value.trim().length<=200)void search();}}/>
 <Button secondary label={t('searchAddress')} icon="search-outline" disabled={disabled||value.trim().length<3||value.trim().length>200} busy={busy&&current} onPress={()=>void search()}/>
 {selected&&selected.label===value&&<Row><Icon name="location" color={colors.accent}/><Label muted size={12}>{t('addressSelected')}</Label></Row>}
 {(current&&(searched||rows.length>0))&&<Label muted size={11}>{freshSearchPoint(position)?t('nearestAddresses'):t('addressWithoutGps')}</Label>}
 {visibleRows.map((row,index)=><Pressable key={`${row.lat}:${row.lon}:${index}`} accessibilityRole="button" accessibilityLabel={row.label} disabled={disabled} onPress={()=>{cancel();setRows([]);setSearched(false);onSelect(row);}} style={{backgroundColor:colors.raised,padding:14,borderRadius:14,gap:5,borderWidth:1,borderColor:index===0?colors.accent:colors.line}}><Label size={14}>{row.label}</Label>{row.distanceKm!==undefined&&<Label muted size={11}>{row.distanceKm<1?`${Math.round(row.distanceKm*1000)} m`:`${row.distanceKm.toFixed(1)} km`} · {t('straightDistance')}</Label>}</Pressable>)}
 {current&&searched&&!rows.length&&<Notice>{t('addressEmpty')}</Notice>}{current&&error&&<Notice error>{t('addressError')}</Notice>}
 <Pressable accessibilityRole="link" onPress={()=>{void Linking.openURL('https://www.openstreetmap.org/copyright').catch(()=>setError(true));}}><Label muted size={10}>{t('addressProvider')}</Label></Pressable>
 </View>;
}
