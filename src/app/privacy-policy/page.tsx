import { cookies, headers } from 'next/headers';
import LegalDocument from '@/components/public/LegalDocument';

export const metadata = {title:'Confidentialité — JOUW DRIVER',alternates:{canonical:'https://jouww.com/fr/legal/privacy'}};
export default async function PrivacyPolicyPage({searchParams}: {searchParams:Promise<{lang?:string}>}) {
 const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
 const query = await searchParams;
 const preference = query.lang ?? cookieStore.get('driver_language')?.value ?? headerStore.get('accept-language')?.slice(0, 2);
 return <LegalDocument locale={preference === 'ar' || preference === 'nl' || preference === 'en' ? preference : 'fr'} document="privacy"/>;
}
