const fs = require('fs');

let content = fs.readFileSync('src/app/pickup/page.tsx', 'utf8');

// 1. Add Import
content = content.replace(
  'import AnnotatedImage from "@/components/AnnotatedImage";',
  'import AnnotatedImage from "@/components/AnnotatedImage";\nimport { Html5Qrcode } from "html5-qrcode";'
);

// 2. Add Component Definition at the end
const componentDef = `
function PickupScanner({ onScan }: { onScan: (text: string) => void }) {
  React.useEffect(() => {
    let isCleanedUp = false;
    const scanner = new Html5Qrcode("pickup-reader");
    
    scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
      (text) => onScan(text),
      () => {}
    ).catch(err => {
      console.error("Camera start error:", err);
    });

    return () => {
      isCleanedUp = true;
      scanner.stop().then(() => scanner.clear()).catch(console.error);
    };
  }, [onScan]);

  return <div id="pickup-reader" className="w-full w-full rounded-xl overflow-hidden bg-white [&>div]:border-none [&>div]:shadow-none" />;
}
`;

content = content.replace('  );\n}\n', '  );\n}\n\n' + componentDef);

// 3. Replace dummy UI with active scanner
const targetUI = `<div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl h-40 flex items-center justify-center mb-6 relative overflow-hidden">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-blue-500/50 shadow-[0_0_12px_rgba(59,130,246,0.8)] animate-[pulse_1.5s_ease-in-out_infinite]"></div>
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(59,130,246,0.05)_50%,transparent_100%)] animate-[pulse_2s_ease-in-out_infinite]"></div>
              <p className="text-slate-400 font-bold text-sm z-10">Align barcode within frame</p>
            </div>`;

const newUI = `<div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl min-h-[200px] flex items-center justify-center mb-6 relative overflow-hidden p-2">
              <PickupScanner onScan={(text) => {
                const match = pickups.find(p => getAWB(p.id) === text);
                if (match) {
                  setScannerOpen(false);
                  setScannedAwb("");
                  handleSelectPickup(match);
                } else {
                  alert("AWB not found in today's route.");
                }
              }} />
            </div>`;

content = content.replace(targetUI, newUI);

fs.writeFileSync('src/app/pickup/page.tsx', content);
console.log('Successfully fixed pickup/page.tsx');
