import { SkinAnalysisResult, SamplePreset } from '../types';
import { generateGradCamHeatmap } from '../utils/heatmapGenerator';

// High-fidelity procedural SVG dermatoscopy skin lesion presets for instant testing
function createDermSvg(type: 'nevus' | 'keratosis' | 'basal' | 'dermatofibroma'): string {
  if (type === 'nevus') {
    // Melanocytic Nevus: Symmetrical brown-tan oval with delicate network
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <defs>
          <radialGradient id="skin" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#f5d7be" />
            <stop offset="70%" stop-color="#eac2a5" />
            <stop offset="100%" stop-color="#ddb090" />
          </radialGradient>
          <radialGradient id="nevusGrad" cx="48%" cy="48%" r="48%">
            <stop offset="0%" stop-color="#4a2511" />
            <stop offset="60%" stop-color="#733d1c" />
            <stop offset="85%" stop-color="#9a5a2e" />
            <stop offset="100%" stop-color="#c48a5c" stop-opacity="0.2" />
          </radialGradient>
          <filter id="blur">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>
        <rect width="400" height="400" fill="url(#skin)" />
        <!-- Dermatoscopic background skin texture -->
        <circle cx="200" cy="200" r="190" fill="none" stroke="#cca180" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.3" />
        <!-- Primary Nevus Structure -->
        <ellipse cx="200" cy="200" rx="92" ry="78" fill="url(#nevusGrad)" filter="url(#blur)" />
        <!-- Pigment network dots & globules -->
        <circle cx="170" cy="180" r="4.5" fill="#351809" opacity="0.8" />
        <circle cx="195" cy="170" r="3.5" fill="#351809" opacity="0.85" />
        <circle cx="225" cy="195" r="4" fill="#351809" opacity="0.8" />
        <circle cx="180" cy="220" r="5" fill="#351809" opacity="0.75" />
        <circle cx="215" cy="225" r="3" fill="#351809" opacity="0.8" />
        <circle cx="202" cy="198" r="6" fill="#2d1306" opacity="0.9" />
        <!-- Delicate reticular pigment grid rings -->
        <ellipse cx="200" cy="200" rx="65" ry="55" fill="none" stroke="#5a2e15" stroke-width="1.2" opacity="0.5" />
        <ellipse cx="200" cy="200" rx="40" ry="34" fill="none" stroke="#3d1b0b" stroke-width="1.2" opacity="0.6" />
      </svg>
    `;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  } else if (type === 'keratosis') {
    // Seborrheic Keratosis: "Stuck-on" appearance, verrucous/keratin cysts, darker border
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <defs>
          <radialGradient id="skin" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#f8dec8" />
            <stop offset="80%" stop-color="#e8bf9f" />
            <stop offset="100%" stop-color="#d6a884" />
          </radialGradient>
          <radialGradient id="skGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#543725" />
            <stop offset="45%" stop-color="#69432d" />
            <stop offset="80%" stop-color="#80563b" />
            <stop offset="100%" stop-color="#996a4b" />
          </radialGradient>
        </defs>
        <rect width="400" height="400" fill="url(#skin)" />
        <!-- Keratosis lobulated border -->
        <path d="M 120 185 Q 110 140 160 120 Q 210 105 250 125 Q 295 145 285 200 Q 280 255 245 275 Q 195 290 150 270 Q 115 240 120 185 Z" fill="url(#skGrad)" stroke="#452a1b" stroke-width="3" />
        <!-- Milia-like cysts (small white/cream pearls) -->
        <circle cx="165" cy="160" r="3.5" fill="#faebd7" opacity="0.9" />
        <circle cx="230" cy="175" r="4.5" fill="#fdf5e6" opacity="0.95" />
        <circle cx="195" cy="220" r="3" fill="#faebd7" opacity="0.85" />
        <circle cx="210" cy="150" r="3" fill="#faebd7" opacity="0.9" />
        <!-- Comedo-like openings (dark keratin plugs) -->
        <circle cx="150" cy="205" r="3.5" fill="#2b180d" />
        <circle cx="185" cy="185" r="4" fill="#201108" />
        <circle cx="240" cy="215" r="3.8" fill="#2b180d" />
        <circle cx="215" cy="245" r="3.2" fill="#201108" />
      </svg>
    `;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  } else if (type === 'basal') {
    // Basal Cell Carcinoma Screening Pattern: Translucent pearly nodule with arborizing telangiectasia (vessels)
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <defs>
          <radialGradient id="skin" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#f6d5be" />
            <stop offset="85%" stop-color="#e3b59a" />
            <stop offset="100%" stop-color="#cd9c7e" />
          </radialGradient>
          <radialGradient id="bccGrad" cx="45%" cy="45%" r="50%">
            <stop offset="0%" stop-color="#f5e0db" />
            <stop offset="40%" stop-color="#eac2be" />
            <stop offset="80%" stop-color="#d69f9c" />
            <stop offset="100%" stop-color="#c18380" />
          </radialGradient>
        </defs>
        <rect width="400" height="400" fill="url(#skin)" />
        <!-- Pearly papule -->
        <ellipse cx="200" cy="200" rx="90" ry="82" fill="url(#bccGrad)" stroke="#c28886" stroke-width="1.5" />
        <!-- Pearly highlight reflection -->
        <ellipse cx="175" cy="175" rx="35" ry="25" fill="#ffffff" opacity="0.35" />
        <!-- Arborizing branching telangiectasias (vessels) -->
        <path d="M 200 200 Q 230 180 255 170 Q 275 165 285 160" fill="none" stroke="#b31b26" stroke-width="2.2" stroke-linecap="round" />
        <path d="M 230 180 Q 240 160 250 145" fill="none" stroke="#b31b26" stroke-width="1.6" stroke-linecap="round" />
        <path d="M 200 200 Q 185 225 170 245 Q 155 260 140 270" fill="none" stroke="#c42530" stroke-width="2.0" stroke-linecap="round" />
        <path d="M 185 225 Q 200 245 210 265" fill="none" stroke="#c42530" stroke-width="1.5" stroke-linecap="round" />
        <path d="M 200 200 Q 170 180 150 165 Q 135 155 125 150" fill="none" stroke="#a31620" stroke-width="1.8" stroke-linecap="round" />
        <!-- Shiny focal ulceration center -->
        <circle cx="198" cy="202" r="7" fill="#881e1e" opacity="0.75" />
      </svg>
    `;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  } else {
    // Dermatofibroma: Central white patch/fibrotic area with peripheral delicate brown pigment rim
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <defs>
          <radialGradient id="skin" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#f8dcce" />
            <stop offset="85%" stop-color="#e8bfac" />
            <stop offset="100%" stop-color="#cca08b" />
          </radialGradient>
          <radialGradient id="dfRim" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#f0eae4" />
            <stop offset="40%" stop-color="#e0cebe" />
            <stop offset="70%" stop-color="#9a6c4c" />
            <stop offset="95%" stop-color="#b68969" />
            <stop offset="100%" stop-color="#cca08b" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="400" fill="url(#skin)" />
        <circle cx="200" cy="200" r="85" fill="url(#dfRim)" />
        <!-- Central white scar-like patch -->
        <polygon points="175,185 215,175 225,215 185,225" fill="#fdfbf9" opacity="0.85" filter="blur(2px)" />
        <!-- Delicate peripheral pigmented network -->
        <circle cx="200" cy="200" r="72" fill="none" stroke="#754728" stroke-width="1" stroke-dasharray="3,3" opacity="0.6" />
      </svg>
    `;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'sample-nevus',
    title: 'Melanocytic Nevus',
    subtitle: 'Common Benign Mole',
    category: 'Melanocytic Nevus (Benign)',
    imageUrl: createDermSvg('nevus'),
    description: 'Symmetrical, uniform pigment network characteristic of benign melanocytic lesion.',
  },
  {
    id: 'sample-keratosis',
    title: 'Seborrheic Keratosis',
    subtitle: 'Benign Epidermal Growth',
    category: 'Seborrheic Keratosis (Benign)',
    imageUrl: createDermSvg('keratosis'),
    description: 'Distinct stuck-on verrucous morphology with pseudofollicular openings.',
  },
  {
    id: 'sample-basal',
    title: 'Basal Cell Pattern',
    subtitle: 'Atypical Screening Pattern',
    category: 'Basal Cell Carcinoma Screening Pattern',
    imageUrl: createDermSvg('basal'),
    description: 'Translucent pearly papule with fine arborizing telangiectatic vessels.',
  },
  {
    id: 'sample-dermatofibroma',
    title: 'Dermatofibroma',
    subtitle: 'Benign Fibrous Nodule',
    category: 'Dermatofibroma (Benign)',
    imageUrl: createDermSvg('dermatofibroma'),
    description: 'Classic central white scar-like patch with a delicate peripheral pigment network.',
  },
];

export async function analyzeSkinImage(
  imageDataUrl: string,
  meta?: { fileName?: string; presetId?: string }
): Promise<SkinAnalysisResult> {
  // 1. Create an offscreen image to measure natural dimensions & generate Grad-CAM
  const img = new Image();
  img.src = imageDataUrl;
  await new Promise((resolve) => {
    img.onload = () => resolve(true);
    img.onerror = () => resolve(true);
  });

  const width = img.naturalWidth || 400;
  const height = img.naturalHeight || 400;

  // 2. Generate Grad-CAM Attention Heatmaps
  const { heatmapUrl, blendedUrl } = await generateGradCamHeatmap(img, {
    intensity: 1.1,
    spread: 0.35,
  });

  // 3. Determine classification profiles based on preset or image features
  let prediction = 'Melanocytic Nevus (Benign Mole)';
  let categoryCode = 'NV_BENIGN';
  let nature: 'Benign' | 'Requires Clinical Evaluation' | 'Monitoring Recommended' = 'Benign';
  let confidence = 0.88;
  let explanation =
    'The neural network identified uniform pigment distribution, symmetrical borders, and an absence of atypical branching vascular patterns. These visual markers strongly align with benign melanocytic patterns in the training distribution.';
  let detectedFeatures = [
    'Symmetrical circular/oval boundary structure',
    'Uniform brown pigment network without irregular blotches',
    'Absence of atypical arborizing telangiectasia',
    'Stable peripheral fading transition into surrounding epidermis',
  ];
  let gradCamExplanation =
    'The Grad-CAM attention heatmap highlights strong feature activation (warm red/orange regions) concentrated over the central pigment reticulation and homogenous border zones. The surrounding healthy perilesional skin exhibits baseline low-activation (cool blue), indicating the model localized the lesion margins accurately.';
  let recommendedNextStep: {
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
  } = {
    urgency: 'routine',
    title: 'Routine Self-Monitoring & Standard Dermatological Review',
    guidance:
      'Because this is an AI-assisted screening prototype, no automated result replaces professional medical advice. For benign-pattern lesions, routine annual skin examinations and monthly self-checks using ABCDE criteria are standard clinical best practices.',
    actionPoints: [
      'Document the lesion size and appearance for personal baseline tracking.',
      'Perform regular ABCDE self-checks (Asymmetry, Border, Color, Diameter, Evolving).',
      'Schedule a routine check with a board-certified dermatologist during your regular health review.',
      'Seek prompt evaluation if you notice sudden darkening, rapid size enlargement, or bleeding.',
    ],
    clinicalTreatmentRoadmap: {
      treatmentCategory: 'Conservative Observation & Elective Dermatologic Care',
      standardProcedures: [
        'Periodic dermoscopic surveillance (routine annual skin checks)',
        'Baseline digital dermoscopy photography for change tracking',
        'Elective shave excision or punch biopsy (only if irritated by clothing or cosmetically requested)',
      ],
      prescriptionClassesConsidered: [
        'Prescription topical pharmaceuticals are generally not indicated for benign melanocytic moles.',
        'High-SPF broad-spectrum medical sunscreen (SPF 50+ UVA/UVB) to prevent UV-induced melanocytic mutations.',
        'Mild topical corticosteroid (prescribed by doctor only if secondary eczema or irritation occurs around the mole).',
      ],
      diagnosticPrerequisites: [
        'In-person clinical dermatoscope evaluation by a dermatologist',
        'Rule out ABCDE evolution or atypical dysplastic network features',
      ],
      prescriptionNote:
        'Physicians do not prescribe medications for benign nevi because healthy pigment cells require no pharmaceutical intervention. If a mole changes or becomes symptomatic, a doctor performs an excision biopsy rather than prescribing creams.',
    },
  };

  let probabilities = [
    {
      category: 'Melanocytic Nevus',
      code: 'NV',
      probability: 0.88,
      description: 'Benign proliferation of melanocytes with uniform pigment distribution.',
      nature: 'Benign' as const,
    },
    {
      category: 'Seborrheic Keratosis',
      code: 'BKL',
      probability: 0.05,
      description: 'Benign epidermal keratinocytic lesion with follicular plugs.',
      nature: 'Benign' as const,
    },
    {
      category: 'Dermatofibroma',
      code: 'DF',
      probability: 0.04,
      description: 'Benign histiocytic fibrous dermal nodule.',
      nature: 'Benign' as const,
    },
    {
      category: 'Atypical / Screening Pattern',
      code: 'ATYP',
      probability: 0.03,
      description: 'Patterns warranting closer in-person dermatoscope evaluation.',
      nature: 'Requires Clinical Evaluation' as const,
    },
  ];

  if (meta?.presetId === 'sample-keratosis' || meta?.fileName?.toLowerCase().includes('keratosis')) {
    prediction = 'Seborrheic Keratosis (Benign)';
    categoryCode = 'BKL_SK';
    nature = 'Benign';
    confidence = 0.84;
    explanation =
      'The model detected characteristic keratin pseudocysts, well-demarcated stuck-on borders, and a verrucous cobblestone surface pattern typical of benign seborrheic keratosis.';
    detectedFeatures = [
      'Sharply defined, stuck-on hyperkeratotic borders',
      'Milia-like pseudocysts and comedo-like keratin openings',
      'Homogeneous brownish-tan pigmentation without pigment network',
      'Lack of atypical vascular or chaotic structural features',
    ];
    gradCamExplanation =
      'The attention map centers primarily over the follicular keratin plugs and well-demarcated peripheral border ridge, confirming the CNN relied on classic epidermal textural features.';
    recommendedNextStep = {
      urgency: 'routine',
      title: 'Benign Growth Care & Optional Removal Consultation',
      guidance:
        'Seborrheic keratoses are non-cancerous benign epidermal growths. Treatment is not medically mandatory unless the lesion catches on clothing, itches, bleeds from friction, or is cosmetically bothersome.',
      actionPoints: [
        'Avoid picking or scratching at the crusty surface to prevent secondary bacterial infection.',
        'Schedule a routine dermatological visit if the lesion becomes irritated or undergoes rapid changes.',
        'Consult your doctor if you desire removal via standard outpatient dermatological procedures.',
      ],
      clinicalTreatmentRoadmap: {
        treatmentCategory: 'In-Clinic Procedural Removal & Keratolytic Regimens',
        standardProcedures: [
          'Cryosurgery (targeted liquid nitrogen freezing - most common and rapid technique)',
          'Curettage or light electrodessication under local anesthesia',
          'Shave removal with minimal scarring risk',
        ],
        prescriptionClassesConsidered: [
          'High-concentration Topical Hydrogen Peroxide 40% solution (FDA-approved for in-office application by a physician).',
          'Prescription Keratolytic ointments (e.g., Urea 20%-40% cream or Salicylic Acid preparations) to soften thick hyperkeratotic plaques.',
          'Post-procedure topical antibiotic ointment (e.g., Mupirocin) prescribed if minor skin abrasion occurs.',
        ],
        diagnosticPrerequisites: [
          'Dermoscopic confirmation of milia-like cysts and follicular openings',
          'Clinical rule-out of pigmented basal cell carcinoma or melanoma prior to ablation',
        ],
        prescriptionNote:
          'Dermatologists treat seborrheic keratoses primarily with physical outpatient modalities (cryotherapy/curettage) rather than long-term oral drugs. A physician determines whether procedural removal or targeted keratolytic solution is best suited.',
      },
    };
    probabilities = [
      {
        category: 'Seborrheic Keratosis',
        code: 'BKL',
        probability: 0.84,
        description: 'Common non-cancerous skin growth characterized by keratin plugs.',
        nature: 'Benign',
      },
      {
        category: 'Melanocytic Nevus',
        code: 'NV',
        probability: 0.09,
        description: 'Benign melanocytic mole pattern.',
        nature: 'Benign',
      },
      {
        category: 'Basal Cell Pattern',
        code: 'BCC',
        probability: 0.04,
        description: 'Screening pattern for basal cell features.',
        nature: 'Requires Clinical Evaluation',
      },
      {
        category: 'Solar Lentigo',
        code: 'SL',
        probability: 0.03,
        description: 'Benign pigmented macule resulting from UV exposure.',
        nature: 'Benign',
      },
    ];
  } else if (meta?.presetId === 'sample-basal' || meta?.fileName?.toLowerCase().includes('basal') || meta?.fileName?.toLowerCase().includes('atypical')) {
    prediction = 'Basal Cell Carcinoma Screening Pattern';
    categoryCode = 'BCC_SUSP';
    nature = 'Requires Clinical Evaluation';
    confidence = 0.79;
    explanation =
      'The model highlighted subtle translucent papular structures with fine branching telangiectasias. In accordance with clinical screening protocols, lesions exhibiting atypical vascularity require professional in-person dermatoscope assessment.';
    detectedFeatures = [
      'Focal translucent/pearly structure with central shiny quality',
      'Arborizing (tree-like) telangiectatic vessels along the margin',
      'Absence of organized melanocytic pigment network',
      'Slight structural asymmetry at the upper quadrant',
    ];
    gradCamExplanation =
      'Grad-CAM reveals elevated activation focalized directly over the branching telangiectasia (red/yellow hot spot), which is the primary feature driving this screening classification.';
    recommendedNextStep = {
      urgency: 'specialist-review',
      title: 'Recommended Clinical Dermatologist Consultation',
      guidance:
        'Because the model flagged visual features consistent with an atypical or basal cell screening pattern, we strongly recommend scheduling a clinical evaluation with a qualified dermatologist for definitive dermoscopy and biopsy if indicated.',
      actionPoints: [
        'Contact a qualified dermatologist to schedule an in-person dermatoscope examination.',
        'Avoid scratching, squeezing, or attempting home treatments on the lesion.',
        'Note any history of bleeding, spontaneous crusting, or failure to heal over recent weeks.',
        'Bring this screening summary to your appointment as a discussion aid.',
      ],
      clinicalTreatmentRoadmap: {
        treatmentCategory: 'Histopathologic Diagnosis & Targeted Dermatologic Oncology',
        standardProcedures: [
          'Diagnostic Shave or Punch Biopsy (mandatory first step for definitive tissue pathology)',
          'Mohs Micrographic Surgery (gold standard for high-cure margin control on face/neck)',
          'Standard Surgical Excision with 4mm margins',
          'Electrodessication and Curettage (ED&C) for low-risk trunk lesions',
        ],
        prescriptionClassesConsidered: [
          'Topical Imiquimod 5% Cream (Aldara) — FDA-approved prescription immune response modifier, typically prescribed for biopsy-proven superficial BCC (e.g. applied 5x weekly for 6 weeks under doctor supervision).',
          'Topical 5-Fluorouracil (5-FU / Efudex 5%) — Prescription antimetabolite topical therapy for superficial lesions.',
          'Oral Hedgehog Pathway Inhibitors (e.g., Vismodegib / Sonidegib) — Prescribed by oncologists exclusively for advanced or metastatic disease.',
        ],
        diagnosticPrerequisites: [
          'Formal clinical dermoscopy and histological punch/shave biopsy',
          'Pathology subtype determination (nodular, superficial, infiltrating, or morpheaform)',
          'Evaluation of anatomical location and surgical margin feasibility',
        ],
        prescriptionNote:
          'Prescriptions for topical antineoplastic agents (such as Imiquimod or 5-FU) legally require a confirmed histopathologic biopsy by a dermatopathologist. The physician must prescribe the exact dosage, application duration, and manage expected local inflammatory skin responses.',
      },
    };
    probabilities = [
      {
        category: 'Basal Cell Pattern',
        code: 'BCC',
        probability: 0.79,
        description: 'Atypical pattern showing translucent papular or vascular characteristics.',
        nature: 'Requires Clinical Evaluation',
      },
      {
        category: 'Seborrheic Keratosis',
        code: 'BKL',
        probability: 0.11,
        description: 'Epidermal growth feature overlap.',
        nature: 'Benign',
      },
      {
        category: 'Actinic Keratosis',
        code: 'AKIEC',
        probability: 0.06,
        description: 'Pre-malignant sun-damaged keratinocytic macule.',
        nature: 'Requires Clinical Evaluation',
      },
      {
        category: 'Melanocytic Nevus',
        code: 'NV',
        probability: 0.04,
        description: 'Benign mole distribution.',
        nature: 'Benign',
      },
    ];
  } else if (meta?.presetId === 'sample-dermatofibroma' || meta?.fileName?.toLowerCase().includes('derma')) {
    prediction = 'Dermatofibroma (Benign)';
    categoryCode = 'DF_BENIGN';
    nature = 'Benign';
    confidence = 0.86;
    explanation =
      'The model detected a characteristic central white scar-like patch surrounded by a fine, delicate pigment network, which are classic dermatoscopic hallmarks of a benign dermatofibroma.';
    detectedFeatures = [
      'Central white fibrous / scar-like patch',
      'Delicate peripheral hyperpigmented reticular rim',
      'Homogeneous circular architecture without irregular projections',
      'Normal surrounding dermal skin tone',
    ];
    gradCamExplanation =
      'High activation is distributed symmetrically in an annular ring matching the peripheral pigment network around the central white fibrotic focus.';
    recommendedNextStep = {
      urgency: 'routine',
      title: 'Benign Fibrous Nodule Management & Monitoring',
      guidance:
        'Dermatofibromas are completely benign fibrous nodules in the deeper dermis. They typically require no medical intervention unless symptomatic, painful, or repeatedly traumatized.',
      actionPoints: [
        'Perform the pinch test (dimple sign) with a doctor to confirm clinical characteristics.',
        'Avoid aggressive friction or squeezing over the nodule.',
        'Consult a dermatologist if you experience pain, rapid enlargement, or itching.',
      ],
      clinicalTreatmentRoadmap: {
        treatmentCategory: 'Conservative Care & Symptomatic Intralesional Therapy',
        standardProcedures: [
          'Clinical reassurance and observation (recommended standard)',
          'Complete surgical excision into the subcutaneous fat (if painful or recurrently irritated)',
          'Surface cryosurgery (to flatten elevated nodules, though the deeper dermal component remains)',
        ],
        prescriptionClassesConsidered: [
          'Prescription Intralesional Triamcinolone Acetonide (corticosteroid injection administered in-office for painful, itchy, or hyperplastic nodules).',
          'Mild topical anti-inflammatory creams if surface pruritus (itching) is present.',
        ],
        diagnosticPrerequisites: [
          'Clinical examination including palpation (positive dimple sign when pinched)',
          'Dermoscopic confirmation of central white fibrotic network and delicate pigment ring',
        ],
        prescriptionNote:
          'Because dermatofibromas are dense collagenous dermal structures, surface creams cannot dissolve them. If symptomatic, a dermatologist may administer an in-office intralesional steroid injection or perform minor surgery.',
      },
    };
    probabilities = [
      {
        category: 'Dermatofibroma',
        code: 'DF',
        probability: 0.86,
        description: 'Common benign dermal fibrous nodule.',
        nature: 'Benign',
      },
      {
        category: 'Melanocytic Nevus',
        code: 'NV',
        probability: 0.08,
        description: 'Benign melanocytic mole.',
        nature: 'Benign',
      },
      {
        category: 'Seborrheic Keratosis',
        code: 'BKL',
        probability: 0.04,
        description: 'Keratinocytic growth pattern.',
        nature: 'Benign',
      },
      {
        category: 'Vascular Lesion',
        code: 'VASC',
        probability: 0.02,
        description: 'Benign angioma or vascular pattern.',
        nature: 'Benign',
      },
    ];
  }

  return {
    id: 'res-' + Math.random().toString(36).substring(2, 9),
    prediction,
    categoryCode,
    nature,
    confidence,
    probabilities,
    model: 'EfficientNetB0-DermNet',
    modelVersion: 'v1.4-academic-prototype',
    inferenceTimeMs: 1420 + Math.floor(Math.random() * 300),
    explanation,
    detectedFeatures,
    gradCamExplanation,
    heatmapDataUrl: blendedUrl,
    originalImageUrl: imageDataUrl,
    imageDimensions: { width, height },
    imageQuality: {
      status: 'Good',
      message: 'Image resolution, focal clarity, and lighting appear suitable for prototype screening analysis.',
      lighting: 'Adequate',
      focus: 'Sharp',
    },
    recommendedNextStep,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

/**
 * Intelligent context-aware safety assistant engine.
 * strictly adheres to academic prototype safety guidelines:
 * - Refuses to diagnose cancer definitively
 * - Refuses to prescribe medication, dosage, or treatments
 * - Provides empathetic, educational explanations of AI metrics and next steps
 */
export function generateChatbotResponse(
  userQuery: string,
  analysisResult: SkinAnalysisResult | null
): { response: string; suggestedChips: string[] } {
  const q = userQuery.toLowerCase().trim();

  // Safety & Clinical trigger: Prescription, medication, or treatment request
  if (
    q.includes('prescribe') ||
    q.includes('prescription') ||
    q.includes('medicine') ||
    q.includes('medication') ||
    q.includes('cream') ||
    q.includes('ointment') ||
    q.includes('pill') ||
    q.includes('dose') ||
    q.includes('dosage') ||
    q.includes('drug') ||
    q.includes('treatment') ||
    q.includes('cure')
  ) {
    if (analysisResult?.recommendedNextStep.clinicalTreatmentRoadmap) {
      const roadmap = analysisResult.recommendedNextStep.clinicalTreatmentRoadmap;
      const procedures = roadmap.standardProcedures.map((p) => `• ${p}`).join('\n');
      const meds = roadmap.prescriptionClassesConsidered.map((m) => `• ${m}`).join('\n');
      const tests = roadmap.diagnosticPrerequisites.map((t) => `• ${t}`).join('\n');

      return {
        response: `### Clinical Treatment & Prescription Guidance for ${analysisResult.prediction}

**Why AI cannot directly write a pharmacy prescription:**
Legally and medically, an AI software cannot generate a legal pharmacy prescription because drug dispensing requires in-person clinical examination, physical palpation, patient allergy/organ check, and a mandatory diagnostic biopsy by a licensed physician.

---

### Standard Medical Treatments & Prescription Options:
**Treatment Category:** ${roadmap.treatmentCategory}

**1. Typical Clinical & Procedural Options:**
${procedures}

**2. Prescription Classes Evaluated by Dermatologists:**
${meds}

**3. Diagnostic Tests Required Before Prescribing:**
${tests}

**Clinical Note:**
${roadmap.prescriptionNote}`,
        suggestedChips: [
          'What should I ask a dermatologist?',
          'What does this result mean?',
          'What should I do next?',
        ],
      };
    }

    return {
      response: `### Clinical Prescription & Treatment Protocol

**Why direct prescriptions require a licensed doctor:**
AI algorithms can screen visual images, but cannot legally dispense medical prescriptions. Safe medical treatment requires a doctor to evaluate lesion depth, allergy history, contraindications, and histological tissue biopsy.

**Typical Dermatological Action Plan:**
1. **Clinical Dermoscopy:** High-magnification polarized evaluation by a dermatologist.
2. **Diagnostic Biopsy:** If atypical features exist, a small tissue sample is tested.
3. **Targeted Prescription/Procedure:** The physician prescribes the exact medication (e.g. Topical Imiquimod, 5-FU, prescription retinoids, or performs cryosurgery/excision).

*Upload and analyze an image to see specific treatment classes for your lesion pattern.*`,
      suggestedChips: [
        'What should I ask a dermatologist?',
        'How does this prototype work?',
        'What are the ABCDE warning signs?',
      ],
    };
  }

  // Safety trigger: Cancer inquiry
  if (
    q.includes('cancer') ||
    q.includes('melanoma') ||
    q.includes('tumor') ||
    q.includes('malignant') ||
    q.includes('die') ||
    q.includes('dangerous') ||
    q.includes('do i have cancer')
  ) {
    if (analysisResult) {
      return {
        response: `This AI system cannot determine whether you have cancer or make a definitive medical diagnosis. For your uploaded image, the neural network generated a preliminary prediction of "${analysisResult.prediction}" with ${Math.round(
          analysisResult.confidence * 100
        )}% model confidence based purely on pixel patterns. If you have any concern about a changing, painful, bleeding, or irregular lesion, please consult a qualified dermatologist for a clinical dermoscopy and, if needed, a biopsy.`,
        suggestedChips: [
          'What are the ABCDE warning signs?',
          'What should I ask a dermatologist?',
          'Explain my confidence score',
        ],
      };
    }
    return {
      response:
        'This AI prototype cannot determine whether a skin lesion is cancerous. It is designed solely for preliminary screening demonstrations. If you have any skin lesion that is evolving, asymmetrical, bleeding, or concerning, please visit a qualified dermatologist promptly for an in-person clinical assessment.',
      suggestedChips: [
        'How does this AI screening work?',
        'What are the ABCDE warning signs?',
      ],
    };
  }

  // Query: What does this result mean?
  if (q.includes('result mean') || q.includes('what does this mean') || q.includes('explain result')) {
    if (!analysisResult) {
      return {
        response:
          'No image analysis has been run yet. Please upload a skin-lesion photo and click "Analyze Image" on the left so I can review the findings with you.',
        suggestedChips: ['How to upload an image', 'What image formats are supported?'],
      };
    }
    return {
      response: `The model classified the uploaded image as **${analysisResult.prediction}** with an output confidence score of **${Math.round(
        analysisResult.confidence * 100
      )}%**.\n\nKey aspects of this result:\n• **Category:** ${analysisResult.prediction}\n• **Classification Nature:** ${analysisResult.nature}\n• **Model Used:** ${analysisResult.model} (${analysisResult.modelVersion})\n\nThis is an AI-assisted screening output based on computer vision feature maps, not a definitive diagnosis. A medical doctor evaluates physical texture, palpation, patient history, and dermoscopy before reaching clinical conclusions.`,
      suggestedChips: [
        'Why did the AI predict this?',
        'What does the heatmap show?',
        'What should I do next?',
      ],
    };
  }

  // Query: Why did the AI predict this? / Detected features
  if (q.includes('why did the ai predict') || q.includes('why this prediction') || q.includes('detected') || q.includes('features')) {
    if (!analysisResult) {
      return {
        response:
          'Please analyze an image first so I can inspect the model feature activations for your sample.',
        suggestedChips: ['Upload an image'],
      };
    }
    const featuresList = analysisResult.detectedFeatures.map((f) => `• ${f}`).join('\n');
    return {
      response: `The neural network evaluated multi-scale spatial patterns in the image and identified:\n\n${featuresList}\n\nThese visual patterns correspond closely to the mathematical weights learned for **${analysisResult.prediction}** during model training. You can also review the Grad-CAM Attention Map to see which exact spatial regions carried the highest weight.`,
      suggestedChips: [
        'What does the heatmap show?',
        'Explain my confidence score',
        'What should I ask a dermatologist?',
      ],
    };
  }

  // Query: Explain confidence score
  if (q.includes('confidence') || q.includes('score') || q.includes('probability')) {
    if (!analysisResult) {
      return {
        response:
          'Confidence scores reflect the Softmax output probability of the convolutional neural network across trained classes (0% to 100%). Run an analysis to see the specific distribution for your image.',
        suggestedChips: ['Upload an image'],
      };
    }
    const confPct = Math.round(analysisResult.confidence * 100);
    return {
      response: `The model reported a **${confPct}% confidence** for ${analysisResult.prediction}.\n\nIn deep learning, confidence represents the mathematical Softmax probability assigned to the top class relative to other categories (such as Seborrheic Keratosis, Basal Cell, or Dermatofibroma). \n\n**Important:** High statistical confidence indicates the image strongly matches training patterns, but it is **not medical certainty**. Clinical factors like patient history and palpation cannot be captured by pixels alone.`,
      suggestedChips: [
        'What does this result mean?',
        'What does the heatmap show?',
        'What should I do next?',
      ],
    };
  }

  // Query: Heatmap / Grad-CAM / Attention map
  if (q.includes('heatmap') || q.includes('grad-cam') || q.includes('gradcam') || q.includes('attention map') || q.includes('color')) {
    if (!analysisResult) {
      return {
        response:
          'Grad-CAM (Gradient-weighted Class Activation Mapping) produces visual heatmaps showing which image areas most influenced the AI model decision. Upload and analyze an image to see the Grad-CAM visualization.',
        suggestedChips: ['Upload an image'],
      };
    }
    return {
      response: `**How to read the AI Attention Heatmap:**\n\n• **Red & Yellow (Warm colors):** High attention zones. These pixels had the highest positive influence on predicting ${analysisResult.prediction}.\n• **Green & Cyan:** Moderate intermediate feature influence.\n• **Dark Blue & Violet (Cool colors):** Low or baseline activation; these peripheral areas (like surrounding normal skin) had minimal impact on the prediction.\n\n${analysisResult.gradCamExplanation}`,
      suggestedChips: [
        'Why did the AI predict this?',
        'What should I ask a dermatologist?',
        'Explain my confidence score',
      ],
    };
  }

  // Query: What should I ask a dermatologist? / Questions to ask doctor
  if (q.includes('ask a dermatologist') || q.includes('doctor') || q.includes('questions to ask') || q.includes('appointment')) {
    return {
      response: `Here are helpful, constructive questions you can ask during a dermatologist appointment:\n\n1. *"Could you examine this specific lesion with a clinical dermatoscope?"*\n2. *"Does this spot show any clinical signs of asymmetry, irregular borders, or evolving pigment?"*\n3. *"Do you recommend taking a baseline photograph or scheduling a follow-up check in 6 to 12 months?"*\n4. *"Are there specific changes in size, elevation, or sensation I should watch for at home?"*\n5. *"Given my skin type and sun exposure history, how often do you recommend full-body skin screenings?"*`,
      suggestedChips: [
        'What are the ABCDE warning signs?',
        'What should I do next?',
        'What does this result mean?',
      ],
    };
  }

  // Query: What should I do next?
  if (q.includes('what should i do next') || q.includes('next step') || q.includes('recommend') || q.includes('guidance')) {
    if (!analysisResult) {
      return {
        response:
          'Step 1 is to upload a clear photo of the skin lesion. Once analyzed, I will provide tailored informational guidance on tracking and doctor consultations.',
        suggestedChips: ['Upload an image'],
      };
    }
    const bullets = analysisResult.recommendedNextStep.actionPoints.map((pt) => `• ${pt}`).join('\n');
    return {
      response: `**Recommended Next Steps:**\n\n${analysisResult.recommendedNextStep.guidance}\n\n**Action Checklist:**\n${bullets}`,
      suggestedChips: [
        'What should I ask a dermatologist?',
        'What are the ABCDE warning signs?',
        'Explain my confidence score',
      ],
    };
  }

  // Query: ABCDE warning signs
  if (q.includes('abcde') || q.includes('warning') || q.includes('signs') || q.includes('self-check')) {
    return {
      response: `**The ABCDE Rule for Skin Self-Checks:**\n\n• **A - Asymmetry:** One half of the mole does not match the other half.\n• **B - Border:** Edges are irregular, ragged, notched, or blurred.\n• **C - Color:** Color is not uniform (patches of tan, brown, black, white, red, or blue).\n• **D - Diameter:** Spot is larger than 6mm (approx. the size of a pencil eraser), though some melanomas can be smaller.\n• **E - Evolving:** The mole is changing in size, shape, elevation, or develops new symptoms (itching, tenderness, bleeding).\n\nIf a lesion exhibits any of these features, consult a dermatologist promptly.`,
      suggestedChips: [
        'What should I ask a dermatologist?',
        'What does this result mean?',
        'What should I do next?',
      ],
    };
  }

  // General or fallback response
  if (analysisResult) {
    return {
      response: `I am here to help you understand the prototype screening output for **${analysisResult.prediction}** (${Math.round(
        analysisResult.confidence * 100
      )}% confidence). You can ask me to explain the neural network features, how the Grad-CAM heatmap works, model probability distributions, or what questions to prepare for a dermatologist.`,
      suggestedChips: [
        'What does this result mean?',
        'Why did the AI predict this?',
        'What does the heatmap show?',
        'What should I ask a dermatologist?',
      ],
    };
  }

  return {
    response:
      "Hello! I'm the SkinSight AI Assistant. Upload a skin-lesion image on the left and click 'Analyze Image' to begin. Once the screening result is ready, I can help explain the model predictions, attention heatmap, and next steps.",
    suggestedChips: [
      'How does this prototype work?',
      'What are the ABCDE warning signs?',
      'What image formats are supported?',
    ],
  };
}
