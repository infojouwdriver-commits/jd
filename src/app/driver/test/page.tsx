
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TestTube, Loader2, CheckCircle2, XCircle, AlertCircle, Download, MapPin, Clock, FileText, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useLanguage } from '@/contexts/LanguageContext';
import { driverTranslations } from '@/locales/driver';
import { motion, AnimatePresence } from 'framer-motion';

interface TestResult {
  ritnummer: string; status: 'success' | 'failed'; vertrek?: boolean; aankomst?: boolean;
  error?: string; startAddress?: string; endAddress?: string; startTime?: string; endTime?: string;
  startLat?: number; startLon?: number; endLat?: number; endLon?: number;
}

interface LatestReportResponse {
  hasReport: boolean; message?: string;
  report?: { id: number; reportDate: string; totalMessages: number; successCount: number; failedCount: number; reportStatus: string; reportPdfUrl: string | null; submittedToMunicipality: boolean; submissionDate?: string; notes?: string; createdAt: string };
  results?: TestResult[];
}

const glassCard = {
  background: 'rgba(10,15,30,0.7)', backdropFilter: 'blur(20px)',
  border: '1px solid rgba(212,175,55,0.12)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
};

export default function DriverTestPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
  const t = driverTranslations[language];
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<LatestReportResponse | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => { if (!isLoading && !user) router.push('/driver-login'); }, [user, isLoading, router]);

  useEffect(() => { if (user) fetchLatestReport(); }, [user]);

  const fetchLatestReport = async () => {
    setLoading(true);
    try {
      const response = await api.get<LatestReportResponse>('/test-trips/latest-report');
      setReportData(response);
    } catch (error: any) {
      toast.error(error.message || (language === 'nl' ? 'Fout bij laden rapport' : 'Erreur lors du chargement du rapport'));
    } finally { setLoading(false); }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleTimeString(language === 'nl' ? 'nl-BE' : 'fr-BE', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString(language === 'nl' ? 'nl-BE' : 'fr-BE', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const downloadReport = async () => {
    if (!reportData?.report?.reportPdfUrl) { toast.error(language === 'nl' ? 'Geen rapport beschikbaar' : 'Aucun rapport disponible'); return; }
    setDownloading(true);
    try {
      window.open(reportData.report.reportPdfUrl, '_blank');
      toast.success(language === 'nl' ? 'Rapport geopend in nieuw venster' : 'Rapport ouvert dans une nouvelle fenêtre');
    } catch (error) { toast.error(language === 'nl' ? 'Rapport openen mislukt' : "Échec de l'ouverture du rapport"); }
    finally { setDownloading(false); }
  };

  if (isLoading || loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
        <TestTube className="w-10 h-10" style={{ color: '#d4af37' }} />
      </motion.div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">

      {/* Hero Card */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, type: 'spring' }}>
        <div className="p-8 rounded-3xl mb-6 text-center overflow-hidden relative" style={{ ...glassCard, border: '1px solid rgba(212,175,55,0.25)' }}>
          <motion.div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl" style={{ background: 'rgba(212,175,55,0.1)', marginRight: '-6rem', marginTop: '-6rem' }} animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 4, repeat: Infinity }} />
          <motion.div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl" style={{ background: 'rgba(168,85,247,0.08)', marginLeft: '-4rem', marginBottom: '-4rem' }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 5, repeat: Infinity, delay: 2 }} />
          <div className="relative z-10">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', boxShadow: '0 0 30px rgba(212,175,55,0.2)' }}
            >
              <TestTube className="w-10 h-10" style={{ color: '#d4af37' }} />
            </motion.div>
            <h1 className="text-2xl font-black mb-2"
              style={{ background: 'linear-gradient(90deg, #b8860b, #d4af37, #ffd700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              {t.acceptanceTest}
            </h1>
            <p className="text-sm" style={{ color: 'rgba(212,175,55,0.5)' }}>{t.testDescription}</p>
          </div>
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="p-5 rounded-3xl mb-5" style={glassCard}>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
                <AlertCircle className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-white text-sm">{t.whatIsTest}</h3>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{t.testExplanation}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)' }}>
                <FileText className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-white text-sm">{language === 'nl' ? 'Belangrijk' : 'Important'}</h3>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {language === 'nl' ? 'U kunt alleen uw laatste testrapport bekijken en downloaden. Voor een nieuwe test moet u contact opnemen met de beheerder.' : "Vous ne pouvez consulter et télécharger que votre dernier rapport de test. Pour un nouveau test, veuillez contacter l'administrateur."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {!reportData?.hasReport ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="p-8 rounded-3xl text-center" style={glassCard}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)' }}>
              <FileText className="w-8 h-8" style={{ color: 'rgba(212,175,55,0.4)' }} />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">
              {language === 'nl' ? 'Geen testrapport beschikbaar' : 'Aucun rapport de test disponible'}
            </h3>
            <p className="text-sm" style={{ color: 'rgba(212,175,55,0.5)' }}>
              {reportData?.message || (language === 'nl' ? 'Neem contact op met de beheerder om een acceptatietest uit te voeren.' : "Contactez l'administrateur pour effectuer un test d'acceptation.")}
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {/* Report Status Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="p-6 rounded-3xl" style={{ ...glassCard, border: reportData.report?.reportStatus === 'completed' ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(234,179,8,0.3)' }}>
              <div className="flex items-center gap-4 mb-4">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={reportData.report?.reportStatus === 'completed' ? { background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)' } : { background: 'rgba(234,179,8,0.2)', border: '1px solid rgba(234,179,8,0.4)' }}
                >
                  {reportData.report?.reportStatus === 'completed' ? <CheckCircle2 className="w-8 h-8 text-green-400" /> : <AlertCircle className="w-8 h-8 text-yellow-400" />}
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1 text-white">
                    {reportData.report?.reportStatus === 'completed' ? (language === 'nl' ? 'Test voltooid' : 'Test terminé') : (language === 'nl' ? 'Test in behandeling' : 'Test en cours')}
                  </h3>
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(212,175,55,0.5)' }}>
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(reportData.report?.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-2xl" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <p className="text-xs mb-1 text-green-400">{t.successfulMessages}</p>
                  <p className="text-2xl font-black text-green-400">{reportData.report?.successCount}</p>
                </div>
                <div className="p-3 rounded-2xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <p className="text-xs mb-1 text-red-400">{t.failedMessages}</p>
                  <p className="text-2xl font-black text-red-400">{reportData.report?.failedCount}</p>
                </div>
              </div>

              {reportData.report?.submittedToMunicipality && (
                <div className="p-3 rounded-2xl flex items-center gap-2" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  <p className="text-sm text-blue-300">
                    {language === 'nl' ? `Ingediend bij gemeente op ${formatDate(reportData.report?.submissionDate)}` : `Soumis à la commune le ${formatDate(reportData.report?.submissionDate)}`}
                  </p>
                </div>
              )}

              {reportData.report?.notes && (
                <div className="mt-3 p-3 rounded-2xl" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)' }}>
                  <p className="text-xs mb-1" style={{ color: 'rgba(212,175,55,0.5)' }}>{language === 'nl' ? 'Opmerkingen' : 'Remarques'}</p>
                  <p className="text-sm text-white">{reportData.report.notes}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Trip Results */}
          {reportData.results && reportData.results.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="p-5 rounded-3xl" style={glassCard}>
                <h3 className="font-semibold mb-4 text-white">{t.tripDetails}</h3>
                <div className="space-y-3">
                  {reportData.results.map((result, index) => (
                    <div key={index} className="p-4 rounded-2xl" style={result.status === 'success' ? { background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' } : { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {result.status === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                          <span className="font-semibold text-sm text-white">{t.trip} #{index + 1}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={result.status === 'success' ? { background: 'rgba(34,197,94,0.15)', color: '#4ade80' } : { background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                          {result.status === 'success' ? t.success : t.failed}
                        </span>
                      </div>

                      {result.status === 'success' && (
                        <>
                          <div className="space-y-2 mb-3">
                            {[
                              { color: '#4ade80', label: language === 'nl' ? 'Vertrek' : 'Départ', address: result.startAddress, lat: result.startLat, lon: result.startLon },
                              { color: '#c084fc', label: language === 'nl' ? 'Aankomst' : 'Arrivée', address: result.endAddress, lat: result.endLat, lon: result.endLon },
                            ].map((item, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: item.color }} />
                                <div className="flex-1">
                                  <p className="text-xs mb-0.5" style={{ color: 'rgba(212,175,55,0.5)' }}>{item.label}</p>
                                  <p className="text-sm font-medium text-white">{item.address}</p>
                                  {item.lat !== undefined && item.lon !== undefined && (
                                    <p className="text-xs mt-0.5" style={{ color: 'rgba(212,175,55,0.4)' }}>{item.lat?.toFixed(6)}, {item.lon?.toFixed(6)}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 pt-2" style={{ borderTop: '1px solid rgba(212,175,55,0.1)' }}>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" style={{ color: 'rgba(212,175,55,0.5)' }} />
                              <span className="text-xs" style={{ color: 'rgba(212,175,55,0.6)' }}>{formatTime(result.startTime)}</span>
                            </div>
                            <span className="text-xs" style={{ color: 'rgba(212,175,55,0.3)' }}>→</span>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" style={{ color: 'rgba(212,175,55,0.5)' }} />
                              <span className="text-xs" style={{ color: 'rgba(212,175,55,0.6)' }}>{formatTime(result.endTime)}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            {result.vertrek && <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>✓ {language === 'nl' ? 'Vertrek' : 'Départ'}</span>}
                            {result.aankomst && <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(168,85,247,0.15)', color: '#c084fc' }}>✓ {language === 'nl' ? 'Aankomst' : 'Arrivée'}</span>}
                          </div>
                        </>
                      )}
                      {result.error && <p className="text-xs text-red-400 font-mono mt-2">{result.error}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Download Button */}
          {reportData.report?.reportPdfUrl && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <button onClick={downloadReport} disabled={downloading}
                className="w-full h-14 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #b8860b, #d4af37)', color: '#1a1200', boxShadow: '0 8px 24px rgba(212,175,55,0.4)' }}
              >
                {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {t.downloadReport}
              </button>
            </motion.div>
          )}

          {/* Contact Info */}
          <div className="p-4 rounded-2xl text-center" style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.1)' }}>
            <p className="text-sm" style={{ color: 'rgba(212,175,55,0.5)' }}>
              {language === 'nl' ? 'Voor een nieuwe acceptatietest, neem contact op met de systeembeheerder.' : "Pour un nouveau test d'acceptation, contactez l'administrateur système."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
