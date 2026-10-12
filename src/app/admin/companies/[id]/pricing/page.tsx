
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
import { normalizeCompanyPricing, companyPricingPatch } from '@/lib/company-pricing';

interface Company {
  id: number;
  name: string;
  base_rate_per_km: number;
  base_rate_per_minute: number;
  minimum_fare: number;
  airport_surcharge: number;
  night_surcharge_percentage: number;
  peak_hour_surcharge_percentage: number;
  night_start_hour: number;
  night_end_hour: number;
  peak_hours: Array<{ start: string; end: string }>;
}

export default function CompanyPricingPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const companyId = params?.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pricing, setPricing] = useState({
    base_rate_per_km: 2.00,
    base_rate_per_minute: 0.50,
    minimum_fare: 10.00,
    airport_surcharge: 5.00,
    night_surcharge_percentage: 20.00,
    peak_hour_surcharge_percentage: 15.00,
    night_start_hour: 22,
    night_end_hour: 6,
    peak_hours: [
      { start: '07:00', end: '09:00' },
      { start: '17:00', end: '19:00' }
    ]
  });

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
        const data = await api.get<Company>(`/companies/${companyId}/pricing`);
        const normalized = normalizeCompanyPricing(data as unknown as Record<string, unknown>);
        setPricing(normalized);
        setCompany(data);
      } catch (error: any) {
        toast.error(error.message || 'فشل تحميل بيانات الشركة');
      } finally {
        setLoading(false);
      }
    };

    if (user?.isAdmin === true) {
      fetchCompany();
    }
  }, [companyId, user]);

  const handleSave = async () => {
    if (saving || !company) return;
    setSaving(true);
    try {
      await api.put('/companies', {
        id: parseInt(companyId),
        ...companyPricingPatch(pricing)
      });
      toast.success('تم حفظ إعدادات التسعيرة بنجاح');
      router.push('/admin/companies');
    } catch (error: any) {
      toast.error(error.message || 'فشل حفظ إعدادات التسعيرة');
    } finally {
      setSaving(false);
    }
  };

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

  if (!company) return <div role="alert" className="mx-auto max-w-xl p-8 text-center space-y-4">
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
                        newPeakHours[index].start = e.target.value;
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
                        newPeakHours[index].end = e.target.value;
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
              disabled={saving}
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
