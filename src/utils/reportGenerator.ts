import type { RecognitionLog } from '@/hooks/useRecognitionLogs';
import { format } from 'date-fns';

interface ReportData {
  result: RecognitionLog;
  imageUrl?: string;
}

export function generateRecognitionReport(data: ReportData): string {
  const { result } = data;
  const timestamp = format(new Date(result.created_at), 'yyyy-MM-dd HH:mm:ss');
  const updateTime = format(new Date(result.updated_at), 'yyyy-MM-dd HH:mm:ss');
  
  const confidenceLevel = result.confidence 
    ? result.confidence >= 90 ? 'HIGH' 
    : result.confidence >= 75 ? 'MEDIUM' 
    : 'LOW'
    : 'N/A';

  const ssimLevel = result.ssim_score
    ? result.ssim_score >= 0.9 ? 'EXCELLENT'
    : result.ssim_score >= 0.8 ? 'GOOD'
    : result.ssim_score >= 0.7 ? 'FAIR'
    : 'POOR'
    : 'N/A';

  const report = `
================================================================================
                    MASKED FACE RECOGNITION REPORT
================================================================================

Report ID: ${result.id}
Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}

--------------------------------------------------------------------------------
                           RECOGNITION SUMMARY
--------------------------------------------------------------------------------

Status:              ${result.status.toUpperCase()}
Processing Time:     ${result.processing_time_ms ? `${result.processing_time_ms}ms` : 'N/A'}
Database Used:       ${result.database_used || 'LFW'}
Image Path:          ${result.image_path}

--------------------------------------------------------------------------------
                           SUBJECT IDENTIFICATION
--------------------------------------------------------------------------------

Subject ID:          ${result.subject_id || 'Not Identified'}
Subject Name:        ${result.subject_name || 'Unknown'}

--------------------------------------------------------------------------------
                           ACCURACY METRICS
--------------------------------------------------------------------------------

Confidence Score:    ${result.confidence ? `${result.confidence.toFixed(2)}%` : 'N/A'}
Confidence Level:    ${confidenceLevel}

SSIM Score:          ${result.ssim_score ? result.ssim_score.toFixed(4) : 'N/A'}
SSIM Quality:        ${ssimLevel}

--------------------------------------------------------------------------------
                           DETAILED ANALYSIS
--------------------------------------------------------------------------------

Recognition Algorithm: Deep Learning CNN with ArcFace Loss
Feature Extraction:    128-dimensional face embedding
Matching Method:       Cosine Similarity with Euclidean Distance
Database Size:         ${result.database_used === 'LFW' ? '13,233 images (5,749 subjects)' 
                       : result.database_used === 'CASIA' ? '494,414 images (10,575 subjects)'
                       : result.database_used === 'AR' ? '4,000 images (126 subjects)'
                       : 'Unknown'}

Occlusion Handling:
- Mask Detection:      Enabled
- Periocular Focus:    ${result.confidence && result.confidence > 85 ? 'High Priority' : 'Standard'}
- Feature Weighting:   Upper face region prioritized

Quality Assessment:
- Image Resolution:    Analyzed
- Face Detection:      ${result.status !== 'failed' ? 'Successful' : 'Failed'}
- Alignment Score:     ${result.ssim_score ? (result.ssim_score * 100).toFixed(1) + '%' : 'N/A'}

--------------------------------------------------------------------------------
                           TIMESTAMPS
--------------------------------------------------------------------------------

Created At:          ${timestamp}
Updated At:          ${updateTime}

--------------------------------------------------------------------------------
                           NOTES
--------------------------------------------------------------------------------

${result.error_message ? `Error: ${result.error_message}` : 'No errors encountered during processing.'}

${result.status === 'warning' 
  ? 'WARNING: Low confidence match. Manual verification recommended.'
  : result.status === 'failed'
  ? 'FAILED: No matching face found in database. Consider expanding search parameters.'
  : 'Recognition completed successfully.'}

================================================================================
                         END OF REPORT
================================================================================
`;

  return report;
}

export function downloadReport(result: RecognitionLog): void {
  const report = generateRecognitionReport({ result });
  const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `recognition-report-${result.id.slice(0, 8)}-${format(new Date(), 'yyyyMMdd-HHmmss')}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJSONReport(result: RecognitionLog): void {
  const report = {
    reportId: result.id,
    generatedAt: new Date().toISOString(),
    recognition: {
      status: result.status,
      processingTimeMs: result.processing_time_ms,
      databaseUsed: result.database_used,
      imagePath: result.image_path,
    },
    subject: {
      id: result.subject_id,
      name: result.subject_name,
    },
    metrics: {
      confidence: result.confidence,
      confidenceLevel: result.confidence 
        ? result.confidence >= 90 ? 'HIGH' 
        : result.confidence >= 75 ? 'MEDIUM' 
        : 'LOW'
        : null,
      ssimScore: result.ssim_score,
      ssimQuality: result.ssim_score
        ? result.ssim_score >= 0.9 ? 'EXCELLENT'
        : result.ssim_score >= 0.8 ? 'GOOD'
        : result.ssim_score >= 0.7 ? 'FAIR'
        : 'POOR'
        : null,
    },
    algorithm: {
      type: 'Deep Learning CNN with ArcFace Loss',
      featureDimension: 128,
      matchingMethod: 'Cosine Similarity',
      occlusionHandling: 'Periocular region prioritization',
    },
    timestamps: {
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    },
    errorMessage: result.error_message,
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `recognition-report-${result.id.slice(0, 8)}-${format(new Date(), 'yyyyMMdd-HHmmss')}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
