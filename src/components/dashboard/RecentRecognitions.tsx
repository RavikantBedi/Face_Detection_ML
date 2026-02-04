import { CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Recognition {
  id: string;
  timestamp: string;
  status: 'success' | 'partial' | 'failed';
  subjectId: string;
  confidence: number;
  processingTime: number;
}

const mockRecognitions: Recognition[] = [
  { id: '1', timestamp: '2 min ago', status: 'success', subjectId: 'LFW-0042', confidence: 94.7, processingTime: 124 },
  { id: '2', timestamp: '5 min ago', status: 'success', subjectId: 'LFW-0128', confidence: 89.2, processingTime: 156 },
  { id: '3', timestamp: '12 min ago', status: 'partial', subjectId: 'CASIA-2847', confidence: 72.4, processingTime: 203 },
  { id: '4', timestamp: '18 min ago', status: 'success', subjectId: 'AR-0067', confidence: 96.1, processingTime: 98 },
  { id: '5', timestamp: '25 min ago', status: 'failed', subjectId: 'Unknown', confidence: 0, processingTime: 312 },
];

const statusConfig = {
  success: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
  partial: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
  failed: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
};

export function RecentRecognitions() {
  return (
    <div className="data-card rounded-xl border border-border">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold">Recent Recognitions</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Last 5 processing results</p>
      </div>

      <div className="divide-y divide-border">
        {mockRecognitions.map((rec) => {
          const { icon: StatusIcon, color, bg } = statusConfig[rec.status];

          return (
            <div key={rec.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
              <div className={cn("p-2 rounded-lg", bg)}>
                <StatusIcon className={cn("w-4 h-4", color)} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{rec.subjectId}</span>
                  {rec.status === 'success' && (
                    <Badge variant="secondary" className="text-[10px] h-5">
                      {rec.confidence}%
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {rec.timestamp}
                  <span>•</span>
                  <span>{rec.processingTime}ms</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}