
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Bot,
  MessageCircle,
  X,
  Send,
  Sparkles,
  CheckCircle,
  XCircle,
  Loader2,
  Building2,
  User,
  Car,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type MessageRole = "user" | "assistant";

interface PendingAction {
  action_id: number;
  action_description: string;
  target_table: string;
  proposed_changes: Record<string, any>;
}

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  pendingAction?: PendingAction;
  isTyping?: boolean;
}

type ConversationStep =
  | "greeting"
  | "ask_problem"
  | "ask_identifier"
  | "searching"
  | "found_entity"
  | "diagnosing"
  | "awaiting_confirm"
  | "done";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  errorMessage?: string;
}

const T = {
  ar: {
    title: "المساعد الذكي",
    subtitle: "مساعد ذكي لحل مشاكلك",
    placeholder: "اكتب رسالتك...",
    send: "إرسال",
    open: "المساعد الذكي",
    close: "إغلاق",
    confirm: "تأكيد التعديل",
    reject: "رفض",
    searching: "جارٍ البحث في قاعدة البيانات...",
    found: "تم العثور على البيانات",
    notFound: "لم يتم العثور على نتائج",
    actionExecuted: "✅ تم تنفيذ التعديل بنجاح وإرسال إشعار للمسؤول على البريد الإلكتروني.",
    actionRejected: "❌ تم رفض التعديل. هل تريد المساعدة في شيء آخر؟",
    greeting:
      "مرحباً! 👋 أنا مساعدك الذكي. يمكنني مساعدتك في البحث عن البيانات وحل المشاكل. كيف يمكنني مساعدتك اليوم؟",
    askIdentifier:
      "لأتمكن من مساعدتك، أحتاج بعض المعلومات التعريفية. هل يمكنك إخباري بـ:\n• اسم الشركة\n• اسم السائق\n• رقم لوحة السيارة\n• أو رقم الرحلة",
    confirmPrompt:
      "⚠️ هل تريد تأكيد هذا الإجراء؟ سيتم إرسال إشعار للمسؤول على البريد الإلكتروني.",
    askMoreDetail: "هل يمكنك وصف المشكلة بشكل أوضح؟ ما الذي تريد تعديله بالضبط؟",
    noChangeNeeded: "حسناً، إذا احتجت أي مساعدة أخرى فأنا هنا. هل تريد البحث عن شيء آخر؟",
    errorOccurred: "حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.",
    newSearch: "بحث جديد",
  },
  fr: {
    title: "Assistant IA",
    subtitle: "Assistant intelligent pour résoudre vos problèmes",
    placeholder: "Écrivez votre message...",
    send: "Envoyer",
    open: "Assistant IA",
    close: "Fermer",
    confirm: "Confirmer la modification",
    reject: "Rejeter",
    searching: "Recherche dans la base de données...",
    found: "Données trouvées",
    notFound: "Aucun résultat trouvé",
    actionExecuted:
      "✅ Modification effectuée avec succès. Une notification a été envoyée à l'administrateur.",
    actionRejected: "❌ Modification rejetée. Puis-je vous aider avec autre chose?",
    greeting:
      "Bonjour! 👋 Je suis votre assistant intelligent. Comment puis-je vous aider aujourd'hui?",
    askIdentifier:
      "Pour vous aider, j'ai besoin d'informations. Pouvez-vous me donner:\n• Le nom de la société\n• Le nom du chauffeur\n• Le numéro de plaque\n• Ou le numéro de course",
    confirmPrompt:
      "⚠️ Voulez-vous confirmer cette action? Une notification sera envoyée à l'administrateur.",
    askMoreDetail:
      "Pouvez-vous décrire le problème plus clairement? Que souhaitez-vous modifier exactement?",
    noChangeNeeded:
      "D'accord, je suis là si vous avez besoin d'aide. Voulez-vous chercher autre chose?",
    errorOccurred: "Une erreur s'est produite. Veuillez réessayer.",
    newSearch: "Nouvelle recherche",
  },
  nl: {
    title: "AI Assistent",
    subtitle: "Intelligente assistent voor uw problemen",
    placeholder: "Schrijf uw bericht...",
    send: "Verzenden",
    open: "AI Assistent",
    close: "Sluiten",
    confirm: "Wijziging bevestigen",
    reject: "Afwijzen",
    searching: "Zoeken in database...",
    found: "Gegevens gevonden",
    notFound: "Geen resultaten gevonden",
    actionExecuted:
      "✅ Wijziging succesvol uitgevoerd. Een melding is verzonden naar de beheerder.",
    actionRejected: "❌ Wijziging afgewezen. Kan ik u ergens anders mee helpen?",
    greeting: "Hallo! 👋 Ik ben uw intelligente assistent. Hoe kan ik u vandaag helpen?",
    askIdentifier:
      "Om u te helpen heb ik informatie nodig. Kunt u opgeven:\n• Bedrijfsnaam\n• Naam van de chauffeur\n• Kenteken\n• Of ritnummer",
    confirmPrompt:
      "⚠️ Wilt u deze actie bevestigen? Er wordt een melding naar de beheerder gestuurd.",
    askMoreDetail:
      "Kunt u het probleem duidelijker beschrijven? Wat wilt u precies wijzigen?",
    noChangeNeeded:
      "Oké, ik ben er als u hulp nodig heeft. Wilt u iets anders zoeken?",
    errorOccurred: "Er is een fout opgetreden. Probeer het opnieuw.",
    newSearch: "Nieuwe zoekopdracht",
  },
};

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${window.location.origin}/next_api${normalizedPath}`;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const result = (await response.json()) as ApiResponse<T>;

  if (!result?.success) {
    throw new Error(result?.errorMessage || "API request failed");
  }

  return result.data as T;
}

function detectSearchIntent(message: string): { type: string | null; term: string } {
  const lower = message.toLowerCase();

  const platePattern = /\b\d[a-z]{3}\d{3}\b|\b[a-z]{1,3}[-\s]?\d{3,4}\b/i;
  if (platePattern.test(message)) {
    return { type: "vehicle", term: message.match(platePattern)?.[0] || message };
  }

  const vehicleWords = [
    "سيارة",
    "لوحة",
    "plate",
    "kenteken",
    "voiture",
    "plaque",
    "vehicle",
    "auto",
  ];
  if (vehicleWords.some((word) => lower.includes(word))) {
    return { type: "vehicle", term: message };
  }

  const driverWords = ["سائق", "driver", "chauffeur", "bestuurder"];
  if (driverWords.some((word) => lower.includes(word))) {
    return { type: "driver", term: message };
  }

  const companyWords = ["شركة", "company", "bedrijf", "société", "entreprise"];
  if (companyWords.some((word) => lower.includes(word))) {
    return { type: "company", term: message };
  }

  const tripWords = ["رحلة", "trip", "rit", "course", "رقم"];
  if (tripWords.some((word) => lower.includes(word))) {
    return { type: "trip", term: message };
  }

  return { type: null, term: message };
}

function detectChangeIntent(message: string): boolean {
  const lower = message.toLowerCase();
  const changeWords = [
    "عدل",
    "غير",
    "تعديل",
    "تغيير",
    "حدث",
    "صحح",
    "اصلح",
    "change",
    "update",
    "modify",
    "fix",
    "correct",
    "edit",
    "wijzig",
    "aanpassen",
    "corrigeer",
    "modifier",
    "changer",
    "corriger",
    "mettre à jour",
    "status",
    "حالة",
    "staat",
  ];
  return changeWords.some((word) => lower.includes(word));
}

function formatEntityInfo(entity: any, type: string): string {
  if (type === "company") {
    return `🏢 **${entity?.name || "N/A"}**\nKBO: ${entity?.kbo_number || "N/A"}\nStatus: ${entity?.status || "N/A"}`;
  }

  if (type === "driver") {
    return `👤 **${entity?.full_name || "N/A"}**\nPhone: ${entity?.phone || "N/A"}\nStatus: ${entity?.status || "N/A"}`;
  }

  if (type === "vehicle") {
    return `🚗 **${entity?.plate_number || "N/A"}**\nBrand: ${entity?.brand || "N/A"} ${entity?.model || ""}\nStatus: ${entity?.status || "N/A"}`;
  }

  if (type === "trip") {
    return `🗺️ **Trip #${entity?.id}**\nStatus: ${entity?.status || "N/A"}\nDate: ${entity?.created_at ? new Date(entity.created_at).toLocaleDateString() : "N/A"}`;
  }

  return JSON.stringify(entity, null, 2);
}

export default function SiteAIAgent() {
  const { language } = useLanguage();
  const t = T[language] || T.nl;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<ConversationStep>("greeting");
  const [foundEntity, setFoundEntity] = useState<{ data: any; type: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addAssistantMessage(t.greeting);
      setStep("ask_problem");
    }
  }, [isOpen, messages.length, t.greeting]);

  function addAssistantMessage(content: string, pendingAction?: PendingAction) {
    setMessages((prev) => [
      ...prev,
      { id: generateId(), role: "assistant", content, timestamp: new Date(), pendingAction },
    ]);
  }

  function addUserMessage(content: string) {
    setMessages((prev) => [
      ...prev,
      { id: generateId(), role: "user", content, timestamp: new Date() },
    ]);
  }

  async function searchEntity(type: string, term: string): Promise<any[]> {
    const params = new URLSearchParams({ search: term, type });
    return apiFetch<any[]>(`/ai-assistant/search?${params.toString()}`);
  }

  async function proposeAction(
    description: string,
    targetTable: string,
    targetId: number,
    changes: any
  ): Promise<number | null> {
    try {
      const data = await apiFetch<{ id?: number }>("/ai-assistant/chat", {
        method: "POST",
        body: JSON.stringify({
          action: "propose_action",
          action_type: targetTable.includes("driver")
            ? "update_driver"
            : targetTable.includes("vehicle")
              ? "update_vehicle"
              : targetTable.includes("company")
                ? "update_company"
                : targetTable.includes("trip")
                  ? "update_trip"
                  : "other",
          action_description: description,
          target_table: targetTable,
          target_record_id: targetId,
          before_data: foundEntity?.data || {},
          proposed_changes: changes,
          user_id: 0,
          conversation_id: 0,
        }),
      });

      return data?.id || null;
    } catch {
      return null;
    }
  }

  async function executeAction(actionId: number) {
    const data = await apiFetch<{ executed?: boolean }>("/ai-assistant/chat", {
      method: "POST",
      body: JSON.stringify({ action: "execute_action", action_id: actionId }),
    });

    if (!data?.executed) {
      throw new Error("Execution failed");
    }
  }

  async function rejectAction(actionId: number) {
    await apiFetch("/ai-assistant/chat", {
      method: "POST",
      body: JSON.stringify({
        action: "reject_action",
        action_id: actionId,
        reason: "User rejected from chat",
      }),
    });
  }

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setInput("");
    addUserMessage(trimmed);
    setIsLoading(true);

    try {
      if (step === "ask_problem" || step === "greeting") {
        setStep("ask_identifier");
        addAssistantMessage(t.askIdentifier);
        return;
      }

      if (step === "ask_identifier") {
        const { type, term } = detectSearchIntent(trimmed);
        const cleanTerm = term.replace(/[^\w\s\-]/g, "").trim() || trimmed;

        if (type) {
          addAssistantMessage(t.searching);
          const results = await searchEntity(type, cleanTerm);

          if (results.length > 0) {
            const entity = results[0];
            setFoundEntity({ data: entity, type });
            setStep("diagnosing");
            addAssistantMessage(
              `${t.found}:\n\n${formatEntityInfo(entity, type)}\n\n${t.askMoreDetail}`
            );
          } else {
            addAssistantMessage(`${t.notFound}. ${t.askIdentifier}`);
          }
        } else {
          addAssistantMessage(t.searching);
          let found = false;

          for (const searchType of ["company", "driver", "vehicle", "trip"]) {
            const results = await searchEntity(searchType, trimmed);

            if (results.length > 0) {
              const entity = results[0];
              setFoundEntity({ data: entity, type: searchType });
              setStep("diagnosing");
              addAssistantMessage(
                `${t.found}:\n\n${formatEntityInfo(entity, searchType)}\n\n${t.askMoreDetail}`
              );
              found = true;
              break;
            }
          }

          if (!found) {
            addAssistantMessage(`${t.notFound}. ${t.askIdentifier}`);
          }
        }
        return;
      }

      if (step === "diagnosing" || step === "found_entity") {
        if (!detectChangeIntent(trimmed)) {
          addAssistantMessage(t.noChangeNeeded);
          return;
        }

        if (!foundEntity) {
          setStep("ask_identifier");
          addAssistantMessage(t.askIdentifier);
          return;
        }

        const tableMap: Record<string, string> = {
          company: "companies",
          driver: "drivers",
          vehicle: "vehicles",
          trip: "trips",
        };

        const targetTable = tableMap[foundEntity.type] || "drivers";
        const targetId = foundEntity?.data?.id || 0;
        const description = trimmed;
        const proposedChanges: Record<string, any> = { note: trimmed };

        const statusMatch =
          trimmed.match(/status[:\s]+(\w+)/i) ||
          trimmed.match(/حالة[:\s]+(\w+)/i) ||
          trimmed.match(/staat[:\s]+(\w+)/i);

        if (statusMatch) {
          proposedChanges.status = statusMatch[1];
        }

        const actionId = await proposeAction(description, targetTable, targetId, proposedChanges);

        if (actionId) {
          setStep("awaiting_confirm");
          addAssistantMessage(
            `📋 **الإجراء المقترح:**\n${description}\n\n**السجل:** ${formatEntityInfo(foundEntity?.data, foundEntity.type)}\n\n${t.confirmPrompt}`,
            {
              action_id: actionId,
              action_description: description,
              target_table: targetTable,
              proposed_changes: proposedChanges,
            }
          );
        } else {
          addAssistantMessage(t.errorOccurred);
        }
        return;
      }

      addAssistantMessage(t.askIdentifier);
    } catch {
      addAssistantMessage(t.errorOccurred);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConfirmAction(actionId: number) {
    setIsLoading(true);
    try {
      await executeAction(actionId);
      addAssistantMessage(t.actionExecuted);
      setStep("done");
      setFoundEntity(null);
    } catch {
      addAssistantMessage(t.errorOccurred);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRejectAction(actionId: number) {
    setIsLoading(true);
    try {
      await rejectAction(actionId);
      addAssistantMessage(t.actionRejected);
      setStep("ask_identifier");
      setFoundEntity(null);
    } catch {
      addAssistantMessage(t.errorOccurred);
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setMessages([]);
    setStep("greeting");
    setFoundEntity(null);
    setInput("");
    addAssistantMessage(t.greeting);
    setStep("ask_problem");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-[70]">
      {isOpen ? (
        <Card className="w-[360px] sm:w-[420px] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[580px]">
          <div className="p-4 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <h3 className="font-semibold text-sm">{t.title}</h3>
                <Badge
                  variant="secondary"
                  className="text-xs bg-white/20 text-white border-0 px-1.5"
                >
                  AI
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/80 hover:bg-white/20 h-7 text-xs px-2"
                  onClick={handleReset}
                >
                  {t.newSearch}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-7 w-7"
                  onClick={() => setIsOpen(false)}
                  aria-label={t.close}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-white/80 mt-1">{t.subtitle}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50 dark:bg-slate-900 min-h-0">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-violet-600 text-white rounded-br-sm"
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-sm"
                  }`}
                >
                  <span className="whitespace-pre-wrap">{msg.content}</span>

                  {msg.pendingAction && step === "awaiting_confirm" && (
                    <div className="mt-3 flex gap-2 flex-wrap pt-2 border-t border-slate-200 dark:border-slate-600">
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg flex-1"
                        onClick={() => handleConfirmAction(msg.pendingAction!.action_id)}
                        disabled={isLoading}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {t.confirm}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg flex-1"
                        onClick={() => handleRejectAction(msg.pendingAction!.action_id)}
                        disabled={isLoading}
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        {t.reject}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-sm px-3 py-2">
                  <div className="flex items-center gap-1">
                    <div
                      className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {(step === "ask_problem" || step === "greeting") && (
            <div className="px-3 pt-2 flex gap-1.5 flex-wrap bg-white dark:bg-slate-900 flex-shrink-0">
              {[
                {
                  icon: Building2,
                  label:
                    language === "ar"
                      ? "بحث شركة"
                      : language === "fr"
                        ? "Chercher société"
                        : "Bedrijf zoeken",
                  term:
                    language === "ar"
                      ? "شركة"
                      : language === "fr"
                        ? "company"
                        : "bedrijf",
                },
                {
                  icon: User,
                  label:
                    language === "ar"
                      ? "بحث سائق"
                      : language === "fr"
                        ? "Chercher chauffeur"
                        : "Chauffeur zoeken",
                  term:
                    language === "ar"
                      ? "سائق"
                      : language === "fr"
                        ? "chauffeur"
                        : "chauffeur",
                },
                {
                  icon: Car,
                  label:
                    language === "ar"
                      ? "بحث سيارة"
                      : language === "fr"
                        ? "Chercher véhicule"
                        : "Auto zoeken",
                  term:
                    language === "ar"
                      ? "سيارة"
                      : language === "fr"
                        ? "voiture"
                        : "auto",
                },
              ].map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => {
                    setInput(chip.term);
                    setStep("ask_identifier");
                  }}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900 transition-colors"
                >
                  <chip.icon className="w-3 h-3" />
                  {chip.label}
                </button>
              ))}
            </div>
          )}

          <div className="p-3 border-t bg-white dark:bg-slate-900 flex-shrink-0">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.placeholder}
                className="rounded-xl text-xs h-9 flex-1"
                disabled={isLoading || step === "awaiting_confirm"}
              />
              <Button
                className="rounded-xl h-9 px-3 bg-violet-600 hover:bg-violet-700"
                onClick={handleSend}
                disabled={isLoading || !input.trim() || step === "awaiting_confirm"}
                aria-label={t.send}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-12 px-5 shadow-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-700 hover:to-violet-700 transition-all"
          aria-label={t.open}
        >
          <Bot className="w-5 h-5 mr-2" />
          <MessageCircle className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
