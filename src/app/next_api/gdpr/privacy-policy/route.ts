import {requestMiddleware} from '@/lib/api-utils';
import {createSuccessResponse} from '@/lib/create-response';
export const GET = requestMiddleware(async () => createSuccessResponse({version:'2026-10-09',url:'/privacy-policy',status:'controller-validation-required'}),false);
