"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, User, Sparkles, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

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
      ? "يختلف السعر حسب نوع الخدمة والمساحة والمواد المختارة. أنصحك بطلب عرض سعر مجاني عبر صفحة «طلب عرض سعر» ليصلك تقدير دقيق خلال 24 ساعة! 💰"
      : "Pricing varies by service type, area, and materials. I recommend requesting a free quote through our 'Get Quote' page for an accurate estimate within 24 hours! 💰";
  }
  if (/glass|زجاج|سكريت|واجهة/.test(lower)) {
    return isAr
      ? "نقدم زجاج سكريت مقوى بسماكات 6-12 مم، وواجهات زجاجية كاملة للمباني التجارية والسكنية. الزجاج المقوى أقوى 4 مرات من الزجاج العادي ويتفتت بأمان. هل تريد معرفة المزيد؟ 🪟"
      : "We offer tempered glass in 6-12mm thicknesses and complete glass facades for commercial and residential buildings. Tempered glass is 4x stronger and shatters safely. Want to know more? 🪟";
  }
  if (/kitchen|مطبخ/.test(lower)) {
    return isAr
      ? "نصمم وننفذ مطابخ عصرية بخامات مستوردة، مع جلسة تصميم 3D مجانية. التركيب يتم خلال 48 ساعة وضمان 5 سنوات! هل تريد حجز استشارة مجانية؟ 🍽️"
      : "We design and install modern kitchens with imported materials, free 3D design session included. Installation within 48 hours with a 5-year warranty! Want to book a free consultation? 🍽️";
  }
  if (/aluminum|ألمنيوم|نافذة|باب/.test(lower)) {
    return isAr
      ? "أعمال الألمنيوم تشمل النوافذ والأبواب والديكورات الداخلية والخارجية. نستخدم ألمنيوم أمريكي وألماني بضمان 5 سنوات وحماية كاملة من الصدأ. 🔩"
      : "Aluminum works include windows, doors, and interior/exterior decorations. We use American and German aluminum with a 5-year warranty and full rust protection. 🔩";
  }
  if (/contact|تواصل|phone|هاتف|رقم/.test(lower)) {
    return isAr
      ? "يمكنك التواصل معنا عبر:\n📱 واتساب: +966 50 000 0000\n📧 البريد: info@webtaky.com\n🕐 ساعات العمل: السبت – الخميس 8 ص – 6 م"
      : "You can reach us via:\n📱 WhatsApp: +966 50 000 0000\n📧 Email: info@webtaky.com\n🕐 Working hours: Sat – Thu 8 AM – 6 PM";
  }
  if (/location|عنوان|مكان|أين/.test(lower)) {
    return isAr
      ? "مقرنا الرئيسي في الرياض، ونغطي معظم مناطق المملكة العربية السعودية شاملاً جدة والدمام والخبر ومكة والمدينة المنورة. 📍"
      : "Our main office is in Riyadh, and we cover most regions of Saudi Arabia including Jeddah, Dammam, Al Khobar, Mecca, and Madinah. 📍";
  }
  if (/warranty|ضمان/.test(lower)) {
    return isAr
      ? "نقدم ضمانات شاملة:\n✅ زجاج وألمنيوم: 5-10 سنوات\n✅ مطابخ: 5 سنوات\n✅ ديكورات: 3 سنوات\n✅ صيانة طوارئ: 24/7"
      : "We offer comprehensive warranties:\n✅ Glass & Aluminum: 5-10 years\n✅ Kitchens: 5 years\n✅ Decorations: 3 years\n✅ Emergency maintenance: 24/7";
  }

  return isAr
    ? "شكراً على سؤالك! أنا هنا لمساعدتك في معرفة المزيد عن خدماتنا. يمكنك أيضاً طلب عرض سعر مجاني أو التواصل معنا مباشرة عبر واتساب. كيف يمكنني مساعدتك؟ 😊"
    : "Thank you for your question! I'm here to help you learn more about our services. You can also request a free quote or contact us directly via WhatsApp. How can I help you? 😊";
}

export function AIChatWidget({ locale }: Props) {
  const isRtl = locale === "ar";
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
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
            ? "مرحباً! أنا المساعد الذكي لـ WebTaky. كيف يمكنني مساعدتك اليوم؟ 🏗️\n\nيمكنني مساعدتك في:\n• الاستفسار عن الخدمات والأسعار\n• طلب عرض سعر\n• معرفة مواعيد العمل\n• أي استفسار آخر"
            : "Hello! I'm WebTaky's smart assistant. How can I help you today? 🏗️\n\nI can help with:\n• Service & pricing inquiries\n• Requesting a quote\n• Working hours\n• Any other question",
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

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));

    const response = getSmartResponse(text, locale);
    setIsTyping(false);
    setMessages(prev => [...prev, {
      id: `a-${Date.now()}`,
      role: "assistant",
      content: response,
      timestamp: new Date(),
    }]);
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
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">{isRtl ? "المساعد الذكي" : "AI Assistant"}</p>
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
