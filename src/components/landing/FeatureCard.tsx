
"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  delay?: number;
  href?: string;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
  delay = 0,
  href,
}: FeatureCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) router.push(href);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={handleClick}
      className={`relative group ${href ? "cursor-pointer" : "cursor-default"}`}
    >
      <div className="relative p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden transition-all duration-300 group-hover:border-yellow-400/30 group-hover:bg-white/8">
        <div
          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${gradient} blur-xl`}
          style={{ zIndex: 0 }}
        />
        <div className="relative z-10">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
          <p className="text-sm text-white/60 leading-relaxed">{description}</p>
          {href && (
            <div className="mt-4 flex items-center gap-1 text-yellow-400/70 text-xs font-medium group-hover:text-yellow-400 transition-colors">
              <span>En savoir plus</span>
              <svg
                className="w-3 h-3 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
