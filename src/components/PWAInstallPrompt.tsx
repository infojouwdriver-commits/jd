
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Download, Share, Plus } from 'lucide-react';

const LOGO_URL = 'https://cdn.chat2db-ai.com/app/avatar/custom/16eda623-2b94-41ea-8390-395dcb708494_737955.png';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');

    setIsIOS(ios);
    setIsInstalled(standalone);

    if (standalone || dismissed) return;

    if (ios) {
      setTimeout(() => setShowPrompt(true), 3000);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 120, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-[9998] px-4"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <div
          className="rounded-3xl p-5 mx-auto max-w-sm"
          style={{
            background: 'rgba(5,10,20,0.97)',
            border: '1px solid rgba(212,175,55,0.25)',
            backdropFilter: 'blur(32px)',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.1)',
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0"
              style={{ border: '1px solid rgba(212,175,55,0.3)' }}
            >
              <Image src={LOGO_URL} alt="Jouw Driver" width={56} height={56} className="object-contain w-full h-full" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-base mb-0.5">Jouw Driver</h3>
              <p className="text-xs" style={{ color: 'rgba(212,175,55,0.6)' }}>
                {isIOS
                  ? 'Voeg toe aan beginscherm voor de beste ervaring'
                  : 'Installeer de app voor snellere toegang'}
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {isIOS ? (
            <div className="mt-4 p-3 rounded-2xl" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)' }}>
              <p className="text-xs text-white mb-2 font-medium">Hoe installeren op iPhone/iPad:</p>
              <div className="space-y-1.5">
                {[
                  { icon: Share, text: 'Tik op het Deel-icoon onderaan' },
                  { icon: Plus, text: 'Kies "Zet op beginscherm"' },
                  { icon: Download, text: 'Tik op "Voeg toe"' },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(212,175,55,0.2)' }}>
                      <step.icon className="w-3 h-3" style={{ color: '#d4af37' }} />
                    </div>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{step.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <motion.button
              onClick={handleInstall}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full h-12 rounded-2xl mt-4 font-bold text-sm overflow-hidden flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #b8860b 0%, #d4af37 50%, #ffd700 100%)',
                color: '#1a1200',
                boxShadow: '0 4px 20px rgba(212,175,55,0.4)',
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
              />
              <Download className="w-4 h-4 relative z-10" />
              <span className="relative z-10">App installeren</span>
            </motion.button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
