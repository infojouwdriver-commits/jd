"use client";
import {useEffect, useState} from 'react';
import QRCode from 'qrcode';
export default function DocumentQr({url,label}:{url:string;label:string}) {
  const [image,setImage] = useState('');
  useEffect(()=>{let live=true;setImage('');void QRCode.toDataURL(url,{width:256,margin:4,errorCorrectionLevel:'M'}).then(value=>{if(live)setImage(value);}).catch(()=>{});return()=>{live=false;};},[url]);
  return <a href={url} className="dp-card-inner flex items-center gap-4 p-4 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4" aria-label={label}>
    {/* Locally generated PNG; no remote image optimizer or external QR service. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    {image?<img src={image} alt={`QR · ${label}`} width={112} height={112} className="rounded-lg"/>:<span aria-hidden="true" className="block h-28 w-28 shrink-0"/>}
    <span className="min-w-0"><strong>{label}</strong><span className="dp-text-soft mt-2 block text-sm" dir="ltr">app.jouww.com</span></span>
  </a>;
}
