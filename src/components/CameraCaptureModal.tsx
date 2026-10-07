import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  X,
  RotateCcw,
  Check,
  SwitchCamera,
  AlertCircle,
  Sparkles,
  Sun,
  ShieldCheck,
  UploadCloud,
  CameraOff,
} from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptureConfirm: (imageDataUrl: string, immediateAnalyze?: boolean) => void;
  onSelectFileInstead?: () => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCaptureConfirm,
  onSelectFileInstead,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isCancelledRef = useRef(false);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<{
    type: 'permission' | 'notFound' | 'unsupported' | 'general';
    message: string;
  } | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [shutterAnimation, setShutterAnimation] = useState(false);

  // Stop active video stream
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Ignore track stop errors
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Start video stream with selected facing mode
  const startCamera = useCallback(async (facing: 'environment' | 'user') => {
    isCancelledRef.current = false;
    setIsLoadingCamera(true);
    setCameraError(null);
    stopStream();

    if (!navigator?.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError({
        type: 'unsupported',
        message: 'Your browser or device does not support real-time camera streaming. You can still use your device camera or upload a file directly.',
      });
      setIsLoadingCamera(false);
      return;
    }

    try {
      // First attempt with ideal resolution & facing mode
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1920, min: 640 },
            height: { ideal: 1080, min: 480 },
          },
          audio: false,
        });
      } catch (firstErr: any) {
        if (isCancelledRef.current) return;

        const name = firstErr?.name || '';
        const msg = (firstErr?.message || '').toLowerCase();
        const isPermissionIssue =
          name === 'NotAllowedError' ||
          name === 'PermissionDeniedError' ||
          name === 'SecurityError' ||
          name === 'AbortError' ||
          msg.includes('permission') ||
          msg.includes('dismiss') ||
          msg.includes('denied');

        // Do not re-request immediately if the user dismissed or denied permissions
        if (isPermissionIssue) {
          throw firstErr;
        }

        // Fallback to basic video request if ideal constraints failed
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      if (isCancelledRef.current) {
        stream.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch {
            // Ignore
          }
        });
        return;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      // Check available cameras to show switch button if multiple exist
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setAvailableDevices(videoInputs);
      } catch {
        // Device enumeration is optional
      }
    } catch (err: any) {
      if (isCancelledRef.current) return;

      // Log informative warning rather than an unhandled application error
      console.warn('Camera access was not granted or unavailable:', err?.message || err);

      const name = err?.name || '';
      const msg = (err?.message || '').toLowerCase();
      const isPermission =
        name === 'NotAllowedError' ||
        name === 'PermissionDeniedError' ||
        name === 'SecurityError' ||
        name === 'AbortError' ||
        msg.includes('permission') ||
        msg.includes('dismiss') ||
        msg.includes('denied');

      const isNotFound =
        name === 'NotFoundError' ||
        name === 'DevicesNotFoundError' ||
        msg.includes('not found') ||
        msg.includes('no camera');

      if (isPermission) {
        setCameraError({
          type: 'permission',
          message:
            'Camera permission was dismissed or blocked in your browser. You can allow camera access via the browser address bar icon and click Retry, or take a photo using your device camera below.',
        });
      } else if (isNotFound) {
        setCameraError({
          type: 'notFound',
          message: 'No video camera device was detected on your system. You can upload an existing lesion image or select an academic preset.',
        });
      } else {
        setCameraError({
          type: 'general',
          message: `Unable to access camera (${err?.message || 'Check device permissions'}). You can still take a picture using the device camera or choose an image file.`,
        });
      }
    } finally {
      if (!isCancelledRef.current) {
        setIsLoadingCamera(false);
      }
    }
  }, [stopStream]);

  // Handle modal open/close lifecycle
  useEffect(() => {
    if (isOpen) {
      isCancelledRef.current = false;
      setCapturedImage(null);
      setCameraError(null);
      startCamera(facingMode);
    } else {
      isCancelledRef.current = true;
      stopStream();
      setCapturedImage(null);
    }

    return () => {
      isCancelledRef.current = true;
      stopStream();
    };
  }, [isOpen, facingMode, startCamera, stopStream]);

  // Flip camera between environment (back) and user (front)
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  // Capture current video frame to canvas
  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    // Trigger flash animation
    setShutterAnimation(true);
    setTimeout(() => setShutterAnimation(false), 200);

    const canvas = canvasRef.current || document.createElement('canvas');
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If front camera, mirror the frame horizontally for natural selfie view
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);

    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setCapturedImage(dataUrl);
      // Pause or stop live video to save battery and freeze preview
      stopStream();
    } catch (err) {
      console.warn('Failed to encode captured image:', err);
    }
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  // Confirm image selection and close
  const handleConfirm = (immediateAnalyze: boolean = false) => {
    if (!capturedImage) return;
    stopStream();
    onCaptureConfirm(capturedImage, immediateAnalyze);
    onClose();
  };

  // Native input fallback capture for mobile devices or if WebRTC stream fails
  const handleNativeCameraFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        const dataUrl = event.target.result;
        setCapturedImage(dataUrl);
        setCameraError(null);
        stopStream();
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div
      id="camera-capture-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Real-time Camera Capture"
    >
      {/* Hidden canvas used for pixel capture */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/90 border-b border-slate-700 text-white z-10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                Real-Time Skin Lesion Camera
                <span className="hidden sm:inline-block text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Live Screening
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {availableDevices.length > 1 && !capturedImage && !cameraError && (
              <button
                type="button"
                id="camera-switch-btn"
                onClick={handleToggleFacingMode}
                disabled={isLoadingCamera}
                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1.5 px-2.5"
                title="Switch Camera (Front / Back)"
              >
                <SwitchCamera className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Flip</span>
              </button>
            )}

            <button
              type="button"
              id="camera-modal-close-btn"
              onClick={() => {
                isCancelledRef.current = true;
                stopStream();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/80 transition-colors"
              title="Close Camera"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Area */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[320px] sm:min-h-[420px] overflow-hidden select-none">
          {/* Shutter flash animation effect */}
          {shutterAnimation && (
            <div className="absolute inset-0 bg-white z-30 pointer-events-none animate-out fade-out duration-200" />
          )}

          {/* Error State with graceful fallback */}
          {cameraError ? (
            <div className="p-6 text-center max-w-md mx-auto flex flex-col items-center gap-3 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {cameraError.type === 'permission' ? (
                  <CameraOff className="w-7 h-7" />
                ) : (
                  <AlertCircle className="w-7 h-7" />
                )}
              </div>
              <h4 className="text-base font-bold text-white">
                {cameraError.type === 'permission'
                  ? 'Camera Permission Dismissed or Blocked'
                  : cameraError.type === 'notFound'
                  ? 'No Camera Detected'
                  : 'Camera Access Unavailable'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm">
                {cameraError.message}
              </p>

              {cameraError.type === 'permission' && (
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-[11px] text-slate-300 text-left w-full space-y-1">
                  <p className="font-semibold text-teal-300 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5" /> How to enable:
                  </p>
                  <p>1. Look at your browser address bar (top of screen).</p>
                  <p>2. Click the camera or lock icon and select &ldquo;Allow&rdquo; for this site.</p>
                  <p>3. Click &ldquo;Retry Camera&rdquo; below, or use the Native Device Camera option.</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2.5 mt-2 w-full justify-center">
                <button
                  type="button"
                  id="camera-retry-btn"
                  onClick={() => startCamera(facingMode)}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Camera</span>
                </button>

                {/* Native camera trigger fallback (invokes device camera directly) */}
                <label
                  id="native-camera-fallback-btn"
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-teal-300" />
                  <span>Use Device Camera</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleNativeCameraFallback}
                    className="hidden"
                  />
                </label>

                {onSelectFileInstead && (
                  <button
                    type="button"
                    id="camera-browse-file-btn"
                    onClick={() => {
                      isCancelledRef.current = true;
                      stopStream();
                      onClose();
                      onSelectFileInstead();
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload File Instead</span>
                  </button>
                )}
              </div>
            </div>
          ) : capturedImage ? (
            /* Snapshot Review State */
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={capturedImage}
                alt="Captured lesion snapshot"
                className="max-h-[60vh] max-w-full object-contain"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-teal-500/90 text-white text-xs font-semibold rounded-md backdrop-blur-md shadow-md flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Photo Captured</span>
              </div>
            </div>
          ) : (
            /* Live Video Stream View */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover max-h-[62vh] ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />

              {/* Optical Reticle & Lesion Target Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                {/* Circular / Rounded Square Target Reticle */}
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-2xl border-2 border-dashed border-teal-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] flex items-center justify-center">
                  {/* Corner focus brackets */}
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-teal-300" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-teal-300" />
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-teal-300" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-teal-300" />

                  {/* Center focus indicator */}
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-400/80 animate-ping" />
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-300" />
                </div>

                {/* Live Guidance Tip Bar */}
                <div className="mt-4 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 text-white text-[11px] font-medium backdrop-blur-md flex items-center gap-2 shadow-lg">
                  <Sun className="w-3 h-3 text-amber-400" />
                  <span>Center the skin lesion in frame with bright, steady light</span>
                </div>
              </div>

              {/* Loading overlay when camera is warming up */}
              {isLoadingCamera && (
                <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center gap-2 text-white">
                  <div className="w-7 h-7 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-semibold text-slate-300">Initializing camera feed...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="px-4 py-3 bg-slate-800/95 border-t border-slate-700 text-white flex items-center justify-between gap-3">
          {capturedImage ? (
            /* Snapshot Action Bar */
            <div className="w-full flex items-center justify-between gap-3">
              <button
                type="button"
                id="camera-retake-btn"
                onClick={handleRetake}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Photo</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="camera-confirm-btn"
                  onClick={() => handleConfirm(false)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-600 hover:bg-slate-500 text-white text-xs font-bold transition-colors"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Use Photo</span>
                </button>

                <button
                  type="button"
                  id="camera-analyze-now-btn"
                  onClick={() => handleConfirm(true)}
                  className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-[1.02]"
                >
                  <Sparkles className="w-4 h-4 text-teal-200" />
                  <span>Upload & Recognize</span>
                </button>
              </div>
            </div>
          ) : cameraError ? (
            /* Footer when camera error exists */
            <div className="w-full flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Private & local processing</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  isCancelledRef.current = true;
                  stopStream();
                  onClose();
                }}
                className="text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-700/60 font-semibold"
              >
                Close
              </button>
            </div>
          ) : (
            /* Live Camera Shutter Controls */
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="hidden sm:inline">Encrypted on-device processing</span>
              </div>

              {/* Central Capture Button */}
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  id="camera-capture-trigger-btn"
                  onClick={handleCapture}
                  disabled={isLoadingCamera}
                  className="relative group p-1.5 rounded-full border-4 border-white/80 hover:border-teal-400 disabled:opacity-40 disabled:hover:border-white/80 transition-all focus:outline-hidden"
                  title="Capture Snapshot"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white group-hover:bg-teal-400 transition-colors flex items-center justify-center shadow-lg">
                    <Camera className="w-6 h-6 text-slate-900 group-hover:text-slate-900" />
                  </div>
                </button>
              </div>

              {/* Native camera file trigger for mobile quick pick */}
              <label
                className="text-slate-400 hover:text-white text-xs cursor-pointer flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-700/60 transition-colors"
                title="Open Device Camera Directly"
              >
                <span className="hidden sm:inline">Device Camera</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleNativeCameraFallback}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

