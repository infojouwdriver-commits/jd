'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { MarketingLocale } from '@/lib/marketing-content';
import { calculatorText } from '@/lib/marketing-resources';
import { calculateSettlement, emptySettlement, settlementPlatforms, type SettlementForm } from '@/lib/public-driver-settlement';

const storageKey = 'jouww.public-settlement';
const fieldClass = 'mt-1 min-h-11 w-full rounded-lg border border-[#66778e] bg-[#101a2a] px-2 text-base text-white';
const fields = [
  ['share', 'حصة السائق من الدخل %'], ['fuel', 'إجمالي الوقود €'],
  ['fuelShare', 'حصة السائق من الوقود %'], ['expenses', 'مصاريف أخرى على السائق €'],
] as const;
const summary = [
  ['income', 'إجمالي الدخل'], ['cash', 'إجمالي النقد المخصوم'], ['gross', 'حصة السائق قبل الخصومات'],
  ['driverFuel', 'حصة السائق من الوقود'], ['companyFuel', 'حصة الشركة من الوقود'], ['expenses', 'المصاريف الأخرى'],
] as const;

export function DriverSettlementCalculator({ locale }: { locale: MarketingLocale }) {
  const t = (key: string) => calculatorText(locale, key);
  const [form, setForm] = useState(emptySettlement);
  const [downloadError, setDownloadError] = useState(false);
  const [exporting, setExporting] = useState(false);
  useEffect(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem(storageKey) || 'null') as SettlementForm | null;
      if (stored && stored.rows?.length === settlementPlatforms.length &&
          stored.rows.every((row) => row && typeof row.income === 'string' && typeof row.cash === 'string') &&
          ['driver', 'share', 'fuel', 'fuelShare', 'expenses'].every((key) => typeof stored[key as keyof SettlementForm] === 'string')) {
        setForm(stored);
      }
    } catch { /* The calculator also works when session storage is unavailable. */ }
  }, []);
  function change(next: SettlementForm) {
    setForm(next);
    try { sessionStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Keep the current inputs in memory. */ }
  }
  const totals = calculateSettlement(form);
  const currency = new Intl.NumberFormat(locale === 'nl' ? 'nl-BE' : 'fr-BE', { style: 'currency', currency: 'EUR' });
  const error = totals.invalid ? t('أدخل مبالغ من صفر فأعلى ونسبًا بين 0 و100.') :
    totals.excessCash.length ? t('النقد يتجاوز الدخل في: ') + totals.excessCash.join(', ') : '';
  async function download(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const driver = form.driver.trim();
    if (!driver || error || exporting) return;
    setDownloadError(false);
    setExporting(true);
    try {
      const { downloadSettlement } = await import('@/lib/public-driver-settlement-pdf');
      await downloadSettlement(locale, driver, totals);
    } catch {
      setDownloadError(true);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="mt-8 max-w-4xl">
      <div data-ad-placement="above-calculator" hidden />
      <div className="grid gap-6">
        <form className="min-w-0 rounded-2xl border border-[#364357] bg-[#142239] p-3 sm:p-6" onSubmit={download}>
          <label className="block max-w-sm">{t('اسم السائق')}
            <input className={fieldClass} name="driver" required maxLength={80} autoComplete="off" value={form.driver}
              onChange={(event) => change({ ...form, driver: event.target.value })} />
          </label>
          <table className="my-4 w-full table-fixed text-start text-sm">
            <thead><tr className="text-[#efd59d]">
              <th scope="col" className="w-[28%] text-start">{t('المنصة')}</th>
              <th scope="col" className="px-1 text-start">{t('الدخل €')}</th>
              <th scope="col" className="px-1 text-start">{t('النقد €')}</th>
            </tr></thead>
            <tbody>{settlementPlatforms.map((platform, index) => (
              <tr className="border-b border-[#364357]" key={platform}>
                <th className="break-words py-2 text-start" scope="row">{platform}</th>
                {(['income', 'cash'] as const).map((key) => (
                  <td className="px-1 pb-1" key={key}>
                    <input className={fieldClass} dir="ltr" inputMode="decimal" placeholder="0"
                      aria-label={t(key === 'income' ? 'الدخل' : 'النقد') + ' — ' + platform} value={form.rows[index][key]}
                      onChange={(event) => change({ ...form, rows: form.rows.map((row, i) => i === index ? { ...row, [key]: event.target.value } : row) })} />
                  </td>
                ))}
              </tr>
            ))}</tbody>
          </table>
          <p className="text-sm leading-6 text-[#c1cbd8]">{t('الدخل يشمل النقد المقبوض. يُخصم كامل النقد الذي بقي مع السائق بعد حساب حصته.')}</p>
          <div className="my-5 grid grid-cols-2 gap-3">{fields.map(([key, label]) => (
            <label className="min-w-0 text-sm" key={key}>{t(label)}
              <input className={fieldClass} dir="ltr" inputMode="decimal" placeholder="0" value={form[key]}
                onChange={(event) => change({ ...form, [key]: event.target.value })} />
            </label>
          ))}</div>
          {error && <p role="alert" className="mb-4 text-[#ffb8ae]">{error}</p>}
          <div className="rounded-xl border border-[#506078] bg-[#1a283b] p-3 sm:p-5">
            <dl className="grid gap-x-5 sm:grid-cols-2">{summary.map(([key, label]) => (
              <div className="flex flex-wrap justify-between gap-x-2 border-b border-[#405068] py-2 text-sm" key={key}>
                <dt>{t(label)}</dt><dd dir="ltr">{error ? '—' : currency.format(totals[key] / 100)}</dd>
              </div>
            ))}</dl>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div aria-live="polite">
                <p className="text-sm">{t(!error && totals.balance < 0 ? 'المبلغ المستحق على السائق' : 'صافي مستحقات السائق')}</p>
                <output dir="ltr" className={'text-3xl font-semibold ' + (totals.balance < 0 ? 'text-[#ffb8ae]' : 'text-[#efd59d]')}>
                  {error ? '—' : currency.format(totals.balance / 100)}
                </output>
              </div>
              <button type="submit" disabled={Boolean(error) || exporting} aria-busy={exporting}
                className="min-h-11 rounded-lg bg-[#efd59d] px-4 font-semibold text-[#101a2a] disabled:opacity-60">
                {t('تحميل التقرير PDF')}
              </button>
            </div>
            {downloadError && <p role="alert" className="mt-3 text-[#ffb8ae]">{{ ar: 'تعذّر إنشاء التقرير. حاول مرة أخرى.', fr: 'Impossible de créer le PDF. Réessayez.', nl: 'Het pdf-bestand kon niet worden gemaakt. Probeer opnieuw.' }[locale]}</p>}
          </div>
        </form>
        <aside data-ad-placement="desktop-sidebar" hidden />
      </div>
      <section className="mt-8">
        <h2 className="text-xl font-semibold">{t('كيف تنحسب التسوية؟')}</h2>
        <p className="mt-2 max-w-3xl leading-7 text-[#c1cbd8]">{t('تُحسب نسبة السائق من إجمالي دخل المنصات. بعدها يُخصم النقد اللي قبضه السائق، وحصته من الوقود، والمصاريف المسجّلة عليه. حصة الشركة من الوقود تظهر في الكشف لتوضيح التقسيم.')}</p>
      </section>
      <div data-ad-placement="below-calculation-guide" hidden />
    </div>
  );
}
