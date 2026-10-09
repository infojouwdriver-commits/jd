
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Shield,
  ShieldOff,
  Search,
  Loader2,
  RefreshCw,
  User,
  Crown,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface UserRecord {
  id: number;
  email: string;
  role: string;
  user_type: string;
  created_at: string;
  isAdmin: boolean;
}

const ADMIN_ROLE = 'app20251225073911jaqqaxdfir_v161_admin_user';
const USER_ROLE = 'app20251225073911jaqqaxdfir_v161_user';

export default function UsersManagementClient() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    targetUser: UserRecord | null;
    newRole: string;
  }>({ open: false, targetUser: null, newRole: '' });
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
    if (!isLoading && !user?.isAdmin) router.push('/dashboard');
  }, [user, isLoading, router]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<UserRecord[]>('/admin/users');
      setUsers(data || []);
    } catch (error: any) {
      toast.error(error.message || 'فشل تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.isAdmin) fetchUsers();
  }, [user, fetchUsers]);

  const openConfirmDialog = (targetUser: UserRecord, newRole: string) => {
    setConfirmDialog({ open: true, targetUser, newRole });
  };

  const handleUpdateRole = async () => {
    const { targetUser, newRole } = confirmDialog;
    if (!targetUser) return;

    setUpdating(targetUser.id);
    setConfirmDialog({ open: false, targetUser: null, newRole: '' });

    try {
      await api.put(`/admin/users?id=${targetUser.id}`, { role: newRole });
      toast.success(
        newRole === ADMIN_ROLE
          ? `تم منح صلاحية المدير لـ ${targetUser.email}`
          : `تم سحب صلاحية المدير من ${targetUser.email}`
      );
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'فشل تحديث الصلاحيات');
    } finally {
      setUpdating(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.user_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const adminCount = users.filter((u) => u.isAdmin).length;
  const regularCount = users.filter((u) => !u.isAdmin).length;

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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-2xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              إدارة المستخدمين والصلاحيات
            </h1>
            <Button
              variant="outline"
              size="icon"
              className="rounded-2xl"
              onClick={fetchUsers}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="p-5 rounded-3xl border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">المديرون</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{adminCount}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 rounded-3xl border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">المستخدمون العاديون</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{regularCount}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالبريد الإلكتروني أو نوع المستخدم..."
            className="pr-12 rounded-2xl h-12"
          />
        </div>

        {/* Users List */}
        <div className="space-y-3">
          {filteredUsers.length === 0 ? (
            <Card className="p-12 rounded-3xl border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 text-center">
              <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">لا يوجد مستخدمون</p>
            </Card>
          ) : (
            filteredUsers.map((u) => (
              <UserRow
                key={u.id}
                userRecord={u}
                currentUserId={user?.sub}
                updating={updating === u.id}
                onToggleAdmin={() =>
                  openConfirmDialog(u, u.isAdmin ? USER_ROLE : ADMIN_ROLE)
                }
              />
            ))
          )}
        </div>
      </main>

      {/* Confirm Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog((prev) => ({ ...prev, open }))
        }
      >
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.newRole === ADMIN_ROLE
                ? '🔑 منح صلاحية المدير'
                : '⚠️ سحب صلاحية المدير'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.newRole === ADMIN_ROLE ? (
                <>
                  هل تريد منح صلاحية <strong>مدير كامل</strong> للمستخدم{' '}
                  <strong>{confirmDialog.targetUser?.email}</strong>؟
                  <br />
                  <span className="text-orange-600 dark:text-orange-400 text-sm mt-2 block">
                    سيتمكن من الوصول إلى جميع بيانات النظام وإدارتها.
                  </span>
                </>
              ) : (
                <>
                  هل تريد سحب صلاحية المدير من{' '}
                  <strong>{confirmDialog.targetUser?.email}</strong>؟
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpdateRole}
              className={`rounded-2xl ${
                confirmDialog.newRole === ADMIN_ROLE
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {confirmDialog.newRole === ADMIN_ROLE ? 'منح الصلاحية' : 'سحب الصلاحية'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface UserRowProps {
  userRecord: UserRecord;
  currentUserId?: string;
  updating: boolean;
  onToggleAdmin: () => void;
}

function UserRow({ userRecord, currentUserId, updating, onToggleAdmin }: UserRowProps) {
  const isSelf = String(userRecord.id) === String(currentUserId);

  return (
    <Card className="p-4 rounded-3xl border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0 ${
              userRecord.isAdmin
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                : 'bg-gradient-to-br from-slate-400 to-slate-500'
            }`}
          >
            {userRecord.isAdmin ? (
              <Crown className="w-5 h-5 text-white" />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {userRecord.email}
              </p>
              {isSelf && (
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0 text-xs">
                  أنت
                </Badge>
              )}
              {userRecord.isAdmin ? (
                <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-0 text-xs">
                  <Crown className="w-3 h-3 ml-1" />
                  مدير
                </Badge>
              ) : (
                <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border-0 text-xs">
                  مستخدم
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {userRecord.user_type} · {new Date(userRecord.created_at).toLocaleDateString('ar-SA')}
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant={userRecord.isAdmin ? 'outline' : 'default'}
          className={`rounded-2xl flex-shrink-0 ${
            userRecord.isAdmin
              ? 'text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950'
              : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0'
          }`}
          onClick={onToggleAdmin}
          disabled={updating || isSelf}
        >
          {updating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : userRecord.isAdmin ? (
            <>
              <ShieldOff className="w-4 h-4 ml-1" />
              سحب
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 ml-1" />
              منح مدير
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
