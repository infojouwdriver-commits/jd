import React, {useRef, useState} from 'react';
import {Text} from 'react-native';
import {randomUUID} from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import {ApiError, driverApi, type AccountDeletionStatus} from '../api';
import {deletionCopy} from './deletion-copy';
import {usePreferences} from './preferences';
import {Button, Card, Field, Label, Notice} from './ui';

const recentKey = 'jd.account-deletion.recent';
const secureOptions = {keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY};

export function AccountDeletion({owner}: {owner?: number}) {
  const {language, colors, t} = usePreferences();
  const copy = deletionCopy[language];
  const [opened, setOpened] = useState(false);
  const [busy, setBusy] = useState(false);
  const operation = useRef(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [receipt, setReceipt] = useState('');
  const [status, setStatus] = useState<AccountDeletionStatus | null>(null);
  const ownerKey = 'jd.account-deletion.' + owner;

  async function run(action: () => Promise<void>) {
    if (operation.current) return;
    operation.current = true;
    setBusy(true);
    setError('');
    try { await action(); }
    catch (error) { setError(error instanceof ApiError && error.status === 403 && owner !== undefined ? copy.password : t('error')); }
    finally { operation.current = false; setBusy(false); }
  }

  async function open() {
    if (opened) {
      setOpened(false);
      setPassword('');
      setReceipt('');
      setStatus(null);
      return;
    }
    setOpened(true);
    await run(async () => {
      const saved = await SecureStore.getItemAsync(owner === undefined ? recentKey : ownerKey);
      if (owner !== undefined) {
        const request = await driverApi.accountDeletion(owner);
        setStatus(request);
        if (saved && request && await driverApi.accountDeletionStatus(saved)) setReceipt(saved);
      } else if (saved) {
        setReceipt(saved);
        setStatus(await driverApi.accountDeletionStatus(saved));
      }
    });
  }

  async function submit() {
    await run(async () => {
      if (owner === undefined) return;
      const key = (await SecureStore.getItemAsync(ownerKey)) ?? randomUUID();
      await SecureStore.setItemAsync(ownerKey, key, secureOptions);
      await SecureStore.setItemAsync(recentKey, key, secureOptions);
      try {
        setStatus(await driverApi.requestAccountDeletion(owner, {password, receipt: key, language}));
        setReceipt(key);
      } finally { setPassword(''); }
    });
  }

  async function check() {
    await run(async () => {
      const result = await driverApi.accountDeletionStatus(receipt.trim());
      setStatus(result);
      if (!result) setError(copy.unknown);
    });
  }

  return <Card>
    <Button secondary icon={owner === undefined ? 'time-outline' : 'trash-outline'}
      label={owner === undefined ? copy.track : copy.title} expanded={opened} disabled={busy} onPress={() => void open()}/>
    {opened && <>
      {status && <Notice>{status.completed_at ? copy.completed : `${copy.pending}. ${copy.due} ${new Date(status.due_at).toLocaleDateString(language)}.`}</Notice>}
      {owner !== undefined && (!status || (!status.completed_at && !receipt)) && <>
        <Label muted size={14}>{copy.details}</Label>
        <Field label={t('currentPassword')} value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" editable={!busy}/>
        <Button danger label={status ? copy.recover : copy.send} disabled={!password} busy={busy} onPress={() => void submit()}/>
      </>}
      {owner !== undefined && status && receipt && <>
        <Label muted size={14}>{copy.receipt}</Label>
        <Text selectable style={{color: colors.text, writingDirection: 'ltr'}}>{receipt}</Text>
        <Label muted size={13}>{copy.save}</Label>
        <Button secondary label={copy.refresh} busy={busy} onPress={() => void check()}/>
      </>}
      {owner === undefined && <>
        <Field label={copy.receipt} value={receipt} onChangeText={value => {setReceipt(value); setStatus(null); setError('');}}
          autoCapitalize="none" autoCorrect={false} maxLength={36} editable={!busy}/>
        <Button label={copy.refresh} disabled={receipt.trim().length !== 36} busy={busy} onPress={() => void check()}/>
      </>}
      {error && <Notice error>{error}</Notice>}
    </>}
  </Card>;
}
