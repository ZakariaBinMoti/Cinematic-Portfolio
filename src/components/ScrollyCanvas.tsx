"use client";

import { useEffect, useRef, useState } from "react";
import { MotionValue, useMotionValueEvent } from "framer-motion";

const FRAME_COUNT = 120;

const currentFrame = (index: number) =>
  `/sequence/frame_${index.toString().padStart(3, "0")}_delay-0.066s.webp`;

interface ScrollyCanvasProps {
  scrollYProgress: MotionValue<number>;
}

export default function ScrollyCanvas({ scrollYProgress }: ScrollyCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const rafId = useRef<number | null>(null);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    let loadedCount = 0;
    
    // Set initial size immediately
    if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
    }

    const preloadedImages: HTMLImageElement[] = [];

    for (let i = 0; i < FRAME_COUNT; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        
        const checkCompletion = () => {
            loadedCount++;
            setLoadProgress(Math.floor((loadedCount / FRAME_COUNT) * 100));
            
            if (loadedCount === FRAME_COUNT) {
                imagesRef.current = preloadedImages;
                setIsLoaded(true);
                
                // Fire initial frame correctly synced to scroll position
                const progress = scrollYProgress.get() || 0;
                const frameIndex = Math.floor(progress * FRAME_COUNT);
                const clampedIndex = Math.min(FRAME_COUNT - 1, Math.max(0, frameIndex));
                
                if (rafId.current) cancelAnimationFrame(rafId.current);
                rafId.current = requestAnimationFrame(() => renderFrame(clampedIndex));
            }
        };

        img.onload = checkCompletion;
        img.onerror = () => {
            console.error(`ScrollyCanvas: Failed to preload frame ${i}`);
            // Count it anyway so we don't get stuck indefinitely
            checkCompletion(); 
        };
        
        preloadedImages[i] = img;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderFrame = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Remove alpha false just in case it bugs transparency handling in Safari/WebP
    const ctx = canvas.getContext("2d"); 
    if (!ctx) return;

    const img = imagesRef.current[index];
    if (!img) return;

    // Use naturalWidth for guaranteed accurate off-DOM sizing
    const nWidth = img.naturalWidth || img.width;
    const nHeight = img.naturalHeight || img.height;

    // If the image is hopelessly broken, skip paint to save the previous functional frame
    if (!nWidth || !nHeight) return;

    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = nWidth / nHeight;
    let renderWidth = canvas.width;
    let renderHeight = canvas.height;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      renderHeight = canvas.width / imgRatio;
      offsetY = (canvas.height - renderHeight) / 2;
    } else {
      renderWidth = canvas.height * imgRatio;
      offsetX = (canvas.width - renderWidth) / 2;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background filling gap
    ctx.fillStyle = "#121212";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Paint frame
    ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
  };

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (!isLoaded || imagesRef.current.length === 0) return;
    
    // Safely parse NaN explicitly
    const safeLatest = isNaN(latest) ? 0 : latest;
    
    const frameIndex = Math.floor(safeLatest * FRAME_COUNT);
    const clampedIndex = Math.min(FRAME_COUNT - 1, Math.max(0, frameIndex));
    
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => renderFrame(clampedIndex));
  });

  useEffect(() => {
    const handleResize = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            if (isLoaded) {
                const progress = scrollYProgress.get() || 0;
                const frameIndex = Math.floor(progress * FRAME_COUNT);
                const clampedIndex = Math.min(FRAME_COUNT - 1, Math.max(0, frameIndex));
                
                if (rafId.current) cancelAnimationFrame(rafId.current);
                rafId.current = requestAnimationFrame(() => renderFrame(clampedIndex));
            }
        }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isLoaded, scrollYProgress]);

  return (
    <>
      {!isLoaded && (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-[#121212] text-white">
          <div className="w-48 md:w-64 h-1 bg-white/20 rounded-full overflow-hidden mb-6">
            <div 
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <p className="text-xs md:text-sm font-medium tracking-widest uppercase text-gray-400 animate-pulse">
            LOADING EXPERIENCE {loadProgress}%
          </p>
        </div>
      )}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block origin-center" />
    </>
  );
}
