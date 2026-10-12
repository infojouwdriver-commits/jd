
'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Phone, IdCard, FileBadge, Calendar, Building2, MapPin, Mail, Hash,
  Car, Languages, CheckCircle, Clock, XCircle, AlertCircle, Loader2, Shield,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { useLanguage } from '@/contexts/LanguageContext';
import { driverTranslations } from '@/locales/driver';
import { toast } from 'sonner';
import AccountSettings from '@/components/account/AccountSettings';
import DriverGdprSection from '@/components/gdpr/DriverGdprSection';

interface VehicleSummary {
  id: number;
  brand: string;
  model: string;
  plate_number: string;
  vin?: string;
  status: string;
}

interface DriverData {
  hasProfile: boolean;
  registrationStatus?: string;
  driver?: {
    id: number;
    full_name: string;
    phone: string;
    national_id?: string;
    driver_license?: string;
    bestuurderspas_number?: string;
    status: string;
    registration_status: string;
    preferred_language?: string;
    created_at?: string;
  };
  company?: {
    id: number;
    name: string;
    vat_number?: string;
    kbo_number?: string;
    address?: string;
    email?: string;
    phone?: string;
    subscription_status?: string;
  } | null;
  vehicle?: VehicleSummary | null;
  all_vehicles?: VehicleSummary[];
}

function GlassCard({
  children,
  className = '',
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-3xl ${className}`}
      style={{
        background: 'rgba(10,15,30,0.75)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(212,175,55,0.15)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
      <div
        className="w-7 h-7 rounded-xl flex items-center justify-center"
        style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}
      >
        <Icon className="w-3.5 h-3.5" style={{ color: '#d4af37' }} />
      </div>
      <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(212,175,55,0.95)' }}>
        {title}
      </h2>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-3 py-3 px-4 border-b border-white/5 last:border-b-0">
      <div className="flex items-center gap-2 flex-shrink-0">
        <Icon className="w-4 h-4" style={{ color: 'rgba(212,175,55,0.55)' }} />
        <span className="text-xs" style={{ color: 'rgba(212,175,55,0.7)' }}>{label}</span>
      </div>
      <span className="text-sm font-medium text-white text-right break-words max-w-[60%]">{value}</span>
    </div>
  );
}

function StatusBadge({ status, language }: { status: string; language: 'nl' | 'fr' | 'ar' }) {
  const t = driverTranslations[language];
  const config: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    approved: { icon: CheckCircle, color: '#22c55e', label: t.approved },
    pending: { icon: Clock, color: '#f59e0b', label: t.pending },
    rejected: { icon: XCircle, color: '#ef4444', label: t.rejected },
    under_review: { icon: AlertCircle, color: '#3b82f6', label: t.underReview },
  };
  const cfg = config[status] || config.pending;
  const Icon = cfg.icon;
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
      style={{ background: `${cfg.color}1f`, border: `1px solid ${cfg.color}66`, color: cfg.color }}
    >
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </div>
  );
}

function VehicleCard({
  vehicle,
  isActive,
  isSaving,
  onSelect,
  selectLabel,
  activeLabel,
}: {
  vehicle: VehicleSummary;
  isActive: boolean;
  isSaving: boolean;
  onSelect: (id: number) => void;
  selectLabel: string;
  activeLabel: string;
}) {
  return (
    <motion.div
      layout
      className="flex items-center justify-between p-3 rounded-2xl"
      style={{
        background: isActive ? 'rgba(212,175,55,0.18)' : 'rgba(10,15,30,0.55)',
        border: isActive ? '1px solid rgba(212,175,55,0.45)' : '1px solid rgba(212,175,55,0.1)',
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: isActive ? 'rgba(212,175,55,0.25)' : 'rgba(212,175,55,0.1)',
            border: '1px solid rgba(212,175,55,0.2)',
          }}
        >
          <Car className="w-4 h-4" style={{ color: isActive ? '#ffd700' : 'rgba(212,175,55,0.55)' }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {vehicle.brand} {vehicle.model}
          </p>
          <p className="text-xs font-mono truncate" style={{ color: 'rgba(212,175,55,0.55)' }}>
            {vehicle.plate_number}
          </p>
        </div>
      </div>

      <div className="flex-shrink-0 ml-2">
        {isActive ? (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-bold"
            style={{ background: 'linear-gradient(135deg, #b8860b, #d4af37)', color: '#1a1200' }}
          >
            {activeLabel}
          </span>
        ) : (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => onSelect(vehicle.id)}
            disabled={isSaving}
            className="text-[11px] px-3 py-1 rounded-full font-bold transition-all disabled:opacity-50"
            style={{
              background: 'rgba(212,175,55,0.12)',
              border: '1px solid rgba(212,175,55,0.35)',
              color: '#d4af37',
            }}
          >
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : selectLabel}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

export default function DriverProfilePage() {
  const { language } = useLanguage();
  const t = driverTranslations[language];

  const [data, setData] = useState<DriverData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentVehicleId, setCurrentVehicleId] = useState<number | null>(null);
  const [changingVehicle, setChangingVehicle] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result = await api.get<DriverData>('/drivers/profile');
        setData(result);
        setCurrentVehicleId(result?.vehicle?.id ?? null);
      } catch (err) {
        console.error("Operation failed");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSelectVehicle = useCallback(async (vehicleId: number) => {
    if (changingVehicle || vehicleId === currentVehicleId) return;
    setChangingVehicle(true);
    try {
      await api.put('/drivers/vehicles', { vehicle_id: vehicleId });
      setCurrentVehicleId(vehicleId);
      toast.success(t.vehicleChangeSuccess);
    } catch (error) {
      console.error("Operation failed");
      toast.error(t.vehicleChangeError);
    } finally {
      setChangingVehicle(false);
    }
  }, [changingVehicle, currentVehicleId, t]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl flex justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Loader2 className="w-8 h-8" style={{ color: '#d4af37' }} />
        </motion.div>
      </div>
    );
  }

  if (!data?.hasProfile) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <GlassCard className="p-8 text-center">
          <div
            className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4"
            style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)' }}
          >
            <User className="w-8 h-8" style={{ color: '#d4af37' }} />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">{t.profileNotComplete}</h2>
          <p className="text-sm" style={{ color: 'rgba(212,175,55,0.7)' }}>{t.profileNotCompleteDesc}</p>
        </GlassCard>
      </div>
    );
  }

  const driver = data.driver;
  const company = data.company;
  const allVehicles = data.all_vehicles || [];
  const displayVehicle = allVehicles.find((v) => v.id === currentVehicleId) ?? data.vehicle;

  const formatDate = (iso?: string) => {
    if (!iso) return undefined;
    try {
      return new Date(iso).toLocaleDateString(
        language === 'ar' ? 'ar-EG' : language === 'fr' ? 'fr-BE' : 'nl-BE',
      );
    } catch {
      return iso;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl space-y-5">
      {/* Hero status card */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, type: 'spring' }}>
        <GlassCard className="p-6 text-center relative overflow-hidden" style={{ border: '1px solid rgba(212,175,55,0.3)' }}>
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'rgba(212,175,55,0.12)' }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(184,142,4,0.18))',
                border: '2px solid rgba(212,175,55,0.45)',
                boxShadow: '0 8px 24px rgba(212,175,55,0.25)',
              }}
            >
              <User className="w-10 h-10" style={{ color: '#ffd700' }} />
            </motion.div>
            <h1
              className="text-xl font-bold mb-1"
              style={{
                background: 'linear-gradient(90deg, #b8860b, #d4af37, #ffd700)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {driver?.full_name || '—'}
            </h1>
            <p className="text-xs mb-4 font-mono" style={{ color: 'rgba(212,175,55,0.55)' }}>
              {t.driverId}: #{driver?.id}
            </p>
            <StatusBadge status={driver?.registration_status || 'pending'} language={language} />
          </div>
        </GlassCard>
      </motion.div>

      {/* Personal info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
        <GlassCard className="overflow-hidden">
          <SectionHeader icon={Shield} title={t.personalInfo} />
          <div>
            <InfoRow icon={User} label={t.fullName} value={driver?.full_name} />
            <InfoRow icon={Phone} label={t.phoneLabel} value={driver?.phone} />
            <InfoRow icon={IdCard} label={t.nationalId} value={driver?.national_id} />
            <InfoRow icon={FileBadge} label={t.driverLicense} value={driver?.driver_license} />
            <InfoRow icon={Hash} label={t.bestuurderspas} value={driver?.bestuurderspas_number} />
            <InfoRow icon={Languages} label={t.preferredLanguage} value={driver?.preferred_language?.toUpperCase()} />
            <InfoRow icon={Calendar} label={t.registrationDate} value={formatDate(driver?.created_at)} />
          </div>
        </GlassCard>
      </motion.div>

      {/* Company info */}
      {company && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <GlassCard className="overflow-hidden">
            <SectionHeader icon={Building2} title={t.companyInfo} />
            <div>
              <InfoRow icon={Building2} label={t.companyName} value={company.name} />
              <InfoRow icon={Hash} label={t.vatNumber} value={company.vat_number} />
              <InfoRow icon={Hash} label={t.kboNumber} value={company.kbo_number} />
              <InfoRow icon={MapPin} label={t.address} value={company.address} />
              <InfoRow icon={Mail} label={t.companyEmail} value={company.email} />
              <InfoRow icon={Phone} label={t.companyPhone} value={company.phone} />
              <InfoRow icon={CheckCircle} label={t.subscriptionStatus} value={company.subscription_status} />
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Assigned vehicle */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
        <GlassCard className="overflow-hidden">
          <SectionHeader icon={Car} title={t.assignedVehicle} />
          <AnimatePresence mode="wait">
            {displayVehicle ? (
              <motion.div
                key={displayVehicle.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >
                <InfoRow icon={Car} label={t.brand} value={displayVehicle.brand} />
                <InfoRow icon={Car} label={t.model} value={displayVehicle.model} />
                <InfoRow icon={Hash} label={t.plateNumber} value={displayVehicle.plate_number} />
                <InfoRow icon={Hash} label={t.vin} value={displayVehicle.vin} />
                <InfoRow icon={CheckCircle} label={t.status} value={displayVehicle.status} />
              </motion.div>
            ) : (
              <motion.div key="no-vehicle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 py-6 text-center">
                <Car className="w-10 h-10 mx-auto mb-2" style={{ color: 'rgba(212,175,55,0.3)' }} />
                <p className="text-sm" style={{ color: 'rgba(212,175,55,0.6)' }}>{t.noVehicleAssigned}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </motion.div>

      {/* Company vehicles list */}
      {allVehicles.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <GlassCard className="overflow-hidden">
            <SectionHeader icon={Car} title={`${t.companyVehicles} (${allVehicles.length})`} />
            {allVehicles.length > 1 && (
              <div className="px-4 py-2 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#d4af37' }} />
                <p className="text-[11px]" style={{ color: 'rgba(212,175,55,0.6)' }}>{t.changeVehicle}</p>
              </div>
            )}
            <div className="p-3 space-y-2">
              {allVehicles.map((v) => (
                <VehicleCard
                  key={v.id}
                  vehicle={v}
                  isActive={v.id === currentVehicleId}
                  isSaving={changingVehicle}
                  onSelect={handleSelectVehicle}
                  selectLabel={t.selectThisVehicle}
                  activeLabel={t.yourVehicle}
                />
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* GDPR & Privacy Rights Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
        <AccountSettings />
        <DriverGdprSection />
      </motion.div>
    </div>
  );
}
