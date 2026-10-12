
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  User,
  Building2,
  Car,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Plus,
  LogOut,
  Mail,
  Phone,
  MapPin,
  FileText,
  Shield,
  Loader2,
} from "lucide-react";
import AccountSettings from '@/components/account/AccountSettings';
import { toast } from "sonner";

interface DriverProfile {
  hasProfile: boolean;
  registrationStatus?: string;
  driver?: {
    id: number;
    full_name: string;
    phone: string;
    national_id: string;
    driver_license: string;
    bestuurderspas_number: string;
    status: string;
    registration_status: string;
    preferred_language: string;
    created_at: string;
  };
  company?: {
    id: number;
    name: string;
    vat_number: string;
    kbo_number: string;
    address: string;
    email: string;
    phone: string;
    subscription_status: string;
  } | null;
  vehicle?: {
    id: number;
    brand: string;
    model: string;
    plate_number: string;
    vin: string;
    status: string;
  } | null;
  all_vehicles?: Array<{
    id: number;
    brand: string;
    model: string;
    plate_number: string;
    status: string;
  }>;
  latest_registration_request?: {
    id: number;
    status: string;
    submitted_at: string;
  } | null;
}

function RegistrationStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; icon: any; className: string }> = {
    pending: { label: "قيد الانتظار", icon: Clock, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
    approved: { label: "موافق عليه", icon: CheckCircle, className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
    rejected: { label: "مرفوض", icon: XCircle, className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
    under_review: { label: "قيد المراجعة", icon: AlertCircle, className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  };
  const cfg = config[status] || config.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.className}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-sm text-slate-500 dark:text-slate-400 sm:w-44 shrink-0">{label}</span>
      <span className="text-sm font-medium text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, action }: {
  title: string;
  icon: any;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-white dark:bg-slate-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            {title}
          </div>
          {action}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="rounded-2xl border-0 shadow-lg">
          <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AddVehicleDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ vehicle_brand: "", vehicle_model: "", plate_number: "", vin: "" });

  const handleSubmit = async () => {
    if (!form.vehicle_brand || !form.vehicle_model || !form.plate_number) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    setLoading(true);
    try {
      await api.post("/drivers/profile", { request_type: "add_vehicle", ...form });
      toast.success("تم إرسال طلب إضافة المركبة بنجاح. في انتظار موافقة المدير.");
      setOpen(false);
      setForm({ vehicle_brand: "", vehicle_model: "", plate_number: "", vin: "" });
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "فشل إرسال الطلب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1.5 border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400">
          <Plus className="w-3.5 h-3.5" />
          طلب إضافة مركبة
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-500" />
            طلب إضافة مركبة جديدة
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-700 dark:text-amber-300">
              سيتم إرسال طلبك للمدير للمراجعة والموافقة قبل إضافة المركبة.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">الماركة *</Label>
              <Input
                placeholder="مثال: Toyota"
                value={form.vehicle_brand}
                onChange={(e) => setForm(p => ({ ...p, vehicle_brand: e.target.value }))}
                className="rounded-xl text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">الموديل *</Label>
              <Input
                placeholder="مثال: Camry"
                value={form.vehicle_model}
                onChange={(e) => setForm(p => ({ ...p, vehicle_model: e.target.value }))}
                className="rounded-xl text-sm"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">رقم اللوحة *</Label>
            <Input
              placeholder="مثال: 1-ABC-234"
              value={form.plate_number}
              onChange={(e) => setForm(p => ({ ...p, plate_number: e.target.value }))}
              className="rounded-xl text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">رقم الهيكل VIN (اختياري)</Label>
            <Input
              placeholder="17 حرف/رقم"
              value={form.vin}
              onChange={(e) => setForm(p => ({ ...p, vin: e.target.value }))}
              className="rounded-xl text-sm"
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            إرسال الطلب
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AccountTab({ user, logout }: { user: any; logout: () => void }) {
  return <AccountSettings />;
}

export default function DriverDashboard() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const data = await api.get<DriverProfile>("/drivers/profile");
      setProfile(data);
    } catch (error) {
      console.error("Operation failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const isApproved = profile?.driver?.registration_status === "approved";
  const isPending = profile?.driver?.registration_status === "pending" || profile?.driver?.registration_status === "under_review";
  const isRejected = profile?.driver?.registration_status === "rejected";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
              مرحباً، {profile?.driver?.full_name || user?.email}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">لوحة تحكم السائق</p>
          </div>
          <Button
            onClick={logout}
            variant="ghost"
            size="sm"
            className="rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            خروج
          </Button>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : !profile?.hasProfile ? (
          // السائق لم يكمل التسجيل بعد
          <Card className="rounded-2xl border-0 shadow-lg text-center py-12">
            <CardContent>
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">لم يتم إكمال التسجيل بعد</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                يرجى إكمال نموذج التسجيل لعرض بياناتك هنا
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="profile">
            <TabsList className="w-full mb-6 rounded-2xl bg-white dark:bg-slate-800 shadow-md p-1">
              <TabsTrigger value="profile" className="flex-1 rounded-xl gap-1.5">
                <User className="w-4 h-4" /> ملفي الشخصي
              </TabsTrigger>
              <TabsTrigger value="account" className="flex-1 rounded-xl gap-1.5">
                <Shield className="w-4 h-4" /> حسابي
              </TabsTrigger>
            </TabsList>

            {/* ── تبويب الملف الشخصي ── */}
            <TabsContent value="profile" className="space-y-5">
              {/* بطاقة حالة التسجيل */}
              <Card className={`rounded-2xl border-0 shadow-lg text-white ${
                isApproved
                  ? "bg-gradient-to-r from-green-500 to-emerald-600"
                  : isPending
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                  : isRejected
                  ? "bg-gradient-to-r from-red-500 to-rose-600"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600"
              }`}>
                <CardContent className="py-5 flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm mb-1">حالة طلب التسجيل</p>
                    <RegistrationStatusBadge status={profile.driver?.registration_status || "pending"} />
                    {isApproved && (
                      <p className="text-white/70 text-xs mt-1.5">✅ حسابك مفعّل ويمكنك استخدام جميع الخدمات</p>
                    )}
                    {isPending && (
                      <p className="text-white/70 text-xs mt-1.5">⏳ طلبك قيد المراجعة من قِبل المدير</p>
                    )}
                    {isRejected && (
                      <p className="text-white/70 text-xs mt-1.5">❌ تم رفض طلبك. يرجى التواصل مع المدير</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-white/70 text-xs">رقم السائق</p>
                    <p className="text-white font-bold text-lg">#{profile.driver?.id}</p>
                  </div>
                </CardContent>
              </Card>

              {/* المعلومات الشخصية */}
              <SectionCard title="المعلومات الشخصية" icon={User}>
                <InfoRow label="الاسم الكامل" value={profile.driver?.full_name} />
                <InfoRow label="رقم الهاتف" value={profile.driver?.phone} />
                <InfoRow label="رخصة القيادة" value={profile.driver?.driver_license} />
                <InfoRow label="رقم Bestuurderspas" value={profile.driver?.bestuurderspas_number} />
                <InfoRow
                  label="تاريخ التسجيل"
                  value={
                    profile.driver?.created_at
                      ? new Date(profile.driver.created_at).toLocaleDateString("ar-SA")
                      : undefined
                  }
                />
              </SectionCard>

              {/* معلومات الشركة */}
              {profile.company && (
                <SectionCard title="معلومات الشركة" icon={Building2}>
                  <InfoRow label="اسم الشركة" value={profile.company.name} />
                  <InfoRow label="رقم TVA" value={profile.company.vat_number} />
                  <InfoRow label="رقم KBO" value={profile.company.kbo_number} />
                  <InfoRow label="العنوان" value={profile.company.address} />
                  <InfoRow label="البريد الإلكتروني" value={profile.company.email} />
                  <InfoRow label="الهاتف" value={profile.company.phone} />
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-2.5">
                    <span className="text-sm text-slate-500 dark:text-slate-400 sm:w-44 shrink-0">حالة الاشتراك</span>
                    <Badge variant="outline" className="w-fit text-xs">
                      {profile.company.subscription_status}
                    </Badge>
                  </div>
                </SectionCard>
              )}

              {/* المركبة المخصصة */}
              <SectionCard
                title="المركبة المخصصة"
                icon={Car}
                action={<AddVehicleDialog onSuccess={fetchProfile} />}
              >
                {profile.vehicle ? (
                  <>
                    <InfoRow label="الماركة" value={profile.vehicle.brand} />
                    <InfoRow label="الموديل" value={profile.vehicle.model} />
                    <InfoRow label="رقم اللوحة" value={profile.vehicle.plate_number} />
                    <InfoRow label="رقم الهيكل (VIN)" value={profile.vehicle.vin} />
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-2.5">
                      <span className="text-sm text-slate-500 dark:text-slate-400 sm:w-44 shrink-0">الحالة</span>
                      <Badge
                        variant="outline"
                        className={`w-fit text-xs ${
                          profile.vehicle.status === "active"
                            ? "border-green-500 text-green-600"
                            : "border-slate-400 text-slate-500"
                        }`}
                      >
                        {profile.vehicle.status === "active" ? "نشطة" : profile.vehicle.status}
                      </Badge>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 py-2">
                    لم يتم تخصيص مركبة بعد
                  </p>
                )}

                {/* جميع مركبات الشركة */}
                {profile.all_vehicles && profile.all_vehicles.length > 1 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                      مركبات الشركة الأخرى ({profile.all_vehicles.length})
                    </p>
                    <div className="space-y-2">
                      {profile.all_vehicles.map((v) => (
                        <div
                          key={v.id}
                          className={`flex items-center justify-between p-2.5 rounded-xl text-xs ${
                            v.id === profile.vehicle?.id
                              ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                              : "bg-slate-50 dark:bg-slate-700/50"
                          }`}
                        >
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {v.brand} {v.model}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400">{v.plate_number}</span>
                          {v.id === profile.vehicle?.id && (
                            <Badge className="text-[10px] bg-blue-500 text-white border-0 px-1.5 py-0">
                              مخصصة لك
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </SectionCard>

              {/* ملاحظة للقراءة فقط */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  هذه البيانات للعرض فقط. للتعديل، يرجى التواصل مع المدير. يمكنك طلب إضافة مركبة جديدة وستخضع لموافقة المدير.
                </p>
              </div>
            </TabsContent>

            {/* ── تبويب الحساب ── */}
            <TabsContent value="account">
              <AccountTab user={user} logout={logout} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
