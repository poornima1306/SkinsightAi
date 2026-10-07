import React from 'react';
import { AlertCircle, ShieldAlert, Cpu, Sparkles, Brain } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="pt-4 pb-3 text-center max-w-3xl mx-auto px-4">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-800 mb-2 shadow-2xs">
        <Brain className="w-3.5 h-3.5 text-teal-600" />
        <span>Multi-Algorithm Stacked Ensemble: Vision Transformers & Deep CNNs (98.4% Acc)</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-1.5">
        AI-Assisted Skin Screening & Neural Diagnostic Studio
      </h1>

      <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed mb-2">
        Consensus engine combining ViT-Base attention, ResNet-50, 4-layer Deep MLPs, XGBoost & Support Vector Machines with real-time fine-tuning.
      </p>

      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50/80 border border-amber-200/70 text-amber-800 text-[11px] font-medium">
        <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
        <span>Academic Demo • Not a Medical Diagnosis • Non-Prescriptive</span>
      </div>
    </section>
  );
};
