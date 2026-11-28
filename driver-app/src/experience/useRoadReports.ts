import {useCallback,useEffect,useRef,useState} from 'react';
import {driverApi} from '../api';
import {freshSearchPoint} from '../native-addresses';
import type {AirportNotice,RoadKind,RoadReport} from '../road-alerts';
import type {MeterPoint} from '../trip-meter';

export function useRoadReports(position:MeterPoint | null) {
 const [reports,setReports]=useState<RoadReport[]>([]);
 const [airport,setAirport]=useState<AirportNotice[]>([]);
 const [busy,setBusy]=useState(false);
 const [failed,setFailed]=useState(false);
 const fix=useRef(position);
 const writing=useRef(false);
 const active=useRef(false);
 useEffect(()=>{fix.current=position;},[position]);
 const refresh=useCallback(async()=>{
  const point=freshSearchPoint(fix.current);
  if(!point) return;
  if(!active.current) return;
  try {
   const rows=await driverApi.roadReports(point.lat,point.lon);
   if(active.current) {
    setReports(rows.reports.filter(row=>Date.parse(row.expires_at)>Date.now()));
    setAirport(rows.airport.filter(row=>Date.parse(row.expires_at)>Date.now()));
   }
  } catch {
   if(active.current) {
    setReports(current=>current.filter(row=>Date.parse(row.expires_at)>Date.now()));
    setAirport(current=>current.filter(row=>Date.parse(row.expires_at)>Date.now()));
   }
  }
 },[]);
 useEffect(()=>{
  active.current=true;
  void refresh();
  const timer=setInterval(()=>void refresh(),25_000);
  return ()=>{active.current=false;clearInterval(timer);};
 },[refresh]);
 async function submit(command:{kind:RoadKind}|{id:number;present:boolean}) {
  if(writing.current) return false;
  const point=freshSearchPoint(fix.current);
  const speed=fix.current?.speed;
  if(!point || Date.now()-(fix.current?.timestamp??0)>12_000 || speed==null || speed < 0 || speed > 0.5) {setFailed(true);return false;}
  writing.current=true;
  setBusy(true);
  setFailed(false);
  try {await driverApi.reportRoadIssue(point,command);void refresh();return true;}
  catch {setFailed(true);return false;}
  finally {writing.current=false;setBusy(false);}
 }
 return {reports,airport,busy,failed,submit,clearError:()=>setFailed(false)};
}
