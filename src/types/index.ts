export interface CategoryProbability {
  category: string;
  code: string;
  probability: number; // 0 to 1
  description: string;
  nature: 'Benign' | 'Pre-malignant' | 'Requires Clinical Evaluation' | 'Indeterminate';
}

export interface SkinAnalysisResult {
  id: string;
  prediction: string;
  categoryCode: string;
  nature: 'Benign' | 'Requires Clinical Evaluation' | 'Monitoring Recommended';
  confidence: number; // 0 to 1, e.g. 0.87
  probabilities: CategoryProbability[];
  model: string;
  modelVersion: string;
  inferenceTimeMs: number;
  explanation: string;
  detectedFeatures: string[];
  gradCamExplanation: string;
  heatmapDataUrl?: string;
  originalImageUrl: string;
  imageDimensions: { width: number; height: number };
  imageQuality: {
    status: 'Good' | 'Fair' | 'Poor';
    message: string;
    lighting: 'Adequate' | 'Suboptimal';
    focus: 'Sharp' | 'Slightly Blur';
  };
  recommendedNextStep: {
    urgency: 'routine' | 'monitoring' | 'specialist-review';
    title: string;
    guidance: string;
    actionPoints: string[];
    clinicalTreatmentRoadmap?: {
      treatmentCategory: string;
      standardProcedures: string[];
      prescriptionClassesConsidered: string[];
      diagnosticPrerequisites: string[];
      prescriptionNote: string;
    };
  };
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isInitial?: boolean;
  relatedCategory?: string;
}

export interface SamplePreset {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  imageUrl: string;
  description: string;
}
