import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisProgress } from './components/AnalysisProgress';
import { ResultsCard } from './components/ResultsCard';
import { Chatbot } from './components/Chatbot';
import { HeatmapModal } from './components/HeatmapModal';
import { MedicalDisclaimer } from './components/MedicalDisclaimer';
import { SkinAnalysisResult } from './types';
import { analyzeSkinImage } from './services/mockDermService';

export default function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size: string;
    presetId?: string;
  } | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SkinAnalysisResult | null>(null);
  const [isHeatmapModalOpen, setIsHeatmapModalOpen] = useState(false);
  const [externalChatTrigger, setExternalChatTrigger] = useState<string | null>(null);

  const handleImageSelected = (
    imageDataUrl: string,
    info: { name: string; size: string; presetId?: string }
  ) => {
    setSelectedImage(imageDataUrl);
    setFileInfo(info);
    // Reset previous analysis result when new image is picked
    setAnalysisResult(null);
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setFileInfo(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
  };

  const handleStartAnalysis = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
  };

  // Called when the step-by-step progress animation finishes
  const handleProgressComplete = async () => {
    if (!selectedImage) return;
    try {
      const result = await analyzeSkinImage(selectedImage, {
        fileName: fileInfo?.name,
        presetId: fileInfo?.presetId,
      });
      setAnalysisResult(result);
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetAll = () => {
    setSelectedImage(null);
    setFileInfo(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setExternalChatTrigger(null);
  };

  const handleAskChatbot = (query?: string) => {
    setExternalChatTrigger(query || 'What does this result mean?');
    // On mobile, scroll chat into view smoothly
    const chatElement = document.getElementById('chatbot-workspace');
    if (chatElement) {
      chatElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-teal-100 selection:text-teal-900">
      {/* 1. Header (Sticky Top Bar, 3-Zone Contract) */}
      <Header
        onReset={handleResetAll}
        hasActiveAnalysis={Boolean(analysisResult || selectedImage)}
      />

      {/* 2. Hero Section */}
      <Hero />

      {/* 3. Main Workspace Grid */}
      <main
        id="screening-workspace"
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Upload -> Progress -> Result Card */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {!analysisResult && !isAnalyzing && (
              <ImageUploader
                onImageSelected={handleImageSelected}
                selectedImage={selectedImage}
                fileInfo={fileInfo}
                onAnalyze={handleStartAnalysis}
                isAnalyzing={isAnalyzing}
                onClear={handleClearImage}
              />
            )}

            {isAnalyzing && (
              <AnalysisProgress onComplete={handleProgressComplete} />
            )}

            {analysisResult && !isAnalyzing && (
              <ResultsCard
                result={analysisResult}
                onAskChatbot={handleAskChatbot}
                onStartNewAnalysis={handleResetAll}
                onOpenHeatmapModal={() => setIsHeatmapModalOpen(true)}
              />
            )}
          </div>

          {/* Right Column (5 cols): AI Assistant Chatbot */}
          <div id="chatbot-workspace" className="lg:col-span-5 sticky top-20">
            <Chatbot
              analysisResult={analysisResult}
              externalQueryTrigger={externalChatTrigger}
              onClearTrigger={() => setExternalChatTrigger(null)}
            />
          </div>
        </div>
      </main>

      {/* 4. Heatmap Modal for High-Resolution Inspection */}
      <HeatmapModal
        isOpen={isHeatmapModalOpen}
        onClose={() => setIsHeatmapModalOpen(false)}
        result={analysisResult}
      />

      {/* 5. Medical Safety & Educational Footer */}
      <MedicalDisclaimer />
    </div>
  );
}
