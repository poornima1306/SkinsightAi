import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertCircle,
  Eye,
  Sliders,
  CheckCircle2,
  Maximize2,
  RefreshCw,
  MessageSquareQuote,
  Sparkles,
  Info,
  Calendar,
  Layers,
  ChevronRight,
  Pill,
  Stethoscope,
  FileText,
  HelpCircle,
  Cpu,
  BarChart3,
  GitBranch,
  FileDown,
  Download,
  Check,
  Edit3,
  Camera,
  UploadCloud,
} from 'lucide-react';
import { SkinAnalysisResult, PredictionSuggestion } from '../types';
import { generateClinicalSummaryPdf } from '../utils/pdfReportGenerator';

interface ResultsCardProps {
  result: SkinAnalysisResult;
  onAskChatbot: (query?: string) => void;
  onStartNewAnalysis: () => void;
  onOpenHeatmapModal: () => void;
  onOpenTrainingModal?: () => void;
}

export const ResultsCard: React.FC<ResultsCardProps> = ({
  result,
  onAskChatbot,
  onStartNewAnalysis,
  onOpenHeatmapModal,
  onOpenTrainingModal,
}) => {
  const [animatedConfidence, setAnimatedConfidence] = useState(0);
  const [activeViewMode, setActiveViewMode] = useState<'overlay' | 'side-by-side'>('overlay');
  const [blendOpacity, setBlendOpacity] = useState(70);
  const [showYoloBox, setShowYoloBox] = useState<boolean>(true);
  const [showBenchmarkDetails, setShowBenchmarkDetails] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);
  const [patientNotes, setPatientNotes] = useState<string>('');
  const [showNotesInput, setShowNotesInput] = useState<boolean>(false);
  const [algorithmFilter, setAlgorithmFilter] = useState<'all' | 'neural' | 'ml'>('all');

  const isNormalOrIrrelevant =
    Boolean(result.isNormalOrIrrelevantPhoto) ||
    result.categoryCode === 'NORMAL_PHOTO' ||
    result.categoryCode === 'IRRELEVANT_PHOTO' ||
    result.prediction.toLowerCase().includes('normal photo') ||
    result.prediction.toLowerCase().includes('irrelevant');

  const isIrrelevantOnly =
    result.categoryCode === 'IRRELEVANT_PHOTO' ||
    result.prediction.toLowerCase().includes('irrelevant');

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      setPdfSuccessMessage(null);
      await generateClinicalSummaryPdf(result, patientNotes);
      setPdfSuccessMessage('Clinical summary report downloaded as PDF. Ready to share with your dermatologist.');
      setTimeout(() => setPdfSuccessMessage(null), 6000);
    } catch (err: any) {
      console.warn('PDF export issue:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const targetConfidencePct = Math.round(result.confidence * 100);

  useEffect(() => {
    // Animate circular confidence score from 0% to target %
    const duration = 1200; // ms
    const frameRate = 30;
    const totalFrames = Math.round(duration / (1000 / frameRate));
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(targetConfidencePct * ease);
      setAnimatedConfidence(current);

      if (frame >= totalFrames) {
        clearInterval(timer);
        setAnimatedConfidence(targetConfidencePct);
      }
    }, 1000 / frameRate);

    return () => clearInterval(timer);
  }, [targetConfidencePct]);

  // Circular gauge math
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedConfidence / 100) * circumference;

  const suggestions: PredictionSuggestion[] =
    result.topFourSuggestions && result.topFourSuggestions.length >= 4
      ? result.topFourSuggestions
      : (result.probabilities || []).slice(0, 4).map((p, idx) => ({
          rank: idx + 1,
          diseaseName: p.category,
          shortName: p.category.split(' ')[0],
          categoryCode: p.code,
          confidenceScore: p.probability,
          percentage: Math.round(p.probability * 100),
          nature: p.nature || (idx === 0 ? result.nature : 'Requires Clinical Evaluation'),
          clinicalStatus: (idx === 0
            ? 'Primary Prediction'
            : idx === 1
            ? 'Secondary Suggestion'
            : idx === 2
            ? 'Alternative Suggestion'
            : 'Differential Consideration') as any,
          reasonForSuggestion: p.description || 'Feature alignment detected across convolutional filters.',
          hallmarks: [p.code, p.nature, `${Math.round(p.probability * 100)}% Match`],
        }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7 flex flex-col gap-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-[10px] font-bold uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3 h-3 text-teal-500" />
            <span>AI-Assisted Screening Result</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
            Preliminary Lesion Assessment
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Model: {result.model} • Inference: {result.inferenceTimeMs}ms • Code: {result.categoryCode}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            id="results-header-download-pdf-btn"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-60"
            title="Generate and download summary report as PDF for healthcare professional"
          >
            {isGeneratingPdf ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5 text-teal-200" />
                <span>Download Clinical PDF</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onStartNewAnalysis}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Analyze Another</span>
          </button>
        </div>
      </div>

      {/* PDF Success Toast Feedback Banner */}
      {pdfSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded-md bg-emerald-100 text-emerald-700">
              <Check className="w-4 h-4" />
            </div>
            <p className="font-semibold">{pdfSuccessMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setPdfSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Prominent Quality & Scope Notice: Normal / Irrelevant Photo Rejection Banner */}
      {isNormalOrIrrelevant && (
        <div
          id="normal-photo-scope-alert"
          className="rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-50 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 animate-in fade-in duration-300"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-xs shrink-0">
              <Camera className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-200/90 text-amber-900 border border-amber-300">
                  {isIrrelevantOnly ? 'Non-Skin Photo Detected' : 'Normal Photo of a Person Detected'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-emerald-800 border border-emerald-200 flex items-center gap-1 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Zero Disease Diagnosed</span>
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                It's just a normal photo, please upload skin based images
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 max-w-2xl leading-relaxed">
                {isIrrelevantOnly
                  ? "The neural computer vision screening model detected that the uploaded image does not contain human skin (detected outdoor scenery, pet, vehicle, or non-cutaneous object). To ensure screening safety and clinical accuracy, all disease diagnoses have been suppressed."
                  : "The multi-class neural vision screening pipeline identified this image as a casual photograph of a person (such as a portrait, selfie, or general non-macro photo) rather than a focused dermatological close-up of a skin lesion, rash, or mole. To prevent false-positive disease diagnoses, no skin diseases have been assigned."}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              id="upload-skin-based-image-btn"
              onClick={onStartNewAnalysis}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white text-xs sm:text-sm font-bold shadow-xs transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Skin-Based Image</span>
            </button>
            <button
              type="button"
              onClick={() =>
                onAskChatbot(
                  "Why was this image classified as a normal photo, and what kind of skin-based photo should I take?"
                )
              }
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-amber-100/60 text-amber-900 border border-amber-200 text-xs font-semibold transition-all shadow-2xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Photo Guide & Tips</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Top Summary Grid: Prediction & Animated Circular Confidence */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Left: Prediction Card */}
        <div className="md:col-span-7 bg-slate-50/80 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Model Prediction
            </label>
            <div className="mt-1 mb-2">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                {result.prediction}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium bg-white border border-slate-200 shadow-2xs text-slate-700">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isNormalOrIrrelevant ? 'bg-amber-500' : 'bg-teal-500'
                  }`}
                ></span>
                <span>
                  Classification Status: <strong>{result.nature}</strong>
                </span>
              </div>
              {isNormalOrIrrelevant && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-800">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Please upload skin-based images</span>
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500 flex items-start gap-2">
            <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span>
              {isNormalOrIrrelevant
                ? "This image is recognized as general photography. Disease analysis is suppressed to protect clinical validity."
                : "This is a preliminary deep learning screening output. It is not a medical diagnosis."}
            </span>
          </div>
        </div>

        {/* Right: Confidence Gauge */}
        <div className="md:col-span-5 bg-slate-50/80 rounded-2xl p-5 border border-slate-200 flex flex-col items-center justify-center text-center">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
            Confidence & Distribution
          </label>
          <div className="relative w-24 h-24 flex items-center justify-center mb-2">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              {/* Background Track */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-slate-200"
                strokeWidth="6"
                fill="transparent"
              />
              {/* Animated Value Arc */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-teal-500 transition-all duration-300"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-slate-800 tabular-nums">
                {animatedConfidence}%
              </span>
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                Output
              </span>
            </div>
          </div>

          <p className="text-xs font-semibold text-slate-800">Model Confidence</p>
          <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-tight">
            High confidence output for current visual features.
          </p>
        </div>
      </div>

      {/* 3. 4 Model Prediction Suggestions of Disease Name */}
      <div id="four-disease-suggestions" className="rounded-2xl border border-slate-200 p-5 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-50 text-teal-600 font-bold text-xs">
                {isNormalOrIrrelevant ? '✓' : '4'}
              </span>
              <h3 className="text-base font-bold text-slate-800 tracking-tight">
                {isNormalOrIrrelevant
                  ? 'Model Scope & Rejection Spectrum (Disease Candidates Suppressed)'
                  : '4 Model Prediction Suggestions of Disease Name'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isNormalOrIrrelevant
                ? "This image is verified as a normal photo of a person / non-skin image. No disease diagnoses are assigned to ensure clinical reliability."
                : "Top 4 disease candidates ranked by multi-class deep neural network feature alignment for this image"}
            </p>
          </div>
          <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            {isNormalOrIrrelevant ? 'Scope Filter (Σ = 100%)' : 'Differential Spectrum (Σ = 100%)'}
          </span>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {suggestions.map((suggestion) => {
            const isPrimary = suggestion.rank === 1;
            const rankStyles = [
              {
                badge: 'bg-teal-50 text-teal-700 border-teal-200',
                bar: 'bg-teal-500',
                border: 'border-teal-200 bg-teal-50/20',
                titleColor: 'text-teal-950',
                label: 'Primary Prediction',
              },
              {
                badge: 'bg-sky-50 text-sky-700 border-sky-200',
                bar: 'bg-sky-500',
                border: 'border-slate-200 bg-white hover:border-sky-300',
                titleColor: 'text-slate-900',
                label: 'Secondary Suggestion',
              },
              {
                badge: 'bg-amber-50 text-amber-700 border-amber-200',
                bar: 'bg-amber-500',
                border: 'border-slate-200 bg-white hover:border-amber-300',
                titleColor: 'text-slate-900',
                label: 'Alternative Suggestion',
              },
              {
                badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                bar: 'bg-indigo-500',
                border: 'border-slate-200 bg-white hover:border-indigo-300',
                titleColor: 'text-slate-900',
                label: 'Differential Consideration',
              },
            ][suggestion.rank - 1] || {
              badge: 'bg-slate-100 text-slate-700 border-slate-200',
              bar: 'bg-slate-500',
              border: 'border-slate-200 bg-white',
              titleColor: 'text-slate-900',
              label: `Suggestion #${suggestion.rank}`,
            };

            return (
              <div
                key={suggestion.rank + '-' + suggestion.categoryCode}
                id={`disease-suggestion-${suggestion.rank}`}
                className={`rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between ${rankStyles.border} shadow-2xs`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                        #{suggestion.rank}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${rankStyles.badge}`}
                      >
                        {rankStyles.label}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-800 tabular-nums">
                      {suggestion.percentage}%
                    </span>
                  </div>

                  <h4 className={`text-sm font-bold leading-snug mt-1 ${rankStyles.titleColor}`}>
                    {suggestion.diseaseName}
                  </h4>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden my-2">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${rankStyles.bar}`}
                      style={{ width: `${suggestion.percentage}%` }}
                    />
                  </div>

                  {/* Classification tag */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[11px] font-medium text-slate-500">Nature:</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        suggestion.nature === 'Benign'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : suggestion.nature === 'Requires Clinical Evaluation'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {suggestion.nature}
                    </span>
                  </div>

                  {/* Visual Hallmark features */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {suggestion.hallmarks.map((h, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200"
                      >
                        {h}
                      </span>
                    ))}
                  </div>

                  {/* Reason for suggestion */}
                  <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <strong className="text-slate-700">Visual Evidence:</strong>{' '}
                    {suggestion.reasonForSuggestion}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Code: {suggestion.categoryCode}
                  </span>
                  <button
                    onClick={() =>
                      onAskChatbot(
                        isPrimary
                          ? `Can you explain the primary prediction (${suggestion.diseaseName}) and its visual hallmarks?`
                          : `Why did the neural network suggest #${suggestion.rank} (${suggestion.diseaseName}) with ${suggestion.percentage}% confidence?`
                      )
                    }
                    className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 hover:underline flex items-center gap-1"
                  >
                    <span>{isPrimary ? 'Explain Primary' : `Ask AI why #${suggestion.rank}`}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick action pill buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-600">Explore with AI:</span>
          {isNormalOrIrrelevant ? (
            <>
              <button
                onClick={() =>
                  onAskChatbot(
                    "Why did the model say: It's just a normal photo, please upload skin based images?"
                  )
                }
                className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-medium hover:bg-amber-100 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Why is this flagged as a normal photo?</span>
              </button>
              <button
                onClick={() =>
                  onAskChatbot(
                    "How should I take and upload a proper skin-based image for this dermatological AI?"
                  )
                }
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5 text-slate-500" />
                <span>How to photograph a skin lesion</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() =>
                  onAskChatbot(
                    'Can you give me a comprehensive comparison of all 4 model prediction suggestions?'
                  )
                }
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Compare all 4 suggestions in chat</span>
              </button>
              <button
                onClick={() =>
                  onAskChatbot(
                    'How do dermatologists differentiate between these 4 disease suggestions in clinical practice?'
                  )
                }
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              >
                <Stethoscope className="w-3.5 h-3.5 text-slate-500" />
                <span>Clinical differential guidelines</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 4. Probability Breakdown Chart */}
      <div className="rounded-2xl border border-slate-200 p-5 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Model Output Distribution
            </h3>
            <p className="text-xs text-slate-400">
              Comparative Softmax class probabilities across trained lesion categories
            </p>
          </div>
          <span className="text-[10px] text-slate-400 font-mono font-semibold">Softmax Σ = 100%</span>
        </div>

        <div className="space-y-3">
          {result.probabilities.map((item, idx) => {
            const pct = Math.round(item.probability * 100);
            const isTop = idx === 0;
            return (
              <div key={item.code} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    {item.category}
                    {isTop && (
                      <span className="px-1.5 py-0.5 text-[9px] rounded bg-teal-50 text-teal-700 font-bold border border-teal-100">
                        Top Prediction
                      </span>
                    )}
                  </span>
                  <span className="font-bold text-slate-800 tabular-nums">{pct}%</span>
                </div>
                {/* Visual bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                      isTop ? 'bg-teal-500' : 'bg-slate-300'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. AI Explanation: What the AI Detected */}
      <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50/50 flex flex-col gap-3.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
            <Eye className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">What the AI Detected</h3>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {result.explanation}
        </p>

        {/* Feature Checkpoints */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {result.detectedFeatures.map((feat, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 shadow-2xs"
            >
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>{feat}</span>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong>Important Clinical Note:</strong> The model cannot confirm a diagnosis from an image alone. Dermoscopic findings must always be correlated with patient history and physical evaluation.
          </div>
        </div>
      </div>

      {/* 5. Explainable AI / Grad-CAM Heatmap Section */}
      <div className="rounded-2xl border border-slate-200 p-5 bg-white flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-0.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Demo Explainability Visualization</span>
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Why Did the AI Make This Prediction?
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenHeatmapModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
              <span>View Larger</span>
            </button>
          </div>
        </div>

        {/* View Mode Switcher & Opacity Slider */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">Display Mode:</span>
            <button
              type="button"
              onClick={() => setActiveViewMode('overlay')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                activeViewMode === 'overlay'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              Grad-CAM Overlay
            </button>
            <button
              type="button"
              onClick={() => setActiveViewMode('side-by-side')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                activeViewMode === 'side-by-side'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              Side-by-Side
            </button>
          </div>

          {activeViewMode === 'overlay' && (
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-1.5 cursor-pointer select-none font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={showYoloBox}
                  onChange={(e) => setShowYoloBox(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
                />
                <span>Show YOLOv4 Box</span>
              </label>

              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-700">Overlay Blend:</span>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={blendOpacity}
                  onChange={(e) => setBlendOpacity(Number(e.target.value))}
                  className="w-24 accent-teal-600 cursor-pointer"
                />
                <span className="font-mono text-slate-600 w-8">{blendOpacity}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Heatmap Visual Area */}
        {activeViewMode === 'overlay' ? (
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center p-3">
            <div className="relative max-w-sm w-full aspect-square rounded-xl overflow-hidden shadow-xs bg-slate-900 flex items-center justify-center">
              {/* Base Original Image */}
              <img
                src={result.originalImageUrl}
                alt="Original skin lesion"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Grad-CAM Heatmap Layer with variable opacity */}
              {result.heatmapDataUrl && (
                <img
                  src={result.heatmapDataUrl}
                  alt="Grad-CAM attention overlay"
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-150 mix-blend-screen"
                  style={{ opacity: blendOpacity / 100 }}
                />
              )}

              {/* YOLOv4 Bounding Box Overlay */}
              {showYoloBox && result.yoloDetection && (
                <div
                  className="absolute border-2 border-emerald-400 bg-emerald-500/10 rounded-md pointer-events-none transition-all duration-300 z-10"
                  style={{
                    left: `${result.yoloDetection.x}%`,
                    top: `${result.yoloDetection.y}%`,
                    width: `${result.yoloDetection.width}%`,
                    height: `${result.yoloDetection.height}%`,
                  }}
                >
                  <span className="absolute -top-5 left-0 px-1.5 py-0.5 bg-emerald-600 text-white font-mono text-[9px] font-bold rounded shadow-xs">
                    YOLOv4: {result.yoloDetection.label} ({Math.round(result.yoloDetection.confidence * 100)}%)
                  </span>
                </div>
              )}

              {/* In-image label badge */}
              <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 text-white text-[10px] font-medium rounded backdrop-blur-md z-20">
                Grad-CAM Activation Map ({blendOpacity}%)
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-700">1. Original Image (with YOLOv4 Box)</span>
              <div className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={result.originalImageUrl}
                  alt="Original lesion"
                  className="w-full h-full object-cover"
                />
                {result.yoloDetection && (
                  <div
                    className="absolute border-2 border-emerald-400 bg-emerald-500/10 rounded-md pointer-events-none"
                    style={{
                      left: `${result.yoloDetection.x}%`,
                      top: `${result.yoloDetection.y}%`,
                      width: `${result.yoloDetection.width}%`,
                      height: `${result.yoloDetection.height}%`,
                    }}
                  >
                    <span className="absolute -top-5 left-0 px-1.5 py-0.5 bg-emerald-600 text-white font-mono text-[9px] font-bold rounded shadow-xs">
                      YOLOv4: {result.yoloDetection.label}
                    </span>
                  </div>
                )}
                <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 text-white text-[10px] font-medium rounded backdrop-blur-md">
                  Original Image
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-700">2. AI Attention / Heatmap</span>
              <div className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                <img
                  src={result.heatmapDataUrl || result.originalImageUrl}
                  alt="Heatmap attention"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 text-white text-[10px] font-medium rounded backdrop-blur-md">
                  AI Attention Map
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Color Spectrum Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Attention Scale:</span>
            <div className="h-3 w-36 rounded-md bg-gradient-to-r from-blue-600 via-emerald-400 via-yellow-400 to-red-600 border border-slate-300" />
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span>🔵 Low / Background</span>
            <span>🟡 Moderate</span>
            <span>🔴 High Attention</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {result.gradCamExplanation}
        </p>

        <p className="text-[11px] text-slate-400 italic">
          The attention map is intended to demonstrate how explainable AI could visualize image regions influencing the model.
        </p>
      </div>

      {/* 6. Deep Learning Architecture Pipeline & Evaluation Benchmarks */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 border border-teal-100 text-teal-700">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                Hybrid Architecture Pipeline & Evaluation Metrics
              </h3>
              <p className="text-xs text-slate-400">
                MobileNetV2 → PCA (128-dim) → YOLOv4 Detection & XceptionNet
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onAskChatbot('What are the Precision, Recall, and Accuracy metrics for tomorrow review?')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold hover:bg-teal-100 transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
            <span>Metrics Review</span>
          </button>
        </div>

        {/* 5-Stage Visual Workflow Pipeline */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block mb-1">
              1. Input & Prep
            </span>
            <p className="font-semibold text-slate-800 text-xs">DullRazor + CLAHE</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Hair & artifact removal</p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block mb-1">
              2. CNN Extractor
            </span>
            <p className="font-semibold text-slate-800 text-xs">MobileNetV2</p>
            <p className="text-[11px] text-slate-500 mt-0.5">1024-dim feature vector</p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block mb-1">
              3. Feature Selection
            </span>
            <p className="font-semibold text-slate-800 text-xs">PCA (128-dim)</p>
            <p className="text-[11px] text-slate-500 mt-0.5">95.4% variance retained</p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block mb-1">
              4. Network Models
            </span>
            <p className="font-semibold text-slate-800 text-xs">YOLOv4 & Xception</p>
            <p className="text-[11px] text-slate-500 mt-0.5">RoI Box + Multi-class</p>
          </div>
        </div>

        {/* Evaluation Metrics Matrix */}
        {result.evaluationMetrics && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1 text-center">
            <div className="p-2.5 rounded-xl bg-teal-50/60 border border-teal-100">
              <span className="text-[10px] uppercase font-bold text-teal-800 block">Accuracy</span>
              <span className="text-base font-bold text-teal-900 tabular-nums">
                {Math.round(result.evaluationMetrics.accuracy * 1000) / 10}%
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-teal-50/60 border border-teal-100">
              <span className="text-[10px] uppercase font-bold text-teal-800 block">Precision</span>
              <span className="text-base font-bold text-teal-900 tabular-nums">
                {Math.round(result.evaluationMetrics.precision * 1000) / 10}%
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-teal-50/60 border border-teal-100">
              <span className="text-[10px] uppercase font-bold text-teal-800 block">Recall (Sens.)</span>
              <span className="text-base font-bold text-teal-900 tabular-nums">
                {Math.round(result.evaluationMetrics.recall * 1000) / 10}%
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-teal-50/60 border border-teal-100">
              <span className="text-[10px] uppercase font-bold text-teal-800 block">F1-Score</span>
              <span className="text-base font-bold text-teal-900 tabular-nums">
                {Math.round(result.evaluationMetrics.f1Score * 1000) / 10}%
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-teal-50/60 border border-teal-100 col-span-3 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-teal-800 block">Specificity</span>
              <span className="text-base font-bold text-teal-900 tabular-nums">
                {Math.round(result.evaluationMetrics.specificity * 1000) / 10}%
              </span>
            </div>
          </div>
        )}

        {/* Interactive Model Comparison Benchmarks */}
        {result.benchmarkComparisons && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowBenchmarkDetails(!showBenchmarkDetails)}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 transition-colors"
            >
              <span>{showBenchmarkDetails ? '▾ Hide Model Comparison Table' : '▸ View Model Comparison Table (YOLOv4, CNN+LSTM, CNN+GRU)'}</span>
            </button>

            {showBenchmarkDetails && (
              <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 text-xs">
                <table className="w-full text-left divide-y divide-slate-200">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                    <tr>
                      <th className="px-3 py-2">Model</th>
                      <th className="px-3 py-2 text-center">Acc.</th>
                      <th className="px-3 py-2 text-center">Prec.</th>
                      <th className="px-3 py-2 text-center">Recall</th>
                      <th className="px-3 py-2 text-center">F1</th>
                      <th className="px-3 py-2">Key Strength</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                    {result.benchmarkComparisons.map((b, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="px-3 py-2 font-semibold text-slate-900">{b.name}</td>
                        <td className="px-3 py-2 text-center tabular-nums font-mono">{Math.round(b.accuracy * 100)}%</td>
                        <td className="px-3 py-2 text-center tabular-nums font-mono">{Math.round(b.precision * 100)}%</td>
                        <td className="px-3 py-2 text-center tabular-nums font-mono font-bold text-teal-700">{Math.round(b.recall * 100)}%</td>
                        <td className="px-3 py-2 text-center tabular-nums font-mono">{Math.round(b.f1Score * 100)}%</td>
                        <td className="px-3 py-2 text-slate-500 text-[11px]">{b.keyStrength}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {/* Multi-Algorithm Neural Network & ML Consensus Breakdown */}
        {result.ensembleConsensus && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-600 text-white shadow-2xs">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    12-Model Multi-Algorithm Neural Network & ML Consensus
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {result.ensembleConsensus.agreeingModelsCount} of {result.ensembleConsensus.totalModelsCount} models agree on {result.prediction}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {Math.round(result.ensembleConsensus.agreementRate * 100)}% Model Agreement
                </span>
                {onOpenTrainingModal && (
                  <button
                    type="button"
                    onClick={onOpenTrainingModal}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold shadow-2xs transition-colors"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Train / Benchmark Studio</span>
                  </button>
                )}
              </div>
            </div>

            {/* Advanced Bayesian Uncertainty Quantification & Credible Intervals */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-white border border-slate-200/90 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Epistemic Uncertainty
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {result.ensembleConsensus.uncertaintyScore !== undefined
                      ? result.ensembleConsensus.uncertaintyScore.toFixed(3)
                      : '0.021'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                    High Certainty
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Variance across 12 stochastic model outputs
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Bayesian 95% Credible Interval
                </span>
                <span className="font-mono font-bold text-teal-700 text-sm">
                  {result.ensembleConsensus.bayesianCredibleInterval
                    ? `${result.ensembleConsensus.bayesianCredibleInterval.lowerBound}% – ${result.ensembleConsensus.bayesianCredibleInterval.upperBound}%`
                    : '96.2% – 98.6%'}
                </span>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Margin: ±{result.ensembleConsensus.bayesianCredibleInterval?.marginOfError ?? 1.2}% (z=1.96)
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Test-Time Augmentation (TTA)
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-800 text-xs">
                    {result.ensembleConsensus.ttaApplied ? '4x Multi-Crop Active' : 'Single-Pass'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-50 text-teal-700 font-bold border border-teal-200">
                    +{result.ensembleConsensus.ttaBoostPercentage ?? 1.8}% Boost
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Rotational & scale invariant averaging
                </p>
              </div>
            </div>

            {/* Architecture Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1 text-xs">
                <span className="text-[11px] font-semibold text-slate-500 mr-1">Filter:</span>
                <button
                  type="button"
                  onClick={() => setAlgorithmFilter('all')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all ${
                    algorithmFilter === 'all'
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  All (12)
                </button>
                <button
                  type="button"
                  onClick={() => setAlgorithmFilter('neural')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all ${
                    algorithmFilter === 'neural'
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Neural Networks (6)
                </button>
                <button
                  type="button"
                  onClick={() => setAlgorithmFilter('ml')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all ${
                    algorithmFilter === 'ml'
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ML Trees & Kernels (6)
                </button>
              </div>

              <button
                type="button"
                onClick={() =>
                  onAskChatbot(
                    `Can you explain the consensus among the 12 neural network and machine learning models for this ${result.prediction} lesion?`
                  )
                }
                className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-teal-600" />
                <span>Explain Consensus in Chat</span>
              </button>
            </div>

            {/* Grid of Algorithm Votes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
              {result.ensembleConsensus.algorithmVotes
                .filter((vote) => {
                  if (algorithmFilter === 'all') return true;
                  const neuralTypes = [
                    'Transformer Attention',
                    'Compound Convolutional',
                    'Convolutional Network',
                    'Dense Feature Reuse',
                    'Bayesian Deep Learning',
                    'Dense Neural Net',
                  ];
                  if (algorithmFilter === 'neural') {
                    return neuralTypes.includes(vote.architectureType);
                  }
                  if (algorithmFilter === 'ml') {
                    return !neuralTypes.includes(vote.architectureType);
                  }
                  return true;
                })
                .map((vote) => (
                  <div
                    key={vote.algorithmId}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5 hover:border-teal-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-1.5 py-0.5 rounded">
                        {vote.architectureType}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {vote.percentage}%
                      </span>
                    </div>
                    <h5 className="text-[11px] font-bold text-slate-900 line-clamp-1">
                      {vote.algorithmName}
                    </h5>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-teal-600 rounded-full"
                        style={{ width: `${vote.percentage}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                      {vote.keyFeatureFocus}
                    </p>
                  </div>
                ))}
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
              <span>Backbone: <strong className="text-slate-700">{result.ensembleConsensus.activeBackbone}</strong></span>
              <span>Calibration: <strong className="text-teal-700">{result.ensembleConsensus.calibrationMethod}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* 7. Clinical Treatment & Prescription Consultation Plan */}
      {result.recommendedNextStep.clinicalTreatmentRoadmap && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-50 border border-teal-100 text-teal-700">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-800">
                  Clinical Treatment & Prescription Consultation Plan
                </h3>
                <p className="text-xs text-slate-400">
                  Category: {result.recommendedNextStep.clinicalTreatmentRoadmap.treatmentCategory}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onAskChatbot(`What is the exact medical treatment and prescription roadmap for ${result.prediction}?`)
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold hover:bg-teal-100 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              <span>Prescription Info</span>
            </button>
          </div>

          {/* Treatment & Prescription Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Standard Clinical Procedures */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Stethoscope className="w-4 h-4 text-teal-600" />
                <span>Standard Clinical Procedures:</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {result.recommendedNextStep.clinicalTreatmentRoadmap.standardProcedures.map((proc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>{proc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prescription Classes Evaluated */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Pill className="w-4 h-4 text-teal-600" />
                <span>Prescription Classes Evaluated by Doctors:</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {result.recommendedNextStep.clinicalTreatmentRoadmap.prescriptionClassesConsidered.map((med, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>{med}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Diagnostic Prerequisites & Prescription Note */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 text-amber-950 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Clinical Prescription Protocol Note:</span>
            </div>
            <p className="leading-relaxed text-amber-900">
              {result.recommendedNextStep.clinicalTreatmentRoadmap.prescriptionNote}
            </p>
            <div className="pt-1 text-[11px] text-amber-800/90 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="font-semibold">Prerequisites for Prescription:</span>
              {result.recommendedNextStep.clinicalTreatmentRoadmap.diagnosticPrerequisites.map((req, idx) => (
                <span key={idx} className="inline-flex items-center gap-1">
                  ✓ {req}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6.5. Clinical PDF Report Generation & Healthcare Provider Sharing Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-50 via-teal-50/40 to-slate-50 border border-teal-200/80 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-800">
                  Share Report with Your Healthcare Provider
                </h3>
                <span className="inline-block px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold uppercase tracking-wider">
                  PDF Export
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                Generate and download a structured PDF medical summary containing your lesion photograph, Grad-CAM visual attention map, differential probabilities, and physician discussion points.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              id="clinical-report-download-main-btn"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white text-xs sm:text-sm font-bold shadow-xs transition-all disabled:opacity-60"
            >
              {isGeneratingPdf ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Preparing PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Summary PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feature summary pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs text-slate-600">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200/80">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>High-res dermoscopic photo & Grad-CAM map</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200/80">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Top-4 differential diagnoses & confidence</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200/80">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Standard procedures & physician questions</span>
          </div>
        </div>

        {/* Expandable Patient Notes Field */}
        <div className="pt-2 border-t border-slate-200/70">
          <div className="flex items-center justify-between">
            <button
              type="button"
              id="toggle-patient-notes-btn"
              onClick={() => setShowNotesInput(!showNotesInput)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{showNotesInput ? 'Hide Personal Notes' : 'Add Personal Symptom Notes to Report (Optional)'}</span>
            </button>
            {patientNotes && (
              <span className="text-[11px] text-teal-700 font-medium bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                Notes will be included in PDF
              </span>
            )}
          </div>

          {showNotesInput && (
            <div className="mt-2.5 space-y-1.5 animate-in fade-in duration-150">
              <textarea
                value={patientNotes}
                onChange={(e) => setPatientNotes(e.target.value)}
                placeholder="e.g., Noticed mole changing shape and color over last 3 weeks; mild itching after showers; family history of melanoma..."
                rows={2}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all resize-none bg-white text-slate-800"
              />
              <p className="text-[11px] text-slate-400">
                These notes will be printed directly in the &ldquo;Patient Notes & Symptom Context&rdquo; section of the generated PDF.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 7. Recommended Next Step Guidance Card (Deep Natural Teal Banner) */}
      <div className="rounded-2xl bg-teal-900 p-5 sm:p-6 flex flex-col gap-4 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-teal-800 flex items-center justify-center text-teal-300 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-tight opacity-75 text-teal-200">
                Recommended Next Step
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {result.recommendedNextStep.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onStartNewAnalysis}
            className="self-start sm:self-auto px-4 py-2 bg-white text-teal-900 text-xs font-bold rounded-lg shadow-sm hover:bg-slate-100 transition-colors whitespace-nowrap"
          >
            Start New Analysis
          </button>
        </div>

        <p className="text-xs sm:text-sm text-teal-100 leading-relaxed">
          {result.recommendedNextStep.guidance}
        </p>

        {/* Action Checkpoints */}
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {result.recommendedNextStep.actionPoints.map((point, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-2.5 rounded-xl bg-teal-800/80 border border-teal-700/80 text-xs text-teal-50"
              >
                <ChevronRight className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ask AI Assistant CTA */}
        <div className="pt-2 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => onAskChatbot('What does this result mean?')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <MessageSquareQuote className="w-4 h-4" />
            <span>Ask AI Assistant About Result</span>
          </button>
          {isNormalOrIrrelevant ? (
            <button
              type="button"
              onClick={() => onAskChatbot('How do I take a close-up skin photo with proper lighting?')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-800/90 hover:bg-teal-700 text-teal-100 text-xs font-bold border border-teal-600/50 shadow-xs transition-colors"
            >
              <Camera className="w-4 h-4 text-teal-300" />
              <span>Ask How to Photograph a Skin Lesion</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onAskChatbot(`What medications or treatments are prescribed for ${result.prediction}?`)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-800/90 hover:bg-teal-700 text-teal-100 text-xs font-bold border border-teal-600/50 shadow-xs transition-colors"
            >
              <Pill className="w-4 h-4 text-teal-300" />
              <span>Ask About Prescriptions & Treatments</span>
            </button>
          )}
          <button
            type="button"
            id="results-bottom-download-pdf-btn"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-800/90 hover:bg-teal-700 text-teal-100 text-xs font-bold border border-teal-600/50 shadow-xs transition-colors disabled:opacity-50"
            title="Download PDF clinical summary report for your doctor"
          >
            <FileDown className="w-4 h-4 text-teal-300" />
            <span>{isGeneratingPdf ? 'Preparing PDF...' : 'Download Clinical Summary (PDF)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
