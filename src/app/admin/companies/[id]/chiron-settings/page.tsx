
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Settings, Save, ArrowLeft, TestTube, Rocket } from 'lucide-react';
import Link from 'next/link';

interface Company {
  id: number;
  transmissionEnabled: boolean;
  productionEnabled: boolean;
  testCredentialsConfigured: boolean;
  name: string;
  chiron_mode: 'TEST' | 'PRODUCTION';
  chiron_test_client_id: string;
  chiron_test_client_secret: string;
  chiron_test_auth_url: string;
  chiron_test_api_url: string;
  chiron_prod_client_id: string;
  chiron_prod_client_secret: string;
  chiron_prod_auth_url: string;
  chiron_prod_api_url: string;
}

export default function ChironSettingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    chiron_mode: 'TEST' as 'TEST' | 'PRODUCTION',
    chiron_test_client_id: '',
    chiron_test_client_secret: '',
    chiron_test_auth_url: 'https://mow-acc.api.vlaanderen.be/oauth/token',
    chiron_test_api_url: 'https://mow-acc.api.vlaanderen.be/chiron/taxirit',
    chiron_prod_client_id: '',
    chiron_prod_client_secret: '',
    chiron_prod_auth_url: 'https://mow.api.vlaanderen.be/oauth/token',
    chiron_prod_api_url: 'https://mow.api.vlaanderen.be/chiron/taxirit',
  });

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
      const data = await api.get<Company>(`/chiron-settings?company_id=${companyId}`);
      if (data) {
        setCompany(data);
        setFormData({
          chiron_mode: data.chiron_mode || 'TEST',
          chiron_test_client_id: data.chiron_test_client_id || '',
          chiron_test_client_secret: data.chiron_test_client_secret || '',
          chiron_test_auth_url: data.chiron_test_auth_url || 'https://mow-acc.api.vlaanderen.be/oauth/token',
          chiron_test_api_url: data.chiron_test_api_url || 'https://mow-acc.api.vlaanderen.be/chiron/taxirit',
          chiron_prod_client_id: data.chiron_prod_client_id || '',
          chiron_prod_client_secret: data.chiron_prod_client_secret || '',
          chiron_prod_auth_url: data.chiron_prod_auth_url || 'https://mow.api.vlaanderen.be/oauth/token',
          chiron_prod_api_url: data.chiron_prod_api_url || 'https://mow.api.vlaanderen.be/chiron/taxirit',
        });
      }
    } catch (error: any) {
      console.error("Operation failed");
      toast.error('فشل تحميل بيانات الشركة');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await api.put(`/chiron-settings?id=${companyId}`, formData);
      toast.success('تم تحديث الإعدادات بنجاح');
      fetchCompany();
    } catch (error: any) {
      toast.error('فشلت العملية: ' + error.message);
    }
  };

  if (isLoading || !user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="container mx-auto max-w-5xl">
        <div role="status" className="mb-6 rounded-2xl border border-border bg-card p-4 text-sm leading-7">
          <p>{company?.transmissionEnabled ? 'مزامنة بيئة الاختبار متاحة.' : 'مزامنة Chiron غير مفعّلة على الخادم.'}</p>
          <p>{company?.testCredentialsConfigured ? 'بيانات اتصال الاختبار محفوظة. يمكنك إجراء اختبار القبول.' : 'أدخل بيانات Client ID وClient Secret التي حصلت عليها من Chiron لبيئة الاختبار.'}</p>
          <p>الإرسال الفعلي إلى PRODUCTION يحتاج إكمال اختبار القبول وتفعيل بيئة الإنتاج.</p>
          <Link href="/admin/test-trips" className="mt-2 inline-block font-semibold underline">فتح اختبار قبول Chiron</Link>
        </div>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/admin/companies/${companyId}/settings`}>
            <Button variant="outline" size="icon" className="rounded-xl">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">إعدادات Chiron</h1>
              <p className="text-muted-foreground">إدارة اتصال Chiron API - بيئة الاختبار والإنتاج</p>
            </div>
          </div>
        </div>

        {/* Environment Mode Selector */}
        <Card className="mb-6 rounded-3xl border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle>وضع البيئة النشط</CardTitle>
            <CardDescription>اختر البيئة المستخدمة حالياً (الاختبار أو الإنتاج)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                variant={formData.chiron_mode === 'TEST' ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, chiron_mode: 'TEST' })}
                className="flex-1 rounded-xl h-20"
              >
                <div className="flex flex-col items-center gap-2">
                  <TestTube className="w-6 h-6" />
                  <span>بيئة الاختبار (TEST)</span>
                </div>
              </Button>
              <Button
                variant={formData.chiron_mode === 'PRODUCTION' ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, chiron_mode: 'PRODUCTION' })}
                className="flex-1 rounded-xl h-20"
              >
                <div className="flex flex-col items-center gap-2">
                  <Rocket className="w-6 h-6" />
                  <span>بيئة الإنتاج (PRODUCTION)</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Credentials Tabs */}
        <Card className="mb-6 rounded-3xl border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle>بيانات الاتصال</CardTitle>
            <CardDescription>معلومات OAuth2 لكل بيئة</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="test" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="test" className="flex items-center gap-2">
                  <TestTube className="w-4 h-4" />
                  بيئة الاختبار
                </TabsTrigger>
                <TabsTrigger value="production" className="flex items-center gap-2">
                  <Rocket className="w-4 h-4" />
                  بيئة الإنتاج
                </TabsTrigger>
              </TabsList>

              {/* Test Environment */}
              <TabsContent value="test" className="space-y-4">
                <div>
                  <Label htmlFor="chiron_test_client_id">Client ID (اختبار) *</Label>
                  <Input
                    id="chiron_test_client_id"
                    value={formData.chiron_test_client_id}
                    onChange={(e) => setFormData({ ...formData, chiron_test_client_id: e.target.value })}
                    placeholder="أدخل Client ID لبيئة الاختبار"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="chiron_test_client_secret">Client Secret (اختبار) *</Label>
                  <Input
                    id="chiron_test_client_secret"
                    type="password"
                    value={formData.chiron_test_client_secret}
                    onChange={(e) => setFormData({ ...formData, chiron_test_client_secret: e.target.value })}
                    placeholder="أدخل Client Secret لبيئة الاختبار"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="chiron_test_auth_url">OAuth URL (اختبار)</Label>
                  <Input
                    id="chiron_test_auth_url"
                    value={formData.chiron_test_auth_url}
                    onChange={(e) => setFormData({ ...formData, chiron_test_auth_url: e.target.value })}
                    className="rounded-xl"
                    dir="ltr"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    الافتراضي: https://mow-acc.api.vlaanderen.be/oauth/token
                  </p>
                </div>
                <div>
                  <Label htmlFor="chiron_test_api_url">API Base URL (اختبار)</Label>
                  <Input
                    id="chiron_test_api_url"
                    value={formData.chiron_test_api_url}
                    onChange={(e) => setFormData({ ...formData, chiron_test_api_url: e.target.value })}
                    className="rounded-xl"
                    dir="ltr"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    الافتراضي: https://mow-acc.api.vlaanderen.be/chiron/taxirit
                  </p>
                </div>
              </TabsContent>

              {/* Production Environment */}
              <TabsContent value="production" className="space-y-4">
                <div>
                  <Label htmlFor="chiron_prod_client_id">Client ID (إنتاج) *</Label>
                  <Input
                    id="chiron_prod_client_id"
                    value={formData.chiron_prod_client_id}
                    onChange={(e) => setFormData({ ...formData, chiron_prod_client_id: e.target.value })}
                    placeholder="أدخل Client ID لبيئة الإنتاج"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="chiron_prod_client_secret">Client Secret (إنتاج) *</Label>
                  <Input
                    id="chiron_prod_client_secret"
                    type="password"
                    value={formData.chiron_prod_client_secret}
                    onChange={(e) => setFormData({ ...formData, chiron_prod_client_secret: e.target.value })}
                    placeholder="أدخل Client Secret لبيئة الإنتاج"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="chiron_prod_auth_url">OAuth URL (إنتاج)</Label>
                  <Input
                    id="chiron_prod_auth_url"
                    value={formData.chiron_prod_auth_url}
                    onChange={(e) => setFormData({ ...formData, chiron_prod_auth_url: e.target.value })}
                    className="rounded-xl"
                    dir="ltr"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    الافتراضي: https://mow.api.vlaanderen.be/oauth/token
                  </p>
                </div>
                <div>
                  <Label htmlFor="chiron_prod_api_url">API Base URL (إنتاج)</Label>
                  <Input
                    id="chiron_prod_api_url"
                    value={formData.chiron_prod_api_url}
                    onChange={(e) => setFormData({ ...formData, chiron_prod_api_url: e.target.value })}
                    className="rounded-xl"
                    dir="ltr"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    الافتراضي: https://mow.api.vlaanderen.be/chiron/taxirit
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <Button onClick={handleSaveSettings} className="rounded-xl w-full mt-6">
              <Save className="w-4 h-4 mr-2" />
              حفظ جميع الإعدادات
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
