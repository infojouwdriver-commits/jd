'use client';

import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Request = {
  id: string;
  user_id: number;
  requested_at: string;
  due_at: string;
  completed_at: string | null;
  retention_reason: string | null;
};
const endpoint = '/gdpr/admin/account-deletions';
const formatDate = (value: string) => new Intl.DateTimeFormat('ar-BE', { dateStyle: 'medium', timeZone: 'Europe/Brussels' }).format(new Date(value));

export default function AccountDeletionsPage() {
  const [requests, setRequests] = useState<Request[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [reviewed, setReviewed] = useState(false);
  const [keepIdentity, setKeepIdentity] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [specific, setSpecific] = useState('');

  async function load(id?: string) {
    setError('');
    setBusy(true);
    try {
      setRequests(await api.get<Request[]>(endpoint, id ? { id } : undefined));
      setSpecific(id ?? '');
      setSelected(null);
    } catch { setError('تعذر تحميل طلبات الحذف.'); }
    finally { setBusy(false); }
  }

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('request');
    void load(id ?? undefined);
  }, []);

  async function complete(id: string) {
    if (busy || !reviewed || (keepIdentity && reason.trim().length < 10)) return;
    setBusy(true);
    setError('');
    try {
      const response = await api.post<{ completed_at: string }>(endpoint, {
        id, records_reviewed: true, keep_driver_identity: keepIdentity, retention_reason: reason.trim(),
      });
      setRequests(current => current?.map(value => value.id === id ? { ...value, completed_at: response.completed_at } : value) ?? null);
      setSelected(null);
      setResult('تم تنفيذ الحذف وإلغاء جلسات الدخول.');
    } catch (error) {
      setError(error instanceof ApiError && error.status < 500 ? error.message : 'تعذر تنفيذ الحذف. يمكنك إعادة المحاولة من هذا الطلب.');
    } finally { setBusy(false); }
  }

  return <div dir="rtl" className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-semibold">طلبات حذف الحسابات</h1>
      <Button variant="outline" disabled={busy} onClick={() => void load()}>{specific ? 'كل الطلبات المفتوحة' : 'تحديث'}</Button>
    </div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {result && <p role="status" className="text-sm">{result}</p>}
    {busy && !requests && <p role="status">جارٍ تحميل الطلبات…</p>}
    {requests?.length === 0 && <p>{specific ? 'الطلب غير موجود.' : 'لا توجد طلبات مفتوحة.'}</p>}
    {requests?.map(request => <Card key={request.id}>
      <CardHeader><CardTitle className="text-lg">حساب رقم {request.user_id}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1 text-sm">
          <p>تاريخ الطلب {formatDate(request.requested_at)}</p>
          <p>موعد الحذف المتوقع {formatDate(request.due_at)}</p>
          {request.completed_at && <p>اكتمل الحذف في {formatDate(request.completed_at)}</p>}
          {request.retention_reason && <p>سبب الاحتفاظ بالسجلات: {request.retention_reason}</p>}
        </div>
        {!request.completed_at && selected !== request.id && <Button variant="outline" disabled={busy} onClick={() => {
          setSelected(request.id); setReviewed(false); setKeepIdentity(false); setReason(''); setError(''); setResult('');
        }}>مراجعة الحذف</Button>}
        {selected === request.id && <form className="space-y-4 border-t pt-4" onSubmit={event => { event.preventDefault(); void complete(request.id); }}>
          <p className="text-sm text-muted-foreground">تأكد من حذف البيانات والملفات المطلوبة خارج قاعدة البيانات ومراجعة صلاحيات ملاك الشركة قبل تنفيذ الطلب. عند حذف آخر حساب مالك، تبقى الشركة وسجلاتها وتحتاج إلى مالك جديد لاستعادة وصولها.</p>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={reviewed} disabled={busy} onChange={event => setReviewed(event.target.checked)}/>
            راجعت الملفات والصلاحيات والسجلات الواجب الاحتفاظ بها
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={keepIdentity} disabled={busy} onChange={event => setKeepIdentity(event.target.checked)}/>
            يلزم الاحتفاظ باسم السائق ورقم بطاقته في سجلات التشغيل
          </label>
          <div className="space-y-2">
            <Label htmlFor="deletion-retention">الأساس القانوني ومدة الاحتفاظ</Label>
            <Input id="deletion-retention" maxLength={1000} value={reason} disabled={busy} onChange={event => setReason(event.target.value)}/>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="destructive" type="submit" disabled={busy || !reviewed || (keepIdentity && reason.trim().length < 10)}>حذف الحساب نهائياً</Button>
            <Button variant="outline" type="button" disabled={busy} onClick={() => setSelected(null)}>رجوع</Button>
          </div>
        </form>}
      </CardContent>
    </Card>)}
  </div>;
}
