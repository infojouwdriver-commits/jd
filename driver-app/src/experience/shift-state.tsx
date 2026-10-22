import React,{createContext,useCallback,useContext,useEffect,useMemo,useRef,useState} from 'react';
import {AppState} from 'react-native';
import {driverApi,ApiError} from '../api';
import {nativeShiftIntent} from '../native-shift-intent';
import type {ShiftCommand,ShiftList} from '../shift-model';
import {useSession,useTrip} from './session';
const Context=createContext<ReturnType<typeof useShiftState>|null>(null);
function useShiftState(){
 const s=useSession(),trip=useTrip(),owner=s.profile!.driver.id;
 const intent=useMemo(()=>nativeShiftIntent(owner),[owner]);
 const [data,setData]=useState<ShiftList|null>(null),[pending,setPending]=useState<ShiftCommand|null>(null),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState(''),[saved,setSaved]=useState(false),[restored,setRestored]=useState(false);
 const generation=useRef(0),alive=useRef(true),initialised=useRef(false),flight=useRef(false);
 const refresh=useCallback(async()=>{const gen=++generation.current;await Promise.resolve();if(!alive.current)return;setLoading(true);try{
   if(!initialised.current){const restored=await intent.restore();if(!alive.current)return;setPending(restored);initialised.current=true;setRestored(true);}
   const next=await driverApi.shifts(owner) as ShiftList;
   if(alive.current&&gen===generation.current){setData(next);setError('');}
  }catch(e){if(alive.current&&gen===generation.current)setError(e instanceof ApiError&&e.status===409?'conflict':'failed');}finally{if(alive.current&&gen===generation.current)setLoading(false);}},[intent,owner]);
 const invalidate=useCallback(()=>{++generation.current;},[]);
 useEffect(()=>{alive.current=true;const startup=setTimeout(()=>void refresh(),0);const timer=setInterval(()=>{if(AppState.currentState==='active'&&!flight.current)void refresh();},20000);const subscription=AppState.addEventListener('change',state=>{if(state==='active'&&!flight.current)void refresh();});return()=>{alive.current=false;invalidate();clearTimeout(startup);clearInterval(timer);subscription.remove();};},[refresh,invalidate]);
 async function submit(command?:ShiftCommand){
  if(flight.current||!initialised.current||!trip.ready||s.busy)return;
  const body=intent.current()||command;if(!body)return;
  if(trip.trip||trip.pending>0){setError('blocked');return;}
  if(!s.actionGate.acquire())return;flight.current=true;++generation.current;setBusy(true);setSaved(false);setError('');
  try{const next=await intent.submit(command);if(!alive.current)return;setPending(null);setData(old=>({active:next.ended_at?null:next,shifts:[next,...(old?.shifts||[]).filter(row=>row.id!==next.id)].slice(0,25)}));setSaved(true);void refresh();return true;}
  catch(e){if(alive.current){setPending(intent.current());setError(e instanceof ApiError&&e.status===409?'conflict':e instanceof ApiError&&e.status===400?'invalid':'failed');}}
  finally{flight.current=false;s.actionGate.release();if(alive.current)setBusy(false);}
 }
 return {data,active:data?.active||null,pending,busy,loading,error,saved,refresh,submit,ready:restored&&!!data,blocked:!trip.ready||!!trip.trip||trip.pending>0||s.busy};
}
export function ShiftProvider({children}:{children:React.ReactNode}){const value=useShiftState();return <Context.Provider value={value}>{children}</Context.Provider>;}
export function useShifts(){const value=useContext(Context);if(!value)throw Error('Shift workspace required');return value;}
