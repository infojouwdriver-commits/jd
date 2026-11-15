export const approvalPage = '/admin/approval-requests';
export const approvalTabs = ['company-registration','company-changes','driver-registration','general'] as const;
export type ApprovalTab = typeof approvalTabs[number];

export function approvalTarget(params:URLSearchParams) {
  const tab=approvalTabs.find(tab=>tab===params.get('tab'))??'company-registration';
  const id=params.get('request')??'';
  const valid=tab==='company-registration'
    ? /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)
    : /^[1-9]\d{0,14}$/.test(id);
  return {tab,id:valid?id:undefined};
}

export function approvalPath(tab:ApprovalTab,id:string) {
  return approvalPage+'?'+new URLSearchParams({tab,request:id});
}

export function approvalReturnPath(value:string|null) {
  if(!value?.startsWith(approvalPage+'?'))return null;
  const {tab,id}=approvalTarget(new URLSearchParams(value.slice(approvalPage.length+1)));
  return id?approvalPath(tab,id):null;
}
