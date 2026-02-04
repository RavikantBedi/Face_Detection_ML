import { useState } from 'react';
import { ArrowRight, Wand2, RotateCcw, Download } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FaceUploadZone } from '@/components/dashboard/FaceUploadZone';
import { PipelineVisualization } from '@/components/dashboard/PipelineVisualization';
import { RecognitionResults } from '@/components/dashboard/RecognitionResults';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRecognitionLogs, RecognitionLog } from '@/hooks/useRecognitionLogs';
import { toast } from 'sonner';

export default function Recognition() {
  const { logs, createLog, processRecognition } = useRecognitionLogs();
  const [uploadedImage, setUploadedImage] = useState<{ url: string; path: string } | null>(null);
  const [currentResult, setCurrentResult] = useState<RecognitionLog | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageUploaded = (url: string, path: string) => {
    setUploadedImage({ url, path });
    setCurrentResult(null);
  };

  const startRecognition = async () => {
    if (!uploadedImage) return;

    // Create log entry
    const log = await createLog(uploadedImage.path);
    if (!log) return;

    setCurrentResult(log);
    setIsProcessing(true);

    // Process recognition
    const result = await processRecognition(uploadedImage.url, log.id);
    setIsProcessing(false);

    if (result?.success) {
      toast.success('Recognition complete!');
    }
  };

  const reset = () => {
    setUploadedImage(null);
    setCurrentResult(null);
    setIsProcessing(false);
  };

  // Get updated result from logs
  const displayResult = currentResult 
    ? logs.find(l => l.id === currentResult.id) || currentResult
    : null;

  return (
    <DashboardLayout 
      title="Face Recognition" 
      subtitle="Upload and process masked face images"
    >
      <Tabs defaultValue="single" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="single">Single Image</TabsTrigger>
          <TabsTrigger value="batch">Batch Processing</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-6">
          {/* Pipeline Status */}
          <Card className="p-6 border-border bg-card">
            <PipelineVisualization animated={isProcessing} />
          </Card>

          {/* Main Processing Area */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            {/* Input */}
            <div className="lg:col-span-2">
              <Card className="p-6 border-border bg-card">
                <h3 className="font-semibold mb-4">Masked Face Input</h3>
                <FaceUploadZone 
                  onImageUploaded={handleImageUploaded} 
                  className="min-h-[350px]"
                />
              </Card>
            </div>

            {/* Arrow / Action */}
            <div className="flex flex-col items-center justify-center lg:col-span-1 py-8">
              <Button
                size="lg"
                onClick={startRecognition}
                disabled={!uploadedImage || isProcessing}
                className="w-full max-w-[160px] gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Processing
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Recognize
                  </>
                )}
              </Button>
              
              {displayResult && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={reset}
                  className="mt-4 text-muted-foreground"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>

            {/* Output */}
            <div className="lg:col-span-2">
              <Card className="p-6 border-border bg-card">
                <h3 className="font-semibold mb-4">Recognition Output</h3>
                {displayResult ? (
                  <>
                    <RecognitionResults result={displayResult} isProcessing={isProcessing} />
                    {displayResult.status !== 'pending' && displayResult.status !== 'processing' && (
                      <div className="mt-4 flex gap-2">
                        <Button variant="secondary" size="sm" className="gap-2">
                          <Download className="w-4 h-4" />
                          Download Report
                        </Button>
                      </div>
                    )}
                  </>
                ) : isProcessing ? (
                  <RecognitionResults isProcessing />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[350px] text-center text-muted-foreground">
                    <ArrowRight className="w-12 h-12 mb-4 opacity-30" />
                    <p className="text-sm">Upload an image and click Recognize to start</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="batch">
          <Card className="p-12 border-border bg-card text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Wand2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Batch Processing</h3>
              <p className="text-muted-foreground mb-6">
                Process multiple masked face images at once. Upload a folder or ZIP file containing your images.
              </p>
              <Button>Upload Batch</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}