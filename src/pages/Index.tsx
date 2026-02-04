import { ScanFace, Users, BarChart3, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { PipelineVisualization } from '@/components/dashboard/PipelineVisualization';
import { FaceUploadZone } from '@/components/dashboard/FaceUploadZone';
import { RecognitionResults } from '@/components/dashboard/RecognitionResults';
import { RecentRecognitions } from '@/components/dashboard/RecentRecognitions';
import { SystemStatusCard } from '@/components/dashboard/SystemStatusCard';
import { DatabaseStats } from '@/components/dashboard/DatabaseStats';
import { Card } from '@/components/ui/card';

const Index = () => {
  return (
    <DashboardLayout 
      title="Dashboard" 
      subtitle="Masked Face Recognition System Overview"
    >
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Recognitions"
          value="12,847"
          subtitle="All time"
          trend={{ value: 12.5, direction: 'up' }}
          icon={<ScanFace className="w-4 h-4 text-primary" />}
          variant="primary"
        />
        <MetricCard
          title="Active Subjects"
          value="1,247"
          subtitle="Across 3 databases"
          icon={<Users className="w-4 h-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Avg. SSIM Score"
          value="0.891"
          subtitle="Last 30 days"
          trend={{ value: 2.3, direction: 'up' }}
          icon={<BarChart3 className="w-4 h-4 text-success" />}
          variant="success"
        />
        <MetricCard
          title="Avg. Processing"
          value="142ms"
          subtitle="Response time"
          trend={{ value: 8, direction: 'down' }}
          icon={<Clock className="w-4 h-4 text-muted-foreground" />}
        />
      </div>

      {/* Pipeline Visualization */}
      <Card className="p-6 mb-6 border-border bg-card">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Recognition Pipeline</h2>
          <p className="text-sm text-muted-foreground">Real-time processing stages visualization</p>
        </div>
        <PipelineVisualization animated />
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upload & Recognition */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Input Image</h3>
              <FaceUploadZone className="h-full min-h-[320px]" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Recognition Results</h3>
              <RecognitionResults />
            </div>
          </div>

          {/* Recent Activity */}
          <RecentRecognitions />
        </div>

        {/* Right Column - Stats */}
        <div className="space-y-6">
          <SystemStatusCard />
          <DatabaseStats />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;