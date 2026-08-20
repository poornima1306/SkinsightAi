import React from 'react';
import { AlertCircle, ShieldAlert, Cpu, Sparkles } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="pt-7 pb-5 sm:pb-7 text-center max-w-3xl mx-auto px-4">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 mb-3.5">
        <Cpu className="w-3.5 h-3.5 text-teal-600" />
        <span>Academic Computer Vision & Grad-CAM Prototype</span>
      </div>

      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 mb-2">
        AI-Assisted Skin Screening
      </h1>

      <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed mb-3">
        Upload a skin-lesion image to explore an AI-assisted screening result and receive clear informational guidance.
      </p>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50/80 border border-amber-200/70 text-amber-800 text-[11px] font-medium">
        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>Prototype only • Not a medical diagnosis • Academic Demo</span>
      </div>
    </section>
  );
};
