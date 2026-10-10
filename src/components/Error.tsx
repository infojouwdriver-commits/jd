'use client';

import Link from 'next/link';
import { RefreshCw, House, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({ error, reset }: { error: Error & { digest?: string; cause?: unknown }; reset?: () => void }) {
  return <div role="alert" dir="rtl" className="flex min-h-[70dvh] w-full flex-col items-center justify-center gap-4 px-6 text-center">
    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive"><AlertCircle size={30} /></span>
    <h1 className="text-2xl font-semibold">تعذّر فتح هذه الصفحة</h1>
    <p className="max-w-sm text-sm leading-7 text-muted-foreground">جرّب مرة أخرى. إذا استمرت المشكلة، ارجع إلى الصفحة الرئيسية.</p>
    <div className="flex flex-wrap justify-center gap-3"><Button type="button" onClick={() => reset ? reset() : window.location.reload()}><RefreshCw size={16} /> إعادة المحاولة</Button><Button asChild variant="outline"><Link href="/dashboard"><House size={16} /> الرئيسية</Link></Button></div>
    {error.digest && <p className="text-xs text-muted-foreground">مرجع الخطأ: {error.digest}</p>}
  </div>;
}
