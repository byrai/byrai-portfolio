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

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  action: string;
}

const CONTACT_EMAIL = "raireyesjr@gmail.com";
const BOT_NAME = "Rai";

const PortfolioChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: `Hi! I'm ${BOT_NAME}'s assistant. Ask me about his projects, stack, or how to get in touch.`,
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
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const quickActions: QuickAction[] = [
    {
      icon: <User size={16} />,
      label: "About",
      action: "Tell me about yourself",
    },
    {
      icon: <Code size={16} />,
      label: "Skills",
      action: "What are your skills?",
    },
    {
      icon: <Briefcase size={16} />,
      label: "Projects",
      action: "Show me your projects",
    },
    {
      icon: <Mail size={16} />,
      label: "Contact",
      action: "How can I contact you?",
    },
  ];

  // Calls the server-side API route. This replaces the old keyword-matching
  // getBotResponse() function entirely — the model now generates the reply
  // grounded in lib/portfolioContext.ts.
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

    // Lightweight intent check so the contact form still appears —
    // the model's reply already tells the user the email, this just
    // surfaces the one-click "Open Email Client" button too.
    const lower = messageText.toLowerCase();
    if (
      lower.includes("contact") ||
      lower.includes("email") ||
      lower.includes("hire") ||
      lower.includes("reach")
    ) {
      setShowContactForm(true);
    }

    try {
      const reply = await fetchBotReply(messageText, nextMessages);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: reply,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      const fallback: Message = {
        id: (Date.now() + 1).toString(),
        text: `Sorry, I hit a snag. You can always reach Rai directly at **${CONTACT_EMAIL}**.`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallback]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setShowContactForm(false);
  };

  const formatMessage = (text: string) => {
    let formatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    formatted = formatted.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>',
    );
    formatted = formatted.replace(/\n/g, "<br />");
    return formatted;
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 group"
          aria-label="Open chat"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white p-4 rounded-full shadow-2xl hover:shadow-violet-500/50 transition-all hover:scale-110">
              <MessageCircle size={28} />
            </div>
          </div>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[420px] h-[620px] z-50 flex flex-col bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <MessageCircle size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">
                  Portfolio Assistant
                </h3>
                <p className="text-xs text-white/80">Online • AI-powered</p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
                      : "bg-zinc-800 text-zinc-100"
                  }`}
                >
                  <div
                    className="text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: formatMessage(message.text),
                    }}
                  />
                  <div
                    className={`text-xs mt-1 ${
                      message.sender === "user"
                        ? "text-white/60"
                        : "text-zinc-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
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
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 2 && (
            <div className="px-4 py-3 bg-zinc-900 border-t border-zinc-800">
              <p className="text-xs text-zinc-400 mb-2">Quick actions:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.action)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-full transition-colors"
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {showContactForm && (
            <div className="px-4 py-3 bg-zinc-900 border-t border-zinc-800">
              <div className="bg-zinc-800 rounded-lg p-3">
                <p className="text-sm text-zinc-300 mb-2">
                  Send a message directly:
                </p>
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=Hello from your portfolio`}
                  className="block w-full text-center bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white text-sm font-medium py-2 rounded-lg transition-all"
                >
                  Open Email Client
                </a>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="px-4 py-1 bg-zinc-900">
              <p className="text-xs text-red-400">{errorMsg}</p>
            </div>
          )}

          <div className="p-4 bg-zinc-900 border-t border-zinc-800">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 bg-zinc-800 text-zinc-100 placeholder-zinc-500 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-all"
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PortfolioChatbot;
