
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Bell,
  ArrowLeft,
  Plus,
  Send,
  Edit,
  Trash2,
  AlertCircle,
  Info,
  Megaphone,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
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

interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  priority: string;
  target_audience: string;
  target_company_id: number | null;
  icon_url: string | null;
  action_url: string | null;
  is_active: boolean;
  scheduled_at: string | null;
  expires_at: string | null;
  created_at: string;
}

interface Company {
  id: number;
  name: string;
}

export default function AdminNotificationsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    notification_type: 'announcement',
    priority: 'normal',
    target_audience: 'all_drivers',
    target_company_id: '',
    icon_url: '',
    action_url: '',
    scheduled_at: '',
    expires_at: ''
  });
  const [editNotification, setEditNotification] = useState({
    title: '',
    message: '',
    notification_type: 'announcement',
    priority: 'normal',
    target_audience: 'all_drivers',
    target_company_id: '',
    icon_url: '',
    action_url: '',
    is_active: true,
    scheduled_at: '',
    expires_at: ''
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
    if (!isLoading && user?.role !== 'app20251225073911jaqqaxdfir_v1_admin_user') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.get<Notification[]>('/notifications');
      setNotifications(data);
    } catch (error: any) {
      toast.error(error.message || 'فشل تحميل الإشعارات');
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
    if (user?.role === 'app20251225073911jaqqaxdfir_v1_admin_user') {
      fetchNotifications();
      fetchCompanies();
    }
  }, [user]);

  const handleCreateNotification = async () => {
    if (!newNotification.title || !newNotification.message) {
      toast.error('العنوان والرسالة مطلوبان');
      return;
    }

    try {
      const notificationData: any = {
        title: newNotification.title,
        message: newNotification.message,
        notification_type: newNotification.notification_type,
        priority: newNotification.priority,
        target_audience: newNotification.target_audience,
        icon_url: newNotification.icon_url || null,
        action_url: newNotification.action_url || null,
        scheduled_at: newNotification.scheduled_at || null,
        expires_at: newNotification.expires_at || null
      };

      if (newNotification.target_audience === 'specific_company' && newNotification.target_company_id) {
        notificationData.target_company_id = parseInt(newNotification.target_company_id);
      }

      await api.post('/notifications', notificationData);
      
      toast.success('تم إرسال الإشعار بنجاح', {
        description: `سيظهر للسائقين: ${getAudienceLabel(newNotification.target_audience)}`,
        duration: 5000,
      });
      
      setDialogOpen(false);
      setNewNotification({
        title: '',
        message: '',
        notification_type: 'announcement',
        priority: 'normal',
        target_audience: 'all_drivers',
        target_company_id: '',
        icon_url: '',
        action_url: '',
        scheduled_at: '',
        expires_at: ''
      });
      fetchNotifications();
    } catch (error: any) {
      toast.error(error.message || 'فشل إرسال الإشعار');
    }
  };

  const handleEditNotification = (notification: Notification) => {
    setSelectedNotification(notification);
    setEditNotification({
      title: notification.title,
      message: notification.message,
      notification_type: notification.notification_type,
      priority: notification.priority,
      target_audience: notification.target_audience,
      target_company_id: notification.target_company_id?.toString() || '',
      icon_url: notification.icon_url || '',
      action_url: notification.action_url || '',
      is_active: notification.is_active,
      scheduled_at: notification.scheduled_at || '',
      expires_at: notification.expires_at || ''
    });
    setEditDialogOpen(true);
  };

  const handleUpdateNotification = async () => {
    if (!selectedNotification) return;

    if (!editNotification.title || !editNotification.message) {
      toast.error('العنوان والرسالة مطلوبان');
      return;
    }

    try {
      const updateData: any = {
        title: editNotification.title,
        message: editNotification.message,
        notification_type: editNotification.notification_type,
        priority: editNotification.priority,
        target_audience: editNotification.target_audience,
        icon_url: editNotification.icon_url || null,
        action_url: editNotification.action_url || null,
        is_active: editNotification.is_active,
        scheduled_at: editNotification.scheduled_at || null,
        expires_at: editNotification.expires_at || null
      };

      if (editNotification.target_audience === 'specific_company' && editNotification.target_company_id) {
        updateData.target_company_id = parseInt(editNotification.target_company_id);
      } else {
        updateData.target_company_id = null;
      }

      await api.put(`/notifications?id=${selectedNotification.id}`, updateData);
      
      toast.success('تم تحديث الإشعار بنجاح');
      setEditDialogOpen(false);
      setSelectedNotification(null);
      fetchNotifications();
    } catch (error: any) {
      toast.error(error.message || 'فشل تحديث الإشعار');
    }
  };

  const handleDeleteNotification = (notification: Notification) => {
    setSelectedNotification(notification);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteNotification = async () => {
    if (!selectedNotification) return;

    try {
      await api.delete(`/notifications?id=${selectedNotification.id}`);
      toast.success('تم حذف الإشعار بنجاح');
      setDeleteDialogOpen(false);
      setSelectedNotification(null);
      fetchNotifications();
    } catch (error: any) {
      toast.error(error.message || 'فشل حذف الإشعار');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'news':
        return <Info className="w-5 h-5" />;
      case 'announcement':
        return <Megaphone className="w-5 h-5" />;
      case 'update':
        return <Sparkles className="w-5 h-5" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5" />;
      case 'promotion':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'news': return 'أخبار';
      case 'announcement': return 'إعلان';
      case 'update': return 'تحديث';
      case 'alert': return 'تنبيه';
      case 'promotion': return 'عرض ترويجي';
      default: return type;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">عاجل</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0">عالي</Badge>;
      case 'normal':
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">عادي</Badge>;
      case 'low':
        return <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-0">منخفض</Badge>;
      default:
        return null;
    }
  };

  const getAudienceLabel = (audience: string) => {
    switch (audience) {
      case 'all_drivers': return 'جميع السائقين';
      case 'specific_company': return 'شركة معينة';
      case 'active_drivers': return 'السائقون النشطون فقط';
      default: return audience;
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== 'app20251225073911jaqqaxdfir_v1_admin_user') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-2xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              إدارة الإشعارات
            </h1>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600">
                  <Plus className="w-5 h-5 ml-2" />
                  إشعار جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>إرسال إشعار جديد</DialogTitle>
                  <DialogDescription>
                    سيظهر الإشعار لجميع السائقين المستهدفين فوراً
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>العنوان *</Label>
                    <Input
                      value={newNotification.title}
                      onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                      className="rounded-2xl mt-2"
                      placeholder="عنوان الإشعار"
                    />
                  </div>
                  <div>
                    <Label>الرسالة *</Label>
                    <Textarea
                      value={newNotification.message}
                      onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                      className="rounded-2xl mt-2 min-h-[100px]"
                      placeholder="نص الإشعار الكامل"
                    />
                  </div>
                  <div>
                    <Label>نوع الإشعار</Label>
                    <Select
                      value={newNotification.notification_type}
                      onValueChange={(value) => setNewNotification({ ...newNotification, notification_type: value })}
                    >
                      <SelectTrigger className="rounded-2xl mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="news">أخبار</SelectItem>
                        <SelectItem value="announcement">إعلان</SelectItem>
                        <SelectItem value="update">تحديث</SelectItem>
                        <SelectItem value="alert">تنبيه</SelectItem>
                        <SelectItem value="promotion">عرض ترويجي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>الأولوية</Label>
                    <Select
                      value={newNotification.priority}
                      onValueChange={(value) => setNewNotification({ ...newNotification, priority: value })}
                    >
                      <SelectTrigger className="rounded-2xl mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">منخفضة</SelectItem>
                        <SelectItem value="normal">عادية</SelectItem>
                        <SelectItem value="high">عالية</SelectItem>
                        <SelectItem value="urgent">عاجلة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>الجمهور المستهدف</Label>
                    <Select
                      value={newNotification.target_audience}
                      onValueChange={(value) => setNewNotification({ ...newNotification, target_audience: value })}
                    >
                      <SelectTrigger className="rounded-2xl mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_drivers">جميع السائقين</SelectItem>
                        <SelectItem value="specific_company">شركة معينة</SelectItem>
                        <SelectItem value="active_drivers">السائقون النشطون فقط</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newNotification.target_audience === 'specific_company' && (
                    <div>
                      <Label>اختر الشركة</Label>
                      <Select
                        value={newNotification.target_company_id}
                        onValueChange={(value) => setNewNotification({ ...newNotification, target_company_id: value })}
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
                  )}
                  <Button 
                    onClick={handleCreateNotification}
                    className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600"
                  >
                    <Send className="w-5 h-5 ml-2" />
                    إرسال الإشعار
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 rounded-3xl border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">إجمالي الإشعارات</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{notifications.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Bell className="w-7 h-7 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-3xl border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">الإشعارات النشطة</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {notifications.filter(n => n.is_active).length}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <Send className="w-7 h-7 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-3xl border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">الإشعارات العاجلة</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {notifications.filter(n => n.priority === 'urgent').length}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                <AlertCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <Card className="p-12 rounded-3xl border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
              <div className="text-center">
                <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-10 h-10 text-slate-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400">لا توجد إشعارات</p>
              </div>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id}
                className="p-6 rounded-3xl border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                      {getTypeIcon(notification.notification_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {notification.title}
                        </h3>
                        {getPriorityBadge(notification.priority)}
                        <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0">
                          {getTypeLabel(notification.notification_type)}
                        </Badge>
                        {!notification.is_active && (
                          <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-0">
                            غير نشط
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                        <span>الجمهور: {getAudienceLabel(notification.target_audience)}</span>
                        <span>•</span>
                        <span>{new Date(notification.created_at).toLocaleDateString('ar-SA')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-2xl"
                      onClick={() => handleEditNotification(notification)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-2xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => handleDeleteNotification(notification)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل الإشعار</DialogTitle>
            <DialogDescription>
              قم بتحديث معلومات الإشعار
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>العنوان *</Label>
              <Input
                value={editNotification.title}
                onChange={(e) => setEditNotification({ ...editNotification, title: e.target.value })}
                className="rounded-2xl mt-2"
                placeholder="عنوان الإشعار"
              />
            </div>
            <div>
              <Label>الرسالة *</Label>
              <Textarea
                value={editNotification.message}
                onChange={(e) => setEditNotification({ ...editNotification, message: e.target.value })}
                className="rounded-2xl mt-2 min-h-[100px]"
                placeholder="نص الإشعار الكامل"
              />
            </div>
            <div>
              <Label>نوع الإشعار</Label>
              <Select
                value={editNotification.notification_type}
                onValueChange={(value) => setEditNotification({ ...editNotification, notification_type: value })}
              >
                <SelectTrigger className="rounded-2xl mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="news">أخبار</SelectItem>
                  <SelectItem value="announcement">إعلان</SelectItem>
                  <SelectItem value="update">تحديث</SelectItem>
                  <SelectItem value="alert">تنبيه</SelectItem>
                  <SelectItem value="promotion">عرض ترويجي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>الأولوية</Label>
              <Select
                value={editNotification.priority}
                onValueChange={(value) => setEditNotification({ ...editNotification, priority: value })}
              >
                <SelectTrigger className="rounded-2xl mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">منخفضة</SelectItem>
                  <SelectItem value="normal">عادية</SelectItem>
                  <SelectItem value="high">عالية</SelectItem>
                  <SelectItem value="urgent">عاجلة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>الحالة</Label>
              <Select
                value={editNotification.is_active ? 'active' : 'inactive'}
                onValueChange={(value) => setEditNotification({ ...editNotification, is_active: value === 'active' })}
              >
                <SelectTrigger className="rounded-2xl mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleUpdateNotification}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600"
            >
              حفظ التغييرات
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا الإشعار؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الإشعار بشكل نهائي.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl">إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteNotification}
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
