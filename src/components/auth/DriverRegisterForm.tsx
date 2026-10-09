
"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  User,
  Building2,
  Car,
  FileText,
  CreditCard,
  ExternalLink,
  Info,
  Shield,
  SkipForward,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuth } from "./AuthProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { landingTranslations } from "@/locales/landing";

// ─── Step schemas ─────────────────────────────────────────────────────────────

const step1Schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  passcode: z.string().length(6).optional(),
});

const step2Schema = z.object({
  full_name: z.string().min(2),
  phone: z.string().min(8),
  company_address: z.string().min(5),
});

const step3Schema = z.object({
  company_name: z.string().min(2),
  vat_number: z.string().min(10),
  kbo_number: z.string().min(8),
  company_email: z.string().email().optional().or(z.literal("")),
  company_phone: z.string().optional(),
});

const step4Schema = z.object({
  chiron_test_client_id: z.string().optional(),
  chiron_test_client_secret: z.string().optional(),
});

const step5Schema = z.object({
  vehicle_brand: z.string().min(2),
  vehicle_model: z.string().min(1),
  plate_number: z.string().min(3),
  vin: z.string().optional(),
  chiron_vehicle_id: z.string().optional(),
});

const step6Schema = z.object({
  driver_license: z.string().min(3),
  tva_number: z.string().optional(),
  bestuurderspas: z.string().optional(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;
type Step4Data = z.infer<typeof step4Schema>;
type Step5Data = z.infer<typeof step5Schema>;
type Step6Data = z.infer<typeof step6Schema>;

interface DriverRegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const SUMUP_PAYMENT_URL = "https://pay.sumup.com/b2c/QNCA1LBO";
const CHIRON_PORTAL_URL = "https://chiron-acc.vlaanderen.be/chiron/raadpleeg";
const STEP_ICONS = [User, Building2, Car, Shield, Car, FileText];
const TOTAL_STEPS = 6;

export function DriverRegisterForm({ onSuccess, onSwitchToLogin }: DriverRegisterFormProps) {
  const { language } = useLanguage();
  const t = landingTranslations[language];
  const { register: registerUser } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [registeredUserId, setRegisteredUserId] = useState<number | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const firstOtpRef = useRef<HTMLInputElement>(null);

  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema) });
  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema) });
  const form3 = useForm<Step3Data>({ resolver: zodResolver(step3Schema) });
  const form4 = useForm<Step4Data>({ resolver: zodResolver(step4Schema) });
  const form5 = useForm<Step5Data>({ resolver: zodResolver(step5Schema) });
  const form6 = useForm<Step6Data>({ resolver: zodResolver(step6Schema) });

  useEffect(() => {
    if (codeSent && firstOtpRef.current) {
      setTimeout(() => firstOtpRef.current?.focus(), 100);
    }
  }, [codeSent]);

  const startCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const sendCode = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post("/auth/send-verification", { email, type: "register" });
      setCodeSent(true);
      startCooldown();
      return true;
    } catch (err: any) {
      setError(err.errorMessage || "Failed to send verification code");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep1 = async (data: Step1Data) => {
    if (data.password !== data.confirmPassword) {
      form1.setError("confirmPassword", { message: t.passwordMismatch });
      return;
    }
    if (!codeSent) {
      await sendCode(data.email);
      return;
    }
    if (!data.passcode || data.passcode.length < 6) {
      form1.setError("passcode", { message: t.required });
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await registerUser(data.email, data.password, data.passcode);
      await api.post("/auth/login", { email: data.email, password: data.password });
      const userData = await api.get<{ id: number; email: string; role: string }>("/auth/user");
      const userId = typeof userData.id === "number" ? userData.id : parseInt(String(userData.id), 10);
      if (!userId || isNaN(userId)) throw new Error("Failed to retrieve user ID after registration");
      setRegisteredUserId(userId);
      setCurrentStep(2);
    } catch (err: any) {
      setError(err.errorMessage || err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2 = () => setCurrentStep(3);
  const handleStep3 = () => setCurrentStep(4);
  const handleStep4 = () => setCurrentStep(5);
  const handleStep5 = () => setCurrentStep(6);

  const handleStep6 = async (data: Step6Data) => {
    if (!registeredUserId) {
      setError("User ID is missing. Please restart the registration process.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const s2 = form2.getValues();
      const s3 = form3.getValues();
      const s4 = form4.getValues();
      const s5 = form5.getValues();

      await api.post("/driver-registration", {
        user_id: registeredUserId,
        full_name: s2.full_name,
        phone: s2.phone,
        company_address: s2.company_address,
        company_name: s3.company_name,
        vat_number: s3.vat_number,
        kbo_number: s3.kbo_number,
        company_email: s3.company_email || undefined,
        company_phone: s3.company_phone || undefined,
        chiron_test_client_id: s4.chiron_test_client_id || undefined,
        chiron_test_client_secret: s4.chiron_test_client_secret || undefined,
        vehicle_brand: s5.vehicle_brand,
        vehicle_model: s5.vehicle_model,
        plate_number: s5.plate_number,
        vin: s5.vin || undefined,
        chiron_vehicle_id: s5.chiron_vehicle_id || undefined,
        driver_license: data.driver_license,
        tva_number: data.tva_number || undefined,
        bestuurderspas: data.bestuurderspas || undefined,
        preferred_language: language,
      });

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.errorMessage || err.message || "Submission failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return <SuccessScreen t={t} onBack={() => onSuccess?.()} />;
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <ProgressHeader currentStep={currentStep} totalSteps={TOTAL_STEPS} t={t} />

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <StepWrapper key="step1">
            <StepHeader icon={User} title={t.step1RegTitle} subtitle={t.step1RegSubtitle} />
            <form onSubmit={form1.handleSubmit(handleStep1)} className="space-y-4">
              <FormField label={t.emailLabel} error={form1.formState.errors.email?.message}>
                <Input
                  type="email"
                  placeholder={t.emailPlaceholder}
                  {...form1.register("email")}
                  disabled={isLoading || codeSent}
                />
              </FormField>
              <FormField label={t.passwordLabel} error={form1.formState.errors.password?.message}>
                <Input
                  type="password"
                  placeholder={t.passwordPlaceholder}
                  {...form1.register("password")}
                  disabled={isLoading || codeSent}
                />
              </FormField>
              <FormField label={t.confirmPasswordLabel} error={form1.formState.errors.confirmPassword?.message}>
                <Input
                  type="password"
                  placeholder={t.confirmPasswordPlaceholder}
                  {...form1.register("confirmPassword")}
                  disabled={isLoading || codeSent}
                />
              </FormField>

              {codeSent && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">
                    {t.verificationSentTo} <span className="font-medium">{form1.watch("email")}</span>
                  </p>
                  <FormField label={t.verificationCodeLabel} error={form1.formState.errors.passcode?.message}>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        disabled={isLoading}
                        value={form1.watch("passcode") || ""}
                        onChange={(v) => form1.setValue("passcode", v)}
                      >
                        <InputOTPGroup className="gap-2">
                          {[0, 1, 2, 3, 4, 5].map((i) => (
                            <InputOTPSlot
                              key={i}
                              ref={i === 0 ? firstOtpRef : undefined}
                              index={i}
                              className="rounded-md border border-input"
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </FormField>
                  <div className="text-center text-sm">
                    <button
                      type="button"
                      onClick={() => sendCode(form1.watch("email"))}
                      disabled={isLoading || resendCooldown > 0}
                      className="text-primary hover:underline disabled:opacity-50"
                    >
                      {resendCooldown > 0
                        ? `${t.resendIn} ${resendCooldown} ${t.seconds}`
                        : t.resendCode}
                    </button>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!codeSent ? t.sendVerificationCode : t.nextButton}
                {!isLoading && codeSent && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>

              {onSwitchToLogin && (
                <p className="text-center text-sm text-muted-foreground">
                  {t.alreadyHaveAccount}{" "}
                  <button type="button" onClick={onSwitchToLogin} className="text-primary hover:underline">
                    {t.loginHere}
                  </button>
                </p>
              )}
            </form>
          </StepWrapper>
        )}

        {currentStep === 2 && (
          <StepWrapper key="step2">
            <StepHeader icon={User} title={t.step2RegTitle} subtitle={t.step2RegSubtitle} />
            <form onSubmit={form2.handleSubmit(handleStep2)} className="space-y-4">
              <FormField label={t.fullNameLabel} error={form2.formState.errors.full_name?.message}>
                <Input placeholder={t.fullNamePlaceholder} {...form2.register("full_name")} />
              </FormField>
              <FormField label={t.phoneLabel} error={form2.formState.errors.phone?.message}>
                <Input placeholder={t.phonePlaceholder} {...form2.register("phone")} />
              </FormField>
              <FormField label={t.companyAddressLabel} error={form2.formState.errors.company_address?.message}>
                <Input placeholder={t.companyAddressPlaceholder} {...form2.register("company_address")} />
              </FormField>
              <StepNavButtons onBack={() => setCurrentStep(1)} isLoading={isLoading} t={t} />
            </form>
          </StepWrapper>
        )}

        {currentStep === 3 && (
          <StepWrapper key="step3">
            <StepHeader icon={Building2} title={t.step3RegTitle} subtitle={t.step3RegSubtitle} />
            <form onSubmit={form3.handleSubmit(handleStep3)} className="space-y-4">
              <FormField label={t.companyNameLabel} error={form3.formState.errors.company_name?.message}>
                <Input placeholder={t.companyNamePlaceholder} {...form3.register("company_name")} />
              </FormField>
              <FormField label={t.vatNumberLabel} error={form3.formState.errors.vat_number?.message}>
                <Input placeholder={t.vatNumberPlaceholder} {...form3.register("vat_number")} />
              </FormField>
              <FormField label={t.kboNumberLabel} error={form3.formState.errors.kbo_number?.message}>
                <Input placeholder={t.kboNumberPlaceholder} {...form3.register("kbo_number")} />
              </FormField>
              <FormField label={t.companyEmailLabel} error={form3.formState.errors.company_email?.message}>
                <Input type="email" placeholder={t.companyEmailPlaceholder} {...form3.register("company_email")} />
              </FormField>
              <FormField label={t.companyPhoneLabel} error={form3.formState.errors.company_phone?.message}>
                <Input placeholder={t.companyPhonePlaceholder} {...form3.register("company_phone")} />
              </FormField>
              <StepNavButtons onBack={() => setCurrentStep(2)} isLoading={isLoading} t={t} />
            </form>
          </StepWrapper>
        )}

        {currentStep === 4 && (
          <StepWrapper key="step4">
            <StepHeader icon={Shield} title={t.step4RegTitle} subtitle={t.step4RegSubtitle} />
            <form onSubmit={form4.handleSubmit(handleStep4)} className="space-y-4">
              {/* Chiron info box */}
              <div className="rounded-xl border border-blue-400/30 bg-blue-400/5 p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Info className="h-4 w-4" />
                  {t.chironInfoTitle}
                </h4>
                <p className="text-sm text-muted-foreground">{t.chironInfoDesc}</p>
                <a
                  href={CHIRON_PORTAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg border border-blue-400/50 hover:bg-blue-400/10 text-blue-600 dark:text-blue-400 font-medium text-sm transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t.chironPortalButton}
                </a>
              </div>

              <FormField label={t.chironClientIdLabel} error={form4.formState.errors.chiron_test_client_id?.message}>
                <Input
                  placeholder={t.chironClientIdPlaceholder}
                  {...form4.register("chiron_test_client_id")}
                  dir="ltr"
                />
              </FormField>
              <FormField label={t.chironClientSecretLabel} error={form4.formState.errors.chiron_test_client_secret?.message}>
                <Input
                  type="password"
                  placeholder={t.chironClientSecretPlaceholder}
                  {...form4.register("chiron_test_client_secret")}
                  dir="ltr"
                />
              </FormField>

              {/* Optional note */}
              <div className="rounded-lg bg-muted/50 p-3 flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">{t.chironOptionalNote}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(3)} disabled={isLoading} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t.backButton}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCurrentStep(5)}
                  disabled={isLoading}
                  className="flex-1 text-muted-foreground"
                >
                  <SkipForward className="mr-2 h-4 w-4" />
                  {t.chironSkipButton}
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t.nextButton}
                  {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </form>
          </StepWrapper>
        )}

        {currentStep === 5 && (
          <StepWrapper key="step5">
            <StepHeader icon={Car} title={t.step5RegTitle} subtitle={t.step5RegSubtitle} />
            <form onSubmit={form5.handleSubmit(handleStep5)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField label={t.vehicleBrandLabel} error={form5.formState.errors.vehicle_brand?.message}>
                  <Input placeholder={t.vehicleBrandPlaceholder} {...form5.register("vehicle_brand")} />
                </FormField>
                <FormField label={t.vehicleModelLabel} error={form5.formState.errors.vehicle_model?.message}>
                  <Input placeholder={t.vehicleModelPlaceholder} {...form5.register("vehicle_model")} />
                </FormField>
              </div>
              <FormField label={t.plateNumberLabel} error={form5.formState.errors.plate_number?.message}>
                <Input placeholder={t.plateNumberPlaceholder} {...form5.register("plate_number")} />
              </FormField>
              <FormField label={t.vinLabel} error={form5.formState.errors.vin?.message}>
                <Input placeholder={t.vinPlaceholder} {...form5.register("vin")} />
              </FormField>
              <FormField label={t.chironVehicleIdLabel} error={form5.formState.errors.chiron_vehicle_id?.message}>
                <Input placeholder={t.chironVehicleIdPlaceholder} {...form5.register("chiron_vehicle_id")} />
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  {t.chironVehicleIdHelp}
                </p>
              </FormField>
              <StepNavButtons onBack={() => setCurrentStep(4)} isLoading={isLoading} t={t} />
            </form>
          </StepWrapper>
        )}

        {currentStep === 6 && (
          <StepWrapper key="step6">
            <StepHeader icon={FileText} title={t.step6RegTitle} subtitle={t.step6RegSubtitle} />
            <form onSubmit={form6.handleSubmit(handleStep6)} className="space-y-4">
              <FormField label={t.driverLicenseLabel} error={form6.formState.errors.driver_license?.message}>
                <Input placeholder={t.driverLicensePlaceholder} {...form6.register("driver_license")} />
              </FormField>
              <FormField label={t.tvaNumberLabel} error={form6.formState.errors.tva_number?.message}>
                <Input placeholder={t.tvaNumberPlaceholder} {...form6.register("tva_number")} />
              </FormField>
              <FormField label={t.bestuurderspasLabel} error={form6.formState.errors.bestuurderspas?.message}>
                <Input placeholder={t.bestuurderspasPlaceholder} {...form6.register("bestuurderspas")} />
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  {t.bestuurderspasHelp}
                </p>
              </FormField>

              {/* Payment section */}
              <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/5 p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-yellow-500" />
                  {t.paymentSectionTitle}
                </h4>
                <p className="text-sm text-muted-foreground">{t.paymentSectionDesc}</p>
                <a
                  href={SUMUP_PAYMENT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-semibold text-sm transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t.paymentButton}
                </a>
                <p className="text-xs text-muted-foreground text-center">{t.paymentNote}</p>
              </div>

              <StepNavButtons
                onBack={() => setCurrentStep(5)}
                isLoading={isLoading}
                t={t}
                isLastStep
              />
            </form>
          </StepWrapper>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressHeader({ currentStep, totalSteps, t }: { currentStep: number; totalSteps: number; t: any }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">
          {t.step} {currentStep} {t.of} {totalSteps}
        </span>
        <span className="text-sm font-medium text-primary">
          {Math.round((currentStep / totalSteps) * 100)}%
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <motion.div
          className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between mt-3">
        {STEP_ICONS.map((Icon, i) => (
          <div
            key={i}
            className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
              i + 1 < currentStep
                ? "bg-yellow-400 border-yellow-400 text-black"
                : i + 1 === currentStep
                ? "border-yellow-400 text-yellow-400"
                : "border-muted text-muted-foreground"
            }`}
          >
            {i + 1 < currentStep ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Icon className="h-4 w-4" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StepWrapper({ children, key }: { children: React.ReactNode; key: string }) {
  return (
    <motion.div
      key={key}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
}

function StepHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function StepNavButtons({
  onBack,
  isLoading,
  t,
  isLastStep = false,
}: {
  onBack: () => void;
  isLoading: boolean;
  t: any;
  isLastStep?: boolean;
}) {
  return (
    <div className="flex gap-3 pt-2">
      <Button type="button" variant="outline" onClick={onBack} disabled={isLoading} className="flex-1">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t.backButton}
      </Button>
      <Button type="submit" disabled={isLoading} className="flex-1">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLastStep ? t.submitButton : t.nextButton}
        {!isLoading && !isLastStep && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
    </div>
  );
}

function SuccessScreen({ t, onBack }: { t: any; onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8 space-y-4"
    >
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
      </div>
      <h3 className="text-2xl font-bold">{t.successTitle}</h3>
      <p className="text-muted-foreground text-sm max-w-sm mx-auto">{t.successMessage}</p>
      <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
        <p className="text-sm text-muted-foreground">
          {t.successWhatsapp}{" "}
          <a
            href="https://wa.me/32465555596"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-500 font-semibold hover:underline"
          >
            +32465.55.55.96
          </a>
        </p>
      </div>
      <Button variant="outline" onClick={onBack} className="w-full">
        {t.backToHome}
      </Button>
    </motion.div>
  );
}
