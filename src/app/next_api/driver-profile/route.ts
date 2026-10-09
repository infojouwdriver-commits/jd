import {claimOnce, revokeAllSessions} from "@/lib/security-session";

import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, validateRequestBody, sendVerificationEmail } from '@/lib/api-utils';
import { generateAdminUserToken, authCrudOperations } from '@/lib/auth';
import { hashString, verifyHashString } from '@/lib/server-utils';
import { z } from 'zod';

// GET - Fetch driver profile
export const GET = requestMiddleware(async (request, context) => {
  const user_id = context.payload?.sub;
  if (!user_id) return createErrorResponse({ errorMessage: 'Unauthorized', status: 401 });

  try {
    const adminToken = await generateAdminUserToken();
    const driversCrud = new CrudOperations('drivers', adminToken);
    const drivers = await driversCrud.findMany({ user_id: parseInt(user_id) });

    if (!drivers || drivers.length === 0) {
      return createErrorResponse({ errorMessage: 'Driver not found', status: 404 });
    }

    const { usersCrud } = await authCrudOperations();
    const user = await usersCrud.findById(user_id);

    return createSuccessResponse({
      driver: drivers[0],
      email: user?.email || '',
    });
  } catch (error: any) {
    return createErrorResponse({ errorMessage: error.message || 'Failed to load profile', status: 500 });
  }
}, true);

// PUT - Update driver profile (email or password with OTP verification)
export const PUT = requestMiddleware(async (request, context) => {
  const user_id = context.payload?.sub;
  if (!user_id) return createErrorResponse({ errorMessage: 'Unauthorized', status: 401 });

  try {
    const body = await validateRequestBody(request);
    const { action, email, password, passcode } = body;

    const { usersCrud, userPasscodeCrud } = await authCrudOperations();
    const user = await usersCrud.findById(user_id);
    if (!user) return createErrorResponse({ errorMessage: 'User not found', status: 404 });

    if (action === 'update_email') {
      const emailSchema = z.string().email();
      const parsed = emailSchema.safeParse(email);
      if (!parsed.success) return createErrorResponse({ errorMessage: 'Invalid email', status: 400 });
      if (!passcode) return createErrorResponse({ errorMessage: 'Verification code required', status: 400 });

      const passObjectResult = await userPasscodeCrud.findMany(
        { pass_object: email },
        { orderBy: { column: 'id', direction: 'desc' } }
      );
      const passcodeData = passObjectResult?.[0];

      if (
        !passcodeData || passcodeData.security_purpose !== (action === "update_email" ? "register" : "reset-password") ||
        passcodeData.revoked ||
        !(new Date(passcodeData.valid_until).getTime() > new Date().getTime())
      ) {
        return createErrorResponse({ errorMessage: 'Invalid or expired verification code', status: 401 });
      }

      const isValid = await verifyHashString(passcode, passcodeData.passcode);
      if (!isValid) return createErrorResponse({ errorMessage: 'Invalid verification code', status: 401 });

      const existing = await usersCrud.findMany({ email });
      if (existing && existing.length > 0) {
        return createErrorResponse({ errorMessage: 'Email already in use', status: 409 });
      }

      if (!await claimOnce('passcode', passcodeData.id)) return createErrorResponse({errorMessage:'Verification code already used',status:401});
      await usersCrud.update(user_id, { email });
      await revokeAllSessions(user_id);
      await userPasscodeCrud.update(passcodeData.id, { revoked: true });

      return createSuccessResponse({ success: true });
    }

    if (action === 'update_password') {
      if (!password || password.length < 12 || password.length > 72) {
        return createErrorResponse({ errorMessage: 'Password must be between 12 and 72 characters', status: 400 });
      }
      if (!passcode) return createErrorResponse({ errorMessage: 'Verification code required', status: 400 });

      const passObjectResult = await userPasscodeCrud.findMany(
        { pass_object: user.email },
        { orderBy: { column: 'id', direction: 'desc' } }
      );
      const passcodeData = passObjectResult?.[0];

      if (
        !passcodeData || passcodeData.security_purpose !== (action === "update_email" ? "register" : "reset-password") ||
        passcodeData.revoked ||
        !(new Date(passcodeData.valid_until).getTime() > new Date().getTime())
      ) {
        return createErrorResponse({ errorMessage: 'Invalid or expired verification code', status: 401 });
      }

      const isValid = await verifyHashString(passcode, passcodeData.passcode);
      if (!isValid) return createErrorResponse({ errorMessage: 'Invalid verification code', status: 401 });

      if (!await claimOnce('passcode', passcodeData.id)) return createErrorResponse({errorMessage:'Verification code already used',status:401});
      const hashed = await hashString(password);
      await usersCrud.update(user_id, { password: hashed });
      await revokeAllSessions(user_id);
      await userPasscodeCrud.update(passcodeData.id, { revoked: true });

      return createSuccessResponse({ success: true });
    }

    return createErrorResponse({ errorMessage: 'Invalid action', status: 400 });
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({ errorMessage: error.message || 'Failed to update profile', status: 500 });
  }
}, true);
