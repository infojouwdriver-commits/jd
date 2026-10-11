
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
  ArrowLeft, Plus, Building2, Settings, Users, Car,
  Loader2, RefreshCw, Edit, DollarSign, FileText,
  AlertCircle, CheckCircle2, Trash2, Lock, KeyRound
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Company {
  id: number;
  name: string;
  vat_number: string;
  kbo_number: string;
  address: string;
  email: string;
  phone: string;
  chiron_mode: string;
  subscription_status: string;
  current_contract_id: number | null;
  payment_overdue_days: number;
  password_hash?: string;
}

const emptyNew = { name: '', vat_number: '', kbo_number: '', address: '', email: '', phone: '', password: '' };

export default function CompaniesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkPasswordDialog, setShowBulkPasswordDialog] = useState(false);
  const [switchingMode, setSwitchingMode] = useState<number | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [bulkPassword, setBulkPassword] = useState('');
  const [settingBulkPassword, setSettingBulkPassword] = useState(false);
  const [newCompany, setNewCompany] = useState(emptyNew);
  const [editCompany, setEditCompany] = useState({
    id: 0, name: '', vat_number: '', kbo_number: '',
    address: '', email: '', phone: '', new_password: '',
  });

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
    if (!isLoading && user && !user.isAdmin) router.push('/');
  }, [user, isLoading, router]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const data = await api.get<Company[]>('/companies');
      setCompanies(data);
    } catch (error: any) {
      toast.error(error.message || 'فشل تحميل الشركات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) fetchCompanies();
  }, [user]);

  const handleCreateCompany = async () => {
    if (saving) return;
    if (!newCompany.name || !newCompany.vat_number || !newCompany.kbo_number) {
      toast.error('اسم الشركة ورقم VAT ورقم KBO مطلوبة');
      return;
    }
    if (newCompany.password && (newCompany.password.length < 12 || new TextEncoder().encode(newCompany.password).length > 72)) {
      toast.error('كلمة المرور يجب أن تكون 12 حرفاً على الأقل ولا تتجاوز 72 بايت');
      return;
    }
    setSaving(true);
    try {
      const created = await api.post<Company>('/companies', {
        name: newCompany.name,
        vat_number: newCompany.vat_number,
        kbo_number: newCompany.kbo_number,
        address: newCompany.address,
        email: newCompany.email,
        phone: newCompany.phone,
        password: newCompany.password || undefined,
      });
      toast.success('تم إنشاء الشركة بنجاح');
      setShowCreateDialog(false);
      setNewCompany(emptyNew);
      fetchCompanies();
    } catch (error: any) {
      toast.error(error.message || 'فشل إنشاء الشركة');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEditDialog = (company: Company) => {
    setEditCompany({
      id: company.id, name: company.name, vat_number: company.vat_number,
      kbo_number: company.kbo_number, address: company.address || '',
      email: company.email || '', phone: company.phone || '', new_password: '',
    });
    setShowEditDialog(true);
  };

  const handleUpdateCompany = async () => {
    if (saving) return;
    if (!editCompany.name || !editCompany.vat_number || !editCompany.kbo_number) {
      toast.error('اسم الشركة ورقم VAT ورقم KBO مطلوبة');
      return;
    }
    if (editCompany.new_password && editCompany.new_password.length < 12) {
      toast.error('كلمة المرور يجب أن تكون 12 حرفاً على الأقل');
      return;
    }
    setSaving(true);
    try {
      await api.put('/companies', {
        id: editCompany.id,
        name: editCompany.name,
        vat_number: editCompany.vat_number,
        kbo_number: editCompany.kbo_number,
        address: editCompany.address,
        email: editCompany.email,
        phone: editCompany.phone,
        password: editCompany.new_password || undefined,
      });
      toast.success('تم تحديث الشركة بنجاح');
      setShowEditDialog(false);
      fetchCompanies();
    } catch (error: any) {
      toast.error(error.message || 'فشل تحديث الشركة');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkSetPassword = async () => {
    if (!bulkPassword || bulkPassword.length < 12) {
      toast.error('كلمة المرور يجب أن تكون 12 حرفاً على الأقل');
      return;
    }
    setSettingBulkPassword(true);
    try {
      const result = await api.put<{ updated: number; message: string }>('/company-portal/set-password', {
        password: bulkPassword,
      });
      toast.success(`تم تعيين كلمة المرور لـ ${result?.updated} شركة`);
      setShowBulkPasswordDialog(false);
      setBulkPassword('');
      fetchCompanies();
    } catch (error: any) {
      toast.error(error.message || 'فشل تعيين كلمة المرور');
    } finally {
      setSettingBulkPassword(false);
    }
  };

  const handleDeleteCompany = async () => {
    if (!selectedCompany) return;
    setDeleting(true);
    try {
      await api.delete(`/companies?id=${selectedCompany.id}`);
      toast.success('تم حذف الشركة بنجاح');
      setShowDeleteDialog(false);
      setSelectedCompany(null);
      fetchCompanies();
    } catch (error: any) {
      toast.error(error.message || 'فشل حذف الشركة');
    } finally {
      setDeleting(false);
    }
  };

  const handleSwitchMode = async (companyId: number, currentMode: string) => {
    const newMode = currentMode === 'TEST' ? 'PRODUCTION' : 'TEST';
    if (newMode === 'PRODUCTION') {
      const confirmed = confirm(
        '⚠️ تحذير: الانتقال إلى وضع PRODUCTION يعني أن جميع الرحلات سيتم إرسالها إلى نظام Chiron الحقيقي.\n\nهل أنت متأكد من المتابعة؟'
      );
      if (!confirmed) return;
    }
    setSwitchingMode(companyId);
    try {
      await api.put('/companies', { id: companyId, chiron_mode: newMode });
      toast.success(`تم التبديل إلى وضع ${newMode} بنجاح`);
      fetchCompanies();
    } catch (error: any) {
      toast.error(error.message || 'فشل تبديل الوضع');
    } finally {
      setSwitchingMode(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
      active: { label: 'نشط', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle2 className="w-3 h-3 ml-1" /> },
      suspended: { label: 'معلق', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <AlertCircle className="w-3 h-3 ml-1" /> },
      pending_contract: { label: 'بانتظار العقد', cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <FileText className="w-3 h-3 ml-1" /> },
    };
    const s = map[status];
    if (!s) return null;
    return <Badge className={`${s.cls} border-0`}>{s.icon}{s.label}</Badge>;
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user?.isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-2xl"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            إدارة الشركات
          </h1>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <Button variant="outline" size="sm" className="rounded-2xl text-xs" onClick={() => setShowBulkPasswordDialog(true)}>
              <KeyRound className="w-4 h-4 ml-1" />
              تعيين كلمة مرور للكل
            </Button>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600">
                  <Plus className="w-5 h-5 ml-2" />شركة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>إنشاء شركة جديدة</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  {[
                    { label: 'اسم الشركة *', key: 'name', placeholder: 'JOUW DRIVER SRL' },
                    { label: 'رقم VAT *', key: 'vat_number', placeholder: 'BE0123456789' },
                    { label: 'رقم KBO *', key: 'kbo_number', placeholder: '0123456789' },
                    { label: 'العنوان', key: 'address', placeholder: 'Brussels, Belgium' },
                    { label: 'البريد الإلكتروني', key: 'email', placeholder: 'info@company.be', type: 'email' },
                    { label: 'الهاتف', key: 'phone', placeholder: '+32 2 XXX XX XX' },
                  ].map(({ label, key, placeholder, type }) => (
                    <div key={key}>
                      <Label htmlFor={`new-company-${key}`}>{label}</Label>
                      <Input
                        id={`new-company-${key}`}
                        type={type || 'text'}
                        value={(newCompany as any)[key]}
                        onChange={(e) => setNewCompany({ ...newCompany, [key]: e.target.value })}
                        placeholder={placeholder}
                        className="rounded-2xl"
                      />
                    </div>
                  ))}
                  <div>
                    <Label className="flex items-center gap-2"><Lock className="w-4 h-4" />كلمة مرور لوحة التحكم</Label>
                    <Input
                      type="password"
                      value={newCompany.password}
                      onChange={(e) => setNewCompany({ ...newCompany, password: e.target.value })}
                      placeholder="كلمة المرور للدخول إلى لوحة تحكم الشركة"
                      className="rounded-2xl"
                    />
                    <p className="text-xs text-muted-foreground mt-1">اختياري - يستخدمها صاحب الشركة لتسجيل الدخول</p>
                  </div>
                  <Button disabled={saving} aria-busy={saving} onClick={handleCreateCompany} className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600">
                    <Plus className="w-5 h-5 ml-2" />إنشاء الشركة
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Bulk Password Dialog */}
      <AlertDialog open={showBulkPasswordDialog} onOpenChange={setShowBulkPasswordDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-blue-500" />
              تعيين كلمة مرور لجميع الشركات
            </AlertDialogTitle>
            <AlertDialogDescription>
              سيتم تعيين كلمة المرور المدخلة لجميع الشركات الموجودة في النظام.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label>كلمة المرور الجديدة</Label>
            <Input
              type="password"
              value={bulkPassword}
              onChange={(e) => setBulkPassword(e.target.value)}
              placeholder="أدخل كلمة المرور (12 حرفاً على الأقل)"
              className="rounded-2xl mt-1"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkSetPassword} disabled={settingBulkPassword}>
              {settingBulkPassword ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              تعيين للجميع
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>تعديل الشركة</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            {[
              { label: 'اسم الشركة *', key: 'name' },
              { label: 'رقم VAT *', key: 'vat_number' },
              { label: 'رقم KBO *', key: 'kbo_number' },
              { label: 'العنوان', key: 'address' },
              { label: 'البريد الإلكتروني', key: 'email', type: 'email' },
              { label: 'الهاتف', key: 'phone' },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <Label>{label}</Label>
                <Input
                  type={type || 'text'}
                  value={(editCompany as any)[key]}
                  onChange={(e) => setEditCompany({ ...editCompany, [key]: e.target.value })}
                  className="rounded-2xl"
                />
              </div>
            ))}
            <div>
              <Label className="flex items-center gap-2"><Lock className="w-4 h-4" />تغيير كلمة المرور</Label>
              <Input
                type="password"
                value={editCompany.new_password}
                onChange={(e) => setEditCompany({ ...editCompany, new_password: e.target.value })}
                placeholder="اتركه فارغاً للإبقاء على كلمة المرور الحالية"
                className="rounded-2xl"
              />
            </div>
            <Button disabled={saving} aria-busy={saving} onClick={handleUpdateCompany} className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600">
              حفظ التغييرات
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الشركة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف شركة "{selectedCompany?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCompany} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {!companies.length && <div className="mb-6 rounded-2xl border border-dashed p-6 text-center">
          <h2 className="font-semibold">لا توجد شركات في القائمة الحالية</h2>
          <p className="mt-2 text-sm text-muted-foreground">أنشئ شركة لتظهر إعدادات التسعير والعقود والسائقين الخاصة بها.</p>
          <Button className="mt-4" onClick={() => setShowCreateDialog(true)}><Plus className="w-4 h-4 ml-2" />إنشاء أول شركة</Button>
        </div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {companies.map((company) => (
            <Card key={company.id} className="p-6 rounded-3xl border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{company.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{company.vat_number}</p>
                    {company.kbo_number && (
                      <p className="text-xs text-slate-500">KBO: {company.kbo_number}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={`${company.chiron_mode === 'TEST' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'} border-0`}>
                    {company.chiron_mode}
                  </Badge>
                  {getStatusBadge(company.subscription_status)}
                  {company.password_hash && (
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0 text-xs">
                      <Lock className="w-3 h-3 ml-1" />كلمة مرور مفعّلة
                    </Badge>
                  )}
                  <Button size="sm" variant="outline" onClick={() => handleSwitchMode(company.id, company.chiron_mode)} disabled={switchingMode === company.id} className="rounded-xl text-xs">
                    {switchingMode === company.id ? <Loader2 className="w-3 h-3 ml-1 animate-spin" /> : <RefreshCw className="w-3 h-3 ml-1" />}
                    تبديل الوضع
                  </Button>
                </div>
              </div>

              <div className="space-y-1 text-sm mb-4">
                {company.email && <p className="text-slate-600 dark:text-slate-400">{company.email}</p>}
                {company.phone && <p className="text-slate-600 dark:text-slate-400">{company.phone}</p>}
                {company.address && <p className="text-slate-500 dark:text-slate-500 text-xs">{company.address}</p>}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="w-full rounded-2xl" onClick={() => handleOpenEditDialog(company)}>
                  <Edit className="w-4 h-4 ml-2" />تعديل
                </Button>
                <Button variant="outline" className="w-full rounded-2xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => { setSelectedCompany(company); setShowDeleteDialog(true); }}>
                  <Trash2 className="w-4 h-4 ml-2" />حذف
                </Button>
                <Link href={`/admin/companies/${company.id}/pricing`}>
                  <Button variant="outline" className="w-full rounded-2xl"><DollarSign className="w-4 h-4 ml-2" />التسعيرة</Button>
                </Link>
                <Link href={`/admin/companies/${company.id}/chiron-settings`}>
                  <Button variant="outline" className="w-full rounded-2xl"><Settings className="w-4 h-4 ml-2" />Chiron</Button>
                </Link>
                <Link href={`/admin/drivers?company_id=${company.id}`}>
                  <Button variant="outline" className="w-full rounded-2xl"><Users className="w-4 h-4 ml-2" />السائقين</Button>
                </Link>
                <Link href={`/admin/vehicles?company_id=${company.id}`}>
                  <Button variant="outline" className="w-full rounded-2xl"><Car className="w-4 h-4 ml-2" />المركبات</Button>
                </Link>
                <Link href={`/admin/companies/${company.id}/settings`} className="col-span-2">
                  <Button variant="outline" className="w-full rounded-2xl"><Settings className="w-4 h-4 ml-2" />إعدادات الشركة</Button>
                </Link>
                <Link href={`/admin/companies/${company.id}/contracts`} className="col-span-2">
                  <Button variant="outline" className="w-full rounded-2xl"><FileText className="w-4 h-4 ml-2" />العقود</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
