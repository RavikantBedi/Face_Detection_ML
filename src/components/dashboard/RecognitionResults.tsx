import { CheckCircle, AlertCircle, XCircle, User, Database, Clock, Target, Scan, Shield, Fingerprint, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { RecognitionLog } from '@/hooks/useRecognitionLogs';

interface RecognitionResultsProps {
  result?: RecognitionLog | null;
  isProcessing?: boolean;
}

function getConfidenceLevel(confidence: number | null): { label: string; color: string } {
  if (!confidence) return { label: 'N/A', color: 'text-muted-foreground' };
  if (confidence >= 90) return { label: 'HIGH', color: 'text-success' };
  if (confidence >= 75) return { label: 'MEDIUM', color: 'text-warning' };
  return { label: 'LOW', color: 'text-destructive' };
}

function getSSIMQuality(ssim: number | null): { label: string; color: string } {
  if (!ssim) return { label: 'N/A', color: 'text-muted-foreground' };
  if (ssim >= 0.9) return { label: 'EXCELLENT', color: 'text-success' };
  if (ssim >= 0.8) return { label: 'GOOD', color: 'text-primary' };
  if (ssim >= 0.7) return { label: 'FAIR', color: 'text-warning' };
  return { label: 'POOR', color: 'text-destructive' };
}

export function RecognitionResults({ result, isProcessing = false }: RecognitionResultsProps) {
  const getMatchBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-success/20 text-success border-success/30">High Confidence Match</Badge>;
      case 'warning':
        return <Badge className="bg-warning/20 text-warning border-warning/30">Low Confidence</Badge>;
      case 'failed':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">No Match</Badge>;
      case 'processing':
        return <Badge className="bg-primary/20 text-primary border-primary/30">Processing</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground">Pending</Badge>;
    }
  };

  if (isProcessing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20 animate-pulse">
          <div className="p-3 rounded-full bg-primary/10">
            <Activity className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-primary">Processing Recognition</p>
            <p className="text-sm text-muted-foreground">Analyzing facial features and matching against database...</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-4 bg-muted/50 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-muted/50 rounded w-1/2 animate-pulse" />
          <div className="h-4 bg-muted/50 rounded w-2/3 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
        <User className="w-12 h-12 mb-4 opacity-30" />
        <p className="text-sm">Upload an image to see recognition results</p>
      </div>
    );
  }

  const confidenceLevel = getConfidenceLevel(result.confidence);
  const ssimQuality = getSSIMQuality(result.ssim_score);

  if (result.status === 'failed') {
    return (
      <div className="space-y-5">
        {/* Status Header */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="p-3 rounded-full bg-destructive/10">
            <XCircle className="w-6 h-6 text-destructive" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-destructive">No Match Found</p>
              {result.processing_time_ms && (
                <Badge variant="outline" className="text-xs">
                  {result.processing_time_ms}ms
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">No matching face found in database</p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-muted/30 border border-border">
          <p className="text-sm font-medium mb-2">Possible causes:</p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>Subject not enrolled in the database</li>
            <li>Poor image quality or excessive occlusion</li>
            <li>Insufficient visible facial features</li>
            <li>Mask covering critical recognition areas</li>
          </ul>
        </div>

        {/* Database Info */}
        <div className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card/30">
          <Database className="w-4 h-4 text-muted-foreground" />
          <div className="flex-1">
            <span className="text-xs text-muted-foreground">Database: </span>
            <span className="text-sm font-medium">{result.database_used || 'LFW'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Status Header */}
      <div className={cn(
        "flex items-center gap-4 p-4 rounded-lg border",
        result.status === 'success' 
          ? "bg-success/10 border-success/20" 
          : "bg-warning/10 border-warning/20"
      )}>
        <div className={cn(
          "p-3 rounded-full",
          result.status === 'success' ? "bg-success/10" : "bg-warning/10"
        )}>
          {result.status === 'success' ? (
            <CheckCircle className="w-6 h-6 text-success" />
          ) : (
            <AlertCircle className="w-6 h-6 text-warning" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className={cn("font-semibold", result.status === 'success' ? "text-success" : "text-warning")}>
              {result.status === 'success' ? 'Match Found' : 'Low Confidence Match'}
            </p>
            {result.processing_time_ms && (
              <Badge variant="outline" className="text-xs">
                {result.processing_time_ms}ms
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {result.status === 'success' ? 'Subject successfully identified' : 'Match found but verification recommended'}
          </p>
        </div>
      </div>

      {/* Subject Information */}
      {result.subject_id && (
        <div className="p-4 rounded-lg border border-border bg-card/50">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Fingerprint className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Identified Subject</p>
              <p className="text-lg font-semibold">{result.subject_name || 'Unknown'}</p>
              <p className="text-sm text-muted-foreground font-mono">{result.subject_id}</p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Confidence Score */}
        <div className="p-4 rounded-lg border border-border bg-card/50">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Confidence</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold">
                {result.confidence ? `${result.confidence.toFixed(1)}%` : 'N/A'}
              </span>
              <Badge variant="outline" className={cn("text-xs", confidenceLevel.color)}>
                {confidenceLevel.label}
              </Badge>
            </div>
            {result.confidence && (
              <Progress 
                value={result.confidence} 
                className="h-2"
              />
            )}
          </div>
        </div>

        {/* SSIM Score */}
        <div className="p-4 rounded-lg border border-border bg-card/50">
          <div className="flex items-center gap-2 mb-3">
            <Scan className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">SSIM Score</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold">
                {result.ssim_score ? result.ssim_score.toFixed(4) : 'N/A'}
              </span>
              <Badge variant="outline" className={cn("text-xs", ssimQuality.color)}>
                {ssimQuality.label}
              </Badge>
            </div>
            {result.ssim_score && (
              <Progress 
                value={result.ssim_score * 100} 
                className="h-2"
              />
            )}
          </div>
        </div>
      </div>

      {/* Database Info */}
      <div className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card/30">
        <Database className="w-4 h-4 text-muted-foreground" />
        <div className="flex-1">
          <span className="text-xs text-muted-foreground">Database: </span>
          <span className="text-sm font-medium">{result.database_used || 'LFW'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Shield className="w-4 h-4 text-success" />
          <span className="text-xs text-muted-foreground">Verified</span>
        </div>
      </div>

      {/* Error Message */}
      {result.error_message && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{result.error_message}</p>
        </div>
      )}
    </div>
  );
}