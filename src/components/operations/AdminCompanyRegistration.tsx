'use client';

import { useRef, useState, type FormEvent } from 'react';
import { Building2, Car, Plus, UserRound } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button, buttonVariants } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError, api } from '@/lib/api-client';

type Field = {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel';
  required?: boolean;
  maxLength: number;
};

const companyFields: Field[] = [
  {name: 'name', label: 'اسم الشركة', required: true, maxLength: 200},
  {name: 'vat_number', label: 'رقم TVA / VAT', required: true, maxLength: 50},
  {name: 'kbo_number', label: 'رقم BCE / KBO', required: true, maxLength: 50},
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
  const flight = useRef(false);
  const requestId = useRef<string | null>(null);

  function changeOpen(next: boolean) {
    if (flight.current || (!next && retry)) return;
    setOpen(next);
    if (!next) {
      requestId.current = null;
      setIncludeFleet(true);
      setReceipt(null);
      setError('');
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (flight.current) return;
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
        : <form onSubmit={submit} className="space-y-5">
          <fieldset disabled={busy} className="space-y-5">
            <section aria-labelledby="admin-registration-company" className="space-y-3 rounded-xl border p-4">
              <h3 id="admin-registration-company" className="flex items-center gap-2 font-semibold">
                <Building2 aria-hidden="true" className="size-4" /> بيانات الشركة
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {fieldsFor('company', companyFields, retry)}
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
          <Button type="submit" aria-busy={busy} disabled={busy} className="w-full sm:w-auto">
            {busy ? 'جارٍ الحفظ…' : retry ? 'إعادة محاولة الحفظ' : includeFleet ? 'حفظ الشركة والسائق والمركبة' : 'حفظ الشركة'}
          </Button>
        </form>}
    </DialogContent>
  </Dialog>;
}
