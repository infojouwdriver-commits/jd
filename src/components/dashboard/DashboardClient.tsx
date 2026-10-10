
"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ManagementShell from "@/components/navigation/ManagementShell";
import { managementMenu } from "@/components/navigation/management-menu";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Search,
  ArrowUpLeft,
  Building2,
  Users,
  Car,
  TestTube,
  MapPin,
  Settings,
  Bell,
  CheckCircle,
  UserCog,
  MessageSquare,
  ShieldCheck,
  LogOut,
  User,
  Mail,
  FileText,
  Megaphone,
  Shield,
} from "lucide-react";
import DriverDashboard from "@/components/driver/DriverDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const adminMenuItems = managementMenu;

function AdminMenuGrid() {
  const [query, setQuery] = useState('');
  const items = adminMenuItems.filter(item => `${item.title} ${item.description}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <div className="space-y-7">
    <div className="workspace-search"><Search size={20} aria-hidden="true" /><input aria-label="البحث في أقسام الإدارة" value={query} onChange={event => setQuery(event.target.value)} placeholder="ابحث عن السائقين، المركبات، الرحلات…" /><span>{items.length} قسم</span></div>
    {['التشغيل', 'التواصل', 'الإدارة', 'التكامل'].map(group => {
      const visible = items.filter(item => item.group === group);
      if (!visible.length) return null;
      return <section key={group} aria-label={group}><h2 className="mb-3 text-sm font-semibold text-muted-foreground">{group}</h2><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">{visible.map(item => <Link key={item.href} href={item.href} className="workspace-launch-card"><div className="workspace-launch-icon"><item.icon size={23} aria-hidden="true" /></div><div className="min-w-0 flex-1"><h3 className="font-semibold">{item.title}</h3><p className="mt-1 text-sm text-muted-foreground">{item.description}</p></div><ArrowUpLeft size={18} className="text-muted-foreground" aria-hidden="true" /></Link>)}</div></section>;
    })}
    {!items.length && <p role="status" className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">لا توجد أقسام بهذا الاسم. جرّب كلمة أخرى.</p>}
  </div>;
}

function AdminAccountTab({ user, logout }: { user: any; logout: () => void }) {
  return (
    <div className="max-w-xl space-y-4">
      <Card className="rounded-3xl border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{user?.email}</h3>
              <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 text-xs mt-1">
                {user?.isAdmin ? "مسؤول النظام" : "مدير"}
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Mail className="w-4 h-4" />
                البريد الإلكتروني
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <FileText className="w-4 h-4" />
                معرف الحساب
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-white">#{user?.sub}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4" />
                نوع الحساب
              </div>
              <Badge variant="outline" className="text-xs border-blue-300 text-blue-600">
                {user?.isAdmin ? "مسؤول" : "مدير"}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      <Card className="rounded-3xl border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
        <div className="p-6">
          <Button
            onClick={logout}
            variant="outline"
            className="w-full rounded-2xl border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 gap-2 h-12"
          >
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </Button>
        </div>
      </Card>
    </div>
  );
}

function AdminDashboard({ email, user, logout }: { email: string; user: any; logout: () => void }) {
  return (
    <ManagementShell><div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              إدارة المشروع
            </h1>
            <p className="text-slate-600 dark:text-slate-400">كل ما تحتاجه لإدارة شركتك، في مكان واحد.</p>
          </div>
        </div>

        <Tabs defaultValue="dashboard">
          <TabsList className="mb-8 rounded-2xl bg-white dark:bg-slate-800 shadow-md p-1 w-auto inline-flex">
            <TabsTrigger value="dashboard" className="rounded-xl gap-1.5 px-5">
              <Settings className="w-4 h-4" />
              لوحة التحكم
            </TabsTrigger>
            <TabsTrigger value="account" className="rounded-xl gap-1.5 px-5">
              <User className="w-4 h-4" />
              حسابي
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AdminMenuGrid />
          </TabsContent>

          <TabsContent value="account">
            <AdminAccountTab user={user} logout={logout} />
          </TabsContent>
        </Tabs>
      </div>
    </div></ManagementShell>
  );
}

export default function DashboardClient() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    } else if (!isLoading && user && !user.isAdmin && ['manager', 'company', 'owner'].includes(user.userType || '')) {
      router.replace('/company/dashboard');
    } else if (!isLoading && user?.userType === "distributor") {
      router.push("/distributor/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;
  if (user.userType === "distributor") return null;

  if (user.userType === "driver" && !user.isAdmin) {
    return <DriverDashboard />;
  }

  if (!user.isAdmin) return null;
  return <AdminDashboard email={user.email} user={user} logout={logout} />;
}
