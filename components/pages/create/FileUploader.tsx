"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, Check, AlertCircle, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { storeImageFile } from "@/lib/api";

interface MultiFileUploaderProps {
  onFilesUploaded: (urls: string[]) => void;
  maxFiles?: number;
  accept?: string;
  id: string;
  uploadEndpoint?: string;
  maxSizeInBytes?: number;
}

export default function MultiFileUploader({
  onFilesUploaded,
  maxFiles = 10,
  accept = "image/*",
  id,
  uploadEndpoint = `${process.env.NEXT_PUBLIC_PUBLISHER}/v1/blobs?epochs=5`,
  maxSizeInBytes = 5 * 1024 * 1024, // 5MB default
}: MultiFileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if too many files are selected
    if (files.length + selectedFiles.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} files at once.`);
      return;
    }

    // Clear any previous errors
    setError(null);

    // Convert FileList to array and check file sizes
    const newFiles: File[] = [];
    const oversizedFiles: string[] = [];

    for (let i = 0; i < files.length; i++) {
      if (files[i].size > maxSizeInBytes) {
        oversizedFiles.push(files[i].name);
      } else {
        newFiles.push(files[i]);
      }
    }

    if (oversizedFiles.length > 0) {
      setError(
        `Some files exceed the ${
          maxSizeInBytes / (1024 * 1024)
        }MB limit: ${oversizedFiles.join(", ")}`
      );
    }

    // Add new files to selected files
    setSelectedFiles((prev) => [...prev, ...newFiles]);

    // Reset the input so the same files can be selected again if needed
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    setError(null);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadComplete(false);
    setError(null);
    setUploadProgress(0);
    setUploadedCount(0);

    const urls: string[] = [];
    const failedUploads: string[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      try {
        const url = await storeImageFile(uploadEndpoint, selectedFiles[i]);
        urls.push(url);
        setUploadedCount((prev) => prev + 1);
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      } catch (error) {
        console.error(`Failed to upload ${selectedFiles[i].name}:`, error);
        failedUploads.push(selectedFiles[i].name);
      }
    }

    setIsUploading(false);

    if (failedUploads.length > 0) {
      setError(
        `Failed to upload ${failedUploads.length} file(s): ${failedUploads.join(
          ", "
        )}`
      );
    }

    if (urls.length > 0) {
      setUploadComplete(true);
      onFilesUploaded(urls);
    }

    // Keep only the failed files in the selected files list
    if (failedUploads.length > 0) {
      setSelectedFiles((prev) =>
        prev.filter((file) => failedUploads.includes(file.name))
      );
    } else {
      setSelectedFiles([]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileList = e.dataTransfer.files;

      // Check if too many files are being added
      if (fileList.length + selectedFiles.length > maxFiles) {
        setError(`You can only upload up to ${maxFiles} files at once.`);
        return;
      }

      // Process the dropped files
      const newFiles: File[] = [];
      const oversizedFiles: string[] = [];

      for (let i = 0; i < fileList.length; i++) {
        if (fileList[i].size > maxSizeInBytes) {
          oversizedFiles.push(fileList[i].name);
        } else {
          newFiles.push(fileList[i]);
        }
      }

      if (oversizedFiles.length > 0) {
        setError(
          `Some files exceed the ${
            maxSizeInBytes / (1024 * 1024)
          }MB limit: ${oversizedFiles.join(", ")}`
        );
      }

      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className="border-2 border-dashed rounded-lg p-6 text-center"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isUploading ? (
        <div className="space-y-4">
          <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin" />
          <div>
            <p className="text-sm font-medium">Uploading files...</p>
            <p className="text-xs text-muted-foreground">
              {uploadedCount} of {selectedFiles.length} files uploaded
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
              setSelectedFiles([]);
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
            You can upload up to {maxFiles} files at once (Recommended size:
            1200x630px, max {maxSizeInBytes / (1024 * 1024)}MB each)
          </p>

          {error && (
            <div className="mt-2 flex items-center justify-center gap-1 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

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

          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">
                  Selected Files ({selectedFiles.length})
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFiles}
                  className="h-8 px-2 text-xs"
                >
                  Clear All
                </Button>
              </div>

              <div className="max-h-40 overflow-y-auto bg-muted/50 rounded-md">
                <ul className="divide-y divide-border">
                  {selectedFiles.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between px-3 py-2 text-sm"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className="truncate max-w-[150px] sm:max-w-[250px]">
                          {file.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({formatFileSize(file.size)})
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                type="button"
                className="mt-4 w-full sm:w-auto"
                onClick={handleUpload}
                disabled={selectedFiles.length === 0}
              >
                Upload {selectedFiles.length} File
                {selectedFiles.length !== 1 ? "s" : ""}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
