import {emailContractHandler} from '@/lib/contract-email-handler';
// POST keeps the bearer invitation out of access-log query strings. Review never signs.
export const POST=emailContractHandler('review');
