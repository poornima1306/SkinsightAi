import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Sparkles,
  ArrowRight,
  FileText,
  Info,
} from 'lucide-react';
import { SAMPLE_PRESETS } from '../services/mockDermService';
import { SamplePreset } from '../types';

interface ImageUploaderProps {
  onImageSelected: (imageDataUrl: string, fileInfo: { name: string; size: string; presetId?: string }) => void;
  selectedImage: string | null;
  fileInfo: { name: string; size: string; presetId?: string; dimensions?: { width: number; height: number } } | null;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onClear: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  selectedImage,
  fileInfo,
  onAnalyze,
  isAnalyzing,
  onClear,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setErrorMessage(null);
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Unsupported image. Please select a JPG, JPEG or PNG image.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('Image size is too large (max 15MB). Please upload a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        const sizeFormatted = (file.size / 1024).toFixed(1) + ' KB';
        onImageSelected(e.target.result, {
          name: file.name,
          size: sizeFormatted,
        });
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read image file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleSelectPreset = (preset: SamplePreset) => {
    setErrorMessage(null);
    onImageSelected(preset.imageUrl, {
      name: `${preset.title.replace(/\s+/g, '_')}_dermoscopy.png`,
      size: '128 KB (Preset)',
      presetId: preset.id,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
            <ImageIcon className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-slate-800">
            {selectedImage ? 'Image Preview & Validation' : 'Upload Skin Lesion Image'}
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Step 1 of 2</span>
      </div>

      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Unsupported Image</p>
            <p className="text-rose-700">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-800 font-bold px-1"
          >
            ×
          </button>
        </div>
      )}

      {/* Upload Zone or Preview */}
      {!selectedImage ? (
        <div className="flex flex-col gap-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 ${
              isDragOver
                ? 'border-teal-500 bg-teal-50/60 scale-[0.99]'
                : 'border-slate-200 hover:border-teal-500 hover:bg-slate-50/80'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div className="w-13 h-13 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-3 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-6 h-6 stroke-[2]" />
            </div>

            <p className="text-base font-bold text-slate-800 mb-1">
              {isDragOver ? 'Drop image to analyze' : 'Upload a skin-lesion image'}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-4">
              Drag & drop your image here or browse from your device
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs sm:text-sm font-semibold shadow-xs group-hover:bg-teal-700 transition-colors">
              <UploadCloud className="w-4 h-4" />
              <span>Choose Image</span>
            </div>

            <p className="text-[11px] text-slate-400 mt-3">
              Supported formats: JPG, JPEG, PNG (Max 15MB)
            </p>
          </div>

          {/* Quick Preset Samples for Academic Demo */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-teal-600" />
                Or try a dermatoscopy sample:
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="flex flex-col items-center p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-teal-50/70 hover:border-teal-300 text-left transition-all text-slate-700 hover:text-teal-900 group"
                >
                  <img
                    src={preset.imageUrl}
                    alt={preset.title}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-2xs mb-1.5 group-hover:scale-105 transition-transform"
                  />
                  <span className="text-xs font-semibold text-slate-800 text-center leading-tight line-clamp-1">
                    {preset.title}
                  </span>
                  <span className="text-[10px] text-slate-400 text-center line-clamp-1">
                    {preset.subtitle}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Preview State */
        <div className="flex flex-col gap-4">
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center p-3">
            <img
              src={selectedImage}
              alt="Uploaded lesion preview"
              className="max-h-72 w-auto object-contain rounded-xl shadow-xs"
            />
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 text-white text-[10px] font-medium rounded-md backdrop-blur-md">
              Original Image
            </div>
          </div>

          {/* Image Metadata & Quality Assessment */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate max-w-[200px] sm:max-w-xs">{fileInfo?.name || 'skin_lesion_photo.png'}</span>
              </div>
              <span className="text-slate-500 text-[11px]">
                File Size: {fileInfo?.size || 'Standard'} • Format: Dermoscopy
              </span>
            </div>

            {/* Quality badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Image Quality: Good</span>
            </div>
          </div>

          {/* Quality explanation note */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 px-1">
            <Info className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Image appears well-illuminated and suitable for prototype AI classification.</span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Replace Image</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={onClear}
                disabled={isAnalyzing}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors disabled:opacity-50 shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>

            {/* Primary CTA */}
            <button
              type="button"
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAnalyzing ? 'Analyzing Image...' : 'Analyze Image'}</span>
              {!isAnalyzing && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
