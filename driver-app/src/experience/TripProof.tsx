import React from 'react';
import {View} from 'react-native';
import type {ChironProof} from '../trip-proof';
import {usePreferences} from './preferences';
import {Icon,Label,Row,type IconName} from './ui';

export const tripProofCopy = {
 ar:{title:'إثبات الرحلة',hide:'إخفاء حالة الرحلة',saved:'محفوظة على الهاتف',queued:'بانتظار تأكيد النظام',queuedNote:'يمكنك إعادة محاولة المزامنة عند توفر الاتصال.',server:'أكد النظام حفظ الرحلة',government:'حالة Chiron',production:'أكد Chiron الرحلة',test:'أكد Chiron الرحلة في بيئة الاختبار',pending:'بانتظار تأكيد Chiron',review:'تحتاج متابعة من الإدارة',unconfirmed:'لا يوجد تأكيد متاح',waiting:'يظهر التأكيد هنا بعد المزامنة.',refresh:'حدّث سجل الرحلات للاطّلاع على آخر حالة.'},
 fr:{title:'Preuve de la course',hide:'Masquer le statut',saved:'Enregistrée sur le téléphone',queued:'En attente de confirmation du système',queuedNote:'Réessayez la synchronisation dès que la connexion est disponible.',server:'Enregistrement confirmé par le système',government:'Statut Chiron',production:'Course confirmée par Chiron',test:'Course confirmée en environnement de test',pending:'En attente de confirmation Chiron',review:'Suivi par l’administration nécessaire',unconfirmed:'Aucune confirmation disponible',waiting:'La confirmation s’affichera après la synchronisation.',refresh:'Actualisez l’historique pour consulter le dernier statut.'},
 nl:{title:'Ritbewijsstatus',hide:'Status verbergen',saved:'Opgeslagen op de telefoon',queued:'Wacht op bevestiging van het systeem',queuedNote:'Probeer opnieuw te synchroniseren zodra er verbinding is.',server:'Registratie bevestigd door het systeem',government:'Chiron-status',production:'Rit bevestigd door Chiron',test:'Rit bevestigd in de testomgeving',pending:'Wacht op bevestiging van Chiron',review:'Opvolging door de administratie nodig',unconfirmed:'Geen bevestiging beschikbaar',waiting:'De bevestiging verschijnt na synchronisatie.',refresh:'Vernieuw het ritoverzicht voor de laatste status.'},
 en:{title:'Trip proof',hide:'Hide trip status',saved:'Saved on this phone',queued:'Waiting for system confirmation',queuedNote:'Retry sync when you have a connection.',server:'Trip storage confirmed by the system',government:'Chiron status',production:'Trip confirmed by Chiron',test:'Trip confirmed in the Chiron test environment',pending:'Waiting for Chiron confirmation',review:'Administration follow-up needed',unconfirmed:'No confirmation available',waiting:'Confirmation appears after sync.',refresh:'Refresh trip history to check the latest status.'},
} as const;

type Props = {tripId:number;chiron:ChironProof} | {queued:number};

export default function TripProof(props:Props){
  const {language,colors}=usePreferences();
  const copy=tripProofCopy[language];
  const queued='queued' in props;
  const confirmed=!queued&&(props.chiron==='production'||props.chiron==='test');
  const needsReview=!queued&&props.chiron==='review';
  const rows:{icon:IconName;text:string;detail?:string}[]=queued?[
    {icon:'phone-portrait-outline',text:`${copy.saved} · ${props.queued}`},
    {icon:'cloud-upload-outline',text:copy.queued,detail:copy.queuedNote},
    {icon:'shield-outline',text:copy.government,detail:copy.waiting},
  ]:[
    {icon:'cloud-done-outline',text:copy.server,detail:`#${props.tripId}`},
    {icon:confirmed?'shield-checkmark-outline':needsReview?'alert-circle-outline':'time-outline',
     text:copy.government,detail:copy[props.chiron]},
  ];
  return <View style={{backgroundColor:colors.bg,borderRadius:12,padding:14,gap:12}} accessibilityLiveRegion="polite">
    <Label bold size={16}>{copy.title}</Label>
    {rows.map(row=><Row key={row.icon} style={{alignItems:'flex-start',gap:10}}>
      <Icon name={row.icon} size={20} color={colors.icon}/>
      <View style={{flex:1,gap:2}}><Label size={14} bold>{row.text}</Label>
        {!!row.detail&&<Label muted size={13}>{row.detail}</Label>}
      </View>
    </Row>)}
    {!queued&&!confirmed&&!needsReview&&<Label muted size={12}>{copy.refresh}</Label>}
  </View>;
}
