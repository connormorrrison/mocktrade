import { useState } from "react";
import { Bug } from "lucide-react";
import { TextField } from "@/components/TextField";
import { Text3 } from "@/components/Text3";
import { CustomError } from "@/components/CustomError";
import { CustomAlertDialog, AlertDialogHeader, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/CustomAlertDialog";

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

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      setError("Please fill in both title and description");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Include auth token if available (optional)
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/bugs/report`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          email: email.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Check for validation errors
        if (response.status === 422 && errorData.detail) {
          // Handle Pydantic validation errors
          const validationErrors = errorData.detail;
          if (Array.isArray(validationErrors)) {
            const emailError = validationErrors.find((err: any) =>
              err.loc && err.loc.includes('email')
            );
            if (emailError) {
              throw new Error('Invalid email format');
            }
          }
        }

        throw new Error(errorData.detail || 'Failed to submit bug report');
      }

      // Reset form and close dialog immediately after successful submission
      setTitle("");
      setDescription("");
      setEmail("");
      onOpenChange?.(false);

    } catch (err) {
      console.error('Error submitting bug report:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to submit bug report. Please try again.");
      }
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
    <CustomAlertDialog isOpen={isOpen} onClose={handleClose}>
      <AlertDialogHeader>
        <div className="flex items-center gap-2">
          <Bug className="text-orange-600" />
          <Text3>Report a Bug</Text3>
        </div>
      </AlertDialogHeader>

      {/* Error Display */}
      <CustomError error={error} onClose={() => setError('')} />

      {/* Form */}
      <div className="space-y-4">
        <TextField
          label="Title"
          placeholder="Description of the issue"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
        />

        <TextField
          label="Description"
          multiline={true}
          rows={4}
          placeholder="Describe the bug in detail, including steps to reproduce..."
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

      <AlertDialogFooter>
        <AlertDialogCancel onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={handleSubmit}
          disabled={isSubmitting || !title.trim() || !description.trim()}
          className="!w-full"
        >
          {isSubmitting ? "Submitting..." : "Submit Report"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </CustomAlertDialog>
  );
}