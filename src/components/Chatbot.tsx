import React, { useState, useEffect, useRef, FormEvent } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  RotateCcw,
  MessageCircle,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { ChatMessage, SkinAnalysisResult } from '../types';
import { generateChatbotResponse } from '../services/mockDermService';

interface ChatbotProps {
  analysisResult: SkinAnalysisResult | null;
  externalQueryTrigger?: string | null;
  onClearTrigger?: () => void;
}

export const Chatbot: React.FC<ChatbotProps> = ({
  analysisResult,
  externalQueryTrigger,
  onClearTrigger,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeChips, setActiveChips] = useState<string[]>([
    'How does this AI screening work?',
    'What are the ABCDE warning signs?',
    'What image formats are supported?',
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle initialization and analysis state updates
  useEffect(() => {
    if (!analysisResult) {
      // Pre-analysis greeting
      setMessages([
        {
          id: 'init-1',
          sender: 'assistant',
          text: "Hello! I'm the SkinSight AI Assistant.\n\nUpload a skin image and run an analysis first. Once the result is available, I can help explain the model output and provide general informational guidance.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isInitial: true,
        },
      ]);
      setActiveChips([
        'How does this AI screening work?',
        'What are the ABCDE warning signs?',
        'What image formats are supported?',
      ]);
    } else {
      // Post-analysis greeting with loaded context
      const confPct = Math.round(analysisResult.confidence * 100);
      setMessages([
        {
          id: 'analysis-context-1',
          sender: 'assistant',
          text: `I've reviewed the AI-assisted screening result.\n\n**Model Predicted:** ${analysisResult.prediction}\n**Confidence Score:** ${confPct}%\n**Architecture:** ${analysisResult.model}\n\nI can help explain what this result means, why the model produced it, how to interpret the Grad-CAM heatmap, and what questions you may want to discuss with a dermatologist.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isInitial: true,
          relatedCategory: analysisResult.prediction,
        },
      ]);

      setActiveChips([
        'What does this result mean?',
        'What is the prescription & treatment roadmap?',
        'Why did the AI predict this?',
        'What does the heatmap show?',
        'What should I ask a dermatologist for a prescription?',
        'What should I do next?',
      ]);
    }
  }, [analysisResult]);

  // Handle external query trigger (e.g. from "Ask AI Assistant" button on ResultCard)
  useEffect(() => {
    if (externalQueryTrigger) {
      handleSendMessage(externalQueryTrigger);
      onClearTrigger?.();
    }
  }, [externalQueryTrigger]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isTyping) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Math.random().toString(36).substring(2, 9),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    // Simulate AI thinking and generating context-aware response
    setTimeout(() => {
      const { response, suggestedChips } = generateChatbotResponse(query, analysisResult);

      const aiMsg: ChatMessage = {
        id: 'msg-' + Math.random().toString(36).substring(2, 9),
        sender: 'assistant',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
      if (suggestedChips && suggestedChips.length > 0) {
        setActiveChips(suggestedChips);
      }
    }, 900 + Math.random() * 400);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleChipClick = (chip: string) => {
    handleSendMessage(chip);
  };

  const handleResetChat = () => {
    if (!analysisResult) {
      setMessages([
        {
          id: 'init-reset',
          sender: 'assistant',
          text: "Hello! I'm the SkinSight AI Assistant.\n\nUpload a skin image and run an analysis first. Once the result is available, I can help explain the model output and provide general informational guidance.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isInitial: true,
        },
      ]);
    } else {
      const confPct = Math.round(analysisResult.confidence * 100);
      setMessages([
        {
          id: 'analysis-reset',
          sender: 'assistant',
          text: `Chat reset. Context is set to **${analysisResult.prediction}** (${confPct}% confidence).\n\nWhat would you like to know about this screening result?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full min-h-[580px] max-h-[760px]">
      {/* 1. Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-2xs">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                SkinSight AI Assistant
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>● Ready to help</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetChat}
          title="Reset conversation"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Context banner if analysis is present */}
      {analysisResult && (
        <div className="px-4 py-2 bg-teal-50/80 border-b border-teal-100/70 text-xs text-teal-900 flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="truncate">
              Active Context: <strong>{analysisResult.prediction}</strong> ({Math.round(analysisResult.confidence * 100)}%)
            </span>
          </div>
          <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider shrink-0 bg-white px-2 py-0.5 rounded border border-teal-200 shadow-2xs">
            {analysisResult.model}
          </span>
        </div>
      )}

      {/* 2. Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs sm:text-sm bg-white">
        {messages.map((msg) => {
          const isAssistant = msg.sender === 'assistant';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                isAssistant ? 'justify-start' : 'justify-end'
              }`}
            >
              {isAssistant && (
                <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 space-y-1 ${
                  isAssistant
                    ? 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs'
                    : 'bg-teal-600 text-white rounded-tr-xs shadow-2xs'
                }`}
              >
                {/* Text formatting */}
                <div className="whitespace-pre-line leading-relaxed">
                  {msg.text.split('\n').map((line, lIdx) => {
                    const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
                    return (
                      <div key={lIdx} className={line.startsWith('• ') ? 'pl-2' : ''}>
                        {parts.map((part, pIdx) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return (
                              <strong key={pIdx} className={isAssistant ? 'text-slate-900 font-bold' : 'text-white font-bold'}>
                                {part.slice(2, -2)}
                              </strong>
                            );
                          }
                          if (part.startsWith('*') && part.endsWith('*')) {
                            return <em key={pIdx}>{part.slice(1, -1)}</em>;
                          }
                          return part;
                        })}
                      </div>
                    );
                  })}
                </div>

                <div
                  className={`text-[10px] ${
                    isAssistant ? 'text-slate-400' : 'text-teal-200 text-right'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {!isAssistant && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-xs p-3 flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">SkinSight AI</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Quick Suggestion Chips */}
      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Sparkles className="w-3 h-3 text-teal-600" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Quick Questions:
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {activeChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleChipClick(chip)}
              disabled={isTyping}
              className="text-left text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-900 font-medium transition-colors shadow-2xs disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Chat Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-3.5 sm:p-4 border-t border-slate-100 flex items-center gap-2 bg-white rounded-b-2xl"
      >
        <input
          ref={inputRef}
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={
            analysisResult
              ? 'Ask about your result, heatmap, or next steps...'
              : 'Upload an image first, or ask general questions...'
          }
          className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-800 placeholder-slate-400 bg-slate-50/60 focus:bg-white"
        />

        <button
          type="submit"
          disabled={!inputQuery.trim() || isTyping}
          className="px-4 py-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs font-semibold text-xs flex items-center gap-1.5"
          title="Send message"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
