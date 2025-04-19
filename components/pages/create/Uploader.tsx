"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface MultiFileUploaderProps {
  onFilesUploaded: (urls: string[]) => void;
  maxFiles?: number;
  accept?: string;
  id: string;
}

export default function MultiFileUploader({
  onFilesUploaded,
  maxFiles = 10,
  accept = "image/*",
  id,
}: MultiFileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleFileUpload = async (file: File): Promise<string> => {
    try {
      // In a real implementation, you would upload to a server
      // This is a simulated upload that returns a placeholder URL
      return new Promise((resolve) => {
        setTimeout(() => {
          const imageUrl = `/placeholder.svg?height=200&width=200&text=${encodeURIComponent(
            file.name
          )}`;
          resolve(imageUrl);
        }, 500);
      });
    } catch (error) {
      console.error("Upload error:", error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Upload failed");
    }
  };

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if too many files are selected
    if (files.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} files at once.`);
      return;
    }

    setIsUploading(true);
    setUploadComplete(false);
    setError(null);
    setUploadProgress(0);
    setUploadedCount(0);
    setTotalFiles(files.length);

    const urls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const url = await handleFileUpload(files[i]);
        urls.push(url);
        setUploadedCount((prev) => prev + 1);
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to upload some files"
        );
      }
    }

    setIsUploading(false);
    setUploadComplete(true);

    if (urls.length > 0) {
      onFilesUploaded(urls);
    }

    // Reset the input so the same files can be selected again if needed
    e.target.value = "";
  };

  return (
    <div className="border-2 border-dashed rounded-lg p-6 text-center">
      {isUploading ? (
        <div className="space-y-4">
          <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin" />
          <div>
            <p className="text-sm font-medium">Uploading files...</p>
            <p className="text-xs text-muted-foreground">
              {uploadedCount} of {totalFiles} files uploaded
            </p>
          </div>
          <Progress
            value={uploadProgress}
            className="h-2 w-full max-w-md mx-auto"
          />
        </div>
      ) : uploadComplete ? (
        <div className="space-y-4">
          <Check className="h-8 w-8 mx-auto text-green-500" />
          <div>
            <p className="text-sm font-medium">Upload complete!</p>
            <p className="text-xs text-muted-foreground">
              {uploadedCount} files uploaded successfully
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setUploadComplete(false);
              setUploadedCount(0);
            }}
          >
            Upload More Files
          </Button>
        </div>
      ) : (
        <>
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-2">
            Drag and drop multiple files, or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            You can upload up to {maxFiles} files at once (max 5MB each)
          </p>

          {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}

          <div className="mt-4">
            <Input
              type="file"
              accept={accept}
              className="hidden"
              id={id}
              onChange={handleFilesChange}
              disabled={isUploading}
              multiple
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById(id)?.click()}
              disabled={isUploading}
            >
              Select Files
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
