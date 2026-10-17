import React,{createContext,useContext,useEffect} from 'react';
import {Platform} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import {driverApi} from '../api';
import {pausePushInstallation} from '../push-pause';
import {useSession} from './session';
// Phone push is paused for 0.2.7. In-app messages/notifications remain independent.
// Do not request permissions, acquire an FCM token or restore registration.
Notifications.setNotificationHandler({handleNotification:async()=>({shouldPlaySound:false,shouldSetBadge:false,shouldShowBanner:false,shouldShowList:false})});
const paused={enabled:false,busy:false,error:false,testState:'idle' as const,supported:false,paused:true,enable:async()=>{},disable:async()=>{},test:async()=>{}};
const Context=createContext<typeof paused|null>(null);
export function PushProvider({children}:{children:React.ReactNode}){
 const {profile}=useSession();const owner=profile!.driver.id;
 useEffect(()=>{
  if(Platform.OS!=='android')return;
  // Persist opt-out before the best-effort server revocation. A failed revocation
  // never blocks startup, trip/report requests or logout, and never reports offline.
  void pausePushInstallation({get:SecureStore.getItemAsync,set:SecureStore.setItemAsync},id=>driverApi.pushRegistration(owner,id,false)).catch(()=>{});
 },[owner]);
 return <Context.Provider value={paused}>{children}</Context.Provider>;
}
export function usePush(){const value=useContext(Context);if(!value)throw Error('Push provider required');return value;}
