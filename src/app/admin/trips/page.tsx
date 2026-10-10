
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  MapPin, 
  Clock, 
  Navigation,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Pencil,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';

interface Trip {
  id: number;
  start_time: string;
  end_time: string;
  start_address: string;
  end_address: string;
  distance_km: number;
  duration_minutes: number;
  price: number;
  status: string;
  chiron_trip_id: string | null;
  chiron_sync_attempts: number;
  payment_method: string | null;
}

export default function AdminTripsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Edit price dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [savingPrice, setSavingPrice] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
    if (!isLoading && user && !user.isAdmin) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<Trip[]>('/trips');
      setTrips(data);
    } catch (error: any) {
      toast.error(error.message || 'فشل تحميل الرحلات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.isAdmin === true) {
      fetchTrips();
    }
  }, [user, fetchTrips]);

  const openEditDialog = (trip: Trip) => {
    setEditingTrip(trip);
    setNewPrice(trip.price.toFixed(2));
    setEditDialogOpen(true);
  };

  const handleSavePrice = async () => {
    if (!editingTrip) return;

    const parsed = parseFloat(newPrice);
    if (isNaN(parsed) || parsed < 0) {
      toast.error('يرجى إدخال سعر صالح');
      return;
    }

    setSavingPrice(true);
    try {
      await api.put(`/trips?id=${editingTrip.id}`, { price: parsed });
      setTrips(prev =>
        prev.map(t => t.id === editingTrip.id ? { ...t, price: parsed } : t)
      );
      toast.success(`تم تعديل سعر الرحلة #${editingTrip.id} إلى €${parsed.toFixed(2)}`);
      setEditDialogOpen(false);
      setEditingTrip(null);
    } catch (error: any) {
      toast.error(error.message || 'فشل تعديل السعر');
    } finally {
      setSavingPrice(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
            <CheckCircle2 className="w-3 h-3 ml-1" />
            مكتملة
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-0">
            <AlertCircle className="w-3 h-3 ml-1" />
            قيد المزامنة
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">
            <XCircle className="w-3 h-3 ml-1" />
            فشلت
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-0">
            {status}
          </Badge>
        );
    }
  };

  const getPaymentMethodLabel = (method: string | null) => {
    if (!method) return null;
    const labels: Record<string, string> = {
      'cash': 'نقدي',
      'card': 'بطاقة',
      'bancontact': 'بانكونتاكت',
      'bank_transfer': 'تحويل بنكي'
    };
    return labels[method] || method;
  };

  const filteredTrips = trips.filter(trip => {
    const matchesFilter = filter === 'all' || 
      (filter === 'completed' && (trip.status === 'completed' || trip.status === 'success')) ||
      (filter !== 'completed' && trip.status === filter);
    const matchesSearch = 
      trip.start_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.end_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.id.toString().includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !user?.isAdmin) {
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
              إدارة الرحلات
            </h1>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-2xl"
              onClick={fetchTrips}
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث برقم الرحلة أو العنوان..."
              className="pr-12 rounded-2xl border-slate-200 dark:border-slate-700 h-12"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {(['all', 'completed', 'pending', 'failed'] as const).map((f) => (
            <Button
              key={f}
              onClick={() => setFilter(f)}
              variant={filter === f ? 'default' : 'outline'}
              className="rounded-2xl whitespace-nowrap"
            >
              {f === 'all' && `الكل (${trips.length})`}
              {f === 'completed' && `مكتملة (${trips.filter(t => t.status === 'completed' || t.status === 'success').length})`}
              {f === 'pending' && `قيد المزامنة (${trips.filter(t => t.status === 'pending').length})`}
              {f === 'failed' && `فشلت (${trips.filter(t => t.status === 'failed').length})`}
            </Button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'إجمالي الرحلات', value: trips.length, color: 'blue', icon: MapPin },
            { label: 'مكتملة', value: trips.filter(t => t.status === 'completed' || t.status === 'success').length, color: 'green', icon: CheckCircle2 },
            { label: 'قيد المزامنة', value: trips.filter(t => t.status === 'pending').length, color: 'yellow', icon: AlertCircle },
            { label: 'فشلت', value: trips.filter(t => t.status === 'failed').length, color: 'red', icon: XCircle },
          ].map(({ label, value, color, icon: Icon }) => (
            <Card key={label} className="p-5 rounded-3xl border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{label}</p>
                  <p className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400`}>{value}</p>
                </div>
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br from-${color}-500 to-${color}-600 flex items-center justify-center shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Trips List */}
        <div className="space-y-4">
          {filteredTrips.length === 0 ? (
            <Card className="p-12 rounded-3xl border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
              <div className="text-center">
                <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-10 h-10 text-slate-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400">لا توجد رحلات</p>
              </div>
            </Card>
          ) : (
            filteredTrips.map((trip) => (
              <Card 
                key={trip.id}
                className="p-6 rounded-3xl border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 dark:text-white">
                          رحلة #{trip.id}
                        </span>
                        {getStatusBadge(trip.status)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Calendar className="w-4 h-4" />
                        {new Date(trip.start_time).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Price + Edit button */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                      €{trip.price?.toFixed(2) ?? '0.00'}
                    </div>
                    {trip.payment_method && (
                      <p className="text-xs text-slate-500">
                        {getPaymentMethodLabel(trip.payment_method)}
                      </p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs gap-1 h-7 px-3 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
                      onClick={() => openEditDialog(trip)}
                    >
                      <Pencil className="w-3 h-3" />
                      تعديل السعر
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
                    <div className="w-8 h-8 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">نقطة البداية</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {trip.start_address || 'موقع غير محدد'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(trip.start_time).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
                    <div className="w-8 h-8 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">نقطة النهاية</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {trip.end_address || 'موقع غير محدد'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {trip.end_time ? new Date(trip.end_time).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Navigation className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs text-blue-600 dark:text-blue-400">المسافة</span>
                    </div>
                    <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      {trip.distance_km?.toFixed(2) ?? '0.00'} كم
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs text-purple-600 dark:text-purple-400">المدة</span>
                    </div>
                    <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                      {trip.duration_minutes ?? 0} دقيقة
                    </p>
                  </div>
                </div>

                {trip.chiron_trip_id && (
                  <div className="mt-4 p-3 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <p className="text-xs text-green-600 dark:text-green-400 mb-1">معرف Chiron</p>
                    <p className="text-sm font-mono text-green-900 dark:text-green-100">
                      {trip.chiron_trip_id}
                    </p>
                  </div>
                )}

                {trip.status === 'failed' && trip.chiron_sync_attempts > 0 && (
                  <div className="mt-4 p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-xs text-red-600 dark:text-red-400">
                      فشلت المزامنة بعد {trip.chiron_sync_attempts} محاولة
                    </p>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Edit Price Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-right">
              تعديل سعر الرحلة #{editingTrip?.id}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">السعر الحالي</p>
              <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">
                €{editingTrip?.price?.toFixed(2) ?? '0.00'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-price" className="text-right block">
                السعر الجديد (€)
              </Label>
              <Input
                id="new-price"
                type="number"
                step="0.01"
                min="0"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="0.00"
                className="rounded-2xl text-center text-lg font-bold h-12"
                autoFocus
              />
            </div>
          </div>

          <DialogFooter className="gap-2 flex-row-reverse">
            <Button
              onClick={handleSavePrice}
              disabled={savingPrice}
              className="rounded-2xl flex-1"
            >
              {savingPrice ? 'جاري الحفظ...' : 'حفظ التعديل'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={savingPrice}
              className="rounded-2xl flex-1"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
