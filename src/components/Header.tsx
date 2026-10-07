import React from 'react';
import { ShieldCheck, Sparkles, RefreshCw, AlertCircle, Cpu } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  hasActiveAnalysis: boolean;
  onOpenSafetyModal?: () => void;
  onOpenTrainingModal?: () => void;
  activeModelName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  hasActiveAnalysis,
  onOpenTrainingModal,
  activeModelName = 'Stacked Ensemble (98.4%)',
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Title with Medical Shield + AI brand wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white shadow-xs">
            <ShieldCheck className="h-5 w-5 stroke-[2.4]" />
          </div>
          <div className="flex items-center">
            <span className="text-xl font-bold tracking-tight text-slate-800">
              SkinSight <span className="text-teal-600">AI</span>
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600">
          <a
            href="#screening-workspace"
            className="rounded-lg px-3 py-1.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap"
          >
            Screening
          </a>
          <button
            type="button"
            onClick={onOpenTrainingModal}
            className="rounded-lg px-3 py-1.5 text-teal-700 hover:bg-teal-50 hover:text-teal-900 font-bold transition-colors whitespace-nowrap flex items-center gap-1"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Model & Training Studio</span>
          </button>
          <a
            href="#how-it-works"
            className="rounded-lg px-3 py-1.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap"
          >
            How AI Works
          </a>
          <a
            href="#grad-cam-info"
            className="rounded-lg px-3 py-1.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap"
          >
            Explainability
          </a>
          <a
            href="#safety-guidance"
            className="rounded-lg px-3 py-1.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap"
          >
            Safety Protocol
          </a>
        </nav>

        {/* Zone 3: Primary Actions & Prototype Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenTrainingModal && (
            <button
              type="button"
              onClick={onOpenTrainingModal}
              className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50/80 hover:bg-teal-100/80 px-3 py-1 text-xs font-semibold text-teal-800 transition-colors shadow-2xs"
              title="Open AI Model Training & Fine-Tuning Studio"
            >
              <Cpu className="w-3 h-3 text-teal-600" />
              <span className="hidden sm:inline font-bold">Model Studio:</span>
              <span className="truncate max-w-[140px] text-teal-900 font-semibold">{activeModelName}</span>
            </button>
          )}

          {hasActiveAnalysis && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
              title="Reset current screening"
            >
              <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">New Screening</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
