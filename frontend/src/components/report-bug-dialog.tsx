import { useState } from "react";
import { Bug, X } from "lucide-react";
import { Button1 } from "@/components/button-1";
import { Button2 } from "@/components/button-2";
import { TextField } from "@/components/text-field";
import { Text3 } from "@/components/text-3";
import { ErrorTile } from "@/components/error-tile";
import {
  AlertDialog,
  AlertDialogContent,
} from "@/components/ui/alert-dialog";

interface ReportBugDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportBugDialog({ isOpen, onOpenChange }: ReportBugDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      setError("Please fill in both title and description");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would typically send to your bug tracking system
      console.log('Bug report submitted:', { title, description, email });
      
      // Reset form and close dialog immediately after successful submission
      setTitle("");
      setDescription("");
      setEmail("");
      onOpenChange?.(false);
      
    } catch (err) {
      setError("Failed to submit bug report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle("");
      setDescription("");
      setEmail("");
      setError("");
      onOpenChange?.(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bug className="text-orange-600" />
              <Text3>Report a Bug</Text3>
            </div>
            <Button2 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button2>
          </div>

            <>
              {/* Error Display */}
              {error && <ErrorTile description={error} />}

              {/* Form */}
              <div className="space-y-4">
                <TextField
                  label="Bug Title"
                  placeholder="Brief description of the issue"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                />

                <TextField
                  label="Bug Description"
                  multiline={true}
                  rows={4}
                  placeholder="Please describe the bug in detail, including steps to reproduce..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                />

                <TextField
                  label="Email (Optional)"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* Actions */}
              <div className="flex">
                <Button1 
                  onClick={handleSubmit}
                  disabled={isSubmitting || !title.trim() || !description.trim()}
                  className="w-full"
                >
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </Button1>
              </div>
            </>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}