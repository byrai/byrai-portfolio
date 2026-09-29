"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  X,
  MessageCircle,
  Mail,
  User,
  Code,
  Briefcase,
} from "lucide-react";

/* ================================================================
   SELF-CONTAINED THEME TOGGLE
   Directly manages html.light class + localStorage.
   No next-themes required — works regardless of ThemeProvider setup.
   ================================================================ */

function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("devadora-theme");
    if (saved === "light") {
      document.documentElement.classList.add("light");
      setIsLight(true);
    } else {
      document.documentElement.classList.remove("light");
      setIsLight(false);
    }
  }, []);

  const toggle = () => {
    const next = !isLight;
    setIsLight(next);
    if (next) {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("devadora-theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      localStorage.setItem("devadora-theme", "dark");
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
      className={`
        w-11 h-11 flex items-center justify-center rounded-full
        shadow-lg border transition-all duration-300 cursor-pointer hover:scale-110
        ${
          isLight
            ? "bg-[#f2ede4] border-black/12 text-black/60 hover:text-black hover:border-black/35"
            : "bg-[#1a1917] border-white/12 text-white/60 hover:text-white hover:border-white/35"
        }
      `}
    >
      {isLight ? (
        <svg
          width="17"
          height="17"
          viewBox="0 0 18 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        >
          <circle cx="9" cy="9" r="3.5" fill="currentColor" stroke="none" />
          <line x1="9" y1="1" x2="9" y2="3" />
          <line x1="9" y1="15" x2="9" y2="17" />
          <line x1="1" y1="9" x2="3" y2="9" />
          <line x1="15" y1="9" x2="17" y2="9" />
          <line x1="3.2" y1="3.2" x2="4.6" y2="4.6" />
          <line x1="13.4" y1="13.4" x2="14.8" y2="14.8" />
          <line x1="14.8" y1="3.2" x2="13.4" y2="4.6" />
          <line x1="4.6" y1="13.4" x2="3.2" y2="14.8" />
        </svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
          <path
            d="M15.5 10.5A6.5 6.5 0 1 1 7.5 2.5a5.5 5.5 0 0 0 8 8z"
            fill="currentColor"
          />
        </svg>
      )}
    </button>
  );
}

/* ================================================================
   CHATBOT
   Now backed by /api/chat (Gemini, grounded in lib/portfolioContext.ts)
   instead of the old keyword-matching getBotResponse().
   ================================================================ */

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const CONTACT_EMAIL = "raireyesjr@gmail.com";
const BOT_NAME = "Rai M. Reyes Jr.";

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: `Hi! I'm ${BOT_NAME}'s assistant. How can I help you today?`,
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const quickActions = [
    {
      icon: <User size={15} />,
      label: "About",
      action: "Tell me about yourself",
    },
    {
      icon: <Code size={15} />,
      label: "Skills",
      action: "What are your skills?",
    },
    {
      icon: <Briefcase size={15} />,
      label: "Projects",
      action: "Show me your projects",
    },
    {
      icon: <Mail size={15} />,
      label: "Contact",
      action: "How can I contact you?",
    },
  ];

  // Replaces the old getBotResponse() keyword matcher — this now calls the
  // server-side /api/chat route, which calls Gemini grounded in
  // lib/portfolioContext.ts. The API key never touches the client.
  const fetchBotReply = async (
    userText: string,
    conversation: Message[],
  ): Promise<string> => {
    const history = conversation
      .slice(-6)
      .map((m) => ({ role: m.sender, text: m.text }));

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText, history }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to get a response.");
    }

    const data = await res.json();
    return data.reply as string;
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = (text ?? inputValue).trim();
    if (!messageText) return;

    setErrorMsg(null);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInputValue("");
    setIsTyping(true);

    // Still surface the contact shortcut button on intent — the model's
    // reply already mentions the email, this just adds the one-click button.
    const lower = messageText.toLowerCase();
    if (
      lower.includes("contact") ||
      lower.includes("email") ||
      lower.includes("reach") ||
      lower.includes("hire")
    ) {
      setShowContactForm(true);
    }

    try {
      const reply = await fetchBotReply(messageText, nextMessages);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: reply,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: `Sorry, I hit a snag. You can always reach Rai directly at **${CONTACT_EMAIL}**.`,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatMessage = (text: string) => {
    let f = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    f = f.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-violet-400 hover:text-violet-300 underline">$1</a>',
    );
    f = f.replace(/\n/g, "<br />");
    return f;
  };

  return (
    <div className="relative">
      {/* Chat window — opens upward */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-[330px] sm:w-[380px] h-[520px] flex flex-col bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden mb-2">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle size={16} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  Portfolio Assistant
                </h3>
                <p className="text-[11px] text-white/80">Online · AI-powered</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-950">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.sender === "user" ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white" : "bg-zinc-800 text-zinc-100"}`}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: formatMessage(msg.text),
                    }}
                  />
                  <div
                    className={`text-[10px] mt-1 ${msg.sender === "user" ? "text-white/50" : "text-zinc-500"}`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions */}
          {messages.length <= 2 && (
            <div className="px-4 py-3 bg-zinc-900 border-t border-zinc-800 shrink-0">
              <p className="text-[11px] text-zinc-400 mb-2">Quick actions:</p>
              <div className="flex flex-wrap gap-1.5">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(action.action)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-full transition-colors cursor-pointer"
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Contact shortcut */}
          {showContactForm && (
            <div className="px-4 py-3 bg-zinc-900 border-t border-zinc-800 shrink-0">
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=Hello from your portfolio`}
                className="block w-full text-center bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 text-white text-sm font-medium py-2 rounded-lg transition-all"
              >
                Open Email Client →
              </a>
            </div>
          )}

          {errorMsg && (
            <div className="px-4 py-1 bg-zinc-900 shrink-0">
              <p className="text-[11px] text-red-400">{errorMsg}</p>
            </div>
          )}

          {/* Input */}
          <div className="p-3.5 bg-zinc-900 border-t border-zinc-800 shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 bg-zinc-800 text-zinc-100 placeholder-zinc-500 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-all cursor-pointer"
                aria-label="Send"
              >
                <Send size={17} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chatbot trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        className="relative w-11 h-11 flex items-center justify-center rounded-full shadow-lg cursor-pointer transition-all duration-200 hover:scale-110"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full blur-md opacity-60" />
        <div className="relative bg-gradient-to-r from-violet-600 to-fuchsia-600 w-full h-full rounded-full flex items-center justify-center text-white">
          {isOpen ? <X size={18} /> : <MessageCircle size={18} />}
        </div>
      </button>
    </div>
  );
}

/* ================================================================
   FLOATING CONTROLS
   Stack: ThemeToggle (top) → Chatbot (bottom)
   ================================================================ */

export default function FloatingControls() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">
      <ThemeToggle />
      <Chatbot />
    </div>
  );
}
