import {cookies} from 'next/headers';
import PlatformLanding from '@/components/landing/PlatformLanding';
import {companySocialConfig,companySocialIdentity,companySocialProofCookie} from '@/lib/company-social';

export const metadata={title:'JOUW DRIVER · Company registration',robots:{index:false,follow:false}};

export default async function RegistrationPage({searchParams}:{searchParams:Promise<{identity?:string}>}) {
 const [cookieJar,query]=await Promise.all([cookies(),searchParams]);
 const proof=await companySocialIdentity(cookieJar.get(companySocialProofCookie)?.value);
 const providers=(['google','apple'] as const).filter(provider=>companySocialConfig(provider));
 const identityStatus=query.identity === 'failed' || query.identity === 'pending' ? query.identity : undefined;
 return <PlatformLanding startRegistration socialRegistration={{providers,email:proof?.email,identityStatus}}/>;
}
