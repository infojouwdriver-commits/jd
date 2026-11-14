import {contractDesign,type ContractEmailData} from './email/contract.ts';
import {renderEmail} from './email/renderer.ts';

/** Direct invitations are restricted to the resolved owner and reviewed contract version. */
export function contractInvitation(contract: ContractEmailData & {id:number}, company: {name:string}, origin:string, invitation?:string) {
  const base = new URL(origin);
  if (base.protocol !== 'https:' || base.username || base.password || base.pathname !== '/' || base.search || base.hash)
    throw new Error('Valid application origin required');
  const target = new URL(invitation ? '/sign-contract/email' : '/company/dashboard', base);
  if (invitation) target.hash = invitation;
  return renderEmail(contractDesign(contract, company, {url:target.href, direct:!!invitation}));
}
