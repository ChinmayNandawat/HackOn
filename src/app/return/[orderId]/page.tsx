import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ReturnFlowPage({ params }: { params: { orderId: string } }) {
  return (
    <div className="max-w-md mx-auto space-y-6 bg-slate-950 text-white min-h-[80vh] p-4 rounded-xl">
      <div className="flex items-center justify-between">
        <Link href="/orders" className="text-slate-400">✕ Cancel</Link>
        <span className="font-semibold">Return Order</span>
        <span className="w-10"></span>
      </div>

      <div>
        <label className="text-sm text-slate-400">Reason for return</label>
        <select className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 mt-1 text-white">
          <option>Wrong size</option>
          <option>Damaged</option>
          <option>Changed mind</option>
        </select>
      </div>

      <div className="relative h-96 bg-black rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center">
        <span className="text-slate-500">Camera Viewfinder</span>
        <div className="absolute top-2 right-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs border border-green-500/50">
          ✅ Perfect capture
        </div>
      </div>

      <div className="flex justify-between text-sm text-slate-400">
        <span className="text-white font-semibold border-b-2 border-white pb-1">Front</span>
        <span>Back</span>
        <span>Top/Side</span>
        <span>Close-up</span>
      </div>

      <div className="flex justify-center pt-4">
        <button className="w-16 h-16 rounded-full bg-white border-4 border-slate-400"></button>
      </div>

      <Link href="/returns" className="block mt-4">
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Submit Return</Button>
      </Link>
    </div>
  );
}
