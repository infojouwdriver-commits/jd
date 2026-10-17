import React,{useEffect,useState} from 'react';
import {AppState,Text,View} from 'react-native';
import Animated,{FadeIn} from 'react-native-reanimated';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg,{Circle,Path} from 'react-native-svg';
import {usePreferences} from './preferences';
import {design} from './tokens';

export function JourneyMark(){const {colors}=usePreferences();return <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{width:'100%',height:100}}><Svg width="100%" height="100" viewBox="0 0 300 100"><Path d="M4 76H74Q100 76 100 50V43Q100 20 126 20H292" stroke={colors.artRoad} strokeWidth="20" strokeLinecap="round" fill="none"/><Path d="M4 76H74Q100 76 100 50V43Q100 20 126 20H292" stroke={colors.accent} strokeWidth="2.5" strokeLinecap="round" fill="none"/><Circle cx="8" cy="76" r="5" fill={colors.hero} stroke={colors.heroMuted} strokeWidth="2"/><Circle cx="288" cy="20" r="12" fill={colors.accent} opacity=".15"/><Circle cx="288" cy="20" r="4" fill={colors.accent}/></Svg></View>;}
export function WelcomeHeader(){const {t,colors,rtl,animate}=usePreferences();return <Animated.View entering={animate?FadeIn.duration(280):undefined} style={{padding:24,gap:13,borderRadius:design.radius.card,backgroundColor:colors.hero,borderWidth:1,borderColor:colors.artRoad}}><Text style={{color:colors.accent,fontFamily:design.font.body,fontSize:14,fontWeight:'800',letterSpacing:2,textAlign:rtl?'right':'left'}}>JOUW DRIVER</Text><Text style={{fontFamily:design.font.body,fontSize:32,fontWeight:'700',lineHeight:46,color:colors.heroText,textAlign:rtl?'right':'left'}}>{t('welcomeTitle')}</Text><Text style={{fontFamily:design.font.body,fontSize:14,lineHeight:23,color:colors.heroMuted,textAlign:rtl?'right':'left'}}>{t('welcomeNote')}</Text><JourneyMark/></Animated.View>;}
export function JourneyLoading({label,fullScreen=false}:{label:string;fullScreen?:boolean}){
 const {t,colors,animate}=usePreferences();const [foreground,setForeground]=useState(AppState.currentState!=='background');
 useEffect(()=>{const sub=AppState.addEventListener('change',state=>setForeground(state==='active'));return()=>sub.remove();},[]);
 const content=<View testID={fullScreen?'startup-screen':'journey-loading'} accessibilityRole="progressbar" accessibilityLabel={label} accessibilityState={{busy:true}} accessibilityLiveRegion="polite" style={{alignItems:'center',justifyContent:'center',gap:16,minHeight:96,padding:16}}>
 {fullScreen&&<View style={{width:'100%',maxWidth:400,gap:32,marginBottom:28}}><WelcomeHeader/></View>}
 <Text style={{fontFamily:design.font.body,fontSize:fullScreen?18:13,fontWeight:fullScreen?'700':'400',lineHeight:28,textAlign:'center',color:colors.text}}>{label}</Text>
 <View accessible={false} style={{height:4,width:184,borderRadius:4,backgroundColor:colors.line,overflow:'hidden'}}><Animated.View testID="loading-beam" style={{width:52,height:4,borderRadius:4,backgroundColor:colors.icon,transform:[{translateX:66}],animationName:animate&&foreground?{from:{transform:[{translateX:-52}],opacity:.35},'50%':{opacity:1},to:{transform:[{translateX:184}],opacity:.35}}:undefined,animationDuration:1800,animationIterationCount:'infinite',animationTimingFunction:'linear'}}/></View>
 {fullScreen&&<><Text style={{fontFamily:design.font.body,fontSize:13,lineHeight:23,textAlign:'center',color:colors.muted}}>{t('openingNote')}</Text><Text style={{fontFamily:design.font.body,fontSize:11,lineHeight:20,textAlign:'center',color:colors.muted,marginTop:28}}>{t('version')}</Text></>}
 </View>;
 return fullScreen?<SafeAreaView style={{flex:1,backgroundColor:colors.bg,justifyContent:'center'}}>{content}</SafeAreaView>:content;
}
