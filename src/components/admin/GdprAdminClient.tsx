
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Shield, AlertTriangle, FileText, Globe, Plus, Loader2, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

interface DSR {
  id: number; user_id: number; request_type: string; status: string;
  request_details?: string; requested_at: string; due_at?: string;
  resolved_at?: string; resolution_notes?: string;
}
interface BreachIncident {
  id: number; incident_code: string; title: string; description?: string;
  detected_at: string; risk_level: string; status: string;
  report_deadline_at: string; authority_notified_at?: string; users_notified_at?: string;
  authority_notification_required: boolean; user_notification_required: boolean;
}
interface DataTransfer {
  id: number; transfer_code: string; data_category: string;
  destination_country: string; recipient_type: string;
  transfer_purpose: string; legal_basis: string; safeguard_mechanism: string;
  is_active: boolean;
}

const DSR_TYPE_LABELS: Record<string, string> = {
  access: "الوصول", rectification: "التصحيح", erasure: "الحذف",
  portability: "النقل", restriction: "التقييد", objection: "الاعتراض",
};
const DSR_STATUS_COLORS: Record<string, string> = {
  submitted: "bg-yellow-100 text-yellow-700", in_review: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700", completed: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700", cancelled: "bg-slate-100 text-slate-700",
};
const RISK_COLORS: Record<string, string> = {
  low: "bg-green-100 text-green-700", medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700", critical: "bg-red-100 text-red-700",
};

function getDeadlineLabel(deadlineStr: string) {
  const now = Date.now();
  const deadline = new Date(deadlineStr).getTime();
  const diff = deadline - now;
  if (diff <= 0) return { label: "انتهى الوقت", urgent: true };
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return { label: `${hours} ساعة متبقية`, urgent: hours < 12 };
  return { label: `${Math.floor(hours / 24)} يوم متبقي`, urgent: false };
}

function DSRSection({ requests, onUpdateStatus }: { requests: DSR[]; onUpdateStatus: (id: number, status: string, notes: string) => Promise<void> }) {
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [openDialogId, setOpenDialogId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("in_review");

  const handleUpdate = async (id: number) => {
    setUpdatingId(id);
    try { await onUpdateStatus(id, selectedStatus, notes); setOpenDialogId(null); setNotes(""); }
    finally { setUpdatingId(null); }
  };

  if (requests.length === 0) return <p className="text-center text-slate-500 py-8">لا توجد طلبات</p>;

  return (
    <div className="space-y-3">
      {requests.map((r) => (
        <Card key={r.id} className="p-4 rounded-2xl border-0 shadow-md bg-white dark:bg-slate-800">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-semibold text-slate-900 dark:text-white text-sm">#{r.id} — {DSR_TYPE_LABELS[r.request_type] || r.request_type}</span>
                <Badge className={`${DSR_STATUS_COLORS[r.status] || "bg-slate-100"} border-0 text-xs`}>{r.status}</Badge>
              </div>
              <p className="text-xs text-slate-500">المستخدم: {r.user_id} — تاريخ الطلب: {new Date(r.requested_at).toLocaleDateString("ar-SA")}</p>
              {r.due_at && <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">الموعد النهائي: {new Date(r.due_at).toLocaleDateString("ar-SA")}</p>}
              {r.request_details && <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{r.request_details}</p>}
            </div>
            {r.status !== "completed" && r.status !== "rejected" && r.status !== "cancelled" && (
              <Dialog open={openDialogId === r.id} onOpenChange={(o) => setOpenDialogId(o ? r.id : null)}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="rounded-xl text-xs shrink-0">تحديث</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>تحديث حالة الطلب #{r.id}</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-2">
                    <div>
                      <Label>الحالة الجديدة</Label>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in_review">قيد المراجعة</SelectItem>
                          <SelectItem value="approved">موافق عليه</SelectItem>
                          <SelectItem value="completed">مكتمل</SelectItem>
                          <SelectItem value="rejected">مرفوض</SelectItem>
                          <SelectItem value="cancelled">ملغي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>ملاحظات</Label>
                      <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="rounded-xl mt-1" placeholder="أضف ملاحظات للمستخدم..." />
                    </div>
                    <Button onClick={() => handleUpdate(r.id)} disabled={updatingId === r.id} className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600">
                      {updatingId === r.id ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}حفظ
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

function BreachSection({ incidents, onUpdate }: { incidents: BreachIncident[]; onUpdate: () => void }) {
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", risk_level: "medium", authority_notification_required: false });

  const handleCreate = async () => {
    if (!form.title) { toast.error("العنوان مطلوب"); return; }
    setCreating(true);
    try {
      await api.post("/gdpr/admin/breach-incidents", { ...form, detected_at: new Date().toISOString() });
      toast.success("تم تسجيل حادثة الاختراق بنجاح");
      setShowCreate(false);
      onUpdate();
    } catch (e: any) { toast.error(e.message); }
    finally { setCreating(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate((v) => !v)} size="sm" className="rounded-xl bg-gradient-to-r from-red-500 to-orange-600">
          <Plus className="w-4 h-4 ml-1" />تسجيل حادثة جديدة
        </Button>
      </div>

      {showCreate && (
        <Card className="p-4 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 space-y-3">
          <p className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />تسجيل حادثة اختراق بيانات</p>
          <div><Label>العنوان *</Label><Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="rounded-xl mt-1" placeholder="وصف مختصر للحادثة" /></div>
          <div><Label>التفاصيل</Label><Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="rounded-xl mt-1" /></div>
          <div>
            <Label>مستوى الخطر</Label>
            <Select value={form.risk_level} onValueChange={(v) => setForm((p) => ({ ...p, risk_level: v }))}>
              <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">منخفض</SelectItem>
                <SelectItem value="medium">متوسط</SelectItem>
                <SelectItem value="high">مرتفع</SelectItem>
                <SelectItem value="critical">حرج</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCreate} disabled={creating} className="w-full rounded-xl bg-gradient-to-r from-red-500 to-orange-600">
            {creating ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}تسجيل الحادثة
          </Button>
        </Card>
      )}

      {incidents.length === 0 && !showCreate && <p className="text-center text-slate-500 py-8">لا توجد حوادث مسجلة</p>}

      {incidents.map((inc) => {
        const deadline = getDeadlineLabel(inc.report_deadline_at);
        return (
          <Card key={inc.id} className="p-4 rounded-2xl border-0 shadow-md bg-white dark:bg-slate-800">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{inc.title}</span>
                  <Badge className={`${RISK_COLORS[inc.risk_level] || "bg-slate-100"} border-0 text-xs`}>{inc.risk_level}</Badge>
                  <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-0 text-xs">{inc.status}</Badge>
                </div>
                <p className="text-xs text-slate-500">{inc.incident_code} — اكتشف في: {new Date(inc.detected_at).toLocaleString("ar-SA")}</p>
              </div>
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold ${deadline.urgent ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"}`}>
                <Clock className="w-3 h-3" />{deadline.label}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function DataTransfersSection({ transfers, onUpdate }: { transfers: DataTransfer[]; onUpdate: () => void }) {
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ data_category: "", destination_country: "", recipient_type: "processor", transfer_purpose: "", legal_basis: "", safeguard_mechanism: "adequacy_decision" });

  const handleCreate = async () => {
    if (!form.data_category || !form.destination_country || !form.transfer_purpose || !form.legal_basis) { toast.error("جميع الحقول المطلوبة يجب ملؤها"); return; }
    setCreating(true);
    try {
      await api.post("/gdpr/admin/data-transfers", form);
      toast.success("تم إضافة سجل نقل البيانات");
      setShowCreate(false);
      onUpdate();
    } catch (e: any) { toast.error(e.message); }
    finally { setCreating(false); }
  };

  const handleDelete = async (id: number) => {
    try { await api.delete(`/gdpr/admin/data-transfers?id=${id}`); toast.success("تم حذف السجل"); onUpdate(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate((v) => !v)} size="sm" className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600">
          <Plus className="w-4 h-4 ml-1" />إضافة سجل نقل
        </Button>
      </div>

      {showCreate && (
        <Card className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <p className="font-semibold text-slate-800 dark:text-slate-200">إضافة سجل نقل بيانات جديد</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><Label>فئة البيانات *</Label><Input value={form.data_category} onChange={(e) => setForm((p) => ({ ...p, data_category: e.target.value }))} className="rounded-xl mt-1" placeholder="مثال: بيانات السائق" /></div>
            <div><Label>الدولة المستقبِلة *</Label><Input value={form.destination_country} onChange={(e) => setForm((p) => ({ ...p, destination_country: e.target.value }))} className="rounded-xl mt-1" placeholder="Belgium" /></div>
            <div>
              <Label>نوع المستقبِل</Label>
              <Select value={form.recipient_type} onValueChange={(v) => setForm((p) => ({ ...p, recipient_type: v }))}>
                <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="processor">معالج</SelectItem>
                  <SelectItem value="subprocessor">معالج فرعي</SelectItem>
                  <SelectItem value="partner">شريك</SelectItem>
                  <SelectItem value="authority">جهة حكومية</SelectItem>
                  <SelectItem value="internal_group">مجموعة داخلية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>آلية الحماية</Label>
              <Select value={form.safeguard_mechanism} onValueChange={(v) => setForm((p) => ({ ...p, safeguard_mechanism: v }))}>
                <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="adequacy_decision">قرار الكفاءة</SelectItem>
                  <SelectItem value="scc">البنود التعاقدية القياسية</SelectItem>
                  <SelectItem value="bcr">قواعد قواعد الشركة الملزمة</SelectItem>
                  <SelectItem value="explicit_consent">الموافقة الصريحة</SelectItem>
                  <SelectItem value="contract_necessity">ضرورة تعاقدية</SelectItem>
                  <SelectItem value="legal_obligation">التزام قانوني</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>غرض النقل *</Label><Textarea value={form.transfer_purpose} onChange={(e) => setForm((p) => ({ ...p, transfer_purpose: e.target.value }))} className="rounded-xl mt-1" /></div>
          <div><Label>الأساس القانوني *</Label><Input value={form.legal_basis} onChange={(e) => setForm((p) => ({ ...p, legal_basis: e.target.value }))} className="rounded-xl mt-1" placeholder="مثال: GDPR Art. 6(1)(c)" /></div>
          <Button onClick={handleCreate} disabled={creating} className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600">
            {creating ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}إضافة
          </Button>
        </Card>
      )}

      {transfers.length === 0 && !showCreate && <p className="text-center text-slate-500 py-8">لا توجد سجلات نقل بيانات</p>}

      {transfers.map((t) => (
        <Card key={t.id} className="p-4 rounded-2xl border-0 shadow-md bg-white dark:bg-slate-800">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Globe className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="font-semibold text-slate-900 dark:text-white text-sm">{t.data_category}</span>
                <span className="text-xs text-slate-500">→ {t.destination_country}</span>
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0 text-xs">{t.safeguard_mechanism}</Badge>
              </div>
              <p className="text-xs text-slate-500">{t.transfer_code} — {t.recipient_type} — {t.legal_basis}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1">{t.transfer_purpose}</p>
            </div>
            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 rounded-xl text-xs shrink-0" onClick={() => handleDelete(t.id)}>حذف</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function GdprAdminClient() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [dsrList, setDsrList] = useState<DSR[]>([]);
  const [incidents, setIncidents] = useState<BreachIncident[]>([]);
  const [transfers, setTransfers] = useState<DataTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) router.push("/dashboard");
  }, [user, isLoading, router]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dsrs, incs, trans] = await Promise.all([
        api.get<DSR[]>("/gdpr/admin/data-subject-requests"),
        api.get<BreachIncident[]>("/gdpr/admin/breach-incidents"),
        api.get<DataTransfer[]>("/gdpr/admin/data-transfers"),
      ]);
      setDsrList(dsrs || []);
      setIncidents(incs || []);
      setTransfers(trans || []);
    } catch (e: any) {
      toast.error(e.message || "فشل تحميل بيانات GDPR");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (user?.isAdmin) fetchAll(); }, [user, fetchAll]);

  const handleUpdateDsr = async (id: number, status: string, notes: string) => {
    await api.put(`/gdpr/admin/data-subject-requests?id=${id}`, { status, resolution_notes: notes });
    toast.success("تم تحديث حالة الطلب");
    fetchAll();
  };

  if (isLoading || loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;
  }

  const filteredDsrs = statusFilter === "all" ? dsrList : dsrList.filter((r) => r.status === statusFilter);
  const openIncidents = incidents.filter((i) => i.status === "open" || i.status === "investigating");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/dashboard"><Button variant="ghost" size="icon" className="rounded-2xl"><ArrowLeft className="w-5 h-5" /></Button></Link>
          <Shield className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">GDPR & الامتثال للخصوصية</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "إجمالي الطلبات", value: dsrList.length, icon: FileText, color: "from-blue-500 to-blue-600" },
            { label: "طلبات معلقة", value: dsrList.filter((r) => r.status === "submitted" || r.status === "in_review").length, icon: Clock, color: "from-yellow-500 to-amber-600" },
            { label: "حوادث مفتوحة", value: openIncidents.length, icon: AlertTriangle, color: "from-red-500 to-rose-600" },
            { label: "نقل بيانات نشط", value: transfers.length, icon: Globe, color: "from-indigo-500 to-violet-600" },
          ].map((s) => (
            <Card key={s.label} className="p-4 rounded-2xl border-0 shadow-lg bg-white dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="requests">
          <TabsList className="mb-6 rounded-2xl bg-white dark:bg-slate-800 shadow p-1 inline-flex">
            <TabsTrigger value="requests" className="rounded-xl gap-1.5 text-xs px-3">
              <FileText className="w-3.5 h-3.5" />طلبات البيانات ({dsrList.length})
            </TabsTrigger>
            <TabsTrigger value="breaches" className="rounded-xl gap-1.5 text-xs px-3">
              <AlertTriangle className="w-3.5 h-3.5" />الاختراقات ({incidents.length})
            </TabsTrigger>
            <TabsTrigger value="transfers" className="rounded-xl gap-1.5 text-xs px-3">
              <Globe className="w-3.5 h-3.5" />نقل البيانات ({transfers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <div className="mb-4 flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">تصفية:</p>
              {["all", "submitted", "in_review", "completed", "rejected"].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${statusFilter === s ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"}`}>
                  {s === "all" ? "الكل" : s}
                </button>
              ))}
            </div>
            <DSRSection requests={filteredDsrs} onUpdateStatus={handleUpdateDsr} />
          </TabsContent>

          <TabsContent value="breaches">
            <BreachSection incidents={incidents} onUpdate={fetchAll} />
          </TabsContent>

          <TabsContent value="transfers">
            <DataTransfersSection transfers={transfers} onUpdate={fetchAll} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
