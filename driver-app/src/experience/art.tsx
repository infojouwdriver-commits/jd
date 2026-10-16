import React,{useState} from 'react';
import {Animated,View} from 'react-native';
import Svg,{Circle,Defs,LinearGradient,Path,Rect,Stop} from 'react-native-svg';
import {usePreferences} from './preferences';
import {useRouteMotion} from './motion';
export function RoadArt(){
 const {colors}=usePreferences();const progress=useRouteMotion();const [width,setWidth]=useState(320);const ratio=width/320;
 return <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" onLayout={event=>setWidth(event.nativeEvent.layout.width)} style={{height:164,overflow:'hidden',borderRadius:18,backgroundColor:colors.hero}}>
 <Svg width="100%" height="164" viewBox="0 0 320 164" preserveAspectRatio="none">
 <Path d="M0 29H320M0 89H320M0 149H320M50 0V164M170 0V164M230 0V164M290 0V164" stroke={colors.artRoad} strokeWidth="1" opacity=".6"/>
 <Rect x="12" y="42" width="70" height="32" rx="8" fill={colors.artRoad} opacity=".6"/><Rect x="132" y="100" width="72" height="32" rx="8" fill={colors.artRoad} opacity=".55"/><Rect x="248" y="103" width="54" height="46" rx="9" fill={colors.artRoad} opacity=".4"/>
 <Path d="M32 120H92Q110 120 110 102V72Q110 54 128 54H286" stroke={colors.artRoad} strokeWidth="22" fill="none" strokeLinecap="round"/>
 <Path d="M32 120H92Q110 120 110 102V72Q110 54 128 54H286" stroke={colors.accent} strokeWidth="3" fill="none" strokeLinecap="round" opacity=".9"/>
 <Circle cx="32" cy="120" r="6" fill={colors.hero} stroke={colors.heroMuted} strokeWidth="3"/>
 <Circle cx="286" cy="54" r="15" fill={colors.accent} opacity=".14"/><Circle cx="286" cy="54" r="5" fill={colors.accent}/>
 </Svg>
 <Animated.View testID="route-vehicle" style={{opacity:progress.interpolate({inputRange:[0,.03,.95,1],outputRange:[0,1,1,0]}),position:'absolute',left:0,top:0,transform:[{translateX:progress.interpolate({inputRange:[0,.2,.3,.45,.55,1],outputRange:[32,92,110,110,128,286].map(x=>x*ratio-16)})},{translateY:progress.interpolate({inputRange:[0,.2,.3,.45,.55,1],outputRange:[110,110,92,62,44,44]})},{rotate:progress.interpolate({inputRange:[0,.2,.3,.45,.55,1],outputRange:['0deg','0deg','-90deg','-90deg','0deg','0deg']})}]}}>
 <Svg width="32" height="20" viewBox="0 0 32 20"><Rect x="1" y="1" width="30" height="18" rx="6" fill={colors.heroText}/><Rect x="10" y="3" width="13" height="14" rx="3" fill={colors.hero}/><Path d="M26 4V16" stroke={colors.accent} strokeWidth="2"/></Svg>
 </Animated.View></View>;
}
export function VehicleArt(){return <Svg accessible={false} width="100%" height="120" viewBox="0 0 320 120"><Defs><LinearGradient id="body" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#C1CCD4"/><Stop offset=".5" stopColor="#71818F"/><Stop offset="1" stopColor="#334451"/></LinearGradient></Defs><Path d="M25 94Q160 107 295 94" stroke="#617583" strokeWidth="8" opacity=".15"/><Path d="M27 76L39 58 89 50 123 23Q137 17 161 20L211 25 245 52 282 59 296 79 293 91 25 91Z" fill="url(#body)"/><Path d="M103 49L129 28 157 27 157 50ZM165 28L206 31 230 51 165 50Z" fill="#172B3B"/><Path d="M38 62L68 60 62 69 32 72ZM271 62L286 66 291 73 272 70" fill="#E8F5EF"/><Path d="M78 58H251M162 55V82" stroke="#CED7DD" strokeWidth="1" opacity=".6"/><Circle cx="81" cy="88" r="19" fill="#101B25"/><Circle cx="81" cy="88" r="11" fill="#9BA9B4"/><Circle cx="81" cy="88" r="4" fill="#34434F"/><Circle cx="248" cy="88" r="19" fill="#101B25"/><Circle cx="248" cy="88" r="11" fill="#9BA9B4"/><Circle cx="248" cy="88" r="4" fill="#34434F"/></Svg>;}
