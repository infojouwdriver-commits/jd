
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Building2,
  Users,
  Car,
  Loader2,
  Plus,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Edit,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface Company {
  id: number;
  name: string;
  vat_number: string;
  kbo_number: string;
  address: string;
  email: string;
  phone: string;
}

interface Driver {
  id: number;
  company_id: number;
  full_name: string;
  phone: string;
  status: string;
}

interface Vehicle {
  id: number;
  company_id: number;
  brand: string;
  model: string;
  plate_number: string;
  status: string;
}

interface ApprovalRequest {
  id: number;
  request_type: string;
  entity_type: string;
  status: string;
  created_at: string;
  request_reason: string;
}

interface Invoice {
  id: number;
  invoice_number: string;
  client_name: string;
  total_tvac: number;
  status: string;
  invoice_date: string;
}

export default function DistributorDashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  
  // نوافذ الحوار
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [showDriverDialog, setShowDriverDialog] = useState(false);
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  
  // بيانات النماذج
  const [newCompany, setNewCompany] = useState({
    name: '',
    vat_number: '',
    kbo_number: '',
    address: '',
    email: '',
    phone: ''
  });
  
  const [newDriver, setNewDriver] = useState({
    company_id: '',
    full_name: '',
    phone: '',
    password: '',
    national_id: '',
    driver_license: '',
    capacity_certificate_number: ''
  });
  
  const [newVehicle, setNewVehicle] = useState({
    company_id: '',
    brand: '',
    model: '',
    plate_number: '',
    vin: '',
    chiron_vehicle_id: ''
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [companiesData, driversData, vehiclesData, requestsData, invoicesData] = await Promise.all([
        api.get<Company[]>('/companies'),
        api.get<Driver[]>('/drivers'),
        api.get<Vehicle[]>('/vehicles'),
        api.get<ApprovalRequest[]>('/approval-requests'),
        api.get<Invoice[]>('/invoices/my-invoices')
      ]);
      
      setCompanies(companiesData);
      setDrivers(driversData);
      setVehicles(vehiclesData);
      setRequests(requestsData);
      setInvoices(invoicesData);
    } catch (error: any) {
      toast.error(error.message || 'فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleCreateCompany = async () => {
    if (!newCompany.name || !newCompany.vat_number || !newCompany.kbo_number) {
      toast.error('اسم الشركة ورقم VAT ورقم KBO مطلوبة');
      return;
    }

    try {
      await api.post('/companies', newCompany);
      toast.success('تم إنشاء الشركة بنجاح');
      setShowCompanyDialog(false);
      setNewCompany({
        name: '',
        vat_number: '',
        kbo_number: '',
        address: '',
        email: '',
        phone: ''
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'فشل إنشاء الشركة');
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
      toast.success('تم إنشاء السائق بنجاح');
      setShowDriverDialog(false);
      setNewDriver({
        company_id: '',
        full_name: '',
        phone: '',
        password: '',
        national_id: '',
        driver_license: '',
        capacity_certificate_number: ''
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'فشل إنشاء السائق');
    }
  };

  const handleCreateVehicle = async () => {
    if (!newVehicle.company_id || !newVehicle.brand || !newVehicle.model || !newVehicle.plate_number) {
      toast.error('الشركة والماركة والموديل ورقم اللوحة مطلوبة');
      return;
    }

    try {
      await api.post('/vehicles', {
        ...newVehicle,
        company_id: parseInt(newVehicle.company_id)
      });
      toast.success('تم إنشاء المركبة بنجاح');
      setShowVehicleDialog(false);
      setNewVehicle({
        company_id: '',
        brand: '',
        model: '',
        plate_number: '',
        vin: '',
        chiron_vehicle_id: ''
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'فشل إنشاء المركبة');
    }
  };

  const handleDeleteCompany = async (id: number) => {
    try {
      const result = await api.delete(`/companies?id=${id}`);
      if (result.status === 'pending_approval') {
        toast.success('تم إرسال طلب الحذف للمسؤول');
      } else {
        toast.success('تم حذف الشركة بنجاح');
      }
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'فشل حذف الشركة');
    }
  };

  const handleDeleteDriver = async (id: number) => {
    try {
      const result = await api.delete(`/drivers?id=${id}`);
      if (result.status === 'pending_approval') {
        toast.success('تم إرسال طلب الحذف للمسؤول');
      } else {
        toast.success('تم حذف السائق بنجاح');
      }
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'فشل حذف السائق');
    }
  };

  const handleDeleteVehicle = async (id: number) => {
    try {
      const result = await api.delete(`/vehicles?id=${id}`);
      if (result.status === 'pending_approval') {
        toast.success('تم إرسال طلب الحذف للمسؤول');
      } else {
        toast.success('تم حذف المركبة بنجاح');
      }
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'فشل حذف المركبة');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-0">
            <Clock className="w-3 h-3 ml-1" />
            قيد الانتظار
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
            <CheckCircle2 className="w-3 h-3 ml-1" />
            موافق عليه
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">
            <XCircle className="w-3 h-3 ml-1" />
            مرفوض
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                لوحة تحكم الموزع
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {user.email}
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={logout}
              className="rounded-2xl"
            >
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 rounded-3xl border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">الشركات</p>
                <p className="text-3xl font-bold mt-2">{companies.length}</p>
              </div>
              <Building2 className="w-12 h-12 opacity-80" />
            </div>
          </Card>

          <Card className="p-6 rounded-3xl border-0 shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">السائقون</p>
                <p className="text-3xl font-bold mt-2">{drivers.length}</p>
              </div>
              <Users className="w-12 h-12 opacity-80" />
            </div>
          </Card>

          <Card className="p-6 rounded-3xl border-0 shadow-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">المركبات</p>
                <p className="text-3xl font-bold mt-2">{vehicles.length}</p>
              </div>
              <Car className="w-12 h-12 opacity-80" />
            </div>
          </Card>

          <Card className="p-6 rounded-3xl border-0 shadow-xl bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">طلبات قيد الانتظار</p>
                <p className="text-3xl font-bold mt-2">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-12 h-12 opacity-80" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="companies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 rounded-3xl p-1 bg-white dark:bg-slate-900 shadow-xl">
            <TabsTrigger value="companies" className="rounded-2xl">الشركات</TabsTrigger>
            <TabsTrigger value="drivers" className="rounded-2xl">السائقون</TabsTrigger>
            <TabsTrigger value="vehicles" className="rounded-2xl">المركبات</TabsTrigger>
            <TabsTrigger value="invoices" className="rounded-2xl">الفواتير</TabsTrigger>
            <TabsTrigger value="requests" className="rounded-2xl">الطلبات</TabsTrigger>
          </TabsList>

          {/* Companies Tab */}
          <TabsContent value="companies" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">الشركات</h2>
              <Dialog open={showCompanyDialog} onOpenChange={setShowCompanyDialog}>
                <DialogTrigger asChild>
                  <Button className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600">
                    <Plus className="w-5 h-5 ml-2" />
                    إضافة شركة
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>إضافة شركة جديدة</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>اسم الشركة *</Label>
                      <Input
                        value={newCompany.name}
                        onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                        placeholder="JOUW DRIVER SRL"
                        className="rounded-2xl"
                      />
                    </div>
                    <div>
                      <Label>رقم VAT *</Label>
                      <Input
                        value={newCompany.vat_number}
                        onChange={(e) => setNewCompany({...newCompany, vat_number: e.target.value})}
                        placeholder="BE0123456789"
                        className="rounded-2xl"
                      />
                    </div>
                    <div>
                      <Label>رقم KBO *</Label>
                      <Input
                        value={newCompany.kbo_number}
                        onChange={(e) => setNewCompany({...newCompany, kbo_number: e.target.value})}
                        placeholder="0123456789"
                        className="rounded-2xl"
                      />
                    </div>
                    <div>
                      <Label>العنوان</Label>
                      <Input
                        value={newCompany.address}
                        onChange={(e) => setNewCompany({...newCompany, address: e.target.value})}
                        placeholder="Brussels, Belgium"
                        className="rounded-2xl"
                      />
                    </div>
                    <div>
                      <Label>البريد الإلكتروني</Label>
                      <Input
                        type="email"
                        value={newCompany.email}
                        onChange={(e) => setNewCompany({...newCompany, email: e.target.value})}
                        placeholder="info@company.be"
                        className="rounded-2xl"
                      />
                    </div>
                    <div>
                      <Label>الهاتف</Label>
                      <Input
                        value={newCompany.phone}
                        onChange={(e) => setNewCompany({...newCompany, phone: e.target.value})}
                        placeholder="+32 2 XXX XX XX"
                        className="rounded-2xl"
                      />
                    </div>
                    <Button
                      onClick={handleCreateCompany}
                      className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600"
                    >
                      إنشاء الشركة
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {companies.map((company) => (
                <Card key={company.id} className="p-6 rounded-3xl border-0 shadow-xl">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{company.name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{company.vat_number}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-2xl text-red-600"
                      onClick={() => {
                        if (confirm('هل أنت متأكد من حذف هذه الشركة؟ سيتم إرسال طلب للمسؤول.')) {
                          handleDeleteCompany(company.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 text-sm">
                    {company.address && <p className="text-slate-600 dark:text-slate-400">{company.address}</p>}
                    {company.email && <p className="text-slate-600 dark:text-slate-400">{company.email}</p>}
                    {company.phone && <p className="text-slate-600 dark:text-slate-400">{company.phone}</p>}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Drivers Tab */}
          <TabsContent value="drivers" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">السائقون</h2>
              <Dialog open={showDriverDialog} onOpenChange={setShowDriverDialog}>
                <DialogTrigger asChild>
                  <Button className="rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600">
                    <Plus className="w-5 h-5 ml-2" />
                    إضافة سائق
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>إضافة سائق جديد</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>الشركة *</Label>
                      <Select
                        value={newDriver.company_id}
                        onValueChange={(value) => setNewDriver({...newDriver, company_id: value})}
                      >
                        <SelectTrigger className="rounded-2xl">
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
                        onChange={(e) => setNewDriver({...newDriver, full_name: e.target.value})}
                        className="rounded-2xl"
                      />
                    </div>
                    <div>
                      <Label>رقم الهاتف *</Label>
                      <Input
                        value={newDriver.phone}
                        onChange={(e) => setNewDriver({...newDriver, phone: e.target.value})}
                        placeholder="+32 XXX XX XX XX"
                        className="rounded-2xl"
                      />
                    </div>
                    <div>
                      <Label>كلمة المرور *</Label>
                      <Input
                        type="password"
                        value={newDriver.password}
                        onChange={(e) => setNewDriver({...newDriver, password: e.target.value})}
                        className="rounded-2xl"
                      />
                    </div>
                    <Button
                      onClick={handleCreateDriver}
                      className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600"
                    >
                      إنشاء السائق
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {drivers.map((driver) => (
                <Card key={driver.id} className="p-6 rounded-3xl border-0 shadow-xl">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{driver.full_name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{driver.phone}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-2xl text-red-600"
                      onClick={() => {
                        if (confirm('هل أنت متأكد من حذف هذا السائق؟ سيتم إرسال طلب للمسؤول.')) {
                          handleDeleteDriver(driver.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">المركبات</h2>
              <Dialog open={showVehicleDialog} onOpenChange={setShowVehicleDialog}>
                <DialogTrigger asChild>
                  <Button className="rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600">
                    <Plus className="w-5 h-5 ml-2" />
                    إضافة مركبة
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>إضافة مركبة جديدة</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>الشركة *</Label>
                      <Select
                        value={newVehicle.company_id}
                        onValueChange={(value) => setNewVehicle({...newVehicle, company_id: value})}
                      >
                        <SelectTrigger className="rounded-2xl">
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>الماركة *</Label>
                        <Input
                          value={newVehicle.brand}
                          onChange={(e) => setNewVehicle({...newVehicle, brand: e.target.value})}
                          placeholder="Mercedes"
                          className="rounded-2xl"
                        />
                      </div>
                      <div>
                        <Label>الموديل *</Label>
                        <Input
                          value={newVehicle.model}
                          onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                          placeholder="E-Class"
                          className="rounded-2xl"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>رقم اللوحة *</Label>
                      <Input
                        value={newVehicle.plate_number}
                        onChange={(e) => setNewVehicle({...newVehicle, plate_number: e.target.value})}
                        placeholder="1-ABC-123"
                        className="rounded-2xl"
                      />
                    </div>
                    <Button
                      onClick={handleCreateVehicle}
                      className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600"
                    >
                      إنشاء المركبة
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} className="p-6 rounded-3xl border-0 shadow-xl">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <Car className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{vehicle.plate_number}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {vehicle.brand} {vehicle.model}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-2xl text-red-600"
                      onClick={() => {
                        if (confirm('هل أنت متأكد من حذف هذه المركبة؟ سيتم إرسال طلب للمسؤول.')) {
                          handleDeleteVehicle(vehicle.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-4">
            <h2 className="text-2xl font-bold">الفواتير</h2>
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <Card key={invoice.id} className="p-4 rounded-2xl border-0 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{invoice.invoice_number}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{invoice.client_name}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold">€{invoice.total_tvac}</p>
                      <Badge className={invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            <h2 className="text-2xl font-bold">طلبات الموافقة</h2>
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="p-4 rounded-2xl border-0 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {request.request_type === 'update' ? 'تعديل' : 'حذف'} {request.entity_type}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(request.created_at).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
