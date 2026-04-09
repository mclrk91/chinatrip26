"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, ImageIcon, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export type ExtractionStep = 1 | 2 | 3 | 4;

interface FileDropzoneProps {
  onFileAccepted: (file: File) => void;
  isUploading: boolean;
  extractionStep?: ExtractionStep;
}

const STEP_LABELS: Record<ExtractionStep, string> = {
  1: "Uploading file...",
  2: "Analyzing document...",
  3: "Extracting booking details...",
  4: "Ready for review",
};

function StepIndicator({ currentStep }: { currentStep: ExtractionStep }) {
  return (
    <div className="space-y-2 text-left w-full max-w-xs mx-auto">
      {([1, 2, 3, 4] as ExtractionStep[]).map((step) => {
        const isDone = step < currentStep;
        const isActive = step === currentStep;
        const isPending = step > currentStep;

        return (
          <div
            key={step}
            className={`flex items-center gap-2 text-sm ${
              isPending ? "text-muted-foreground/50" : "text-foreground"
            }`}
          >
            {isDone ? (
              <CheckCircle2 className="h-4 w-4 text-jade flex-shrink-0" />
            ) : isActive ? (
              <Loader2 className="h-4 w-4 text-china-red animate-spin flex-shrink-0" />
            ) : (
              <div className="h-4 w-4 rounded-full border border-muted-foreground/30 flex-shrink-0" />
            )}
            <span className={isActive ? "font-medium" : ""}>
              Step {step}: {STEP_LABELS[step]}
              {isDone && " ✓"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function FileDropzone({ onFileAccepted, isUploading, extractionStep }: FileDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (file.size > MAX_FILE_SIZE) {
          const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
          toast.error(
            `This file is too large (${sizeMB}MB). Maximum size is 10MB. Try taking a screenshot instead.`
          );
          return;
        }
        onFileAccepted(file);
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/heic": [".heic"],
      "image/heif": [".heif"],
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    disabled: isUploading,
  });

  const file = acceptedFiles[0];

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors min-h-[200px] flex flex-col items-center justify-center ${
        isDragActive
          ? "border-china-red bg-red-50"
          : isUploading
          ? "border-gray-300 bg-gray-50 cursor-not-allowed"
          : "border-gray-300 hover:border-china-red hover:bg-red-50/30"
      }`}
    >
      <input {...getInputProps()} />

      {isUploading ? (
        <div className="space-y-4 w-full">
          <StepIndicator currentStep={extractionStep || 1} />
        </div>
      ) : file ? (
        <div className="space-y-3">
          {file.type.startsWith("image/") ? (
            <ImageIcon className="h-10 w-10 text-china-red mx-auto" />
          ) : (
            <FileText className="h-10 w-10 text-china-red mx-auto" />
          )}
          <p className="text-lg font-medium">{file.name}</p>
          <p className="text-muted-foreground">
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <p className="text-lg font-medium">
              {isDragActive ? "Drop your file here" : "Drag a file here or tap to browse"}
            </p>
            <p className="text-muted-foreground mt-1">
              PDF, JPG, PNG, or HEIC (from iPhone)
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Maximum file size: 10MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
