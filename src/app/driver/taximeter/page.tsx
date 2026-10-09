
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  MapPin, Navigation, Clock, Play, Square, Loader2, Target, AlertCircle,
  User, Send, FileText, Edit2, RefreshCw, CreditCard, TrendingUp, Sparkles,
  Search, Map, ChevronRight, ExternalLink, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import type { AppLanguage } from '@/contexts/LanguageContext';
import { driverTranslations } from '@/locales/driver';
import Image from 'next/image';
import { useGeolocation, GeolocationPoint } from '@/hooks/useGeolocation';
import { useAddressSearch } from '@/hooks/useAddressSearch';
import GpsLocationButton from '@/components/GpsLocationButton';
import RouteMap from '@/components/RouteMap';
import { tripJournal } from '@/lib/trip-journal';
import { addMeterPoint, emptyMeter, type MeterState } from '@/lib/trip-meter';
import { isFreshAccurateLocation } from '@/lib/mobile-location';

interface PricingConfig {
  company_id: number; company_name: string;
  pricing: { base_fee: number; km_rate: number; minute_rate: number; minimum_fare: number; night_fee?: number; airport_fee?: number };
  chiron_mode: 'TEST' | 'PRODUCTION';
}
interface TripData {
  completionRequestKey: string;
  startLat: number; startLon: number; startAddress: string; endAddress: string;
  startTime: string; distance: number; duration: number; proposedPrice: number;
  passengerName?: string; paymentMethod?: string; rideType: 'INTERNAL' | 'EXTERNAL';
  externalSource?: 'BOLT' | 'UBER' | 'HEETCH'; externalRideNumber?: string;
}
interface SavedTrip { trip: TripData; meter: MeterState; estimatedDistance: number; estimatedDuration: number; }
interface LocationPoint { lat: number; lon: number; timestamp: number; speed?: number; accuracy?: number }
interface RouteCoords { startLat: number; startLon: number; endLat: number; endLon: number }
type RideType = 'INTERNAL' | 'BOLT' | 'UBER' | 'HEETCH';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function calculateActualDistance(locations: LocationPoint[]): number {
  if (locations.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < locations.length; i++) total += calculateDistance(locations[i - 1].lat, locations[i - 1].lon, locations[i].lat, locations[i].lon);
  return total;
}

function buildWazeUrl(address: string): string {
  const encoded = encodeURIComponent(address);
  return `https://waze.com/ul?q=${encoded}&navigate=yes`;
}

function buildGoogleMapsUrl(address: string): string {
  const encoded = encodeURIComponent(address);
  return `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
}

function GlassCard({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
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

function GoldButton({ onClick, disabled, children, variant = 'gold', className = '' }: {
  onClick?: () => void; disabled?: boolean; children: React.ReactNode; variant?: 'gold' | 'danger' | 'outline'; className?: string;
}) {
  const styles = {
    gold: { background: 'linear-gradient(135deg, #b8860b 0%, #d4af37 50%, #ffd700 100%)', color: '#1a1200', boxShadow: '0 8px 24px rgba(212,175,55,0.4)' },
    danger: { background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)', color: 'white', boxShadow: '0 8px 24px rgba(239,68,68,0.4)' },
    outline: { background: 'rgba(212,175,55,0.1)', color: 'rgba(212,175,55,0.9)', border: '1px solid rgba(212,175,55,0.3)' },
  };
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02, boxShadow: disabled ? undefined : '0 12px 32px rgba(212,175,55,0.6)' }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`relative w-full h-14 rounded-2xl text-base font-bold overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={styles[variant]}
    >
      {variant === 'gold' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2 font-bold">{children}</span>
    </motion.button>
  );
}

// ---- Map Picker Bottom Sheet ----
function MapPickerSheet({
  isOpen,
  onClose,
  address,
  language,
}: {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  language: AppLanguage;
}) {
  const t = driverTranslations[language];

  const handleWaze = () => {
    window.open(buildWazeUrl(address), '_blank');
    onClose();
  };

  const handleGoogleMaps = () => {
    window.open(buildGoogleMapsUrl(address), '_blank');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-end justify-center"
          style={{ zIndex: 99999, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="w-full max-w-lg"
            style={{ paddingBottom: '96px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-full rounded-t-3xl"
              style={{
                background: 'rgba(5,10,20,0.99)',
                border: '1px solid rgba(212,175,55,0.25)',
                borderBottom: 'none',
                backdropFilter: 'blur(32px)',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.6)',
              }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1.5 rounded-full" style={{ background: 'rgba(212,175,55,0.4)' }} />
              </div>

              {/* Header */}
              <div className="px-5 pt-2 pb-4 flex items-center justify-between border-b" style={{ borderColor: 'rgba(212,175,55,0.15)' }}>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: '#d4af37' }}>
                    {t.chooseNavigationApp}
                  </h3>
                  <p className="text-xs mt-0.5 truncate max-w-[240px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {address}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: 'rgba(212,175,55,0.15)', color: 'rgba(212,175,55,0.9)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* App options */}
              <div className="px-5 py-5 space-y-3">
                {/* Waze */}
                <motion.button
                  onClick={handleWaze}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,200,150,0.15), rgba(0,160,120,0.1))',
                    border: '1px solid rgba(0,200,150,0.35)',
                    boxShadow: '0 4px 16px rgba(0,200,150,0.1)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                    style={{ background: 'rgba(0,200,150,0.2)', border: '1px solid rgba(0,200,150,0.4)' }}
                  >
                    <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="24" cy="22" r="16" fill="#00C896" />
                      <ellipse cx="24" cy="36" rx="8" ry="4" fill="#00C896" opacity="0.5" />
                      <circle cx="19" cy="20" r="2.5" fill="white" />
                      <circle cx="29" cy="20" r="2.5" fill="white" />
                      <path d="M19 26 Q24 30 29 26" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
                    </svg>
                  </div>

                  <div className="flex-1 text-left">
                    <p className="text-base font-bold text-white">Waze</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(0,220,160,0.9)' }}>
                      {t.openInWaze}
                    </p>
                  </div>

                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(0,200,150,0.2)' }}
                  >
                    <ExternalLink className="w-4 h-4" style={{ color: '#00C896' }} />
                  </div>
                </motion.button>

                {/* Google Maps */}
                <motion.button
                  onClick={handleGoogleMaps}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(66,133,244,0.15), rgba(52,103,210,0.1))',
                    border: '1px solid rgba(66,133,244,0.35)',
                    boxShadow: '0 4px 16px rgba(66,133,244,0.1)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                    style={{ background: 'rgba(66,133,244,0.2)', border: '1px solid rgba(66,133,244,0.4)' }}
                  >
                    <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 4C16.27 4 10 10.27 10 18c0 10.5 14 26 14 26s14-15.5 14-26c0-7.73-6.27-14-14-14z" fill="#4285F4" />
                      <path d="M24 4C16.27 4 10 10.27 10 18c0 3.87 1.57 7.37 4.1 9.9L24 44s14-15.5 14-26c0-7.73-6.27-14-14-14z" fill="#34A853" opacity="0.3" />
                      <circle cx="24" cy="18" r="5" fill="white" />
                      <circle cx="24" cy="18" r="3" fill="#EA4335" />
                    </svg>
                  </div>

                  <div className="flex-1 text-left">
                    <p className="text-base font-bold text-white">Google Maps</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(100,160,255,0.95)' }}>
                      {t.openInGoogleMaps}
                    </p>
                  </div>

                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(66,133,244,0.2)' }}
                  >
                    <ExternalLink className="w-4 h-4" style={{ color: '#4285F4' }} />
                  </div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---- Navigate Button ----
function NavigateButton({
  address,
  label,
  language,
}: {
  address: string;
  label: string;
  language: AppLanguage;
}) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setShowPicker(true)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
        style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(37,99,235,0.12))',
          border: '1px solid rgba(59,130,246,0.4)',
          boxShadow: '0 4px 16px rgba(59,130,246,0.15)',
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', boxShadow: '0 4px 12px rgba(59,130,246,0.4)' }}
        >
          <Navigation className="w-5 h-5 text-white" />
        </div>

        <div className="flex-1 text-left">
          <p className="text-xs font-semibold" style={{ color: 'rgba(147,197,253,0.95)' }}>{label}</p>
          <p className="text-sm font-bold text-white truncate max-w-[180px]">{address}</p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,200,150,0.25)', border: '1px solid rgba(0,200,150,0.5)' }}>
            <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="none">
              <circle cx="10" cy="9" r="7" fill="#00C896" />
              <circle cx="7.5" cy="8" r="1.2" fill="white" />
              <circle cx="12.5" cy="8" r="1.2" fill="white" />
              <path d="M7.5 11.5 Q10 13.5 12.5 11.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(66,133,244,0.25)', border: '1px solid rgba(66,133,244,0.5)' }}>
            <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="none">
              <path d="M10 2C6.69 2 4 4.69 4 8c0 4.5 6 10 6 10s6-5.5 6-10c0-3.31-2.69-6-6-6z" fill="#4285F4" />
              <circle cx="10" cy="8" r="2" fill="white" />
            </svg>
          </div>
          <ChevronRight className="w-4 h-4" style={{ color: '#93c5fd' }} />
        </div>
      </motion.button>

      <MapPickerSheet
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        address={address}
        language={language}
      />
    </>
  );
}

// ---- Bottom Sheet Modal ----
function BottomSheetModal({
  isOpen,
  onClose,
  title,
  titleColor,
  children,
  actions,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  titleColor?: string;
  children: React.ReactNode;
  actions: React.ReactNode;
}) {
  const BOTTOM_NAV_HEIGHT = 88;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-end justify-center"
          style={{ zIndex: 9999, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="w-full max-w-lg"
            style={{ zIndex: 9999, paddingBottom: `${BOTTOM_NAV_HEIGHT}px` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-full rounded-t-3xl flex flex-col"
              style={{
                background: 'rgba(5,10,20,0.99)',
                border: '1px solid rgba(212,175,55,0.2)',
                borderBottom: 'none',
                backdropFilter: 'blur(32px)',
                maxHeight: `calc(100dvh - ${BOTTOM_NAV_HEIGHT}px - 20px)`,
                boxShadow: '0 -8px 40px rgba(0,0,0,0.6)',
              }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1.5 rounded-full" style={{ background: 'rgba(212,175,55,0.4)' }} />
              </div>

              {/* Header */}
              <div className="px-5 pt-2 pb-3 flex-shrink-0 flex items-center justify-between border-b" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
                <div style={{ color: titleColor }}>{title}</div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: 'rgba(212,175,55,0.12)', color: 'rgba(255,255,255,0.8)' }}
                >
                  ✕
                </button>
              </div>

              {/* Scrollable content */}
              <div
                className="flex-1 overflow-y-auto px-5 py-4"
                style={{ overscrollBehavior: 'contain', minHeight: 0 }}
              >
                {children}
              </div>

              {/* Fixed action buttons */}
              <div
                className="flex gap-3 px-5 pt-3 pb-4 flex-shrink-0"
                style={{
                  borderTop: '1px solid rgba(212,175,55,0.15)',
                  background: 'rgba(5,10,20,0.99)',
                }}
              >
                {actions}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function TaximeterPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
  const t = driverTranslations[language];

  const [selectedRideType, setSelectedRideType] = useState<RideType>('INTERNAL');
  const [tripActive, setTripActive] = useState(false);
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [passengerName, setPassengerName] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [finalPrice, setFinalPrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [externalRideNumber, setExternalRideNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showEndSuggestions, setShowEndSuggestions] = useState(false);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [storageReady, setStorageReady] = useState(false);
  const [pendingTrips, setPendingTrips] = useState(0);
  const [syncingTrips, setSyncingTrips] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [showPriceProposal, setShowPriceProposal] = useState(false);
  const [showEndTripDialog, setShowEndTripDialog] = useState(false);
  const [completedTripId, setCompletedTripId] = useState<number | null>(null);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [estimatedDistance, setEstimatedDistance] = useState(0);
  const [estimatedDuration, setEstimatedDuration] = useState(0);
  const [dailyEarnings, setDailyEarnings] = useState(0);
  const [locationHistory, setLocationHistory] = useState<LocationPoint[]>([]);
  const [actualTripDistance, setActualTripDistance] = useState(0);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [routeCoords, setRouteCoords] = useState<RouteCoords | null>(null);
  const [showMap, setShowMap] = useState(true);
  const locationHistoryRef = useRef<LocationPoint[]>([]);
  const meterRef = useRef<MeterState>(emptyMeter());
  const activeTripRef = useRef<TripData | null>(null);
  const persistenceRef = useRef<Promise<void>>(Promise.resolve());
  const endingRef = useRef(false);
  const startingRef = useRef(false);

  const { location: currentLocation, error: gpsError, permissionState: gpsPermissionState, isLocating: gpsIsLocating, accuracy: gpsAccuracy, getLocation, startWatching, stopWatching } = useGeolocation({ language });
  const startSearch = useAddressSearch({ countryCode: 'be', limit: 8, debounceMs: 300, currentLocation });
  const endSearch = useAddressSearch({ countryCode: 'be', limit: 8, debounceMs: 300, currentLocation });

  useEffect(() => { if (!authLoading && !user) router.push('/driver-login'); }, [user, authLoading, router]);

  const syncPendingTrips = useCallback(async () => {
    if (!user || !navigator.onLine) return;
    setSyncingTrips(true);
    try {
      const result = await tripJournal().sync(user.sub, async payload => {
        const response = await api.post('/trips/end', payload);
        setCompletedTripId(response.id);
        if (response.warning) toast.warning(response.warning);
      });
      setPendingTrips(result.remaining);
      if (result.sent) toast.success(language === 'ar' ? `تمت مزامنة ${result.sent} رحلة` : language === 'fr' ? `${result.sent} trajet(s) synchronisé(s)` : `${result.sent} rit(ten) gesynchroniseerd`);
    } catch { setStorageError(true); }
    finally { setSyncingTrips(false); }
  }, [user, language]);

  useEffect(() => {
    if (!pendingTrips || !isOnline || !user) return;
    const timer = window.setInterval(() => void syncPendingTrips(), 30_000);
    return () => window.clearInterval(timer);
  }, [pendingTrips, isOnline, user?.sub, syncPendingTrips]);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const fetchDailyEarnings = async () => {
      if (!user) return;
      try {
        const trips = await api.get('/trips');
        const today = new Date().toDateString();
        const todayTrips = trips.filter((trip: any) => new Date(trip.start_time).toDateString() === today && (trip.status === 'completed' || trip.status === 'success'));
        setDailyEarnings(todayTrips.reduce((sum: number, trip: any) => sum + (trip.price || 0), 0));
      } catch (error) { console.error("Operation failed"); }
    };
    fetchDailyEarnings();
  }, [user, completedTripId]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success(language === 'nl' ? 'Internetverbinding hersteld' : language === 'ar' ? 'تم استعادة الاتصال بالإنترنت' : 'Connexion Internet rétablie');
      void syncPendingTrips();
    };
    const handleOffline = () => { setIsOnline(false); toast.warning(t.noInternet); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, [language, t, syncPendingTrips]);

  useEffect(() => {
    const loadPricing = async () => {
      if (!user) return;
      try { const config = await api.get<PricingConfig>('/drivers/pricing'); setPricingConfig(config); }
      catch (error) { console.error("Operation failed"); }
    };
    loadPricing();
  }, [user]);

  useEffect(() => { setPaymentMethod(selectedRideType !== 'INTERNAL' ? 'app' : ''); }, [selectedRideType]);

  useEffect(() => {
    if (tripActive && selectedRideType === 'INTERNAL') {
      startWatching((point: GeolocationPoint) => {
        if (endingRef.current) return;
        meterRef.current = addMeterPoint(meterRef.current, point);
        setActualTripDistance(meterRef.current.distanceKm);
        // Keep a bounded display history. Billing uses the incremental meter, not this array.
        locationHistoryRef.current = [...locationHistoryRef.current.slice(-199), point];
        setLocationHistory(locationHistoryRef.current);
        const trip = activeTripRef.current;
        if (trip && user) {
          const snapshot: SavedTrip = { trip, meter: meterRef.current, estimatedDistance, estimatedDuration };
          persistenceRef.current = persistenceRef.current.then(() => tripJournal().save(user.sub, 'active', trip.completionRequestKey, snapshot)).catch(() => { setStorageError(true); });
        }
      }, { background: true });
    } else { stopWatching(); }
    return () => { stopWatching(); };
  }, [tripActive, selectedRideType, user?.sub, startWatching, stopWatching]);

  // Obtain location when the driver explicitly starts a trip or requests location.

  const reverseGeocode = async (lat: number, lon: number): Promise<string | null> => {
    try {
      setIsReverseGeocoding(true);
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=${language === 'fr' ? 'fr' : language === 'ar' ? 'ar' : 'nl'}`);
      const data = await response.json();
      return data?.display_name || null;
    } catch { return null; } finally { setIsReverseGeocoding(false); }
  };

  const handleGpsLocationFound = async (lat: number, lon: number) => {
    const address = await reverseGeocode(lat, lon);
    if (address) {
      setStartAddress(address); startSearch.clear(); setShowStartSuggestions(false);
      toast.success(language === 'nl' ? 'Huidige locatie gebruikt' : language === 'ar' ? 'تم استخدام الموقع الحالي' : 'Localisation actuelle utilisée');
    } else {
      toast.error(language === 'nl' ? 'Adres ophalen mislukt' : language === 'ar' ? 'فشل جلب العنوان' : "Échec de la récupération de l'adresse");
    }
  };

  const calculateRouteDetails = async (startAddr: string, endAddr: string) => {
    if (!startAddr || !endAddr) return null;
    try {
      const [startRes, endRes] = await Promise.all([
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(startAddr)}&limit=1`),
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endAddr)}&limit=1`),
      ]);
      const [startData, endData] = await Promise.all([startRes.json(), endRes.json()]);
      if (!startData[0] || !endData[0]) throw new Error('Addresses not found');
      const startLat = parseFloat(startData[0].lat), startLon = parseFloat(startData[0].lon);
      const endLat = parseFloat(endData[0].lat), endLon = parseFloat(endData[0].lon);
      const directDistance = calculateDistance(startLat, startLon, endLat, endLon);
      const estimatedDist = directDistance * 1.4;
      return { distance: parseFloat(estimatedDist.toFixed(2)), duration: Math.round((estimatedDist / 40) * 60), startLat, startLon, endLat, endLon };
    } catch (error) { console.error("Operation failed"); return null; }
  };

  const calculateProposedPrice = (distance: number, duration: number): number => {
    if (!pricingConfig) return 0;
    const p = pricingConfig.pricing;
    let price = p.base_fee + (distance * p.km_rate) + (duration * p.minute_rate);
    if (price < p.minimum_fare) price = p.minimum_fare;
    return parseFloat(price.toFixed(2));
  };

  const showPriceEstimate = async () => {
    setLoading(true);
    try {
      if (selectedRideType === 'INTERNAL') {
        if (!startAddress) {
          toast.error(language === 'nl' ? 'Voer startadres in' : language === 'ar' ? 'أدخل عنوان البداية' : "Entrez l'adresse de départ");
          return;
        }
        if (!endAddress) {
          toast.error(language === 'nl' ? 'Voer bestemmingsadres in' : language === 'ar' ? 'أدخل عنوان الوجهة' : "Entrez l'adresse de destination");
          return;
        }
        const routeDetails = await calculateRouteDetails(startAddress, endAddress);
        if (!routeDetails) {
          toast.error(language === 'nl' ? 'Afstand berekenen mislukt' : language === 'ar' ? 'فشل حساب المسافة' : 'Échec du calcul de la distance');
          return;
        }
        setEstimatedDistance(routeDetails.distance);
        setEstimatedDuration(routeDetails.duration);
        setProposedPrice(calculateProposedPrice(routeDetails.distance, routeDetails.duration).toFixed(2));
        setRouteCoords({ startLat: routeDetails.startLat, startLon: routeDetails.startLon, endLat: routeDetails.endLat, endLon: routeDetails.endLon });
        setShowMap(true);
      } else { setProposedPrice('0.00'); setRouteCoords(null); }
      setShowPriceProposal(true);
    } catch (error) {
      toast.error(language === 'nl' ? 'Prijs berekenen mislukt' : language === 'ar' ? 'فشل حساب السعر' : 'Échec du calcul du prix');
    }
    finally { setLoading(false); }
  };

  const startTrip = async () => {
    if (!user || !storageReady || storageError || activeTripRef.current || startingRef.current) return;
    startingRef.current = true;
    setLoading(true);
    try {
    let startLocation = currentLocation;
      let loc = currentLocation;
      if (!loc || !isFreshAccurateLocation(loc)) {
        const point = await getLocation(true);
        if (!point) {
          toast.error(language === 'nl' ? 'Sta locatietoegang toe om rit te starten' : language === 'ar' ? 'اسمح بالوصول إلى الموقع لبدء الرحلة' : "Autoriser l'accès à la localisation pour démarrer le trajet");
          return;
        }
        loc = point;
      }
      startLocation = loc;
    if (selectedRideType === 'INTERNAL') {
      if (!startAddress || !endAddress) {
        toast.error(language === 'nl' ? 'Voer adressen in' : language === 'ar' ? 'أدخل العناوين' : 'Entrez les adresses');
        return;
      }
      const priceValue = parseFloat(proposedPrice);
      if (isNaN(priceValue) || priceValue <= 0) {
        toast.error(language === 'nl' ? 'Voer geldige prijs in' : language === 'ar' ? 'أدخل سعراً صحيحاً' : 'Entrez un prix valide');
        return;
      }
    }
      const tripStartData: TripData = {
        completionRequestKey: crypto.randomUUID(),
        startLat: startLocation?.lat ?? 0, startLon: startLocation?.lon ?? 0,
        startAddress: startAddress || '', endAddress: endAddress || '',
        startTime: new Date().toISOString(), distance: 0, duration: 0,
        proposedPrice: selectedRideType === 'INTERNAL' ? parseFloat(proposedPrice) : 0,
        passengerName: passengerName || undefined,
        paymentMethod: selectedRideType !== 'INTERNAL' ? 'app' : paymentMethod,
        rideType: selectedRideType === 'INTERNAL' ? 'INTERNAL' : 'EXTERNAL',
        externalSource: selectedRideType !== 'INTERNAL' ? selectedRideType : undefined,
        externalRideNumber: externalRideNumber || undefined,
      };
      meterRef.current = emptyMeter();
      if (startLocation) meterRef.current = addMeterPoint(meterRef.current, startLocation);
      await tripJournal().save(user.sub, 'active', tripStartData.completionRequestKey, { trip: tripStartData, meter: meterRef.current, estimatedDistance, estimatedDuration } satisfies SavedTrip);
      activeTripRef.current = tripStartData;
      setTripData(tripStartData); setTripActive(true); setShowPriceProposal(false);
      setActualTripDistance(0); locationHistoryRef.current = [];
      toast.success(language === 'nl' ? 'Rit gestart' : language === 'ar' ? 'بدأت الرحلة' : 'Trajet démarré');
    } catch (error) {
      toast.error(language === 'nl' ? 'Rit starten mislukt' : language === 'ar' ? 'فشل بدء الرحلة' : 'Échec du démarrage du trajet');
    }
    finally { startingRef.current = false; setLoading(false); }
  };

  const showEndDialog = () => {
    if (!tripData) return;
    setFinalPrice(selectedRideType === 'INTERNAL' ? tripData.proposedPrice.toFixed(2) : '');
    setShowEndTripDialog(true);
  };

  const endTrip = async () => {
    if (!tripData || !user || loading || endingRef.current) return;
    const priceValue = parseFloat(finalPrice);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast.error(language === 'nl' ? 'Voer geldige prijs in' : language === 'ar' ? 'أدخل سعراً صحيحاً' : 'Entrez un prix valide');
      return;
    }
    endingRef.current = true;
    setLoading(true);
    try {
      let endLoc = currentLocation;
      if (!endLoc || !isFreshAccurateLocation(endLoc)) endLoc = await getLocation(false);
      if (!endLoc || !isFreshAccurateLocation(endLoc)) throw new Error(language === 'ar' ? 'تعذّر تحديد موقع نهاية الرحلة بدقة. أبقِ الرحلة مفتوحة وحاول مجدداً.' : language === 'fr' ? 'Position de fin indisponible. Gardez le trajet ouvert et réessayez.' : 'Eindlocatie niet beschikbaar. Houd de rit open en probeer opnieuw.');
      const actualDistance = selectedRideType === 'INTERNAL' ? meterRef.current.distanceKm : 0;
      const endTime = new Date();
      const actualDuration = Math.floor((endTime.getTime() - new Date(tripData.startTime).getTime()) / 60000);
      const tripPayload: any = {
        completion_request_key: tripData.completionRequestKey,
        start_time: tripData.startTime, end_time: endTime.toISOString(),
        start_lat: tripData.startLat, start_lon: tripData.startLon,
        end_lat: endLoc?.lat ?? tripData.startLat, end_lon: endLoc?.lon ?? tripData.startLon,
        start_address: tripData.startAddress, end_address: tripData.endAddress,
        distance_km: parseFloat(actualDistance.toFixed(2)), duration_minutes: actualDuration,
        price: priceValue, passenger_name: tripData.passengerName || null,
        payment_method: tripData.paymentMethod, ride_type: tripData.rideType,
        external_source: tripData.externalSource || null, external_ride_number: tripData.externalRideNumber || null, currency: 'EUR',
      };
      if (selectedRideType === 'INTERNAL') {
        tripPayload.estimated_distance_km = estimatedDistance; tripPayload.estimated_duration_min = estimatedDuration;
        tripPayload.initial_proposed_price = tripData.proposedPrice;
        tripPayload.driver_adjusted_price = priceValue !== tripData.proposedPrice ? priceValue : null;
        tripPayload.actual_distance_km = parseFloat(actualDistance.toFixed(2)); tripPayload.actual_duration_minutes = actualDuration;
      }
      await persistenceRef.current;
      await tripJournal().complete(user.sub, tripPayload);
      stopWatching();
      activeTripRef.current = null;
      setPendingTrips((await tripJournal().list(user.sub, 'completed')).length);
      toast.success(language === 'ar' ? 'انتهت الرحلة وحُفظت بأمان على هذا الجهاز' : language === 'fr' ? 'Trajet terminé et enregistré sur cet appareil' : 'Rit beëindigd en op dit apparaat opgeslagen');
      setTripActive(false); setTripData(null); setStartAddress(''); setEndAddress('');
      setPassengerName(''); setProposedPrice(''); setFinalPrice(''); setPaymentMethod('');
      setExternalRideNumber(''); setShowEndTripDialog(false); setEstimatedDistance(0);
      setEstimatedDuration(0); setLocationHistory([]); setActualTripDistance(0);
      locationHistoryRef.current = []; setSelectedRideType('INTERNAL'); setRouteCoords(null);
      void syncPendingTrips();
    } catch (error: any) {
      toast.error(error.message || (language === 'nl' ? 'Rit beëindigen mislukt' : language === 'ar' ? 'فشل إنهاء الرحلة' : 'Échec de la fin du trajet'));
    }
    finally { endingRef.current = false; setLoading(false); }
  };

  const generateInvoice = async () => {
    if (!completedTripId) return;
    setGeneratingInvoice(true);
    try {
      const response = await fetch(`/next_api/trips/generate-invoice?id=${completedTripId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      if (!response.ok) throw new Error('Failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `Factuur-Rit-${completedTripId}.pdf`;
      document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url); document.body.removeChild(a);
      toast.success(language === 'nl' ? 'Factuur gegenereerd' : language === 'ar' ? 'تم إنشاء الفاتورة' : 'Facture générée');
      router.push('/driver/trips');
    } catch (error: any) {
      toast.error(language === 'nl' ? 'Factuur genereren mislukt' : language === 'ar' ? 'فشل إنشاء الفاتورة' : 'Échec de la génération de la facture');
    }
    finally { setGeneratingInvoice(false); }
  };

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void (async () => {
      try {
        // Legacy unscoped drafts cannot be assigned safely to the signed-in driver.
        if (sessionStorage.getItem('active_trip') || sessionStorage.getItem('offline_trips')) {
          toast.warning(language === 'ar' ? 'يوجد حفظ قديم على هذا الجهاز؛ راجعه قبل مسح بيانات المتصفح' : language === 'fr' ? 'Anciennes données locales présentes : vérifiez-les avant de les effacer' : 'Oude lokale gegevens aanwezig: controleer ze voordat u browsergegevens wist');
        }
        const saved = (await tripJournal().list<SavedTrip>(user.sub, 'active'))[0];
        const queued = await tripJournal().list(user.sub, 'completed');
        if (cancelled) return;
        setPendingTrips(queued.length);
        if (saved && !activeTripRef.current) {
          const parsed = saved.trip;
          activeTripRef.current = parsed; meterRef.current = saved.meter;
          setActualTripDistance(saved.meter.distanceKm);
          setEstimatedDistance(saved.estimatedDistance); setEstimatedDuration(saved.estimatedDuration);
          setTripData(parsed); setTripActive(true); setStartAddress(parsed.startAddress);
          setEndAddress(parsed.endAddress); setPassengerName(parsed.passengerName || '');
          setPaymentMethod(parsed.paymentMethod || '');
          setSelectedRideType(parsed.rideType === 'INTERNAL' ? 'INTERNAL' : parsed.externalSource || 'INTERNAL');
          setExternalRideNumber(parsed.externalRideNumber || '');
          toast.info(language === 'nl' ? 'Actieve rit hersteld' : language === 'ar' ? 'تم استعادة الرحلة النشطة' : 'Trajet actif restauré');
        }
        setStorageReady(true); void syncPendingTrips();
      } catch { if (!cancelled) setStorageError(true); }
    })();
    return () => { cancelled = true; };
  }, [user?.sub]);

  useEffect(() => {
    if (tripActive && tripData && selectedRideType === 'INTERNAL') {
      const interval = setInterval(() => {
        const durationMinutes = Math.floor((new Date().getTime() - new Date(tripData.startTime).getTime()) / 60000);
        setTripData((prev) => prev ? { ...prev, distance: actualTripDistance, duration: durationMinutes } : null);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [tripActive, tripData, actualTripDistance, selectedRideType]);

  if (authLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#d4af37' }} />
    </div>
  );

  const getRideTypeIcon = (type: RideType) => {
    if (type === 'INTERNAL') return '🚕';
    const logos: Record<string, string> = {
      BOLT: 'https://cdn.chat2db-ai.com/app/avatar/custom/5f60f0fd-af42-4c41-a03c-bdadd3c76192_737955.png',
      UBER: 'https://cdn.chat2db-ai.com/app/avatar/custom/929e3ada-5005-48d4-94cd-a3b6aa38da4e_737955.png',
      HEETCH: 'https://cdn.chat2db-ai.com/app/avatar/custom/7e5a93dc-6d4e-44a9-b77a-790bb10c795c_737955.png',
    };
    return <div className="w-10 h-10 relative"><Image src={logos[type]} alt={type} width={40} height={40} className="object-contain" /></div>;
  };

  const isExternalRide = selectedRideType !== 'INTERNAL';

  const inputStyle = {
    background: 'rgba(10,15,30,0.7)',
    border: '1px solid rgba(212,175,55,0.2)',
    color: 'white',
    borderRadius: '1rem',
    height: '52px',
  };

  const labelStyle = {
    color: 'rgba(212,175,55,0.85)',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">

      {(pendingTrips > 0 || storageError) && (
        <div role="status" className="mb-4 rounded-2xl border border-amber-500/40 bg-amber-950/40 p-4 text-amber-100">
          {storageError
            ? (language === 'ar' ? 'تعذّر حفظ الرحلة على الجهاز. لا تغلق التطبيق؛ تحقق من مساحة التخزين.' : language === 'fr' ? 'Enregistrement local indisponible. Gardez cette page ouverte et vérifiez le stockage.' : 'Lokaal opslaan niet beschikbaar. Houd deze pagina open en controleer de opslag.')
            : (language === 'ar' ? `${pendingTrips} رحلة محفوظة على هذا الجهاز بانتظار الإرسال. لا تمسح بيانات التطبيق.` : language === 'fr' ? `${pendingTrips} trajet(s) à envoyer. Ne supprimez pas les données de l’application.` : `${pendingTrips} rit(ten) wachten op verzending. Wis de appgegevens niet.`)}
          {pendingTrips > 0 && <Button className="mt-2" onClick={() => void syncPendingTrips()} disabled={!isOnline || syncingTrips}>
            {language === 'ar' ? 'إعادة محاولة المزامنة' : language === 'fr' ? 'Réessayer la synchronisation' : 'Synchronisatie opnieuw proberen'}
          </Button>}
        </div>
      )}

      {/* Daily Earnings Card */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, type: 'spring' }}>
        <GlassCard className="p-6 mb-6 overflow-hidden relative" style={{ border: '1px solid rgba(212,175,55,0.25)' }}>
          <motion.div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl" style={{ background: 'rgba(212,175,55,0.1)', marginRight: '-5rem', marginTop: '-5rem' }} animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <TrendingUp className="w-5 h-5" style={{ color: '#d4af37' }} />
              </motion.div>
              <span className="text-sm font-semibold" style={{ color: 'rgba(212,175,55,0.85)' }}>{t.dailyEarnings}</span>
              <Sparkles className="w-4 h-4 ml-auto animate-pulse" style={{ color: '#ffd700' }} />
            </div>
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
              className="text-5xl font-black mb-1 tracking-tight"
              style={{ background: 'linear-gradient(90deg, #b8860b, #d4af37, #ffd700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              €{dailyEarnings.toFixed(2)}
            </motion.div>
            <p className="text-sm font-medium" style={{ color: 'rgba(212,175,55,0.75)' }}>{t.today}</p>
          </div>
        </GlassCard>
      </motion.div>

      {/* Alerts */}
      <AnimatePresence>
        {(!isOnline || (gpsError && !isExternalRide)) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <GlassCard className="p-4 mb-6" style={{ border: '1px solid rgba(234,179,8,0.35)' }}>
              <div className="space-y-3">
                {!isOnline && (
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <p className="text-sm font-medium text-yellow-300">{t.noInternet}</p>
                  </div>
                )}
                {gpsError && !isExternalRide && (
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-medium text-yellow-300">{gpsError}</p>
                    </div>
                    <Button onClick={() => getLocation(true)} variant="outline" size="sm" className="w-full rounded-xl border-yellow-500/30 text-yellow-400 bg-yellow-500/10">
                      <RefreshCw className="w-4 h-4 mr-2" />{t.retryLocation}
                    </Button>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completed Trip Invoice */}
      <AnimatePresence>
        {completedTripId && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
            <GlassCard className="p-6 mb-6" style={{ border: '1px solid rgba(34,197,94,0.35)' }}>
              <div className="text-center">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)' }}
                >
                  <FileText className="w-8 h-8 text-green-400" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">{t.tripCompleted}</h3>
                <p className="text-sm mb-6" style={{ color: 'rgba(212,175,55,0.8)' }}>
                  {language === 'nl' ? 'Wilt u een factuur genereren voor deze rit?' : language === 'ar' ? 'هل تريد إنشاء فاتورة لهذه الرحلة؟' : 'Voulez-vous générer une facture pour ce trajet?'}
                </p>
                <div className="flex gap-3">
                  <button onClick={() => { setCompletedTripId(null); router.push('/driver/trips'); }}
                    className="flex-1 h-12 rounded-2xl font-bold text-sm transition-all"
                    style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', color: 'rgba(212,175,55,0.9)' }}
                  >{t.later}</button>
                  <button onClick={generateInvoice} disabled={generatingInvoice}
                    className="flex-1 h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: 'white' }}
                  >
                    {generatingInvoice ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                    {t.generateInvoice}
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {!tripActive ? (
        <>
          {/* Ride Type Selection */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <GlassCard className="p-5 mb-5">
              <h3 className="text-sm font-bold mb-4" style={labelStyle}>{t.selectRideType}</h3>
              <div className="grid grid-cols-2 gap-3">
                {(['INTERNAL', 'BOLT', 'UBER', 'HEETCH'] as RideType[]).map((type) => (
                  <motion.button key={type} onClick={() => setSelectedRideType(type)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    className="p-4 rounded-2xl transition-all"
                    style={selectedRideType === type
                      ? { background: 'linear-gradient(135deg, rgba(212,175,55,0.22), rgba(184,142,4,0.18))', border: '1px solid rgba(212,175,55,0.45)', boxShadow: '0 0 20px rgba(212,175,55,0.2)' }
                      : { background: 'rgba(10,15,30,0.5)', border: '1px solid rgba(212,175,55,0.12)' }
                    }
                  >
                    <div className="mb-2 flex items-center justify-center">{getRideTypeIcon(type)}</div>
                    <div className="font-bold text-sm" style={{ color: selectedRideType === type ? '#ffd700' : 'rgba(255,255,255,0.85)' }}>
                      {type === 'INTERNAL' ? t.taxi : type.charAt(0) + type.slice(1).toLowerCase()}
                    </div>
                    <div className="text-xs mt-1" style={{ color: selectedRideType === type ? 'rgba(212,175,55,0.8)' : 'rgba(255,255,255,0.55)' }}>
                      {type === 'INTERNAL' ? t.internalRide : t.externalRide}
                    </div>
                  </motion.button>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Trip Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <GlassCard className="p-5 mb-5">
              <div className="space-y-4">
                {!isExternalRide && (
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <label style={labelStyle}>{t.startAddress}</label>
                      {gpsIsLocating && <span className="text-xs text-blue-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />GPS...</span>}
                      {currentLocation && gpsAccuracy !== null && !gpsIsLocating && (
                        <span className="text-xs text-green-400 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />±{Math.round(gpsAccuracy)}m</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(212,175,55,0.6)' }} />
                        {(startSearch.isSearching || isReverseGeocoding) && <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 animate-spin" />}
                        <input value={startAddress} onChange={(e) => { setStartAddress(e.target.value); startSearch.search(e.target.value); setShowStartSuggestions(true); }}
                          onFocus={() => setShowStartSuggestions(true)} onBlur={() => setTimeout(() => setShowStartSuggestions(false), 200)}
                          placeholder={t.enterStartAddress} className="w-full pr-10 pl-4 text-sm outline-none transition-all"
                          style={{ ...inputStyle, color: 'white' }}
                        />
                      </div>
                      <GpsLocationButton onLocationFound={handleGpsLocationFound} language={language} size="md" />
                    </div>
                    <AnimatePresence>
                      {showStartSuggestions && startSearch.suggestions.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                          className="absolute z-10 w-full mt-2 rounded-2xl overflow-hidden max-h-60 overflow-y-auto"
                          style={{ background: 'rgba(5,10,20,0.98)', border: '1px solid rgba(212,175,55,0.25)', backdropFilter: 'blur(20px)' }}
                        >
                          {startSearch.suggestions.map((addr, idx) => (
                            <button key={idx} onMouseDown={() => { setStartAddress(addr.display_name); startSearch.clear(); setShowStartSuggestions(false); }}
                              className="w-full px-4 py-3 text-sm text-left transition-colors hover:bg-yellow-500/10 border-b border-white/5 last:border-b-0"
                              style={{ color: 'rgba(255,255,255,0.9)' }}
                            >
                              <div className="flex justify-between items-center gap-2">
                                <span className="flex-1 truncate">{addr.display_name}</span>
                                {addr.distance !== undefined && <span className="text-xs shrink-0" style={{ color: 'rgba(212,175,55,0.7)' }}>{addr.distance.toFixed(1)} km</span>}
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {!isExternalRide && (
                  <div className="relative">
                    <label className="block mb-2" style={labelStyle}>{t.endAddress}</label>
                    <div className="relative">
                      <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(239,68,68,0.7)' }} />
                      {endSearch.isSearching && <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-pulse" />}
                      <input value={endAddress} onChange={(e) => { setEndAddress(e.target.value); endSearch.search(e.target.value); setShowEndSuggestions(true); }}
                        onFocus={() => setShowEndSuggestions(true)} onBlur={() => setTimeout(() => setShowEndSuggestions(false), 200)}
                        placeholder={t.enterEndAddress} className="w-full pr-10 pl-4 text-sm outline-none transition-all"
                        style={{ ...inputStyle, color: 'white' }}
                      />
                    </div>
                    <AnimatePresence>
                      {showEndSuggestions && endSearch.suggestions.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                          className="absolute z-10 w-full mt-2 rounded-2xl overflow-hidden max-h-60 overflow-y-auto"
                          style={{ background: 'rgba(5,10,20,0.98)', border: '1px solid rgba(212,175,55,0.25)', backdropFilter: 'blur(20px)' }}
                        >
                          {endSearch.suggestions.map((addr, idx) => (
                            <button key={idx} onMouseDown={() => { setEndAddress(addr.display_name); endSearch.clear(); setShowEndSuggestions(false); }}
                              className="w-full px-4 py-3 text-sm text-left transition-colors hover:bg-red-500/10 border-b border-white/5 last:border-b-0"
                              style={{ color: 'rgba(255,255,255,0.9)' }}
                            >
                              <div className="flex justify-between items-center gap-2">
                                <span className="flex-1 truncate">{addr.display_name}</span>
                                {addr.distance !== undefined && <span className="text-xs shrink-0" style={{ color: 'rgba(212,175,55,0.7)' }}>{addr.distance.toFixed(1)} km</span>}
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <div>
                  <label className="block mb-2" style={labelStyle}>{t.passengerName}</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(212,175,55,0.6)' }} />
                    <input value={passengerName} onChange={(e) => setPassengerName(e.target.value)} placeholder={t.enterPassengerName}
                      className="w-full pr-10 pl-4 text-sm outline-none" style={{ ...inputStyle, color: 'white' }}
                    />
                  </div>
                </div>

                {isExternalRide && (
                  <div>
                    <label className="block mb-2" style={labelStyle}>{t.externalRideNumber}</label>
                    <div className="relative">
                      <FileText className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(212,175,55,0.6)' }} />
                      <input value={externalRideNumber} onChange={(e) => setExternalRideNumber(e.target.value)} placeholder={t.enterExternalRideNumber}
                        className="w-full pr-10 pl-4 text-sm outline-none" style={{ ...inputStyle, color: 'white' }}
                      />
                    </div>
                  </div>
                )}

                {!isExternalRide && (
                  <div>
                    <label className="block mb-2" style={labelStyle}>{t.paymentMethod}</label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="rounded-2xl h-13 border-0" style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(212,175,55,0.2)', height: '52px', color: 'white' }}>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" style={{ color: 'rgba(212,175,55,0.7)' }} />
                          <SelectValue placeholder={t.selectPaymentMethod} />
                        </div>
                      </SelectTrigger>
                      <SelectContent style={{ background: 'rgba(5,10,20,0.98)', border: '1px solid rgba(212,175,55,0.25)' }}>
                        <SelectItem value="cash" style={{ color: 'white' }}>{t.cash}</SelectItem>
                        <SelectItem value="card" style={{ color: 'white' }}>{t.card}</SelectItem>
                        <SelectItem value="bancontact" style={{ color: 'white' }}>{t.bancontact}</SelectItem>
                        <SelectItem value="bank_transfer" style={{ color: 'white' }}>{t.bankTransfer}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* Calculate Price Button */}
          <GoldButton onClick={showPriceEstimate} disabled={loading || (!isExternalRide && !paymentMethod)}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
            {selectedRideType === 'INTERNAL' ? t.calculatePrice : t.startTrip}
            <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <ChevronRight className="w-5 h-5" />
            </motion.div>
          </GoldButton>

          {/* Price Proposal Bottom Sheet */}
          <BottomSheetModal
            isOpen={showPriceProposal}
            onClose={() => setShowPriceProposal(false)}
            title={
              <h3 className="text-xl font-bold" style={{ background: 'linear-gradient(90deg, #d4af37, #ffd700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {selectedRideType === 'INTERNAL' ? t.proposedPrice : t.startTrip}
              </h3>
            }
            actions={
              <>
                <button
                  onClick={() => setShowPriceProposal(false)}
                  className="flex-1 h-14 rounded-2xl font-bold text-sm transition-all"
                  style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', color: 'rgba(212,175,55,0.9)' }}
                >
                  {t.cancel}
                </button>
                <motion.button
                  onClick={startTrip}
                  disabled={loading || !storageReady || storageError}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.97 }}
                  className="flex-1 h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50 relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: 'white', boxShadow: '0 6px 20px rgba(34,197,94,0.5)' }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                    {t.startTrip}
                  </span>
                </motion.button>
              </>
            }
          >
            {routeCoords && selectedRideType === 'INTERNAL' && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Map className="w-3.5 h-3.5" style={{ color: '#d4af37' }} />
                    <span className="text-xs font-semibold" style={{ color: 'rgba(212,175,55,0.85)' }}>
                      {language === 'nl' ? 'Routekaart' : language === 'ar' ? 'خريطة المسار' : 'Carte du trajet'}
                    </span>
                  </div>
                  <button onClick={() => setShowMap((v) => !v)} className="text-xs font-medium transition-colors" style={{ color: '#d4af37' }}>
                    {showMap
                      ? (language === 'nl' ? 'Verbergen' : language === 'ar' ? 'إخفاء' : 'Masquer')
                      : (language === 'nl' ? 'Tonen' : language === 'ar' ? 'إظهار' : 'Afficher')}
                  </button>
                </div>
                <AnimatePresence>
                  {showMap && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                      <RouteMap startLat={routeCoords.startLat} startLon={routeCoords.startLon} endLat={routeCoords.endLat} endLon={routeCoords.endLon} language={language} height={140} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {selectedRideType === 'INTERNAL' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl" style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
                    <span className="text-xs block mb-1" style={{ color: 'rgba(212,175,55,0.85)' }}>{t.estimatedDistance}</span>
                    <span className="font-bold text-base text-white">{estimatedDistance.toFixed(1)} {t.km}</span>
                  </div>
                  <div className="p-3 rounded-2xl" style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
                    <span className="text-xs block mb-1" style={{ color: 'rgba(212,175,55,0.85)' }}>{t.estimatedDuration}</span>
                    <span className="font-bold text-base text-white">{estimatedDuration} {t.min}</span>
                  </div>
                </div>
                <div>
                  <label className="block mb-2 text-xs font-bold" style={{ color: 'rgba(212,175,55,0.85)' }}>{t.proposedPrice} (€)</label>
                  <div className="relative">
                    <Edit2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(212,175,55,0.6)' }} />
                    <input
                      type="number"
                      step="0.01"
                      value={proposedPrice}
                      onChange={(e) => setProposedPrice(e.target.value)}
                      className="w-full pr-10 pl-4 text-2xl font-black outline-none"
                      style={{ ...inputStyle, height: '56px', color: 'white' }}
                    />
                  </div>
                </div>

                {endAddress && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <NavigateButton
                      address={endAddress}
                      label={t.navigateToDestination}
                      language={language}
                    />
                  </motion.div>
                )}
              </div>
            )}

            {isExternalRide && (
              <div className="py-4 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)' }}>
                  <Play className="w-8 h-8" style={{ color: '#d4af37' }} />
                </div>
                <p className="text-sm font-medium" style={{ color: 'rgba(212,175,55,0.85)' }}>
                  {language === 'nl' ? 'Klaar om de rit te starten' : language === 'ar' ? 'جاهز لبدء الرحلة' : 'Prêt à démarrer le trajet'}
                </p>
              </div>
            )}
          </BottomSheetModal>
        </>
      ) : (
        <>
          {/* Active Trip Card */}
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
            <GlassCard className="p-8 mb-6 overflow-hidden relative" style={{ border: '1px solid rgba(212,175,55,0.3)' }}>
              <motion.div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl" style={{ background: 'rgba(212,175,55,0.12)', marginRight: '-6rem', marginTop: '-6rem' }} animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />
              <div className="relative z-10 text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-3 h-3 rounded-full" style={{ background: '#d4af37', boxShadow: '0 0 8px rgba(212,175,55,1)' }} />
                  <span className="text-sm font-bold" style={{ color: 'rgba(212,175,55,0.9)' }}>{t.tripActive}</span>
                  <span className="flex items-center justify-center">{getRideTypeIcon(selectedRideType)}</span>
                </div>
                {selectedRideType === 'INTERNAL' ? (
                  <motion.p animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 2, repeat: Infinity }}
                    className="text-6xl font-black mb-4 tracking-tight"
                    style={{ background: 'linear-gradient(90deg, #b8860b, #d4af37, #ffd700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                  >
                    €{tripData?.proposedPrice.toFixed(2) || '0.00'}
                  </motion.p>
                ) : (
                  <motion.p animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl font-black mb-4 tracking-tight text-white">
                    {selectedRideType}
                  </motion.p>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedRideType === 'INTERNAL' && (
                    <>
                      <div className="flex items-center justify-center gap-2 rounded-2xl p-3" style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)' }}>
                        <Navigation className="w-4 h-4" style={{ color: '#d4af37' }} />
                        <span className="font-bold text-white">{actualTripDistance.toFixed(2)} {t.km}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 rounded-2xl p-3" style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)' }}>
                        <Clock className="w-4 h-4" style={{ color: '#d4af37' }} />
                        <span className="font-bold text-white">{tripData?.duration || 0} {t.min}</span>
                      </div>
                    </>
                  )}
                  {selectedRideType !== 'INTERNAL' && (
                    <div className="col-span-2 flex items-center justify-center gap-2 rounded-2xl p-3" style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)' }}>
                      <Clock className="w-4 h-4" style={{ color: '#d4af37' }} />
                      <span className="font-bold text-white">{tripData?.duration || 0} {t.min}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedRideType === 'INTERNAL' && tripData?.endAddress && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="relative z-10 mt-2"
                >
                  <NavigateButton
                    address={tripData.endAddress}
                    label={t.navigateToDestination}
                    language={language}
                  />
                </motion.div>
              )}
            </GlassCard>
          </motion.div>

          {/* End Trip Button */}
          <GoldButton onClick={showEndDialog} disabled={loading} variant="danger">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Square className="w-5 h-5" />}
            {t.endTrip}
          </GoldButton>
        </>
      )}

      {/* End Trip Bottom Sheet */}
      <BottomSheetModal
        isOpen={showEndTripDialog}
        onClose={() => setShowEndTripDialog(false)}
        title={<h3 className="text-xl font-bold text-red-400">{t.confirmEndTrip}</h3>}
        actions={
          <>
            <button
              onClick={() => setShowEndTripDialog(false)}
              disabled={loading}
              className="flex-1 h-14 rounded-2xl font-bold text-sm transition-all disabled:opacity-50"
              style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', color: 'rgba(212,175,55,0.9)' }}
            >
              {t.cancel}
            </button>
            <motion.button
              onClick={endTrip}
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
              className="flex-1 h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #b8860b, #d4af37)', color: '#1a1200', boxShadow: '0 6px 20px rgba(212,175,55,0.5)' }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
              />
              <span className="relative z-10 flex items-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {t.sendToChiron}
              </span>
            </motion.button>
          </>
        }
      >
        <div className="space-y-4">
          {selectedRideType === 'INTERNAL' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl" style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
                <span className="text-xs block mb-1" style={{ color: 'rgba(212,175,55,0.85)' }}>{t.traveledDistance}</span>
                <span className="font-bold text-base text-white">{actualTripDistance.toFixed(2)} {t.km}</span>
              </div>
              <div className="p-3 rounded-2xl" style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
                <span className="text-xs block mb-1" style={{ color: 'rgba(212,175,55,0.85)' }}>{t.duration}</span>
                <span className="font-bold text-base text-white">{tripData?.duration} {t.min}</span>
              </div>
            </div>
          )}
          <div>
            <label className="block mb-2 text-xs font-bold" style={{ color: 'rgba(212,175,55,0.85)' }}>{t.finalPrice} (€)</label>
            <input
              type="number"
              step="0.01"
              value={finalPrice}
              onChange={(e) => setFinalPrice(e.target.value)}
              placeholder={selectedRideType !== 'INTERNAL' ? t.enterFinalPrice : ''}
              className="w-full px-4 text-2xl font-black outline-none"
              style={{ ...inputStyle, height: '56px', color: 'white' }}
            />
          </div>
        </div>
      </BottomSheetModal>

      {/* Pricing Info */}
      {pricingConfig && selectedRideType === 'INTERNAL' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard className="p-5 mt-5">
            <h3 className="text-xs font-bold mb-4" style={{ color: 'rgba(212,175,55,0.85)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t.pricingInfo} — {pricingConfig.company_name}
            </h3>
            <div className="space-y-2 text-sm">
              {[
                { label: t.baseFee, value: pricingConfig.pricing.base_fee },
                { label: t.pricePerKm, value: pricingConfig.pricing.km_rate },
                { label: t.pricePerMinute, value: pricingConfig.pricing.minute_rate },
                { label: t.minimumFare, value: pricingConfig.pricing.minimum_fare },
              ].map((item, i) => (
                <div key={i} className="flex justify-between p-2 rounded-xl transition-colors hover:bg-yellow-500/5">
                  <span style={{ color: 'rgba(212,175,55,0.75)' }}>{item.label}</span>
                  <span className="font-bold text-white">€{item.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}
