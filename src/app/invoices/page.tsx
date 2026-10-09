
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft,
  Plus,
  FileText,
  Trash2,
  Loader2,
  Search,
  Download,
  Send,
  Calendar,
  Edit,
  Building2
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Company {
  id: number;
  name: string;
  vat_number: string;
  kbo_number: string;
  address: string;
  email: string;
  phone: string;
  client_name: string;
  bank_account_iban: string;
  bank_account_bic: string;
  bank_account_holder: string;
}

interface Invoice {
  id: number;
  invoice_number: string;
  client_name: string;
  client_address: string;
  client_vat: string;
  client_email: string;
  client_phone: string;
  total_htva: number;
  vat_rate: number;
  total_tvac: number;
  invoice_date: string;
  status: string;
  payment_status: string;
  company_id: number;
  pdf_url?: string;
  invoice_type: string;
  recurrence_period?: string;
  next_invoice_date?: string;
  sent_at?: string;
  items: any[];
  invoice_category: string;
  payment_reference?: string;
  issuer_company_id: number;
  client_company_id?: number;
}

export default function InvoicesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [sendingId, setSendingId] = useState<number | null>(null);

  const [newInvoice, setNewInvoice] = useState({
    issuer_company_id: '',
    client_company_id: '',
    invoice_number: '',
    client_name: '',
    client_address: '',
    client_vat: '',
    client_email: '',
    client_phone: '',
    total_tvac: '',
    vat_rate: '21',
    invoice_date: new Date().toISOString().split('T')[0],
    status: 'draft',
    payment_status: 'pending',
    invoice_type: 'one_time',
    recurrence_period: '',
    description: '',
    invoice_category: 'company'
  });

  const [editForm, setEditForm] = useState({
    total_tvac: '',
    status: '',
    payment_status: '',
    client_email: '',
    edit_reason: ''
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [companiesData, invoicesData] = await Promise.all([
        api.get<Company[]>('/companies'),
        api.get<Invoice[]>('/invoices')
      ]);
      
      setCompanies(companiesData);
      setInvoices(invoicesData);
      setFilteredInvoices(invoicesData);
    } catch (error: any) {
      toast.error(error.message || 'فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    let filtered = invoices;

    if (selectedCompany) {
      filtered = filtered.filter(inv => 
        inv.issuer_company_id === parseInt(selectedCompany) || 
        inv.client_company_id === parseInt(selectedCompany)
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(inv => 
        inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.client_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredInvoices(filtered);
  }, [selectedCompany, searchQuery, invoices]);

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}-${random}`;
  };

  const handleIssuerCompanyChange = (companyId: string) => {
    const company = companies.find(c => c.id === parseInt(companyId));
    if (company) {
      setNewInvoice({
        ...newInvoice,
        issuer_company_id: companyId,
        invoice_number: generateInvoiceNumber()
      });
    }
  };

  const handleClientCompanyChange = (companyId: string) => {
    const company = companies.find(c => c.id === parseInt(companyId));
    if (company) {
      setNewInvoice({
        ...newInvoice,
        client_company_id: companyId,
        client_name: company.client_name || company.name,
        client_address: company.address || '',
        client_vat: company.vat_number || '',
        client_email: company.email || '',
        client_phone: company.phone || ''
      });
    }
  };

  const calculateTotals = (totalTvac: number, vatRate: number) => {
    const totalHtva = totalTvac / (1 + vatRate / 100);
    return {
      total_htva: totalHtva,
      total_tvac: totalTvac
    };
  };

  const handleCreateInvoice = async () => {
    if (!newInvoice.issuer_company_id || !newInvoice.invoice_number || !newInvoice.client_name || !newInvoice.total_tvac) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (newInvoice.invoice_type === 'subscription' && !newInvoice.recurrence_period) {
      toast.error('يرجى اختيار فترة التكرار للاشتراك');
      return;
    }

    setCreating(true);
    try {
      const totalTvac = parseFloat(newInvoice.total_tvac);
      const vatRate = parseFloat(newInvoice.vat_rate);
      const { total_htva } = calculateTotals(totalTvac, vatRate);

      const items = newInvoice.description ? [{
        description: newInvoice.description,
        quantity: 1,
        unitPrice: total_htva,
        total: total_htva
      }] : [];

      let nextInvoiceDate = null;
      if (newInvoice.invoice_type === 'subscription' && newInvoice.recurrence_period) {
        const currentDate = new Date(newInvoice.invoice_date);
        if (newInvoice.recurrence_period === 'monthly') {
          currentDate.setMonth(currentDate.getMonth() + 1);
        } else if (newInvoice.recurrence_period === 'quarterly') {
          currentDate.setMonth(currentDate.getMonth() + 3);
        } else if (newInvoice.recurrence_period === 'yearly') {
          currentDate.setFullYear(currentDate.getFullYear() + 1);
        }
        nextInvoiceDate = currentDate.toISOString().split('T')[0];
      }

      await api.post('/invoices', {
        company_id: parseInt(newInvoice.issuer_company_id),
        issuer_company_id: parseInt(newInvoice.issuer_company_id),
        client_company_id: newInvoice.client_company_id ? parseInt(newInvoice.client_company_id) : null,
        invoice_number: newInvoice.invoice_number,
        client_name: newInvoice.client_name,
        client_address: newInvoice.client_address,
        client_vat: newInvoice.client_vat,
        client_email: newInvoice.client_email,
        client_phone: newInvoice.client_phone,
        total_htva: total_htva,
        vat_rate: vatRate,
        total_tvac: totalTvac,
        invoice_date: newInvoice.invoice_date,
        status: newInvoice.status,
        payment_status: newInvoice.payment_status,
        invoice_type: newInvoice.invoice_type,
        recurrence_period: newInvoice.recurrence_period || null,
        next_invoice_date: nextInvoiceDate,
        items: items,
        invoice_category: newInvoice.invoice_category
      });

      toast.success('تم إنشاء الفاتورة بنجاح');
      setShowCreateDialog(false);
      setNewInvoice({
        issuer_company_id: '',
        client_company_id: '',
        invoice_number: '',
        client_name: '',
        client_address: '',
        client_vat: '',
        client_email: '',
        client_phone: '',
        total_tvac: '',
        vat_rate: '21',
        invoice_date: new Date().toISOString().split('T')[0],
        status: 'draft',
        payment_status: 'pending',
        invoice_type: 'one_time',
        recurrence_period: '',
        description: '',
        invoice_category: 'company'
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'فشل إنشاء الفاتورة');
    } finally {
      setCreating(false);
    }
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setEditForm({
      total_tvac: invoice.total_tvac.toString(),
      status: invoice.status,
      payment_status: invoice.payment_status,
      client_email: invoice.client_email || '',
      edit_reason: ''
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingInvoice || !editForm.edit_reason) {
      toast.error('يرجى إدخال سبب التعديل');
      return;
    }

    try {
      const totalTvac = parseFloat(editForm.total_tvac);
      const vatRate = editingInvoice.vat_rate;
      const { total_htva } = calculateTotals(totalTvac, vatRate);

      await api.put(`/invoices?id=${editingInvoice.id}`, {
        total_htva,
        total_tvac: totalTvac,
        status: editForm.status,
        payment_status: editForm.payment_status,
        client_email: editForm.client_email,
        edit_reason: editForm.edit_reason
      });

      toast.success('تم تحديث الفاتورة بنجاح');
      setShowEditDialog(false);
      setEditingInvoice(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'فشل تحديث الفاتورة');
    }
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    setDownloadingId(invoice.id);
    try {
      const endpoint = invoice.invoice_category === 'trip' 
        ? `/trips/generate-invoice?id=${invoice.id}`
        : `/invoices/generate-company-invoice?id=${invoice.id}`;
      
      const response = await fetch(`/next_api${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('فشل تحميل الفاتورة');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Factuur-${invoice.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('تم تحميل الفاتورة بنجاح');
    } catch (error: any) {
      console.error("Operation failed");
      toast.error('فشل تحميل الفاتورة');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSendInvoice = async (invoice: Invoice) => {
    if (!invoice.client_email) {
      toast.error('لا يوجد بريد إلكتروني للعميل');
      return;
    }

    setSendingId(invoice.id);
    try {
      await api.post('/invoices/send', {
        invoice_id: invoice.id
      });

      toast.success('تم إرسال الفاتورة بنجاح');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'فشل إرسال الفاتورة');
    } finally {
      setSendingId(null);
    }
  };

  const handleDeleteInvoice = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
      return;
    }

    try {
      await api.delete(`/invoices?id=${id}`);
      toast.success('تم حذف الفاتورة بنجاح');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'فشل حذف الفاتورة');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'مسودة', className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
      sent: { label: 'مرسلة', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
      paid: { label: 'مدفوعة', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      cancelled: { label: 'ملغاة', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
      overdue: { label: 'متأخرة', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge className={`${config.className} border-0`}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'قيد الانتظار', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
      paid: { label: 'مدفوع', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      overdue: { label: 'متأخر', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
      cancelled: { label: 'ملغي', className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
      refunded: { label: 'مسترد', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={`${config.className} border-0`}>{config.label}</Badge>;
  };

  const getCategoryBadge = (category: string, vatRate: number) => {
    if (category === 'trip') {
      return <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0">رحلة ({vatRate}%)</Badge>;
    }
    return <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-0">شركة ({vatRate}%)</Badge>;
  };

  const getInvoiceTypeBadge = (type: string, recurrence?: string) => {
    if (type === 'subscription') {
      const periodLabels = {
        monthly: 'شهري',
        quarterly: 'ربع سنوي',
        yearly: 'سنوي'
      };
      const label = recurrence ? periodLabels[recurrence as keyof typeof periodLabels] : 'اشتراك';
      return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0">{label}</Badge>;
    }
    return null;
  };

  const getCompanyName = (companyId: number) => {
    const company = companies.find(c => c.id === companyId);
    return company ? (company.client_name || company.name) : 'غير معروف';
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

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
              الفواتير
            </h1>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600">
                  <Plus className="w-5 h-5 ml-2" />
                  فاتورة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>إنشاء فاتورة جديدة</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label>شركتك (المصدر) *</Label>
                      <Select 
                        value={newInvoice.issuer_company_id} 
                        onValueChange={handleIssuerCompanyChange}
                      >
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue placeholder="اختر شركتك" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id.toString()}>
                              {company.client_name || company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2">
                      <Label>الشركة العميل (المستلم)</Label>
                      <Select 
                        value={newInvoice.client_company_id} 
                        onValueChange={handleClientCompanyChange}
                      >
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue placeholder="اختر الشركة العميل (اختياري)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">بدون شركة</SelectItem>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id.toString()}>
                              {company.client_name || company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>نوع الفاتورة *</Label>
                      <Select 
                        value={newInvoice.invoice_category} 
                        onValueChange={(value) => {
                          const vatRate = value === 'trip' ? '6' : '21';
                          setNewInvoice({...newInvoice, invoice_category: value, vat_rate: vatRate});
                        }}
                      >
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="trip">فاتورة رحلة (6%)</SelectItem>
                          <SelectItem value="company">فاتورة شركة (21%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>رقم الفاتورة *</Label>
                      <Input
                        value={newInvoice.invoice_number}
                        onChange={(e) => setNewInvoice({...newInvoice, invoice_number: e.target.value})}
                        placeholder="يتم التوليد تلقائياً"
                        className="rounded-2xl"
                        readOnly
                      />
                    </div>

                    <div>
                      <Label>تاريخ الفاتورة</Label>
                      <Input
                        type="date"
                        value={newInvoice.invoice_date}
                        onChange={(e) => setNewInvoice({...newInvoice, invoice_date: e.target.value})}
                        className="rounded-2xl"
                      />
                    </div>

                    <div>
                      <Label>اسم العميل *</Label>
                      <Input
                        value={newInvoice.client_name}
                        onChange={(e) => setNewInvoice({...newInvoice, client_name: e.target.value})}
                        placeholder="اسم العميل"
                        className="rounded-2xl"
                      />
                    </div>

                    <div>
                      <Label>رقم VAT العميل</Label>
                      <Input
                        value={newInvoice.client_vat}
                        onChange={(e) => setNewInvoice({...newInvoice, client_vat: e.target.value})}
                        placeholder="BE0123456789"
                        className="rounded-2xl"
                      />
                    </div>

                    <div>
                      <Label>البريد الإلكتروني</Label>
                      <Input
                        type="email"
                        value={newInvoice.client_email}
                        onChange={(e) => setNewInvoice({...newInvoice, client_email: e.target.value})}
                        placeholder="email@example.com"
                        className="rounded-2xl"
                      />
                    </div>

                    <div>
                      <Label>رقم الهاتف</Label>
                      <Input
                        value={newInvoice.client_phone}
                        onChange={(e) => setNewInvoice({...newInvoice, client_phone: e.target.value})}
                        placeholder="+32 XXX XX XX XX"
                        className="rounded-2xl"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label>عنوان العميل</Label>
                      <Input
                        value={newInvoice.client_address}
                        onChange={(e) => setNewInvoice({...newInvoice, client_address: e.target.value})}
                        placeholder="العنوان الكامل"
                        className="rounded-2xl"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label>وصف الخدمة</Label>
                      <Textarea
                        value={newInvoice.description}
                        onChange={(e) => setNewInvoice({...newInvoice, description: e.target.value})}
                        placeholder="وصف الخدمة أو المنتج"
                        className="rounded-2xl"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>المبلغ الإجمالي (شامل VAT) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newInvoice.total_tvac}
                        onChange={(e) => setNewInvoice({...newInvoice, total_tvac: e.target.value})}
                        placeholder="0.00"
                        className="rounded-2xl"
                      />
                    </div>

                    <div>
                      <Label>نسبة VAT (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newInvoice.vat_rate}
                        onChange={(e) => setNewInvoice({...newInvoice, vat_rate: e.target.value})}
                        className="rounded-2xl"
                        readOnly
                      />
                    </div>

                    <div>
                      <Label>نوع الفاتورة</Label>
                      <Select 
                        value={newInvoice.invoice_type} 
                        onValueChange={(value) => setNewInvoice({...newInvoice, invoice_type: value})}
                      >
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="one_time">مرة واحدة</SelectItem>
                          <SelectItem value="subscription">اشتراك</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {newInvoice.invoice_type === 'subscription' && (
                      <div>
                        <Label>فترة التكرار *</Label>
                        <Select 
                          value={newInvoice.recurrence_period} 
                          onValueChange={(value) => setNewInvoice({...newInvoice, recurrence_period: value})}
                        >
                          <SelectTrigger className="rounded-2xl">
                            <SelectValue placeholder="اختر الفترة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">شهري</SelectItem>
                            <SelectItem value="quarterly">ربع سنوي</SelectItem>
                            <SelectItem value="yearly">سنوي</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <Label>الحالة</Label>
                      <Select 
                        value={newInvoice.status} 
                        onValueChange={(value) => setNewInvoice({...newInvoice, status: value})}
                      >
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">مسودة</SelectItem>
                          <SelectItem value="sent">مرسلة</SelectItem>
                          <SelectItem value="paid">مدفوعة</SelectItem>
                          <SelectItem value="cancelled">ملغاة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>حالة الدفع</Label>
                      <Select 
                        value={newInvoice.payment_status} 
                        onValueChange={(value) => setNewInvoice({...newInvoice, payment_status: value})}
                      >
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">قيد الانتظار</SelectItem>
                          <SelectItem value="paid">مدفوع</SelectItem>
                          <SelectItem value="overdue">متأخر</SelectItem>
                          <SelectItem value="cancelled">ملغي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleCreateInvoice}
                      disabled={creating}
                      className="flex-1 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600"
                    >
                      {creating ? (
                        <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      ) : (
                        <Plus className="w-5 h-5 ml-2" />
                      )}
                      إنشاء الفاتورة
                    </Button>
                    <Button
                      onClick={() => setShowCreateDialog(false)}
                      variant="outline"
                      className="rounded-2xl"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="p-6 rounded-3xl border-0 shadow-xl mb-8 bg-white dark:bg-slate-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>تصفية حسب الشركة</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="جميع الشركات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع الشركات</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.client_name || company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>البحث</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث برقم الفاتورة أو اسم العميل..."
                  className="pr-12 rounded-2xl"
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {filteredInvoices.length === 0 ? (
            <Card className="p-12 rounded-3xl border-0 shadow-xl bg-white dark:bg-slate-900">
              <div className="text-center">
                <FileText className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  لا توجد فواتير
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  ابدأ بإنشاء فاتورة جديدة
                </p>
              </div>
            </Card>
          ) : (
            filteredInvoices.map((invoice) => (
              <Card 
                key={invoice.id}
                className="p-6 rounded-3xl border-0 shadow-xl bg-white dark:bg-slate-900"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {invoice.invoice_number}
                        </span>
                        {getStatusBadge(invoice.status)}
                        {getPaymentStatusBadge(invoice.payment_status)}
                        {getCategoryBadge(invoice.invoice_category, invoice.vat_rate)}
                        {getInvoiceTypeBadge(invoice.invoice_type, invoice.recurrence_period)}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {invoice.client_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      €{invoice.total_tvac.toFixed(2)}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      شامل VAT {invoice.vat_rate}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      المصدر
                    </p>
                    <p className="font-medium">{getCompanyName(invoice.issuer_company_id)}</p>
                  </div>
                  {invoice.client_company_id && (
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        العميل
                      </p>
                      <p className="font-medium">{getCompanyName(invoice.client_company_id)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 mb-1">التاريخ</p>
                    <p className="font-medium">{new Date(invoice.invoice_date).toLocaleDateString('ar-SA')}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 mb-1">المبلغ بدون VAT</p>
                    <p className="font-medium">€{invoice.total_htva.toFixed(2)}</p>
                  </div>
                  {invoice.payment_reference && (
                    <div className="col-span-2">
                      <p className="text-slate-600 dark:text-slate-400 mb-1">رقم المرجع</p>
                      <p className="font-medium font-mono text-xs">{invoice.payment_reference}</p>
                    </div>
                  )}
                  {invoice.client_email && (
                    <div className="col-span-2">
                      <p className="text-slate-600 dark:text-slate-400 mb-1">البريد الإلكتروني</p>
                      <p className="font-medium">{invoice.client_email}</p>
                    </div>
                  )}
                  {invoice.next_invoice_date && (
                    <div className="col-span-2">
                      <p className="text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        الفاتورة التالية
                      </p>
                      <p className="font-medium">{new Date(invoice.next_invoice_date).toLocaleDateString('ar-SA')}</p>
                    </div>
                  )}
                  {invoice.sent_at && (
                    <div className="col-span-2">
                      <p className="text-slate-600 dark:text-slate-400 mb-1">تاريخ الإرسال</p>
                      <p className="font-medium">{new Date(invoice.sent_at).toLocaleString('ar-SA')}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => handleEditInvoice(invoice)}
                    variant="outline"
                    className="flex-1 rounded-2xl"
                  >
                    <Edit className="w-4 h-4 ml-2" />
                    تعديل
                  </Button>
                  <Button
                    onClick={() => handleDownloadPDF(invoice)}
                    disabled={downloadingId === invoice.id}
                    variant="outline"
                    className="flex-1 rounded-2xl"
                  >
                    {downloadingId === invoice.id ? (
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 ml-2" />
                    )}
                    تحميل PDF
                  </Button>
                  {invoice.client_email && (
                    <Button
                      onClick={() => handleSendInvoice(invoice)}
                      disabled={sendingId === invoice.id}
                      variant="outline"
                      className="flex-1 rounded-2xl"
                    >
                      {sendingId === invoice.id ? (
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 ml-2" />
                      )}
                      إرسال
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDeleteInvoice(invoice.id)}
                    variant="destructive"
                    className="rounded-2xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل الفاتورة</DialogTitle>
          </DialogHeader>
          {editingInvoice && (
            <div className="space-y-4 py-4">
              <div>
                <Label>المبلغ الإجمالي (شامل VAT)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.total_tvac}
                  onChange={(e) => setEditForm({...editForm, total_tvac: e.target.value})}
                  className="rounded-2xl"
                />
              </div>

              <div>
                <Label>حالة الفاتورة</Label>
                <Select 
                  value={editForm.status} 
                  onValueChange={(value) => setEditForm({...editForm, status: value})}
                >
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">مسودة</SelectItem>
                    <SelectItem value="sent">مرسلة</SelectItem>
                    <SelectItem value="paid">مدفوعة</SelectItem>
                    <SelectItem value="cancelled">ملغاة</SelectItem>
                    <SelectItem value="overdue">متأخرة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>حالة الدفع</Label>
                <Select 
                  value={editForm.payment_status} 
                  onValueChange={(value) => setEditForm({...editForm, payment_status: value})}
                >
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="paid">مدفوع</SelectItem>
                    <SelectItem value="overdue">متأخر</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                    <SelectItem value="refunded">مسترد</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>البريد الإلكتروني</Label>
                <Input
                  type="email"
                  value={editForm.client_email}
                  onChange={(e) => setEditForm({...editForm, client_email: e.target.value})}
                  className="rounded-2xl"
                />
              </div>

              <div>
                <Label>سبب التعديل *</Label>
                <Textarea
                  value={editForm.edit_reason}
                  onChange={(e) => setEditForm({...editForm, edit_reason: e.target.value})}
                  placeholder="أدخل سبب التعديل..."
                  className="rounded-2xl"
                  rows={3}
                />
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
    </div>
  );
}
