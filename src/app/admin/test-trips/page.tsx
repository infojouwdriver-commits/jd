
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Send, CheckCircle2, XCircle, AlertCircle, ArrowLeft, Download, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import Link from 'next/link';
import { PDFGenerator } from '@/lib/pdf-generator';
import { isAcceptedTestMessage, acceptanceReportMessages } from '@/lib/chiron-test-result';

interface Company {
  id: number;
  name: string;
  chiron_mode: string;
  kbo_number: string;
  address: string;
  email: string;
  phone: string;
  vat_number: string;
}

interface Driver {
  id: number;
  full_name: string;
  company_id: number;
  capacity_certificate_number: string;
  phone: string;
}

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  plate_number: string;
  company_id: number;
}

export default function AcceptanceTestPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // تحميل البيانات
  useEffect(() => {
    const loadData = async () => {
      try {
        const [companiesData, driversData, vehiclesData] = await Promise.all([
          api.get<Company[]>('/companies'),
          api.get<Driver[]>('/drivers'),
          api.get<Vehicle[]>('/vehicles')
        ]);
        
        setCompanies(companiesData);
        setDrivers(driversData);
        setVehicles(vehiclesData);
      } catch (error) {
        console.error("Operation failed");
        toast.error('فشل تحميل البيانات');
      }
    };
    
    if (user) {
      loadData();
    }
  }, [user]);

  // تصفية السائقين والمركبات حسب الشركة المختارة
  const filteredDrivers = selectedCompany 
    ? drivers.filter(d => d.company_id === parseInt(selectedCompany))
    : [];
    
  const filteredVehicles = selectedCompany
    ? vehicles.filter(v => v.company_id === parseInt(selectedCompany))
    : [];

  // تنفيذ اختبار القبول
  const runAcceptanceTest = async () => {
    if (!selectedCompany || !selectedDriver || !selectedVehicle) {
      toast.error('يرجى اختيار الشركة والسائق والمركبة');
      return;
    }

    setLoading(true);
    setTestResult(null);

    try {
      const result = await api.post('/test-trips/acceptance-test', {
        company_id: parseInt(selectedCompany),
        driver_id: parseInt(selectedDriver),
        vehicle_id: parseInt(selectedVehicle)
      });

      setTestResult(result);
      
      if (result.success) {
        toast.success('✅ تم إرسال جميع الرسائل التجريبية بنجاح!');
      } else {
        toast.warning('⚠️ تم إرسال الرسائل ولكن بعضها فشل');
      }
    } catch (error: any) {
      toast.error(error.message || 'فشل تنفيذ الاختبار');
      console.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  // تحميل تقرير PDF
  const downloadPDFReport = () => {
    if (!testResult || !selectedCompany || !selectedDriver || !selectedVehicle) {
      toast.error('لا توجد نتائج اختبار لتحميلها');
      return;
    }

    try {
      const company = companies.find(c => c.id === parseInt(selectedCompany));
      const driver = drivers.find(d => d.id === parseInt(selectedDriver));
      const vehicle = vehicles.find(v => v.id === parseInt(selectedVehicle));

      if (!company || !driver || !vehicle) {
        toast.error('فشل جلب معلومات الشركة أو السائق أو المركبة');
        return;
      }

      const reportData = {
        company: {
          id: company.id,
          name: company.name,
          kbo_number: company.kbo_number || 'N/A',
          address: company.address || 'N/A',
          email: company.email || 'N/A',
          phone: company.phone || 'N/A',
          vat_number: company.vat_number || 'N/A'
        },
        driver: {
          id: driver.id,
          full_name: driver.full_name,
          capacity_certificate_number: driver.capacity_certificate_number || 'N/A',
          phone: driver.phone || 'N/A'
        },
        vehicle: {
          id: vehicle.id,
          brand: vehicle.brand,
          model: vehicle.model,
          plate_number: vehicle.plate_number
        },
        testDate: new Date().toISOString(),
        totalMessages: testResult.totalMessages || 0,
        successCount: testResult.successCount || 0,
        failedCount: testResult.failedCount || 0,
        results: acceptanceReportMessages(testResult.results || [])
      };

      const pdf = PDFGenerator.generateAcceptanceTestReport(reportData);
      const filename = `Chiron_Acceptatietest_${company.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      PDFGenerator.downloadPDF(pdf, filename);
      
      toast.success('تم تحميل التقرير بنجاح');
    } catch (error) {
      console.error("Operation failed");
      toast.error('فشل توليد تقرير PDF');
    }
  };

  // طباعة تقرير PDF
  const printPDFReport = () => {
    if (!testResult || !selectedCompany || !selectedDriver || !selectedVehicle) {
      toast.error('لا توجد نتائج اختبار للطباعة');
      return;
    }

    try {
      const company = companies.find(c => c.id === parseInt(selectedCompany));
      const driver = drivers.find(d => d.id === parseInt(selectedDriver));
      const vehicle = vehicles.find(v => v.id === parseInt(selectedVehicle));

      if (!company || !driver || !vehicle) {
        toast.error('فشل جلب معلومات الشركة أو السائق أو المركبة');
        return;
      }

      const reportData = {
        company: {
          id: company.id,
          name: company.name,
          kbo_number: company.kbo_number || 'N/A',
          address: company.address || 'N/A',
          email: company.email || 'N/A',
          phone: company.phone || 'N/A',
          vat_number: company.vat_number || 'N/A'
        },
        driver: {
          id: driver.id,
          full_name: driver.full_name,
          capacity_certificate_number: driver.capacity_certificate_number || 'N/A',
          phone: driver.phone || 'N/A'
        },
        vehicle: {
          id: vehicle.id,
          brand: vehicle.brand,
          model: vehicle.model,
          plate_number: vehicle.plate_number
        },
        testDate: new Date().toISOString(),
        totalMessages: testResult.totalMessages || 0,
        successCount: testResult.successCount || 0,
        failedCount: testResult.failedCount || 0,
        results: acceptanceReportMessages(testResult.results || [])
      };

      const pdf = PDFGenerator.generateAcceptanceTestReport(reportData);
      PDFGenerator.printPDF(pdf);
      
      toast.success('جاري فتح نافذة الطباعة...');
    } catch (error) {
      console.error("Operation failed");
      toast.error('فشل طباعة التقرير');
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header مع زر الرجوع */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-2xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                اختبار القبول - Chiron
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                إرسال 5 رسائل VERTREK + 5 رسائل AANKOMST إلى بيئة Chiron الاختبارية
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        {/* نموذج الاختيار */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>إعدادات الاختبار</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* اختيار الشركة */}
            <div>
              <label className="text-sm font-medium mb-2 block">الشركة</label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الشركة" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(company => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.name} ({company.chiron_mode || 'TEST'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* اختيار السائق */}
            <div>
              <label className="text-sm font-medium mb-2 block">السائق</label>
              <Select 
                value={selectedDriver} 
                onValueChange={setSelectedDriver}
                disabled={!selectedCompany}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر السائق" />
                </SelectTrigger>
                <SelectContent>
                  {filteredDrivers.map(driver => (
                    <SelectItem key={driver.id} value={driver.id.toString()}>
                      {driver.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* اختيار المركبة */}
            <div>
              <label className="text-sm font-medium mb-2 block">المركبة</label>
              <Select 
                value={selectedVehicle} 
                onValueChange={setSelectedVehicle}
                disabled={!selectedCompany}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المركبة" />
                </SelectTrigger>
                <SelectContent>
                  {filteredVehicles.map(vehicle => (
                    <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                      {vehicle.brand} {vehicle.model} - {vehicle.plate_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* زر التنفيذ */}
            <Button
              onClick={runAcceptanceTest}
              disabled={loading || !selectedCompany || !selectedDriver || !selectedVehicle}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin ml-2" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 ml-2" />
                  تنفيذ اختبار القبول (10 رسائل)
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* نتائج الاختبار */}
        {testResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-yellow-500" />
                )}
                نتائج الاختبار
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ملخص النتائج */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <div className="text-2xl font-bold">{testResult.totalMessages || 0}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">إجمالي الرسائل</div>
                </div>
                <div className="text-center p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {testResult.successCount || 0}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">نجحت</div>
                </div>
                <div className="text-center p-4 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {testResult.failedCount || 0}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">فشلت</div>
                </div>
              </div>

              {/* تفاصيل الرسائل */}
              <div className="space-y-2">
                <h4 className="font-semibold">تفاصيل الرسائل:</h4>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {testResult.results?.map((result: any, index: number) => (
                    <Alert 
                      key={index}
                      variant={isAcceptedTestMessage(result) ? 'default' : 'destructive'}
                      data-testid="chiron-message-result"
                      data-accepted={isAcceptedTestMessage(result)}
                      className="text-sm"
                    >
                      <div className="flex items-start gap-2">
                        {isAcceptedTestMessage(result) ? (
                          <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 mt-0.5 text-red-500" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">
                            {result.ritnummer || 'N/A'}
                          </div>
                          <div className="mt-1 text-xs">
                            {result.messageType === 'vertrek' ? 'الانطلاق · VERTREK' : result.messageType === 'aankomst' ? 'الوصول · AANKOMST' : 'رسالة الاختبار'}
                            {' · '}{isAcceptedTestMessage(result) ? 'قُبلت الرسالة' : 'لم يُثبت قبول الرسالة'}
                            {Number.isInteger(result.httpStatus) && <> · HTTP {result.httpStatus}</>}
                          </div>
                          {result.error && (
                            <AlertDescription className="mt-1 text-xs">
                              {result.error}
                            </AlertDescription>
                          )}
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              </div>

              {/* أزرار التقرير */}
              {testResult.success && (
                <div className="flex gap-3">
                  <Button
                    onClick={downloadPDFReport}
                    className="flex-1"
                    variant="default"
                  >
                    <Download className="w-4 h-4 ml-2" />
                    تحميل التقرير (PDF)
                  </Button>
                  <Button
                    onClick={printPDFReport}
                    className="flex-1"
                    variant="outline"
                  >
                    <Printer className="w-4 h-4 ml-2" />
                    طباعة التقرير
                  </Button>
                </div>
              )}

              {/* رسالة النجاح */}
              {testResult.success && (
                <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    ✅ تم إرسال جميع الرسائل التجريبية بنجاح! يمكنك الآن تحميل التقرير وتقديمه للبلدية.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* معلومات إضافية */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>ملاحظات مهمة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <p>• يجب أن تكون الشركة في وضع TEST لتنفيذ الاختبار</p>
            <p>• سيتم إرسال 5 رسائل VERTREK (بدء رحلة) و 5 رسائل AANKOMST (وصول)</p>
            <p>• كل رسالة VERTREK مرتبطة برسالة AANKOMST بنفس ritnummer</p>
            <p>• بعد نجاح الاختبار، قم بتحميل التقرير بصيغة PDF</p>
            <p>• قدم التقرير للبلدية للحصول على الموافقة للانتقال إلى وضع PRODUCTION</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
