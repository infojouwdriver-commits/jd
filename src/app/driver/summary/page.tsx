
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import {
  Download, Calendar, Filter, TrendingUp, MapPin, DollarSign, Clock,
  Loader2, FileText, BarChart3, Wallet, Receipt, CreditCard, Banknote,
  Sparkles, Zap, ChevronDown, ChevronUp
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { driverTranslations } from '@/locales/driver';
import jsPDF from 'jspdf';

interface Trip {
  id: number; start_time: string; end_time: string;
  distance_km: number; duration_minutes: number; price: number;
  status: string; ride_type: string; external_source: string | null; payment_method: string;
}

interface SummaryData {
  period: string; start_date: string; end_date: string;
  total_trips: number; total_revenue: number; total_distance: number;
  total_duration: number; average_trip_value: number; average_distance: number;
  cash_amount: number; card_amount: number; bank_transfer_amount: number;
  bancontact_amount: number; total_tax_amount: number; tax_rate_6_amount: number;
  tax_rate_21_amount: number; total_before_tax: number; total_after_tax: number;
  platform_stats: any; payment_method_stats: any; daily_stats: any; trips: Trip[];
}

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

const glassCard = {
  background: 'var(--dp-card)',
  backdropFilter: 'blur(20px)',
  border: '1px solid var(--dp-border)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
};

const labelStyle = {
  color: 'var(--dp-text-muted)',
  fontSize: '0.7rem',
  fontWeight: '700',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
};

function StatCard({ icon: Icon, label, value, color, delay }: {
  icon: React.ElementType; label: string; value: string | number; color: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay, type: 'spring' }}
      className="p-4 rounded-2xl"
      style={{ background: `${color}18`, border: `1px solid ${color}35` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}22` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <span className="text-xs font-medium" style={{ color: `${color}cc` }}>{label}</span>
      </div>
      <motion.p
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.2, type: 'spring' }}
        className="text-2xl font-black text-white"
      >
        {value}
      </motion.p>
    </motion.div>
  );
}

export default function SummaryPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
  const t = driverTranslations[language];

  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [periodType, setPeriodType] = useState<PeriodType>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  useEffect(() => {
    if (!isLoading && !user) router.push('/driver-login');
  }, [user, isLoading, router]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const params: any = { period: periodType };
      if (periodType === 'custom' && startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      }
      if (selectedPlatform !== 'all') params.platform = selectedPlatform;
      const queryString = new URLSearchParams(params).toString();
      const data = await api.get<SummaryData>(`/trips/summary?${queryString}`);
      setSummary(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchSummary();
  }, [user, periodType, selectedDate, startDate, endDate, selectedPlatform]);

  const generatePDF = async () => {
    if (!summary) return;
    setGenerating(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text('Trip Summary Report', 105, 20, { align: 'center' });
      doc.setFontSize(12);
      const startDateStr = new Date(summary.start_date).toLocaleDateString('nl-BE');
      const endDateStr = new Date(summary.end_date).toLocaleDateString('nl-BE');
      doc.text(`Period: ${startDateStr} - ${endDateStr}`, 105, 30, { align: 'center' });
      doc.setFontSize(14);
      doc.text('Overall Statistics', 20, 45);
      doc.setFontSize(11);
      doc.text(`Total Trips: ${summary.total_trips}`, 20, 55);
      doc.text(`Total Revenue: €${summary.total_revenue.toFixed(2)}`, 20, 62);
      doc.text(`Total Distance: ${summary.total_distance.toFixed(2)} km`, 20, 69);
      doc.text(`Total Duration: ${Math.floor(summary.total_duration / 60)}h ${summary.total_duration % 60}m`, 20, 76);
      doc.setFontSize(14);
      doc.text('Payment & Tax Information', 20, 90);
      doc.setFontSize(11);
      let yPos = 100;
      doc.text(`Cash: €${summary.cash_amount.toFixed(2)}`, 20, yPos); yPos += 7;
      doc.text(`Card: €${summary.card_amount.toFixed(2)}`, 20, yPos); yPos += 7;
      doc.text(`Bancontact: €${summary.bancontact_amount.toFixed(2)}`, 20, yPos); yPos += 7;
      doc.text(`Bank Transfer: €${summary.bank_transfer_amount.toFixed(2)}`, 20, yPos); yPos += 10;
      doc.text(`Before Tax: €${summary.total_before_tax.toFixed(2)}`, 20, yPos); yPos += 7;
      doc.text(`Tax (6%): €${summary.tax_rate_6_amount.toFixed(2)}`, 20, yPos); yPos += 7;
      doc.text(`After Tax: €${summary.total_after_tax.toFixed(2)}`, 20, yPos);
      const fileName = `Summary-${periodType}-${selectedDate}.pdf`;
      doc.save(fileName);
      toast.success(language === 'nl' ? 'Rapport gegenereerd' : 'Rapport généré');
    } catch (error) {
      toast.error(language === 'nl' ? 'Rapport genereren mislukt' : 'Échec de la génération du rapport');
    } finally {
      setGenerating(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <BarChart3 className="w-10 h-10" style={{ color: 'var(--dp-accent)' }} />
        </motion.div>
      </div>
    );
  }

  if (!summary) return null;

  const inputStyle = {
    background: 'var(--dp-card)',
    border: '1px solid var(--dp-border)',
    color: 'white',
    borderRadius: '1rem',
    height: '44px',
    padding: '0 12px',
    outline: 'none',
    width: '100%',
    fontSize: '0.875rem',
    colorScheme: 'dark' as any,
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl pb-8">

      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="mb-6"
      >
        <div
          className="p-6 rounded-3xl overflow-hidden relative"
          style={{ ...glassCard, border: '1px solid var(--dp-border)' }}
        >
          <motion.div
            className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl"
            style={{ background: 'var(--dp-accent-soft)', marginRight: '-6rem', marginTop: '-6rem' }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <BarChart3 className="w-6 h-6" style={{ color: 'var(--dp-accent)' }} />
                </motion.div>
                <h1
                  className="text-2xl font-black tracking-tight"
                  style={{
                    background: 'var(--dp-accent)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {t.summary}
                </h1>
                <motion.div
                  animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Sparkles className="w-5 h-5" style={{ color: '#ffd700' }} />
                </motion.div>
              </div>
              <p className="text-sm" style={{ color: 'var(--dp-text-muted)' }}>{t.detailedReports}</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold"
              style={{ background: 'var(--dp-accent-soft)', border: '1px solid var(--dp-border)', color: 'var(--dp-text-muted)' }}
            >
              <Filter className="w-3.5 h-3.5" />
              {t.filters}
              {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-5 overflow-hidden"
          >
            <div className="p-5 rounded-3xl" style={glassCard}>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2" style={labelStyle}>{t.periodType}</label>
                  <Select value={periodType} onValueChange={(v) => setPeriodType(v as PeriodType)}>
                    <SelectTrigger className="rounded-2xl border-0 text-sm" style={{ background: 'var(--dp-card)', border: '1px solid var(--dp-border)', height: '44px', color: 'white' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ background: 'var(--dp-card)', border: '1px solid var(--dp-border)' }}>
                      <SelectItem value="daily" style={{ color: 'white' }}>{t.daily}</SelectItem>
                      <SelectItem value="weekly" style={{ color: 'white' }}>{t.weekly}</SelectItem>
                      <SelectItem value="monthly" style={{ color: 'white' }}>{t.monthly}</SelectItem>
                      <SelectItem value="quarterly" style={{ color: 'white' }}>{t.quarterly}</SelectItem>
                      <SelectItem value="yearly" style={{ color: 'white' }}>{t.yearly}</SelectItem>
                      <SelectItem value="custom" style={{ color: 'white' }}>{t.custom}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {periodType !== 'custom' ? (
                  <div>
                    <label className="block mb-2" style={labelStyle}>{t.date}</label>
                    <div className="relative">
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--dp-text-muted)' }} />
                      <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={inputStyle} />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-2" style={labelStyle}>{t.startDate}</label>
                      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label className="block mb-2" style={labelStyle}>{t.endDate}</label>
                      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block mb-2" style={labelStyle}>{t.platform}</label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger className="rounded-2xl border-0 text-sm" style={{ background: 'var(--dp-card)', border: '1px solid var(--dp-border)', height: '44px', color: 'white' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ background: 'var(--dp-card)', border: '1px solid var(--dp-border)' }}>
                      <SelectItem value="all" style={{ color: 'white' }}>{t.all}</SelectItem>
                      <SelectItem value="INTERNAL" style={{ color: 'white' }}>{t.taxi}</SelectItem>
                      <SelectItem value="BOLT" style={{ color: 'white' }}>Bolt</SelectItem>
                      <SelectItem value="UBER" style={{ color: 'white' }}>Uber</SelectItem>
                      <SelectItem value="HEETCH" style={{ color: 'white' }}>Heetch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard icon={MapPin} label={t.totalTrips} value={summary.total_trips} color="#60a5fa" delay={0.1} />
        <StatCard icon={DollarSign} label={t.totalRevenue} value={`€${summary.total_revenue.toFixed(2)}`} color="#4ade80" delay={0.2} />
        <StatCard icon={TrendingUp} label={t.totalDistance} value={`${summary.total_distance.toFixed(1)} km`} color="#c084fc" delay={0.3} />
        <StatCard icon={Clock} label={t.totalDuration} value={`${Math.floor(summary.total_duration / 60)}h ${summary.total_duration % 60}m`} color="#fb923c" delay={0.4} />
      </div>

      {/* Payment Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mb-5"
      >
        <div className="p-5 rounded-3xl" style={{ ...glassCard, border: '1px solid var(--dp-border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <Wallet className="w-5 h-5" style={{ color: 'var(--dp-accent)' }} />
            </motion.div>
            <h3 className="font-bold text-white">{t.paymentInfo}</h3>
            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <Zap className="w-4 h-4" style={{ color: '#ffd700' }} />
            </motion.div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Banknote, label: t.cash, value: summary.cash_amount, color: '#4ade80' },
              { icon: CreditCard, label: t.card, value: summary.card_amount, color: '#60a5fa' },
              { icon: Receipt, label: t.bancontact, value: summary.bancontact_amount, color: '#c084fc' },
              { icon: DollarSign, label: t.bankTransfer, value: summary.bank_transfer_amount, color: '#fb923c' },
            ].map((payment, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-2xl"
                style={{ background: `${payment.color}12`, border: `1px solid ${payment.color}30` }}
              >
                <payment.icon className="w-5 h-5 flex-shrink-0" style={{ color: payment.color }} />
                <div>
                  <p className="text-xs font-medium" style={{ color: `${payment.color}cc` }}>{payment.label}</p>
                  <p className="text-base font-bold text-white">€{payment.value.toFixed(2)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tax Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="mb-5"
      >
        <div className="p-5 rounded-3xl" style={{ ...glassCard, border: '1px solid rgba(239,68,68,0.25)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="w-5 h-5 text-red-400" />
            <h3 className="font-bold text-white">{t.taxInfo}</h3>
          </div>
          <div className="space-y-2">
            {[
              { label: t.beforeTax, value: summary.total_before_tax, color: '#4ade80' },
              { label: t.tax6, value: summary.tax_rate_6_amount, color: '#f87171' },
              { label: t.totalTax, value: summary.total_tax_amount, color: '#f87171' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-2xl" style={{ background: 'var(--dp-card)', border: '1px solid var(--dp-border)' }}>
                <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.82)' }}>{item.label}</span>
                <span className="font-bold text-sm" style={{ color: item.color }}>€{item.value.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center p-3 rounded-2xl" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)' }}>
              <span className="text-sm font-bold text-white">{t.afterTax}</span>
              <span className="text-xl font-black text-green-400">€{summary.total_after_tax.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Platform Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mb-6"
      >
        <div className="p-5 rounded-3xl" style={glassCard}>
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" style={{ color: 'var(--dp-accent)' }} />
            {t.platformBreakdown}
          </h3>
          <div className="space-y-3">
            {Object.entries(summary.platform_stats).map(([platform, stats]: [string, any], index) => {
              if (stats.count === 0) return null;
              const percentage = summary.total_trips > 0 ? (stats.count / summary.total_trips * 100).toFixed(1) : 0;
              return (
                <motion.div
                  key={platform}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm text-white">{platform === 'INTERNAL' ? t.taxi : platform}</span>
                    <div className="text-right">
                      <span className="font-bold text-sm" style={{ color: 'var(--dp-accent)' }}>€{stats.revenue.toFixed(2)}</span>
                      <span className="text-xs ml-2" style={{ color: 'var(--dp-text-muted)' }}>{stats.count} {t.trips}</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--dp-accent-soft)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.9 + index * 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: 'var(--dp-accent)' }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Download Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <button
          onClick={generatePDF}
          disabled={generating || summary.total_trips === 0}
          className="relative w-full h-14 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 overflow-hidden"
          style={{
            background: 'var(--dp-accent)',
            color: 'var(--dp-action-text)',
            boxShadow: '0 8px 32px rgba(52,211,153,0.4)',
          }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
          <span className="relative z-10 flex items-center gap-2">
            {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            {t.downloadPDF}
          </span>
        </button>
      </motion.div>
    </div>
  );
}
