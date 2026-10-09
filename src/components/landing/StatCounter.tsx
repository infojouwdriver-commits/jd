
"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface StatCounterProps {
  value: number;
  suffix?: string;
  label: string;
  delay?: number;
}

export default function StatCounter({ value, suffix = "", label, delay = 0 }: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    if (!isInView) return;
    const start = prevValue.current;
    const end = value;
    if (start === end) return;

    const duration = 1800;
    const steps = 60;
    const increment = (end - start) / steps;
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        setCount(end);
        prevValue.current = end;
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="text-center"
    >
      <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-white/50 mt-2 font-medium">{label}</div>
    </motion.div>
  );
}
