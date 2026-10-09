
'use client';

import {sanitizeHtml} from "@/lib/sanitize-html";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Shield,
  Calendar,
  User,
  Mail,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';

interface SignatureInfo {
  signer_name: string;
  signer_email: string;
  signer_position?: string;
  signed_at: string;
}

interface ContractData {
  contract: {
    id: number;
    contract_number: string;
    contract_start_date: string;
    contract_end_date: string;
    monthly_fee: number;
    annual_fee: number;
    contract_html_template: string;
    contract_language: string;
    contract_status: string;
  };
  company: {
    name: string;
    email: string;
    vat_number: string;
    kbo_number: string;
  };
  isAlreadySigned: boolean;
  isExpired: boolean;
  signatureInfo?: SignatureInfo;
}

const translations = {
  nl: {
    pageTitle: 'Elektronische Contract Ondertekening',
    contractNumber: 'Contractnummer',
    company: 'Bedrijf',
    kboNumber: 'KBO-nummer',
    startDate: 'Startdatum',
    endDate: 'Einddatum',
    monthlyFee: 'Maandelijkse kosten',
    annualFee: 'Jaarlijkse kosten',
    contractText: 'Contracttekst',
    signerInfo: 'Ondertekenaar Informatie',
    fullName: 'Volledige naam',
    fullNamePlaceholder: 'Voer uw volledige naam in',
    email: 'E-mailadres',
    emailPlaceholder: 'email@voorbeeld.nl',
    position: 'Functie (optioneel)',
    positionPlaceholder: 'Bijv: Algemeen Directeur',
    agreement: 'Ik ga akkoord met alle voorwaarden en bepalingen van het bovenstaande contract en bevestig dat ik deze volledig heb gelezen en begrepen',
    signButton: 'Contract Ondertekenen',
    signing: 'Bezig met ondertekenen...',
    successTitle: 'Succesvol Ondertekend!',
    successMessage: 'Bedankt voor het ondertekenen van het contract. Uw abonnement is geactiveerd en maandelijkse facturen worden automatisch naar u verzonden.',
    errorTitle: 'Verificatiefout',
    invalidLink: 'Ongeldige ondertekeningslink',
    expiredLink: 'De ondertekeningslink is verlopen',
    alreadySigned: 'Contract is al ondertekend',
    verificationFailed: 'Verificatie van ondertekeningslink mislukt',
    fillRequired: 'Vul alle verplichte velden in',
    agreeRequired: 'Ga akkoord met de contractvoorwaarden',
    signFailed: 'Ondertekening van contract mislukt',
    signSuccess: 'Contract succesvol ondertekend! Uw abonnement wordt binnenkort geactiveerd.',
    loading: 'Laden...',
    alreadySignedTitle: 'Contract Reeds Ondertekend',
    alreadySignedMessage: 'Dit contract is al ondertekend. Hieronder vindt u de contractgegevens en ondertekeningsinformatie.',
    signatureDetails: 'Ondertekeningsgegevens',
    signedBy: 'Ondertekend door',
    signedOn: 'Ondertekend op',
    viewContractDetails: 'Contractgegevens Bekijken'
  },
  fr: {
    pageTitle: 'Signature Électronique du Contrat',
    contractNumber: 'Numéro de contrat',
    company: 'Entreprise',
    kboNumber: 'Numéro BCE',
    startDate: 'Date de début',
    endDate: 'Date de fin',
    monthlyFee: 'Frais mensuels',
    annualFee: 'Frais annuels',
    contractText: 'Texte du contrat',
    signerInfo: 'Informations du Signataire',
    fullName: 'Nom complet',
    fullNamePlaceholder: 'Entrez votre nom complet',
    email: 'Adresse e-mail',
    emailPlaceholder: 'email@exemple.fr',
    position: 'Fonction (optionnel)',
    positionPlaceholder: 'Ex: Directeur Général',
    agreement: 'J\'accepte tous les termes et conditions du contrat ci-dessus et confirme que je les ai lus et compris intégralement',
    signButton: 'Signer le Contrat',
    signing: 'Signature en cours...',
    successTitle: 'Signé avec Succès!',
    successMessage: 'Merci d\'avoir signé le contrat. Votre abonnement est activé et les factures mensuelles vous seront envoyées automatiquement.',
    errorTitle: 'Erreur de Vérification',
    invalidLink: 'Lien de signature invalide',
    expiredLink: 'Le lien de signature a expiré',
    alreadySigned: 'Le contrat a déjà été signé',
    verificationFailed: 'Échec de la vérification du lien de signature',
    fillRequired: 'Veuillez remplir tous les champs obligatoires',
    agreeRequired: 'Veuillez accepter les conditions du contrat',
    signFailed: 'Échec de la signature du contrat',
    signSuccess: 'Contrat signé avec succès! Votre abonnement sera activé prochainement.',
    loading: 'Chargement...',
    alreadySignedTitle: 'Contrat Déjà Signé',
    alreadySignedMessage: 'Ce contrat a déjà été signé. Vous trouverez ci-dessous les détails du contrat et les informations de signature.',
    signatureDetails: 'Détails de la Signature',
    signedBy: 'Signé par',
    signedOn: 'Signé le',
    viewContractDetails: 'Voir les Détails du Contrat'
  }
};

export default function SignContractPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signed, setSigned] = useState(false);
  const [language, setLanguage] = useState<'nl' | 'fr'>('nl');

  const [formData, setFormData] = useState({
    signer_name: '',
    signer_email: '',
    signer_position: '',
    agreed: false
  });

  const t = translations[language];

  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  const verifyToken = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/next_api/contracts/verify-token?signature_token=${token}`);
      const result = await response.json();

      if (!result.success) {
        setError(result.errorMessage || t.invalidLink);
        return;
      }

      const contractLang = result.data.contract.contract_language || 'nl';
      setLanguage(contractLang as 'nl' | 'fr');
      setContractData(result.data);
      
      // If not already signed, pre-fill email
      if (!result.data.isAlreadySigned) {
        setFormData({
          ...formData,
          signer_email: result.data.company.email
        });
      }
    } catch (error: any) {
      setError(t.verificationFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!formData.signer_name || !formData.signer_email) {
      toast.error(t.fillRequired);
      return;
    }

    if (!formData.agreed) {
      toast.error(t.agreeRequired);
      return;
    }

    setSigning(true);
    try {
      const response = await fetch('/next_api/contracts/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signature_token: token,
          signer_name: formData.signer_name,
          signer_email: formData.signer_email,
          signer_position: formData.signer_position
        }),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.errorMessage || t.signFailed);
        return;
      }

      setSigned(true);
      toast.success(t.signSuccess);
    } catch (error: any) {
      toast.error(t.signFailed);
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
        <Card className="p-12 rounded-3xl border-0 shadow-xl max-w-md w-full">
          <div className="text-center">
            <div className="w-20 h-20 rounded-3xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t.errorTitle}</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {error}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
        <Card className="p-12 rounded-3xl border-0 shadow-xl max-w-md w-full">
          <div className="text-center">
            <div className="w-20 h-20 rounded-3xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t.successTitle}</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {t.successMessage}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (!contractData) {
    return null;
  }

  // If contract is already signed, show read-only view
  if (contractData.isAlreadySigned && contractData.signatureInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
        <div className="container mx-auto max-w-4xl py-8">
          {/* Already Signed Banner */}
          <Card className="p-8 rounded-3xl border-0 shadow-xl mb-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-green-900 dark:text-green-100 mb-1">
                  {t.alreadySignedTitle}
                </h2>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  {t.alreadySignedMessage}
                </p>
              </div>
            </div>
          </Card>

          {/* Contract Details */}
          <Card className="p-8 rounded-3xl border-0 shadow-xl mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {t.viewContractDetails}
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  {contractData.contract.contract_number}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{t.company}</p>
                <p className="font-semibold">{contractData.company.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{t.kboNumber}</p>
                <p className="font-semibold">{contractData.company.kbo_number}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{t.startDate}</p>
                <p className="font-semibold">{new Date(contractData.contract.contract_start_date).toLocaleDateString(language === 'nl' ? 'nl-BE' : 'fr-BE')}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{t.endDate}</p>
                <p className="font-semibold">{new Date(contractData.contract.contract_end_date).toLocaleDateString(language === 'nl' ? 'nl-BE' : 'fr-BE')}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{t.monthlyFee}</p>
                <p className="font-semibold text-blue-600 dark:text-blue-400">€{contractData.contract.monthly_fee.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{t.annualFee}</p>
                <p className="font-semibold text-blue-600 dark:text-blue-400">€{contractData.contract.annual_fee.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          {/* Signature Information */}
          <Card className="p-8 rounded-3xl border-0 shadow-xl mb-6">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              {t.signatureDetails}
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t.signedBy}</p>
                  <p className="font-semibold">{contractData.signatureInfo.signer_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <Mail className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t.email}</p>
                  <p className="font-semibold">{contractData.signatureInfo.signer_email}</p>
                </div>
              </div>

              {contractData.signatureInfo.signer_position && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <Briefcase className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t.position}</p>
                    <p className="font-semibold">{contractData.signatureInfo.signer_position}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm text-green-700 dark:text-green-300">{t.signedOn}</p>
                  <p className="font-semibold text-green-900 dark:text-green-100">
                    {new Date(contractData.signatureInfo.signed_at).toLocaleString(language === 'nl' ? 'nl-BE' : 'fr-BE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Contract Text */}
          <Card className="p-8 rounded-3xl border-0 shadow-xl">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              {t.contractText}
            </h2>
            <div 
              className="prose dark:prose-invert max-w-none max-h-96 overflow-y-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(contractData.contract.contract_html_template) }}
            />
          </Card>
        </div>
      </div>
    );
  }

  // If contract is expired
  if (contractData.isExpired) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
        <Card className="p-12 rounded-3xl border-0 shadow-xl max-w-md w-full">
          <div className="text-center">
            <div className="w-20 h-20 rounded-3xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t.errorTitle}</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {t.expiredLink}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Normal signing flow
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <Card className="p-8 rounded-3xl border-0 shadow-xl mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t.pageTitle}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {contractData.contract.contract_number}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{t.company}</p>
              <p className="font-semibold">{contractData.company.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{t.kboNumber}</p>
              <p className="font-semibold">{contractData.company.kbo_number}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{t.startDate}</p>
              <p className="font-semibold">{new Date(contractData.contract.contract_start_date).toLocaleDateString(language === 'nl' ? 'nl-BE' : 'fr-BE')}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{t.endDate}</p>
              <p className="font-semibold">{new Date(contractData.contract.contract_end_date).toLocaleDateString(language === 'nl' ? 'nl-BE' : 'fr-BE')}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{t.monthlyFee}</p>
              <p className="font-semibold text-blue-600 dark:text-blue-400">€{contractData.contract.monthly_fee.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{t.annualFee}</p>
              <p className="font-semibold text-blue-600 dark:text-blue-400">€{contractData.contract.annual_fee.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-8 rounded-3xl border-0 shadow-xl mb-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            {t.contractText}
          </h2>
          <div 
            className="prose dark:prose-invert max-w-none max-h-96 overflow-y-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(contractData.contract.contract_html_template) }}
          />
        </Card>

        <Card className="p-8 rounded-3xl border-0 shadow-xl">
          <h2 className="text-lg font-bold mb-6">{t.signerInfo}</h2>
          
          <div className="space-y-4">
            <div>
              <Label>{t.fullName} *</Label>
              <Input
                value={formData.signer_name}
                onChange={(e) => setFormData({...formData, signer_name: e.target.value})}
                placeholder={t.fullNamePlaceholder}
                className="rounded-2xl"
              />
            </div>

            <div>
              <Label>{t.email} *</Label>
              <Input
                type="email"
                value={formData.signer_email}
                onChange={(e) => setFormData({...formData, signer_email: e.target.value})}
                placeholder={t.emailPlaceholder}
                className="rounded-2xl"
              />
            </div>

            <div>
              <Label>{t.position}</Label>
              <Input
                value={formData.signer_position}
                onChange={(e) => setFormData({...formData, signer_position: e.target.value})}
                placeholder={t.positionPlaceholder}
                className="rounded-2xl"
              />
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <input
                type="checkbox"
                id="agreed"
                checked={formData.agreed}
                onChange={(e) => setFormData({...formData, agreed: e.target.checked})}
                className="mt-1"
              />
              <Label htmlFor="agreed" className="cursor-pointer">
                {t.agreement}
              </Label>
            </div>

            <Button
              onClick={handleSign}
              disabled={signing || !formData.agreed}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 h-12 text-lg"
            >
              {signing ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  {t.signing}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 ml-2" />
                  {t.signButton}
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
