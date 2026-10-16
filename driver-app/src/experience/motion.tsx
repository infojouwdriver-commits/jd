import React,{useCallback,useEffect,useState} from 'react';
import {Animated,AppState,Easing} from 'react-native';
import {useFocusEffect} from 'expo-router';
import {usePreferences} from './preferences';
import {design} from './tokens';

export function Entrance({children,index=0}:{children:React.ReactNode;index?:number}){
 const {animate}=usePreferences();
 const [progress]=useState(()=>new Animated.Value(1));
 useEffect(()=>{
  progress.stopAnimation();
  if(!animate){progress.setValue(1);return;}
  progress.setValue(0);
  const animation=Animated.timing(progress,{toValue:1,duration:design.motion.enter,delay:Math.min(index*design.motion.stagger,180),easing:Easing.out(Easing.cubic),useNativeDriver:true,isInteraction:false});
  animation.start();return()=>animation.stop();
 },[animate,index,progress]);
 return <Animated.View style={{opacity:progress,transform:[{translateY:progress.interpolate({inputRange:[0,1],outputRange:[12,0]})}]}}>{children}</Animated.View>;
}

// Ambient art is decorative: never run it on a hidden tab or in the background.
export function useRouteMotion(){
 const {animate}=usePreferences();const [focused,setFocused]=useState(false),[foreground,setForeground]=useState(AppState.currentState==='active');
 const [progress]=useState(()=>new Animated.Value(.4));
 useFocusEffect(useCallback(()=>{setFocused(true);return()=>setFocused(false);},[]));
 useEffect(()=>{const sub=AppState.addEventListener('change',value=>setForeground(value==='active'));return()=>sub.remove();},[]);
 useEffect(()=>{
  progress.stopAnimation();
  if(!animate||!focused||!foreground){progress.setValue(.4);return;}
  progress.setValue(0);
  const animation=Animated.loop(Animated.sequence([Animated.timing(progress,{toValue:1,duration:design.motion.route,easing:Easing.inOut(Easing.quad),useNativeDriver:true,isInteraction:false}),Animated.delay(800)]));
  animation.start();return()=>animation.stop();
 },[animate,focused,foreground,progress]);
 return progress;
}
