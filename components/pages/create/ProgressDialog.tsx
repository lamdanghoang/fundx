"use client";

import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type SubmissionStep = {
  id: string;
  label: string;
  status: "pending" | "processing" | "complete" | "error";
};

interface ProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  steps: SubmissionStep[];
  currentStep: number;
  errorMessage: string;
  isSuccess: boolean;
  onRetry: () => void;
}

export function ProgressDialog({
  open,
  onOpenChange,
  steps,
  currentStep,
  errorMessage,
  isSuccess,
  onRetry,
}: ProgressDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Creating Your Campaign</DialogTitle>
          <DialogDescription>
            Please wait while we process your campaign creation.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {step.status === "pending" && (
                    <div className="h-8 w-8 rounded-full border-2 border-muted flex items-center justify-center text-muted-foreground">
                      {index + 1}
                    </div>
                  )}
                  {step.status === "processing" && (
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  )}
                  {step.status === "complete" && (
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  )}
                  {step.status === "error" && (
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-700">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <p
                    className={`font-medium ${
                      currentStep === index
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.status === "error" && index === currentStep && (
                    <p className="text-sm text-red-600">Failed</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {errorMessage && (
            <div className="mt-6 bg-red-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{errorMessage}</p>
                  </div>
                  <div className="mt-4">
                    <Button
                      type="button"
                      onClick={onRetry}
                      size="sm"
                      variant="destructive"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isSuccess && (
            <div className="mt-6 bg-green-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Success
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Your campaign has been created successfully!</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
