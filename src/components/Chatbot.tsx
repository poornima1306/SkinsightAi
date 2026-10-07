import React, { useState, useEffect, useRef, FormEvent, DragEvent, ChangeEvent } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  RotateCcw,
  Camera,
  Image as ImageIcon,
  Paperclip,
  UploadCloud,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { ChatMessage, SkinAnalysisResult } from '../types';
import {
  generateChatbotResponse,
  formatAnalysisSummaryMessage,
  analyzeSkinImage,
} from '../services/mockDermService';
import { CameraCaptureModal } from './CameraCaptureModal';

interface ChatbotProps {
  analysisResult: SkinAnalysisResult | null;
  externalQueryTrigger?: string | null;
  onClearTrigger?: () => void;
  onImageUpload?: (
    imageDataUrl: string,
    info: { name: string; size: string; presetId?: string }
  ) => void;
}

export const Chatbot: React.FC<ChatbotProps> = ({
  analysisResult,
  externalQueryTrigger,
  onClearTrigger,
  onImageUpload,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [activeChips, setActiveChips] = useState<string[]>([
    'What is the full pipeline concept?',
    'What are the Precision and Recall metrics?',
    'How does MobileNetV2 + PCA work?',
    'How does YOLOv4 detect the lesion?',
    'What are the advantages of CNN+LSTM?',
    'What is the prescription & treatment roadmap?',
  ]);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastProcessedResultIdRef = useRef<string | null>(null);

  // Auto-scroll within the inner chat messages container
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle initialization and external analysis updates
  useEffect(() => {
    if (!analysisResult) {
      if (messages.length === 0) {
        setMessages([
          {
            id: 'init-1',
            sender: 'assistant',
            text: "Hello! I'm the SkinSight Clinical Assistant.\n\nI can help explain skin conditions, multi-class model predictions, key visual hallmarks, and clinical consultation guidance.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isInitial: true,
          },
        ]);
      }
      return;
    }

    // Avoid duplicate assistant message if already added
    if (lastProcessedResultIdRef.current === analysisResult.timestamp) {
      return;
    }
    lastProcessedResultIdRef.current = analysisResult.timestamp;

    const { text, chips } = formatAnalysisSummaryMessage(analysisResult);
    const aiMsg: ChatMessage = {
      id: 'analysis-' + Date.now(),
      sender: 'assistant',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      relatedCategory: analysisResult.prediction,
      analysisResult: analysisResult,
    };

    setMessages((prev) => [...prev, aiMsg]);
    setActiveChips(chips);
  }, [analysisResult]);

  // Handle external query trigger (e.g. from "Ask AI Assistant" button on ResultCard)
  useEffect(() => {
    if (externalQueryTrigger) {
      handleSendMessage(externalQueryTrigger);
      onClearTrigger?.();
    }
  }, [externalQueryTrigger]);

  const handleProcessImage = async (
    imageDataUrl: string,
    info: { name: string; size: string; presetId?: string }
  ) => {
    setUploadError(null);

    // 1. Add user message with image preview thumbnail
    const userMsg: ChatMessage = {
      id: 'msg-img-' + Date.now(),
      sender: 'user',
      text: '',
      imageUrl: imageDataUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // 2. Notify parent to sync main app view
    onImageUpload?.(imageDataUrl, info);

    // 3. Directly run inference for responsive chatbot feedback
    try {
      const result = await analyzeSkinImage(imageDataUrl, {
        fileName: info.name,
        presetId: info.presetId,
      });

      lastProcessedResultIdRef.current = result.timestamp;

      const { text: summaryText, chips } = formatAnalysisSummaryMessage(result);
      const aiMsg: ChatMessage = {
        id: 'msg-ai-res-' + Date.now(),
        sender: 'assistant',
        text: summaryText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        relatedCategory: result.prediction,
        analysisResult: result,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setActiveChips(chips);
    } catch (err) {
      console.error('Chatbot image analysis error:', err);
      const errorMsg: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        sender: 'assistant',
        text: 'Sorry, I encountered an issue analyzing the image features. Please ensure the image is clear, in focus, and adequately lit.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCameraCaptureConfirm = (capturedDataUrl: string) => {
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const estimatedKb = Math.max(1, Math.round((capturedDataUrl.length * 3) / 4 / 1024));
    handleProcessImage(capturedDataUrl, {
      name: `live_camera_${dateStr}.jpg`,
      size: `${estimatedKb} KB (Live Camera)`,
    });
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please select a JPG, JPEG, PNG, or WebP image.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('Image exceeds 15MB limit. Please choose a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        const sizeFormatted = (file.size / 1024).toFixed(1) + ' KB';
        handleProcessImage(event.target.result, {
          name: file.name,
          size: sizeFormatted,
        });
      }
    };
    reader.readAsDataURL(file);

    // Reset input so re-selecting same file triggers change
    e.target.value = '';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          const sizeFormatted = (file.size / 1024).toFixed(1) + ' KB';
          handleProcessImage(event.target.result, {
            name: file.name,
            size: sizeFormatted,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
    }, 450);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleChipClick = (chipText: string) => {
    handleSendMessage(chipText);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'reset-1',
        sender: 'assistant',
        text: "Conversation refreshed. I'm ready to analyze a new skin image or answer questions regarding our multi-stage deep learning pipeline, Grad-CAM attention maps, or clinical consultation procedures.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isInitial: true,
      },
    ]);
    setActiveChips([
      'What is the full pipeline concept?',
      'What are the Precision and Recall metrics?',
      'How does MobileNetV2 + PCA work?',
      'What is the prescription & treatment roadmap?',
    ]);
  };

  return (
    <div
      id="skin-sight-chatbot"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative bg-white rounded-2xl border transition-all duration-200 shadow-sm flex flex-col h-[680px] ${
        isDragOver ? 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/20' : 'border-slate-200'
      }`}
    >
      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Real-time Camera Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCaptureConfirm={handleCameraCaptureConfirm}
      />

      {/* Drag & Drop Visual Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-30 bg-teal-600/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center text-white p-6 pointer-events-none">
          <UploadCloud className="w-12 h-12 mb-2 animate-bounce" />
          <p className="text-base font-bold">Drop Image to Analyze</p>
          <p className="text-xs text-teal-100">Deep learning multi-class evaluation</p>
        </div>
      )}

      {/* 1. Chatbot Header */}
      <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800">SkinSight Clinical Assistant</h3>
              <span className="px-1.5 py-0.5 rounded-md bg-teal-100 text-teal-800 text-[10px] font-semibold">
                Multimodal AI
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              {analysisResult
                ? `Active Context: ${analysisResult.prediction}`
                : 'Upload or snap an image for live assessment'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsCameraOpen(true)}
            title="Take Photo on Spot with Live Camera"
            className="p-1.5 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-teal-50 border border-slate-200 transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Upload Image from Device"
            className="p-1.5 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-teal-50 border border-slate-200 transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetChat}
            title="Reset conversation"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="mx-4 mt-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button onClick={() => setUploadError(null)} className="font-bold text-rose-600 px-1">
            ×
          </button>
        </div>
      )}

      {/* 2. Messages Container */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs sm:text-sm bg-white">
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
                className={`max-w-[88%] rounded-2xl p-3.5 space-y-2 ${
                  isAssistant
                    ? 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs shadow-2xs'
                    : 'bg-teal-600 text-white rounded-tr-xs shadow-2xs'
                }`}
              >
                {/* Uploaded image thumbnail preview in chat */}
                {msg.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-white/20 shadow-xs max-w-xs">
                    <img
                      src={msg.imageUrl}
                      alt="Skin lesion"
                      className="w-full h-40 object-cover bg-slate-900"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Text formatting */}
                {Boolean(msg.text?.trim()) && (
                  <div className="whitespace-pre-line leading-relaxed">
                    {msg.text.split('\n').map((line, lIdx) => {
                    const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
                    return (
                      <div key={lIdx} className={line.startsWith('• ') ? 'pl-2' : ''}>
                        {parts.map((part, pIdx) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return (
                              <strong
                                key={pIdx}
                                className={isAssistant ? 'text-slate-900 font-bold' : 'text-white font-bold'}
                              >
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
              )}

                <div
                  className={`text-[10px] ${
                    isAssistant ? 'text-slate-400' : 'text-teal-200 text-right'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {!isAssistant && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing / Scanning indicator */}
        {isTyping && (
          <div className="flex items-start gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-xs p-3 flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Evaluating visual feature maps...</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
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

      {/* 4. Chat Input Form with Dual Image Capture Actions */}
      <form
        onSubmit={handleSubmit}
        className="p-3.5 sm:p-4 border-t border-slate-100 flex items-center gap-2 bg-white rounded-b-2xl"
      >
        <button
          type="button"
          id="chat-camera-btn"
          onClick={() => setIsCameraOpen(true)}
          className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:text-teal-700 hover:bg-teal-50 hover:border-teal-200 transition-colors shrink-0"
          title="Take picture on spot with live camera"
        >
          <Camera className="w-4 h-4" />
        </button>

        <button
          type="button"
          id="chat-upload-btn"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:text-teal-700 hover:bg-teal-50 hover:border-teal-200 transition-colors shrink-0"
          title="Attach skin image file"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <input
          ref={inputRef}
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={
            analysisResult
              ? 'Ask about this result, heatmap, or next steps...'
              : 'Upload an image, snap a photo, or ask questions...'
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
