import { NextRequest } from 'next/server';
import { requestMiddleware, validateRequestBody, sendVerificationEmail } from '@/lib/api-utils';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { generateVerificationCode, hashVerificationCode } from '@/lib/server-utils';
import { authCrudOperations } from '@/lib/auth';
import { z } from 'zod';

const sendVerificationSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  type: z.enum(['register', 'reset-password']),
});

export const POST = requestMiddleware(async (request: NextRequest) => {
  try {
    const body = await validateRequestBody(request);
    const validatedData = sendVerificationSchema.parse(body);

    const { usersCrud, userPasscodeCrud } = await authCrudOperations();

    if (validatedData.type === 'register') {
    const existingUsers = await usersCrud.findMany({ email: validatedData.email });
    if (existingUsers && existingUsers.length > 0) {
        return createSuccessResponse({data:true});
      }
    }

    if (validatedData.type === 'reset-password') {
      const existingUsers = await usersCrud.findMany({ email: validatedData.email });
      if (existingUsers && existingUsers.length === 0) {
        return createSuccessResponse({data:true});
      }
    }

    const code = generateVerificationCode();

    const hashedCode = await hashVerificationCode(code);

    await userPasscodeCrud.create({
      pass_object: validatedData.email,
      security_purpose: validatedData.type,
      passcode: hashedCode,
    });

    const emailSent = await sendVerificationEmail(validatedData.email, code);
    
    if (!emailSent) {
      return createErrorResponse({
        errorMessage: 'Failed to send the email. Please try again later',
        status: 401,
      });
    }

    return createSuccessResponse({
      data: true,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse({
        errorMessage: error.errors[0].message,
        status: 401,
      });
    }

    return createErrorResponse({
      errorMessage: 'Failed to send the email. Please try again later',
      status: 500,
    });
  }
}, false);