import {useShifts} from './shift-state';
import {nativeShiftCopy} from './shift-copy';
import React,{useState} from 'react';
import {Alert} from 'react-native';
import {router} from 'expo-router';
import {useSession,useTrip} from './session';
import {usePreferences} from './preferences';
import {Button,Card,Choice,Field,Label,Notice,Row,Screen} from './ui';
import DriverMap from '../DriverMap';
import ActiveTripMap from './ActiveTripMap';
import AddressField from './AddressField';
import {ClassicDisplay,FareControls,useClassicFare,type FarePreview} from './ClassicFare';
import {shareReceipt} from './receipt';
import TripProof from './TripProof';
import {receiptProof} from '../trip-proof';
export default function ActiveTrip(){const s=useSession(),c=useTrip(),shift=useShifts();const {t,language}=usePreferences();const [invoiceBusy,setInvoiceBusy]=useState(false),[invoiceError,setInvoiceError]=useState(false),[showVehicles,setShowVehicles]=useState(false);const disabled=!c.ready||c.busy||s.busy;const canStart=c.pending===0&&shift.ready&&!shift.pending&&!!shift.active&&['available','driving_empty'].includes(shift.active.work_status)&&shift.active.vehicle_id===s.profile!.driver.current_vehicle_id;
 const [preview,setPreview]=useState<FarePreview|null>(null);
 const [adjusted,setAdjusted]=useState<{key:string;value:string}|null>(null);
 const fare=useClassicFare(Number(s.profile!.driver.company_id),canStart&&!c.trip&&c.platform==='INTERNAL',preview,c.startSelection,c.endSelection);
 const effectivePrice=c.price.trim()?Number(c.price.replace(',','.')):fare.quote?.price??0;
 const finalValue=c.trip&&adjusted?.key===c.trip.key?adjusted.value:'';
 const finalPrice=finalValue.trim()?Number(finalValue.replace(',','.')):c.trip?.proposedPrice;
 const time=`${Math.floor(c.seconds/3600).toString().padStart(2,'0')}:${Math.floor(c.seconds/60%60).toString().padStart(2,'0')}:${(c.seconds%60).toString().padStart(2,'0')}`;
 const confirmEnd=()=>Alert.alert(t('endTitle'),t('endNote'),[{text:t('cancel'),style:'cancel'},{text:t('confirm'),style:'destructive',onPress:()=>{void c.end(finalPrice);}}]);
 async function invoice(){if(!c.receipt||invoiceBusy)return;setInvoiceBusy(true);setInvoiceError(false);try{await shareReceipt(s.profile!.driver.id,c.receipt.id);}catch{setInvoiceError(true);}finally{setInvoiceBusy(false);}}
 if(c.trip)return <ActiveTripMap key={c.trip.key} trip={c.trip} position={s.position} clock={time} fare={finalPrice} fareInput={finalValue}
  onFareInput={value=>setAdjusted({key:c.trip!.key,value})} onEnd={confirmEnd}
  endDisabled={s.busy||!Number.isFinite(finalPrice)||Number(finalPrice)<=0||Number(finalPrice)>100000}
  busy={c.busy} background={c.background} departure={c.chironDeparture} error={c.error?(language==='ar'?c.error:t('error')):''}/>;
 return <Screen title={t('newTrip')}>
 {c.receipt&&!c.trip&&<Card><ClassicDisplay state="À PAYER" amount={c.receipt.price} agreed/><TripProof tripId={c.receipt.id} chiron={receiptProof(c.receipt)}/><Button label={t('invoice')} icon="share-outline" busy={invoiceBusy} onPress={()=>void invoice()}/><Label muted size={12}>{t('invoiceNote')}</Label>{invoiceError&&<Notice error>{t('invoiceError')}</Notice>}<Button secondary label={t('trips')} onPress={()=>router.push('/trips')}/></Card>}
 {!!c.error&&<Notice error>{language==='ar'?c.error:t('error')}</Notice>}
 {!c.trip&&!canStart&&<Card><Notice>{nativeShiftCopy[language].selectVehicle} · {nativeShiftCopy[language].start}</Notice><Button label={nativeShiftCopy[language].title} onPress={()=>router.push('/')}/></Card>}
 {!c.trip&&canStart&&<><Card><Row style={{flexWrap:'wrap'}}>{(['INTERNAL','UBER','BOLT','HEETCH'] as const).map(platform=><Choice key={platform} label={platform==='INTERNAL'?t('meter'):platform==='HEETCH'?'Heetch':platform==='UBER'?'Uber':'Bolt'} selected={c.platform===platform} onPress={()=>{if(!disabled)c.setPlatform(platform);}}/>)}</Row>{c.platform!=='INTERNAL'&&<><Notice>{t('platformNote')}</Notice><Field label={t('reference')} maxLength={100} value={c.externalReference} onChangeText={c.setExternalReference} editable={!disabled}/></>}{c.platform==='INTERNAL'&&<FareControls fare={fare}/>}<Notice>{t('addressPrivacy')}</Notice><AddressField locatePickup label={t('from')} value={c.startAddress} onChange={c.setStartAddress} onSelect={c.selectStart} selected={c.startSelection} position={s.position} disabled={disabled}/><AddressField label={t('to')} value={c.endAddress} onChange={c.setEndAddress} onSelect={c.selectEnd} selected={c.endSelection} position={s.position} disabled={disabled}/><Field label={t('price')} placeholder={fare.quote?.price?.toFixed(2)} value={c.price} onChangeText={c.setPrice} keyboardType="decimal-pad" editable={!disabled}/><Label muted size={13}>{t('payment')}</Label><Row>{(['card','cash'] as const).map(payment=><Choice key={payment} label={t(payment)} selected={c.payment===payment} onPress={()=>{if(!disabled)c.setPayment(payment);}}/>)}</Row><Button label={t('start')} icon="navigate" busy={c.busy} disabled={!c.ready||s.busy||!s.profile!.driver.current_vehicle_id||!c.startAddress.trim()||!c.endAddress.trim()||!Number.isFinite(effectivePrice)||effectivePrice<=0||effectivePrice>100000||fare.loading} onPress={()=>void c.start(fare.quote,fare.code,shift.active)}/></Card>
 <Card><Label bold size={18}>{t('vehicle')}</Label><Label>{c.vehicles?.find(v=>v.id===s.profile!.driver.current_vehicle_id)?.plate_number??t('noVehicle')}</Label><Button secondary label={t('vehicleLoading')} busy={c.busy} disabled={disabled||c.pending>0} onPress={()=>{setShowVehicles(true);void c.changeVehicle();}}/>{c.pending>0&&<Notice>{t('syncFirst')}</Notice>}{showVehicles&&c.vehicles?.map(v=><Button key={v.id} secondary label={`${v.id===s.profile!.driver.current_vehicle_id?'✓ ':''}${v.plate_number} · ${[v.brand,v.model].filter(Boolean).join(' ')}`} disabled={disabled||c.pending>0} onPress={()=>void c.changeVehicle(v.id)}/>)}</Card><DriverMap autoPreview showLocate={false} onPreview={setPreview} position={s.position} previewStart={c.startSelection} initialDestination={c.endSelection} onDestinationChange={point=>c.selectEnd({...point,label:`${point.lat.toFixed(5)}, ${point.lon.toFixed(5)}`})}/></>}
 {c.pending>0&&<Card><TripProof queued={c.pending}/><Button label={t('retry')} busy={c.busy} disabled={s.busy} onPress={()=>void c.retrySync()}/></Card>}
 <Label muted size={11}>{t('locationNote')}</Label>
 </Screen>;}
