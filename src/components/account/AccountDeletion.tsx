'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, ApiError } from '@/lib/api-client';
import { useLanguage } from '@/contexts/LanguageContext';

const copy = {
  ar: {title:'حذف حسابي', track:'متابعة طلب الحذف', detail:'سيُحذف حسابك الشخصي وبياناته عند تنفيذ الطلب. تُحفظ السجلات المطلوبة قانونياً للمدة المقررة. إغلاق الشركة والاشتراك إجراء مستقل.', send:'تأكيد وإرسال طلب الحذف', password:'كلمة المرور الحالية', incorrect:'تحقق من كلمة المرور الحالية.', code:'رمز المتابعة الخاص', pending:'تم استلام الطلب. الحذف المتوقع بحلول', done:'اكتمل حذف الحساب.', save:'احتفظ بهذا الرمز لمتابعة الطلب بعد حذف الحساب.', check:'تحقق من الحالة', missing:'لم نعثر على طلب لهذا الرمز.', error:'تعذر إكمال العملية. أعد المحاولة.'},
  fr: {title:'Supprimer mon compte', track:'Suivre la demande de suppression', detail:'Votre compte personnel et ses données seront supprimés. Les données soumises à une obligation légale sont conservées pendant la durée requise. La fermeture de l’entreprise et de son abonnement suit une procédure distincte.', send:'Confirmer et envoyer la demande', password:'Mot de passe actuel', incorrect:'Vérifiez votre mot de passe actuel.', code:'Code de suivi privé', pending:'Demande reçue. Suppression prévue au plus tard le', done:'Votre compte a été supprimé.', save:'Conservez ce code pour suivre votre demande après la suppression.', check:'Vérifier le statut', missing:'Aucune demande ne correspond à ce code.', error:'L’opération a échoué. Réessayez.'},
  nl: {title:'Mijn account verwijderen', track:'Verwijderingsverzoek volgen', detail:'Uw persoonlijke account en gegevens worden verwijderd. Gegevens met een wettelijke bewaarplicht blijven gedurende de vereiste termijn bewaard. Voor de sluiting van het bedrijf en het abonnement geldt een aparte procedure.', send:'Verzoek bevestigen en versturen', password:'Huidig wachtwoord', incorrect:'Controleer uw huidige wachtwoord.', code:'Privé-opvolgcode', pending:'Verzoek ontvangen. Verwijdering verwacht uiterlijk op', done:'Uw account is verwijderd.', save:'Bewaar deze code om het verzoek na verwijdering te volgen.', check:'Status bekijken', missing:'Er is geen verzoek gevonden voor deze code.', error:'De actie is mislukt. Probeer het opnieuw.'},
} as const;

type Status = { due_at: string; completed_at: string | null };

export default function AccountDeletion({ tracking = false }: { tracking?: boolean }) {
  const { language } = useLanguage();
  const text = copy[language];
  const [open, setOpen] = useState(tracking);
  const [password, setPassword] = useState('');
  const [receipt, setReceipt] = useState('');
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);

  async function submit() {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError('');
    try {
      const key = tracking ? receipt.trim() : receipt || crypto.randomUUID();
      setReceipt(key);
      const result = await api.post<Status | null>(
        tracking ? '/auth/account-deletion-status' : '/auth/account-deletion',
        tracking ? { receipt: key } : { password, receipt: key, language },
      );
      setStatus(result);
      if (!result) setError(text.missing);
    } catch (error) {
      setError(error instanceof ApiError && error.status === 403 && !tracking ? text.incorrect : text.error);
    } finally {
      setPassword('');
      inFlight.current = false;
      setBusy(false);
    }
  }

  return <section className="space-y-3" dir={language === 'ar' ? 'rtl' : 'ltr'}>
    {tracking ? <h1 className="text-2xl font-semibold">{text.track}</h1> :
      <Button variant="outline" type="button" aria-expanded={open} disabled={busy} onClick={() => { setOpen(value => !value); setPassword(''); }}>{text.title}</Button>}
    {open && (tracking || !status) && <form className="space-y-3" onSubmit={event => { event.preventDefault(); void submit(); }}>
      {!tracking && <p className="text-sm text-muted-foreground">{text.detail}</p>}
      <Label htmlFor="account-deletion-confirmation">{tracking ? text.code : text.password}</Label>
      {tracking
        ? <Input id="account-deletion-confirmation" dir="ltr" maxLength={36} autoComplete="off" value={receipt} disabled={busy}
            onChange={event => { setReceipt(event.target.value); setStatus(null); setError(''); }}/>
        : <Input id="account-deletion-confirmation" type="password" autoComplete="current-password" value={password} disabled={busy}
            onChange={event => setPassword(event.target.value)}/>}
      <Button type="submit" variant={tracking ? 'default' : 'destructive'} disabled={busy || (tracking ? receipt.trim().length !== 36 : !password)}>
        {tracking ? text.check : text.send}
      </Button>
    </form>}
    {open && status && <>
      <p role="status" className="text-sm">{status.completed_at ? text.done : `${text.pending} ${new Date(status.due_at).toLocaleDateString(language)}.`}</p>
      {!tracking && <>
        <p className="text-sm">{text.save}</p>
        <p className="break-all text-sm"><bdi>{receipt}</bdi></p>
        <Link className="text-sm underline" href="/account-deletion-status">{text.track}</Link>
      </>}
    </>}
    {open && error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </section>;
}
