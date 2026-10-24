import {ShiftProvider} from './shift-state';
import {companyRegistrationUrl} from '../app-origin';
import {apiConnectionKey} from '../api';
import React,{createContext,useCallback,useContext,useEffect,useRef,useState} from 'react';
import {Linking,View} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {driverApi,ApiError,type DriverProfile} from '../api';
import {createActionGate} from '../action-gate';
import {assertNativeCryptoReady} from '../native-crypto-preflight';
import {recordNativeCryptoResult} from '../native-smoke-result';
import {stopFleetPublishing} from '../native-fleet-runtime';
import FleetLocation from '../FleetLocation';
import {stopPushRuntime} from '../push-lifecycle';
import {useTripController} from '../useTripController';
import type {MeterPoint} from '../trip-meter';
import {usePreferences} from './preferences';
import {clearReceiptCache} from './receipt';
import {Button,Card,Field,Label,Notice,Screen} from './ui';
import {JourneyLoading,WelcomeHeader} from './JourneyLoading';
import WelcomeScreen,{useWelcomeSettings} from './WelcomeScreen';
const Context=createContext<ReturnType<typeof useSessionState>|null>(null);
function useSessionState(){
 const [actionGate]=useState(createActionGate);const fleetStop=useRef<(()=>Promise<void>)|null>(null);
 const registerFleetStop=useCallback((stop:(()=>Promise<void>)|null)=>{fleetStop.current=stop;},[]);
 const [profile,setProfile]=useState<DriverProfile|null>(null),[busy,setBusy]=useState(true),[error,setError]=useState(''),[blockLogout,setBlockLogout]=useState(true),[position,setPosition]=useState<MeterPoint|null>(null),[fleetGeneration,setFleetGeneration]=useState(0);
 useEffect(()=>{let disposed=false;clearReceiptCache();assertNativeCryptoReady().then(()=>{void recordNativeCryptoResult('passed').catch(()=>{});}).catch(()=>{void recordNativeCryptoResult('failed').catch(()=>{});if(!disposed)setError('security');});driverApi.profile().then(value=>{if(!disposed)setProfile(value);}).catch(e=>{if(!disposed&&(!(e instanceof ApiError)||e.status!==401))setError(apiConnectionKey(e));}).finally(()=>{if(!disposed)setBusy(false);});return()=>{disposed=true;};},[]);
 async function login(identity:string,password:string,otp:string){if(busy)return;setBusy(true);setError('');try{setProfile(await driverApi.login(identity,password,otp));}catch(e){setError(apiConnectionKey(e));}finally{setBusy(false);}}
 async function logout(){if(blockLogout||!actionGate.acquire())return;setBusy(true);setError('');try{await fleetStop.current?.();if(profile)await stopFleetPublishing(profile.driver.id);await driverApi.clearFleet();await stopPushRuntime();await driverApi.logout();clearReceiptCache();setProfile(null);setPosition(null);}catch{setFleetGeneration(v=>v+1);setError('requestTransport');}finally{setBusy(false);actionGate.release();}}
 async function accountChanged(){try{await stopPushRuntime().catch(()=>{});await fleetStop.current?.();if(profile)await stopFleetPublishing(profile.driver.id);}finally{clearReceiptCache();setProfile(null);setPosition(null);}}
 return {profile,setProfile,busy,error,login,logout,accountChanged,blockLogout,setBlockLogout,actionGate,position,setPosition,registerFleetStop,fleetGeneration};
}
export function useSession(){const value=useContext(Context);if(!value)throw Error('Session required');return value;}
const TripContext=createContext<ReturnType<typeof useTripController>|null>(null);
export function useTrip(){const value=useContext(TripContext);if(!value)throw Error('Trip runtime required');return value;}
function TripRuntime({children}:{children:React.ReactNode}){const s=useSession();const trip=useTripController({profile:s.profile!,onProfile:s.setProfile,sessionBusy:s.busy,actionGate:s.actionGate,onBlockLogout:s.setBlockLogout,onLocation:s.setPosition});return <TripContext.Provider value={trip}><FleetLocation key={s.fleetGeneration} owner={s.profile!.driver.id} registerStop={s.registerFleetStop} onLocation={s.setPosition} compact/><ShiftProvider>{children}</ShiftProvider></TripContext.Provider>;}
function Login(){const s=useSession();const {t,colors,language}=usePreferences();const [registrationError,setRegistrationError]=useState(false);const [identity,setIdentity]=useState(''),[password,setPassword]=useState(''),[otp,setOtp]=useState('');return <Screen><WelcomeHeader/><Label muted>{t('loginNote')}</Label><Card><Field label={t('identity')} value={identity} onChangeText={setIdentity} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="username" editable={!s.busy}/><Field label={t('password')} value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" editable={!s.busy}/>{identity.includes('@')&&<Field label={t('otp')} value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} autoComplete="one-time-code" editable={!s.busy}/>}<Button label={t('login')} icon="arrow-forward" disabled={!identity.trim()||!password} busy={s.busy} onPress={()=>{void s.login(identity,password,otp).finally(()=>{setPassword('');setOtp('');});}}/></Card><Button secondary label={t('registerCompany')} icon="business-outline" disabled={s.busy} onPress={()=>{setRegistrationError(false);void Linking.openURL(companyRegistrationUrl(language)).catch(()=>setRegistrationError(true));}}/>{registrationError&&<Notice error>{t('error')}</Notice>}{!!s.error&&<Notice error>{t(s.error==='security'?'securityError':s.error as 'error')}</Notice>}<Label center muted size={11}>{t('version')}</Label><View style={{height:5,backgroundColor:colors.accent,borderRadius:4,width:45,alignSelf:'center'}}/></Screen>;}
export function SessionProvider({children}:{children:React.ReactNode}){const s=useSessionState();const {loaded,t,isDark}=usePreferences();const welcome=useWelcomeSettings();const [welcomed,setWelcomed]=useState(false);const showWelcome=!s.profile&&!welcomed&&welcome.enabled;return <Context.Provider value={s}><StatusBar style={showWelcome||isDark?'light':'dark'}/>{!loaded||s.busy&&!s.profile?<JourneyLoading fullScreen label={t('openingSession')}/>:s.profile?<TripRuntime key={s.profile.driver.id}>{children}</TripRuntime>:showWelcome?<WelcomeScreen settings={welcome} onContinue={()=>setWelcomed(true)}/>:<Login/>}</Context.Provider>;}
