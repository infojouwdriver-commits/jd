'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { buttonVariants } from '@/components/ui/button';
import type { CompanyProvider } from '@/lib/company-social';

const captions = {
  ar:{google:'المتابعة باستخدام Google',apple:'المتابعة باستخدام Apple'},
  fr:{google:'Continuer avec Google',apple:'Continuer avec Apple'},
  nl:{google:'Doorgaan met Google',apple:'Doorgaan met Apple'},
};

export function CompanySignInOptions({providers,intent='register'}:{
  providers:CompanyProvider[]; intent?:'register'|'login';
}) {
  const {language}=useLanguage();
  if (!providers.length) return null;
  return <div className="mb-5 flex flex-wrap gap-2">
    {providers.map(provider=><a key={provider}
      className={buttonVariants({variant:'outline',className:'min-h-11 whitespace-normal'})}
      href={`/company-access/${provider}/start?lang=${language}&intent=${intent}`}>
      {captions[language][provider]}
    </a>)}
  </div>;
}
