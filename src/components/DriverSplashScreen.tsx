
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

const LOGO_URL =
  'https://cdn.chat2db-ai.com/app/avatar/custom/16eda623-2b94-41ea-8390-395dcb708494_737955.png';

// عرض أدنى قصير جدًا فقط لتفادي الوميض، ثم نخفي الـ splash فور الجاهزية
const MIN_DISPLAY_MS = 350;
// أقصى مدة كحماية في حال تعطّل التحميل
const MAX_DISPLAY_MS = 5000;

interface DriverSplashScreenProps {
  onComplete: () => void;
  isReady?: boolean;
}

export default function DriverSplashScreen({ onComplete, isReady }: DriverSplashScreenProps) {
  const [show, setShow] = useState(true);
  const mountTimeRef = useRef(Date.now());
  const dismissedRef = useRef(false);

  const dismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setShow(false);
    // المدة هنا تخص animation الخروج فقط
    setTimeout(onComplete, 250);
  }, [onComplete]);

  // حماية: لا تظهر شاشة التحميل أبدًا أطول من MAX_DISPLAY_MS
  useEffect(() => {
    const timer = setTimeout(dismiss, MAX_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [dismiss]);

  // إخفاء الـ splash فور إشارة التطبيق بالجاهزية مع احترام حد أدنى صغير لمنع الوميض
  useEffect(() => {
    if (!isReady) return;
    const elapsed = Date.now() - mountTimeRef.current;
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
    const timer = setTimeout(dismiss, remaining);
    return () => clearTimeout(timer);
  }, [isReady, dismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, #020817 0%, #0a0f1e 50%, #050d1a 100%)',
          }}
        >
          {/* توهج خفيف خلف اللوغو */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(212,175,55,0.18), transparent 55%)',
            }}
          />

          {/* المحتوى الرئيسي */}
          <div className="relative z-10 flex flex-col items-center gap-6 px-6">
            {/* اللوغو */}
            <div
              className="relative w-24 h-24 rounded-3xl overflow-hidden flex items-center justify-center"
              style={{
                background: 'rgba(15,23,42,0.7)',
                border: '1px solid rgba(212,175,55,0.3)',
                boxShadow:
                  '0 0 32px rgba(212,175,55,0.25), inset 0 0 16px rgba(212,175,55,0.05)',
              }}
            >
              <Image
                src={LOGO_URL}
                alt="Jouw Driver"
                width={96}
                height={96}
                className="object-contain w-full h-full p-1.5"
                priority
              />
            </div>

            {/* اسم التطبيق */}
            <div className="text-center">
              <h1
                className="text-3xl font-black tracking-tight mb-1"
                style={{
                  background:
                    'linear-gradient(90deg, #b8860b 0%, #d4af37 50%, #ffd700 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Jouw Driver
              </h1>
              <p
                className="text-[11px] font-medium tracking-widest uppercase"
                style={{ color: 'rgba(212,175,55,0.55)' }}
              >
                Driver Portal
              </p>
            </div>

            {/* مؤشر تحميل خفيف */}
            <div
              className="w-10 h-10 rounded-full border-2 border-yellow-500/20 border-t-yellow-500 animate-spin"
              role="status"
              aria-label="Loading"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
