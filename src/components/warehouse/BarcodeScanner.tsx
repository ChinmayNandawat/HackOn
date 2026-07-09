"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, Camera } from "lucide-react";
import { createPortal } from "react-dom";

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Use Html5Qrcode directly for instant camera access without extra UI button
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    html5QrCode.start(
      { facingMode: "environment" }, // Prefer back camera
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      (decodedText) => {
        onScan(decodedText);
      },
      (errorMessage) => {
        // ignore
      }
    ).catch((err) => {
      console.error("Camera start error:", err);
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
        }).catch(console.error);
      }
    };
  }, [isMounted, onScan]);

  if (!isMounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl overflow-hidden w-full max-w-md shadow-2xl relative">
        <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-800">Scan Package Label</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-slate-700" />
          </button>
        </div>
        
        <div className="p-4 flex justify-center">
          {/* html5-qrcode targets this specific ID */}
          <div id="reader" className="w-full max-w-sm rounded-xl overflow-hidden" />
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-sm font-medium text-slate-500">
            Point your camera at the AWB barcode or QR code.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
