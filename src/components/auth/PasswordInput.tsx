'use client';
import {forwardRef,useState,type ComponentProps} from 'react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {useLanguage} from '@/contexts/LanguageContext';
/** Password-manager compatible field, with the same shared Input/Button focus and disabled states. */
export const PasswordInput=forwardRef<HTMLInputElement,ComponentProps<typeof Input>>(function PasswordInput(props,ref){
 const [visible,setVisible]=useState(false),{language}=useLanguage();
 const text={ar:['إظهار كلمة المرور','إخفاء كلمة المرور'],fr:['Afficher le mot de passe','Masquer le mot de passe'],nl:['Wachtwoord tonen','Wachtwoord verbergen'],en:['Show password','Hide password']}[language];
 return <div className="flex items-center gap-2"><Input {...props} ref={ref} type={visible?'text':'password'}/><Button type="button" variant="outline" disabled={props.disabled} aria-pressed={visible} onClick={()=>setVisible(v=>!v)}>{text[visible?1:0]}</Button></div>;
});
