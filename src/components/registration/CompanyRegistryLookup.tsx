'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const copy = {
  ar: {
    search: 'بحث في السجل البلجيكي',
    invalid: 'أدخل رقم شركة بلجيكيًا صالحًا للبحث.',
    found: 'تم العثور على الشركة. راجع الاسم والعنوان وأكمل الحقول الناقصة.',
    missing: 'لم نجد بيانات نشطة لهذا الرقم. تحقّق منه أو أدخل بيانات الشركة يدويًا.',
    unavailable: 'البحث غير متاح حاليًا. يمكنك متابعة التسجيل بإدخال البيانات يدويًا.',
  },
  fr: {
    search: 'Rechercher dans la BCE',
    invalid: 'Saisissez un numéro d’entreprise belge valide.',
    found: 'Entreprise trouvée. Vérifiez le nom et l’adresse, puis complétez les champs manquants.',
    missing: 'Aucune donnée active pour ce numéro. Vérifiez-le ou saisissez les données manuellement.',
    unavailable: 'La recherche est indisponible. Vous pouvez poursuivre en saisissant les données manuellement.',
  },
  nl: {
    search: 'Zoeken in de KBO',
    invalid: 'Voer een geldig Belgisch ondernemingsnummer in.',
    found: 'Onderneming gevonden. Controleer de naam en het adres en vul de ontbrekende velden in.',
    missing: 'Geen actieve gegevens voor dit nummer. Controleer het nummer of vul de gegevens handmatig in.',
    unavailable: 'Zoeken is momenteel niet beschikbaar. U kunt doorgaan door de gegevens handmatig in te vullen.',
  },
};

export type RegistryCompany = { kbo_number: string; name: string | null; address: string | null };
type Result = 'invalid' | 'found' | 'missing' | 'unavailable';

export function CompanyRegistryLookup({ children, disabled, language, number, onFound }: {
  children: ReactNode;
  disabled: boolean;
  language: keyof typeof copy;
  number: string;
  onFound: (requestedNumber: string, company: RegistryCompany) => void;
}) {
  const t = copy[language];
  const pending = useRef<AbortController | null>(null);
  const apply = useRef(onFound);
  useEffect(() => { apply.current = onFound; }, [onFound]);
  const [busyNumber, setBusyNumber] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ number: string; result: Result } | null>(null);
  const busy = busyNumber === number;

  useEffect(() => () => {
    pending.current?.abort();
  }, [number, language]);

  async function search() {
    if (!number.trim()) {
      setFeedback({ number, result: 'invalid' });
      return;
    }
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    setBusyNumber(number);
    setFeedback(null);
    try {
      const response = await fetch('/next_api/company-registrations/company-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number, language: language === 'nl' ? 'nl' : 'fr' }),
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]),
      });
      if (controller.signal.aborted) return;
      if (!response.ok) {
        const result = response.status === 400 ? 'invalid' : response.status === 404 ? 'missing' : 'unavailable';
        setFeedback({ number, result });
        return;
      }
      const { data } = await response.json() as { data: RegistryCompany };
      if (controller.signal.aborted) return;
      apply.current(number, data);
      setFeedback({ number: data.kbo_number, result: 'found' });
    } catch {
      if (!controller.signal.aborted) setFeedback({ number, result: 'unavailable' });
    } finally {
      if (pending.current === controller) {
        pending.current = null;
        setBusyNumber(null);
      }
    }
  }

  return <div className="cr-wide grid gap-2">
    {children}
    <Button className="justify-self-start" type="button" variant="outline" disabled={disabled || busy}
      aria-busy={busy} aria-describedby="registration-cbe-status" onClick={() => void search()}>
      {busy ? <Loader2 className="animate-spin" size={16}/> : <Search size={16}/>}
      {t.search}
    </Button>
    <p className="cr-hint" id="registration-cbe-status" role="status">
      {feedback?.number === number ? t[feedback.result] : ''}
    </p>
  </div>;
}
