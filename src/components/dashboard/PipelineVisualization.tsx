import { useState, useEffect } from 'react';
import { Check, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type StepStatus = 'pending' | 'active' | 'completed';

interface PipelineStep {
  id: number;
  name: string;
  description: string;
  status: StepStatus;
}

const initialSteps: PipelineStep[] = [
  { id: 1, name: 'Upload', description: 'Masked face input', status: 'completed' },
  { id: 2, name: 'Extract', description: 'Upper face region', status: 'completed' },
  { id: 3, name: 'Match', description: 'Find candidate', status: 'active' },
  { id: 4, name: 'Transform', description: 'Rotation estimation', status: 'pending' },
  { id: 5, name: 'Reconstruct', description: 'Face merge', status: 'pending' },
  { id: 6, name: 'Recognize', description: 'Identity match', status: 'pending' },
];

interface PipelineVisualizationProps {
  animated?: boolean;
}

export function PipelineVisualization({ animated = false }: PipelineVisualizationProps) {
  const [steps, setSteps] = useState(initialSteps);

  useEffect(() => {
    if (!animated) return;

    const interval = setInterval(() => {
      setSteps(currentSteps => {
        const activeIndex = currentSteps.findIndex(s => s.status === 'active');
        if (activeIndex === -1 || activeIndex >= currentSteps.length - 1) {
          // Reset
          return initialSteps;
        }

        return currentSteps.map((step, idx) => {
          if (idx === activeIndex) return { ...step, status: 'completed' as StepStatus };
          if (idx === activeIndex + 1) return { ...step, status: 'active' as StepStatus };
          return step;
        });
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [animated]);

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "pipeline-step",
                  step.status === 'active' && "active",
                  step.status === 'completed' && "completed",
                  step.status === 'pending' && "border-muted text-muted-foreground"
                )}
              >
                {step.status === 'completed' && <Check className="w-5 h-5" />}
                {step.status === 'active' && <Loader2 className="w-5 h-5 animate-spin" />}
                {step.status === 'pending' && <span className="text-sm font-medium">{step.id}</span>}
              </div>
              <div className="mt-2 text-center">
                <p className={cn(
                  "text-xs font-medium",
                  step.status === 'active' && "text-primary",
                  step.status === 'completed' && "text-success",
                  step.status === 'pending' && "text-muted-foreground"
                )}>
                  {step.name}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{step.description}</p>
              </div>
            </div>

            {/* Connector */}
            {index < steps.length - 1 && (
              <div className="flex-1 flex items-center justify-center px-2 -mt-6">
                <div className={cn(
                  "h-0.5 flex-1 transition-colors duration-500",
                  step.status === 'completed' ? "bg-success" : "bg-muted"
                )} />
                <ArrowRight className={cn(
                  "w-4 h-4 mx-1 transition-colors duration-500",
                  step.status === 'completed' ? "text-success" : "text-muted"
                )} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}