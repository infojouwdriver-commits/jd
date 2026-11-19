import React from 'react';
import {View} from 'react-native';
import type {RevenueSummary} from '../api';
import {estimateDriverBalance} from '../driver-balance';
import {usePreferences} from './preferences';
import {Card,Icon,Label,Row} from './ui';

const copy = {
 ar:{title:'رصيد الرحلات التقديري',gross:'إجمالي الرحلات المسجّلة',share:'حصة السائق (45%)',cash:'النقد المقبوض المخصوم',note:'يشمل الرحلات المسجّلة في الفترة المحددة. المصاريف ورسوم المطار والتسويات السابقة خارج هذا التقدير.'},
 fr:{title:'Solde estimé des courses',gross:'Total des courses enregistrées',share:'Part chauffeur (45 %)',cash:'Espèces encaissées et déduites',note:'Sur la base des courses enregistrées pour la période. Hors frais, frais aéroport et règlements précédents.'},
 nl:{title:'Geschat ritsaldo',gross:'Totaal geregistreerde ritten',share:'Chauffeursaandeel (45%)',cash:'Ontvangen contant afgetrokken',note:'Op basis van de geregistreerde ritten in de gekozen periode. Exclusief kosten, luchthavenkosten en eerdere afrekeningen.'},
 en:{title:'Estimated trip balance',gross:'Total recorded trips',share:'Driver share (45%)',cash:'Cash collected and deducted',note:'Based on recorded trips in the selected period. Excludes expenses, airport fees and previous settlements.'},
} as const;

export default function DriverBalanceEstimate({summary,money}:{summary:RevenueSummary;money:(value:number)=>string}) {
  const {language,colors}=usePreferences();
  const labels=copy[language];
  const balance=estimateDriverBalance(summary);
  return <Card>
    <Row style={{alignItems:'flex-start',justifyContent:'space-between'}}>
      <Row style={{flex:1,gap:8}}><Icon name="calculator-outline" color={colors.icon}/><Label bold>{labels.title}</Label></Row>
      <Label bold numeric size={22} color={balance.balance<0?colors.danger:colors.text}>{money(balance.balance)}</Label>
    </Row>
    <View style={{borderTopWidth:1,borderColor:colors.line,paddingTop:12,gap:8}}>
      {[[labels.gross,summary.total_revenue],[labels.share,balance.share],[labels.cash,balance.cash===0?0:-balance.cash]].map(([label,amount])=>
        <Row key={label} style={{justifyContent:'space-between'}}>
          <Label muted size={13}>{label}</Label><Label numeric size={14}>{money(Number(amount))}</Label>
        </Row>)}
    </View>
    <Label muted size={12}>{labels.note}</Label>
  </Card>;
}
