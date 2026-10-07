import React from 'react';
import { ShieldAlert, AlertTriangle, Stethoscope, BookOpen, CheckCircle, Info } from 'lucide-react';

export const MedicalDisclaimer: React.FC = () => {
  return (
    <footer className="mt-6 pt-6 pb-6 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Highlighted Safety Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-950 flex flex-col sm:flex-row items-start gap-3.5">
          <div className="p-2 rounded-xl bg-amber-600 text-white shrink-0 shadow-2xs">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="space-y-1 flex-1">
            <h4 className="text-xs sm:text-sm font-bold text-amber-950">
              Mandatory Medical & Academic Prototype Notice
            </h4>
            <p className="leading-relaxed text-amber-900 text-xs">
              <strong>SkinSight AI</strong> is an academic prototype evaluating MobileNetV2, PCA, YOLOv4, XceptionNet, CNN+LSTM, and Grad-CAM workflows. 
              <strong> It is not a clinical diagnostic device and cannot prescribe treatments or medications.</strong>
            </p>
          </div>
        </div>

        {/* Informational Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs text-slate-500">
          <div className="space-y-1.5" id="how-it-works">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <BookOpen className="w-4 h-4 text-teal-600" />
              <span>MobileNetV2 + PCA + YOLOv4</span>
            </div>
            <p className="leading-relaxed text-slate-500 text-[11px]">
              Extracts 1024-dim inverted residual feature embeddings, selects 128 principal components via PCA (95.4% variance), and isolates lesions via YOLOv4.
            </p>
          </div>

          <div className="space-y-1.5" id="grad-cam-info">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Info className="w-4 h-4 text-teal-600" />
              <span>Explainable AI (Grad-CAM)</span>
            </div>
            <p className="leading-relaxed text-slate-600 text-[11px]">
              Calculates gradient heatmaps of the predicted class score with respect to convolutional activation layers to highlight pathological focus.
            </p>
          </div>

          <div className="space-y-1.5" id="safety-guidance">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>Clinical Doctor Evaluation</span>
            </div>
            <p className="leading-relaxed text-slate-500 text-[11px]">
              Dermatologists combine polarized dermoscopy with physical palpation and histological biopsy for definitive medical care.
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400 text-[11px]">
          <p>© {new Date().getFullYear()} SkinSight AI • Hybrid Architecture & Review Demo</p>
          <div className="flex items-center gap-3 font-medium">
            <span>MobileNetV2 & YOLOv4 Evaluation Pipeline</span>
            <span>•</span>
            <span>Non-Diagnostic Prototype</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
