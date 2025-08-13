import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { audioManager } from "@/lib/audio";
import { getSimulatedResponse, Message } from "./utils";
import { isApiKeySet, setGeminiApiKey, sendMessageToGemini } from "@/lib/genai";
import {
  sendMessageToLLM,
  isWebGPUSupported,
  ensureLocalLLMReady,
  probeWebGPU,
} from "@/lib/webllm";
import { useToast } from "@/hooks/use-toast";
import ChatHeader from "./ChatHeader";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import ChatToggleButton from "./ChatToggleButton";
import TypingIndicator from "./TypingIndicator";
import GenaiDialog from "./GenaiDialog";

const initialMessages: Message[] = [
  {
    id: "1",
    content:
      "Hello! I'm Aakash's portfolio assistant. I can answer questions about his skills, projects, education, and experience. To enable AI-powered responses, please provide your Gemini API key when prompted. Without it, I'll use basic pre-defined responses.",
    sender: "bot",
    timestamp: new Date(),
  },
];

export const ChatWindow: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [provider, setProvider] = useState<"gemini" | "local" | "none">("none");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { soundEnabled } = useSelector((state: RootState) => state.mode);
  const { toast } = useToast();

  // Check if API key is set on component mount
  useEffect(() => {
    const keySet = isApiKeySet();
    setAiEnabled(keySet || isWebGPUSupported());
    setProvider(keySet ? "gemini" : isWebGPUSupported() ? "local" : "none");
    // Auto-attempt local LLM load if WebGPU seems available and no Gemini key
    (async () => {
      if (!keySet && isWebGPUSupported()) {
        const canUse = await probeWebGPU();
        if (!canUse) {
          toast({
            title: "WebGPU Not Available",
            description:
              "WebGPU is detected but no adapter is available. Enable GPU acceleration in browser settings and restart your browser.",
            variant: "destructive",
          });
          return;
        }
        toast({
          title: "Preparing Local AI",
          description:
            "Downloading and initializing the local model. This may take a few minutes on first load.",
        });
        const ok = await ensureLocalLLMReady(undefined);
        if (ok) {
          setAiEnabled(true);
          setProvider("local");
          setMessages((prev) => [
            ...prev,
            {
              id: generateUniqueId(),
              content:
                "Local AI ready. Running a model in your browser with WebGPU.",
              sender: "bot",
              timestamp: new Date(),
            },
          ]);
        } else {
          toast({
            title: "Local AI Not Ready",
            description:
              "Model did not load. Enable GPU acceleration, ensure a compatible browser, or use Gemini.",
            variant: "destructive",
          });
        }
      }
    })();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opening chat
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen, isMinimized]);

  const toggleChat = () => {
    if (soundEnabled) {
      audioManager.playSoundEffect("click");
    }
    if (!isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
    } else {
      setIsOpen(false);
    }
  };

  const minimizeChat = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (soundEnabled) {
      audioManager.playSoundEffect("click");
    }
    setIsMinimized(!isMinimized);
  };

  const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const handleToggleAI = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowApiKeyDialog(true);
  };

  const handleApiKeySubmit = (apiKey: string) => {
    setGeminiApiKey(apiKey);
    setAiEnabled(true);
    setProvider("gemini");
    setShowApiKeyDialog(false);

    // Add confirmation message
    const confirmationMessage: Message = {
      id: generateUniqueId(),
      content: "API key set. Using Gemini for AI responses.",
      sender: "bot",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, confirmationMessage]);
  };

  const handleUseLocal = async () => {
    const ok = await ensureLocalLLMReady();
    if (ok) {
      setAiEnabled(true);
      setProvider("local");
      const confirmationMessage: Message = {
        id: generateUniqueId(),
        content: "Local AI ready. Running a model in your browser with WebGPU.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, confirmationMessage]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    if (soundEnabled) {
      audioManager.playSoundEffect("message");
    }

    const newUserMessage: Message = {
      id: generateUniqueId(),
      content: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    const userMessageText = inputValue.trim();
    setInputValue("");
    setIsTyping(true);

    try {
      let botResponse: Message;

      if (aiEnabled && provider === "gemini") {
        const response = await sendMessageToGemini(userMessageText);
        botResponse = {
          id: generateUniqueId(),
          content: response.success
            ? response.content
            : `⚠️ ${response.content}`,
          sender: "bot",
          timestamp: new Date(),
        };
      } else if (aiEnabled && provider === "local") {
        // Prefer local when enabled and no Gemini key provided
        const response = await sendMessageToLLM(userMessageText);
        botResponse = {
          id: generateUniqueId(),
          content: response.success
            ? response.content
            : `⚠️ ${response.content}`,
          sender: "bot",
          timestamp: new Date(),
        };
      } else {
        // Ask for API key for more intelligent responses
        if (Math.random() < 0.3) {
          // 30% chance to prompt for AI
          setShowApiKeyDialog(true);
        }

        // Use simulated response as fallback
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 + Math.random() * 1000),
        );
        botResponse = {
          id: generateUniqueId(),
          content: getSimulatedResponse(userMessageText),
          sender: "bot",
          timestamp: new Date(),
        };
      }

      setMessages((prev) => [...prev, botResponse]);
    } catch {
      const errorMessage: Message = {
        id: generateUniqueId(),
        content: "Sorry, I encountered an error. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <GenaiDialog
        isOpen={showApiKeyDialog}
        onSubmitApiKey={handleApiKeySubmit}
        onUseLocal={handleUseLocal}
        onClose={() => setShowApiKeyDialog(false)}
      />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "bg-background border rounded-lg shadow-lg overflow-hidden flex flex-col",
              "shadow-[0_4px_20px_rgba(0,0,0,0.15),_0_0_15px_hsl(var(--primary)/0.15)]",
              isMinimized ? "w-72 h-12" : "w-80 sm:w-96 h-96",
            )}
          >
            <ChatHeader
              isTyping={isTyping}
              isMinimized={isMinimized}
              aiEnabled={aiEnabled}
              provider={provider}
              minimizeChat={minimizeChat}
              closeChat={toggleChat}
              onToggleAI={handleToggleAI}
            />
            {!isMinimized && (
              <>
                <div
                  ref={chatContainerRef}
                  className={cn(
                    "flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin",
                    "bg-card scrollbar-thumb-palette-gray-light/40 scrollbar-track-transparent",
                  )}
                >
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  {isTyping && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>
                <ChatInput
                  inputValue={inputValue}
                  setInputValue={setInputValue}
                  handleSendMessage={handleSendMessage}
                  inputRef={inputRef as React.RefObject<HTMLTextAreaElement>}
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {!isOpen && <ChatToggleButton toggleChat={toggleChat} />}
    </div>
  );
};

export default ChatWindow;
