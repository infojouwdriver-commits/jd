'use client';

import { useRef, useState, type FormEvent } from 'react';
import { Building2, Car, Plus, Search, UserRound } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button, buttonVariants } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError, api } from '@/lib/api-client';
import type { CbeCompany as WebserviceCompany } from '@/lib/cbe-public-search';
type CbeCompany = WebserviceCompany & { snapshot_date?: string };
import { useLanguage } from '@/contexts/LanguageContext';

type Field = {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel';
  required?: boolean;
  maxLength: number;
};

const kboField: Field = {name: 'kbo_number', label: 'رقم BCE / KBO', required: true, maxLength: 50};
const companyFields: Field[] = [
  kboField,
  {name: 'name', label: 'اسم الشركة', required: true, maxLength: 200},
  {name: 'vat_number', label: 'رقم TVA / VAT', required: true, maxLength: 50},
  {name: 'address', label: 'العنوان', maxLength: 400},
  {name: 'email', label: 'البريد الإلكتروني', type: 'email', maxLength: 255},
  {name: 'phone', label: 'هاتف الشركة', type: 'tel', maxLength: 50},
  {name: 'password', label: 'كلمة مرور حساب الشركة', type: 'password', maxLength: 72},
];

const driverFields: Field[] = [
  {name: 'full_name', label: 'الاسم الكامل للسائق', required: true, maxLength: 200},
  {name: 'phone', label: 'هاتف السائق لتسجيل الدخول', type: 'tel', required: true, maxLength: 32},
  {name: 'password', label: 'كلمة مرور السائق', type: 'password', required: true, maxLength: 72},
  {name: 'driver_license', label: 'رقم رخصة القيادة', maxLength: 50},
  {name: 'bestuurderspas_number', label: 'رقم بطاقة السائق', maxLength: 50},
];

const vehicleFields: Field[] = [
  {name: 'plate_number', label: 'رقم لوحة المركبة', required: true, maxLength: 50},
  {name: 'brand', label: 'الماركة', required: true, maxLength: 100},
  {name: 'model', label: 'الطراز', required: true, maxLength: 100},
  {name: 'vin', label: 'رقم الهيكل (VIN)', maxLength: 100},
  {name: 'chiron_vehicle_id', label: 'معرّف المركبة لدى Chiron', maxLength: 100},
];

const cbeStatus: Record<CbeCompany['status'], string> = {
  AC: 'نشطة', ST: 'متوقفة', BK: 'مسجّلة', JU: 'منشأة قانونيًا',
};

type Receipt = { company_id: number; driver_id: number | null; vehicle_id: number | null };

function fieldValues(data: FormData, prefix: string, fields: Field[]) {
  return Object.fromEntries(fields.map(({name, type}) => {
    const value = String(data.get(`${prefix}-${name}`) ?? '');
    return [name, type === 'password' ? value : value.trim()];
  }));
}

function fieldsFor(prefix: string, fields: Field[], readOnly: boolean) {
  return fields.map(({name, label, type = 'text', required, maxLength}) => {
    const id = `admin-registration-${prefix}-${name}`;
    return <div key={name} className="min-w-0 space-y-1.5">
      <Label htmlFor={id}>{label}{required && ' *'}</Label>
      <Input id={id} name={`${prefix}-${name}`} type={type} required={required} readOnly={readOnly}
        dir={type !== 'text' || /^(vat_number|kbo_number|plate_number|vin|chiron_vehicle_id)$/.test(name) ? 'ltr' : undefined}
        minLength={type === 'password' ? 12 : undefined} maxLength={maxLength}
        autoComplete={type === 'password' ? 'new-password' : 'off'}
        aria-describedby={type === 'password' && prefix === 'company' ? 'admin-registration-password-help' : undefined} />
    </div>;
  });
}

export default function AdminCompanyRegistration({onCreated}: {onCreated: () => void}) {
  const [open, setOpen] = useState(false);
  const [includeFleet, setIncludeFleet] = useState(true);
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const { language } = useLanguage();
  const [cbeCompany, setCbeCompany] = useState<CbeCompany | null>(null);
  const [cbeMessage, setCbeMessage] = useState('');
  const [cbeBusy, setCbeBusy] = useState(false);
  const lookup = useRef<AbortController | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const flight = useRef(false);
  const requestId = useRef<string | null>(null);

  function changeOpen(next: boolean) {
    if (flight.current || (!next && retry)) return;
    setOpen(next);
    if (!next) {
      requestId.current = null;
      clearLookup();
      setIncludeFleet(true);
      setReceipt(null);
      setError('');
    }
  }

  function clearLookup() {
    lookup.current?.abort();
    lookup.current = null;
    setCbeBusy(false);
    setCbeCompany(null);
    setCbeMessage('');
  }

  async function searchCbe() {
    if (lookup.current || flight.current || retry) return;
    const input = formRef.current?.elements.namedItem('company-kbo_number');
    if (!(input instanceof HTMLInputElement)) return;
    const number = input.value.trim();
    if (!number) {
      setCbeMessage('أدخل رقم المؤسسة للبحث في BCE/KBO.');
      input.focus();
      return;
    }
    const controller = new AbortController();
    lookup.current = controller;
    setCbeBusy(true);
    setCbeCompany(null);
    setCbeMessage('');
    try {
      const company = await api.post<CbeCompany>('/companies/cbe', {
        number, language: language === 'nl' ? 'nl' : 'fr',
      }, { signal: controller.signal });
      if (!controller.signal.aborted) setCbeCompany(company);
    } catch (failure) {
      if (!controller.signal.aborted) {
        setCbeMessage(failure instanceof ApiError && failure.errorCode
          ? failure.message : 'تعذر البحث. يمكنك إدخال بيانات الشركة يدويًا.');
      }
    } finally {
      if (lookup.current === controller) {
        lookup.current = null;
        setCbeBusy(false);
      }
    }
  }

  function applyCbeCompany() {
    if (!cbeCompany || !formRef.current) return;
    for (const field of ['kbo_number', 'name', 'address'] as const) {
      const input = formRef.current.elements.namedItem(`company-${field}`);
      const value = cbeCompany[field];
      if (input instanceof HTMLInputElement && value) input.value = value;
    }
    setCbeCompany(null);
    setCbeMessage('تم إدخال البيانات المتوفرة. راجعها وأكمل رقم TVA قبل الحفظ.');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (flight.current || lookup.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const company = fieldValues(data, 'company', companyFields);
    const driver = fieldValues(data, 'driver', driverFields);
    const vehicle = fieldValues(data, 'vehicle', vehicleFields);
    if (company.password && !company.email) {
      setError('أدخل البريد الإلكتروني لإنشاء حساب دخول الشركة.');
      const email = form.elements.namedItem('company-email');
      if (email instanceof HTMLInputElement) email.focus();
      return;
    }
    if ([company.password, driver.password].some(password => new TextEncoder().encode(password).length > 72)) {
      setError('كلمة المرور يجب ألا تتجاوز 72 بايت.');
      return;
    }

    requestId.current ??= crypto.randomUUID();
    flight.current = true;
    setBusy(true);
    setError('');
    let saved: Receipt;
    try {
      saved = await api.post<Receipt>('/companies/onboarding', {
        request_id: requestId.current,
        company,
        fleet: includeFleet ? {driver, vehicle} : undefined,
      });
      if (!saved || !Number.isSafeInteger(saved.company_id) ||
        (includeFleet && (!Number.isSafeInteger(saved.driver_id) || !Number.isSafeInteger(saved.vehicle_id)))) {
        throw new Error('Invalid registration receipt');
      }
    } catch (failure) {
      const uncertain = !(failure instanceof ApiError) || failure.status === 0 ||
        failure.status >= 500 || failure.errorCode === 'INVALID_SERVER_RESPONSE';
      setRetry(uncertain);
      setError(uncertain
        ? 'تعذر تأكيد الحفظ. أعد المحاولة للتحقق من التسجيل نفسه.'
        : failure.message);
      return;
    } finally {
      flight.current = false;
      setBusy(false);
    }
    setReceipt(saved);
    setRetry(false);
    toast.success(saved.driver_id ? 'تم إنشاء الشركة وربط السائق والمركبة' : 'تم إنشاء الشركة');
    onCreated();
  }

  return <Dialog open={open} onOpenChange={changeOpen}>
    <DialogTrigger asChild>
      <Button className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600">
        <Plus aria-hidden="true" className="size-5" /> شركة جديدة
      </Button>
    </DialogTrigger>
    <DialogContent dir="rtl" closeLabel="إغلاق" closeDisabled={busy || retry}
      className="max-h-[calc(100dvh-1rem)] max-w-[calc(100%-1rem)] overflow-y-auto sm:max-w-3xl">
      <DialogHeader className="pe-6 text-start sm:text-start">
        <DialogTitle>{receipt ? 'تم تسجيل الشركة' : 'تسجيل شركة جديدة'}</DialogTitle>
        <DialogDescription>{receipt
          ? receipt.driver_id ? 'السائق والمركبة مرتبطان بالشركة.' : 'يمكنك إضافة السائقين والمركبات من ملف الشركة.'
          : 'أدخل بيانات الشركة والسائق والمركبة ثم احفظها معًا.'}</DialogDescription>
      </DialogHeader>
      {receipt ? <Link className={buttonVariants()} href={`/admin/companies/${receipt.company_id}`}>فتح ملف الشركة</Link>
        : <form ref={formRef} onSubmit={submit} onChange={event => {
          if (event.target instanceof HTMLInputElement && event.target.name === 'company-kbo_number') clearLookup();
        }} className="space-y-5">
          <fieldset disabled={busy} className="space-y-5">
            <section aria-labelledby="admin-registration-company" className="space-y-3 rounded-xl border p-4">
              <h3 id="admin-registration-company" className="flex items-center gap-2 font-semibold">
                <Building2 aria-hidden="true" className="size-4" /> بيانات الشركة
              </h3>
              <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-0 flex-1 basis-48">{fieldsFor('company', [kboField], retry)}</div>
                <Button type="button" variant="outline" disabled={retry || cbeBusy}
                  aria-busy={cbeBusy} onClick={searchCbe}>
                  <Search aria-hidden="true" className="size-4" />
                  {cbeBusy ? 'جارٍ البحث…' : 'بحث في BCE/KBO'}
                </Button>
              </div>
              {cbeMessage && <p role="status" className="text-sm text-muted-foreground">{cbeMessage}</p>}
              {cbeCompany && <div className="space-y-2 rounded-lg border bg-muted/40 p-3" aria-live="polite">
                <p className="text-sm font-semibold">
                  {cbeCompany.snapshot_date ? <span>BCE/KBO Open Data · <bdi>{cbeCompany.snapshot_date}</bdi></span> : cbeCompany.environment === 'test' ? 'نتيجة BCE/KBO من البيئة التجريبية' : 'البيانات المسجّلة في BCE/KBO'}
                </p>
                <p className="text-sm">حالة المؤسسة: {cbeStatus[cbeCompany.status]}</p>
                {cbeCompany.name && <p className="break-words font-medium" dir="auto">{cbeCompany.name}</p>}
                {cbeCompany.address && <p className="break-words text-sm" dir="auto">{cbeCompany.address}</p>}
                {(!cbeCompany.name || !cbeCompany.address) &&
                  <p className="text-sm text-muted-foreground">أكمل الحقول التي لم تظهر في نتيجة السجل يدويًا.</p>}
                <Button type="button" variant="secondary" size="sm" disabled={retry} onClick={applyCbeCompany}>
                  استخدام بيانات السجل
                </Button>
              </div>}
              <div className="grid gap-3 sm:grid-cols-2">
                {fieldsFor('company', companyFields.slice(1), retry)}
              </div>
              <p id="admin-registration-password-help" className="text-sm text-muted-foreground">
                كلمة مرور الشركة اختيارية. يتطلب حساب الدخول بريدًا إلكترونيًا وكلمة مرور من 12 حرفًا على الأقل.
              </p>
            </section>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" className="size-4 accent-primary" checked={includeFleet} disabled={retry}
                onChange={event => setIncludeFleet(event.target.checked)} />
              إضافة أول سائق ومركبة
            </label>
            <fieldset hidden={!includeFleet} disabled={!includeFleet}>
              <div className="grid gap-3 sm:grid-cols-2">
                <section aria-labelledby="admin-registration-driver" className="space-y-3 rounded-xl border p-4">
                  <h3 id="admin-registration-driver" className="flex items-center gap-2 font-semibold">
                    <UserRound aria-hidden="true" className="size-4" /> بيانات السائق
                  </h3>
                  {fieldsFor('driver', driverFields, retry)}
                </section>
                <section aria-labelledby="admin-registration-vehicle" className="space-y-3 rounded-xl border p-4">
                  <h3 id="admin-registration-vehicle" className="flex items-center gap-2 font-semibold">
                    <Car aria-hidden="true" className="size-4" /> بيانات المركبة
                  </h3>
                  {fieldsFor('vehicle', vehicleFields, retry)}
                </section>
              </div>
            </fieldset>
          </fieldset>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" aria-busy={busy} disabled={busy || cbeBusy} className="w-full sm:w-auto">
            {busy ? 'جارٍ الحفظ…' : retry ? 'إعادة محاولة الحفظ' : includeFleet ? 'حفظ الشركة والسائق والمركبة' : 'حفظ الشركة'}
          </Button>
        </form>}
    </DialogContent>
  </Dialog>;
}
