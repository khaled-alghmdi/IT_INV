"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, MessageCircle, Minimize2 } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface DeliveryChatbotProps {
  deviceInfo?: {
    asset_number: string;
    serial_number: string;
    device_type: string;
    brand?: string;
    model?: string;
  };
}

export default function DeliveryChatbot({ deviceInfo }: DeliveryChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initial greeting
      setTimeout(() => {
        addBotMessage(
          "👋 Hello! I'm your AI assistant for the ServiceNow Delivery Note.\n\n" +
          "I'll help you fill the form correctly!\n\n" +
          "Choose an option:\n" +
          "1️⃣ Show me what fields to fill\n" +
          "2️⃣ Give me step-by-step instructions\n" +
          "3️⃣ Open ServiceNow now\n\n" +
          "Just type the number or ask me anything!"
        );
      }, 500);
    }
  }, [isOpen]);

  const addBotMessage = (text: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 800);
  };

  const addUserMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text,
        sender: "user",
        timestamp: new Date(),
      },
    ]);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim().toLowerCase();
    addUserMessage(inputText);
    setInputText("");

    // Bot responses based on user input
    if (userMessage.includes("1") || userMessage.includes("information") || userMessage.includes("what") || userMessage.includes("fields")) {
      addBotMessage(
        `📋 Your Device Info:\n\n` +
        `• Asset Number: ${deviceInfo?.asset_number || "Click Copy button below"}\n` +
        `• Serial Number: ${deviceInfo?.serial_number || "Click Copy button below"}\n` +
        `• Description: ${deviceInfo?.device_type || "Device"} - ${deviceInfo?.brand || "Brand"} ${deviceInfo?.model || ""}\n\n` +
        `📝 What You'll Fill:\n` +
        `• Type: Asset Receiving/Transfer\n` +
        `• Current Location: JEDDAH\n` +
        `• Sender: BAYAN KHUDHARI\n` +
        `• Receiving Location: Jeddah Branch\n` +
        `• Working: Yes ✅\n` +
        `• Check acknowledgment box\n\n` +
        `💡 Receiver Name & Employee ID auto-fill!\n\n` +
        `Type "2" for step-by-step or "open" to start!`
      );
    } else if (userMessage.includes("2") || userMessage.includes("prepare") || userMessage.includes("help") || userMessage.includes("step")) {
      addBotMessage(
        `📝 Quick Fill Guide:\n\n` +
        `1️⃣ Click "Copy Device Info" button below\n\n` +
        `2️⃣ Fill ServiceNow Form:\n` +
        `   • Type of Request: Asset Receiving/Transfer\n` +
        `   • Asset Number: Paste from copied info\n` +
        `   • Description: ${deviceInfo?.device_type || "Device type"} - ${deviceInfo?.brand || "Brand"} ${deviceInfo?.model || ""}\n` +
        `   • Serial Number: Paste from copied info\n` +
        `   • Current Location: JEDDAH\n` +
        `   • Sender Name: BAYAN KHUDHARI\n` +
        `   • Receiving Location: Jeddah Branch\n` +
        `   • Receiver Name: (Auto-filled by ServiceNow)\n` +
        `   • Employee ID: (Auto-filled by ServiceNow)\n` +
        `   • Asset working: Yes\n` +
        `   • Check acknowledgment ✅\n\n` +
        `3️⃣ SUBMIT!\n\n` +
        `Type "open" to go to ServiceNow now! 🚀`
      );
    } else if (userMessage.includes("3") || userMessage.includes("open") || userMessage.includes("servicenow") || userMessage.includes("go")) {
      addBotMessage(
        `🚀 Opening ServiceNow now!\n\n` +
        `Quick Checklist:\n` +
        `✅ Copy device info (button below)\n` +
        `✅ Type: Asset Receiving/Transfer\n` +
        `✅ Paste Asset # and Serial #\n` +
        `✅ Current Location: JEDDAH\n` +
        `✅ Sender: BAYAN KHUDHARI\n` +
        `✅ Receiving: Jeddah Branch\n` +
        `✅ Check acknowledgment box\n` +
        `✅ Submit!\n\n` +
        `Opening in 2 seconds... 🎯`
      );
      setTimeout(() => {
        window.open(
          "https://tmrphelpdesk.service-now.com/tac?id=sc_cat_item&sys_id=18f46b17c35b0210cfc22e75e0013135",
          "_blank"
        );
      }, 2000);
    } else if (userMessage.includes("device") || userMessage.includes("info")) {
      if (deviceInfo) {
        addBotMessage(
          `📱 Your Device Information:\n\n` +
          `Asset Number: ${deviceInfo.asset_number}\n` +
          `Serial Number: ${deviceInfo.serial_number}\n` +
          `Device Type: ${deviceInfo.device_type}\n` +
          `Brand/Model: ${deviceInfo.brand || "N/A"} ${deviceInfo.model || ""}\n\n` +
          `You can copy this using the "Copy Device Info" button below your device card!`
        );
      } else {
        addBotMessage(
          `📱 Your device information is displayed on this page. Use the "Copy Device Info" button to copy all details at once!`
        );
      }
    } else if (userMessage.includes("thank") || userMessage.includes("thanks")) {
      addBotMessage(
        `You're welcome! 😊\n\nIs there anything else I can help you with?\n\n` +
        `Type:\n` +
        `• "help" - To see what I can do\n` +
        `• "open" - To open ServiceNow\n` +
        `• "info" - To see device details`
      );
    } else {
      addBotMessage(
        `I can help you with:\n\n` +
        `📋 1. Explain required information\n` +
        `📝 2. Guide you through preparation\n` +
        `🚀 3. Open ServiceNow delivery form\n` +
        `📱 Show device information\n\n` +
        `Just type the number or ask me anything about the delivery note!`
      );
    }
  };

  return (
    <>
      {/* Chatbot Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all z-50 animate-bounce"
          aria-label="Open chatbot"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            AI
          </span>
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl z-50 flex flex-col transition-all ${
          isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
        }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">Delivery Helper</h3>
                <p className="text-xs text-green-100">Online • AI Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.sender === "user"
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                          : "bg-white border border-gray-200 text-gray-800 shadow-sm"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === "user" ? "text-green-100" : "text-gray-400"
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim()}
                    className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

