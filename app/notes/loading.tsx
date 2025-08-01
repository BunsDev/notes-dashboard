"use client";

import { useEffect, useState } from "react";

export default function Loading() {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          return 0;
        }
        return prevProgress + 10;
      });
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
      <div className="relative w-24 h-24 mb-8">
        {/* Animated circle */}
        <div className="absolute inset-0 border-4 border-foreground/10 rounded-full" />
        <div 
          className="absolute inset-0 border-4 border-t-foreground rounded-full animate-spin"
          style={{ animationDuration: '1s' }}
        />
        
        {/* Logo or icon in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-foreground font-bold text-xl">N</span>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-48 h-1 bg-foreground/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-foreground transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <p className="mt-4 text-foreground/70 text-sm font-medium">Loading your notes...</p>
    </div>
  );
}
  