import {randomUUID} from 'node:crypto';
import {generateAdminUserToken} from './auth';
import {createPostgrestClient} from './postgrest';
import {mailConfiguration} from './mail-policy';
import {sendTransactionalMail} from './mail-service';
import {approvalEmailDesign,type ApprovalAlert} from './email/operational';
import {supportEmail} from './public-contact';

export async function sendPendingApprovalAlerts() {
  if(!mailConfiguration(process.env).ready)return;
  const client=createPostgrestClient(await generateAdminUserToken());
  for(let count=0;count<5;count++) {
    const lease=randomUUID();
    const claimed=await client.rpc('security_claim_approval_mail',{p_lease:lease}).abortSignal(AbortSignal.timeout(8000));
    if(claimed.error)throw Error('Approval mail queue unavailable');
    if(!claimed.data)return;
    const alert=claimed.data as ApprovalAlert;
    const result=await sendTransactionalMail({to:supportEmail,design:approvalEmailDesign(alert),
      purpose:'approval_alert',event:`approval-alert:${alert.source}:${alert.request_key}`});
    const finished=await client.rpc('security_finish_approval_mail',{p_id:alert.id,p_lease:lease,p_status:result.status}).abortSignal(AbortSignal.timeout(8000));
    if(finished.error)throw Error('Approval mail result unavailable');
  }
}

export function startApprovalMailScheduler() {
  const state=globalThis as typeof globalThis & {jdApprovalMailTimer?:ReturnType<typeof setTimeout>};
  if(state.jdApprovalMailTimer)return;
  async function run() {
    try {await sendPendingApprovalAlerts();}
    catch {console.error('Approval mail queue temporarily unavailable');}
    finally {state.jdApprovalMailTimer=setTimeout(run,30000);state.jdApprovalMailTimer.unref();}
  }
  state.jdApprovalMailTimer=setTimeout(run,10000);
  state.jdApprovalMailTimer.unref();
}
