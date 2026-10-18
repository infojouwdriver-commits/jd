import {requestMiddleware} from '@/lib/api-utils';
import {createErrorResponse} from '@/lib/create-response';
// Retire the non-idempotent legacy generator. Existing documents remain readable.
export const POST=requestMiddleware(async()=>createErrorResponse({status:410,errorMessage:'Configure subscriptions in the company billing workspace. Recurrence uses the protected subscription ledger.'}),true);
