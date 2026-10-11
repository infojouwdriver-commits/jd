
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { 
  Settings, 
  ArrowLeft, 
  DollarSign, 
  FileText, 
  Zap,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface Company {
  id: number;
  name: string;
  vat_number: string;
  kbo_number: string;
  address: string;
  email: string;
  phone: string;
}

export default function CompanySettingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && user && !user.isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.isAdmin && companyId) {
      fetchCompany();
    }
  }, [user, companyId]);

  const fetchCompany = async () => {
    setLoading(true);
    try {
      const data = await api.get<Company[]>(`/companies?id=${companyId}`);
      setCompany(data?.find(item => String(item.id) === companyId) || null);
    } catch (error: any) {
      console.error("Operation failed");
      toast.error('فشل تحميل بيانات الشركة');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading || !user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!company) return <div className="p-6 text-center">
    <h1 className="text-xl font-bold">تعذّر العثور على الشركة</h1>
    <Link href="/admin/companies" className="mt-4 inline-block underline">العودة إلى الشركات</Link>
  </div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/companies">
            <Button variant="outline" size="icon" className="rounded-xl">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">إعدادات الشركة</h1>
              <p className="text-muted-foreground">{company?.name || 'جاري التحميل...'}</p>
            </div>
          </div>
        </div>

        {/* Settings Cards */}
        <div className="grid gap-6">
          {/* Pricing Settings */}
          <Link href={`/admin/companies/${companyId}/pricing`}>
            <Card className="rounded-3xl border-border/50 shadow-xl hover:shadow-2xl transition-all cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>إعدادات التسعير</CardTitle>
                      <CardDescription>إدارة أسعار الرحلات والرسوم الإضافية</CardDescription>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>
          </Link>

          {/* Chiron Settings */}
          <Link href={`/admin/companies/${companyId}/chiron-settings`}>
            <Card className="rounded-3xl border-border/50 shadow-xl hover:shadow-2xl transition-all cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>إعدادات Chiron</CardTitle>
                      <CardDescription>إدارة اتصال Chiron API - بيئة الاختبار والإنتاج</CardDescription>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>
          </Link>

          {/* Platform Contracts */}
          <Link href={`/admin/companies/${companyId}/platform-contracts`}>
            <Card className="rounded-3xl border-border/50 shadow-xl hover:shadow-2xl transition-all cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>عقود المنصات الخارجية</CardTitle>
                      <CardDescription>إدارة عقود Uber و Bolt و Heetch</CardDescription>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>
          </Link>

          {/* Contracts Management */}
          <Link href={`/admin/companies/${companyId}/contracts`}>
            <Card className="rounded-3xl border-border/50 shadow-xl hover:shadow-2xl transition-all cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>إدارة العقود</CardTitle>
                      <CardDescription>عقود الاشتراك السنوية والتوقيع الإلكتروني</CardDescription>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
