
"use client";

import {sanitizeHtml} from "@/lib/sanitize-html";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Plus,
  Megaphone,
  Loader2,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Code,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

interface AdSlot {
  id: number;
  slot_key: string;
  title: string;
  html_content: string;
  is_active: boolean;
  start_time?: string | null;
  end_time?: string | null;
  display_order: number;
  create_time?: string;
}

const EMPTY_FORM = {
  title: "",
  slot_key: "home_mid_banner",
  html_content: "",
  is_active: true,
  display_order: 1,
  start_time: "",
  end_time: "",
};

export default function AdSlotsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [slots, setSlots] = useState<AdSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AdSlot | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewSlot, setPreviewSlot] = useState<AdSlot | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
    if (!isLoading && user && !user.isAdmin) router.push("/dashboard");
  }, [user, isLoading, router]);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<AdSlot[]>("/homepage-ad-slots?admin=true");
      setSlots(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error?.message || "فشل تحميل الإعلانات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.isAdmin) fetchSlots();
  }, [user, fetchSlots]);

  const handleCreate = async () => {
    if (!form.title || !form.html_content) {
      toast.error("العنوان ومحتوى HTML مطلوبان");
      return;
    }
    setSaving(true);
    try {
      await api.post("/homepage-ad-slots", {
        ...form,
        display_order: Number(form.display_order),
        start_time: form.start_time || null,
        end_time: form.end_time || null,
      });
      toast.success("تم إنشاء الإعلان بنجاح");
      setShowCreateDialog(false);
      setForm({ ...EMPTY_FORM });
      fetchSlots();
    } catch (error: any) {
      toast.error(error?.message || "فشل إنشاء الإعلان");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEdit = (slot: AdSlot) => {
    setSelectedSlot(slot);
    setEditForm({
      title: slot.title,
      slot_key: slot.slot_key,
      html_content: slot.html_content,
      is_active: slot.is_active,
      display_order: slot.display_order,
      start_time: slot.start_time || "",
      end_time: slot.end_time || "",
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    if (!selectedSlot) return;
    if (!editForm.title || !editForm.html_content) {
      toast.error("العنوان ومحتوى HTML مطلوبان");
      return;
    }
    setSaving(true);
    try {
      await api.put(`/homepage-ad-slots?id=${selectedSlot.id}`, {
        ...editForm,
        display_order: Number(editForm.display_order),
        start_time: editForm.start_time || null,
        end_time: editForm.end_time || null,
      });
      toast.success("تم تحديث الإعلان بنجاح");
      setShowEditDialog(false);
      fetchSlots();
    } catch (error: any) {
      toast.error(error?.message || "فشل تحديث الإعلان");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (slot: AdSlot) => {
    try {
      await api.put(`/homepage-ad-slots?id=${slot.id}`, { is_active: !slot.is_active });
      toast.success(slot.is_active ? "تم إيقاف الإعلان" : "تم تفعيل الإعلان");
      fetchSlots();
    } catch (error: any) {
      toast.error(error?.message || "فشل تغيير حالة الإعلان");
    }
  };

  const handleDelete = async () => {
    if (!selectedSlot) return;
    setDeleting(true);
    try {
      await api.delete(`/homepage-ad-slots?id=${selectedSlot.id}`);
      toast.success("تم حذف الإعلان بنجاح");
      setShowDeleteDialog(false);
      setSelectedSlot(null);
      fetchSlots();
    } catch (error: any) {
      toast.error(error?.message || "فشل حذف الإعلان");
    } finally {
      setDeleting(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-fuchsia-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-2xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
            إدارة الإعلانات
          </h1>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="rounded-2xl bg-gradient-to-r from-fuchsia-500 to-pink-600"
          >
            <Plus className="w-5 h-5 ml-2" />
            إعلان جديد
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {slots.length === 0 ? (
          <Card className="p-12 rounded-3xl border-0 shadow-xl bg-white dark:bg-slate-800 text-center">
            <Megaphone className="w-16 h-16 mx-auto text-fuchsia-400 mb-4" />
            <h3 className="text-xl font-bold text-slate-700 dark:text-white mb-2">لا توجد إعلانات بعد</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">أنشئ أول إعلان لعرضه في الصفحة الرئيسية</p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="rounded-2xl bg-gradient-to-r from-fuchsia-500 to-pink-600"
            >
              <Plus className="w-5 h-5 ml-2" />
              إنشاء إعلان
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {slots.map((slot) => (
              <Card
                key={slot.id}
                className="p-6 rounded-3xl border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Megaphone className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{slot.title}</h3>
                        <Badge
                          className={
                            slot.is_active
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 border-0"
                          }
                        >
                          {slot.is_active ? "نشط" : "موقوف"}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs border-fuchsia-300 text-fuchsia-600 dark:border-fuchsia-700 dark:text-fuchsia-400"
                        >
                          {slot.slot_key}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        ترتيب العرض: {slot.display_order}
                        {slot.start_time && ` · من: ${new Date(slot.start_time).toLocaleDateString("ar")}`}
                        {slot.end_time && ` · إلى: ${new Date(slot.end_time).toLocaleDateString("ar")}`}
                      </p>
                      <div className="mt-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-700/50 font-mono text-xs text-slate-600 dark:text-slate-300 truncate">
                        <Code className="w-3 h-3 inline ml-1" />
                        {slot.html_content.substring(0, 120)}
                        {slot.html_content.length > 120 && "..."}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => setPreviewSlot(slot)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => handleOpenEdit(slot)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="rounded-xl text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                      onClick={() => {
                        setSelectedSlot(slot);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-2 px-2">
                      {slot.is_active ? (
                        <Eye className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-slate-400" />
                      )}
                      <Switch
                        checked={slot.is_active}
                        onCheckedChange={() => handleToggleActive(slot)}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">إنشاء إعلان جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>عنوان الإعلان</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="مثال: عرض مميز للشهر"
                className="rounded-xl mt-1"
              />
            </div>

            <div>
              <Label>Slot Key</Label>
              <Input
                value={form.slot_key}
                onChange={(e) => setForm((prev) => ({ ...prev, slot_key: e.target.value }))}
                placeholder="home_mid_banner"
                className="rounded-xl mt-1 font-mono"
              />
            </div>

            <div>
              <Label>HTML Content</Label>
              <Textarea
                value={form.html_content}
                onChange={(e) => setForm((prev) => ({ ...prev, html_content: e.target.value }))}
                placeholder={`<div style="padding:16px;border-radius:12px;background:#0b1220;color:#fff">Your Ad</div>`}
                className="rounded-xl mt-1 min-h-[180px] font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label>Order</Label>
                <Input
                  type="number"
                  value={form.display_order}
                  onChange={(e) => setForm((prev) => ({ ...prev, display_order: Number(e.target.value) || 1 }))}
                  className="rounded-xl mt-1"
                />
              </div>
              <div>
                <Label>Start Time</Label>
                <Input
                  type="datetime-local"
                  value={form.start_time}
                  onChange={(e) => setForm((prev) => ({ ...prev, start_time: e.target.value }))}
                  className="rounded-xl mt-1"
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="datetime-local"
                  value={form.end_time}
                  onChange={(e) => setForm((prev) => ({ ...prev, end_time: e.target.value }))}
                  className="rounded-xl mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border p-3">
              <span className="text-sm text-slate-600 dark:text-slate-300">تفعيل الإعلان عند الإنشاء</span>
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_active: checked }))}
              />
            </div>

            <Button
              onClick={handleCreate}
              disabled={saving}
              className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 to-pink-600"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin ml-2" /> : <CheckCircle2 className="w-5 h-5 ml-2" />}
              حفظ الإعلان
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">تعديل الإعلان</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>عنوان الإعلان</Label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                className="rounded-xl mt-1"
              />
            </div>

            <div>
              <Label>Slot Key</Label>
              <Input
                value={editForm.slot_key}
                onChange={(e) => setEditForm((prev) => ({ ...prev, slot_key: e.target.value }))}
                className="rounded-xl mt-1 font-mono"
              />
            </div>

            <div>
              <Label>HTML Content</Label>
              <Textarea
                value={editForm.html_content}
                onChange={(e) => setEditForm((prev) => ({ ...prev, html_content: e.target.value }))}
                className="rounded-xl mt-1 min-h-[180px] font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label>Order</Label>
                <Input
                  type="number"
                  value={editForm.display_order}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, display_order: Number(e.target.value) || 1 }))
                  }
                  className="rounded-xl mt-1"
                />
              </div>
              <div>
                <Label>Start Time</Label>
                <Input
                  type="datetime-local"
                  value={editForm.start_time}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, start_time: e.target.value }))}
                  className="rounded-xl mt-1"
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="datetime-local"
                  value={editForm.end_time}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, end_time: e.target.value }))}
                  className="rounded-xl mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border p-3">
              <span className="text-sm text-slate-600 dark:text-slate-300">حالة الإعلان</span>
              <Switch
                checked={editForm.is_active}
                onCheckedChange={(checked) => setEditForm((prev) => ({ ...prev, is_active: checked }))}
              />
            </div>

            <Button
              onClick={handleUpdate}
              disabled={saving}
              className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 to-pink-600"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin ml-2" /> : <CheckCircle2 className="w-5 h-5 ml-2" />}
              حفظ التعديلات
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewSlot} onOpenChange={() => setPreviewSlot(null)}>
        <DialogContent className="max-w-3xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">معاينة الإعلان</DialogTitle>
          </DialogHeader>
          <div className="rounded-2xl border p-4 bg-white dark:bg-slate-900">
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(previewSlot?.html_content || "") }} />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الإعلان</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الإعلان؟ لا يمكن التراجع بعد الحذف.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl bg-red-600 hover:bg-red-700"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
