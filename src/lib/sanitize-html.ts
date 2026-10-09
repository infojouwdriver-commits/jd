'use client';
import DOMPurify from 'dompurify';
export function sanitizeHtml(input: string): string {
  if (typeof window === 'undefined') return '';
  return DOMPurify.sanitize(input, {USE_PROFILES:{html:true}, FORBID_TAGS:['iframe','object','embed','script','style','form','input'], FORBID_ATTR:['style','srcset'], ALLOW_DATA_ATTR:false});
}
