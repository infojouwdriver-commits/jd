import {requestMiddleware} from '@/lib/api-utils';
const unavailable = requestMiddleware(async () => new Response(JSON.stringify({success:false,errorMessage:'Feature disabled pending security review'}),{status:503,headers:{'Content-Type':'application/json'}}));
export const GET = unavailable;
export const POST = unavailable;
