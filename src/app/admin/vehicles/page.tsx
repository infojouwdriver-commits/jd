
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
  Plus,
  Car,
  Edit,
  Trash2,
  Loader2,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Company {
  id: number;
  name: string;
}

interface Vehicle {
  id: number;
  company_id: number;
  brand: string;
  model: string;
  plate_number: string;
  vin: string;
  chiron_vehicle_id: string;
  status: string;
}

export default function VehiclesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const [newVehicle, setNewVehicle] = useState({
    company_id: '',
    brand: '',
    model: '',
    plate_number: '',
    vin: '',
    chiron_vehicle_id: '',
    status: 'active'
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
    if (!isLoading && user?.role !== 'app20251225073911jaqqaxdfir_v1_admin_user') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [companiesData, vehiclesData] = await Promise.all([
        api.get<Company[]>('/companies'),
        api.get<Vehicle[]>('/vehicles')
      ]);
      
      setCompanies(companiesData);
      setVehicles(vehiclesData);
      setFilteredVehicles(vehiclesData);
    } catch (error: any) {
      toast.error(error.message || 'فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'app20251225073911jaqqaxdfir_v1_admin_user') {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    let filtered = vehicles;

    if (selectedCompany) {
      filtered = filtered.filter(v => v.company_id === parseInt(selectedCompany));
    }

    if (searchQuery) {
      filtered = filtered.filter(v => 
        v.plate_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.model.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredVehicles(filtered);
  }, [selectedCompany, searchQuery, vehicles]);

  const handleCreateVehicle = async () => {
    if (!newVehicle.company_id || !newVehicle.brand || !newVehicle.model || !newVehicle.plate_number) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      await api.post('/vehicles', {
        ...newVehicle,
        company_id: parseInt(newVehicle.company_id)
      });

      toast.success('تم إضافة المركبة بنجاح');
      setShowCreateDialog(false);
      setNewVehicle({
        company_id: '',
        brand: '',
        model: '',
        plate_number: '',
        vin: '',
        chiron_vehicle_id: '',
        status: 'active'
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'فشل إضافة المركبة');
    }
  };

  const handleEditVehicle = async () => {
    if (!editingVehicle) return;

    try {
      await api.put(`/vehicles?id=${editingVehicle.id}`, editingVehicle);
      toast.success('تم تحديث المركبة بنجاح');
      setShowEditDialog(false);
      setEditingVehicle(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'فشل تحديث المركبة');
    }
  };

  const handleDeleteVehicle = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه المركبة؟')) {
      return;
    }

    try {
      await api.delete(`/vehicles?id=${id}`);
      toast.success('تم حذف المركبة بنجاح');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'فشل حذف المركبة');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'نشطة', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      maintenance: { label: 'صيانة', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
      inactive: { label: 'غير نشطة', className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge className={`${config.className} border-0`}>{config.label}</Badge>;
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== 'app20251225073911jaqqaxdfir_v1_admin_user') {
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
              إدارة المركبات
            </h1>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600">
                  <Plus className="w-5 h-5 ml-2" />
                  مركبة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent>
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

                  <div>
                    <Label>رقم الهيكل (VIN)</Label>
                    <Input
                      value={newVehicle.vin}
                      onChange={(e) => setNewVehicle({...newVehicle, vin: e.target.value})}
                      placeholder="WDB1234567890"
                      className="rounded-2xl"
                    />
                  </div>

                  <div>
                    <Label>معرف Chiron</Label>
                    <Input
                      value={newVehicle.chiron_vehicle_id}
                      onChange={(e) => setNewVehicle({...newVehicle, chiron_vehicle_id: e.target.value})}
                      placeholder="CHIRON-VEH-001"
                      className="rounded-2xl"
                    />
                  </div>

                  <div>
                    <Label>الحالة</Label>
                    <Select 
                      value={newVehicle.status} 
                      onValueChange={(value) => setNewVehicle({...newVehicle, status: value})}
                    >
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">نشطة</SelectItem>
                        <SelectItem value="maintenance">صيانة</SelectItem>
                        <SelectItem value="inactive">غير نشطة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleCreateVehicle}
                    className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600"
                  >
                    <Plus className="w-5 h-5 ml-2" />
                    إضافة المركبة
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* الفلاتر */}
        <Card className="p-6 rounded-3xl border-0 shadow-xl mb-8 bg-white dark:bg-slate-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>تصفية حسب الشركة</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="جميع الشركات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع الشركات</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>البحث</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث برقم اللوحة أو الماركة..."
                  className="pr-12 rounded-2xl"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* قائمة المركبات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredVehicles.length === 0 ? (
            <Card className="col-span-2 p-12 rounded-3xl border-0 shadow-xl bg-white dark:bg-slate-900">
              <div className="text-center">
                <Car className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  لا توجد مركبات
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  ابدأ بإضافة مركبة جديدة
                </p>
              </div>
            </Card>
          ) : (
            filteredVehicles.map((vehicle) => (
              <Card 
                key={vehicle.id}
                className="p-6 rounded-3xl border-0 shadow-xl bg-white dark:bg-slate-900"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <Car className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {vehicle.plate_number}
                        </span>
                        {getStatusBadge(vehicle.status)}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {vehicle.brand} {vehicle.model}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  {vehicle.vin && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">VIN:</span>
                      <span className="font-medium">{vehicle.vin}</span>
                    </div>
                  )}
                  {vehicle.chiron_vehicle_id && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Chiron ID:</span>
                      <span className="font-medium">{vehicle.chiron_vehicle_id}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setEditingVehicle(vehicle);
                      setShowEditDialog(true);
                    }}
                    variant="outline"
                    className="flex-1 rounded-2xl"
                  >
                    <Edit className="w-4 h-4 ml-2" />
                    تعديل
                  </Button>
                  <Button
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                    variant="destructive"
                    className="rounded-2xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* نافذة التعديل */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل المركبة</DialogTitle>
            </DialogHeader>
            {editingVehicle && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>الماركة</Label>
                    <Input
                      value={editingVehicle.brand}
                      onChange={(e) => setEditingVehicle({...editingVehicle, brand: e.target.value})}
                      className="rounded-2xl"
                    />
                  </div>

                  <div>
                    <Label>الموديل</Label>
                    <Input
                      value={editingVehicle.model}
                      onChange={(e) => setEditingVehicle({...editingVehicle, model: e.target.value})}
                      className="rounded-2xl"
                    />
                  </div>
                </div>

                <div>
                  <Label>رقم اللوحة</Label>
                  <Input
                    value={editingVehicle.plate_number}
                    onChange={(e) => setEditingVehicle({...editingVehicle, plate_number: e.target.value})}
                    className="rounded-2xl"
                  />
                </div>

                <div>
                  <Label>رقم الهيكل (VIN)</Label>
                  <Input
                    value={editingVehicle.vin || ''}
                    onChange={(e) => setEditingVehicle({...editingVehicle, vin: e.target.value})}
                    className="rounded-2xl"
                  />
                </div>

                <div>
                  <Label>معرف Chiron</Label>
                  <Input
                    value={editingVehicle.chiron_vehicle_id || ''}
                    onChange={(e) => setEditingVehicle({...editingVehicle, chiron_vehicle_id: e.target.value})}
                    className="rounded-2xl"
                  />
                </div>

                <div>
                  <Label>الحالة</Label>
                  <Select 
                    value={editingVehicle.status} 
                    onValueChange={(value) => setEditingVehicle({...editingVehicle, status: value})}
                  >
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشطة</SelectItem>
                      <SelectItem value="maintenance">صيانة</SelectItem>
                      <SelectItem value="inactive">غير نشطة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleEditVehicle}
                    className="flex-1 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600"
                  >
                    حفظ التغييرات
                  </Button>
                  <Button
                    onClick={() => {
                      setShowEditDialog(false);
                      setEditingVehicle(null);
                    }}
                    variant="outline"
                    className="rounded-2xl"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
