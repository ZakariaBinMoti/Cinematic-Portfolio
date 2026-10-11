"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MotionValue, useMotionValueEvent } from "framer-motion";

const FRAME_COUNT = 120;

const currentFrame = (index: number) =>
  `/sequence/frame_${index.toString().padStart(3, "0")}_delay-0.066s.webp`;

interface ScrollyCanvasProps {
  scrollYProgress: MotionValue<number>;
}

export default function ScrollyCanvas({ scrollYProgress }: ScrollyCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(FRAME_COUNT).fill(null));
  const rafId = useRef<number | null>(null);

  const renderFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d"); 
    if (!ctx) return;

    // Find requested frame, or closest available frame
    let img = imagesRef.current[index];
    if (!img) {
      for (let i = index - 1; i >= 0; i--) {
        if (imagesRef.current[i]) {
          img = imagesRef.current[i];
          break;
        }
      }
      if (!img) {
        for (let i = index + 1; i < FRAME_COUNT; i++) {
          if (imagesRef.current[i]) {
            img = imagesRef.current[i];
            break;
          }
        }
      }
    }

    if (!img) return;

    const nWidth = img.naturalWidth || img.width;
    const nHeight = img.naturalHeight || img.height;
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

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#07080b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
  }, []);

  // 1. Instant First Paint: Load Frame 0 and render immediately
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    }

    const firstImg = new Image();
    const handleFirstFrameReady = () => {
      imagesRef.current[0] = firstImg;
      renderFrame(0);
    };

    firstImg.onload = handleFirstFrameReady;
    firstImg.onerror = () => {
      console.warn("Frame 0 failed to load");
    };
    // Assign src AFTER listeners
    firstImg.src = currentFrame(0);

    // If cached, trigger immediately
    if (firstImg.complete) {
      handleFirstFrameReady();
    }

    // 2. Progressive background stream for remaining frames
    let cancelled = false;
    const streamRemainingFrames = async () => {
      for (let i = 1; i < FRAME_COUNT; i++) {
        if (cancelled) break;
        const img = new Image();
        img.onload = () => {
          imagesRef.current[i] = img;
        };
        img.src = currentFrame(i);

        if (img.complete) {
          imagesRef.current[i] = img;
        }

        // Throttle slightly so browser main thread stays silky smooth
        if (i % 4 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
      }
    };

    streamRemainingFrames();

    return () => {
      cancelled = true;
    };
  }, [renderFrame]);

  // Synchronize canvas painting with viewport scroll progress
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const safeLatest = isNaN(latest) ? 0 : latest;
    const frameIndex = Math.floor(safeLatest * FRAME_COUNT);
    const clampedIndex = Math.min(FRAME_COUNT - 1, Math.max(0, frameIndex));
    
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => renderFrame(clampedIndex));
  });

  // Handle window resizing seamlessly
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const progress = scrollYProgress.get() || 0;
        const frameIndex = Math.floor(progress * FRAME_COUNT);
        const clampedIndex = Math.min(FRAME_COUNT - 1, Math.max(0, frameIndex));
        
        if (rafId.current) cancelAnimationFrame(rafId.current);
        rafId.current = requestAnimationFrame(() => renderFrame(clampedIndex));
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [renderFrame, scrollYProgress]);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block origin-center z-0" />
  );
}
