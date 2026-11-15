import {randomUUID} from 'node:crypto';
import {generateAdminUserToken} from './auth';
import {createPostgrestClient} from './postgrest';
import {mailConfiguration} from './mail-policy';
import {sendTransactionalMail} from './mail-service';
import {accountDeletionEmailDesign,approvalEmailDesign,type ApprovalAlert} from './email/operational';
import {supportEmail} from './public-contact';
import type {EmailLanguage} from './email/renderer';

export async function sendPendingApprovalAlerts() {
  if(!mailConfiguration(process.env).ready)return;
  const client=createPostgrestClient(await generateAdminUserToken());
  for(let count=0;count<5;count++) {
    const lease=randomUUID();
    const claimed=await client.rpc('security_claim_approval_mail',{p_lease:lease}).abortSignal(AbortSignal.timeout(8000));
    if(claimed.error)throw Error('Approval mail queue unavailable');
    if(!claimed.data)return;
    const alert=claimed.data as {id:string;source:string;request_key:string};
    const complete=alert.source==='account-deletion-complete';
    let recipient:string|null=supportEmail;
    let language:EmailLanguage|undefined;
    if(complete) {
      const pending=await client.from('account_deletion_requests').select('notice_email,language')
        .eq('id',alert.request_key).abortSignal(AbortSignal.timeout(8000)).single();
      if(pending.error)throw Error('Account deletion notice unavailable');
      recipient=pending.data.notice_email;
      language=pending.data.language as EmailLanguage;
    }
    const design=complete||alert.source==='account-deletion'
      ?accountDeletionEmailDesign(alert.request_key,language)
      :approvalEmailDesign(claimed.data as ApprovalAlert);
    const result=recipient
      ?await sendTransactionalMail({to:recipient,design,purpose:'approval_alert',event:`approval-alert:${alert.source}:${alert.request_key}`})
      :{status:'no_recipient'};
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
