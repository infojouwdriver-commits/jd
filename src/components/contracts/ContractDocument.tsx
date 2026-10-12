'use client';
import {useEffect, useState} from 'react';
import DOMPurify from 'dompurify';
import {CONTRACT_DOCUMENT_CSS} from '@/lib/contract-document-style';

export default function ContractDocument({html}: {html: string}) {
  const [safeHtml, setSafeHtml] = useState('');
  useEffect(() => {
    setSafeHtml(DOMPurify.sanitize(html, {
      USE_PROFILES: {html: true},
      FORBID_TAGS: ['iframe', 'object', 'embed', 'script', 'style', 'form', 'input', 'img', 'video', 'audio', 'source', 'link', 'meta'],
      FORBID_ATTR: ['style', 'srcset'], ALLOW_DATA_ATTR: false,
    }));
  }, [html]);
  const language = /<html\s+lang="fr"/.test(html) ? 'fr' : 'nl';
  return <><style>{CONTRACT_DOCUMENT_CSS}</style><div className="contract-document" dir="ltr" lang={language} data-contract-document dangerouslySetInnerHTML={{__html: safeHtml}} /></>;
}
