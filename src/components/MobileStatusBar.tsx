
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Battery, Signal } from 'lucide-react';

export default function MobileStatusBar() {
  const [isOnline, setIsOnline] = useState(true);
  const [time, setTime] = useState('');
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
    setIsOnline(navigator.onLine);

    const updateTime = () => {
      setTime(new Date().toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isStandalone) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-5"
      style={{
        height: 'env(safe-area-inset-top, 44px)',
        paddingTop: '8px',
        background: 'rgba(2,8,23,0.9)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <span className="text-xs font-bold text-white">{time}</span>
      <div className="flex items-center gap-1.5">
        <Signal className="w-3.5 h-3.5 text-white" />
        {isOnline ? (
          <Wifi className="w-3.5 h-3.5 text-white" />
        ) : (
          <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <WifiOff className="w-3.5 h-3.5 text-red-400" />
          </motion.div>
        )}
        <Battery className="w-4 h-4 text-white" />
      </div>
    </div>
  );
}
