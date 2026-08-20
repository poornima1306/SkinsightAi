import React, { useState } from 'react';
import { X, Layers, Eye, Sliders, Info, ShieldAlert } from 'lucide-react';
import { SkinAnalysisResult } from '../types';

interface HeatmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: SkinAnalysisResult | null;
}

export const HeatmapModal: React.FC<HeatmapModalProps> = ({ isOpen, onClose, result }) => {
  const [modalBlend, setModalBlend] = useState(70);
  const [activeTab, setActiveTab] = useState<'blended' | 'split' | 'raw'>('blended');

  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-600 text-white shadow-2xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                Explainable AI: Grad-CAM Attention Heatmap
              </h3>
              <p className="text-xs text-slate-400">
                Visualizing neural network activation regions for: {result.prediction}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-5">
          {/* Controls toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">View:</span>
              <button
                type="button"
                onClick={() => setActiveTab('blended')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'blended'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                Blended Overlay
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('split')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'split'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                Side-by-Side Comparison
              </button>
            </div>

            {activeTab === 'blended' && (
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-700">Heatmap Intensity:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={modalBlend}
                  onChange={(e) => setModalBlend(Number(e.target.value))}
                  className="w-28 accent-teal-600 cursor-pointer"
                />
                <span className="font-mono text-slate-700 w-8">{modalBlend}%</span>
              </div>
            )}
          </div>

          {/* Visualization Canvas Area */}
          {activeTab === 'blended' ? (
            <div className="relative w-full aspect-square max-w-md mx-auto rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center">
              <img
                src={result.originalImageUrl}
                alt="Original skin lesion"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {result.heatmapDataUrl && (
                <img
                  src={result.heatmapDataUrl}
                  alt="Heatmap activation overlay"
                  className="absolute inset-0 w-full h-full object-cover mix-blend-screen transition-opacity"
                  style={{ opacity: modalBlend / 100 }}
                />
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Original Dermoscopic Image
                </span>
                <div className="aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-950">
                  <img
                    src={result.originalImageUrl}
                    alt="Original"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Class Activation Map (Grad-CAM)
                </span>
                <div className="aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-950">
                  <img
                    src={result.heatmapDataUrl || result.originalImageUrl}
                    alt="Heatmap"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Color bar legend & Explainability description */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">Thermal Gradient Scale:</span>
                <div className="h-3.5 w-44 rounded bg-gradient-to-r from-blue-600 via-emerald-400 via-yellow-400 to-red-600 border border-slate-300" />
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                <span>0.0 (Min Influence)</span>
                <span>→</span>
                <span>1.0 (Maximum Influence)</span>
              </div>
            </div>

            <p className="text-slate-700 leading-relaxed">
              <strong>Technical Interpretation:</strong> {result.gradCamExplanation}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Academic Prototype Note:</strong> Grad-CAM highlights convolutional filters with high gradient weight toward the predicted class. It is an algorithmic interpretability tool, not a clinical pathology report.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-teal-600 text-white text-xs sm:text-sm font-semibold hover:bg-teal-700 transition-colors shadow-2xs"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
