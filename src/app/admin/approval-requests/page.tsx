
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  AlertCircle,
  UserCheck,
  Building2,
  Car,
  Phone,
  Globe,
  CreditCard,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ApprovalRequest {
  id: number;
  request_type: string;
  entity_type: string;
  entity_id: number;
  requested_by_user_id: number;
  distributor_id: number;
  request_data: any;
  current_data: any;
  request_reason: string;
  status: string;
  reviewed_by_user_id: number;
  reviewed_at: string;
  review_notes: string;
  created_at: string;
}

interface DriverRegistrationRequest {
  id: number;
  driver_id: number;
  company_id: number;
  vehicle_id: number;
  full_name: string;
  phone: string;
  company_address: string;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_vin: string;
  vehicle_plate_number: string;
  tva_number: string;
  driver_license_number: string;
  bestuurderspas_number: string;
  status: string;
  payment_status: string;
  preferred_language: string;
  submitted_at: string;
  reviewed_at: string;
  review_notes: string;
  rejection_reason: string;
  company?: { name: string; vat_number: string };
  vehicle?: { brand: string; model: string; plate_number: string };
}

export default function ApprovalRequestsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [driverRequests, setDriverRequests] = useState<DriverRegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [driverLoading, setDriverLoading] = useState(true);

  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [selectedDriverRequest, setSelectedDriverRequest] = useState<DriverRegistrationRequest | null>(null);

  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showDriverReviewDialog, setShowDriverReviewDialog] = useState(false);

  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected'>('approved');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
    if (!isLoading && user && !user.isAdmin) router.push('/');
  }, [user, isLoading, router]);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<ApprovalRequest[]>('/approval-requests');
      const parsed = data.map((req: any) => ({
        ...req,
        request_data: typeof req.request_data === 'string' ? JSON.parse(req.request_data) : req.request_data,
        current_data: req.current_data && typeof req.current_data === 'string' ? JSON.parse(req.current_data) : req.current_data,
      }));
      setRequests(parsed);
    } catch (error: any) {
      toast.error(error.message || 'فشل تحميل طلبات الموافقة');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDriverRequests = useCallback(async () => {
    setDriverLoading(true);
    try {
      const data = await api.get<DriverRegistrationRequest[]>('/driver-registration/list');
      setDriverRequests(data || []);
    } catch (error: any) {
      toast.error(error.message || 'فشل تحميل طلبات تسجيل السائقين');
    } finally {
      setDriverLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.isAdmin === true) {
      fetchRequests();
      fetchDriverRequests();
    }
  }, [user, fetchRequests, fetchDriverRequests]);

  const handleReview = async () => {
    if (!selectedRequest) return;
    setSubmitting(true);
    try {
      await api.put('/approval-requests', {
        id: selectedRequest.id,
        status: reviewAction,
        review_notes: reviewNotes,
      });
      toast.success(`تم ${reviewAction === 'approved' ? 'الموافقة على' : 'رفض'} الطلب بنجاح`);
      setShowReviewDialog(false);
      setSelectedRequest(null);
      setReviewNotes('');
      fetchRequests();
    } catch (error: any) {
      toast.error(error.message || 'فشل مراجعة الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDriverReview = async () => {
    if (!selectedDriverRequest) return;
    setSubmitting(true);
    try {
      await api.post('/driver-registration/approve', {
        registration_request_id: selectedDriverRequest.id,
        action: reviewAction === 'approved' ? 'approve' : 'reject',
        rejection_reason: rejectionReason || null,
        review_notes: reviewNotes || null,
      });
      toast.success(
        reviewAction === 'approved'
          ? '✅ تمت الموافقة على السائق وتفعيل حسابه في بوابة السائق'
          : '❌ تم رفض طلب تسجيل السائق'
      );
      setShowDriverReviewDialog(false);
      setSelectedDriverRequest(null);
      setReviewNotes('');
      setRejectionReason('');
      fetchDriverRequests();
    } catch (error: any) {
      toast.error(error.message || 'فشل مراجعة طلب السائق');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string): React.ReactElement => {
    const map: Record<string, React.ReactElement> = {
      pending: (
        <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-0">
          <Clock className="w-3 h-3 mr-1" /> قيد الانتظار
        </Badge>
      ),
      under_review: (
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
          <FileText className="w-3 h-3 mr-1" /> قيد المراجعة
        </Badge>
      ),
      approved: (
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
          <CheckCircle2 className="w-3 h-3 mr-1" /> موافق عليه
        </Badge>
      ),
      rejected: (
        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">
          <XCircle className="w-3 h-3 mr-1" /> مرفوض
        </Badge>
      ),
    };
    return map[status] || <Badge>{status}</Badge>;
  };

  const getLangLabel = (lang: string) => {
    const map: Record<string, string> = { nl: '🇧🇪 NL', fr: '🇫🇷 FR', en: '🇬🇧 EN', ar: '🇸🇦 AR' };
    return map[lang] || lang;
  };

  const pendingDriverCount = driverRequests.filter(r => r.status === 'pending' || r.status === 'under_review').length;
  const pendingApprovalCount = requests.filter(r => r.status === 'pending').length;

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !user?.isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-2xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              طلبات الموافقة
            </h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs defaultValue="driver-registration">
          <TabsList className="w-full mb-6 rounded-2xl bg-white dark:bg-slate-800 shadow-md p-1">
            <TabsTrigger value="driver-registration" className="flex-1 rounded-xl gap-2">
              <UserCheck className="w-4 h-4" />
              تسجيل السائقين
              {pendingDriverCount > 0 && (
                <Badge className="bg-orange-500 text-white text-xs px-1.5 py-0 rounded-full">
                  {pendingDriverCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="general" className="flex-1 rounded-xl gap-2">
              <FileText className="w-4 h-4" />
              طلبات التعديل
              {pendingApprovalCount > 0 && (
                <Badge className="bg-blue-500 text-white text-xs px-1.5 py-0 rounded-full">
                  {pendingApprovalCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── تبويب تسجيل السائقين ── */}
          <TabsContent value="driver-registration">
            {driverLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : driverRequests.length === 0 ? (
              <EmptyState message="لا توجد طلبات تسجيل سائقين حالياً" />
            ) : (
              <div className="space-y-4">
                {driverRequests.map((req) => (
                  <DriverRequestCard
                    key={req.id}
                    req={req}
                    getStatusBadge={getStatusBadge}
                    getLangLabel={getLangLabel}
                    onApprove={() => {
                      setSelectedDriverRequest(req);
                      setReviewAction('approved');
                      setShowDriverReviewDialog(true);
                    }}
                    onReject={() => {
                      setSelectedDriverRequest(req);
                      setReviewAction('rejected');
                      setShowDriverReviewDialog(true);
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── تبويب طلبات التعديل العامة ── */}
          <TabsContent value="general">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : requests.length === 0 ? (
              <EmptyState message="لا توجد طلبات موافقة حالياً" />
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <GeneralRequestCard
                    key={request.id}
                    request={request}
                    getStatusBadge={getStatusBadge}
                    onApprove={() => {
                      setSelectedRequest(request);
                      setReviewAction('approved');
                      setShowReviewDialog(true);
                    }}
                    onReject={() => {
                      setSelectedRequest(request);
                      setReviewAction('rejected');
                      setShowReviewDialog(true);
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* ── Dialog مراجعة طلب السائق ── */}
      <Dialog open={showDriverReviewDialog} onOpenChange={setShowDriverReviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {reviewAction === 'approved' ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              {reviewAction === 'approved' ? 'الموافقة على تسجيل السائق' : 'رفض تسجيل السائق'}
            </DialogTitle>
          </DialogHeader>

          {selectedDriverRequest && (
            <div className="space-y-4 py-2">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm space-y-1">
                <p><strong>السائق:</strong> {selectedDriverRequest.full_name}</p>
                <p><strong>الهاتف:</strong> {selectedDriverRequest.phone}</p>
                <p><strong>اللغة:</strong> {getLangLabel(selectedDriverRequest.preferred_language)}</p>
              </div>

              {reviewAction === 'approved' && (
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-400">
                  <p className="font-semibold mb-1">✅ عند الموافقة سيتم تلقائياً:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-xs">
                    <li>تفعيل حساب السائق في بوابة السائق</li>
                    <li>ربط المركبة بالسائق</li>
                    <li>تعيين اللغة المفضلة ({getLangLabel(selectedDriverRequest.preferred_language)})</li>
                    <li>كلمة المرور الافتراضية: رقم الهاتف بدون مسافات</li>
                  </ul>
                </div>
              )}

              {reviewAction === 'rejected' && (
                <div className="space-y-1.5">
                  <Label>سبب الرفض</Label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="اذكر سبب رفض الطلب..."
                    className="rounded-xl"
                    rows={3}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label>ملاحظات إضافية (اختياري)</Label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="أضف ملاحظاتك هنا..."
                  className="rounded-xl"
                  rows={2}
                />
              </div>

              <Button
                onClick={handleDriverReview}
                disabled={submitting}
                className={`w-full rounded-2xl ${
                  reviewAction === 'approved'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                }`}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : reviewAction === 'approved' ? (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                {reviewAction === 'approved' ? 'تأكيد الموافقة وتفعيل الحساب' : 'تأكيد الرفض'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Dialog مراجعة الطلب العام ── */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approved' ? 'الموافقة على الطلب' : 'رفض الطلب'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>ملاحظات المراجعة</Label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="أضف ملاحظاتك هنا..."
                className="rounded-2xl"
                rows={4}
              />
            </div>
            <Button
              onClick={handleReview}
              disabled={submitting}
              className={`w-full rounded-2xl ${
                reviewAction === 'approved'
                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                  : 'bg-gradient-to-r from-red-500 to-red-600'
              }`}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {reviewAction === 'approved' ? (
                <><CheckCircle2 className="w-4 h-4 mr-2" /> تأكيد الموافقة</>
              ) : (
                <><XCircle className="w-4 h-4 mr-2" /> تأكيد الرفض</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── مكون بطاقة طلب تسجيل السائق ──────────────────────────────────────────────
function DriverRequestCard({
  req,
  getStatusBadge,
  getLangLabel,
  onApprove,
  onReject,
}: {
  req: DriverRegistrationRequest;
  getStatusBadge: (s: string) => React.ReactElement;
  getLangLabel: (l: string) => string;
  onApprove: () => void;
  onReject: () => void;
}) {
  const isPending = req.status === 'pending' || req.status === 'under_review';

  return (
    <Card className="p-6 rounded-3xl border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{req.full_name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              طلب تسجيل سائق جديد #{req.id}
            </p>
          </div>
        </div>
        {getStatusBadge(req.status)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {/* بيانات السائق */}
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 space-y-1.5">
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <User className="w-3 h-3" /> بيانات السائق
          </p>
          <p className="text-xs text-slate-700 dark:text-slate-300">
            <Phone className="w-3 h-3 inline mr-1" />{req.phone}
          </p>
          <p className="text-xs text-slate-700 dark:text-slate-300">
            رخصة: {req.driver_license_number}
          </p>
          {req.bestuurderspas_number && (
            <p className="text-xs text-slate-700 dark:text-slate-300">
              Bestuurderspas: {req.bestuurderspas_number}
            </p>
          )}
          <p className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Globe className="w-3 h-3" /> {getLangLabel(req.preferred_language)}
          </p>
        </div>

        {/* بيانات الشركة */}
        <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 space-y-1.5">
          <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
            <Building2 className="w-3 h-3" /> بيانات الشركة
          </p>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
            {req.company?.name || `شركة #${req.company_id}`}
          </p>
          {req.tva_number && (
            <p className="text-xs text-slate-700 dark:text-slate-300">TVA: {req.tva_number}</p>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{req.company_address}</p>
        </div>

        {/* بيانات المركبة */}
        <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 space-y-1.5">
          <p className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
            <Car className="w-3 h-3" /> بيانات المركبة
          </p>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
            {req.vehicle_brand} {req.vehicle_model}
          </p>
          <p className="text-xs text-slate-700 dark:text-slate-300">
            لوحة: {req.vehicle_plate_number}
          </p>
          {req.vehicle_vin && (
            <p className="text-xs text-slate-500 dark:text-slate-400">VIN: {req.vehicle_vin}</p>
          )}
        </div>
      </div>

      {/* حالة الدفع */}
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-4 h-4 text-slate-400" />
        <span className="text-xs text-slate-500">حالة الدفع:</span>
        <Badge
          className={`text-xs border-0 ${
            req.payment_status === 'paid'
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {req.payment_status === 'paid' ? '✅ مدفوع' : '⏳ لم يدفع بعد'}
        </Badge>
        {req.submitted_at && (
          <span className="text-xs text-slate-400 mr-auto">
            {new Date(req.submitted_at).toLocaleDateString('ar-SA')}
          </span>
        )}
      </div>

      {/* أزرار الموافقة/الرفض */}
      {isPending && (
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={onApprove}
            className="rounded-2xl border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            موافقة وتفعيل
          </Button>
          <Button
            variant="outline"
            onClick={onReject}
            className="rounded-2xl border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <XCircle className="w-4 h-4 mr-2" />
            رفض
          </Button>
        </div>
      )}

      {/* ملاحظات المراجعة */}
      {req.review_notes && (
        <div className="mt-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            <strong>ملاحظات:</strong> {req.review_notes}
          </p>
        </div>
      )}
      {req.rejection_reason && (
        <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
          <p className="text-xs text-red-600 dark:text-red-400">
            <strong>سبب الرفض:</strong> {req.rejection_reason}
          </p>
        </div>
      )}
    </Card>
  );
}

// ── مكون بطاقة الطلب العام ────────────────────────────────────────────────────
function GeneralRequestCard({
  request,
  getStatusBadge,
  onApprove,
  onReject,
}: {
  request: ApprovalRequest;
  getStatusBadge: (s: string) => React.ReactElement;
  onApprove: () => void;
  onReject: () => void;
}) {
  const entityLabels: Record<string, string> = {
    company: 'شركة', vehicle: 'مركبة', driver: 'سائق', invoice: 'فاتورة', expense: 'مصروف',
  };
  const typeLabels: Record<string, string> = { update: 'تعديل', delete: 'حذف' };

  return (
    <Card className="p-6 rounded-3xl border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {typeLabels[request.request_type] || request.request_type}{' '}
              {entityLabels[request.entity_type] || request.entity_type}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">معرف الكيان: {request.entity_id}</p>
          </div>
        </div>
        {getStatusBadge(request.status)}
      </div>

      {request.request_reason && (
        <div className="mb-4 p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <strong>السبب:</strong> {request.request_reason}
          </p>
        </div>
      )}

      <div className="mb-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
          <strong>البيانات المطلوب تعديلها:</strong>
        </p>
        <pre className="text-xs text-slate-700 dark:text-slate-300 overflow-x-auto">
          {JSON.stringify(request.request_data, null, 2)}
        </pre>
      </div>

      {request.status === 'pending' && (
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={onApprove}
            className="rounded-2xl border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" /> موافقة
          </Button>
          <Button
            variant="outline"
            onClick={onReject}
            className="rounded-2xl border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <XCircle className="w-4 h-4 mr-2" /> رفض
          </Button>
        </div>
      )}

      {request.review_notes && (
        <div className="mt-4 p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <strong>ملاحظات المراجعة:</strong> {request.review_notes}
          </p>
        </div>
      )}
    </Card>
  );
}

// ── مكون الحالة الفارغة ───────────────────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12">
      <AlertCircle className="w-16 h-16 mx-auto text-slate-400 mb-4" />
      <p className="text-slate-600 dark:text-slate-400">{message}</p>
    </div>
  );
}
