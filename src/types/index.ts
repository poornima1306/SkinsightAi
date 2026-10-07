export interface CategoryProbability {
  category: string;
  code: string;
  probability: number; // 0 to 1
  description: string;
  nature: 'Benign' | 'Non-Cancerous (Inflammatory)' | 'Non-Cancerous (Benign)' | 'Non-Cancerous (Normal Baseline)' | 'Pre-malignant' | 'Requires Clinical Evaluation' | 'Indeterminate';
  isCancerous?: boolean;
}

export interface ModelBenchmarkMetric {
  name: string;
  architecture: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  specificity: number;
  latencyMs: number;
  keyStrength: string;
}

export interface YoloDetectionBox {
  x: number; // % from left
  y: number; // % from top
  width: number; // % width
  height: number; // % height
  label: string;
  confidence: number;
}

export interface PcaFeatureMetadata {
  rawFeatureDimensions: number;
  selectedComponents: number;
  explainedVarianceRatio: number; // e.g. 0.954 (95.4%)
  topComponentsContribution: string[];
}

export interface PredictionSuggestion {
  rank: number; // 1 to 4
  diseaseName: string;
  shortName: string;
  categoryCode: string;
  confidenceScore: number;
  percentage: number;
  nature: 'Benign' | 'Non-Cancerous (Inflammatory)' | 'Non-Cancerous (Benign)' | 'Non-Cancerous (Normal Baseline)' | 'Requires Clinical Evaluation' | 'Monitoring Recommended' | 'Pre-malignant' | 'Inflammatory / Chronic Care' | 'Normal Photo / Non-Skin Image';
  isCancerous?: boolean;
  diseaseType?: 'Non-Cancerous (Inflammatory)' | 'Non-Cancerous (Benign)' | 'Non-Cancerous (Normal Baseline)' | 'Pre-malignant' | 'Neoplastic / Suspected Cancer';
  clinicalStatus: 'Primary Prediction' | 'Secondary Suggestion' | 'Alternative Suggestion' | 'Differential Consideration';
  reasonForSuggestion: string;
  hallmarks: string[];
}

export interface AlgorithmVote {
  algorithmId: string;
  algorithmName: string;
  architectureType:
    | 'Deep Neural Network'
    | 'Convolutional Neural Net'
    | 'Vision Transformer'
    | 'Depthwise ConvNet'
    | 'Dense Feature-Reuse'
    | 'Bayesian Neural Net'
    | 'Gradient Boosted Trees'
    | 'Bagged Ensemble'
    | 'Kernel Method'
    | 'Instance-Based Metric'
    | 'Meta-Learner';
  predictedCondition: string;
  confidenceScore: number; // 0 to 1
  percentage: number;
  voteWeight: number; // e.g. 0.26
  latencyMs: number;
  keyFeatureFocus: string;
}

export interface EnsembleConsensusData {
  metaLearnerConfidence: number;
  agreementRate: number; // 0 to 1
  agreeingModelsCount: number;
  totalModelsCount: number;
  algorithmVotes: AlgorithmVote[];
  activeBackbone: string;
  calibrationMethod: string;
  totalEnsembleAccuracy: number;
  uncertaintyScore?: number; // e.g. 0.028 (epistemic uncertainty)
  bayesianCredibleInterval?: {
    lowerBound: number; // e.g. 0.942
    upperBound: number; // e.g. 0.986
    marginOfError: number; // e.g. 0.022
  };
  ttaApplied?: boolean;
  ttaBoostPercentage?: number; // e.g. +1.8%
}

export interface TrainingEpochHistory {
  epoch: number;
  trainLoss: number;
  valLoss: number;
  trainAcc: number;
  valAcc: number;
  learningRate: number;
}

export interface TrainingMetricsReport {
  timestamp: string;
  algorithmId: string;
  algorithmName: string;
  architectureDetails: {
    backbone: string;
    layers: number;
    parameters: string;
    optimizer: string;
    lossFunction: string;
  };
  datasetTotalSamples: number;
  trainSamples: number;
  valSamples: number;
  testSamples: number;
  targetClasses: string[];
  epochs: number;
  batchSize: number;
  learningRate: number;
  overallAccuracy: number;
  macroPrecision: number;
  macroRecall: number;
  macroF1: number;
  rocAucScore: number;
  perClassMetrics: {
    [className: string]: {
      precision: number;
      recall: number;
      f1Score: number;
      support: number;
    };
  };
  epochHistory: TrainingEpochHistory[];
  confusionMatrix: {
    labels: string[];
    matrix: number[][];
  };
  pcaVarianceRetained: number;
  status: 'trained' | 'calibrated';
}

export interface SkinAnalysisResult {
  id: string;
  prediction: string;
  categoryCode: string;
  nature: 'Benign' | 'Non-Cancerous (Inflammatory)' | 'Non-Cancerous (Benign)' | 'Non-Cancerous (Normal Baseline)' | 'Requires Clinical Evaluation' | 'Monitoring Recommended' | 'Normal Photo / Non-Skin Image';
  isCancerous?: boolean;
  diseaseType?: 'Non-Cancerous (Inflammatory)' | 'Non-Cancerous (Benign)' | 'Non-Cancerous (Normal Baseline)' | 'Pre-malignant' | 'Neoplastic / Suspected Cancer';
  isNormalOrIrrelevantPhoto?: boolean;
  validationMessage?: string;
  confidence: number; // 0 to 1, e.g. 0.87
  topFourSuggestions: PredictionSuggestion[];
  probabilities: CategoryProbability[];
  ensembleConsensus?: EnsembleConsensusData;
  model: string;
  modelVersion: string;
  inferenceTimeMs: number;
  explanation: string;
  detectedFeatures: string[];
  gradCamExplanation: string;
  heatmapDataUrl?: string;
  originalImageUrl: string;
  imageDimensions: { width: number; height: number };
  yoloDetection?: YoloDetectionBox;
  pcaMetadata?: PcaFeatureMetadata;
  evaluationMetrics?: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    specificity: number;
  };
  benchmarkComparisons?: ModelBenchmarkMetric[];
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
  imageUrl?: string;
  analysisResult?: Partial<SkinAnalysisResult>;
}

export interface SamplePreset {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  imageUrl: string;
  description: string;
}
