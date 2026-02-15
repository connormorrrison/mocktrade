import { useEffect, useRef } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void;
  onStart?: () => void;
  text?: "signin_with" | "signup_with" | "continue_with";
}

export function GoogleSignInButton({ onSuccess, onStart, text = "signin_with" }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderBtn = () => {
      if (!window.google || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (response: { credential: string }) => {
          onStart?.();
          onSuccess(response.credential);
        },
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "pill",
        text,
        width: buttonRef.current.offsetWidth,
      });
    };

    // GIS script may still be loading
    if (window.google) {
      renderBtn();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          renderBtn();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [onSuccess, text]);

  return <div ref={buttonRef} className="w-full flex justify-center" />;
}
