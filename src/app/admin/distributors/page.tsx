
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
  Users,
  Loader2,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Building2,
  Mail,
  Phone,
  Percent
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
import { Textarea } from '@/components/ui/textarea';

interface Distributor {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  commission_percentage: number;
  is_active: boolean;
  notes: string;
  created_at: string;
}

interface Company {
  id: number;
  name: string;
}

export default function DistributorsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState<number | null>(null);
  const [newDistributor, setNewDistributor] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    commission_percentage: 0,
    notes: ''
  });
  const [assignData, setAssignData] = useState({
    company_id: '',
    notes: ''
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
    if (!isLoading && user && !user.isAdmin) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const fetchDistributors = async () => {
    setLoading(true);
    try {
      const data = await api.get<Distributor[]>('/distributors');
      setDistributors(data);
    } catch (error: any) {
      toast.error(error.message || 'فشل تحميل الموزعين');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const data = await api.get<Company[]>('/companies');
      setCompanies(data);
    } catch (error: any) {
      toast.error(error.message || 'فشل تحميل الشركات');
    }
  };

  useEffect(() => {
    if (user?.isAdmin === true) {
      fetchDistributors();
      fetchCompanies();
    }
  }, [user]);

  const handleCreateDistributor = async () => {
    if (!newDistributor.email || !newDistributor.password || !newDistributor.full_name) {
      toast.error('البريد الإلكتروني وكلمة المرور والاسم الكامل مطلوبة');
      return;
    }

    try {
      await api.post('/distributors', newDistributor);
      toast.success('تم إنشاء الموزع بنجاح');
      setShowCreateDialog(false);
      setNewDistributor({
        email: '',
        password: '',
        full_name: '',
        phone: '',
        commission_percentage: 0,
        notes: ''
      });
      fetchDistributors();
    } catch (error: any) {
      toast.error(error.message || 'فشل إنشاء الموزع');
    }
  };

  const handleToggleStatus = async (distributorId: number, currentStatus: boolean) => {
    try {
      await api.put('/distributors', {
        id: distributorId,
        is_active: !currentStatus
      });
      toast.success(`تم ${!currentStatus ? 'تفعيل' : 'تعطيل'} الموزع بنجاح`);
      fetchDistributors();
    } catch (error: any) {
      toast.error(error.message || 'فشل تحديث حالة الموزع');
    }
  };

  const handleAssignCompany = async () => {
    if (!selectedDistributor || !assignData.company_id) {
      toast.error('يجب اختيار شركة');
      return;
    }

    try {
      await api.post('/distributors/assign-company', {
        distributor_id: selectedDistributor,
        company_id: parseInt(assignData.company_id),
        notes: assignData.notes
      });
      toast.success('تم تعيين الشركة للموزع بنجاح');
      setShowAssignDialog(false);
      setSelectedDistributor(null);
      setAssignData({ company_id: '', notes: '' });
    } catch (error: any) {
      toast.error(error.message || 'فشل تعيين الشركة');
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
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
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-2xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              إدارة الموزعين
            </h1>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600">
                  <Plus className="w-5 h-5 ml-2" />
                  موزع جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>إنشاء موزع جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>البريد الإلكتروني *</Label>
                    <Input
                      type="email"
                      value={newDistributor.email}
                      onChange={(e) => setNewDistributor({...newDistributor, email: e.target.value})}
                      placeholder="distributor@example.com"
                      className="rounded-2xl"
                    />
                  </div>

                  <div>
                    <Label>كلمة المرور *</Label>
                    <Input
                      type="password"
                      value={newDistributor.password}
                      onChange={(e) => setNewDistributor({...newDistributor, password: e.target.value})}
                      placeholder="••••••••"
                      className="rounded-2xl"
                    />
                  </div>

                  <div>
                    <Label>الاسم الكامل *</Label>
                    <Input
                      value={newDistributor.full_name}
                      onChange={(e) => setNewDistributor({...newDistributor, full_name: e.target.value})}
                      placeholder="أحمد محمد"
                      className="rounded-2xl"
                    />
                  </div>

                  <div>
                    <Label>رقم الهاتف</Label>
                    <Input
                      value={newDistributor.phone}
                      onChange={(e) => setNewDistributor({...newDistributor, phone: e.target.value})}
                      placeholder="+32 XXX XX XX XX"
                      className="rounded-2xl"
                    />
                  </div>

                  <div>
                    <Label>نسبة العمولة (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={newDistributor.commission_percentage}
                      onChange={(e) => setNewDistributor({...newDistributor, commission_percentage: parseFloat(e.target.value) || 0})}
                      placeholder="5.00"
                      className="rounded-2xl"
                    />
                  </div>

                  <div>
                    <Label>ملاحظات</Label>
                    <Textarea
                      value={newDistributor.notes}
                      onChange={(e) => setNewDistributor({...newDistributor, notes: e.target.value})}
                      placeholder="ملاحظات إضافية..."
                      className="rounded-2xl"
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={handleCreateDistributor}
                    className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600"
                  >
                    <Plus className="w-5 h-5 ml-2" />
                    إنشاء الموزع
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {distributors.map((distributor) => (
            <Card 
              key={distributor.id}
              className="p-6 rounded-3xl border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                      {distributor.full_name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {distributor.email}
                    </p>
                  </div>
                </div>
                <Badge className={`${
                  distributor.is_active 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                } border-0`}>
                  {distributor.is_active ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 ml-1" />
                      نشط
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 ml-1" />
                      معطل
                    </>
                  )}
                </Badge>
              </div>

              <div className="space-y-2 text-sm mb-4">
                {distributor.phone && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Phone className="w-4 h-4" />
                    {distributor.phone}
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Percent className="w-4 h-4" />
                  عمولة: {distributor.commission_percentage}%
                </div>
                {distributor.notes && (
                  <p className="text-slate-600 dark:text-slate-400 text-xs mt-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                    {distributor.notes}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleToggleStatus(distributor.id, distributor.is_active)}
                  className="rounded-2xl"
                >
                  {distributor.is_active ? (
                    <>
                      <XCircle className="w-4 h-4 ml-2" />
                      تعطيل
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 ml-2" />
                      تفعيل
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedDistributor(distributor.id);
                    setShowAssignDialog(true);
                  }}
                  className="rounded-2xl"
                >
                  <Building2 className="w-4 h-4 ml-2" />
                  تعيين شركة
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* Assign Company Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعيين شركة للموزع</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>اختر الشركة *</Label>
              <Select
                value={assignData.company_id}
                onValueChange={(value) => setAssignData({...assignData, company_id: value})}
              >
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="اختر شركة" />
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
              <Label>ملاحظات</Label>
              <Textarea
                value={assignData.notes}
                onChange={(e) => setAssignData({...assignData, notes: e.target.value})}
                placeholder="ملاحظات إضافية..."
                className="rounded-2xl"
                rows={3}
              />
            </div>

            <Button
              onClick={handleAssignCompany}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600"
            >
              <Building2 className="w-5 h-5 ml-2" />
              تعيين الشركة
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
