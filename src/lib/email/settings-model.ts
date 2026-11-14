import {z} from 'zod';
import {emailLanguages, templateIds} from './renderer.ts';

const subject = z.string().trim().max(80).refine(value => !/[\u0000-\u001f\u007f]/u.test(value));
const paragraph = z.string().trim().max(500).refine(value => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value));
const invoiceEdit = z.object({subject, intro:paragraph}).strict();
const templates = z.object({
  invoice:invoiceEdit.optional(),
  'credit-note':invoiceEdit.optional(),
  'invoice-reminder':invoiceEdit.optional(),
}).strict();
export const emailSettingsDataSchema = z.object({signature:paragraph, templates}).strict();
export const saveEmailSettingsSchema = z.object({
  language:z.enum(emailLanguages),
  version:z.number().int().min(1).max(2147483646),
  settings:emailSettingsDataSchema,
}).strict();
export const sendEmailSampleSchema = z.object({
  language:z.enum(emailLanguages), id:z.enum(templateIds),
  to:z.string().trim().email().max(254).transform(s => s.toLowerCase()),
  requestId:z.string().uuid(),
}).strict();
export type EmailSettingsData = z.infer<typeof emailSettingsDataSchema>;
export interface EmailSettings {
  version:number;
  updated_at:string | null;
  settings:EmailSettingsData;
}
export const emailDesignVersion = '1.0.1';
export function testRecipientAllowed(address:string, adminEmail:string, configured = '') {
  return [adminEmail, ...configured.split(',')].some(email => email.trim().toLowerCase() === address);
}
