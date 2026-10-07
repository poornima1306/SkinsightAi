import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisProgress } from './components/AnalysisProgress';
import { ResultsCard } from './components/ResultsCard';
import { Chatbot } from './components/Chatbot';
import { HeatmapModal } from './components/HeatmapModal';
import { ModelTrainingStudioModal } from './components/ModelTrainingStudioModal';
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

  const currentImageRef = useRef<string | null>(null);
  const currentFileInfoRef = useRef<{ name: string; size: string; presetId?: string } | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SkinAnalysisResult | null>(null);
  const [isHeatmapModalOpen, setIsHeatmapModalOpen] = useState(false);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [activeModelName, setActiveModelName] = useState<string>('Stacked Ensemble (98.4%)');
  const [externalChatTrigger, setExternalChatTrigger] = useState<string | null>(null);

  const handleImageSelected = (
    imageDataUrl: string,
    info: { name: string; size: string; presetId?: string },
    immediateAnalyze?: boolean
  ) => {
    currentImageRef.current = imageDataUrl;
    currentFileInfoRef.current = info;
    setSelectedImage(imageDataUrl);
    setFileInfo(info);
    // Reset previous analysis result when new image is picked
    setAnalysisResult(null);
    if (immediateAnalyze) {
      setIsAnalyzing(true);
    }
  };

  const handleClearImage = () => {
    currentImageRef.current = null;
    currentFileInfoRef.current = null;
    setSelectedImage(null);
    setFileInfo(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
  };

  const handleStartAnalysis = async () => {
    const img = currentImageRef.current || selectedImage;
    if (!img) return;
    setIsAnalyzing(true);
  };

  // Called when the step-by-step progress animation finishes
  const handleProgressComplete = async () => {
    const img = currentImageRef.current || selectedImage;
    const info = currentFileInfoRef.current || fileInfo;
    if (!img) {
      setIsAnalyzing(false);
      return;
    }
    try {
      const result = await analyzeSkinImage(img, {
        fileName: info?.name,
        presetId: info?.presetId,
      });
      setAnalysisResult(result);
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetAll = () => {
    currentImageRef.current = null;
    currentFileInfoRef.current = null;
    setSelectedImage(null);
    setFileInfo(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setExternalChatTrigger(null);
  };

  const handleAskChatbot = (query?: string) => {
    setExternalChatTrigger(query || 'What does this result mean?');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-teal-100 selection:text-teal-900">
      {/* 1. Header (Sticky Top Bar, 3-Zone Contract) */}
      <Header
        onReset={handleResetAll}
        hasActiveAnalysis={Boolean(analysisResult || selectedImage)}
        onOpenTrainingModal={() => setIsTrainingModalOpen(true)}
        activeModelName={activeModelName}
      />

      {/* 2. Hero Section */}
      <Hero />

      {/* 3. Main Workspace Grid */}
      <main
        id="screening-workspace"
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column (7 cols): Upload -> Progress -> Result Card */}
          <div className="lg:col-span-7 flex flex-col gap-5">
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
                onOpenTrainingModal={() => setIsTrainingModalOpen(true)}
              />
            )}
          </div>

          {/* Right Column (5 cols): AI Assistant Chatbot */}
          <div id="chatbot-workspace" className="lg:col-span-5 sticky top-20">
            <Chatbot
              analysisResult={analysisResult}
              externalQueryTrigger={externalChatTrigger}
              onClearTrigger={() => setExternalChatTrigger(null)}
              onImageUpload={(imageDataUrl, info) => {
                handleImageSelected(imageDataUrl, info, true);
              }}
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

      {/* 5. AI Models & Neural Network Training Studio Modal */}
      <ModelTrainingStudioModal
        isOpen={isTrainingModalOpen}
        onClose={() => setIsTrainingModalOpen(false)}
        onModelUpdated={(id, name) => setActiveModelName(name)}
      />

      {/* 6. Medical Safety & Educational Footer */}
      <MedicalDisclaimer />
    </div>
  );
}
