
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Car, LogIn } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { DriverRegisterForm } from "@/components/auth/DriverRegisterForm";
import { useLanguage } from "@/contexts/LanguageContext";
import { landingTranslations } from "@/locales/landing";

enum ModeEnum {
  LOGIN = "LOGIN",
  REGISTER = "REGISTER",
  DRIVER_REGISTER = "DRIVER_REGISTER",
  RESET = "RESET",
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultMode?: "login" | "driver-register";
}

export default function LoginModal({ isOpen, onClose, onSuccess, defaultMode = "login" }: LoginModalProps) {
  const { language } = useLanguage();
  const t = landingTranslations[language];
  const [mode, setMode] = useState<ModeEnum>(
    defaultMode === "driver-register" ? ModeEnum.DRIVER_REGISTER : ModeEnum.LOGIN
  );

  const handleSuccess = () => {
    onSuccess();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative rounded-2xl overflow-hidden border border-white/10"
              style={{
                background: "linear-gradient(135deg, rgba(10,15,30,0.98) 0%, rgba(5,10,20,0.98) 100%)",
                boxShadow: "0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.1)",
              }}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>

              {/* Mode Tabs - only show for login/driver-register */}
              {(mode === ModeEnum.LOGIN || mode === ModeEnum.DRIVER_REGISTER) && (
                <div className="flex border-b border-white/10">
                  <button
                    onClick={() => setMode(ModeEnum.LOGIN)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors ${
                      mode === ModeEnum.LOGIN
                        ? "text-yellow-400 border-b-2 border-yellow-400"
                        : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    <LogIn className="h-4 w-4" />
                    {t.navLogin}
                  </button>
                  <button
                    onClick={() => setMode(ModeEnum.DRIVER_REGISTER)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors ${
                      mode === ModeEnum.DRIVER_REGISTER
                        ? "text-yellow-400 border-b-2 border-yellow-400"
                        : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    <Car className="h-4 w-4" />
                    {t.registerTitle}
                  </button>
                </div>
              )}

              <div className="p-5">
                {mode === ModeEnum.LOGIN && (
                  <LoginForm
                    onSuccess={handleSuccess}
                    onSwitchToRegister={() => setMode(ModeEnum.DRIVER_REGISTER)}
                    onForgotPassword={() => setMode(ModeEnum.RESET)}
                  />
                )}
                {mode === ModeEnum.DRIVER_REGISTER && (
                  <DriverRegisterForm
                    onSuccess={() => setMode(ModeEnum.LOGIN)}
                    onSwitchToLogin={() => setMode(ModeEnum.LOGIN)}
                  />
                )}
                {mode === ModeEnum.REGISTER && (
                  <RegisterForm
                    onSuccess={() => setMode(ModeEnum.LOGIN)}
                    onSwitchToLogin={() => setMode(ModeEnum.LOGIN)}
                  />
                )}
                {mode === ModeEnum.RESET && (
                  <ResetPasswordForm
                    onBack={() => setMode(ModeEnum.LOGIN)}
                    onSuccess={() => setMode(ModeEnum.LOGIN)}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
