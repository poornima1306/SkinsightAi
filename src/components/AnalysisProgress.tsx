import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Sparkles, BrainCircuit, Activity } from 'lucide-react';

interface AnalysisProgressProps {
  onComplete: () => void;
}

interface StepItem {
  id: number;
  label: string;
  detail: string;
}

const STEPS: StepItem[] = [
  { id: 1, label: 'Image received & validated', detail: 'RGB 224×224 tensor normalization' },
  { id: 2, label: 'Preprocessing & artifact filtering', detail: 'Removing hair artifacts & calibrating illumination' },
  { id: 3, label: 'Extracting visual features', detail: 'EfficientNetB0 convolutional backbone feature maps' },
  { id: 4, label: 'Running multi-class classification', detail: 'Computing Softmax output distributions' },
  { id: 5, label: 'Generating Grad-CAM attention heatmap', detail: 'Backpropagating gradients to final conv layer' },
  { id: 6, label: 'Preparing guidance & safety context', detail: 'Structuring explainable clinical recommendations' },
];

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    const stepDelays = [400, 450, 500, 450, 450, 400]; // milliseconds per step

    const advanceStep = (stepNumber: number) => {
      if (stepNumber > STEPS.length) {
        const finishTimeout = setTimeout(() => {
          onComplete();
        }, 300);
        timeouts.push(finishTimeout);
        return;
      }

      setCurrentStep(stepNumber);
      const delay = stepDelays[stepNumber - 1] || 450;
      const nextTimeout = setTimeout(() => {
        advanceStep(stepNumber + 1);
      }, delay);
      timeouts.push(nextTimeout);
    };

    // Begin progress sequence from step 1 to 2
    const firstTimeout = setTimeout(() => {
      advanceStep(2);
    }, stepDelays[0]);
    timeouts.push(firstTimeout);

    return () => {
      timeouts.forEach((t) => clearTimeout(t));
    };
  }, [onComplete]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
            <BrainCircuit className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              Analyzing your image...
            </h3>
            <p className="text-xs text-slate-400">
              Please wait while the prototype processes the image and computes attention maps.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold self-start sm:self-auto">
          <Activity className="w-3.5 h-3.5 animate-spin text-teal-600" />
          <span>Step {currentStep} of {STEPS.length}</span>
        </div>
      </div>

      {/* Step Checklist */}
      <div className="space-y-3">
        {STEPS.map((step) => {
          const isDone = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isUpcoming = currentStep < step.id;

          return (
            <div
              key={step.id}
              className={`flex items-start gap-3.5 p-3 rounded-xl transition-all duration-200 ${
                isCurrent
                  ? 'bg-teal-50/70 border border-teal-200'
                  : isDone
                  ? 'bg-slate-50/60 border border-slate-100'
                  : 'bg-transparent border border-transparent opacity-40'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-teal-600 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] text-slate-400 font-semibold">
                    {step.id}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-xs sm:text-sm font-semibold ${
                    isCurrent
                      ? 'text-teal-950 font-bold'
                      : isDone
                      ? 'text-slate-800'
                      : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{step.detail}</p>
              </div>

              {isCurrent && (
                <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider animate-pulse">
                  Processing
                </span>
              )}
              {isDone && (
                <span className="text-[11px] font-semibold text-emerald-700">
                  Complete
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div
          className="bg-teal-600 h-full transition-all duration-300 ease-out"
          style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
};
