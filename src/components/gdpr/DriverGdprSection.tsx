
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Clock, CheckCircle, XCircle, AlertTriangle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { api } from "@/lib/api-client";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

interface DataRequest {
  id: number;
  request_type: string;
  status: string;
  request_details?: string;
  requested_at: string;
}

const T = {
  nl: {
    title: "Privacy & Gegevensrechten",
    desc: "U heeft het recht uw persoonsgegevens in te zien, te corrigeren of te laten verwijderen conform de AVG.",
    newRequest: "Nieuwe aanvraag",
    submit: "Indienen",
    cancel: "Annuleren",
    requestType: "Type aanvraag",
    details: "Details (optioneel)",
    privacyPolicy: "Privacybeleid",
    noRequests: "Geen aanvragen gevonden",
    successMsg: "Aanvraag ingediend",
    errorMsg: "Indienen mislukt",
    types: { access: "Recht op inzage", rectification: "Recht op correctie", erasure: "Recht op verwijdering", portability: "Recht op overdraagbaarheid", restriction: "Recht op beperking", objection: "Recht van bezwaar" },
    statuses: { submitted: "Ingediend", in_review: "In behandeling", approved: "Goedgekeurd", completed: "Voltooid", rejected: "Geweigerd", cancelled: "Geannuleerd" },
  },
  fr: {
    title: "Confidentialité & Droits des données",
    desc: "Vous avez le droit d'accéder, de rectifier ou de supprimer vos données personnelles conformément au RGPD.",
    newRequest: "Nouvelle demande",
    submit: "Soumettre",
    cancel: "Annuler",
    requestType: "Type de demande",
    details: "Détails (facultatif)",
    privacyPolicy: "Politique de confidentialité",
    noRequests: "Aucune demande trouvée",
    successMsg: "Demande soumise",
    errorMsg: "Échec de la soumission",
    types: { access: "Droit d'accès", rectification: "Rectification", erasure: "Droit à l'effacement", portability: "Portabilité", restriction: "Limitation", objection: "Opposition" },
    statuses: { submitted: "Soumis", in_review: "En cours", approved: "Approuvé", completed: "Complété", rejected: "Refusé", cancelled: "Annulé" },
  },
  ar: {
    title: "الخصوصية وحقوق البيانات",
    desc: "لديك الحق في الوصول إلى بياناتك الشخصية وتصحيحها وحذفها وفقًا للائحة GDPR الأوروبية.",
    newRequest: "طلب جديد",
    submit: "إرسال",
    cancel: "إلغاء",
    requestType: "نوع الطلب",
    details: "التفاصيل (اختياري)",
    privacyPolicy: "سياسة الخصوصية",
    noRequests: "لا توجد طلبات",
    successMsg: "تم إرسال الطلب بنجاح",
    errorMsg: "فشل إرسال الطلب",
    types: { access: "حق الوصول للبيانات", rectification: "تصحيح البيانات", erasure: "حذف البيانات (النسيان)", portability: "نقل البيانات", restriction: "تقييد المعالجة", objection: "الاعتراض على المعالجة" },
    statuses: { submitted: "مُقدَّم", in_review: "قيد المراجعة", approved: "موافق عليه", completed: "مكتمل", rejected: "مرفوض", cancelled: "ملغي" },
  },
};

const STATUS_CFG: Record<string, { icon: React.ElementType; color: string }> = {
  submitted: { icon: Clock, color: "#f59e0b" },
  in_review: { icon: AlertTriangle, color: "#3b82f6" },
  approved: { icon: CheckCircle, color: "#22c55e" },
  completed: { icon: CheckCircle, color: "#22c55e" },
  rejected: { icon: XCircle, color: "#ef4444" },
  cancelled: { icon: XCircle, color: "#94a3b8" },
};

const REQUEST_TYPES = ["access", "rectification", "erasure", "portability", "restriction", "objection"] as const;

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(10,15,30,0.75)", backdropFilter: "blur(20px)", border: "1px solid rgba(212,175,55,0.15)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(212,175,55,0.15)" }}>
      <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.3)" }}>
        <Icon className="w-3.5 h-3.5" style={{ color: "#d4af37" }} />
      </div>
      <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(212,175,55,0.95)" }}>{title}</h2>
    </div>
  );
}

export default function DriverGdprSection() {
  const { language, isRtl } = useLanguage();
  const t = T[language] ?? T.fr;

  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reqType, setReqType] = useState("");
  const [details, setDetails] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await api.get<DataRequest[]>("/gdpr/data-subject-requests");
      setRequests(data || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleSubmit = async () => {
    if (!reqType) return;
    setSubmitting(true);
    try {
      await api.post("/gdpr/data-subject-requests", { request_type: reqType, request_details: details || null });
      toast.success(t.successMsg);
      setShowForm(false); setReqType(""); setDetails("");
      fetchRequests();
    } catch { toast.error(t.errorMsg); }
    finally { setSubmitting(false); }
  };

  return (
    <GlassCard>
      <SectionHeader icon={Shield} title={t.title} />

      <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
        <p className="text-xs leading-relaxed" style={{ color: "rgba(212,175,55,0.65)" }}>{t.desc}</p>
        <Link href="/privacy-policy" className="inline-flex items-center gap-1 mt-2 text-xs font-medium" style={{ color: "#d4af37" }}>
          {t.privacyPolicy} →
        </Link>
      </div>

      <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
        <button onClick={() => setShowForm((v) => !v)} className="w-full flex items-center justify-between py-2.5 px-4 rounded-2xl text-sm font-medium"
          style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.25)", color: "#d4af37" }}>
          <span>{t.newRequest}</span>
          {showForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="pt-3 space-y-3">
                <Select value={reqType} onValueChange={setReqType} dir={isRtl ? "rtl" : "ltr"}>
                  <SelectTrigger className="rounded-xl text-sm" style={{ background: "rgba(10,15,30,0.6)", border: "1px solid rgba(212,175,55,0.2)", color: "white" }}>
                    <SelectValue placeholder={t.requestType} />
                  </SelectTrigger>
                  <SelectContent>
                    {REQUEST_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{t.types[type]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={2} placeholder={t.details}
                  className="w-full text-sm text-white rounded-xl px-3 py-2 resize-none outline-none"
                  style={{ background: "rgba(10,15,30,0.6)", border: "1px solid rgba(212,175,55,0.2)" }} />

                <div className="flex gap-2">
                  <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-2xl text-sm font-medium"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212,175,55,0.15)", color: "rgba(212,175,55,0.6)" }}>
                    {t.cancel}
                  </button>
                  <button onClick={handleSubmit} disabled={!reqType || submitting}
                    className="flex-1 py-2.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #b8860b, #d4af37)", color: "#1a1200" }}>
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {t.submit}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-3 space-y-2">
        {loading ? (
          <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin" style={{ color: "#d4af37" }} /></div>
        ) : requests.length === 0 ? (
          <p className="text-center text-xs py-4" style={{ color: "rgba(212,175,55,0.4)" }}>{t.noRequests}</p>
        ) : requests.map((req) => {
          const cfg = STATUS_CFG[req.status] || STATUS_CFG.submitted;
          const Icon = cfg.icon;
          return (
            <div key={req.id} className="flex items-center justify-between p-3 rounded-2xl gap-2"
              style={{ background: "rgba(10,15,30,0.55)", border: "1px solid rgba(212,175,55,0.1)" }}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{t.types[req.request_type as keyof typeof t.types] || req.request_type}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "rgba(212,175,55,0.5)" }}>
                  {new Date(req.requested_at).toLocaleDateString(language === "ar" ? "ar-EG" : language === "fr" ? "fr-BE" : "nl-BE")}
                </p>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-bold flex-shrink-0"
                style={{ background: `${cfg.color}1f`, border: `1px solid ${cfg.color}55`, color: cfg.color }}>
                <Icon className="w-3 h-3" />
                {t.statuses[req.status as keyof typeof t.statuses] || req.status}
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
