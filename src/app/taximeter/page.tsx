
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  DollarSign,
  Play,
  Square,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';

interface TripData {
  completionRequestKey: string;
  startLat: number;
  startLon: number;
  startAddress: string;
  startTime: Date;
  distance: number;
  duration: number;
  price: number;
}

export default function TaximeterPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [tripActive, setTripActive] = useState(false);
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [currentLat, setCurrentLat] = useState<number | null>(null);
  const [currentLon, setCurrentLon] = useState<number | null>(null);
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Pricing configuration
  const START_FEE = 2.40;
  const PRICE_PER_KM = 1.80;
  const WAITING_FEE_PER_MIN = 0.50;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Get current GPS position
  const getCurrentPosition = useCallback((): Promise<{ lat: number; lon: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('الموقع الجغرافي غير مدعوم في هذا المتصفح'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          reject(new Error('فشل الحصول على الموقع الحالي'));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }, []);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Calculate price
  const calculatePrice = useCallback((distance: number, duration: number): number => {
    const waitingMinutes = Math.max(0, duration - (distance / 30 * 60)); // Assuming 30 km/h average speed
    return START_FEE + (distance * PRICE_PER_KM) + (waitingMinutes * WAITING_FEE_PER_MIN);
  }, []);

  // Search Belgian addresses
  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?countrycodes=be&format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      setAddressSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Operation failed");
    }
  };

  // Start trip
  const handleStartTrip = async () => {
    try {
      const position = await getCurrentPosition();
      
      const newTripData: TripData = {
        completionRequestKey: crypto.randomUUID(),
        startLat: position.lat,
        startLon: position.lon,
        startAddress: startAddress || 'موقع غير محدد',
        startTime: new Date(),
        distance: 0,
        duration: 0,
        price: START_FEE
      };

      setTripData(newTripData);
      setCurrentLat(position.lat);
      setCurrentLon(position.lon);
      setTripActive(true);
      toast.success('تم بدء الرحلة بنجاح');
    } catch (error: any) {
      toast.error(error.message || 'فشل بدء الرحلة');
    }
  };

  // End trip
  const handleEndTrip = async () => {
    if (!tripData) return;

    try {
      const position = await getCurrentPosition();
      const distance = calculateDistance(
        tripData.startLat,
        tripData.startLon,
        position.lat,
        position.lon
      );
      const duration = Math.floor((new Date().getTime() - tripData.startTime.getTime()) / 1000 / 60);
      const price = calculatePrice(distance, duration);

      // Send trip to backend
      await api.post('/trips/end', {
        completion_request_key: tripData.completionRequestKey,
        ride_type: 'INTERNAL',
        start_lat: tripData.startLat,
        start_lon: tripData.startLon,
        end_lat: position.lat,
        end_lon: position.lon,
        start_address: tripData.startAddress,
        end_address: endAddress || 'موقع غير محدد',
        distance_km: distance,
        duration_minutes: duration,
        price: price,
        start_fee: START_FEE,
        price_per_km: PRICE_PER_KM
      });

      toast.success(`تم إنهاء الرحلة - المبلغ: €${price.toFixed(2)}`);
      
      // Reset
      setTripActive(false);
      setTripData(null);
      setStartAddress('');
      setEndAddress('');
      
      // Redirect to trips history
      router.push('/trips');
    } catch (error: any) {
      toast.error(error.message || 'فشل إنهاء الرحلة');
    }
  };

  // Update trip data in real-time
  useEffect(() => {
    if (!tripActive || !tripData) return;

    const interval = setInterval(async () => {
      try {
        const position = await getCurrentPosition();
        const distance = calculateDistance(
          tripData.startLat,
          tripData.startLon,
          position.lat,
          position.lon
        );
        const duration = Math.floor((new Date().getTime() - tripData.startTime.getTime()) / 1000 / 60);
        const price = calculatePrice(distance, duration);

        setTripData(prev => prev ? {
          ...prev,
          distance,
          duration,
          price
        } : null);
        setCurrentLat(position.lat);
        setCurrentLon(position.lon);
      } catch (error) {
        console.error("Operation failed");
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [tripActive, tripData, getCurrentPosition, calculateDistance, calculatePrice]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-2xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              العداد الرقمي
            </h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Meter Display */}
        <Card className="p-8 rounded-3xl border-0 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 mb-8">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl mb-6 ${
              tripActive 
                ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/30' 
                : 'bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-800'
            }`}>
              <div className={`w-3 h-3 rounded-full ${tripActive ? 'bg-white animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-white font-semibold">
                {tripActive ? 'رحلة نشطة' : 'في الانتظار'}
              </span>
            </div>

            <div className="mb-8">
              <div className="text-7xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                €{tripData?.price.toFixed(2) || '0.00'}
              </div>
              <p className="text-slate-600 dark:text-slate-400">المبلغ الإجمالي</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Navigation className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {tripData?.distance.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">كم</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {tripData?.duration || '0'}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">دقيقة</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {PRICE_PER_KM.toFixed(2)}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">€/كم</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Address Inputs */}
        {!tripActive && (
          <Card className="p-6 rounded-3xl border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 mb-8">
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  عنوان البداية (اختياري)
                </label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    value={startAddress}
                    onChange={(e) => {
                      setStartAddress(e.target.value);
                      searchAddress(e.target.value);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="ابحث عن عنوان في بلجيكا..."
                    className="pr-12 rounded-2xl border-slate-200 dark:border-slate-700"
                  />
                </div>
                {showSuggestions && addressSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto">
                    {addressSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setStartAddress(suggestion.display_name);
                          setShowSuggestions(false);
                          setAddressSuggestions([]);
                        }}
                        className="w-full text-right px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0"
                      >
                        <p className="text-sm text-slate-900 dark:text-white">{suggestion.display_name}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {tripActive && (
          <Card className="p-6 rounded-3xl border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  عنوان النهاية (اختياري)
                </label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    value={endAddress}
                    onChange={(e) => {
                      setEndAddress(e.target.value);
                      searchAddress(e.target.value);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="ابحث عن عنوان في بلجيكا..."
                    className="pr-12 rounded-2xl border-slate-200 dark:border-slate-700"
                  />
                </div>
                {showSuggestions && addressSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto">
                    {addressSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setEndAddress(suggestion.display_name);
                          setShowSuggestions(false);
                          setAddressSuggestions([]);
                        }}
                        className="w-full text-right px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0"
                      >
                        <p className="text-sm text-slate-900 dark:text-white">{suggestion.display_name}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>عنوان البداية:</strong> {tripData?.startAddress}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Control Buttons */}
        <div className="space-y-4">
          {!tripActive ? (
            <Button
              onClick={handleStartTrip}
              className="w-full h-16 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg shadow-xl shadow-green-500/30"
            >
              <Play className="w-6 h-6 ml-2" />
              بدء الرحلة
            </Button>
          ) : (
            <Button
              onClick={handleEndTrip}
              className="w-full h-16 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-lg shadow-xl shadow-red-500/30"
            >
              <Square className="w-6 h-6 ml-2" />
              إنهاء الرحلة
            </Button>
          )}
        </div>

        {/* Pricing Info */}
        <Card className="p-6 rounded-3xl border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 mt-8">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">معلومات التسعير</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">رسوم البداية</span>
              <span className="font-semibold text-slate-900 dark:text-white">€{START_FEE.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">السعر لكل كيلومتر</span>
              <span className="font-semibold text-slate-900 dark:text-white">€{PRICE_PER_KM.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">رسوم الانتظار (دقيقة)</span>
              <span className="font-semibold text-slate-900 dark:text-white">€{WAITING_FEE_PER_MIN.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
