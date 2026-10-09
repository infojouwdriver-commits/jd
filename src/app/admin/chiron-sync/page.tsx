
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';

interface FailedTrip {
  id: number;
  start_time: string;
  end_time: string;
  start_address: string;
  end_address: string;
  distance_km: number;
  price: number;
  chiron_trip_id: string | null;
  chiron_sync_attempts: number;
  sync_error_message: string;
  last_sync_attempt: string;
}

export default function ChironSyncPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [failedTrips, setFailedTrips] = useState<FailedTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
    if (!isLoading && user?.role !== 'app20251225073911jaqqaxdfir_v1_admin_user') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const fetchFailedTrips = async () => {
    setLoading(true);
    try {
      const allTrips = await api.get<FailedTrip[]>('/trips');
      const failed = allTrips.filter(trip => trip.chiron_sync_attempts > 0 && !trip.chiron_trip_id);
      setFailedTrips(failed);
    } catch (error: any) {
      toast.error(error.message || 'فشل تحميل الرحلات الفاشلة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'app20251225073911jaqqaxdfir_v1_admin_user') {
      fetchFailedTrips();
    }
  }, [user]);

  const handleRetry = async (tripId: number) => {
    setRetrying(tripId);
    try {
      await api.post('/trips/retry-sync', { trip_id: tripId });
      toast.success('تم إعادة محاولة المزامنة بنجاح');
      fetchFailedTrips();
    } catch (error: any) {
      toast.error(error.message || 'فشلت إعادة المحاولة');
    } finally {
      setRetrying(null);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== 'app20251225073911jaqqaxdfir_v1_admin_user') {
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
              إعادة مزامنة Chiron
            </h1>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-2xl"
              onClick={fetchFailedTrips}
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 rounded-3xl border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">رحلات فاشلة</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{failedTrips.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                <XCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-3xl border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">محاولات إجمالية</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {failedTrips.reduce((sum, trip) => sum + trip.chiron_sync_attempts, 0)}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <RefreshCw className="w-7 h-7 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-3xl border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">تحتاج إعادة محاولة</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {failedTrips.filter(t => t.chiron_sync_attempts < 3).length}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                <AlertCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Failed Trips List */}
        <div className="space-y-4">
          {failedTrips.length === 0 ? (
            <Card className="p-12 rounded-3xl border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
              <div className="text-center">
                <div className="w-20 h-20 rounded-3xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  رائع! لا توجد رحلات فاشلة
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  جميع الرحلات تمت مزامنتها بنجاح مع Chiron
                </p>
              </div>
            </Card>
          ) : (
            failedTrips.map((trip) => (
              <Card 
                key={trip.id}
                className="p-6 rounded-3xl border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                      <XCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 dark:text-white">
                          رحلة #{trip.id}
                        </span>
                        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">
                          {trip.chiron_sync_attempts} محاولات
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(trip.start_time).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      €{trip.price.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">من</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {trip.start_address || 'موقع غير محدد'}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">إلى</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {trip.end_address || 'موقع غير محدد'}
                    </p>
                  </div>

                  {trip.sync_error_message && (
                    <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <p className="text-xs text-red-600 dark:text-red-400 mb-1">رسالة الخطأ</p>
                      <p className="text-sm text-red-900 dark:text-red-100">
                        {trip.sync_error_message}
                      </p>
                    </div>
                  )}

                  {trip.last_sync_attempt && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>
                        آخر محاولة: {new Date(trip.last_sync_attempt).toLocaleString('ar-SA')}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => handleRetry(trip.id)}
                  disabled={retrying === trip.id}
                  className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600"
                >
                  {retrying === trip.id ? (
                    <>
                      <RefreshCw className="w-5 h-5 ml-2 animate-spin" />
                      جاري إعادة المحاولة...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5 ml-2" />
                      إعادة المحاولة
                    </>
                  )}
                </Button>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
