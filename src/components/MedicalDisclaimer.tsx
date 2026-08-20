import React from 'react';
import { ShieldAlert, AlertTriangle, Stethoscope, BookOpen, CheckCircle, Info } from 'lucide-react';

export const MedicalDisclaimer: React.FC = () => {
  return (
    <footer className="mt-12 pt-8 pb-12 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Highlighted Safety Box */}
        <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-950 flex flex-col sm:flex-row items-start gap-4">
          <div className="p-2.5 rounded-xl bg-amber-600 text-white shrink-0 shadow-2xs">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h4 className="text-sm font-bold text-amber-950">
              Mandatory Medical & Academic Prototype Notice
            </h4>
            <p className="leading-relaxed text-amber-900 text-xs sm:text-sm">
              <strong>SkinSight AI</strong> is an academic prototype designed to demonstrate computer vision image screening and explainable AI (Grad-CAM) workflows. 
              <strong> It is not a clinical diagnostic device, does not provide medical diagnoses, and cannot prescribe treatments or medications.</strong>
            </p>
            <p className="leading-relaxed text-amber-800/90 text-xs">
              Never disregard professional medical advice or delay seeking evaluation from a board-certified dermatologist because of an AI-assisted screening output. If you have any lesion that is changing, bleeding, itching, or concerning, consult a qualified physician immediately.
            </p>
          </div>
        </div>

        {/* Informational Columns for Academic Demo (How it Works, ABCDE Rule, Prototype Specs) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-xs text-slate-500">
          <div className="space-y-2" id="how-it-works">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <BookOpen className="w-4 h-4 text-teal-600" />
              <span>AI Screening Pipeline</span>
            </div>
            <p className="leading-relaxed text-slate-500">
              The model utilizes convolutional feature representations (EfficientNetB0 backbone) to extract geometric, textural, and chromatic feature vectors from dermoscopic images.
            </p>
          </div>

          <div className="space-y-2" id="grad-cam-info">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Info className="w-4 h-4 text-teal-600" />
              <span>Explainable AI (Grad-CAM)</span>
            </div>
            <p className="leading-relaxed text-slate-600">
              Gradient-weighted Class Activation Mapping calculates gradients of the top predicted class score with respect to feature activation maps in the final convolutional layer.
            </p>
          </div>

          <div className="space-y-2" id="safety-guidance">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>Clinical Evaluation Standard</span>
            </div>
            <p className="leading-relaxed text-slate-500">
              Dermatologists combine high-magnification polarized dermoscopy with palpation, patient risk history, and histopathological biopsy for definitive diagnosis.
            </p>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
          <p>© {new Date().getFullYear()} SkinSight AI • Academic Demonstration Prototype</p>
          <div className="flex items-center gap-4 font-medium">
            <span>Built for Academic Screening Demonstration</span>
            <span>•</span>
            <span>Non-Diagnostic Prototype</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
