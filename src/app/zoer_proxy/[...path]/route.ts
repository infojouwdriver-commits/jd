const disabled = async () => new Response(JSON.stringify({success:false,errorMessage:'Legacy credential-forwarding proxy disabled'}),{status:410,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export const GET=disabled;
export const POST=disabled;
export const PUT=disabled;
export const PATCH=disabled;
export const DELETE=disabled;
export const OPTIONS=disabled;
