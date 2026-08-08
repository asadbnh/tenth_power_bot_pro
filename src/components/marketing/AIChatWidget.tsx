"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, User, Sparkles, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import { CompanyLogo } from "@/components/ui/CompanyLogo";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Props {
  locale: Locale;
}

// Predefined smart responses (fallback when AI API is not configured)
function getSmartResponse(input: string, locale: Locale): string {
  const isAr = locale === "ar";
  const lower = input.toLowerCase();

  if (/price|سعر|تكلف|كم/.test(lower)) {
    return isAr
      ? "تعتمد التكلفة التقديرية للمشروع على نوع النظام الهندسي المطلوب والمساحات الإجمالية والمواصفات الفنية المعتمدة. يمكنك رفع بيانات المشروع عبر صفحة «طلب دراسة مشروع» للحصول على التقييم المالي والفني."
      : "Project costs depend on the engineering system, total surface area, and technical specifications. You can submit project details via the 'Project Inquiry' page for a detailed proposal.";
  }
  if (/glass|زجاج|سكريت|واجهة/.test(lower)) {
    return isAr
      ? "تنفذ شركة القوة العاشرة أنظمة الزجاج السيكوريت المقوى بسماكات تتراوح بين 6 إلى 12 مم، بالإضافة إلى واجهات الكرتن وول والأنظمة الهيكلية المزدوجة المعزولة وفق كود البناء السعودي SBC."
      : "Tenth Power executes double-tempered securit glass systems (6-12mm) and curtain wall structural facades conforming to Saudi Building Code (SBC) standards.";
  }
  if (/kitchen|مطبخ/.test(lower)) {
    return isAr
      ? "نقوم بتصميم وتنفيذ القطاعات الهندسية والمطابخ باستخدام قطاعات ألمنيوم عالية الجودة ومقاومة، مع إعداد المخططات ثلاثية الأبعاد قبل البدء في مرحلة التصنيع."
      : "We engineer and install premium aluminum structural fixtures and kitchens with 3D design plans prior to manufacturing.";
  }
  if (/aluminum|ألمنيوم|نافذة|باب/.test(lower)) {
    return isAr
      ? "تشمل حلول الألمنيوم الأنظمة المعمارية للنوافذ والأبواب المعزولة حرارياً ومائياً (Thermal-Break) بأنظمة استانلس ستيل ذات الكفاءة العالية."
      : "Our aluminum solutions cover architectural thermal-break window and door systems with heavy-duty stainless steel fittings.";
  }
  if (/contact|تواصل|phone|هاتف|رقم/.test(lower)) {
    return isAr
      ? "يمكنكم التواصل مع المكتب الهندسي والمبيعات عبر:\n• الهاتف المباشر والواتساب: +966 50 000 0000\n• البريد الإلكتروني: info@webtaky.com\n• ساعات العمل: السبت – الخميس من 8:00 صباحاً حتى 6:00 مساءً"
      : "Contact our engineering & sales team:\n• Direct Phone / WhatsApp: +966 50 000 0000\n• Email: info@webtaky.com\n• Working Hours: Sat – Thu, 8:00 AM – 6:00 PM";
  }
  if (/location|عنوان|مكان|أين/.test(lower)) {
    return isAr
      ? "المقر الرئيسي: مدينة الرياض – طريق الملك فهد (حي الصحافة). وننفذ المشاريع في كافة مناطق المملكة العربية السعودية."
      : "Headquarters: Riyadh – King Fahd Road (Al Sahafah Dist.). We execute engineering projects across all KSA regions.";
  }
  if (/warranty|ضمان/.test(lower)) {
    return isAr
      ? "تخضع جميع الأعمال والأنظمة المنفذة لضمان فني معتمد يمتد حتى 10 سنوات على السلامة الهيكلية وجودة العزل والمواصفات الفنية."
      : "All executed works carry a formal technical warranty of up to 10 years covering structural integrity and insulation quality.";
  }

  return isAr
    ? "أهلاً بك. أنا المساعد الهندسي الذكي لشركة القوة العاشرة. يمكنك الاستفسار عن الأنظمة والمعايير الفنية أو تقديم طلب دراسة لمشروعك."
    : "Welcome. I am the AI Technical Assistant for Tenth Power Contracting. How can I assist you with your project specifications today?";
}

export function AIChatWidget({ locale }: Props) {
  const isRtl = locale === "ar";
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [interactionId, setInteractionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const open = () => {
    setIsOpen(true);
    if (!hasOpened) {
      setHasOpened(true);
      // Greeting message
      setTimeout(() => {
        setMessages([{
          id: "greeting",
          role: "assistant",
          content: isRtl
            ? "أهلاً بك في شركة القوة العاشرة للمقاولات والواجهات المعمارية. كيف يمكن للمساعد الهندسي مساندتك في مشروعك اليوم؟\n\n• الاستفسار عن مواصفات الواجهات والزجاج\n• تقديم طلب دراسة وتثمين مشروع\n• التواصل مع المهندس المختص"
            : "Welcome to Tenth Power General Contracting & Facades. How can our technical assistant help with your engineering project today?\n\n• Facade & Securit Glass Specifications\n• Project Evaluation Inquiry\n• Connect with Lead Engineer",
          timestamp: new Date(),
        }]);
      }, 300);
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
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          locale,
          previous_interaction_id: interactionId,
        }),
      });

      const newInteractionId = res.headers.get("x-interaction-id");
      if (newInteractionId) {
        setInteractionId(newInteractionId);
      }

      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";

        const assistantMsgId = `a-${Date.now()}`;
        setMessages(prev => [...prev, {
          id: assistantMsgId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
        }]);

        setIsTyping(false);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;

          setMessages(prev =>
            prev.map(m =>
              m.id === assistantMsgId ? { ...m, content: assistantContent } : m
            )
          );
        }
      } else {
        setIsTyping(false);
        const fallback = getSmartResponse(text, locale);
        setMessages(prev => [...prev, {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: fallback,
          timestamp: new Date(),
        }]);
      }
    } catch {
      setIsTyping(false);
      const fallback = getSmartResponse(text, locale);
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: fallback,
        timestamp: new Date(),
      }]);
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
              "fixed bottom-36 z-50 w-[350px] sm:w-[380px] max-h-[560px]",
              "flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-border-light",
              "bg-background",
              isRtl ? "end-4 sm:end-6" : "end-4 sm:end-6"
            )}>

            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary-700 to-primary-800 text-white shrink-0">
              <CompanyLogo size={32} className="shrink-0 drop-shadow-md" />
              <div className="flex-1">
                <p className="font-bold text-sm">{isRtl ? "المساعد الذكي — القوة العاشرة" : "Tenth Power AI Assistant"}</p>
                <p className="text-xs text-white/70">{isRtl ? "متاح الآن" : "Online now"}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={reset} title="Reset" className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setIsOpen(false)} className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[380px] scroll-smooth">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex items-start gap-2.5", msg.role === "user" && "flex-row-reverse")}>
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                      msg.role === "assistant"
                        ? "bg-primary-100 dark:bg-primary-900"
                        : "bg-surface-elevated border border-border"
                    )}>
                      {msg.role === "assistant"
                        ? <Bot className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        : <User className="w-4 h-4 text-text-secondary" />
                      }
                    </div>
                    <div className={cn(
                      "max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line",
                      msg.role === "assistant"
                        ? "bg-surface-elevated text-text-primary rounded-tl-sm"
                        : "bg-primary-600 text-white rounded-tr-sm"
                    )}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="bg-surface-elevated rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5">
                      {[0, 1, 2].map(i => (
                        <span key={i} className="w-2 h-2 rounded-full bg-text-tertiary animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length <= 1 && (
              <div className="px-3 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t border-border-light shrink-0">
                {(isRtl
                  ? ["أسعار الزجاج", "طلب عرض سعر", "ضماناتكم", "أين مكتبكم؟"]
                  : ["Glass prices", "Get a quote", "Your warranties", "Your location"]
                ).map(q => (
                  <button key={q} onClick={() => { setInput(q); setTimeout(sendMessage, 10); }}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-border-light bg-surface hover:bg-surface-elevated transition-colors whitespace-nowrap text-text-secondary">
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
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder={isRtl ? "اكتب رسالتك..." : "Type your message..."}
                className="flex-1 resize-none px-3 py-2.5 rounded-xl border border-border-light bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all max-h-24"
                style={{ scrollbarWidth: "none" }}
              />
              <button onClick={sendMessage} disabled={!input.trim() || isTyping}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0",
                  input.trim() && !isTyping
                    ? "bg-primary-600 text-white hover:bg-primary-700 active:scale-95"
                    : "bg-surface text-text-tertiary cursor-not-allowed"
                )}>
                <Send className={cn("w-4 h-4", isRtl && "rotate-180")} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Trigger */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isOpen ? () => setIsOpen(false) : open}
        className={cn(
          "fixed z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center",
          "bg-gradient-to-br from-violet-600 to-primary-600 text-white",
          "hover:shadow-2xl transition-shadow duration-300",
          isRtl ? "end-4 sm:end-6" : "end-4 sm:end-6",
          "bottom-52"  // Above WhatsApp button
        )}>
        <AnimatePresence mode="wait">
          {isOpen
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X className="w-6 h-6" />
              </motion.span>
            : <motion.span key="bot" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <Sparkles className="w-6 h-6" />
              </motion.span>
          }
        </AnimatePresence>

        {/* Pulse ring when closed */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full ring-2 ring-violet-500/40 animate-ping" />
        )}
      </motion.button>
    </>
  );
}
