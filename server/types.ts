export interface AnalysisRequestPayload {
  image: string; // Base64 or data URL
  meta?: {
    fileName?: string;
    presetId?: string;
    fileSize?: string;
  };
}

export interface DifferentialDiagnosis {
  condition: string;
  confidence: number;
  code: string;
  description: string;
  nature: 'Benign' | 'Non-Cancerous (Inflammatory)' | 'Non-Cancerous (Benign)' | 'Non-Cancerous (Normal Baseline)' | 'Requires Clinical Evaluation' | 'Inflammatory / Chronic Care';
  isCancerous?: boolean;
}

export interface PredictionSuggestion {
  rank: number; // 1 to 4
  diseaseName: string;
  shortName: string;
  categoryCode: string;
  confidenceScore: number;
  percentage: number;
  nature: 'Benign' | 'Non-Cancerous (Inflammatory)' | 'Non-Cancerous (Benign)' | 'Non-Cancerous (Normal Baseline)' | 'Requires Clinical Evaluation' | 'Inflammatory / Chronic Care' | 'Pre-malignant' | 'Monitoring Recommended' | 'Normal Photo / Non-Skin Image';
  isCancerous?: boolean;
  diseaseType?: 'Non-Cancerous (Inflammatory)' | 'Non-Cancerous (Benign)' | 'Non-Cancerous (Normal Baseline)' | 'Pre-malignant' | 'Neoplastic / Suspected Cancer';
  clinicalStatus: 'Primary Prediction' | 'Secondary Suggestion' | 'Alternative Suggestion' | 'Differential Consideration';
  reasonForSuggestion: string;
  hallmarks: string[];
}

export interface PreprocessingMetrics {
  originalDimensions: { width: number; height: number };
  targetDimensions: { width: number; height: number };
  artifactRemovalApplied: boolean;
  colorNormalizationMethod: string;
  preprocessingTimeMs: number;
}

export interface TreatmentPlan {
  treatment_category: string;
  standard_procedures: string[];
  prescription_classes: string[];
  diagnostic_prerequisites: string[];
  clinical_notes: string;
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
  uncertaintyScore?: number;
  bayesianCredibleInterval?: {
    lowerBound: number;
    upperBound: number;
    marginOfError: number;
  };
  ttaApplied?: boolean;
  ttaBoostPercentage?: number;
}

export interface BackendInferenceResponse {
  // Core user-requested structured response schema
  primary_condition: string;
  confidence_score: number;
  has_pathology: boolean;
  top_four_suggestions: PredictionSuggestion[];
  differential_diagnoses: DifferentialDiagnosis[];
  clinical_explanations: string;
  treatment_plan: TreatmentPlan | null;
  is_normal_or_irrelevant_photo?: boolean;
  validation_message?: string;

  // Multi-algorithm ensemble consensus breakdown
  ensemble_consensus?: EnsembleConsensusData;

  // Detailed clinical and pipeline metadata for frontend compatibility
  category_code: string;
  nature: 'Benign' | 'Non-Cancerous (Inflammatory)' | 'Non-Cancerous (Benign)' | 'Non-Cancerous (Normal Baseline)' | 'Requires Clinical Evaluation' | 'Inflammatory / Chronic Care';
  isCancerous?: boolean;
  diseaseType?: 'Non-Cancerous (Inflammatory)' | 'Non-Cancerous (Benign)' | 'Non-Cancerous (Normal Baseline)' | 'Pre-malignant' | 'Neoplastic / Suspected Cancer';
  detected_features: string[];
  grad_cam_explanation: string;
  yolo_detection?: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    confidence: number;
  };
  recommended_next_step: {
    urgency: 'routine' | 'monitoring' | 'specialist-review';
    title: string;
    guidance: string;
    action_points: string[];
    clinical_treatment_roadmap?: {
      treatmentCategory: string;
      standardProcedures: string[];
      prescriptionClassesConsidered: string[];
      diagnosticPrerequisites: string[];
      prescriptionNote: string;
    };
  };
  evaluation_metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    specificity: number;
  };
  preprocessing_metrics: PreprocessingMetrics;
  model_info: {
    backbone: string;
    featureExtractor: string;
    featureDimensions: number;
    pcaDimensions: number;
    varianceRetained: number;
    classifierType: string;
    supportedClasses: string[];
    datasetSources: string[];
    inferenceLatencyMs: number;
  };
}

export interface DatasetClassRecord {
  id: string;
  name: string;
  datasetOrigin: 'ISIC 2024' | 'HAM10000' | 'DermNet Atlas';
  sampleCount: number;
  features: string[];
  diagnosticHallmarks: string[];
  morphology: string;
  treatmentCategory: string;
  prescriptionClasses: string[];
  procedures: string[];
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
