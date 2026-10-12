'use client';
import {useAuth} from '@/components/auth/AuthProvider';
import DriverGdprSection from '@/components/gdpr/DriverGdprSection';
import Link from 'next/link';
import CookiePreferencesButton from '@/components/gdpr/CookiePreferencesButton';
export default function PrivacyCenter() {
 const {user} = useAuth();
 return <main className="max-w-3xl mx-auto p-6 space-y-6"><h1 className="text-2xl font-bold">الخصوصية والبيانات · Confidentialité</h1><CookiePreferencesButton />{user ? <><a className="inline-block border rounded-lg p-3" href="/next_api/gdpr/export">تنزيل بياناتي · Export JSON</a><p>التصدير المباشر يشمل بيانات الحساب والرحلات الأساسية. لطلب نسخة أوسع قد تحتوي بيانات أشخاص آخرين، استخدم طلب الوصول أدناه.</p><DriverGdprSection /></> : <Link href="/login">تسجيل الدخول · Connexion</Link>}</main>;
}
