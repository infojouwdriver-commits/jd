
"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
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

const adminMenuItems = [
  { title: "إدارة الشركات", description: "عرض وإدارة جميع الشركات", icon: Building2, href: "/admin/companies", color: "from-blue-500 to-blue-600" },
  { title: "إدارة السائقين", description: "عرض وإدارة جميع السائقين", icon: Users, href: "/admin/drivers", color: "from-green-500 to-green-600" },
  { title: "إدارة المركبات", description: "عرض وإدارة جميع المركبات", icon: Car, href: "/admin/vehicles", color: "from-purple-500 to-purple-600" },
  { title: "إدارة الرحلات", description: "عرض ومراقبة جميع الرحلات", icon: MapPin, href: "/admin/trips", color: "from-orange-500 to-orange-600" },
  { title: "رحلات الاختبار", description: "إدارة رحلات اختبار Chiron", icon: TestTube, href: "/admin/test-trips", color: "from-pink-500 to-pink-600" },
  { title: "مزامنة Chiron", description: "مراقبة وإعادة محاولة المزامنة", icon: Settings, href: "/admin/chiron-sync", color: "from-indigo-500 to-indigo-600" },
  { title: "إدارة الإشعارات", description: "إرسال إشعارات للسائقين", icon: Bell, href: "/admin/notifications", color: "from-yellow-500 to-yellow-600" },
  { title: "الرسائل الداخلية", description: "إرسال واستقبال الرسائل", icon: MessageSquare, href: "/admin/messages", color: "from-teal-500 to-teal-600" },
  { title: "إدارة الموزعين", description: "إدارة الموزعين وصلاحياتهم", icon: UserCog, href: "/admin/distributors", color: "from-cyan-500 to-cyan-600" },
  { title: "طلبات الموافقة", description: "مراجعة طلبات التعديل والحذف", icon: CheckCircle, href: "/admin/approval-requests", color: "from-rose-500 to-rose-600" },
  { title: "إدارة المستخدمين", description: "منح وسحب صلاحيات المديرين", icon: ShieldCheck, href: "/admin/users", color: "from-amber-500 to-yellow-600" },
  { title: "إدارة الإعلانات", description: "نشر وتعديل المساحات الإعلانية في الصفحة الرئيسية", icon: Megaphone, href: "/admin/ad-slots", color: "from-fuchsia-500 to-pink-600" },
  { title: "GDPR والامتثال", description: "إدارة حقوق البيانات وحوادث الاختراق وسجل النقل", icon: Shield, href: "/admin/gdpr", color: "from-emerald-500 to-teal-600" },
];

function AdminMenuGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {adminMenuItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Link key={index} href={item.href}>
            <Card className="p-6 rounded-3xl border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:scale-105 transition-transform duration-300 cursor-pointer">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
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
              <span className="text-sm font-medium text-slate-900 dark:text-white">#{user?.id}</span>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              مرحباً، {email}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">لوحة تحكم المسؤول</p>
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
    </div>
  );
}

export default function DashboardClient() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
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

  return <AdminDashboard email={user.email} user={user} logout={logout} />;
}
