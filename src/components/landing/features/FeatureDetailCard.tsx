
"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureDetailCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

export default function FeatureDetailCard({
  icon: Icon,
  title,
  description,
  delay = 0,
}: FeatureDetailCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-yellow-400/30 transition-all duration-300"
    >
      <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-yellow-400" />
      </div>
      <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
      <p className="text-white/60 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}
