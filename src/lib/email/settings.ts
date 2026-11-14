import type {createPostgrestClient} from '../postgrest';
import {isEditableTemplate,type EmailDesign,type EmailLanguage} from './renderer.ts';
import {emailSettingsDataSchema,type EmailSettings,type EmailSettingsData} from './settings-model.ts';

export async function readEmailSettings(client:ReturnType<typeof createPostgrestClient>, language:EmailLanguage):Promise<EmailSettings> {
  const result = await client.from('email_template_settings').select('version,updated_at,settings')
    .eq('language', language).abortSignal(AbortSignal.timeout(2500)).single();
  if (result.error) throw result.error;
  return {...result.data, settings: emailSettingsDataSchema.parse(result.data.settings)};
}

export function emailEdits(design:EmailDesign, settings:EmailSettingsData) {
  const edit = isEditableTemplate(design.id) ? settings.templates[design.id as keyof typeof settings.templates] : undefined;
  const security = ['register','company-registration','account-email','reset-password','contract-invitation','contract-confirmation'].includes(design.id);
  return {...edit, signature:security ? undefined : settings.signature};
}
