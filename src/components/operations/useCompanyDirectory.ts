'use client';
import {useCallback,useEffect,useMemo,useState} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import {api} from '@/lib/api-client';
export type DirectoryKind='companies'|'drivers'|'vehicles';
export interface DirectoryResult<T>{rows:T[];total:number;active:number;suspended:number;limit:number;offset:number;}
export function useCompanyDirectory<T>(kind:DirectoryKind,enabled:boolean){
 const params=useSearchParams(),router=useRouter(),serialized=params.toString();
 const [version,setVersion]=useState(0),[result,setResult]=useState<DirectoryResult<T>>({rows:[],total:0,active:0,suspended:0,limit:25,offset:0}),[loading,setLoading]=useState(false),[error,setError]=useState(false);
 const filters=useMemo(()=>{const q=new URLSearchParams(serialized);return {company_id:q.get('company_id')||'',state:q.get('state')||'current',scope:q.get('scope')||'live',q:q.get('q')||'',sort:q.get('sort')||'newest',limit:['10','25','50','100'].includes(q.get('limit')||'')?q.get('limit')!:'25',offset:String(Math.max(0,Math.min(100000,Number(q.get('offset'))||0)))};},[serialized]);
 useEffect(()=>{if(!enabled)return;let alive=true;const controller=new AbortController();setLoading(true);setError(false);
 const timeout=setTimeout(()=>controller.abort(),20000);
 const request={kind,...filters};if(!request.company_id)delete (request as Partial<typeof request>).company_id;
 api.get<DirectoryResult<T>>('/company-directory',request,{signal:controller.signal}).then(data=>{if(!alive)return;if(data.total>0&&data.offset>=data.total){const q=new URLSearchParams(serialized);q.set('offset',String(Math.floor((data.total-1)/data.limit)*data.limit));router.replace('?'+q.toString(),{scroll:false});return;}setResult(data);}).catch(()=>{if(alive)setError(true);}).finally(()=>{clearTimeout(timeout);if(alive)setLoading(false);});
 return()=>{alive=false;clearTimeout(timeout);controller.abort();};},[kind,enabled,filters,version,router,serialized]);
 const setFilter=useCallback((key:string,value:string)=>{const q=new URLSearchParams(serialized);if(value)q.set(key,value);else q.delete(key);if(key!=='offset')q.delete('offset');router.replace('?'+q.toString(),{scroll:false});},[router,serialized]);
 return {result,loading,error,filters,setFilter,reload:useCallback(()=>setVersion(n=>n+1),[])};
}
