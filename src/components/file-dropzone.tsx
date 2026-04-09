"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, ImageIcon } from "lucide-react";

interface FileDropzoneProps {
  onFileAccepted: (file: File) => void;
  isUploading: boolean;
}

export function FileDropzone({ onFileAccepted, isUploading }: FileDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileAccepted(acceptedFiles[0]);
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
    disabled: isUploading,
  });

  const file = acceptedFiles[0];

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors min-h-[200px] flex flex-col items-center justify-center ${
        isDragActive
          ? "border-brand-red bg-brand-lightred"
          : isUploading
          ? "border-brand-border bg-brand-cardbg cursor-not-allowed"
          : "border-brand-border hover:border-brand-red hover:bg-brand-lightred/30"
      }`}
    >
      <input {...getInputProps()} />

      {isUploading ? (
        <div className="space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-red mx-auto" />
          <p className="text-lg text-muted-foreground">Processing your file...</p>
        </div>
      ) : file ? (
        <div className="space-y-3">
          {file.type.startsWith("image/") ? (
            <ImageIcon className="h-10 w-10 text-brand-red mx-auto" />
          ) : (
            <FileText className="h-10 w-10 text-brand-red mx-auto" />
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
          </div>
        </div>
      )}
    </div>
  );
}
