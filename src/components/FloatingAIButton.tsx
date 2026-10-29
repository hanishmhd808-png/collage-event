"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Bot, ArrowRight, CornerDownLeft, RefreshCw } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { generateSmartReply, BotAction } from "@/lib/aiBotEngine";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "ai";
  text: string;
  actions?: BotAction[];
}

const QUICK_PROMPTS = [
  "🎨 Arts: Single vs Group",
  "🏆 Sports Olympiad",
  "⚖️ 3-Event Limit Rules",
  "🎫 My Tickets & Pass",
  "🚀 TechNova Hackathon",
  "📜 Download Certificate",
];

export default function FloatingAIButton() {
  const router = useRouter();
  const { events, myRegistrations, groups } = useApp();
  const { user, studentProfile } = useAuth();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Hello! 👋 I'm **EVENTORA AI**, your intelligent campus concierge.\n\nAsk me about upcoming hackathons, customized Arts & Sports activities (Single vs Group), campus rules, or your tickets!",
      actions: [
        { label: "📅 Explore Events", url: "/explore" },
        { label: "🎨 Arts & Sports", url: "/explore?category=Arts" },
      ],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open) scrollToBottom();
  }, [messages, open]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = textToSend.trim();
    if (!queryText) setInput("");

    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    // Realistic intelligent generation delay
    await new Promise(r => setTimeout(r, 600));

    const botResponse = generateSmartReply(userMsg, {
      events,
      myRegistrations,
      groups,
      user,
      studentProfile,
    });

    setMessages(prev => [
      ...prev,
      { role: "ai", text: botResponse.text, actions: botResponse.actions },
    ]);
    setLoading(false);
  };

  const handleActionClick = (action: BotAction) => {
    if (action.url) {
      router.push(action.url);
      setOpen(false);
    }
  };

  // Format simple markdown into JSX
  const renderMessageContent = (text: string) => {
    const lines = text.split("\n");
    return (
      <div className="space-y-1.5 text-xs sm:text-sm">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

          // Bold pattern **text**
          const parts = line.split(/(\*\*.*?\*\*|\`.*?\`)/g);
          return (
            <p key={idx} className="leading-relaxed">
              {parts.map((part, pIdx) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return <strong key={pIdx} className="text-white font-bold">{part.slice(2, -2)}</strong>;
                }
                if (part.startsWith("`") && part.endsWith("`")) {
                  return <code key={pIdx} className="px-1.5 py-0.5 rounded bg-black/40 text-blue-300 font-mono text-[11px]">{part.slice(1, -1)}</code>;
                }
                return part;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Floating Button with pulsing animation */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl cursor-pointer group"
        style={{
          background: "linear-gradient(135deg, #0a84ff, #bf5af2)",
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: open
            ? "none"
            : [
                "0 0 20px rgba(10,132,255,0.4)",
                "0 0 40px rgba(191,90,242,0.6)",
                "0 0 20px rgba(10,132,255,0.4)",
              ],
        }}
        transition={{ boxShadow: { duration: 2.5, repeat: Infinity } }}
      >
        <Sparkles className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
      </motion.button>

      {/* Intelligent Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 320 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] max-h-[82vh] h-[580px] rounded-3xl overflow-hidden shadow-2xl border border-white/15 flex flex-col"
            style={{
              background: "rgba(11, 13, 25, 0.96)",
              backdropFilter: "blur(30px)",
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.85), 0 0 40px rgba(10, 132, 255, 0.18)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-white font-bold text-sm tracking-tight">EVENTORA AI</p>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-white/40 text-[11px]">Intelligent Campus Assistant</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setMessages([
                      {
                        role: "ai",
                        text: "Chat cleared! How can I help you today? 🎓",
                      },
                    ])
                  }
                  title="Clear chat"
                  className="p-1.5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-3 py-2 border-b border-white/5 bg-white/[0.01] overflow-x-auto flex gap-1.5 no-scrollbar flex-shrink-0">
              {QUICK_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium glass border border-white/10 text-white/70 hover:text-white hover:border-blue-400 whitespace-nowrap transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-sm shadow-md"
                        : "glass-dark border border-white/10 text-white/85 rounded-bl-sm shadow-lg"
                    }`}
                  >
                    {renderMessageContent(msg.text)}
                  </div>

                  {/* Contextual Action Buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 ml-1">
                      {msg.actions.map((act, actIdx) => (
                        <button
                          key={actIdx}
                          onClick={() => handleActionClick(act)}
                          className="px-3 py-1 rounded-xl glass border border-blue-500/30 text-blue-300 hover:text-white hover:border-blue-400 hover:bg-blue-600/20 text-xs font-semibold flex items-center gap-1 transition-all"
                        >
                          {act.label} <ArrowRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-white/40 text-xs p-3 glass-dark border border-white/10 rounded-2xl w-fit">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(dot => (
                      <motion.div
                        key={dot}
                        className="w-1.5 h-1.5 rounded-full bg-blue-400"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: dot * 0.15 }}
                      />
                    ))}
                  </div>
                  <span>EVENTORA AI is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-white/10 bg-white/[0.02]">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask about events, arts/sports rules, tickets..."
                  className="flex-1 glass border border-white/10 rounded-2xl px-4 py-3 text-white text-xs sm:text-sm placeholder-white/30 outline-none focus:border-blue-400/50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="w-11 h-11 rounded-2xl btn-primary flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
