import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/mocktrade-logo.png";
import SlideUpAnimation from "@/components/slide-up-animation";
import { Button1 } from "@/components/button-1";
import { Button2 } from "@/components/button-2";

interface PublicLayoutProps {
  children: ReactNode;
  showAuthButtons?: boolean; // New optional prop to control button visibility
}

export function PublicLayout({ children, showAuthButtons = true }: PublicLayoutProps) {
  return (
    <div className="min-h-screen w-screen bg-background">
      {/* Logo - Fixed Position */}
      <div className="fixed top-8 left-8 z-20">
        <Link to="/">
          <img src={logo} alt="MockTrade" className="h-12 w-auto cursor-pointer" />
        </Link>
      </div>

      {/* Top Navigation Buttons - Fixed Position and Conditional Rendering */}
      {showAuthButtons && ( // Conditionally render the button div
        <div className="fixed top-8 right-8 z-20"> {/* Changed absolute to fixed */}
          <div className="flex gap-4">
            <Link to="/signup">
              <Button1>Sign Up</Button1>
            </Link>
            <Link to="/login">
              <Button2>Login</Button2>
            </Link>
          </div>
        </div>
      )}
      
      <SlideUpAnimation>
        {children}
      </SlideUpAnimation>
    </div>
  );
}