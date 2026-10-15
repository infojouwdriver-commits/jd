import React,{createContext,useCallback,useContext,useEffect,useRef,useState} from 'react';
import {AppState,Platform} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import {router} from 'expo-router';
import {driverApi} from '../api';
import {pushDestination,registerPushStopper,serialPushRegistration} from '../push-lifecycle';
import {useSession} from './session';
import {useInbox} from './inbox';
import {usePreferences} from './preferences';
Notifications.setNotificationHandler({handleNotification:async()=>({shouldPlaySound:true,shouldSetBadge:false,shouldShowBanner:true,shouldShowList:true})});
const Context=createContext<ReturnType<typeof usePushState>|null>(null);
const installationKey='jd-push-installation-v1',optInKey='jd-push-opt-in-v1';
async function installation(){const previous=await SecureStore.getItemAsync(installationKey);if(previous)return previous;const value=Crypto.randomUUID();await SecureStore.setItemAsync(installationKey,value,{keychainAccessible:SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY});return value;}
function usePushState(){
 const {profile,busy:sessionBusy}=useSession(),owner=profile!.driver.id;const {language}=usePreferences(),languageRef=useRef(language);useEffect(()=>{languageRef.current=language;},[language]);
 const inbox=useInbox(),refreshRef=useRef(inbox.refresh);useEffect(()=>{refreshRef.current=inbox.refresh;},[inbox.refresh]);
 const [queue]=useState(serialPushRegistration),alive=useRef(true),[enabled,setEnabled]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(false),[testState,setTestState]=useState<'idle'|'queued'|'received'>('idle');
 const registered=useRef(false);
 const sessionBusyRef=useRef(sessionBusy);useEffect(()=>{sessionBusyRef.current=sessionBusy;},[sessionBusy]);
 const register=useCallback(async(ask:boolean)=>{
  if(Platform.OS!=='android'||sessionBusyRef.current)return;
  await queue.run(async current=>{
   if(!ask&&await SecureStore.getItemAsync(optInKey)!=='1')return;
   await Notifications.setNotificationChannelAsync('jouw-driver',{name:'JOUW DRIVER',importance:Notifications.AndroidImportance.HIGH,sound:'default'});
   let permission=await Notifications.getPermissionsAsync();if(ask&&permission.status!=='granted')permission=await Notifications.requestPermissionsAsync();
   const id=await installation();
   if(permission.status!=='granted'){
    if(!current())return;
    await driverApi.pushRegistration(owner,id,false,undefined,languageRef.current);registered.current=false;if(alive.current)setEnabled(false);
    if(ask)throw Error('Permission required');return;
   }
   const native=await Notifications.getDevicePushTokenAsync();
   if(!current())return;
   if(native.type!=='android'||typeof native.data!=='string')throw Error('FCM token unavailable');
   await driverApi.pushRegistration(owner,id,true,native.data,languageRef.current);
   // stop() waits for this in-flight request and then disables it, even if logout started during fetch.
   registered.current=true;
   if(!current())return;
   await SecureStore.setItemAsync(optInKey,'1');if(alive.current)setEnabled(true);
  });
 },[owner,queue]);
 useEffect(()=>{
  alive.current=true;queue.resume();
  const unregister=registerPushStopper(()=>queue.stop(async()=>{const id=await SecureStore.getItemAsync(installationKey);if(id&&registered.current)await driverApi.pushRegistration(owner,id,false);registered.current=false;}));
  const restore=()=>{if(sessionBusyRef.current)return;queue.resume();void register(false).catch(()=>{if(alive.current){setError(true);setEnabled(false);}});};restore();
  const app=AppState.addEventListener('change',state=>{if(state==='active')restore();});
  const token=Notifications.addPushTokenListener(()=>restore());
  function received(n:Notifications.Notification,open:boolean){const data=n.request.content.data??{};const route=pushDestination(data);if(!route)return;
   void driverApi.pushReceipt(owner,String(data.job_id)).then(receipt=>{if(receipt.recorded&&data.kind==='test'&&alive.current)setTestState('received');}).catch(()=>{});void refreshRef.current();
   if(open)router.push(route);
  }
  const incoming=Notifications.addNotificationReceivedListener(n=>received(n,false));
  const response=Notifications.addNotificationResponseReceivedListener(r=>received(r.notification,true));
  void Notifications.getLastNotificationResponseAsync().then(r=>{if(alive.current&&r){received(r.notification,true);void Notifications.clearLastNotificationResponseAsync();}}).catch(()=>{});
  return()=>{alive.current=false;queue.dispose();unregister();app.remove();token.remove();incoming.remove();response.remove();};
 },[owner,queue,register]);
 useEffect(()=>{if(!sessionBusy){queue.resume();void register(false).catch(()=>{});}},[sessionBusy,queue,register]);
 async function enable(){if(busy)return;setBusy(true);setError(false);try{await register(true);}catch{setError(true);}finally{if(alive.current)setBusy(false);}}
 async function disable(){if(busy)return;setBusy(true);setError(false);try{await queue.run(async()=>{const id=await installation();await driverApi.pushRegistration(owner,id,false);registered.current=false;await SecureStore.setItemAsync(optInKey,'0');await Notifications.dismissAllNotificationsAsync();if(alive.current)setEnabled(false);});}catch{setError(true);}finally{if(alive.current)setBusy(false);}}
 async function test(){if(busy||!enabled)return;setBusy(true);setError(false);try{const result=await driverApi.pushTest(owner,await installation());if(typeof result.job_id!=='string')throw Error('Test unavailable');if(alive.current)setTestState('queued');}catch{setError(true);}finally{if(alive.current)setBusy(false);}}
 return {enabled,busy,error,enable,disable,test,testState,supported:Platform.OS==='android'};
}
export function PushProvider({children}:{children:React.ReactNode}){const state=usePushState();return <Context.Provider value={state}>{children}</Context.Provider>;}
export function usePush(){const value=useContext(Context);if(!value)throw Error('Push provider required');return value;}
