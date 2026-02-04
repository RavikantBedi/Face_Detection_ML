import { CheckCircle, AlertCircle, XCircle, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { RecognitionLog } from '@/hooks/useRecognitionLogs';

interface RecognitionResultsProps {
  result?: RecognitionLog | null;
  isProcessing?: boolean;
}

export function RecognitionResults({ result, isProcessing = false }: RecognitionResultsProps) {
  const getMatchBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-success/20 text-success border-success/30">Exact Match</Badge>;
      case 'warning':
        return <Badge className="bg-warning/20 text-warning border-warning/30">Low Confidence</Badge>;
      case 'failed':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Failed</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground">Pending</Badge>;
    }
  };

  if (isProcessing) {
    return (
      <div className="data-card p-6 rounded-xl border border-border">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-sm text-muted-foreground">Processing recognition...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="data-card p-6 rounded-xl border border-border">
        <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
          <User className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-sm">Upload an image to see recognition results</p>
        </div>
      </div>
    );
  }

  if (result.status === 'failed') {
    return (
      <div className="data-card p-6 rounded-xl border border-border space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold">Recognition Failed</h3>
              <p className="text-sm text-muted-foreground">{result.error_message || 'No matching face found'}</p>
            </div>
          </div>
          {getMatchBadge(result.status)}
        </div>

        <div className="p-4 rounded-lg bg-muted/30 border border-border">
          <p className="text-sm text-muted-foreground">
            The system could not find a matching identity. This may be due to:
          </p>
          <ul className="text-sm text-muted-foreground mt-2 list-disc list-inside">
            <li>Subject not in the database</li>
            <li>Poor image quality or occlusion</li>
            <li>Insufficient visible facial features</li>
          </ul>
        </div>

        {result.processing_time_ms && (
          <div className="pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Processing time: <span className="font-mono">{result.processing_time_ms}ms</span>
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="data-card p-6 rounded-xl border border-border space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg border",
            result.status === 'success' 
              ? "bg-success/10 border-success/20" 
              : "bg-warning/10 border-warning/20"
          )}>
            {result.status === 'success' ? (
              <CheckCircle className="w-5 h-5 text-success" />
            ) : (
              <AlertCircle className="w-5 h-5 text-warning" />
            )}
          </div>
          <div>
            <h3 className="font-semibold">Recognition Complete</h3>
            <p className="text-sm text-muted-foreground">
              {result.status === 'success' ? 'Identity verified successfully' : 'Low confidence match'}
            </p>
          </div>
        </div>
        {getMatchBadge(result.status)}
      </div>

      {/* Subject Info */}
      <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border">
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <User className="w-8 h-8 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Matched Subject</p>
          <p className="text-lg font-semibold">{result.subject_name || 'Unknown'}</p>
          <p className="text-xs text-muted-foreground font-mono">{result.subject_id}</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Confidence</span>
            <span className={cn(
              "font-mono font-medium",
              (result.confidence || 0) >= 85 ? "text-success" : "text-warning"
            )}>
              {result.confidence?.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={result.confidence || 0} 
            className="h-2 bg-muted"
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">SSIM Score</span>
            <span className="font-mono font-medium text-primary">
              {result.ssim_score?.toFixed(3)}
            </span>
          </div>
          <Progress 
            value={(result.ssim_score || 0) * 100} 
            className="h-2 bg-muted"
          />
        </div>
      </div>

      {/* Additional Info */}
      <div className="pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Database</p>
            <p className="text-sm font-medium">{result.database_used}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Processing</p>
            <p className="text-sm font-medium">{result.processing_time_ms}ms</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Timestamp</p>
            <p className="text-sm font-medium">
              {new Date(result.created_at).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}