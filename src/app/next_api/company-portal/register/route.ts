
import { NextRequest } from 'next/server';
import { requestMiddleware, validateRequestBody, sendVerificationEmail } from '@/lib/api-utils';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { hashString, verifyHashString, generateVerificationCode } from '@/lib/server-utils';
import { authCrudOperations, generateAdminUserToken } from '@/lib/auth';
import CrudOperations from '@/lib/crud-operations';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  passcode: z.string().min(6).max(6),
  company_name: z.string().min(2, 'Company name is required'),
  company_phone: z.string().min(5, 'Company phone is required'),
  company_email: z.string().email('Please provide a valid company email').optional(),
});

export const POST = requestMiddleware(async (request: NextRequest) => {
  try {
    const body = await validateRequestBody(request);
    const validatedData = registerSchema.parse(body);

    const { usersCrud, userPasscodeCrud } = await authCrudOperations();

    const existingUser = await usersCrud.findMany({ email: validatedData.email });
    if (existingUser && existingUser.length > 0) {
      return createErrorResponse({ errorMessage: 'Email already registered', status: 409 });
    }

    const passObjectResult = await userPasscodeCrud.findMany(
      { pass_object: validatedData.email },
      { orderBy: { column: 'id', direction: 'desc' } }
    );
    const passcodeData = passObjectResult?.[0];

    if (
      !passcodeData ||
      !passcodeData.passcode ||
      passcodeData.revoked ||
      !(new Date(passcodeData.valid_until).getTime() > new Date().getTime())
    ) {
      return createErrorResponse({ errorMessage: 'Invalid verification code', status: 401 });
    }

    const isCodeValid = await verifyHashString(validatedData.passcode, passcodeData.passcode);
    if (!isCodeValid) {
      return createErrorResponse({ errorMessage: 'Invalid verification code', status: 401 });
    }

    const hashedPassword = await hashString(validatedData.password);
    const newUser = await usersCrud.create({
      email: validatedData.email,
      password: hashedPassword,
      user_type: 'manager',
    });

    const adminToken = await generateAdminUserToken();
    const companiesCrud = new CrudOperations('companies', adminToken);
    const newCompany = await companiesCrud.create({
      name: validatedData.company_name,
      phone: validatedData.company_phone,
      email: validatedData.company_email || validatedData.email,
      vat_number: `PENDING-${newUser.id}`,
      kbo_number: `PENDING-${newUser.id}`,
      chiron_mode: 'TEST',
      bank_account_holder: validatedData.company_name,
    });

    const companyUsersCrud = new CrudOperations('company_users', adminToken);
    await companyUsersCrud.create({
      user_id: newUser.id,
      company_id: newCompany.id,
      role: 'owner',
    });

    await userPasscodeCrud.update(passcodeData.id, { revoked: true });

    return createSuccessResponse({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse({ errorMessage: error.issues[0].message, status: 400 });
    }
    console.error("Operation failed");
    return createErrorResponse({ errorMessage: 'Registration failed', status: 500 });
  }
}, false);
