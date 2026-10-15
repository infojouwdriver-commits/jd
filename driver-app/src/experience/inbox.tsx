import React,{createContext,useCallback,useContext,useEffect,useRef,useState} from 'react';
import {AppState} from 'react-native';
import {driverApi,type DriverMessage,type DriverNotification} from '../api';
import {useSession} from './session';
function useInboxState(){const {profile}=useSession();const owner=profile!.driver.id;const [messages,setMessages]=useState<DriverMessage[]>([]),[notifications,setNotifications]=useState<DriverNotification[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState(false);const alive=useRef(true),loading=useRef(false);
 const refresh=useCallback(async()=>{if(loading.current)return;loading.current=true;setBusy(true);try{const results=await Promise.allSettled([driverApi.messages(owner),driverApi.notifications(owner)]);if(!alive.current)return;const [m,n]=results;if(m.status==='fulfilled')setMessages(m.value);if(n.status==='fulfilled')setNotifications(n.value);setError(results.some(r=>r.status==='rejected'));}finally{loading.current=false;if(alive.current)setBusy(false);}},[owner]);
 useEffect(()=>{alive.current=true;void refresh();const timer=setInterval(()=>{if(AppState.currentState==='active')void refresh();},30000);const subscription=AppState.addEventListener('change',state=>{if(state==='active')void refresh();});return()=>{alive.current=false;clearInterval(timer);subscription.remove();};},[refresh]);
 async function readMessage(id:number){await driverApi.readMessage(owner,id);if(alive.current)setMessages(rows=>rows.map(row=>row.id===id?{...row,is_read:true}:row));}
 async function readNotification(id:number){await driverApi.readNotification(owner,id);if(alive.current)setNotifications(rows=>rows.map(row=>row.id===id?{...row,is_read:true}:row));}
 return {messages,notifications,busy,error,refresh,readMessage,readNotification,unreadMessages:messages.filter(row=>!row.is_read).length,unreadNotifications:notifications.filter(row=>!row.is_read).length};}
const Context=createContext<ReturnType<typeof useInboxState>|null>(null);
export function InboxProvider({children}:{children:React.ReactNode}){const state=useInboxState();return <Context.Provider value={state}>{children}</Context.Provider>;}
export function useInbox(){const value=useContext(Context);if(!value)throw Error('Inbox required');return value;}
