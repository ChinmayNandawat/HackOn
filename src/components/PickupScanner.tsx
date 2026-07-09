"use client";

import React, { useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

export function PickupScanner({ onScan }: { onScan: (text: string) => void }) {
  useEffect(() => {
    let scanner: Html5Qrcode | null = null;
    
    // Add a slight delay to bypass React StrictMode's instant mount/unmount cycle
    const timer = setTimeout(() => {
      scanner = new Html5Qrcode("pickup-reader");
      scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        (text) => onScan(text),
        () => {}
      ).catch(err => {
        console.error("Camera start error:", err);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scanner) {
        try {
          // If scanner hasn't fully started, stop() will throw, so we catch it silently
          scanner.stop().then(() => scanner?.clear()).catch(() => {
             scanner?.clear();
          });
        } catch(e) {
          scanner.clear();
        }
      }
    };
  }, [onScan]);

  return <div id="pickup-reader" className="w-full w-full rounded-xl overflow-hidden bg-white [&>div]:border-none [&>div]:shadow-none" />;
}
