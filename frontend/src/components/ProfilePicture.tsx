import profileIcon from "@/assets/mocktrade-icon.png";

interface ProfilePictureProps {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProfilePicture({ src, alt = "Profile", size = "md", className = "" }: ProfilePictureProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10", 
    lg: "w-12 h-12"
  };

  return (
    <div className={`${sizeClasses[size]} bg-white rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${className}`}>
      <img 
        src={src || profileIcon} 
        alt={alt} 
        className={`${size === "sm" ? "w-6 h-6" : size === "md" ? "w-8 h-8" : "w-10 h-10"} rounded-full object-cover`} 
      />
    </div>
  );
}