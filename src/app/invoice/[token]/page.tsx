
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Building2, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Download,
  Loader2,
  Eye,
  QrCode,
  Car
} from 'lucide-react';
import { toast } from 'sonner';

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
  items: any[];
  invoice_category: string;
  payment_reference: string;
  structured_reference: string;
  // Trip-specific fields
  vehicle_plate_number?: string;
  dienstnummer?: string;
  identificatiecode?: string;
  toegepast_tarief?: string;
  meterbedrag?: number;
  ritnummer?: string;
}

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

interface ShareLink {
  qr_code_url: string;
  view_count: number;
}

function TripInfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
      <span className="text-slate-500 dark:text-slate-400 text-sm">{label}</span>
      <span className="font-medium text-sm text-slate-800 dark:text-slate-200">{value}</span>
    </div>
  );
}

export default function InvoiceViewPage() {
  const params = useParams();
  const token = params.token as string;
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [issuerCompany, setIssuerCompany] = useState<Company | null>(null);
  const [clientCompany, setClientCompany] = useState<Company | null>(null);
  const [shareLink, setShareLink] = useState<ShareLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [token]);

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/next_api/invoices/view?token=${token}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errorMessage || 'فشل تحميل الفاتورة');
      }

      const data = await response.json();
      
      if (data.success) {
        setInvoice(data.data.invoice);
        setIssuerCompany(data.data.issuer_company);
        setClientCompany(data.data.client_company);
        setShareLink(data.data.share_link);
      } else {
        throw new Error(data.errorMessage || 'فشل تحميل الفاتورة');
      }
    } catch (error: any) {
      console.error("Operation failed");
      toast.error(error.message || 'فشل تحميل الفاتورة');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!invoice) return;
    
    setDownloading(true);
    try {
      const response = await fetch(`/next_api/invoices/generate-company-invoice?id=${invoice.id}`, {
        method: 'POST',
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
      toast.error('فشل تحميل الفاتورة');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!invoice || !issuerCompany) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Card className="p-12 rounded-3xl border-0 shadow-xl max-w-md text-center">
          <FileText className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            الفاتورة غير موجودة
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            الرابط غير صحيح أو منتهي الصلاحية
          </p>
        </Card>
      </div>
    );
  }

  const vatAmount = invoice.total_tvac - invoice.total_htva;
  const isTripInvoice = invoice.invoice_category === 'trip';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <Card className="p-6 rounded-3xl border-0 shadow-xl mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Factuur</h1>
                <p className="text-sm opacity-90">{invoice.invoice_number}</p>
              </div>
            </div>
            {shareLink && (
              <div className="flex items-center gap-2 text-sm">
                <Eye className="w-4 h-4" />
                <span>{shareLink.view_count} weergaven</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(invoice.invoice_date).toLocaleDateString('nl-BE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </Card>

        {/* Company Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="p-6 rounded-3xl border-0 shadow-xl">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Van
            </h3>
            <div className="space-y-2 text-sm">
              <p className="font-bold text-lg">{issuerCompany.client_name || issuerCompany.name}</p>
              {issuerCompany.address && (
                <p className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {issuerCompany.address}
                </p>
              )}
              {issuerCompany.vat_number && (
                <p className="text-slate-600 dark:text-slate-400">
                  BTW: {issuerCompany.vat_number}
                </p>
              )}
              {issuerCompany.kbo_number && (
                <p className="text-slate-600 dark:text-slate-400">
                  KBO: {issuerCompany.kbo_number}
                </p>
              )}
              {issuerCompany.email && (
                <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Mail className="w-4 h-4" />
                  {issuerCompany.email}
                </p>
              )}
              {issuerCompany.phone && (
                <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Phone className="w-4 h-4" />
                  {issuerCompany.phone}
                </p>
              )}
            </div>
          </Card>

          <Card className="p-6 rounded-3xl border-0 shadow-xl">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Aan
            </h3>
            <div className="space-y-2 text-sm">
              <p className="font-bold text-lg">{invoice.client_name}</p>
              {invoice.client_address && (
                <p className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {invoice.client_address}
                </p>
              )}
              {invoice.client_vat && (
                <p className="text-slate-600 dark:text-slate-400">
                  BTW: {invoice.client_vat}
                </p>
              )}
              {invoice.client_email && (
                <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Mail className="w-4 h-4" />
                  {invoice.client_email}
                </p>
              )}
              {invoice.client_phone && (
                <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Phone className="w-4 h-4" />
                  {invoice.client_phone}
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Trip Details Section - shown only for trip invoices */}
        {isTripInvoice && (
          invoice.vehicle_plate_number ||
          invoice.dienstnummer ||
          invoice.identificatiecode ||
          invoice.toegepast_tarief ||
          invoice.meterbedrag !== null ||
          invoice.ritnummer
        ) && (
          <Card className="p-6 rounded-3xl border-0 shadow-xl mb-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-600" />
              Ritgegevens
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              <TripInfoRow label="Nummerplaat" value={invoice.vehicle_plate_number} />
              <TripInfoRow label="Ritnummer" value={invoice.ritnummer} />
              <TripInfoRow label="Dienstnummer" value={invoice.dienstnummer} />
              <TripInfoRow label="Identificatiecode" value={invoice.identificatiecode} />
              <TripInfoRow label="Toegepast tarief" value={invoice.toegepast_tarief} />
              <TripInfoRow
                label="Meterbedrag"
                value={invoice.meterbedrag !== null && invoice.meterbedrag !== undefined
                  ? `€${Number(invoice.meterbedrag).toFixed(2)}`
                  : null}
              />
            </div>
          </Card>
        )}

        {/* Items */}
        {invoice.items && invoice.items.length > 0 && (
          <Card className="p-6 rounded-3xl border-0 shadow-xl mb-6">
            <h3 className="font-bold mb-4">Artikelen</h3>
            <div className="space-y-3">
              {invoice.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-start p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <div className="flex-1">
                    <p className="font-medium">{item.description}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {item.quantity} × €{item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-bold">€{item.total.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Totals */}
        <Card className="p-6 rounded-3xl border-0 shadow-xl mb-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Subtotaal (excl. BTW)</span>
              <span className="font-medium">€{invoice.total_htva.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">BTW ({invoice.vat_rate}%)</span>
              <span className="font-medium">€{vatAmount.toFixed(2)}</span>
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Totaal te betalen</span>
                <span className="text-2xl font-bold text-blue-600">€{invoice.total_tvac.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Payment Info */}
        <Card className="p-6 rounded-3xl border-0 shadow-xl mb-6">
          <h3 className="font-bold mb-4">Betalingsinformatie</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">IBAN:</span>
              <span className="font-mono font-medium">{issuerCompany.bank_account_iban || 'BE16973450355674'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">BIC:</span>
              <span className="font-mono font-medium">{issuerCompany.bank_account_bic || 'ARSPBE22'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Rekeninghouder:</span>
              <span className="font-medium">{issuerCompany.bank_account_holder || issuerCompany.client_name || issuerCompany.name}</span>
            </div>
            {(invoice.payment_reference || invoice.structured_reference) && (
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Betalingsreferentie:</span>
                <span className="font-mono font-medium">{invoice.payment_reference || invoice.structured_reference}</span>
              </div>
            )}
          </div>
        </Card>

        {/* QR Code */}
        {shareLink?.qr_code_url && (
          <Card className="p-6 rounded-3xl border-0 shadow-xl mb-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              QR Code voor deze factuur
            </h3>
            <div className="flex justify-center">
              <img 
                src={shareLink.qr_code_url} 
                alt="QR Code" 
                className="w-48 h-48 rounded-2xl border-4 border-slate-200 dark:border-slate-700"
              />
            </div>
            <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-4">
              Scan deze QR code om de factuur te bekijken
            </p>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={downloadPDF}
            disabled={downloading}
            className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600"
          >
            {downloading ? (
              <Loader2 className="w-5 h-5 animate-spin ml-2" />
            ) : (
              <Download className="w-5 h-5 ml-2" />
            )}
            Download PDF
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          <p>Deze factuur is automatisch gegenereerd en geldig zonder handtekening</p>
        </div>
      </div>
    </div>
  );
}
