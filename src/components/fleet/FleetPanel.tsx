'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api-client';
import { FleetLocationRow, FleetWorkStatus, isFleetLocationVisible } from '@/lib/fleet-tracking';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Clock3, Loader2, LocateFixed, MapPin, RefreshCw, ShieldCheck, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

const statusLabels: Record<FleetWorkStatus, string> = {
  on_trip: 'في رحلة',
  available: 'متاح',
  stale: 'اتصال قديم',
  off_shift: 'خارج الوردية',
};

const statusClasses: Record<FleetWorkStatus, string> = {
  on_trip: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  available: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  stale: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  off_shift: 'border-slate-500/20 bg-slate-500/10 text-muted-foreground',
};

function formatUpdate(value: string | null): string {
  if (!value) return 'لا يوجد تحديث';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return 'وقت غير صالح';
  return new Intl.DateTimeFormat('ar-BE', { dateStyle: 'short', timeStyle: 'medium', timeZone: 'Europe/Brussels' }).format(date);
}

export default function FleetPanel({ showCompany = false }: { showCompany?: boolean }) {
  const [rows, setRows] = useState<FleetLocationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true); else setLoading(true);
    try {
      const result = await api.get<FleetLocationRow[]>('/fleet');
      setRows(Array.isArray(result) ? result : []);
      setFailed(false);
    } catch (error: any) {
      setFailed(true);
      if (!silent) toast.error(error?.message || 'تعذّر تحميل حالة الأسطول');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(true), 30_000);
    return () => window.clearInterval(interval);
  }, [load]);

  const summary = useMemo(() => rows.reduce((acc, row) => {
    acc[row.work_status] = (acc[row.work_status] || 0) + 1;
    return acc;
  }, {} as Partial<Record<FleetWorkStatus, number>>), [rows]);

  if (loading) return <div role="status" className="flex min-h-56 items-center justify-center gap-3"><Loader2 className="h-5 w-5 animate-spin" /> جارٍ تحميل الأسطول…</div>;

  return <div className="space-y-5" dir="rtl">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">تتبع الأسطول</h1>
        <p className="mt-1 text-sm text-muted-foreground">آخر موقع وافق السائق على مشاركته أثناء الوردية فقط.</p>
      </div>
      <Button variant="outline" onClick={() => void load(true)} disabled={refreshing}>
        <RefreshCw className={`me-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> تحديث
      </Button>
    </div>

    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {(['on_trip', 'available', 'stale', 'off_shift'] as FleetWorkStatus[]).map(status =>
        <Card key={status}><CardContent className="p-4"><p className="text-2xl font-bold">{summary[status] || 0}</p><p className="text-xs text-muted-foreground">{statusLabels[status]}</p></CardContent></Card>)}
    </div>

    {failed && <div role="alert" className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"><WifiOff className="h-4 w-4" /> تعذّر تحديث البيانات. آخر حالة معروفة ما زالت معروضة.</div>}

    {rows.length === 0 ? <Card><CardContent className="flex min-h-44 flex-col items-center justify-center gap-3 text-center text-muted-foreground"><ShieldCheck className="h-8 w-8" /><p>لا يوجد سائقون نشطون ضمن نطاق حسابك.</p></CardContent></Card> :
      <div className="grid gap-4 lg:grid-cols-2">
        {rows.map(row => {
          const visible = isFleetLocationVisible(row);
          return <Card key={row.driver_id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0"><CardTitle className="truncate text-base">{row.driver_name}</CardTitle>{showCompany && <p className="mt-1 truncate text-xs text-muted-foreground">{row.company_name}</p>}</div>
                <Badge variant="outline" className={statusClasses[row.work_status]}>{statusLabels[row.work_status]}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/60 p-3"><span className="flex items-center gap-2 text-xs text-muted-foreground"><Car className="h-3.5 w-3.5" /> المركبة</span><p className="mt-1 font-semibold" dir="ltr">{row.plate_number || '—'}</p></div>
                <div className="rounded-lg bg-muted/60 p-3"><span className="flex items-center gap-2 text-xs text-muted-foreground"><LocateFixed className="h-3.5 w-3.5" /> الدقة</span><p className="mt-1 font-semibold">{visible && row.accuracy_m !== null ? `${Math.round(Number(row.accuracy_m))} م` : '—'}</p></div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5" /> آخر تحديث: {visible ? formatUpdate(row.last_update) : 'المشاركة متوقفة'}</div>
              {visible ? <div className="flex items-center gap-2 rounded-lg border bg-background p-3 font-mono text-xs" dir="ltr"><MapPin className="h-4 w-4 shrink-0 text-primary" /><span>{Number(row.latitude).toFixed(5)}, {Number(row.longitude).toFixed(5)}</span></div> :
                <p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">لا تُعرض إحداثيات عندما تكون الوردية أو المشاركة متوقفة.</p>}
            </CardContent>
          </Card>;
        })}
      </div>}
  </div>;
}
