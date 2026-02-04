import { CheckCircle, AlertTriangle, XCircle, Clock, Filter, Download, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'recognition' | 'upload' | 'export' | 'error';
  status: 'success' | 'warning' | 'error';
  subject: string;
  confidence: number;
  processingTime: number;
  database: string;
}

const activityLogs: ActivityLog[] = [
  { id: '1', timestamp: '2024-01-15 14:32:18', type: 'recognition', status: 'success', subject: 'LFW-0042', confidence: 94.7, processingTime: 124, database: 'LFW' },
  { id: '2', timestamp: '2024-01-15 14:30:45', type: 'recognition', status: 'success', subject: 'LFW-0128', confidence: 89.2, processingTime: 156, database: 'LFW' },
  { id: '3', timestamp: '2024-01-15 14:28:12', type: 'recognition', status: 'warning', subject: 'CASIA-2847', confidence: 72.4, processingTime: 203, database: 'CASIA' },
  { id: '4', timestamp: '2024-01-15 14:25:33', type: 'recognition', status: 'success', subject: 'AR-0067', confidence: 96.1, processingTime: 98, database: 'AR' },
  { id: '5', timestamp: '2024-01-15 14:22:51', type: 'recognition', status: 'error', subject: 'Unknown', confidence: 0, processingTime: 312, database: 'LFW' },
  { id: '6', timestamp: '2024-01-15 14:20:08', type: 'upload', status: 'success', subject: 'Batch Upload', confidence: 0, processingTime: 1542, database: 'LFW' },
  { id: '7', timestamp: '2024-01-15 14:15:42', type: 'recognition', status: 'success', subject: 'LFW-0891', confidence: 91.8, processingTime: 132, database: 'LFW' },
  { id: '8', timestamp: '2024-01-15 14:12:19', type: 'recognition', status: 'success', subject: 'LFW-0234', confidence: 88.5, processingTime: 145, database: 'LFW' },
];

const statusConfig = {
  success: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', label: 'Success' },
  warning: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', label: 'Low Confidence' },
  error: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Failed' },
};

const typeConfig = {
  recognition: { label: 'Recognition', className: 'bg-primary/20 text-primary border-primary/30' },
  upload: { label: 'Upload', className: 'bg-accent/20 text-accent border-accent/30' },
  export: { label: 'Export', className: 'bg-muted text-muted-foreground' },
  error: { label: 'Error', className: 'bg-destructive/20 text-destructive border-destructive/30' },
};

export default function Activity() {
  return (
    <DashboardLayout 
      title="Activity Log" 
      subtitle="Complete system activity and recognition history"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-semibold">847</p>
              <p className="text-xs text-muted-foreground">Successful</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-semibold">89</p>
              <p className="text-xs text-muted-foreground">Low Confidence</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-semibold">23</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Clock className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-semibold">142ms</p>
              <p className="text-xs text-muted-foreground">Avg. Time</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 border-border bg-card mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Input 
            placeholder="Search by subject ID..." 
            className="max-w-xs bg-muted/50"
          />
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            <Button variant="outline" size="sm">All Status</Button>
            <Button variant="outline" size="sm">Last 24h</Button>
          </div>
          <div className="sm:ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button variant="secondary" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Activity Table */}
      <Card className="border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Timestamp</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Subject</TableHead>
              <TableHead className="text-muted-foreground">Confidence</TableHead>
              <TableHead className="text-muted-foreground">Time</TableHead>
              <TableHead className="text-muted-foreground">Database</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activityLogs.map((log) => {
              const status = statusConfig[log.status];
              const StatusIcon = status.icon;
              const type = typeConfig[log.type];

              return (
                <TableRow key={log.id} className="border-border hover:bg-muted/30">
                  <TableCell>
                    <div className={cn("p-1.5 rounded-md w-fit", status.bg)}>
                      <StatusIcon className={cn("w-4 h-4", status.color)} />
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {log.timestamp}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={type.className}>
                      {type.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{log.subject}</TableCell>
                  <TableCell>
                    {log.confidence > 0 ? (
                      <span className={cn(
                        "font-mono",
                        log.confidence >= 90 && "text-success",
                        log.confidence >= 70 && log.confidence < 90 && "text-warning",
                        log.confidence < 70 && "text-destructive"
                      )}>
                        {log.confidence}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {log.processingTime}ms
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{log.database}</span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </DashboardLayout>
  );
}