import {claimOnce, revokeAllSessions} from "@/lib/security-session";

import { NextRequest } from 'next/server';
import { requestMiddleware, validateRequestBody } from '@/lib/api-utils';
import { createErrorResponse } from '@/lib/create-response';
import { createSuccessResponse } from '@/lib/create-response';
import { hashString, verifyHashString } from '@/lib/server-utils';
import { z } from 'zod';
import { authCrudOperations } from '@/lib/auth';
import { userRegisterCallback } from '@/lib/user-register';

const registerSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(12, 'Password must be at least 12 characters').max(72),
  passcode: z.string().min(6, 'Please provide a 6-digit verification code').max(6, 'Verification code must be 6 digits'),
});

export const POST = requestMiddleware(async (request: NextRequest) => {
  try {
    const body = await validateRequestBody(request);
    const validatedData = registerSchema.parse(body);

    const { usersCrud, userPasscodeCrud } = await authCrudOperations();

    // Check if user already exists
    const existingUser = await usersCrud.findMany({ email: validatedData.email });

    if (existingUser && existingUser.length > 0) {
      return createErrorResponse({
        errorMessage: 'User already registered',
        status: 409,
      });
    }

    const passObjectResult = await userPasscodeCrud.findMany(
      { pass_object: validatedData.email },
      { orderBy: { column: 'id', direction: 'desc' } }
    );

    const passcodeData = passObjectResult?.[0];

    if (
      !passcodeData || passcodeData.security_purpose !== "register" ||
      !passcodeData.passcode ||
      passcodeData.revoked ||
      !(new Date(passcodeData.valid_until).getTime() > new Date().getTime())
    ) {
      return createErrorResponse({
        errorMessage: 'Invalid verification code',
        status: 401,
      });
    }

    const isCodeValid = await verifyHashString(validatedData.passcode, passcodeData.passcode);

    if (!isCodeValid) {
      return createErrorResponse({
        errorMessage: 'Invalid verification code',
        status: 401,
      });
    }

    if (!await claimOnce('passcode', passcodeData.id)) return createErrorResponse({errorMessage:'Verification code already used', status:401});
    const hashedPassword = await hashString(validatedData.password);

    // تعيين user_type كـ 'driver' عند التسجيل العادي
    const userData = {
      email: validatedData.email,
      password: hashedPassword,
      user_type: 'driver',
    };

    const user = await usersCrud.create(userData);

    await userRegisterCallback(user);

    await userPasscodeCrud.update(passcodeData.id, { revoked: true });

    return createSuccessResponse({ data: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse({
        errorMessage: error.issues[0].message,
        status: 401,
      });
    }

    return createErrorResponse({
      errorMessage: 'Registration failed, please try again later',
      status: 500,
    });
  }
}, false);
