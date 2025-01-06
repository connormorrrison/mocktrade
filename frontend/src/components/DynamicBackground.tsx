import React, { useEffect, useState } from 'react';

const DynamicBackground = ({ children }: { children: React.ReactNode }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 min-h-screen w-full overflow-hidden bg-[#1431F9]/5">
      {/* Extended container for background elements */}
      <div className="absolute inset-[-10%] scale-110">
        {/* Smooth gradient background */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-[#1431F9]/40 via-blue-600/30 to-purple-500/30 animate-gradient-slow"
          style={{
            transform: `translate(${mousePosition.x / 20}px, ${mousePosition.y / 20}px)`,
          }}
        />

        {/* Floating orbs with extended positions */}
        <div className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] bg-[#1431F9]/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float-1" />
        <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-[#1431F9]/30 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-float-2" />
        <div className="absolute -bottom-1/4 left-1/3 w-[900px] h-[900px] bg-[#1431F9]/35 rounded-full mix-blend-multiply filter blur-3xl opacity-65 animate-float-3" />
        <div className="absolute top-1/3 right-1/3 w-[700px] h-[700px] bg-[#1431F9]/25 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float-4" />
        <div className="absolute -bottom-1/4 right-1/2 w-[800px] h-[800px] bg-[#1431F9]/30 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-float-5" />
        <div className="absolute top-3/4 -right-1/4 w-[750px] h-[750px] bg-[#1431F9]/35 rounded-full mix-blend-multiply filter blur-3xl opacity-55 animate-float-6" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default DynamicBackground;