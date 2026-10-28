"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Gauge, ClipboardList, Power } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function DriverHomePage() {
  const { language } = useLanguage();
  const ar = language === "ar", fr = language === "fr";
  const title = ar ? "لوحة القيادة" : fr ? "Tableau de bord" : "Dashboard";
  return <div className="mx-4 mt-4 space-y-4 pb-6">
    <motion.section initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:.45}} className="relative overflow-hidden rounded-3xl border p-5" style={{background:"linear-gradient(150deg,#1a2c46,#080e19)",borderColor:"#46506a",color:"#f5f7fc"}}>
      <div className="flex items-center justify-between"><span className="text-xs font-bold tracking-widest" style={{color:"#eac67d"}}>JOUW DRIVER</span><Power size={18} color="#eac67d"/></div>
      <h1 className="mt-5 text-2xl font-bold">{title}</h1>
      <p className="mt-1 text-sm" style={{color:"#a4b4c8"}}>{ar?"ابدأ ورديتك بقراءة العداد، ثم انتقل إلى رحلاتك.":fr?"Commencez votre service avec le kilométrage.":"Start your shift with the odometer reading."}</p>
      <div className="mt-6 flex items-center justify-around gap-2" dir="ltr">
        {[{label:"RPM",value:"0.0"},{label:"ENGINE",value:"OFF"},{label:"km/h",value:"0"}].map((item,i)=><motion.div key={item.label} initial={{opacity:0,scale:.8}} animate={{opacity:1,scale:1}} transition={{delay:i*.13}} className="flex h-24 w-24 flex-col items-center justify-center rounded-full border-4 text-center" style={{borderColor:"#b89455",boxShadow:"inset 0 0 22px #eac67d15,0 0 18px #eac67d15"}}><span className="text-xl font-bold" style={{color:"#eac67d"}}>{item.value}</span><span className="text-[10px]" style={{color:"#9baec6"}}>{item.label}</span></motion.div>)}
      </div>
      <div className="mt-5 h-1 rounded-full" style={{background:"linear-gradient(90deg,#b58a44,#f0d69a,#b58a44)"}}/>
    </motion.section>
    <div className="grid grid-cols-2 gap-3">
      <Link href="/driver/taximeter" className="dp-card flex flex-col gap-2 rounded-2xl p-4"><Gauge style={{color:"var(--dp-accent)"}}/><span className="dp-text font-bold">{ar?"العداد":fr?"Taximètre":"Taximeter"}</span></Link>
      <Link href="/driver/shifts" className="dp-card flex flex-col gap-2 rounded-2xl p-4"><ClipboardList style={{color:"var(--dp-accent)"}}/><span className="dp-text font-bold">{ar?"إنهاء الوردية / الكشف":fr?"Fin de service":"Shift / service sheet"}</span></Link>
    </div>
  </div>;
}
