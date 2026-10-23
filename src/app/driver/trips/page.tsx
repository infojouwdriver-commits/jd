
'use client';

import DocumentQr from '@/components/driver/DocumentQr';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import {
  MapPin, Clock, Navigation, Calendar, CheckCircle2, XCircle, AlertCircle,
  FileText, Loader2, User, ExternalLink, TrendingUp, Download, Filter,
  BarChart3, PieChart, DollarSign
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import type { AppLanguage } from '@/contexts/LanguageContext';

interface Trip {
  id: number; start_time: string; end_time: string; start_address: string; end_address: string;
  distance_km: number | null; duration_minutes: number | null; price: number | null; status: string;
  ritnummer: string | null; chiron_sync_attempts: number; passenger_name: string | null;
  chiron_environment: string | null; payment_method: string | null;
  start_lat: number | null; start_lon: number | null; end_lat: number | null; end_lon: number | null;
  ride_type: string; external_source: string | null;
}

interface Summary {
  period: string; start_date: string; end_date: string; total_trips: number; total_revenue: number;
  total_distance: number; total_duration: number; average_trip_value: number; average_distance: number;
  platform_stats: { INTERNAL: { count: number; revenue: number }; BOLT: { count: number; revenue: number }; UBER: { count: number; revenue: number }; HEETCH: { count: number; revenue: number } };
  payment_method_stats: Record<string, { count: number; revenue: number }>;
  daily_stats: Record<string, { trips: number; revenue: number }>;
  trips: Trip[];
}

interface TranslationKeys {
  allTrips: string; completed: string; pending: string; failed: string;
  noTrips: string; trip: string; passenger: string; paymentMethod: string;
  cash: string; card: string; bancontact: string; bankTransfer: string; app: string;
  startPoint: string; endPoint: string; distance: string; duration: string; minutes: string;
  chironId: string; syncFailed: string; attempts: string;
  generateInvoice: string; openInMaps: string; openInWaze: string;
  dailyEarnings: string; today: string;
  invoiceGenerating: string; invoiceSuccess: string; invoiceError: string;
  summary: string; period: string; daily: string; weekly: string; monthly: string;
  quarterly: string; yearly: string; custom: string; platform: string; all: string; taxi: string;
  totalTrips: string; totalRevenue: string; totalDistance: string; averageTripValue: string;
  platformBreakdown: string; paymentMethodBreakdown: string;
  downloadPDF: string; downloading: string; startDate: string; endDate: string;
  applyFilter: string; showSummary: string; hideSummary: string; trips: string; revenue: string;
}

const translations: Record<AppLanguage, TranslationKeys> = {
  nl: {
    allTrips: 'Alle ritten', completed: 'Voltooid', pending: 'In behandeling', failed: 'Mislukt',
    noTrips: 'Geen ritten', trip: 'Rit', passenger: 'Passagier', paymentMethod: 'Betaalmethode',
    cash: 'Contant', card: 'Kaart', bancontact: 'Bancontact', bankTransfer: 'Bankoverschrijving', app: 'App',
    startPoint: 'Startpunt', endPoint: 'Eindpunt', distance: 'Afstand', duration: 'Duur', minutes: 'minuten',
    chironId: 'Chiron ID', syncFailed: 'Synchronisatie mislukt na', attempts: 'pogingen',
    generateInvoice: 'Factuur genereren', openInMaps: 'Maps', openInWaze: 'Waze',
    dailyEarnings: 'Dagelijkse inkomsten', today: 'Vandaag',
    invoiceGenerating: 'Factuur wordt gegenereerd...', invoiceSuccess: 'Factuur succesvol gegenereerd', invoiceError: 'Fout bij genereren factuur',
    summary: 'Samenvatting', period: 'Periode', daily: 'Dagelijks', weekly: 'Wekelijks', monthly: 'Maandelijks',
    quarterly: 'Driemaandelijks', yearly: 'Jaarlijks', custom: 'Aangepast', platform: 'Platform', all: 'Alle', taxi: 'Taxi',
    totalTrips: 'Totaal ritten', totalRevenue: 'Totale inkomsten', totalDistance: 'Totale afstand', averageTripValue: 'Gemiddelde ritwaarde',
    platformBreakdown: 'Platform verdeling', paymentMethodBreakdown: 'Betaalmethode verdeling',
    downloadPDF: 'Download PDF rapport', downloading: 'Downloaden...', startDate: 'Startdatum', endDate: 'Einddatum',
    applyFilter: 'Filter toepassen', showSummary: 'Toon samenvatting', hideSummary: 'Verberg samenvatting', trips: 'ritten', revenue: 'inkomsten'
  },
  fr: {
    allTrips: 'Tous les trajets', completed: 'Terminé', pending: 'En attente', failed: 'Échoué',
    noTrips: 'Aucun trajet', trip: 'Trajet', passenger: 'Passager', paymentMethod: 'Mode de paiement',
    cash: 'Espèces', card: 'Carte', bancontact: 'Bancontact', bankTransfer: 'Virement bancaire', app: 'Application',
    startPoint: 'Point de départ', endPoint: "Point d'arrivée", distance: 'Distance', duration: 'Durée', minutes: 'minutes',
    chironId: 'ID Chiron', syncFailed: 'Échec de synchronisation après', attempts: 'tentatives',
    generateInvoice: 'Générer une facture', openInMaps: 'Maps', openInWaze: 'Waze',
    dailyEarnings: 'Revenus quotidiens', today: "Aujourd'hui",
    invoiceGenerating: 'Génération de la facture...', invoiceSuccess: 'Facture générée avec succès', invoiceError: 'Erreur lors de la génération de la facture',
    summary: 'Résumé', period: 'Période', daily: 'Quotidien', weekly: 'Hebdomadaire', monthly: 'Mensuel',
    quarterly: 'Trimestriel', yearly: 'Annuel', custom: 'Personnalisé', platform: 'Plateforme', all: 'Toutes', taxi: 'Taxi',
    totalTrips: 'Total trajets', totalRevenue: 'Revenus totaux', totalDistance: 'Distance totale', averageTripValue: 'Valeur moyenne du trajet',
    platformBreakdown: 'Répartition par plateforme', paymentMethodBreakdown: 'Répartition par mode de paiement',
    downloadPDF: 'Télécharger le rapport PDF', downloading: 'Téléchargement...', startDate: 'Date de début', endDate: 'Date de fin',
    applyFilter: 'Appliquer le filtre', showSummary: 'Afficher le résumé', hideSummary: 'Masquer le résumé', trips: 'trajets', revenue: 'revenus'
  },
  ar: {
    allTrips: 'جميع الرحلات', completed: 'مكتملة', pending: 'قيد الانتظار', failed: 'فاشلة',
    noTrips: 'لا توجد رحلات', trip: 'رحلة', passenger: 'الراكب', paymentMethod: 'طريقة الدفع',
    cash: 'نقداً', card: 'بطاقة', bancontact: 'Bancontact', bankTransfer: 'تحويل بنكي', app: 'تطبيق',
    startPoint: 'نقطة الانطلاق', endPoint: 'نقطة الوصول', distance: 'المسافة', duration: 'المدة', minutes: 'دقائق',
    chironId: 'معرف Chiron', syncFailed: 'فشل المزامنة بعد', attempts: 'محاولات',
    generateInvoice: 'إنشاء فاتورة', openInMaps: 'خرائط', openInWaze: 'Waze',
    dailyEarnings: 'أرباح اليوم', today: 'اليوم',
    invoiceGenerating: 'جارٍ إنشاء الفاتورة...', invoiceSuccess: 'تم إنشاء الفاتورة بنجاح', invoiceError: 'خطأ في إنشاء الفاتورة',
    summary: 'ملخص', period: 'الفترة', daily: 'يومي', weekly: 'أسبوعي', monthly: 'شهري',
    quarterly: 'ربع سنوي', yearly: 'سنوي', custom: 'مخصص', platform: 'المنصة', all: 'الكل', taxi: 'تاكسي',
    totalTrips: 'إجمالي الرحلات', totalRevenue: 'إجمالي الإيرادات', totalDistance: 'إجمالي المسافة', averageTripValue: 'متوسط قيمة الرحلة',
    platformBreakdown: 'توزيع المنصات', paymentMethodBreakdown: 'توزيع طرق الدفع',
    downloadPDF: 'تحميل تقرير PDF', downloading: 'جارٍ التحميل...', startDate: 'تاريخ البداية', endDate: 'تاريخ النهاية',
    applyFilter: 'تطبيق الفلتر', showSummary: 'عرض الملخص', hideSummary: 'إخفاء الملخص', trips: 'رحلات', revenue: 'إيرادات'
  }
};

const platformLogos: Record<string, string> = {
  BOLT: 'https://cdn.chat2db-ai.com/app/avatar/custom/5f60f0fd-af42-4c41-a03c-bdadd3c76192_737955.png',
  HEETCH: 'https://cdn.chat2db-ai.com/app/avatar/custom/7e5a93dc-6d4e-44a9-b77a-790bb10c795c_737955.png',
  UBER: 'https://cdn.chat2db-ai.com/app/avatar/custom/929e3ada-5005-48d4-94cd-a3b6aa38da4e_737955.png',
};

const glassCard = {
  background: 'var(--dp-card)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(52,211,153,0.15)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
};

const labelStyle = {
  color: 'rgba(52,211,153,0.85)',
  fontSize: '0.7rem',
  fontWeight: '700',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
};

export default function DriverTripsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [generatingInvoice, setGeneratingInvoice] = useState<number | null>(null);
  const [dailyEarnings, setDailyEarnings] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [summaryPeriod, setSummaryPeriod] = useState('monthly');
  const [summaryPlatform, setSummaryPlatform] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [receiptDocument,setReceiptDocument]=useState<{url:string;reference:string}|null>(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  useEffect(() => { if (!isLoading && !user) router.push('/driver-login'); }, [user, isLoading, router]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const data = await api.get<Trip[]>('/trips');
      setTrips(data);
      const today = new Date().toDateString();
      const todayTrips = data.filter(trip =>
        new Date(trip.start_time).toDateString() === today &&
        (trip.status === 'completed' || trip.status === 'success')
      );
      setDailyEarnings(todayTrips.reduce((sum, trip) => sum + (trip.price || 0), 0));
    } catch (error: any) { toast.error(error.message || 'Failed to load trips'); }
    finally { setLoading(false); }
  };

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { period: summaryPeriod, platform: summaryPlatform };
      if (summaryPeriod === 'custom' && customStartDate && customEndDate) {
        params.start_date = customStartDate;
        params.end_date = customEndDate;
      }
      const data = await api.get<Summary>(`/trips/summary?${new URLSearchParams(params).toString()}`);
      setSummary(data);
      setShowSummary(true);
    } catch (error: any) { toast.error(error.message || 'Failed to load summary'); }
    finally { setLoading(false); }
  };

  const downloadPDFReport = async () => {
    setDownloadingPDF(true);
    try {
      const params: Record<string, string> = { period: summaryPeriod, platform: summaryPlatform, language };
      if (summaryPeriod === 'custom' && customStartDate && customEndDate) {
        params.start_date = customStartDate;
        params.end_date = customEndDate;
      }
      const response = await fetch(
        `/next_api/trips/export-pdf?${new URLSearchParams(params).toString()}`,
        { method: 'GET', credentials: 'include' }
      );
      if (!response.ok) throw new Error('Failed to download report');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ritten-samenvatting-${summaryPeriod}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      const successMsg = language === 'nl' ? 'Rapport gedownload' : language === 'ar' ? 'تم تحميل التقرير' : 'Rapport téléchargé';
      toast.success(successMsg);
    } catch (error: any) { toast.error(error.message || 'Failed to download report'); }
    finally { setDownloadingPDF(false); }
  };

  useEffect(() => { if (user) fetchTrips(); }, [user]);

  async function shareDocument() {
    if(!receiptDocument)return;
    try {
      if(navigator.share)await navigator.share({title:receiptDocument.reference,url:receiptDocument.url});
      else {await navigator.clipboard.writeText(receiptDocument.url);toast.success(language==='ar'?'تم نسخ الرابط':language==='nl'?'Link gekopieerd':'Lien copié');}
    } catch(error) {if(!(error instanceof DOMException&&error.name==='AbortError'))toast.error(t.invoiceError);}
  }
  const generateInvoice = async (tripId: number) => {
    setGeneratingInvoice(tripId);
    toast.loading(t.invoiceGenerating, { id: 'invoice-generation' });
    try {
      const documentResponse=await fetch(`/next_api/trips/generate-invoice?id=${tripId}&format=link`,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:'{}'});
      if(documentResponse.ok){
        const result=await documentResponse.json();
        if(!result.success||!/^https:\/\/app\.jouww\.com\/documents\/receipts\/[1-9][0-9]{0,15}\.[A-Za-z0-9_-]{43}$/.test(result.data?.url))throw new Error(t.invoiceError);
        setReceiptDocument(result.data);toast.success(t.invoiceSuccess,{id:'invoice-generation'});return;
      }
      if(documentResponse.status!==409)throw new Error(t.invoiceError);
      const response = await fetch(
        `/next_api/trips/generate-invoice?id=${tripId}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include' }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.errorMessage || t.invoiceError);
      }
      const blob = await response.blob();
      if (blob.size === 0) throw new Error('Empty PDF file');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Factuur-Rit-${tripId}.pdf`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { window.URL.revokeObjectURL(url); document.body.removeChild(a); }, 100);
      toast.success(t.invoiceSuccess, { id: 'invoice-generation' });
    } catch (error: any) { toast.error(error.message || t.invoiceError, { id: 'invoice-generation' }); }
    finally { setGeneratingInvoice(null); }
  };

  const openInGoogleMaps = (trip: Trip) => {
    if (!trip.start_lat || !trip.start_lon || !trip.end_lat || !trip.end_lon) {
      toast.error('Location info not available');
      return;
    }
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${trip.start_lat},${trip.start_lon}&destination=${trip.end_lat},${trip.end_lon}&travelmode=driving`,
      '_blank'
    );
  };

  const openInWaze = (trip: Trip) => {
    if (!trip.end_lat || !trip.end_lon) { toast.error('Location info not available'); return; }
    window.open(`https://waze.com/ul?ll=${trip.end_lat},${trip.end_lon}&navigate=yes`, '_blank');
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { icon: React.ElementType; label: string; style: React.CSSProperties }> = {
      completed: { icon: CheckCircle2, label: t.completed, style: { background: 'rgba(34,197,94,0.18)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.35)' } },
      success: { icon: CheckCircle2, label: t.completed, style: { background: 'rgba(34,197,94,0.18)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.35)' } },
      pending: { icon: AlertCircle, label: t.pending, style: { background: 'rgba(234,179,8,0.18)', color: '#facc15', border: '1px solid rgba(234,179,8,0.35)' } },
      failed: { icon: XCircle, label: t.failed, style: { background: 'rgba(239,68,68,0.18)', color: '#f87171', border: '1px solid rgba(239,68,68,0.35)' } },
    };
    const config = configs[status] || {
      icon: AlertCircle,
      label: status,
      style: { background: 'rgba(52,211,153,0.12)', color: 'rgba(52,211,153,0.9)', border: '1px solid rgba(52,211,153,0.25)' }
    };
    const Icon = config.icon;
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={config.style}>
        <Icon className="w-3 h-3" />{config.label}
      </span>
    );
  };

  const getPaymentMethodLabel = (method: string | null) => {
    if (!method) return null;
    const labels: Record<string, string> = {
      cash: t.cash, card: t.card, bancontact: t.bancontact, bank_transfer: t.bankTransfer, app: t.app
    };
    return labels[method] || method;
  };

  const filteredTrips = trips.filter(trip => {
    if (filter === 'all') return true;
    if (filter === 'completed') return trip.status === 'completed' || trip.status === 'success';
    return trip.status === filter;
  });

  const dateLocale = language === 'nl' ? 'nl-BE' : language === 'ar' ? 'ar-SA' : 'fr-BE';

  if (isLoading || loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--dp-accent)' }} />
    </div>
  );

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-6">

      {/* Daily Earnings */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="rounded-3xl p-6 mb-6 overflow-hidden relative" style={{ ...glassCard, border: '1px solid rgba(52,211,153,0.25)' }}>
          <motion.div
            className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl"
            style={{ background: 'rgba(52,211,153,0.1)', marginRight: '-5rem', marginTop: '-5rem' }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5" style={{ color: 'var(--dp-accent)' }} />
              <span className="text-sm font-medium" style={{ color: 'rgba(52,211,153,0.85)' }}>{t.dailyEarnings}</span>
            </div>
            <motion.div
              initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="text-5xl font-black mb-1 tracking-tight"
              style={{ background: 'var(--dp-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              €{dailyEarnings.toFixed(2)}
            </motion.div>
            <p className="text-sm" style={{ color: 'rgba(52,211,153,0.75)' }}>{t.today}</p>
          </div>
        </div>
      </motion.div>

      {/* Summary Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <div className="rounded-3xl p-5 mb-5" style={glassCard}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold flex items-center gap-2 text-white">
              <BarChart3 className="w-5 h-5" style={{ color: 'var(--dp-accent)' }} />{t.summary}
            </h3>
            <button
              onClick={() => setShowSummary(!showSummary)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', color: 'rgba(52,211,153,0.9)' }}
            >
              <Filter className="w-3.5 h-3.5" />{showSummary ? t.hideSummary : t.showSummary}
            </button>
          </div>

          <AnimatePresence>
            {showSummary && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block mb-1.5" style={labelStyle}>{t.period}</label>
                    <Select value={summaryPeriod} onValueChange={setSummaryPeriod}>
                      <SelectTrigger className="rounded-2xl border-0 text-sm" style={{ background: 'var(--dp-card-2)', border: '1px solid rgba(52,211,153,0.2)', height: '44px', color: 'var(--dp-text)' }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent style={{ background: 'var(--dp-card)', border: '1px solid rgba(52,211,153,0.25)' }}>
                        <SelectItem value="daily" style={{ color: 'var(--dp-text)' }}>{t.daily}</SelectItem>
                        <SelectItem value="weekly" style={{ color: 'var(--dp-text)' }}>{t.weekly}</SelectItem>
                        <SelectItem value="monthly" style={{ color: 'var(--dp-text)' }}>{t.monthly}</SelectItem>
                        <SelectItem value="quarterly" style={{ color: 'var(--dp-text)' }}>{t.quarterly}</SelectItem>
                        <SelectItem value="yearly" style={{ color: 'var(--dp-text)' }}>{t.yearly}</SelectItem>
                        <SelectItem value="custom" style={{ color: 'var(--dp-text)' }}>{t.custom}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block mb-1.5" style={labelStyle}>{t.platform}</label>
                    <Select value={summaryPlatform} onValueChange={setSummaryPlatform}>
                      <SelectTrigger className="rounded-2xl border-0 text-sm" style={{ background: 'var(--dp-card-2)', border: '1px solid rgba(52,211,153,0.2)', height: '44px', color: 'var(--dp-text)' }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent style={{ background: 'var(--dp-card)', border: '1px solid rgba(52,211,153,0.25)' }}>
                        <SelectItem value="all" style={{ color: 'var(--dp-text)' }}>{t.all}</SelectItem>
                        <SelectItem value="INTERNAL" style={{ color: 'var(--dp-text)' }}>{t.taxi}</SelectItem>
                        <SelectItem value="BOLT" style={{ color: 'var(--dp-text)' }}>Bolt</SelectItem>
                        <SelectItem value="UBER" style={{ color: 'var(--dp-text)' }}>Uber</SelectItem>
                        <SelectItem value="HEETCH" style={{ color: 'var(--dp-text)' }}>Heetch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={fetchSummary} disabled={loading}
                      className="w-full h-11 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ background: 'var(--dp-action)', color: 'var(--dp-action-text)' }}
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
                      {t.applyFilter}
                    </button>
                  </div>
                </div>

                {summaryPeriod === 'custom' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1.5" style={labelStyle}>{t.startDate}</label>
                      <input
                        type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full px-3 rounded-2xl text-sm outline-none"
                        style={{ background: 'var(--dp-card-2)', border: '1px solid rgba(52,211,153,0.2)', height: '44px', color: 'var(--dp-text)', colorScheme: 'dark' }}
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5" style={labelStyle}>{t.endDate}</label>
                      <input
                        type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full px-3 rounded-2xl text-sm outline-none"
                        style={{ background: 'var(--dp-card-2)', border: '1px solid rgba(52,211,153,0.2)', height: '44px', color: 'var(--dp-text)', colorScheme: 'dark' }}
                      />
                    </div>
                  </div>
                )}

                {summary && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: Navigation, label: t.totalTrips, value: summary.total_trips, color: '#60a5fa' },
                        { icon: DollarSign, label: t.totalRevenue, value: `€${summary.total_revenue.toFixed(2)}`, color: '#4ade80' },
                        { icon: MapPin, label: t.totalDistance, value: `${summary.total_distance.toFixed(2)} km`, color: '#c084fc' },
                        { icon: TrendingUp, label: t.averageTripValue, value: `€${summary.average_trip_value.toFixed(2)}`, color: '#fb923c' },
                      ].map((stat, i) => (
                        <div key={i} className="p-4 rounded-2xl" style={{ background: 'var(--dp-card-2)', border: `1px solid ${stat.color}35` }}>
                          <div className="flex items-center gap-2 mb-2">
                            <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                            <span className="text-xs font-medium" style={{ color: `${stat.color}cc` }}>{stat.label}</span>
                          </div>
                          <p className="text-xl font-black text-white">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-4 rounded-2xl" style={{ background: 'var(--dp-card-2)', border: '1px solid rgba(52,211,153,0.15)' }}>
                        <h4 className="font-bold mb-3 flex items-center gap-2 text-white text-sm">
                          <PieChart className="w-4 h-4" style={{ color: 'var(--dp-accent)' }} />{t.platformBreakdown}
                        </h4>
                        <div className="space-y-2">
                          {Object.entries(summary.platform_stats).map(([platform, stats]) => stats.count > 0 && (
                            <div key={platform} className="flex justify-between items-center p-2 rounded-xl hover:bg-yellow-500/5 transition-colors">
                              <div className="flex items-center gap-2">
                                {platform !== 'INTERNAL' && platformLogos[platform] && (
                                  <img src={platformLogos[platform]} alt={platform} className="w-6 h-6 object-contain" />
                                )}
                                <span className="font-medium text-sm text-white">{platform === 'INTERNAL' ? t.taxi : platform}</span>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-sm" style={{ color: 'var(--dp-accent)' }}>€{stats.revenue.toFixed(2)}</p>
                                <p className="text-xs" style={{ color: 'rgba(52,211,153,0.7)' }}>{stats.count} {t.trips}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl" style={{ background: 'var(--dp-card-2)', border: '1px solid rgba(52,211,153,0.15)' }}>
                        <h4 className="font-bold mb-3 flex items-center gap-2 text-white text-sm">
                          <PieChart className="w-4 h-4" style={{ color: 'var(--dp-accent)' }} />{t.paymentMethodBreakdown}
                        </h4>
                        <div className="space-y-2">
                          {Object.entries(summary.payment_method_stats).map(([method, stats]) => (
                            <div key={method} className="flex justify-between items-center p-2 rounded-xl hover:bg-yellow-500/5 transition-colors">
                              <span className="font-medium text-sm text-white">{getPaymentMethodLabel(method)}</span>
                              <div className="text-right">
                                <p className="font-bold text-sm" style={{ color: 'var(--dp-accent)' }}>€{stats.revenue.toFixed(2)}</p>
                                <p className="text-xs" style={{ color: 'rgba(52,211,153,0.7)' }}>{stats.count} {t.trips}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={downloadPDFReport} disabled={downloadingPDF}
                      className="w-full h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)', color: 'var(--dp-text)', boxShadow: '0 4px 16px rgba(239,68,68,0.3)' }}
                    >
                      {downloadingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      {downloadingPDF ? t.downloading : t.downloadPDF}
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {[
          { key: 'all', label: `${t.allTrips} (${trips.length})` },
          { key: 'completed', label: `${t.completed} (${trips.filter(tr => tr.status === 'completed' || tr.status === 'success').length})` },
          { key: 'pending', label: `${t.pending} (${trips.filter(tr => tr.status === 'pending').length})` },
          { key: 'failed', label: `${t.failed} (${trips.filter(tr => tr.status === 'failed').length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as 'all' | 'completed' | 'pending' | 'failed')}
            className="px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all"
            style={filter === tab.key
              ? { background: 'var(--dp-action)', color: 'var(--dp-action-text)', boxShadow: '0 4px 12px rgba(52,211,153,0.3)' }
              : { background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: 'rgba(52,211,153,0.85)' }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Trips List */}
      <div className="space-y-4">
        {filteredTrips.length === 0 ? (
          <div className="p-12 rounded-3xl text-center" style={glassCard}>
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <MapPin className="w-10 h-10" style={{ color: 'rgba(52,211,153,0.6)' }} />
            </div>
            <p style={{ color: 'rgba(52,211,153,0.75)' }}>{t.noTrips}</p>
          </div>
        ) : (
          filteredTrips.map((trip, index) => (
            <motion.div key={trip.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
              <div className="p-5 rounded-3xl" style={glassCard}>
                {/* Trip Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.22), rgba(184,142,4,0.18))', border: '1px solid rgba(52,211,153,0.35)' }}
                    >
                      <MapPin className="w-6 h-6" style={{ color: 'var(--dp-accent)' }} />
                    </motion.div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-white text-sm">{t.trip} #{trip.id}</span>
                        {getStatusBadge(trip.status)}
                        {trip.ride_type === 'INTERNAL' ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(52,211,153,0.18)', color: 'var(--dp-accent)', border: '1px solid rgba(52,211,153,0.35)' }}>{t.taxi}</span>
                        ) : trip.external_source && platformLogos[trip.external_source.toUpperCase()] ? (
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: 'var(--dp-card-2)', border: '1px solid rgba(52,211,153,0.2)' }}>
                            <img src={platformLogos[trip.external_source.toUpperCase()]} alt={trip.external_source} className="w-5 h-5 object-contain" />
                            <span className="text-xs font-medium text-white">{trip.external_source}</span>
                          </div>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(52,211,153,0.75)' }}>
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(trip.start_time).toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-2xl font-black"
                    style={{ background: 'var(--dp-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                  >
                    €{(trip.price ?? 0).toFixed(2)}
                  </motion.div>
                </div>

                {/* Passenger */}
                {trip.passenger_name && (
                  <div className="mb-3 p-3 rounded-2xl flex items-center gap-2" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
                    <User className="w-4 h-4" style={{ color: 'var(--dp-accent)' }} />
                    <span className="text-xs" style={{ color: 'rgba(52,211,153,0.85)' }}>{t.passenger}:</span>
                    <span className="font-bold text-sm text-white">{trip.passenger_name}</span>
                  </div>
                )}

                {/* Addresses */}
                <div className="space-y-2 mb-4">
                  {[
                    { color: '#4ade80', label: t.startPoint, address: trip.start_address, time: trip.start_time },
                    { color: '#f87171', label: t.endPoint, address: trip.end_address, time: trip.end_time },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-2xl" style={{ background: 'var(--dp-card-2)', border: '1px solid rgba(52,211,153,0.1)' }}>
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}22`, border: `1px solid ${item.color}50` }}>
                        <MapPin className="w-3.5 h-3.5" style={{ color: item.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs mb-0.5" style={{ color: 'rgba(52,211,153,0.75)' }}>{item.label}</p>
                        <p className="text-sm font-bold text-white leading-tight truncate">{item.address || '—'}</p>
                        {item.time && (
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(52,211,153,0.6)' }}>
                            {new Date(item.time).toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="p-3 rounded-2xl" style={{ background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.25)' }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Navigation className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-xs text-blue-300 font-medium">{t.distance}</span>
                    </div>
                    <p className="text-base font-bold text-white">{(trip.distance_km ?? 0).toFixed(2)} km</p>
                  </div>
                  <div className="p-3 rounded-2xl" style={{ background: 'rgba(192,132,252,0.12)', border: '1px solid rgba(192,132,252,0.25)' }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-xs text-purple-300 font-medium">{t.duration}</span>
                    </div>
                    <p className="text-base font-bold text-white">{trip.duration_minutes ?? 0} {t.minutes}</p>
                  </div>
                </div>

                {/* Map Buttons */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    onClick={() => openInGoogleMaps(trip)}
                    className="h-10 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:opacity-80"
                    style={{ background: 'rgba(59,130,246,0.18)', border: '1px solid rgba(59,130,246,0.35)', color: '#93c5fd' }}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />{t.openInMaps}
                  </button>
                  <button
                    onClick={() => openInWaze(trip)}
                    className="h-10 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:opacity-80"
                    style={{ background: 'rgba(6,182,212,0.18)', border: '1px solid rgba(6,182,212,0.35)', color: '#67e8f9' }}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />{t.openInWaze}
                  </button>
                </div>

                {/* Chiron ID */}
                {trip.ritnummer && (
                  <div className="mb-3 p-3 rounded-2xl flex items-center justify-between" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
                    <div>
                      <p className="text-xs mb-0.5 text-green-400 font-medium">{t.chironId}</p>
                      <p className="text-sm font-mono text-white">{trip.ritnummer}</p>
                    </div>
                    {trip.chiron_environment && (
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={trip.chiron_environment === 'TEST'
                          ? { background: 'rgba(234,179,8,0.18)', color: '#facc15' }
                          : { background: 'rgba(59,130,246,0.18)', color: '#93c5fd' }
                        }
                      >
                        {trip.chiron_environment}
                      </span>
                    )}
                  </div>
                )}

                {/* Sync Failed */}
                {trip.status === 'failed' && trip.chiron_sync_attempts > 0 && (
                  <div className="mb-3 p-3 rounded-2xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <p className="text-xs text-red-400 font-medium">{t.syncFailed} {trip.chiron_sync_attempts} {t.attempts}</p>
                  </div>
                )}

                {/* Invoice Button */}
                <button
                  onClick={() => generateInvoice(trip.id)}
                  disabled={generatingInvoice === trip.id}
                  className="w-full h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                  style={{ background: 'var(--dp-action)', color: '#ffffff' }}
                >
                  {generatingInvoice === trip.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  {t.generateInvoice}
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
      <Dialog open={!!receiptDocument} onOpenChange={open=>{if(!open)setReceiptDocument(null);}}>
        <DialogContent className="dp-card sm:max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto">
          <DialogHeader><DialogTitle>{receiptDocument?.reference}</DialogTitle><DialogDescription>{language==='ar'?'رابط دائم لهذه الفاتورة. من يملك الرابط يستطيع عرضها.':language==='nl'?'Vaste link naar dit vervoerbewijs. Iedereen met de link kan het bekijken.':'Lien permanent vers ce reçu. Toute personne disposant du lien peut le consulter.'}</DialogDescription></DialogHeader>
          {receiptDocument&&<><DocumentQr url={receiptDocument.url} label={language==='ar'?'عرض الفاتورة':language==='nl'?'Vervoerbewijs bekijken':'Voir le reçu'}/><a className="dp-btn-primary flex items-center justify-center p-4 rounded-2xl" href={receiptDocument.url} target="_blank" rel="noreferrer">PDF</a><button className="dp-btn-secondary p-4 rounded-2xl" onClick={()=>void shareDocument()}>{language==='ar'?'مشاركة الرابط':language==='nl'?'Link delen':'Partager le lien'}</button></>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
