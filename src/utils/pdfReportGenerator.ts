import { jsPDF } from 'jspdf';
import { SkinAnalysisResult } from '../types';

/**
 * Loads an image from a URL or Data URL and returns a base64 JPEG string
 */
async function toBase64Jpeg(url: string): Promise<string | null> {
  if (!url) return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 400;
        canvas.height = img.naturalHeight || img.height || 400;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        // Fill white background for transparency
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = url;
  });
}

/**
 * Generates a comprehensive, professional clinical summary PDF for healthcare provider consultation.
 */
export async function generateClinicalSummaryPdf(
  result: SkinAnalysisResult,
  patientNotes?: string
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  let y = margin;

  // 1. Header Banner (Medical Deep Teal)
  doc.setFillColor(15, 118, 110); // Teal 700
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('SkinSight AI - Clinical Lesion Screening Summary', margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(
    'PRELIMINARY DECISION-SUPPORT REPORT FOR PHYSICIAN CONSULTATION',
    margin + 6,
    y + 15
  );

  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.setFontSize(8);
  doc.text(`Generated: ${formattedDate}`, pageWidth - margin - 6, y + 9, { align: 'right' });
  doc.text(`Report Ref: #${(result.id || 'SKN-9021').slice(-8).toUpperCase()}`, pageWidth - margin - 6, y + 15, {
    align: 'right',
  });

  y += 28;

  // 2. Urgent / Disclaimer Notice Bar
  const isRequiresEval = result.nature === 'Requires Clinical Evaluation';
  doc.setFillColor(isRequiresEval ? 254 : 240, isRequiresEval ? 242 : 253, isRequiresEval ? 242 : 250);
  doc.setDrawColor(isRequiresEval ? 252 : 204, isRequiresEval ? 165 : 251, isRequiresEval ? 165 : 241);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(isRequiresEval ? 185 : 15, isRequiresEval ? 28 : 118, isRequiresEval ? 28 : 110);
  doc.text(
    'CLINICAL NOTICE:',
    margin + 4,
    y + 5
  );
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(
    'This AI-generated report is intended to facilitate patient-physician dialogue. It is not an autonomous medical diagnosis.',
    margin + 33,
    y + 5
  );
  doc.text(
    'Definitive diagnostic evaluation requires dermoscopic examination and histological biopsy by a qualified clinician.',
    margin + 4,
    y + 9.5
  );

  y += 16;

  // 3. Primary Assessment Grid & Images Section
  const cardHeight = 62;
  const leftColWidth = 84;
  const rightColWidth = contentWidth - leftColWidth - 5;

  // Left Box: Primary Prediction & Model Stats
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, leftColWidth, cardHeight, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('PRIMARY AI PREDICTION', margin + 5, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  const predLines = doc.splitTextToSize(result.prediction, leftColWidth - 10);
  doc.text(predLines, margin + 5, y + 13);

  const statusY = y + 13 + predLines.length * 5;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  if (result.nature === 'Requires Clinical Evaluation') {
    doc.setTextColor(185, 28, 28);
  } else if (result.nature === 'Monitoring Recommended') {
    doc.setTextColor(180, 83, 9);
  } else {
    doc.setTextColor(16, 149, 102);
  }
  doc.text(`Status: ${result.nature}`, margin + 5, statusY);

  // Confidence meter representation
  const confPct = Math.round(result.confidence * 100);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Calibrated Confidence: ${confPct}%`, margin + 5, statusY + 6);

  // Small visual progress bar
  doc.setFillColor(226, 232, 240);
  doc.roundedRect(margin + 5, statusY + 8, leftColWidth - 10, 3, 1, 1, 'F');
  doc.setFillColor(15, 118, 110);
  doc.roundedRect(margin + 5, statusY + 8, ((leftColWidth - 10) * confPct) / 100, 3, 1, 1, 'F');

  // Metadata items
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Disease Code: ${result.categoryCode}`, margin + 5, statusY + 16);
  doc.text(`Model Architecture: ${result.model || 'Multi-Class Ensemble'}`, margin + 5, statusY + 20);
  doc.text(`Image Quality: ${result.imageQuality?.status || 'Good'} (${result.imageQuality?.lighting || 'Adequate'} light)`, margin + 5, statusY + 24);

  // Right Box: Lesion Images (Original + Heatmap)
  const imgBoxX = margin + leftColWidth + 5;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(imgBoxX, y, rightColWidth, cardHeight, 3, 3, 'FD');

  const halfWidth = (rightColWidth - 9) / 2;
  const imgHeight = 44;

  // Load and embed images
  const originalBase64 = await toBase64Jpeg(result.originalImageUrl);
  const heatmapBase64 = result.heatmapDataUrl ? await toBase64Jpeg(result.heatmapDataUrl) : null;

  // Original image box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Dermoscopic Snapshot', imgBoxX + 4, y + 6);

  if (originalBase64) {
    try {
      doc.addImage(originalBase64, 'JPEG', imgBoxX + 4, y + 8, halfWidth, imgHeight);
    } catch {
      doc.setDrawColor(203, 213, 225);
      doc.rect(imgBoxX + 4, y + 8, halfWidth, imgHeight, 'S');
      doc.text('[Image rendered]', imgBoxX + 6, y + 25);
    }
  } else {
    doc.setDrawColor(203, 213, 225);
    doc.rect(imgBoxX + 4, y + 8, halfWidth, imgHeight, 'S');
    doc.text('[Lesion Photo]', imgBoxX + 6, y + 25);
  }

  // Heatmap image box
  doc.text('Grad-CAM Visual Saliency', imgBoxX + halfWidth + 6, y + 6);
  if (heatmapBase64) {
    try {
      doc.addImage(heatmapBase64, 'JPEG', imgBoxX + halfWidth + 6, y + 8, halfWidth, imgHeight);
    } catch {
      doc.setDrawColor(203, 213, 225);
      doc.rect(imgBoxX + halfWidth + 6, y + 8, halfWidth, imgHeight, 'S');
      doc.text('[Grad-CAM Heatmap]', imgBoxX + halfWidth + 8, y + 25);
    }
  } else if (originalBase64) {
    // Fallback: draw original with label
    try {
      doc.addImage(originalBase64, 'JPEG', imgBoxX + halfWidth + 6, y + 8, halfWidth, imgHeight);
    } catch {
      // Ignore
    }
  }

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Optical capture evaluated by convolutional layers', imgBoxX + 4, y + cardHeight - 3);

  y += cardHeight + 6;

  // 4. Differential Diagnoses Ranking Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Differential Diagnoses & Top-4 Multi-Class Candidates', margin, y + 3);

  y += 6;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('#', margin + 3, y + 5);
  doc.text('Condition / Diagnostic Entity', margin + 12, y + 5);
  doc.text('Clinical Status', margin + 85, y + 5);
  doc.text('Category', margin + 130, y + 5);
  doc.text('Probability', margin + contentWidth - 4, y + 5, { align: 'right' });

  y += 7;

  const diffs =
    result.topFourSuggestions && result.topFourSuggestions.length >= 4
      ? result.topFourSuggestions
      : (result.probabilities || []).slice(0, 4).map((p, idx) => ({
          rank: idx + 1,
          diseaseName: p.category,
          categoryCode: p.code,
          percentage: Math.round(p.probability * 100),
          clinicalStatus: idx === 0 ? 'Primary' : 'Differential',
          nature: p.nature,
        }));

  diffs.forEach((item, idx) => {
    const rowY = y + idx * 6.5;
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, rowY, contentWidth, 6.5, 'F');
    }
    doc.setFont('helvetica', idx === 0 ? 'bold' : 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(idx === 0 ? 15 : 51, idx === 0 ? 23 : 65, idx === 0 ? 42 : 85);

    doc.text(`${item.rank || idx + 1}`, margin + 3, rowY + 4.5);
    doc.text(`${item.diseaseName}`, margin + 12, rowY + 4.5);
    doc.text(`${item.clinicalStatus || 'Differential'}`, margin + 85, rowY + 4.5);
    doc.text(`${item.categoryCode || item.nature || 'General'}`, margin + 130, rowY + 4.5);
    doc.text(`${item.percentage}%`, margin + contentWidth - 4, rowY + 4.5, { align: 'right' });
  });

  y += diffs.length * 6.5 + 6;

  // 5. Detected Visual Features & Clinical Explanation
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Convolutional Feature Analysis & Morphological Hallmarks', margin, y + 3);

  y += 6;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  const explBoxHeight = 28;
  doc.roundedRect(margin, y, contentWidth, explBoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  const explText = result.explanation || 'Morphological feature alignment detected by multi-scale convolutional filters.';
  const explLines = doc.splitTextToSize(explText, contentWidth - 8);
  doc.text(explLines.slice(0, 3), margin + 4, y + 5);

  // Detected feature chips
  if (result.detectedFeatures && result.detectedFeatures.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(15, 118, 110);
    const featureStr = `Detected Features: ${result.detectedFeatures.join('  •  ')}`;
    doc.text(featureStr, margin + 4, y + explBoxHeight - 3);
  }

  y += explBoxHeight + 6;

  // 6. Clinical Guidance & Physician Discussion Points
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Recommended Clinical Protocol & Provider Discussion Points', margin, y + 3);

  y += 6;
  doc.setFillColor(240, 253, 250); // Light teal tint
  doc.setDrawColor(153, 246, 228);
  const recBoxHeight = 36;
  doc.roundedRect(margin, y, contentWidth, recBoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(13, 78, 81);
  doc.text(`Action Step: ${result.recommendedNextStep?.title || 'Clinical Evaluation'}`, margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  const guidanceLines = doc.splitTextToSize(
    result.recommendedNextStep?.guidance ||
      'Schedule an in-person dermatologic examination for dermoscopy and histopathological analysis.',
    contentWidth - 8
  );
  doc.text(guidanceLines.slice(0, 2), margin + 4, y + 11.5);

  // Bullet action points
  const points = (result.recommendedNextStep?.actionPoints || []).slice(0, 3);
  points.forEach((point, pIdx) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 118, 110);
    doc.text('•', margin + 4, y + 18 + pIdx * 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(point, margin + 8, y + 18 + pIdx * 4.5);
  });

  y += recBoxHeight + 6;

  // Optional Patient Notes if provided
  if (patientNotes && patientNotes.trim()) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('PATIENT NOTES & SYMPTOM CONTEXT:', margin, y + 3);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    const notesLines = doc.splitTextToSize(patientNotes, contentWidth);
    doc.text(notesLines.slice(0, 2), margin, y);
    y += 8;
  }

  // 7. Clinical Roadmap / Procedures (if available)
  const roadmap = result.recommendedNextStep?.clinicalTreatmentRoadmap;
  if (roadmap && y < pageHeight - 38) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Standard Procedures & Prescriptions for Provider Reference:', margin, y + 2);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    const procs = roadmap.standardProcedures?.slice(0, 3).join('; ') || 'Dermoscopic surveillance; Excisional biopsy if indicated';
    const meds = roadmap.prescriptionClassesConsidered?.slice(0, 3).join('; ') || 'Specialist evaluated';
    doc.text(`Procedures: ${procs}`, margin, y);
    doc.text(`Considerations: ${meds}`, margin, y + 4);
    y += 9;
  }

  // 8. Footer (Page boundary check)
  const footerY = pageHeight - 12;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'SkinSight AI Prototype v2.0 • For clinical review and academic screening demonstration only • Not an FDA-cleared diagnostic device',
    margin,
    footerY + 2
  );
  doc.text('Page 1 of 1', pageWidth - margin, footerY + 2, { align: 'right' });

  // Save the PDF file to user's device
  const sanitizedCode = (result.categoryCode || 'LESION').replace(/[^a-zA-Z0-9]/g, '_');
  const dateSuffix = new Date().toISOString().slice(0, 10);
  doc.save(`SkinSight_Clinical_Summary_${sanitizedCode}_${dateSuffix}.pdf`);
}
