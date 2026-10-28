"use client";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { shiftCopy } from "@/components/driver/shift-copy";
export default function DriverHomePage() {
  const { language } = useLanguage();
  return <div className="mx-4 my-4"><Link href="/driver/shifts" className="dp-card dp-text flex items-center gap-3 p-4"><ClipboardList aria-hidden="true"/>{shiftCopy[language].history}</Link></div>;
}
