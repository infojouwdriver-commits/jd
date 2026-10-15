import React,{createContext,useContext,useEffect,useRef,useState} from 'react';
import {AccessibilityInfo,useColorScheme} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {copy,type Language,type CopyKey} from './copy';
type Preferences={language:Language;theme:'dark'|'light'|'system';motion:boolean};
const defaults:Preferences={language:'ar',theme:'dark',motion:true};
const dark={bg:'#0C141D',surface:'#16222E',raised:'#1E2D3B',text:'#F5F8FA',muted:'#A0B2C2',line:'#2A3A49',accent:'#B6EF62',accentText:'#172413',danger:'#FF9D98',dangerBg:'#3C2328'};
const light={bg:'#F3F6F2',surface:'#FFFFFF',raised:'#E8EFE6',text:'#14241E',muted:'#53665E',line:'#D6E0D5',accent:'#B6EF62',accentText:'#172413',danger:'#9E2D32',dangerBg:'#FFE9E7'};
function usePreferencesState(){
 const [value,setValue]=useState(defaults),[loaded,setLoaded]=useState(false),[error,setError]=useState(false),[reduce,setReduce]=useState(true);
 const latest=useRef(value),queue=useRef(Promise.resolve());const scheme=useColorScheme();
 useEffect(()=>{let alive=true;SecureStore.getItemAsync('jd-ui-preferences-v1').then(raw=>{if(!alive||!raw)return;const v=JSON.parse(raw);const next:Preferences={language:['ar','en','fr','nl'].includes(v.language)?v.language:'ar',theme:['dark','light','system'].includes(v.theme)?v.theme:'dark',motion:v.motion!==false};latest.current=next;setValue(next);}).catch(()=>{if(alive)setError(true);}).finally(()=>{if(alive)setLoaded(true);});AccessibilityInfo.isReduceMotionEnabled().then(v=>{if(alive)setReduce(v);}).catch(()=>{});const sub=AccessibilityInfo.addEventListener('reduceMotionChanged',setReduce);return()=>{alive=false;sub.remove();};},[]);
 function update(patch:Partial<Preferences>){if(!loaded)return;const next={...latest.current,...patch};latest.current=next;setValue(next);setError(false);queue.current=queue.current.catch(()=>{}).then(()=>SecureStore.setItemAsync('jd-ui-preferences-v1',JSON.stringify(next))).catch(()=>{setError(true);});}
 const isDark=value.theme==='dark'||value.theme==='system'&&scheme!=='light';
 return {...value,loaded,error,update,isDark,colors:isDark?dark:light,animate:value.motion&&!reduce,rtl:value.language==='ar',t:(key:CopyKey):string=>copy[value.language][key],locale:value.language==='ar'?'ar-BE':`${value.language}-BE`};
}
const Context=createContext<ReturnType<typeof usePreferencesState>|null>(null);
export function PreferencesProvider({children}:{children:React.ReactNode}){const prefs=usePreferencesState();return <Context.Provider value={prefs}>{children}</Context.Provider>;}
export function usePreferences(){const prefs=useContext(Context);if(!prefs)throw Error('Preferences provider required');return prefs;}
