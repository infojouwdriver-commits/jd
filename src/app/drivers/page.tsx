
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  ArrowLeft,
  Plus,
  Search,
  Phone,
  Mail,
  IdCard,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

interface Driver {
  id: number;
  full_name: string;
  national_id: string;
  driver_license: string;
  capacity_certificate_number: string;
  phone: string;
  status: string;
  created_at: string;
}

export default function DriversPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({
    full_name: '',
    national_id: '',
    driver_license: '',
    capacity_certificate_number: '',
    phone: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
    if (!isLoading && user?.role !== 'app20251225073911jaqqaxdfir_v1_admin_user') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const data = await api.get<Driver[]>('/drivers');
      setDrivers(data);
    } catch (error: any) {
      toast.error(error.message || 'فشل تحميل السائقين');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'app20251225073911jaqqaxdfir_v1_admin_user') {
      fetchDrivers();
    }
  }, [user]);

  const handleCreateDriver = async () => {
    if (!newDriver.full_name || !newDriver.email || !newDriver.password) {
      toast.error('الاسم والبريد الإلكتروني وكلمة المرور مطلوبة');
      return;
    }

    try {
      await api.post('/drivers', newDriver);
      toast.success('تم إضافة السائق بنجاح');
      setDialogOpen(false);
      setNewDriver({
        full_name: '',
        national_id: '',
        driver_license: '',
        capacity_certificate_number: '',
        phone: '',
        email: '',
        password: ''
      });
      fetchDrivers();
    } catch (error: any) {
      toast.error(error.message || 'فشل إضافة السائق');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
            <CheckCircle2 className="w-3 h-3 ml-1" />
            نشط
          </Badge>
        );
      case 'inactive':
        return (
          <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-0">
            <XCircle className="w-3 h-3 ml-1" />
            غير نشط
          </Badge>
        );
      case 'suspended':
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">
            <AlertCircle className="w-3 h-3 ml-1" />
            موقوف
          </Badge>
        );
      default:
        return null;
    }
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.phone?.includes(searchQuery) ||
    driver.national_id?.includes(searchQuery)
  );

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== 'app20251225073911jaqqaxdfir_v1_admin_user') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-2xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              إدارة السائقين
            </h1>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600">
                  <Plus className="w-5 h-5 ml-2" />
                  إضافة سائق
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl">
                <DialogHeader>
                  <DialogTitle>إضافة سائق جديد</DialogTitle>
                  <DialogDescription>
                    أدخل معلومات السائق الجديد
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>الاسم الكامل *</Label>
                    <Input
                      value={newDriver.full_name}
                      onChange={(e) => setNewDriver({ ...newDriver, full_name: e.target.value })}
                      className="rounded-2xl mt-2"
                      placeholder="أدخل الاسم الكامل"
                    />
                  </div>
                  <div>
                    <Label>البريد الإلكتروني *</Label>
                    <Input
                      type="email"
                      value={newDriver.email}
                      onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                      className="rounded-2xl mt-2"
                      placeholder="example@email.com"
                    />
                  </div>
                  <div>
                    <Label>كلمة المرور *</Label>
                    <Input
                      type="password"
                      value={newDriver.password}
                      onChange={(e) => setNewDriver({ ...newDriver, password: e.target.value })}
                      className="rounded-2xl mt-2"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <Label>رقم الهوية الوطنية</Label>
                    <Input
                      value={newDriver.national_id}
                      onChange={(e) => setNewDriver({ ...newDriver, national_id: e.target.value })}
                      className="rounded-2xl mt-2"
                      placeholder="أدخل رقم الهوية"
                    />
                  </div>
                  <div>
                    <Label>رقم رخصة القيادة</Label>
                    <Input
                      value={newDriver.driver_license}
                      onChange={(e) => setNewDriver({ ...newDriver, driver_license: e.target.value })}
                      className="rounded-2xl mt-2"
                      placeholder="أدخل رقم الرخصة"
                    />
                  </div>
                  <div>
                    <Label>رقم شهادة الكفاءة</Label>
                    <Input
                      value={newDriver.capacity_certificate_number}
                      onChange={(e) => setNewDriver({ ...newDriver, capacity_certificate_number: e.target.value })}
                      className="rounded-2xl mt-2"
                      placeholder="أدخل رقم الشهادة"
                    />
                  </div>
                  <div>
                    <Label>رقم الهاتف</Label>
                    <Input
                      value={newDriver.phone}
                      onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                      className="rounded-2xl mt-2"
                      placeholder="+32 XXX XX XX XX"
                    />
                  </div>
                  <Button 
                    onClick={handleCreateDriver}
                    className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600"
                  >
                    إضافة السائق
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن سائق..."
              className="pr-12 rounded-2xl border-slate-200 dark:border-slate-700 h-12"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 rounded-3xl border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">إجمالي السائقين</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{drivers.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-3xl border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">السائقون النشطون</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {drivers.filter(d => d.status === 'active').length}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-3xl border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">السائقون الموقوفون</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {drivers.filter(d => d.status === 'suspended').length}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                <AlertCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Drivers List */}
        <div className="space-y-4">
          {filteredDrivers.length === 0 ? (
            <Card className="p-12 rounded-3xl border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
              <div className="text-center">
                <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-slate-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400">لا يوجد سائقون</p>
              </div>
            </Card>
          ) : (
            filteredDrivers.map((driver) => (
              <Card 
                key={driver.id}
                className="p-6 rounded-3xl border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          {driver.full_name}
                        </h3>
                        {getStatusBadge(driver.status)}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        انضم في {new Date(driver.created_at).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {driver.national_id && (
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
                      <IdCard className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">رقم الهوية</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {driver.national_id}
                        </p>
                      </div>
                    </div>
                  )}

                  {driver.driver_license && (
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
                      <IdCard className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">رخصة القيادة</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {driver.driver_license}
                        </p>
                      </div>
                    </div>
                  )}

                  {driver.capacity_certificate_number && (
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
                      <IdCard className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">شهادة الكفاءة</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {driver.capacity_certificate_number}
                        </p>
                      </div>
                    </div>
                  )}

                  {driver.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
                      <Phone className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">رقم الهاتف</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {driver.phone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
