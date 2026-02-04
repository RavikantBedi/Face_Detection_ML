import { useState, useCallback } from 'react';
import { Upload, ScanFace, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FaceUploadZoneProps {
  onImageSelect?: (file: File) => void;
  className?: string;
}

export function FaceUploadZone({ onImageSelect, className }: FaceUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  }, []);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setScanning(true);
    onImageSelect?.(file);

    // Simulate scanning animation
    setTimeout(() => setScanning(false), 2500);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setScanning(false);
  };

  return (
    <div
      className={cn(
        "relative rounded-xl border-2 border-dashed transition-all duration-300 overflow-hidden",
        isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
        className
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {previewUrl ? (
        <div className="relative aspect-square">
          {/* Face frame corners */}
          <div className="face-frame absolute inset-4 pointer-events-none" />
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="w-5 h-5 border-l-[3px] border-b-[3px] border-primary rounded-bl" />
            <div className="w-5 h-5 border-r-[3px] border-b-[3px] border-primary rounded-br" />
          </div>

          {/* Image */}
          <img
            src={previewUrl}
            alt="Uploaded face"
            className="w-full h-full object-cover"
          />

          {/* Scanner overlay */}
          {scanning && (
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute left-0 right-0 h-1 scanner-line animate-scan" />
              <div className="absolute inset-0 bg-primary/5" />
            </div>
          )}

          {/* Status badge */}
          <div className={cn(
            "absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
            scanning 
              ? "bg-primary/20 text-primary border border-primary/30" 
              : "bg-success/20 text-success border border-success/30"
          )}>
            <ScanFace className="w-3.5 h-3.5" />
            {scanning ? "Scanning..." : "Ready"}
          </div>

          {/* Clear button */}
          <Button
            size="icon"
            variant="secondary"
            className="absolute bottom-4 right-4"
            onClick={clearImage}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center p-8 cursor-pointer aspect-square">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
          />
          <div className={cn(
            "p-4 rounded-full mb-4 transition-all duration-300",
            isDragging ? "bg-primary/20" : "bg-muted"
          )}>
            {isDragging ? (
              <ImageIcon className="w-8 h-8 text-primary" />
            ) : (
              <Upload className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <p className="text-sm font-medium mb-1">
            {isDragging ? "Drop image here" : "Upload masked face image"}
          </p>
          <p className="text-xs text-muted-foreground text-center">
            Drag & drop or click to browse<br />
            PNG, JPG up to 10MB
          </p>
        </label>
      )}
    </div>
  );
}