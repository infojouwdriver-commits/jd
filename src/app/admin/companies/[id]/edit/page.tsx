
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft,
  Save,
  Loader2,
  Building2
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';

interface Company {
  id: number;
  name: string;
  client_name: string;
  vat_number: string;
  kbo_number: string;
  address: string;
  email: string;
  phone: string;
  logo_url: string;
}

export default function EditCompanyPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (!authLoading && user?.role !== 'app20251225073911jaqqaxdfir_v1_admin_user') {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!user || user.role !== 'app20251225073911jaqqaxdfir_v1_admin_user') return;

      setLoading(true);
      try {
        const companies = await api.get<Company[]>('/companies');
        const found = companies.find(c => c.id === parseInt(companyId));
        
        if (!found) {
          toast.error('الشركة غير موجودة');
          router.push('/admin/companies');
          return;
        }

        setCompany(found);
      } catch (error: any) {
        toast.error(error.message || 'فشل تحميل بيانات الشركة');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'app20251225073911jaqqaxdfir_v1_admin_user') {
      fetchCompany();
    }
  }, [user, companyId, router]);

  const handleSave = async () => {
    if (!company) return;

    if (!company.name || !company.vat_number || !company.kbo_number) {
      toast.error('اسم الشركة ورقم VAT ورقم KBO مطلوبة');
      return;
    }

    setSaving(true);
    try {
      await api.put('/companies', {
        id: company.id,
        name: company.name,
        client_name: company.client_name,
        vat_number: company.vat_number,
        kbo_number: company.kbo_number,
        address: company.address,
        email: company.email,
        phone: company.phone,
        logo_url: company.logo_url
      });

      toast.success('تم حفظ التغييرات بنجاح');
      router.push('/admin/companies');
    } catch (error: any) {
      toast.error(error.message || 'فشل حفظ التغييرات');
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

  if (!user || user.role !== 'app20251225073911jaqqaxdfir_v1_admin_user' || !company) {
    return null;
  }

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
              تعديل معلومات الشركة
            </h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="p-8 rounded-3xl border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {company.name}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                معرف الشركة: #{company.id}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                  اسم الشركة *
                </Label>
                <Input
                  id="name"
                  value={company.name}
                  onChange={(e) => setCompany({ ...company, name: e.target.value })}
                  placeholder="JOUW DRIVER SRL"
                  className="rounded-2xl h-12"
                />
              </div>

              <div>
                <Label htmlFor="client_name" className="text-sm font-medium mb-2 block">
                  اسم العميل
                </Label>
                <Input
                  id="client_name"
                  value={company.client_name || ''}
                  onChange={(e) => setCompany({ ...company, client_name: e.target.value })}
                  placeholder="اسم العميل الرسمي"
                  className="rounded-2xl h-12"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  يستخدم في الفواتير والمراسلات الرسمية
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="vat_number" className="text-sm font-medium mb-2 block">
                  رقم VAT *
                </Label>
                <Input
                  id="vat_number"
                  value={company.vat_number}
                  onChange={(e) => setCompany({ ...company, vat_number: e.target.value })}
                  placeholder="BE0123456789"
                  className="rounded-2xl h-12"
                />
              </div>

              <div>
                <Label htmlFor="kbo_number" className="text-sm font-medium mb-2 block">
                  رقم KBO *
                </Label>
                <Input
                  id="kbo_number"
                  value={company.kbo_number}
                  onChange={(e) => setCompany({ ...company, kbo_number: e.target.value })}
                  placeholder="0123456789"
                  className="rounded-2xl h-12"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  رقم تسجيل الشركة البلجيكي (مطلوب لـ Chiron)
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="address" className="text-sm font-medium mb-2 block">
                العنوان
              </Label>
              <Textarea
                id="address"
                value={company.address || ''}
                onChange={(e) => setCompany({ ...company, address: e.target.value })}
                placeholder="Rue de la Loi 1, 1000 Brussels, Belgium"
                className="rounded-2xl min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="email" className="text-sm font-medium mb-2 block">
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={company.email || ''}
                  onChange={(e) => setCompany({ ...company, email: e.target.value })}
                  placeholder="info@company.be"
                  className="rounded-2xl h-12"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium mb-2 block">
                  رقم الهاتف
                </Label>
                <Input
                  id="phone"
                  value={company.phone || ''}
                  onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                  placeholder="+32 2 XXX XX XX"
                  className="rounded-2xl h-12"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="logo_url" className="text-sm font-medium mb-2 block">
                رابط الشعار (Logo URL)
              </Label>
              <Input
                id="logo_url"
                value={company.logo_url || ''}
                onChange={(e) => setCompany({ ...company, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="rounded-2xl h-12"
              />
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 h-14 rounded-2xl text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/30"
              >
                {saving ? (
                  <Loader2 className="w-6 h-6 animate-spin ml-2" />
                ) : (
                  <Save className="w-6 h-6 ml-2" />
                )}
                حفظ التغييرات
              </Button>

              <Link href="/admin/companies" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full h-14 rounded-2xl text-lg font-semibold"
                >
                  إلغاء
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
