import { CheckCircle, AlertCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface RecognitionResult {
  subjectId: string;
  subjectName: string;
  confidence: number;
  ssim: number;
  matchType: 'exact' | 'probable' | 'uncertain';
}

interface RecognitionResultsProps {
  result?: RecognitionResult;
  isProcessing?: boolean;
}

const mockResult: RecognitionResult = {
  subjectId: 'LFW-0042',
  subjectName: 'Subject 42',
  confidence: 94.7,
  ssim: 0.891,
  matchType: 'exact',
};

export function RecognitionResults({ result = mockResult, isProcessing = false }: RecognitionResultsProps) {
  const getMatchBadge = (type: string) => {
    switch (type) {
      case 'exact':
        return <Badge className="bg-success/20 text-success border-success/30">Exact Match</Badge>;
      case 'probable':
        return <Badge className="bg-warning/20 text-warning border-warning/30">Probable Match</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground">Uncertain</Badge>;
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

  return (
    <div className="data-card p-6 rounded-xl border border-border space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-success/10 border border-success/20">
            <CheckCircle className="w-5 h-5 text-success" />
          </div>
          <div>
            <h3 className="font-semibold">Recognition Complete</h3>
            <p className="text-sm text-muted-foreground">Identity verified successfully</p>
          </div>
        </div>
        {getMatchBadge(result.matchType)}
      </div>

      {/* Subject Info */}
      <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border">
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <User className="w-8 h-8 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Matched Subject</p>
          <p className="text-lg font-semibold">{result.subjectName}</p>
          <p className="text-xs text-muted-foreground font-mono">{result.subjectId}</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Confidence</span>
            <span className="font-mono font-medium text-success">{result.confidence}%</span>
          </div>
          <Progress 
            value={result.confidence} 
            className="h-2 bg-muted"
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">SSIM Score</span>
            <span className="font-mono font-medium text-primary">{result.ssim.toFixed(3)}</span>
          </div>
          <Progress 
            value={result.ssim * 100} 
            className="h-2 bg-muted"
          />
        </div>
      </div>

      {/* Additional Info */}
      <div className="pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Database</p>
            <p className="text-sm font-medium">LFW</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Processing</p>
            <p className="text-sm font-medium">124ms</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Candidates</p>
            <p className="text-sm font-medium">1,247</p>
          </div>
        </div>
      </div>
    </div>
  );
}