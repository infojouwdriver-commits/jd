'use client';
/* eslint-disable @next/next/no-html-link-for-pages -- This is an authenticated JSON download endpoint, not an application page; preserve native browser downloads. */
import {useLanguage} from '@/contexts/LanguageContext';
import {useAuth} from '@/components/auth/AuthProvider';
import DriverGdprSection from '@/components/gdpr/DriverGdprSection';
import Link from 'next/link';
import CookiePreferencesButton from '@/components/gdpr/CookiePreferencesButton';
export default function PrivacyCenter() {
 const {user} = useAuth();
 const {language} = useLanguage();
 const locale = language === 'ar' || language === 'nl' ? language : 'fr';
 const words = {ar:['الخصوصية والبيانات','تنزيل كشف بياناتي (PDF)','تنزيل البيانات (JSON)','سجّل الدخول','يمكنك تقديم طلب وصول أدناه للحصول على بيانات إضافية.'],fr:['Confidentialité et données','Télécharger mon relevé PDF','Télécharger les données JSON','Connexion','Pour demander des données supplémentaires, utilisez la demande d’accès ci-dessous.'],nl:['Privacy en gegevens','Mijn PDF-overzicht downloaden','Gegevens als JSON downloaden','Aanmelden','Vraag aanvullende gegevens aan via het inzageverzoek hieronder.']}[locale];
 return <main className="max-w-3xl mx-auto p-6 space-y-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
  <h1 className="text-2xl font-bold">{words[0]}</h1>
  <CookiePreferencesButton />
  {user ? <>
   <div className="flex flex-wrap gap-3">
    <a className="inline-block border rounded-lg p-3" href={`/next_api/gdpr/export/pdf?lang=${locale}`}>{words[1]}</a>
    <a className="inline-block border rounded-lg p-3" href="/next_api/gdpr/export">{words[2]}</a>
   </div>
   <p>{words[4]}</p>
   <DriverGdprSection />
  </> : <Link href="/login">{words[3]}</Link>}
 </main>;
}
