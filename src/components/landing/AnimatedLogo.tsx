
"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const LOGO_URL =
  "https://cdn.chat2db-ai.com/app/avatar/custom/7347d0be-473d-488e-83d8-d3186ec96765_737955.png";

interface AnimatedLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
}

export default function AnimatedLogo({
  size = "md",
  showText = true,
  href = "/",
}: AnimatedLogoProps) {
  const sizeMap = {
    sm: { outer: 44, inner: 36, text: "text-base" },
    md: { outer: 56, inner: 46, text: "text-lg" },
    lg: { outer: 80, inner: 66, text: "text-2xl" },
  };
  const s = sizeMap[size];

  const content = (
    <div className="flex items-center gap-3 cursor-pointer select-none">
      <div className="relative flex items-center justify-center" style={{ width: s.outer, height: s.outer }}>
        {/* Spinning conic ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: s.outer,
            height: s.outer,
            background: "conic-gradient(from 0deg, #D4AF37, #FFD700, #FFA500, transparent 60%, #D4AF37)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
        />
        {/* Pulsing glow */}
        <motion.div
          className="absolute rounded-full"
          style={{ width: s.outer, height: s.outer }}
          animate={{
            boxShadow: [
              "0 0 8px rgba(212,175,55,0.3)",
              "0 0 22px rgba(212,175,55,0.7), 0 0 40px rgba(212,175,55,0.3)",
              "0 0 8px rgba(212,175,55,0.3)",
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* White bg circle */}
        <div
          className="absolute rounded-full bg-white"
          style={{ width: s.inner + 4, height: s.inner + 4 }}
        />
        {/* Logo image */}
        <motion.div
          className="relative z-10 rounded-full overflow-hidden bg-white flex items-center justify-center"
          style={{ width: s.inner, height: s.inner }}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGO_URL}
            alt="JouwDriver"
            className="w-full h-full object-contain p-0.5"
          />
        </motion.div>
        {/* Orbit dots */}
        {[0, 90, 180, 270].map((deg, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-yellow-400"
            style={{
              top: "50%",
              left: "50%",
              transformOrigin: `0 ${s.outer / 2}px`,
              transform: `rotate(${deg}deg) translateY(-${s.outer / 2}px) translate(-50%,-50%)`,
            }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.6, 1.4, 0.6] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.45, ease: "easeInOut" }}
          />
        ))}
      </div>

      {showText && (
        <motion.div
          className="flex flex-col leading-none"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className={`font-black tracking-tight text-white ${s.text}`}>
            Jouw
            <motion.span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(90deg, #D4AF37, #FFD700, #FFA500, #D4AF37)",
                backgroundSize: "200% 100%",
              }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              Driver
            </motion.span>
          </span>
          <motion.span
            className="text-yellow-400/40 font-mono tracking-widest"
            style={{ fontSize: 7 }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            TAXI PLATFORM
          </motion.span>
        </motion.div>
      )}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
