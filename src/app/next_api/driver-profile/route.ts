
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware } from '@/lib/api-utils';
import { generateAdminUserToken, authCrudOperations } from '@/lib/auth';

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

// Keep the legacy URL on the same reauthentication and atomic change path.
export { POST as PUT } from '../auth/account/route';
