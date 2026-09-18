"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, User, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import { CompanyLogo } from "@/components/ui/CompanyLogo";
import { FormattedChatMessage } from "./FormattedChatMessage";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Props {
  locale: Locale;
}

// Predefined smart responses (fallback when offline)
function getSmartResponse(input: string, locale: Locale): string {
  const isAr = locale === "ar";
  const lower = input.toLowerCase();

  if (/price|سعر|تكلف|كم/.test(lower)) {
    return isAr
      ? "تعتمد التكلفة التقديرية على نوع النظام والمساحات والمواصفات المعتمدة. يمكنك [طلب عرض سعر مجاني](/quote) للحصول على تقييم هندسي دقيق."
      : "Project costs depend on the system, surface area, and specifications. You can [Request a Free Quote](/quote) for a detailed proposal.";
  }
  if (/glass|زجاج|سكريت|واجهة/.test(lower)) {
    return isAr
      ? "تنفذ مؤسسة القوة العاشرة [أنظمة زجاج السيكوريت المقوى](/services/tempered-glass) و[واجهات الكرتن وول الهيكلية](/services/glass-facades) وفق كود البناء السعودي مع ضمان ممتد حتى 10 سنوات."
      : "Tenth Power executes [Tempered Securit Glass Systems](/services/tempered-glass) and [Curtain Wall Facades](/services/glass-facades) conforming to SBC standards with up to 10-year warranty.";
  }
  if (/aluminum|ألمنيوم|نافذة|باب/.test(lower)) {
    return isAr
      ? "تشمل حلولنا [أنظمة الألمنيوم المعمارية المعزولة حرارياً ومائياً](/services/aluminum) (Thermal-Break) بأعلى كفاءة عزل وجودة عالمية."
      : "Our solutions cover [Architectural Thermal-Break Aluminum Systems](/services/aluminum) with heavy-duty fittings.";
  }
  if (/contact|تواصل|phone|هاتف|رقم|اتصل/.test(lower)) {
    return isAr
      ? "يسعدنا جداً التواصل معكم! فضلاً أرسل **اسمك الكريم ورقم جوالك**، وسيقوم مهندسنا المختص بالاتصال بك في أقرب وقت. كما يمكنك زيارة [صفحة تواصل معنا](/contact)."
      : "We would be glad to contact you! Please share your **name and phone number**, and our team will call you shortly. You can also visit [Contact Us](/contact).";
  }
  if (/project|مشروع|أعمال|معرض/.test(lower)) {
    return isAr
      ? "يمكنك تصفح سابقة أعمالنا ومشاريعنا المنجزة من خلال [معرض المشاريع المنفذة](/projects)."
      : "You can explore our completed portfolio through [Our Executed Projects](/projects).";
  }
  if (/warranty|ضمان/.test(lower)) {
    return isAr
      ? "تخضع كافة أعمالنا المنفذة لضمان رسمي معتمد يمتد حتى 10 سنوات على السلامة الهيكلية وجودة العزل وفق كود البناء السعودي (SBC)."
      : "All executed works carry a formal technical warranty of up to 10 years covering structural integrity and insulation.";
  }

  return isAr
    ? "أهلاً بك. أنا المساعد الهندسي الذكي لمؤسسة القوة العاشرة. يمكنك الاستفسار عن الأنظمة أو [طلب دراسة مشروع](/quote) أو استعراض [معرض المشاريع](/projects)."
    : "Welcome. I am the AI Technical Assistant for Tenth Power. How can I assist you today? You can [Request a Quote](/quote) or view [Our Projects](/projects).";
}

export function AIChatWidget({ locale }: Props) {
  const isRtl = locale === "ar";
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [interactionId, setInteractionId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const STORAGE_KEY = `tenth_power_chat_history_${locale}`;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Restore chat history from browser localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
          setMessages(
            parsed.messages.map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            }))
          );
          if (parsed.interactionId) setInteractionId(parsed.interactionId);
          if (parsed.sessionId) setSessionId(parsed.sessionId);
          setHasOpened(true);
        }
      }
    } catch (err) {
      console.warn("Failed to restore chat history from localStorage:", err);
    }
  }, [STORAGE_KEY]);

  // Persist chat history to browser localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (messages.length > 0) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            messages,
            interactionId,
            sessionId,
            updatedAt: Date.now(),
          })
        );
      } catch {
        // quota exceeded or private mode
      }
    }
  }, [messages, interactionId, sessionId, STORAGE_KEY]);

  const open = () => {
    setIsOpen(true);
    if (!hasOpened && messages.length === 0) {
      setHasOpened(true);
      // Welcome Greeting message with interactive internal links
      setTimeout(() => {
        setMessages([
          {
            id: "greeting",
            role: "assistant",
            content: isRtl
              ? "أهلاً بك في مؤسسة **القوة العاشرة** للمقاولات العامة والواجهات المعمارية. يسعدني مساعدتك في استفساراتك الهندسية وتثمين مشروعك:\n\n•"
              : "Welcome to **Tenth Power** General Contracting & Facades. How can our technical assistant help with your engineering project today?\n\n•",
            timestamp: new Date(),
          },
        ]);
      }, 250);
    }
    setTimeout(() => inputRef.current?.focus(), 350);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          locale,
          previous_interaction_id: interactionId,
          session_id: sessionId,
        }),
      });

      const newInteractionId = res.headers.get("x-interaction-id");
      if (newInteractionId) {
        setInteractionId(newInteractionId);
      }

      const newSessionId = res.headers.get("x-session-id");
      if (newSessionId) {
        setSessionId(newSessionId);
      }

      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";

        const assistantMsgId = `a-${Date.now()}`;
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMsgId,
            role: "assistant",
            content: "",
            timestamp: new Date(),
          },
        ]);

        setIsTyping(false);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;

          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMsgId ? { ...m, content: assistantContent } : m))
          );
        }
      } else {
        setIsTyping(false);
        const fallback = getSmartResponse(text, locale);
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: fallback,
            timestamp: new Date(),
          },
        ]);
      }
    } catch {
      setIsTyping(false);
      const fallback = getSmartResponse(text, locale);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: fallback,
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const reset = () => {
    setMessages([]);
    setHasOpened(false);
    setInteractionId(null);
    setSessionId(null);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
    // Show fresh welcome message
    setTimeout(() => {
      setMessages([
        {
          id: "greeting",
          role: "assistant",
          content: isRtl
            ? "أهلاً بك في مؤسسة **القوة العاشرة** للمقاولات العامة والواجهات المعمارية. يسعدني مساعدتك في استفساراتك الهندسية وتثمين مشروعك:\n\n•"
            : "Welcome to **Tenth Power** General Contracting & Facades. How can our technical assistant help with your engineering project today?\n\n•)",
          timestamp: new Date(),
        },
      ]);
      setHasOpened(true);
    }, 150);
  };

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={cn(
              "fixed bottom-36 z-50 w-[350px] sm:w-[390px] max-h-[580px]",
              "flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-border-light",
              "bg-background",
              isRtl ? "end-4 sm:end-6" : "end-4 sm:end-6"
            )}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary-700 to-primary-800 text-white shrink-0 shadow-sm">
              <CompanyLogo size={32} className="shrink-0 drop-shadow-md" />
              <div className="flex-1">
                <p className="font-bold text-sm">
                  {isRtl ? "المساعد الذكي — القوة العاشرة" : "Tenth Power AI Assistant"}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-white/80">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{isRtl ? "متصل الآن (محادثة ذكية)" : "Online (Smart AI)"}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={reset}
                  title={isRtl ? "محادثة جديدة" : "New Chat"}
                  className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title={isRtl ? "إغلاق" : "Close"}
                  className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[220px] max-h-[400px] scroll-smooth">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex items-start gap-2.5", msg.role === "user" && "flex-row-reverse")}
                  >
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                        msg.role === "assistant"
                          ? "bg-primary-100 dark:bg-primary-900"
                          : "bg-surface-elevated border border-border"
                      )}
                    >
                      {msg.role === "assistant" ? (
                        <Bot className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      ) : (
                        <User className="w-4 h-4 text-text-secondary" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                        msg.role === "assistant"
                          ? "bg-surface-elevated text-text-primary rounded-tl-sm border border-border-light/60 dark:border-border/40 shadow-xs"
                          : "bg-primary-600 text-white rounded-tr-sm shadow-xs"
                      )}
                    >
                      <FormattedChatMessage content={msg.content} isAssistant={msg.role === "assistant"} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-2.5"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="bg-surface-elevated rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 border border-border-light/60 dark:border-border/40">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-2 h-2 rounded-full bg-primary-500 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {messages.length <= 1 && (
              <div className="px-3 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t border-border-light shrink-0">
                {(isRtl
                  ? ["أسعار الزجاج السيكوريت", "طلب مقايسة مجانية", "واجهات كرتن وول", "أريد التواصل معكم"]
                  : ["Glass prices", "Free site quote", "Curtain wall facades", "Contact us"]
                ).map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setInput(q);
                      setTimeout(sendMessage, 10);
                    }}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-border-light bg-surface hover:bg-surface-elevated transition-colors whitespace-nowrap text-text-secondary hover:text-primary-600"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-border-light shrink-0 flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder={isRtl ? "اكتب استفسارك أو رقمك للتواصل..." : "Type your question or phone..."}
                className="flex-1 resize-none px-3 py-2.5 rounded-xl border border-border-light bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all max-h-24"
                style={{ scrollbarWidth: "none" }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0",
                  input.trim() && !isTyping
                    ? "bg-primary-600 text-white hover:bg-primary-700 shadow-md"
                    : "bg-surface-elevated text-text-tertiary cursor-not-allowed"
                )}
              >
                <Send className={cn("w-4 h-4", isRtl && "rotate-180")} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Launcher Button */}
      <motion.button
        onClick={isOpen ? () => setIsOpen(false) : open}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isRtl ? "المساعد الذكي" : "AI Assistant"}
        className={cn(
          "fixed bottom-20 z-40 w-12 h-12 rounded-full",
          "bg-gradient-to-tr from-primary-700 to-primary-500 text-white",
          "shadow-xl hover:shadow-2xl flex items-center justify-center transition-shadow",
          isRtl ? "end-4 sm:end-6" : "end-4 sm:end-6"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="relative"
            >
              <Bot className="w-6 h-6" />
              <span className="absolute -top-1 -end-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-background" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
