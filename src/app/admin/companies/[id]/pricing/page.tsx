
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Loader2, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import type {CompanyPricing, CompanyTariff} from '@/lib/company-pricing';

interface Company {id:number;name:string;tariffs:CompanyTariff[];revision:number}
interface Issued {id:string;issued_at:string;url:string}

export default function CompanyPricingPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const companyId = params?.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [tariffs,setTariffs]=useState<CompanyTariff[]>([]);
  const [selected,setSelected]=useState(0);
  const [dirty,setDirty]=useState(false);
  const [language,setLanguage]=useState<'fr'|'nl'>('fr');
  const [documents,setDocuments]=useState<Issued[]>([]);
  const [issuing,setIssuing]=useState(false);
  const endpoint=`/companies/${companyId}/pricing`;
  const tariff=tariffs[selected];
  const pricing=tariff?.settings;
  const patchTariff=(patch:Partial<CompanyTariff>)=>{
    setDirty(true);
    setTariffs(rows=>rows.map((row,i)=>i===selected?{...row,...patch}:row));
  };
  const setPricing=(settings:CompanyPricing)=>patchTariff({settings});

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (!authLoading && user && !user.isAdmin) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!companyId) return;
      
      setLoading(true);
      try {
        const data = await api.get<Company>(endpoint);
        setCompany(data);
        setTariffs(data.tariffs);setSelected(0);setDirty(false);setDocuments([]);
        try {setDocuments(await api.get<Issued[]>(endpoint+'/documents'));}
        catch {toast.error('تعذّر تحميل سجل أوراق التعرفات');}
      } catch (error: any) {
        toast.error(error.message || 'فشل تحميل بيانات الشركة');
      } finally {
        setLoading(false);
      }
    };

    if (user?.isAdmin === true) {
      fetchCompany();
    }
  }, [companyId, endpoint, user]);

  const handleSave = async () => {
    if (saving || !company) return;
    setSaving(true);
    try {
      const updated=await api.put<Company>(endpoint,{tariffs,revision:company.revision});
      setCompany(updated);setTariffs(updated.tariffs);setDirty(false);
      toast.success('تم حفظ إعدادات التسعيرة بنجاح');
    } catch (error: any) {
      toast.error(error.message || 'فشل حفظ إعدادات التسعيرة');
    } finally {
      setSaving(false);
    }
  };

  async function issue() {
    if(!company||dirty||issuing)return;
    setIssuing(true);
    try {
      const item=await api.post<Issued>(endpoint+'/documents',{language,revision:company.revision});
      setDocuments(rows=>[item,...rows]);
      const link=document.createElement('a');link.href=item.url;link.click();
    } catch (error) {toast.error(error instanceof Error?error.message:'تعذّر إصدار الورقة');}
    finally {setIssuing(false);}
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !user?.isAdmin) {
    return null;
  }

  if (!company || !tariff || !pricing) return <div role="alert" className="mx-auto max-w-xl p-8 text-center space-y-4">
    <h1 className="text-xl font-bold">تعذّر تحميل إعدادات التسعير</h1>
    <p>لم تُحمّل إعدادات الشركة؛ لا يمكن حفظ أسعار افتراضية فوق بياناتها.</p>
    <Link href={`/admin/companies/${companyId}/settings`} className="inline-block underline">العودة إلى إعدادات الشركة</Link>
  </div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin/companies">
              <Button variant="ghost" size="icon" className="rounded-2xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              إعدادات التسعيرة
            </h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {company && (
          <Card className="p-6 rounded-3xl border-0 shadow-xl mb-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{company.name}</h2>
                <p className="text-sm text-muted-foreground">تخصيص أسعار الرحلات</p>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-6">
          <Card className="space-y-4 rounded-3xl border-slate-700 bg-[#101E33] p-6 text-white">
            <h3 className="text-lg font-bold text-[#E0BD5B]">تعرفات الشركة</h3>
            <div className="flex flex-wrap gap-2">
              {tariffs.map((row,i)=><Button key={row.code} aria-pressed={selected===i} variant={selected===i?'default':'secondary'} onClick={()=>setSelected(i)}>{row.code} · {row.name}</Button>)}
              <Button variant="secondary" onClick={()=>{
                const code=`T${tariffs.length+1}`;
                const starts_on=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Brussels'}).format(new Date());
                setTariffs([...tariffs,{...tariff,code,name:code,description:'',starts_on,enabled:false}]);setSelected(tariffs.length);setDirty(true);
              }}>إضافة تعرفة</Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">الاسم<Input className="bg-slate-900 text-white" value={tariff.name} maxLength={100} onChange={e=>patchTariff({name:e.target.value})}/></label>
              <label className="space-y-2">الوصف<Input className="bg-slate-900 text-white" value={tariff.description} maxLength={300} onChange={e=>patchTariff({description:e.target.value})}/></label>
              <label className="space-y-2">تاريخ بدء السريان<Input className="bg-slate-900 text-white" type="date" value={tariff.starts_on} onChange={e=>patchTariff({starts_on:e.target.value})}/></label>
              <label className="space-y-2">سعر الانطلاق (€)<Input className="bg-slate-900 text-white" type="number" min="0" step="0.01" value={Number.isNaN(tariff.base_fee)?'':tariff.base_fee} onChange={e=>patchTariff({base_fee:e.target.valueAsNumber})}/></label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={tariff.enabled} onChange={e=>patchTariff({enabled:e.target.checked})}/>تعرفة مفعّلة</label>
            </div>
          </Card>
          <Card className="space-y-4 rounded-3xl p-6">
            <h3 className="text-lg font-bold">ورقة التعرفات التقديرية</h3>
            <p className="text-sm text-muted-foreground">تعرض الورقة التعرفات السارية من آخر حفظ. راجع متطلبات بطاقة التعرفات بحسب منطقة الترخيص ونوع الخدمة قبل استخدامها رسميًا.</p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2">لغة الورقة
                <select className="rounded-md border bg-background p-2" value={language} onChange={e=>setLanguage(e.target.value==='nl'?'nl':'fr')}>
                  <option value="fr">Français</option><option value="nl">Nederlands</option>
                </select>
              </label>
              <Button onClick={()=>void issue()} disabled={dirty||issuing||saving}>{issuing?'جارٍ الإصدار…':'تنزيل ورقة التعرفات PDF'}</Button>
              {dirty&&<span className="text-sm text-muted-foreground">احفظ التعديلات قبل الإصدار</span>}
            </div>
            {documents.length>0&&<details><summary>الإصدارات السابقة</summary><ul className="mt-2 space-y-2">
              {documents.map(item=><li key={item.id}><a className="underline" href={item.url} target="_blank" rel="noreferrer">{new Date(item.issued_at).toLocaleString('fr-BE',{timeZone:'Europe/Brussels'})} · {item.id.slice(0,8)}</a></li>)}
            </ul></details>}
          </Card>
          {/* الأسعار الأساسية */}
          <Card className="p-6 rounded-3xl border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <h3 className="text-lg font-bold mb-4">الأسعار الأساسية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>السعر لكل كيلومتر (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={pricing.base_rate_per_km}
                  onChange={(e) => setPricing({...pricing, base_rate_per_km: parseFloat(e.target.value)})}
                  className="rounded-2xl mt-2"
                />
              </div>
              <div>
                <Label>السعر لكل دقيقة (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={pricing.base_rate_per_minute}
                  onChange={(e) => setPricing({...pricing, base_rate_per_minute: parseFloat(e.target.value)})}
                  className="rounded-2xl mt-2"
                />
              </div>
              <div>
                <Label>الحد الأدنى للأجرة (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={pricing.minimum_fare}
                  onChange={(e) => setPricing({...pricing, minimum_fare: parseFloat(e.target.value)})}
                  className="rounded-2xl mt-2"
                />
              </div>
              <div>
                <Label>رسوم المطار (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={pricing.airport_surcharge}
                  onChange={(e) => setPricing({...pricing, airport_surcharge: parseFloat(e.target.value)})}
                  className="rounded-2xl mt-2"
                />
              </div>
            </div>
          </Card>

          {/* الرسوم الإضافية */}
          <Card className="p-6 rounded-3xl border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <h3 className="text-lg font-bold mb-4">الرسوم الإضافية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>نسبة الزيادة الليلية (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={pricing.night_surcharge_percentage}
                  onChange={(e) => setPricing({...pricing, night_surcharge_percentage: parseFloat(e.target.value)})}
                  className="rounded-2xl mt-2"
                />
              </div>
              <div>
                <Label>نسبة زيادة ساعات الذروة (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={pricing.peak_hour_surcharge_percentage}
                  onChange={(e) => setPricing({...pricing, peak_hour_surcharge_percentage: parseFloat(e.target.value)})}
                  className="rounded-2xl mt-2"
                />
              </div>
            </div>
          </Card>

          {/* ساعات الليل */}
          <Card className="p-6 rounded-3xl border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <h3 className="text-lg font-bold mb-4">ساعات الليل</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>ساعة البداية (0-23)</Label>
                <Input
                  type="number"
                  min="0"
                  max="23"
                  value={pricing.night_start_hour}
                  onChange={(e) => setPricing({...pricing, night_start_hour: parseInt(e.target.value)})}
                  className="rounded-2xl mt-2"
                />
              </div>
              <div>
                <Label>ساعة النهاية (0-23)</Label>
                <Input
                  type="number"
                  min="0"
                  max="23"
                  value={pricing.night_end_hour}
                  onChange={(e) => setPricing({...pricing, night_end_hour: parseInt(e.target.value)})}
                  className="rounded-2xl mt-2"
                />
              </div>
            </div>
          </Card>

          {/* ساعات الذروة */}
          <Card className="p-6 rounded-3xl border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <h3 className="text-lg font-bold mb-4">ساعات الذروة</h3>
            <div className="space-y-4">
              {pricing.peak_hours.map((period, index) => (
                <div key={index} className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>من</Label>
                    <Input
                      type="time"
                      value={period.start}
                      onChange={(e) => {
                        const newPeakHours = [...pricing.peak_hours];
                        newPeakHours[index]={...newPeakHours[index],start:e.target.value};
                        setPricing({...pricing, peak_hours: newPeakHours});
                      }}
                      className="rounded-2xl mt-2"
                    />
                  </div>
                  <div>
                    <Label>إلى</Label>
                    <Input
                      type="time"
                      value={period.end}
                      onChange={(e) => {
                        const newPeakHours = [...pricing.peak_hours];
                        newPeakHours[index]={...newPeakHours[index],end:e.target.value};
                        setPricing({...pricing, peak_hours: newPeakHours});
                      }}
                      className="rounded-2xl mt-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* أزرار الحفظ */}
          <div className="flex gap-4">
            <Button
              onClick={() => router.push('/admin/companies')}
              variant="outline"
              className="flex-1 h-12 rounded-2xl"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !dirty}
              className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin ml-2" />
              ) : (
                <Save className="w-5 h-5 ml-2" />
              )}
              حفظ التغييرات
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
