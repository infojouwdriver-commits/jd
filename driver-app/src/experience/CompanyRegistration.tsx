import React, {useEffect, useRef, useState} from 'react';
import {Alert, Linking, Modal, Pressable, Text} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {randomUUID} from 'expo-crypto';
import {API_ORIGIN, ApiError, driverApi, type CompanyRegistrationReceipt} from '../api';
import {registrationCopy} from '../registration/copy';
import {blankRegistration, chironPortals, companyRegistrationSchema, registrationFields, type CompanyRegistration, type RegistrationField} from '../registration/schema';
import {SUBSCRIPTION_OFFER, subscriptionOfferCopy} from '../registration/subscription-offer';
import {usePreferences} from './preferences';
import {Button, Card, Field, Icon, IconButton, Label, Notice, Row, Screen} from './ui';

const reviewStep = registrationFields.length;
const englishOffer = {
  title: 'One-year subscription',
  price: '€50 per month, including 21% VAT',
  detail: '12 monthly instalments · €600 total. Each instalment is €41.32 excluding VAT plus €8.68 VAT.',
  ack: 'I have reviewed the price and term. I will review and sign the contract from my company account after approval.',
  note: 'No payment now. Billing starts after approval and signing. The contract does not renew automatically.',
};
const passwordField = (name: RegistrationField) => name.endsWith('_password');
const privateField = (name: RegistrationField) => passwordField(name) || name.includes('_client_');

export default function CompanyRegistrationScreen({onClose}: {onClose: () => void}) {
  const {language, colors, animate} = usePreferences();
  const t = registrationCopy[language];
  const offer = language === 'en' ? englishOffer : subscriptionOfferCopy[language];
  const [requestId] = useState(randomUUID);
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(blankRegistration);
  const [invalid, setInvalid] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [resendAt, setResendAt] = useState(0);
  const [codeSent, setCodeSent] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [busy, setBusy] = useState<'code' | 'submit' | null>(null);
  const [uncertain, setUncertain] = useState(false);
  const [receipt, setReceipt] = useState<CompanyRegistrationReceipt | null>(null);
  const inFlight = useRef(false);
  const submitted = useRef<CompanyRegistration | null>(null);

  useEffect(() => {
    if (!resendAt) return;
    const timer = setTimeout(() => setResendAt(0), Math.max(0, resendAt - Date.now()));
    return () => clearTimeout(timer);
  }, [resendAt]);

  function close() {
    if (inFlight.current) return;
    if (receipt || !Object.values(values).some(Boolean)) onClose();
    else Alert.alert(t.discardTitle, t.discardNote, [
      {text: t.stay, style: 'cancel'}, {text: t.discard, style: 'destructive', onPress: onClose},
    ]);
  }

  function draft(): CompanyRegistration {
    return {...values, request_id: requestId, language, subscription_offer: SUBSCRIPTION_OFFER, subscription_acknowledged: true};
  }

  function validate(all: boolean) {
    const result = companyRegistrationSchema.safeParse(draft());
    const issues = result.success ? [] : result.error.issues.map(issue => String(issue.path[0]));
    if (Boolean(values.chiron_prod_client_id.trim()) !== Boolean(values.chiron_prod_client_secret.trim())) {
      issues.push(values.chiron_prod_client_id.trim() ? 'chiron_prod_client_secret' : 'chiron_prod_client_id');
    }
    const fields = all ? issues : issues.filter(name => registrationFields[step]?.some(field => field === name));
    setInvalid(fields);
    if (!fields.length) return true;
    if (all) {
      const first = registrationFields.findIndex(group => group.some(field => fields.includes(field)));
      if (first >= 0) setStep(first);
    }
    setMessage(t.invalid);
    return false;
  }

  function change(name: RegistrationField, value: string) {
    setValues(current => ({...current, [name]: value}));
    setInvalid(current => current.filter(field => field !== name));
    if (name === 'company_email') {
      setEmailCode('');
      setCodeSent(false);
      setResendAt(0);
    }
  }

  async function sendCode() {
    if (inFlight.current || uncertain || Date.now() < resendAt || !validate(true)) return;
    inFlight.current = true;
    setBusy('code');
    setMessage('');
    setCodeSent(false);
    try {
      await driverApi.sendCompanyRegistrationCode({email: values.company_email.trim().toLowerCase(), request_id: requestId, language});
      setEmailCode('');
      setCodeSent(true);
      setResendAt(Date.now() + 60000);
    } catch (error) {
      setMessage(error instanceof ApiError && error.status === 429 ? t.rateLimit : t.codeError);
    } finally {
      inFlight.current = false;
      setBusy(null);
    }
  }

  async function advance() {
    if (inFlight.current) return;
    setMessage('');
    if (step < reviewStep) {
      if (validate(false)) setStep(step + 1);
      return;
    }
    if (!submitted.current && (!validate(true) || !acknowledged || !/^\d{6}$/.test(emailCode))) return;
    const body = submitted.current ?? {...draft(), email_code: emailCode};
    submitted.current = body;
    inFlight.current = true;
    setBusy('submit');
    try {
      const result = await driverApi.registerCompany(body);
      setReceipt(result);
      setValues(blankRegistration());
      setEmailCode('');
      submitted.current = null;
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 0;
      if ([400, 403, 409].includes(status) || (status === 429 && !uncertain)) submitted.current = null;
      setUncertain(submitted.current !== null);
      if (status === 403) {
        setEmailCode('');
        setCodeSent(false);
        setResendAt(0);
      }
      setMessage(status === 400 ? t.invalid : status === 403 ? t.codeError
        : status === 409 ? t.duplicate : status === 429 ? t.rateLimit : t.serverError);
    } finally {
      inFlight.current = false;
      setBusy(null);
    }
  }

  function field(name: RegistrationField) {
    const email = name === 'company_email';
    const phone = name.endsWith('_phone');
    const password = passwordField(name);
    const secret = password || name.endsWith('_client_secret');
    const hint = password ? t.passwordHint : name === 'driver_phone' ? t.phoneHint : name === 'kbo_number' ? t.kboHint : name === 'vin' ? t.vinHint : '';
    return <React.Fragment key={name}>
      <Field label={t[name]} value={values[name]} onChangeText={value => change(name, value)} editable={!busy}
        secureTextEntry={secret} keyboardType={email ? 'email-address' : phone ? 'phone-pad' : 'default'}
        autoComplete={password ? 'new-password' : email ? 'email' : phone ? 'tel' : 'off'}
        autoCapitalize={email || privateField(name) ? 'none' : name === 'vin' || name === 'plate_number' ? 'characters' : 'sentences'}
        autoCorrect={false} maxLength={password ? 72 : name === 'vin' ? 17 : secret ? 2048 : name.includes('_client_id') ? 512 : 400}/>
      {invalid.includes(name) ? <Label size={13} color={colors.danger}>{t.fieldError} {hint}</Label>
        : !!hint && <Label muted size={13}>{hint}</Label>}
    </React.Fragment>;
  }

  function openReference(url: string) {
    void Linking.openURL(url).catch(() => setMessage(t.serverError));
  }

  return <Modal animationType={animate ? "slide" : "none"} onRequestClose={close}>
    <SafeAreaProvider>
      <Screen key={receipt ? 'receipt' : step} title={receipt ? t.success : t.start} icon={receipt ? 'checkmark-circle-outline' : 'business-outline'}
        action={<IconButton label={t.close} icon="close-outline" onPress={close} disabled={!!busy}/>}>
        {receipt ? <Card>
          <Notice>{receipt.status === 'pending' ? t.successNote : receipt.status === 'approved' ? t.approved : t.rejected}</Notice>
          <Label muted size={13}>{t.reference}</Label>
          <Text selectable style={{color: colors.text, writingDirection: 'ltr'}}>{receipt.request_id}</Text>
          <Button label={t.driverLogin} onPress={onClose}/>
        </Card> : <>
          <Row><Label size={14} muted numeric>{step + 1} / {t.steps.length}</Label><Label bold size={20}>{t.steps[step]}</Label></Row>
          {step === 0 && <Label muted size={14}>{t.intro}</Label>}
          {step === 1 ? <>
            <Card>
              <Label bold>{t.testTitle}</Label>
              <Button secondary label={t.testLink} icon="open-outline" onPress={() => openReference(chironPortals.test)}/>
              {registrationFields[1].slice(0, 2).map(field)}
            </Card>
            <Card>
              <Label bold>{t.prodTitle}</Label>
              <Label muted size={13}>{t.prodNote}</Label>
              {registrationFields[1].slice(2).map(field)}
              <Label muted size={13}>{t.secretNote}</Label>
              <Button secondary label={t.guide} icon="open-outline" onPress={() => openReference(chironPortals.guide)}/>
            </Card>
          </> : step < reviewStep ? <Card>{registrationFields[step].map(field)}</Card> : <>
            <Card>
              <Label bold>{offer.title}</Label>
              <Label bold>{offer.price}</Label>
              <Label muted size={14}>{offer.detail}</Label>
              <Label muted size={14}>{offer.note}</Label>
              <Pressable accessibilityRole="checkbox" accessibilityLabel={offer.ack}
                accessibilityState={{checked: acknowledged, disabled: !!busy || uncertain}}
                disabled={!!busy || uncertain} onPress={() => setAcknowledged(value => !value)}>
                <Row style={{minHeight: 44}}><Icon name={acknowledged ? 'checkbox-outline' : 'square-outline'} color={colors.icon}/>
                  <Label size={14}>{offer.ack}</Label></Row>
              </Pressable>
            </Card>
            <Card>
              <Label bold>{t.emailCode}</Label>
              <Label direction="ltr" muted size={14}>{values.company_email}</Label>
              <Button secondary label={t.sendCode} icon="mail-outline" busy={busy === 'code'}
                disabled={!!busy || !!resendAt || uncertain} onPress={() => void sendCode()}/>
              {codeSent && <Label muted size={13}>{t.codeSent}</Label>}
              <Field label={t.emailCode} value={emailCode} onChangeText={value => setEmailCode(value.replace(/[^0-9]/g, ''))}
                maxLength={6} keyboardType="number-pad" autoComplete="one-time-code" editable={!busy && !uncertain}/>
            </Card>
            <Card>
              <Label bold>{t.steps[reviewStep]}</Label>
              {(['company_name', 'kbo_number', 'plate_number', 'driver_name'] as const).map(name =>
                <Row key={name} style={{flexWrap: 'wrap'}}>
                  <Label muted size={13}>{t[name]}</Label><Label size={14}>{values[name]}</Label>
                </Row>)}
              <Label muted size={13}>{t.reviewNote}</Label>
            </Card>
          </>}
          {!!message && <Notice error>{message}</Notice>}
          <Button label={step < reviewStep ? t.next : uncertain ? t.retry : t.submit} icon="arrow-forward" busy={busy === 'submit'}
            disabled={!!busy || (step === reviewStep && !uncertain && (!acknowledged || emailCode.length !== 6))}
            onPress={() => void advance()}/>
          {step > 0 && <Button secondary label={t.back} disabled={!!busy || uncertain}
            onPress={() => {setMessage(''); setInvalid([]); setStep(step - 1);}}/>}
          {step === reviewStep && <Button secondary label={t.privacy} icon="open-outline" onPress={() => openReference(API_ORIGIN + '/privacy-policy')}/>}
        </>}
      </Screen>
    </SafeAreaProvider>
  </Modal>;
}
