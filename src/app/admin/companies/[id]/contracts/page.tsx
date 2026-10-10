
'use client';

import {sanitizeHtml} from "@/lib/sanitize-html";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Plus,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  Send,
  Mail,
  FileCheck
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface Contract {
  id: number;
  company_id: number;
  contract_number: string;
  contract_type: string;
  contract_start_date: string;
  contract_end_date: string;
  contract_duration_months: number;
  monthly_fee: number;
  annual_fee: number;
  contract_status: string;
  contract_html_template: string;
  contract_pdf_url: string | null;
  auto_renew: boolean;
  renewal_notice_days: number;
  created_at: string;
  signature_token: string | null;
  signature_link_sent_at: string | null;
  signature_link_expires_at: string | null;
  signed_at: string | null;
  signer_ip: string | null;
  signer_user_agent: string | null;
}

interface Company {
  id: number;
  name: string;
  vat_number: string;
  kbo_number: string;
  email: string;
  phone: string;
  address: string;
}

interface Signature {
  id: number;
  contract_id: number;
  signer_name: string;
  signer_email: string;
  signer_position: string | null;
  signature_ip: string;
  signature_user_agent: string;
  signed_at: string;
  signature_method: string;
  is_verified: boolean;
}

export default function CompanyContractsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const companyId = params?.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [previewContract, setPreviewContract] = useState<Contract | null>(null);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [selectedContractSignatures, setSelectedContractSignatures] = useState<Signature[]>([]);
  const [creating, setCreating] = useState(false);
  const [sendingSignatureLink, setSendingSignatureLink] = useState<number | null>(null);
  const [loadingSignatures, setLoadingSignatures] = useState(false);

  const [newContract, setNewContract] = useState({
    contract_start_date: new Date().toISOString().split('T')[0],
    contract_duration_months: 12,
    monthly_fee: 99.00,
    auto_renew: true,
    renewal_notice_days: 90
  });

  const [editForm, setEditForm] = useState({
    monthly_fee: 0,
    contract_duration_months: 12,
    auto_renew: true
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
    if (!isLoading && user && !user.isAdmin) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const fetchCompany = async () => {
    try {
      const companies = await api.get<Company[]>('/companies');
      const foundCompany = companies.find(c => c.id === parseInt(companyId));
      if (foundCompany) {
        setCompany(foundCompany);
      }
    } catch (error: any) {
      toast.error(error.message || 'فشل تحميل معلومات الشركة');
    }
  };

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const data = await api.get<Contract[]>(`/contracts?company_id=${companyId}`);
      setContracts(data);
    } catch (error: any) {
      toast.error(error.message || 'فشل تحميل العقود');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin === true && companyId) {
      fetchCompany();
      fetchContracts();
    }
  }, [user, companyId]);

  const handleCreateContract = async () => {
    if (!company) {
      toast.error('معلومات الشركة غير متوفرة');
      return;
    }

    setCreating(true);
    try {
      const contractNumber = `CONTRACT-${companyId}-${Date.now()}`;
      const startDate = new Date(newContract.contract_start_date);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + newContract.contract_duration_months);

      const annualFee = newContract.monthly_fee * 12;

      await api.post('/contracts', {
        company_id: parseInt(companyId),
        contract_number: contractNumber,
        contract_type: 'annual_subscription',
        contract_start_date: newContract.contract_start_date,
        contract_end_date: endDate.toISOString().split('T')[0],
        contract_duration_months: newContract.contract_duration_months,
        monthly_fee: newContract.monthly_fee,
        annual_fee: annualFee,
        auto_renew: newContract.auto_renew,
        renewal_notice_days: newContract.renewal_notice_days,
        company_name: company.name,
        company_vat: company.vat_number,
        company_kbo: company.kbo_number,
        company_email: company.email,
        company_phone: company.phone,
        company_address: company.address
      });

      toast.success('تم إنشاء العقد بنجاح');
      setShowCreateDialog(false);
      setNewContract({
        contract_start_date: new Date().toISOString().split('T')[0],
        contract_duration_months: 12,
        monthly_fee: 99.00,
        auto_renew: true,
        renewal_notice_days: 90
      });
      fetchContracts();
    } catch (error: any) {
      toast.error(error.message || 'فشل إنشاء العقد');
    } finally {
      setCreating(false);
    }
  };

  const handleEditContract = (contract: Contract) => {
    setEditingContract(contract);
    setEditForm({
      monthly_fee: contract.monthly_fee,
      contract_duration_months: contract.contract_duration_months,
      auto_renew: contract.auto_renew
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingContract) return;

    try {
      await api.put('/contracts', {
        id: editingContract.id,
        monthly_fee: editForm.monthly_fee,
        annual_fee: editForm.monthly_fee * 12,
        contract_duration_months: editForm.contract_duration_months,
        auto_renew: editForm.auto_renew
      });

      toast.success('تم تحديث العقد بنجاح');
      setShowEditDialog(false);
      setEditingContract(null);
      fetchContracts();
    } catch (error: any) {
      toast.error(error.message || 'فشل تحديث العقد');
    }
  };

  const handleDeleteContract = async (contractId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا العقد؟')) {
      return;
    }

    try {
      await api.delete(`/contracts?id=${contractId}`);
      toast.success('تم حذف العقد بنجاح');
      fetchContracts();
    } catch (error: any) {
      toast.error(error.message || 'فشل حذف العقد');
    }
  };

  const handleSendSignatureLink = async (contractId: number) => {
    setSendingSignatureLink(contractId);
    try {
      await api.post('/contracts/send-signature-link', {
        contract_id: contractId
      });

      toast.success('تم إرسال رابط التوقيع بنجاح');
      fetchContracts();
    } catch (error: any) {
      toast.error(error.message || 'فشل إرسال رابط التوقيع');
    } finally {
      setSendingSignatureLink(null);
    }
  };

  const handleActivateContract = async (contractId: number) => {
    try {
      await api.put('/contracts', {
        id: contractId,
        contract_status: 'active'
      });

      await api.put('/companies', {
        id: parseInt(companyId),
        subscription_status: 'active',
        current_contract_id: contractId
      });

      toast.success('تم تفعيل العقد بنجاح');
      fetchContracts();
      fetchCompany();
    } catch (error: any) {
      toast.error(error.message || 'فشل تفعيل العقد');
    }
  };

  const handleSuspendContract = async (contractId: number) => {
    const reason = prompt('أدخل سبب تعليق العقد:');
    if (!reason) return;

    try {
      await api.put('/contracts', {
        id: contractId,
        contract_status: 'suspended',
        suspension_reason: reason
      });

      await api.put('/companies', {
        id: parseInt(companyId),
        subscription_status: 'suspended',
        suspension_reason: reason
      });

      toast.success('تم تعليق العقد بنجاح');
      fetchContracts();
      fetchCompany();
    } catch (error: any) {
      toast.error(error.message || 'فشل تعليق العقد');
    }
  };

  const handlePreviewContract = (contract: Contract) => {
    setPreviewContract(contract);
    setShowPreviewDialog(true);
  };

  const handleViewSignatures = async (contract: Contract) => {
    setLoadingSignatures(true);
    setShowSignatureDialog(true);
    try {
      const signatures = await api.get<Signature[]>(`/contracts/signatures?contract_id=${contract.id}`);
      setSelectedContractSignatures(signatures);
    } catch (error: any) {
      toast.error(error.message || 'فشل تحميل التوقيعات');
      setSelectedContractSignatures([]);
    } finally {
      setLoadingSignatures(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
            <CheckCircle2 className="w-3 h-3 ml-1" />
            نشط
          </Badge>
        );
      case 'suspended':
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">
            <AlertCircle className="w-3 h-3 ml-1" />
            معلق
          </Badge>
        );
      case 'pending_signature':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-0">
            <Clock className="w-3 h-3 ml-1" />
            بانتظار التوقيع
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-0">
            منتهي
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin/companies">
              <Button variant="ghost" size="icon" className="rounded-2xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                عقود الشركة
              </h1>
              {company && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {company.name}
                </p>
              )}
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600">
                  <Plus className="w-5 h-5 ml-2" />
                  عقد جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>إنشاء عقد جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>تاريخ بداية العقد *</Label>
                    <Input
                      type="date"
                      value={newContract.contract_start_date}
                      onChange={(e) => setNewContract({...newContract, contract_start_date: e.target.value})}
                      className="rounded-2xl"
                    />
                  </div>

                  <div>
                    <Label>مدة العقد (بالأشهر) *</Label>
                    <Input
                      type="number"
                      value={newContract.contract_duration_months}
                      onChange={(e) => setNewContract({...newContract, contract_duration_months: parseInt(e.target.value)})}
                      className="rounded-2xl"
                      min="1"
                    />
                  </div>

                  <div>
                    <Label>الرسوم الشهرية (€) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newContract.monthly_fee}
                      onChange={(e) => setNewContract({...newContract, monthly_fee: parseFloat(e.target.value)})}
                      className="rounded-2xl"
                      min="0"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      الرسوم السنوية: €{(newContract.monthly_fee * 12).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="auto_renew"
                      checked={newContract.auto_renew}
                      onChange={(e) => setNewContract({...newContract, auto_renew: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="auto_renew">التجديد التلقائي</Label>
                  </div>

                  <div>
                    <Label>مدة الإشعار قبل التجديد (بالأيام)</Label>
                    <Input
                      type="number"
                      value={newContract.renewal_notice_days}
                      onChange={(e) => setNewContract({...newContract, renewal_notice_days: parseInt(e.target.value)})}
                      className="rounded-2xl"
                      min="0"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateContract}
                    disabled={creating}
                    className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600"
                  >
                    {creating ? (
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                    ) : (
                      <Plus className="w-5 h-5 ml-2" />
                    )}
                    إنشاء العقد
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {contracts.length === 0 ? (
          <Card className="p-12 rounded-3xl border-0 shadow-xl">
            <div className="text-center">
              <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">لا توجد عقود</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                ابدأ بإنشاء عقد جديد للشركة
              </p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600"
              >
                <Plus className="w-5 h-5 ml-2" />
                إنشاء عقد جديد
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {contracts.map((contract) => (
              <Card 
                key={contract.id}
                className="p-6 rounded-3xl border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                        {contract.contract_number}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        عقد اشتراك سنوي
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(contract.contract_status)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs text-blue-600 dark:text-blue-400">تاريخ البداية</span>
                    </div>
                    <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                      {new Date(contract.contract_start_date).toLocaleDateString('ar-SA')}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs text-purple-600 dark:text-purple-400">تاريخ النهاية</span>
                    </div>
                    <p className="text-sm font-bold text-purple-900 dark:text-purple-100">
                      {new Date(contract.contract_end_date).toLocaleDateString('ar-SA')}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-xs text-green-600 dark:text-green-400">شهري</span>
                    </div>
                    <p className="text-sm font-bold text-green-900 dark:text-green-100">
                      €{contract.monthly_fee.toFixed(2)}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      <span className="text-xs text-orange-600 dark:text-orange-400">سنوي</span>
                    </div>
                    <p className="text-sm font-bold text-orange-900 dark:text-orange-100">
                      €{contract.annual_fee.toFixed(2)}
                    </p>
                  </div>
                </div>

                {contract.signature_link_sent_at && (
                  <div className="mb-4 p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-blue-900 dark:text-blue-100">
                        تم إرسال رابط التوقيع في: {new Date(contract.signature_link_sent_at).toLocaleString('ar-SA')}
                      </span>
                    </div>
                    {contract.signature_link_expires_at && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 mr-6">
                        ينتهي في: {new Date(contract.signature_link_expires_at).toLocaleString('ar-SA')}
                      </p>
                    )}
                  </div>
                )}

                {contract.signed_at && (
                  <div className="mb-4 p-3 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-green-900 dark:text-green-100">
                        تم التوقيع في: {new Date(contract.signed_at).toLocaleString('ar-SA')}
                      </span>
                    </div>
                    {contract.signer_ip && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1 mr-6">
                        IP: {contract.signer_ip}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewContract(contract)}
                    className="rounded-2xl"
                  >
                    <Eye className="w-4 h-4 ml-2" />
                    معاينة العقد
                  </Button>

                  {contract.signed_at && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewSignatures(contract)}
                      className="rounded-2xl"
                    >
                      <FileCheck className="w-4 h-4 ml-2" />
                      إثبات التوقيع
                    </Button>
                  )}

                  {contract.contract_status === 'pending_signature' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendSignatureLink(contract.id)}
                        disabled={sendingSignatureLink === contract.id}
                        className="rounded-2xl"
                      >
                        {sendingSignatureLink === contract.id ? (
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 ml-2" />
                        )}
                        إرسال رابط التوقيع
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditContract(contract)}
                        className="rounded-2xl"
                      >
                        <Edit className="w-4 h-4 ml-2" />
                        تعديل
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleActivateContract(contract.id)}
                        className="rounded-2xl"
                      >
                        <CheckCircle2 className="w-4 h-4 ml-2" />
                        تفعيل يدوياً
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteContract(contract.id)}
                        className="rounded-2xl"
                      >
                        <Trash2 className="w-4 h-4 ml-2" />
                        حذف
                      </Button>
                    </>
                  )}

                  {contract.contract_status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuspendContract(contract.id)}
                      className="rounded-2xl text-red-600 hover:text-red-700"
                    >
                      <AlertCircle className="w-4 h-4 ml-2" />
                      تعليق العقد
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>معاينة العقد</DialogTitle>
          </DialogHeader>
          {previewContract && (
            <div 
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(previewContract.contract_html_template) }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل العقد</DialogTitle>
          </DialogHeader>
          {editingContract && (
            <div className="space-y-4 py-4">
              <div>
                <Label>الرسوم الشهرية (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.monthly_fee}
                  onChange={(e) => setEditForm({...editForm, monthly_fee: parseFloat(e.target.value)})}
                  className="rounded-2xl"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  الرسوم السنوية: €{(editForm.monthly_fee * 12).toFixed(2)}
                </p>
              </div>

              <div>
                <Label>مدة العقد (بالأشهر)</Label>
                <Input
                  type="number"
                  value={editForm.contract_duration_months}
                  onChange={(e) => setEditForm({...editForm, contract_duration_months: parseInt(e.target.value)})}
                  className="rounded-2xl"
                  min="1"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit_auto_renew"
                  checked={editForm.auto_renew}
                  onChange={(e) => setEditForm({...editForm, auto_renew: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="edit_auto_renew">التجديد التلقائي</Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSaveEdit}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600"
                >
                  <Edit className="w-5 h-5 ml-2" />
                  حفظ التعديلات
                </Button>
                <Button
                  onClick={() => setShowEditDialog(false)}
                  variant="outline"
                  className="rounded-2xl"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Signature Proof Dialog */}
      <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إثبات التوقيع الإلكتروني</DialogTitle>
          </DialogHeader>
          {loadingSignatures ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : selectedContractSignatures.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 dark:text-slate-400">لا توجد توقيعات لهذا العقد</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedContractSignatures.map((signature) => (
                <Card key={signature.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-lg">{signature.signer_name}</span>
                      {signature.is_verified && (
                        <Badge className="bg-green-100 text-green-700 border-0">
                          موثق
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">البريد الإلكتروني:</span>
                        <p className="font-medium">{signature.signer_email}</p>
                      </div>
                      
                      {signature.signer_position && (
                        <div>
                          <span className="text-slate-600 dark:text-slate-400">المنصب:</span>
                          <p className="font-medium">{signature.signer_position}</p>
                        </div>
                      )}
                      
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">تاريخ التوقيع:</span>
                        <p className="font-medium">{new Date(signature.signed_at).toLocaleString('ar-SA')}</p>
                      </div>
                      
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">طريقة التوقيع:</span>
                        <p className="font-medium">
                          {signature.signature_method === 'electronic' ? 'إلكتروني' : signature.signature_method}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">عنوان IP:</span>
                        <p className="font-medium font-mono text-xs">{signature.signature_ip}</p>
                      </div>
                      
                      <div className="col-span-2">
                        <span className="text-slate-600 dark:text-slate-400">المتصفح:</span>
                        <p className="font-medium text-xs break-all">{signature.signature_user_agent}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
