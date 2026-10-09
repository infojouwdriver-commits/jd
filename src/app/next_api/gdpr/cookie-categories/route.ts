import {requestMiddleware} from '@/lib/api-utils';
import {createSuccessResponse} from '@/lib/create-response';
export const GET = requestMiddleware(async () => createSuccessResponse([
 {id:1,code:'essential',name:'Essential / Nécessaires',description:'Authentication and security.',is_required:true,display_order:0},
 {id:2,code:'analytics',name:'Analytics',description:'Disabled in this release.',is_required:false,display_order:1},
 {id:3,code:'marketing',name:'Marketing',description:'Disabled in this release.',is_required:false,display_order:2}
]),false);
