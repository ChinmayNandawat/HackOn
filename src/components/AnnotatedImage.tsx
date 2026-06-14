"use client";

import { useEffect, useRef } from "react";

export interface Flaw {
  name: string;
  severity: "minor" | "moderate" | "major";
  x_percent: number;
  y_percent: number;
  width_percent: number;
  height_percent: number;
}

interface AnnotatedImageProps {
  imageUrl: string;
  flaws: Flaw[];
  width?: number;
  height?: number;
}

export default function AnnotatedImage({
  imageUrl,
  flaws,
  width = 400,
  height = 400,
}: AnnotatedImageProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw flaws onto the canvas
  useEffect(() => {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!img) return;

    const draw = () => {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Match canvas dimensions to the exact rendered dimensions of the image
      canvas.width = img.clientWidth || width;
      canvas.height = img.clientHeight || height;

      // Clear the canvas context
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!flaws || flaws.length === 0) {
        return;
      }

      flaws.forEach((flaw) => {
        // Calculate pixel coordinates from percentage values. Fallback to parseFloat if AI returns a string like '10%'
        const xP = parseFloat(flaw.x_percent as any) || 0;
        const yP = parseFloat(flaw.y_percent as any) || 0;
        const wP = parseFloat(flaw.width_percent as any) || 20;
        const hP = parseFloat(flaw.height_percent as any) || 20;

        const x = (xP / 100) * canvas.width;
        const y = (yP / 100) * canvas.height;
        const w = (wP / 100) * canvas.width;
        const h = (hP / 100) * canvas.height;

        // Choose color based on severity: major is red, moderate is amber, minor is gray
        let color = "#6B7280"; // minor: gray
        if (flaw.severity === "major") {
          color = "#EF4444"; // major: red
        } else if (flaw.severity === "moderate") {
          color = "#F59E0B"; // moderate: amber
        }

        // Draw rectangle stroke with no fill (2px stroke width)
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);

        // Measure text for label background sizing
        ctx.font = "bold 11px sans-serif";
        const textWidth = ctx.measureText(flaw.name).width;
        const labelHeight = 18;
        const labelPadding = 6;
        const labelWidth = textWidth + labelPadding * 2;

        // Draw small filled label background at 90 percent opacity
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.9;
        ctx.fillRect(x, y, labelWidth, labelHeight);

        // Draw flaw name text inside label in white 11px sans-serif font
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = "#FFFFFF";
        ctx.textBaseline = "middle";
        ctx.fillText(flaw.name, x + labelPadding, y + labelHeight / 2);
      });
    };

    // Wait for the image to load using the img element's onload event
    if (img.complete) {
      draw();
    } else {
      img.onload = () => {
        draw();
      };
    }

    // Handle window resizing dynamically to recalculate canvas overlay size
    const handleResize = () => {
      draw();
    };
    window.addEventListener("resize", handleResize);

    // Cleanup: clear onload callback and resize listener
    return () => {
      img.onload = null;
      window.removeEventListener("resize", handleResize);
    };
  }, [imageUrl, flaws, width, height]);

  // Cleanup effect that clears the canvas when the component unmounts
  useEffect(() => {
    return () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, []);

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        maxWidth: `${width}px`,
        maxHeight: `${height}px`,
        aspectRatio: "1/1",
      }}
    >
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Annotated Return"
        className="w-full h-full object-cover"
      />
      {flaws && flaws.length > 0 && (
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
      )}
    </div>
  );
}
