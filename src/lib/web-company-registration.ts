import { z } from 'zod';
import { companyRegistrationSchema } from './company-registration';

const optionalChiron = (max: number) => z.string().trim().max(max);

export const webCompanyRegistrationSchema = companyRegistrationSchema.safeExtend({
  chiron_test_client_id: optionalChiron(512),
  chiron_test_client_secret: optionalChiron(2048),
  company_password: companyRegistrationSchema.shape.company_password.or(z.literal('')),
}).superRefine((value, ctx) => {
  if (Boolean(value.chiron_test_client_id) !== Boolean(value.chiron_test_client_secret)) {
    ctx.addIssue({ code: 'custom', path: ['chiron_test_client_id'], message: 'Complete both Chiron test fields or leave both empty' });
  }
});
