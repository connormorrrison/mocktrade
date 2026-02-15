import { type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/mocktrade-logo.png";
import SlideUpAnimation from "@/components/SlideUpAnimation";
import { Button1 } from "@/components/Button1";
import { Button2 } from "@/components/Button2";

interface PublicLayoutProps {
  children: ReactNode;
  showAuthButtons?: boolean; // new optional prop to control button visibility
}

export function PublicLayout({ children, showAuthButtons = true }: PublicLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-screen bg-background">
      {showAuthButtons ? (
        <div
          className="relative z-20 flex flex-col items-center gap-3 p-4 pt-[calc(max(16px,env(safe-area-inset-top))+32px)] lg:fixed lg:top-0 lg:left-0 lg:right-0 lg:flex-row lg:justify-between lg:p-8"
        >
          <Link to="/">
            <img src={logo} alt="MockTrade" className="h-12 w-auto cursor-pointer" />
          </Link>
          <div className="flex gap-2 lg:gap-4">
            <Link to="/login">
              <Button2>Login</Button2>
            </Link>
            <Link to="/signup">
              <Button1>Sign Up</Button1>
            </Link>
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate(-1)}
          className="fixed top-4 left-4 lg:top-8 lg:left-8 z-20 !flex !items-center !justify-center !p-2 !text-white !bg-zinc-800/55 !border !border-[oklch(1_0_0_/_10%)] !rounded-xl hover:!bg-zinc-700 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
      )}
      
      <SlideUpAnimation>
        {children}
      </SlideUpAnimation>
    </div>
  );
}