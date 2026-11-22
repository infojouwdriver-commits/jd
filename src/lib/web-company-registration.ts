import { z } from 'zod';
import { companyRegistrationSchema } from './company-registration';

export const webCompanyRegistrationSchema = companyRegistrationSchema.safeExtend({
  company_password: companyRegistrationSchema.shape.company_password.or(z.literal('')),
  kbo_number: z.string().transform(value => value.trim().replace(/^BE\s*/i, ''))
    .pipe(companyRegistrationSchema.shape.kbo_number),
});
