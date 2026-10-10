'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Menu, X, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { managementMenu } from './management-menu';

export default function ManagementShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
    else if (!isLoading && user && !user.isAdmin) router.replace('/dashboard');
  }, [user, isLoading, router]);
  if (isLoading || !user?.isAdmin) return <div role="status" className="flex min-h-screen items-center justify-center gap-3"><Loader2 className="animate-spin" /> جارٍ التحقق من الحساب…</div>;
  const selected = managementMenu.find(item => pathname.startsWith(item.href));
  return <div className="management-workspace" dir="rtl">
    <a href="#workspace-content" className="workspace-skip">انتقل إلى المحتوى</a>
    <header className="workspace-header">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" className="workspace-icon lg:hidden" aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'} aria-expanded={open} aria-controls="management-navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        <Link href="/dashboard" className="workspace-brand" dir="ltr">JOUW <span>DRIVER</span><small>WORKSPACE</small></Link>
        <span className="hidden border-s border-border ps-4 text-sm text-muted-foreground sm:block">{selected?.title || 'نظرة عامة'}</span>
      </div>
      <div className="flex items-center gap-3"><span className="hidden max-w-52 truncate text-xs text-muted-foreground md:block" dir="ltr">{user.email}</span><ThemeToggle /><span className="workspace-avatar" aria-label="حساب المدير">{user.email[0]?.toUpperCase()}</span></div>
    </header>
    {open && <button type="button" aria-label="إغلاق القائمة" className="workspace-backdrop lg:hidden" onClick={() => setOpen(false)} />}
    <aside id="management-navigation" className={`workspace-sidebar ${open ? 'is-open' : ''}`} aria-label="التنقل الرئيسي">
      <nav><Link href="/dashboard" className="workspace-nav-link" aria-current={pathname === '/dashboard' ? 'page' : undefined}><LayoutDashboard size={19} /> نظرة عامة</Link>
      {['التشغيل', 'التواصل', 'الإدارة', 'التكامل'].map(group => <div key={group}><p className="workspace-nav-group">{group}</p>{managementMenu.filter(item => item.group === group).map(item => <Link key={item.href} href={item.href} className="workspace-nav-link" aria-current={pathname.startsWith(item.href) ? 'page' : undefined}><item.icon size={19} />{item.title}</Link>)}</div>)}
      </nav>
      <button type="button" className="workspace-nav-link mt-5 w-full text-destructive" disabled={signingOut} onClick={async () => { setSigningOut(true); try { await logout(); } finally { setSigningOut(false); } }}>{signingOut ? <Loader2 size={19} className="animate-spin" /> : <LogOut size={19} />} تسجيل الخروج</button>
    </aside>
    <main id="workspace-content" className="workspace-content" tabIndex={-1}>{children}</main>
  </div>;
}
