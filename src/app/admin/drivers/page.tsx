
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
  IdCard,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Copy,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Driver {
  id: number;
  user_id: number;
  company_id: number;
  full_name: string;
  national_id: string;
  driver_license: string;
  capacity_certificate_number: string;
  phone: string;
  status: string;
  created_at: string;
}

interface Company {
  id: number;
  name: string;
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiError) {
    return error?.errorMessage || fallbackMessage;
  }

  if (error instanceof Error) {
    return error?.message || fallbackMessage;
  }

  return fallbackMessage;
}

export default function AdminDriversPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [newDriver, setNewDriver] = useState({
    company_id: '',
    full_name: '',
    national_id: '',
    driver_license: '',
    capacity_certificate_number: '',
    phone: '',
    password: ''
  });
  const [editDriver, setEditDriver] = useState({
    company_id: '',
    full_name: '',
    national_id: '',
    driver_license: '',
    capacity_certificate_number: '',
    phone: '',
    status: '',
    password: ''
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }

    if (!isLoading && user && !user?.isAdmin) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const fetchDrivers = async () => {
    setLoading(true);

    try {
      const data = await api.get<Driver[]>('/drivers');
      setDrivers(data);
    } catch (error) {
      toast.error(getErrorMessage(error, 'فشل تحميل السائقين'));
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const data = await api.get<Company[]>('/companies');
      setCompanies(data);
    } catch (error) {
      toast.error(getErrorMessage(error, 'فشل تحميل الشركات'));
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      fetchDrivers();
      fetchCompanies();
    }
  }, [user]);

  const copyToClipboard = async (text: string, type: 'phone' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'phone') {
        setCopiedPhone(text);
        setTimeout(() => setCopiedPhone(null), 2000);
      }
      toast.success(`تم نسخ ${type === 'phone' ? 'رقم الهاتف' : 'كلمة المرور'}`);
    } catch {
      toast.error('فشل النسخ');
    }
  };

  const handleCreateDriver = async () => {
    if (!newDriver.company_id || !newDriver.full_name || !newDriver.phone || !newDriver.password) {
      toast.error('الشركة والاسم ورقم الهاتف وكلمة المرور مطلوبة');
      return;
    }

    try {
      await api.post('/drivers', {
        ...newDriver,
        company_id: parseInt(newDriver.company_id)
      });

      toast.success('تم إنشاء حساب السائق بنجاح', {
        description: `رقم الهاتف: ${newDriver.phone}`,
        duration: 5000,
      });

      setDialogOpen(false);
      setNewDriver({
        company_id: '',
        full_name: '',
        national_id: '',
        driver_license: '',
        capacity_certificate_number: '',
        phone: '',
        password: ''
      });
      fetchDrivers();
    } catch (error) {
      toast.error(getErrorMessage(error, 'فشل إضافة السائق'));
    }
  };

  const handleEditDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setEditDriver({
      company_id: driver.company_id.toString(),
      full_name: driver.full_name,
      national_id: driver?.national_id || '',
      driver_license: driver?.driver_license || '',
      capacity_certificate_number: driver?.capacity_certificate_number || '',
      phone: driver?.phone || '',
      status: driver.status,
      password: ''
    });
    setEditDialogOpen(true);
  };

  const handleUpdateDriver = async () => {
    if (!selectedDriver) return;

    if (!editDriver.full_name) {
      toast.error('الاسم الكامل مطلوب');
      return;
    }

    try {
      const updateData: any = {
        company_id: parseInt(editDriver.company_id),
        full_name: editDriver.full_name,
        national_id: editDriver.national_id || null,
        driver_license: editDriver.driver_license || null,
        capacity_certificate_number: editDriver.capacity_certificate_number || null,
        phone: editDriver.phone || null,
        status: editDriver.status
      };

      if (editDriver.password && editDriver.password.trim() !== '') {
        updateData.password = editDriver.password;
      }

      await api.put(`/drivers?id=${selectedDriver.id}`, updateData);

      toast.success('تم تحديث بيانات السائق بنجاح');
      setEditDialogOpen(false);
      setSelectedDriver(null);
      fetchDrivers();
    } catch (error) {
      toast.error(getErrorMessage(error, 'فشل تحديث بيانات السائق'));
    }
  };

  const handleDeleteDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteDriver = async () => {
    if (!selectedDriver) return;

    try {
      await api.delete(`/drivers?id=${selectedDriver.id}`);
      toast.success('تم حذف السائق وحساب المستخدم المرتبط به بنجاح');
      setDeleteDialogOpen(false);
      setSelectedDriver(null);
      fetchDrivers();
    } catch (error) {
      toast.error(getErrorMessage(error, 'فشل حذف السائق'));
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

  const filteredDrivers = drivers.filter((driver) =>
    driver.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver?.phone?.includes(searchQuery) ||
    driver?.national_id?.includes(searchQuery)
  );

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
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
              <DialogContent className="rounded-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>إضافة سائق جديد</DialogTitle>
                  <DialogDescription>
                    سيتم إنشاء حساب تسجيل دخول تلقائياً للسائق
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>الشركة *</Label>
                    <Select
                      value={newDriver.company_id}
                      onValueChange={(value) => setNewDriver({ ...newDriver, company_id: value })}
                    >
                      <SelectTrigger className="rounded-2xl mt-2">
                        <SelectValue placeholder="اختر الشركة" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id.toString()}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                    <Label>رقم الهاتف * (سيستخدم لتسجيل الدخول)</Label>
                    <Input
                      value={newDriver.phone}
                      onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                      className="rounded-2xl mt-2"
                      placeholder="+32 XXX XX XX XX"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      سيستخدم السائق رقم الهاتف هذا لتسجيل الدخول
                    </p>
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
                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-2">
                      📱 معلومات تسجيل الدخول:
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                      <li>• رقم الهاتف: {newDriver.phone || '(لم يتم إدخاله بعد)'}</li>
                      <li>• كلمة المرور: {newDriver.password ? '••••••••' : '(لم يتم إدخالها بعد)'}</li>
                      <li>• رابط تسجيل الدخول: /driver-login</li>
                    </ul>
                  </div>
                  <Button
                    onClick={handleCreateDriver}
                    className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600"
                  >
                    إنشاء حساب السائق
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
                  {drivers.filter((driver) => driver.status === 'active').length}
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
                  {drivers.filter((driver) => driver.status === 'suspended').length}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                <AlertCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </Card>
        </div>

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
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-2xl"
                      onClick={() => handleEditDriver(driver)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-2xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => handleDeleteDriver(driver)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {driver?.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
                      <Phone className="w-5 h-5 text-orange-500" />
                      <div className="flex-1">
                        <p className="text-xs text-slate-600 dark:text-slate-400">رقم الهاتف (تسجيل الدخول)</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {driver.phone}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl"
                        onClick={() => copyToClipboard(driver.phone, 'phone')}
                      >
                        {copiedPhone === driver.phone ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  )}

                  {driver?.national_id && (
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

                  {driver?.driver_license && (
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

                  {driver?.capacity_certificate_number && (
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
                </div>
              </Card>
            ))
          )}
        </div>
      </main>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل بيانات السائق</DialogTitle>
            <DialogDescription>
              قم بتحديث معلومات السائق
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>الشركة *</Label>
              <Select
                value={editDriver.company_id}
                onValueChange={(value) => setEditDriver({ ...editDriver, company_id: value })}
              >
                <SelectTrigger className="rounded-2xl mt-2">
                  <SelectValue placeholder="اختر الشركة" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>الاسم الكامل *</Label>
              <Input
                value={editDriver.full_name}
                onChange={(e) => setEditDriver({ ...editDriver, full_name: e.target.value })}
                className="rounded-2xl mt-2"
                placeholder="أدخل الاسم الكامل"
              />
            </div>
            <div>
              <Label>رقم الهاتف (تسجيل الدخول)</Label>
              <Input
                value={editDriver.phone}
                onChange={(e) => setEditDriver({ ...editDriver, phone: e.target.value })}
                className="rounded-2xl mt-2"
                placeholder="+32 XXX XX XX XX"
              />
              <p className="text-xs text-slate-500 mt-1">
                تغيير رقم الهاتف سيغير بيانات تسجيل الدخول
              </p>
            </div>
            <div>
              <Label>كلمة المرور الجديدة (اتركها فارغة إذا لم ترد التغيير)</Label>
              <Input
                type="password"
                value={editDriver.password}
                onChange={(e) => setEditDriver({ ...editDriver, password: e.target.value })}
                className="rounded-2xl mt-2"
                placeholder="••••••••"
              />
            </div>
            <div>
              <Label>رقم الهوية الوطنية</Label>
              <Input
                value={editDriver.national_id}
                onChange={(e) => setEditDriver({ ...editDriver, national_id: e.target.value })}
                className="rounded-2xl mt-2"
                placeholder="أدخل رقم الهوية"
              />
            </div>
            <div>
              <Label>رقم رخصة القيادة</Label>
              <Input
                value={editDriver.driver_license}
                onChange={(e) => setEditDriver({ ...editDriver, driver_license: e.target.value })}
                className="rounded-2xl mt-2"
                placeholder="أدخل رقم الرخصة"
              />
            </div>
            <div>
              <Label>رقم شهادة الكفاءة</Label>
              <Input
                value={editDriver.capacity_certificate_number}
                onChange={(e) => setEditDriver({ ...editDriver, capacity_certificate_number: e.target.value })}
                className="rounded-2xl mt-2"
                placeholder="أدخل رقم الشهادة"
              />
            </div>
            <div>
              <Label>الحالة *</Label>
              <Select
                value={editDriver.status}
                onValueChange={(value) => setEditDriver({ ...editDriver, status: value })}
              >
                <SelectTrigger className="rounded-2xl mt-2">
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                  <SelectItem value="suspended">موقوف</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleUpdateDriver}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600"
            >
              حفظ التغييرات
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا السائق؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بيانات السائق وحساب المستخدم المرتبط به بشكل نهائي.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteDriver}
              className="rounded-2xl bg-red-600 hover:bg-red-700"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
