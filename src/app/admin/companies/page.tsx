'use client';
import CompanyLifecycleAction from '@/components/operations/CompanyLifecycleAction';
import {DirectoryToolbar} from '@/components/operations/DirectoryToolbar';
import {useCompanyDirectory} from '@/components/operations/useCompanyDirectory';



import { useState, useEffect, Suspense } from 'react';
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
  archived_at?:string|null;
  is_test?:boolean;
  current_contract_id: number | null;
  payment_overdue_days: number;
  portal_login_enabled?: boolean;
  portal_login_email?: string;
}

const emptyNew = { name: '', vat_number: '', kbo_number: '', address: '', email: '', phone: '', password: '' };

function CompaniesPageContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const directory=useCompanyDirectory<Company>('companies',user?.isAdmin===true);
  const companies=directory.result.rows;
  const [saving, setSaving] = useState(false);
  const loading=directory.loading && !directory.result.rows.length && !directory.error;
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [modeTarget,setModeTarget]=useState<{id:number;mode:string}|null>(null);
  const [switchingMode, setSwitchingMode] = useState<number | null>(null);
  const [newCompany, setNewCompany] = useState(emptyNew);
  const [editCompany, setEditCompany] = useState({
    id: 0, name: '', vat_number: '', kbo_number: '',
    address: '', email: '', phone: '', new_password: '', login_email: '',
  });

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
    if (!isLoading && user && !user.isAdmin) router.push('/');
  }, [user, isLoading, router]);

  const fetchCompanies=directory.reload;

  const handleCreateCompany = async () => {
    if (saving) return;
    if (!newCompany.name || !newCompany.vat_number || !newCompany.kbo_number) {
      toast.error('اسم الشركة ورقم VAT ورقم KBO مطلوبة');
      return;
    }
    if (newCompany.password && !newCompany.email.trim()) { toast.error('البريد الإلكتروني مطلوب لإنشاء حساب دخول الشركة'); return; }
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
      email: company.email || '', phone: company.phone || '', new_password: '', login_email: company.portal_login_email || company.email || '',
    });
    setShowEditDialog(true);
  };

  const handleUpdateCompany = async () => {
    if (saving) return;
    if (!editCompany.name || !editCompany.vat_number || !editCompany.kbo_number) {
      toast.error('اسم الشركة ورقم VAT ورقم KBO مطلوبة');
      return;
    }
    if (editCompany.new_password && (editCompany.new_password.length < 12 || new TextEncoder().encode(editCompany.new_password).length > 72)) {
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

  const handleSwitchMode=(companyId:number,currentMode:string)=>setModeTarget({id:companyId,mode:currentMode==='TEST'?'PRODUCTION':'TEST'});
  const applySwitchMode=async()=>{
    if(!modeTarget||switchingMode!==null)return;
    const companyId=modeTarget.id,newMode=modeTarget.mode;
    setSwitchingMode(companyId);
    try {
      await api.put('/companies', { id: companyId, chiron_mode: newMode });
      toast.success(`تم التبديل إلى وضع ${newMode} بنجاح`);
      fetchCompanies();
      setModeTarget(null);
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
                    <p className="text-xs text-muted-foreground mt-1">اختياري — مع البريد الإلكتروني ينشئ حساب دخول للشركة؛ بدونه يُنشأ سجل الشركة فقط</p>
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
                aria-describedby="company-login-note"
                value={editCompany.new_password}
                onChange={(e) => setEditCompany({ ...editCompany, new_password: e.target.value })}
                placeholder="اتركه فارغاً للإبقاء على كلمة المرور الحالية"
                className="rounded-2xl"
              />
              <p id="company-login-note" className="mt-2 text-xs text-muted-foreground">حساب الدخول: {editCompany.login_email || 'أدخل بريداً للشركة لإنشاء حسابها'}. بريد التواصل منفصل عن بريد الدخول الحالي.</p>
            </div>
            <Button disabled={saving} aria-busy={saving} onClick={handleUpdateCompany} className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600">
              حفظ التغييرات
            </Button>
          </div>
        </DialogContent>
      </Dialog>



      <AlertDialog open={!!modeTarget} onOpenChange={open=>{if(!open&&switchingMode===null)setModeTarget(null);}}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>تغيير بيئة Chiron</AlertDialogTitle><AlertDialogDescription>البيئة المطلوبة: {modeTarget?.mode}. اختيار الإنتاج يغيّر وجهة إرسال الرحلات التالية، ويحتاج استيفاء شروط قبول Chiron. تصنيف الشركة التجريبية مستقل عن هذه البيئة.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={switchingMode!==null}>إلغاء</AlertDialogCancel><Button disabled={switchingMode!==null} aria-busy={switchingMode!==null} onClick={applySwitchMode}>تأكيد تغيير البيئة</Button></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <DirectoryToolbar kind="companies" filters={directory.filters} setFilter={directory.setFilter} total={directory.result.total} loading={directory.loading} error={directory.error} reload={directory.reload}/>
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
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{company.name}</h3>{company.is_test&&<Badge variant="outline">حساب تجريبي · Test</Badge>}{company.archived_at&&<Badge variant="outline">مؤرشف · Archived</Badge>}
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
                  {company.portal_login_enabled && (
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0 text-xs">
                      <Lock className="w-3 h-3 ml-1" />حساب دخول مفعّل
                    </Badge>
                  )}
                  <Button size="sm" variant="outline" onClick={() => handleSwitchMode(company.id, company.chiron_mode)} disabled={!!company.archived_at || switchingMode === company.id} className="rounded-xl text-xs">
                    {switchingMode === company.id ? <Loader2 className="w-3 h-3 ml-1 animate-spin" /> : <RefreshCw className="w-3 h-3 ml-1" />}
                    تبديل الوضع
                  </Button>
                </div>
              </div>

              <div className="space-y-1 text-sm mb-4">
                {company.portal_login_email && <p className="text-xs text-blue-600">حساب الدخول: {company.portal_login_email}</p>}
                {company.email && <p className="text-slate-600 dark:text-slate-400">{company.email}</p>}
                {company.phone && <p className="text-slate-600 dark:text-slate-400">{company.phone}</p>}
                {company.address && <p className="text-slate-500 dark:text-slate-500 text-xs">{company.address}</p>}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="w-full rounded-2xl" disabled={!!company.archived_at} onClick={() => handleOpenEditDialog(company)}>
                  <Edit className="w-4 h-4 ml-2" />تعديل
                </Button>
                <CompanyLifecycleAction company={company} onSuccess={directory.reload}/>
                <Link href={`/admin/companies/${company.id}`} className="col-span-2"><Button variant="outline" className="w-full">ملف الشركة · Company workspace</Button></Link>
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

export default function CompaniesPage(){return <Suspense fallback={<div role="status" className="p-6">جارٍ التحميل…</div>}><CompaniesPageContent/></Suspense>;}
