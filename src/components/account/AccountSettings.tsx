'use client';
import { useEffect, useState } from 'react';
import { tripJournal } from '@/lib/trip-journal';
import { api } from '@/lib/api-client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
const labels = {
 ar:{title:'حسابي',current:'كلمة المرور الحالية',next:'كلمة المرور الجديدة',repeat:'تأكيد كلمة المرور الجديدة',save:'تغيير كلمة المرور',email:'البريد الإلكتروني',newEmail:'البريد الجديد',code:'رمز التحقق',send:'إرسال رمز التحقق',change:'تغيير البريد',unavailable:'تغيير البريد يحتاج خدمة تأكيد البريد؛ تواصل مع الإدارة لتجهيزها.',signIn:'تم حفظ التغيير. أعد تسجيل الدخول.',mismatch:'كلمتا المرور غير متطابقتين',hint:'12 حرفاً على الأقل؛ ستنتهي جلسات الدخول السابقة بعد الحفظ.',logout:'تسجيل الخروج'},
 fr:{title:'Mon compte',current:'Mot de passe actuel',next:'Nouveau mot de passe',repeat:'Confirmer le mot de passe',save:'Modifier le mot de passe',email:'Adresse e-mail',newEmail:'Nouvelle adresse',code:'Code de vérification',send:'Envoyer le code',change:'Modifier l’adresse',unavailable:'La vérification e-mail doit être configurée par l’administration.',signIn:'Modification enregistrée. Reconnectez-vous.',mismatch:'Les mots de passe ne correspondent pas',hint:'12 caractères minimum. Les sessions précédentes seront fermées.',logout:'Se déconnecter'},
 nl:{title:'Mijn account',current:'Huidig wachtwoord',next:'Nieuw wachtwoord',repeat:'Wachtwoord bevestigen',save:'Wachtwoord wijzigen',email:'E-mailadres',newEmail:'Nieuw e-mailadres',code:'Verificatiecode',send:'Code versturen',change:'E-mailadres wijzigen',unavailable:'De beheerder moet e-mailverificatie instellen.',signIn:'Wijziging opgeslagen. Meld u opnieuw aan.',mismatch:'De wachtwoorden komen niet overeen',hint:'Minimaal 12 tekens. Eerdere sessies worden beëindigd.',logout:'Afmelden'},
};
export default function AccountSettings() {
 const {language} = useLanguage();
 const t = labels[language];
 const {user,logout} = useAuth();
 const [available,setAvailable] = useState(false);
 const [loading,setLoading] = useState(true);
 const [busy,setBusy] = useState(false);
 const [current,setCurrent] = useState('');
 const [password,setPassword] = useState('');
 const [repeat,setRepeat] = useState('');
 const [email,setEmail] = useState('');
 const [code,setCode] = useState('');
 const [sent,setSent] = useState(false);
 useEffect(() => {let active=true;api.get<{email_verification_available:boolean}>('/auth/account').then(data => {if(active)setAvailable(data.email_verification_available);}).catch(error => toast.error(error.message)).finally(() => {if(active)setLoading(false);});return () => {active=false;};},[]);
 const submit = async (action:'request_email_code'|'update_email'|'update_password') => {
  if(busy) return;
  if(action==='update_password' && password!==repeat) {toast.error(t.mismatch);return;}
  setBusy(true);
  try {
   if (action !== 'request_email_code' && user && ((await tripJournal().list(user.sub,'active')).length || sessionStorage.getItem('active_trip'))) {toast.error(language==='ar'?'أنه الرحلة النشطة قبل تعديل بيانات الدخول':language==='nl'?'Beëindig de actieve rit voordat u uw account wijzigt':'Terminez le trajet actif avant de modifier votre compte');return;}
   await api.post('/auth/account',{action,current_password:current,...(action==='update_password'?{password}:{email,...(action==='update_email'?{passcode:code}:{})})});
   if(action==='request_email_code'){setSent(true);return;}
   setCurrent('');setPassword('');setRepeat('');setCode('');
   toast.success(t.signIn);
   await logout();
  } catch(error:any) {toast.error(error.message);} finally {setBusy(false);}
 };
 return <Card className="rounded-2xl"><CardHeader><CardTitle>{t.title}</CardTitle></CardHeader><CardContent className="space-y-5">
  <div className="text-sm"><p>{t.email}: <span dir="ltr">{user?.email}</span></p><p className="mt-1 text-muted-foreground">#{user?.sub}</p></div>
  <div className="space-y-2"><Label htmlFor="account-current">{t.current}</Label><Input id="account-current" type="password" autoComplete="current-password" value={current} onChange={event=>setCurrent(event.target.value)} /></div>
  <form className="space-y-3" onSubmit={event=>{event.preventDefault();void submit('update_password');}}>
   <div className="space-y-2"><Label htmlFor="account-password">{t.next}</Label><Input id="account-password" type="password" autoComplete="new-password" minLength={12} required value={password} onChange={event=>setPassword(event.target.value)} /></div>
   <div className="space-y-2"><Label htmlFor="account-repeat">{t.repeat}</Label><Input id="account-repeat" type="password" autoComplete="new-password" required value={repeat} onChange={event=>setRepeat(event.target.value)} /></div>
   <p className="text-xs text-muted-foreground">{t.hint}</p><Button type="submit" disabled={busy||!current}>{t.save}</Button>
  </form>
  <div className="space-y-3 border-t pt-4">
   {!loading&&!available?<p role="status" className="text-sm text-muted-foreground">{t.unavailable}</p>:null}
   <div className="space-y-2"><Label htmlFor="account-email">{t.newEmail}</Label><Input id="account-email" type="email" autoComplete="email" disabled={!available} value={email} onChange={event=>{setEmail(event.target.value);setSent(false);setCode('');}} /></div>
   <Button type="button" variant="outline" disabled={busy||!available||!email||!current} onClick={()=>void submit('request_email_code')}>{t.send}</Button>
   {sent?<div className="space-y-2"><Label htmlFor="account-code">{t.code}</Label><Input id="account-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={event=>setCode(event.target.value)} /><Button type="button" disabled={busy||code.length!==6} onClick={()=>void submit('update_email')}>{t.change}</Button></div>:null}
  </div>
  <Button type="button" variant="outline" disabled={busy} onClick={()=>void logout()}>{t.logout}</Button>
 </CardContent></Card>;
}
