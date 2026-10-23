import React,{useState} from 'react';
import {Pressable,Share,View} from 'react-native';
import Svg,{Path,Rect} from 'react-native-svg';
import type {ShiftDetail} from '../shift-model';
import {usePreferences} from './preferences';
import {Label,Row,Notice} from './ui';
export default function ShiftDocumentQr({document}:{document:ShiftDetail['document']}) {
 const {colors,language}=usePreferences();const [failed,setFailed]=useState(false);
 if(!document)return null;
 const copy={ar:['رابط كشف الوردية','تسجيل الدخول مطلوب','تعذّرت المشاركة'],nl:['Link naar dienststaat','Aanmelden vereist','Delen mislukt'],fr:['Lien du relevé','Connexion requise','Partage impossible'],en:['Shift report link','Sign-in required','Could not share']}[language];
 const {size,modules}=document.qr;
 let path='';for(let row=0;row<size;row++)for(let col=0;col<size;col++)if(modules[row*size+col])path+=`M${col+4} ${row+4}h1v1h-1z`;
 return <View style={{gap:10}}><Pressable accessibilityRole="button" accessibilityLabel={copy[0]} onPress={()=>void Share.share({message:document.url,url:document.url,title:document.reference}).catch(()=>setFailed(true))} style={({pressed})=>({padding:16,borderRadius:18,backgroundColor:colors.raised,borderWidth:1,borderColor:colors.line,opacity:pressed?.8:1})}><Row><View accessible={false} style={{backgroundColor:'#FFFFFF',padding:0,borderRadius:12,overflow:'hidden'}}><Svg width={104} height={104} viewBox={`0 0 ${size+8} ${size+8}`}><Rect width={size+8} height={size+8} fill="#FFFFFF"/><Path d={path} fill="#000000"/></Svg></View><View style={{flex:1,gap:7}}><Label bold size={14}>{copy[0]}</Label><Label muted size={12}>{copy[1]}</Label><Label direction="ltr" numeric size={11}>{document.reference}</Label></View></Row></Pressable>{failed&&<Notice error>{copy[2]}</Notice>}</View>;
}
