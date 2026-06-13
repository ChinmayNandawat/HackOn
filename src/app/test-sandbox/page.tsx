"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestSandbox() {
  // Supabase Section State
  const [supabaseLoading, setSupabaseLoading] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<"IDLE" | "OK" | "FAILED">("IDLE");
  const [supabaseCount, setSupabaseCount] = useState<number | null>(null);
  const [supabaseFirstName, setSupabaseFirstName] = useState<string | null>(null);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  // S3 Section State
  const [s3Loading, setS3Loading] = useState(false);
  const [s3Status, setS3Status] = useState<"IDLE" | "OK" | "FAILED">("IDLE");
  const [s3FileUrl, setS3FileUrl] = useState<string | null>(null);
  const [s3Error, setS3Error] = useState<string | null>(null);

  // Bedrock Section State
  const [bedrockLoading, setBedrockLoading] = useState(false);
  const [bedrockStatus, setBedrockStatus] = useState<"IDLE" | "OK" | "FAILED">("IDLE");
  const [bedrockMessage, setBedrockMessage] = useState<string | null>(null);
  const [bedrockError, setBedrockError] = useState<string | null>(null);

  // System Debug State
  const [debugLoading, setDebugLoading] = useState(false);
  const [debugResult, setDebugResult] = useState<any>(null);
  const [debugError, setDebugError] = useState<string | null>(null);

  const handleSystemDebug = async () => {
    setDebugLoading(true);
    setDebugError(null);
    setDebugResult(null);
    try {
      const res = await fetch("/api/debug/bedrock");
      const data = await res.json();
      setDebugResult(data);
    } catch (e: any) {
      setDebugError(e.message || "Failed to run debug audit.");
    } finally {
      setDebugLoading(false);
    }
  };

  // Handler for Supabase check
  const handleSupabaseCheck = async () => {
    setSupabaseLoading(true);
    setSupabaseStatus("IDLE");
    setSupabaseError(null);
    setSupabaseCount(null);
    setSupabaseFirstName(null);

    try {
      // Fetch data from Supabase products table
      const { data, error, count } = await supabase
        .from("products")
        .select("title", { count: "exact" });

      if (error) {
        throw error;
      }

      setSupabaseCount(count ?? data.length);
      if (data && data.length > 0) {
        setSupabaseFirstName(data[0].title);
      } else {
        setSupabaseFirstName("(Table is empty)");
      }
      setSupabaseStatus("OK");
    } catch (err: any) {
      console.error("Supabase check error:", err);
      setSupabaseError(err?.message || "Failed to fetch from Supabase");
      setSupabaseStatus("FAILED");
    } finally {
      setSupabaseLoading(false);
    }
  };

  // Handler for S3 direct upload check
  const handleS3UploadCheck = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setS3Loading(true);
    setS3Status("IDLE");
    setS3Error(null);
    setS3FileUrl(null);

    try {
      // Step 1: Request S3 Presigned URL from next API
      const presignResponse = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      });

      if (!presignResponse.ok) {
        const errJson = await presignResponse.json();
        throw new Error(errJson.error || "Failed to get presigned upload URL.");
      }

      const { uploadUrl, fileUrl } = await presignResponse.json();

      // Step 2: Upload file directly to S3 via presigned PUT url
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error(`S3 direct upload failed with status ${uploadResponse.status}`);
      }

      setS3FileUrl(fileUrl);
      setS3Status("OK");
    } catch (err: any) {
      console.error("S3 upload check error:", err);
      setS3Error(err?.message || "Direct upload to S3 failed");
      setS3Status("FAILED");
    } finally {
      setS3Loading(false);
    }
  };

  // Handler for Bedrock check
  const handleBedrockCheck = async () => {
    setBedrockLoading(true);
    setBedrockStatus("IDLE");
    setBedrockError(null);
    setBedrockMessage(null);

    try {
      const response = await fetch("/api/test-ai");
      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to ping AWS Bedrock client API.");
      }

      const { message } = await response.json();
      setBedrockMessage(message);
      setBedrockStatus("OK");
    } catch (err: any) {
      console.error("Bedrock check error:", err);
      setBedrockError(err?.message || "Failed to query Claude model via Bedrock");
      setBedrockStatus("FAILED");
    } finally {
      setBedrockLoading(false);
    }
  };

  // --- Phase 2 State ---
  // Quality Check
  const [qcUrl, setQcUrl] = useState("");
  const [qcCategory, setQcCategory] = useState("footwear");
  const [qcLoading, setQcLoading] = useState(false);
  const [qcResult, setQcResult] = useState<{ pass: boolean; reason: string; failedChecks: string[] } | null>(null);
  const [qcError, setQcError] = useState<string | null>(null);

  // Grading
  const [gradingUrls, setGradingUrls] = useState("");
  const [gradingCategory, setGradingCategory] = useState("footwear");
  const [gradingLoading, setGradingLoading] = useState(false);
  const [gradingResult, setGradingResult] = useState<{
    grade: "A" | "B" | "C" | "D";
    score: number;
    flaws: { name: string; severity: "minor" | "moderate" | "major"; x_percent: number; y_percent: number; width_percent: number; height_percent: number }[];
    confidence: "high" | "medium" | "low";
    summary: string;
  } | null>(null);
  const [gradingError, setGradingError] = useState<string | null>(null);

  // Routing
  const [routePrice, setRoutePrice] = useState("");
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeResult, setRouteResult] = useState<{ decision: string; reasoning: string; estimatedResalePrice: number; confidenceScore: number } | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

  const handleQualityCheck = async () => {
    setQcLoading(true); setQcError(null); setQcResult(null);
    try {
      const res = await fetch("/api/quality-check", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: qcUrl, productCategory: qcCategory })
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed quality check");
      setQcResult(await res.json());
    } catch (e: any) { setQcError(e.message); } finally { setQcLoading(false); }
  };

  const handleGrading = async () => {
    setGradingLoading(true); setGradingError(null); setGradingResult(null);
    try {
      const urls = gradingUrls.split("\n").map(u => u.trim()).filter(Boolean).slice(0, 4);
      if (!urls.length) throw new Error("Provide at least one URL");
      const res = await fetch("/api/grade", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrls: urls, productCategory: gradingCategory })
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed grading");
      setGradingResult(await res.json());
    } catch (e: any) { setGradingError(e.message); } finally { setGradingLoading(false); }
  };

  const handleRouting = async () => {
    if (!gradingResult) return;
    setRouteLoading(true); setRouteError(null); setRouteResult(null);
    try {
      const price = parseFloat(routePrice);
      if (isNaN(price)) throw new Error("Invalid price");
      const res = await fetch("/api/route-decision", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: gradingResult.grade,
          score: gradingResult.score,
          confidence: gradingResult.confidence,
          flawSummary: gradingResult.summary,
          productCategory: gradingCategory,
          originalPrice: price
        })
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed routing");
      setRouteResult(await res.json());
    } catch (e: any) { setRouteError(e.message); } finally { setRouteLoading(false); }
  };

  return (
    <main className="p-8 max-w-2xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-6">ReLife Phase 1 Integration Sandbox</h1>
      <p className="text-sm text-gray-500 mb-8">
        This is an internal sandbox page used to verify services integration.
      </p>

      {/* System Debug Section */}
      <section className="mb-10 p-6 border-2 border-red-200 bg-red-50 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-red-900">System Debug Audit</h2>
          <button
            onClick={handleSystemDebug}
            disabled={debugLoading}
            className="px-5 py-2 bg-red-600 text-white rounded-md font-bold disabled:opacity-50 hover:bg-red-700 transition"
          >
            {debugLoading ? "Running Audit..." : "Run Full Debug Audit"}
          </button>
        </div>

        {debugError && <p className="text-red-600 font-bold mb-4">{debugError}</p>}
        
        {debugResult && (
          <div className="bg-white p-4 rounded border border-red-100 overflow-hidden">
            <h3 className="text-lg font-bold mb-4 text-slate-800">{debugResult.summary}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-3 border rounded">
                <div className="font-bold mb-1">1. Environment Vars {debugResult.envVars?.success ? "✅" : "❌"}</div>
              </div>
              <div className="p-3 border rounded">
                <div className="font-bold mb-1">2. Region Check {debugResult.regionCheck?.success ? "✅" : "❌"}</div>
              </div>
              <div className="p-3 border rounded">
                <div className="font-bold mb-1">3. Model ID Check {debugResult.modelIdCheck?.success ? "✅" : "❌"}</div>
              </div>
              <div className="p-3 border rounded">
                <div className="font-bold mb-1">4. Bedrock Text Ping {debugResult.bedrockTextPing?.success ? "✅" : "❌"}</div>
              </div>
              <div className="p-3 border rounded">
                <div className="font-bold mb-1">5. S3 Connectivity {debugResult.s3Check?.success ? "✅" : "❌"}</div>
              </div>
              <div className="p-3 border rounded">
                <div className="font-bold mb-1">6. Bedrock Vision Ping {debugResult.bedrockVisionPing?.success ? "✅" : "❌"}</div>
              </div>
            </div>

            <div className="bg-slate-900 text-green-400 p-4 rounded overflow-auto text-xs font-mono max-h-96">
              <pre className="whitespace-pre-wrap">{JSON.stringify(debugResult, null, 2)}</pre>
            </div>
          </div>
        )}
      </section>

      {/* Section 1: Supabase Check */}
      <section className="mb-8 p-4 border border-gray-200 rounded">
        <h2 className="text-lg font-semibold mb-3">Section 1: Supabase DB Check</h2>
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={handleSupabaseCheck}
            disabled={supabaseLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 text-sm font-medium"
          >
            {supabaseLoading ? "Checking..." : "Fetch Products"}
          </button>
          
          {supabaseStatus === "OK" && (
            <span className="text-green-600 font-bold text-sm">Supabase OK</span>
          )}
          {supabaseStatus === "FAILED" && (
            <span className="text-red-600 font-bold text-sm">Supabase FAILED</span>
          )}
        </div>
        
        {supabaseCount !== null && (
          <div className="text-sm space-y-1">
            <div><strong className="text-gray-700">Total Count:</strong> {supabaseCount}</div>
            <div><strong className="text-gray-700">First Product:</strong> {supabaseFirstName}</div>
          </div>
        )}
        
        {supabaseError && (
          <p className="text-sm text-red-500 mt-2">Error: {supabaseError}</p>
        )}
      </section>

      {/* Section 2: S3 Upload Check */}
      <section className="mb-8 p-4 border border-gray-200 rounded">
        <h2 className="text-lg font-semibold mb-3">Section 2: S3 Image Upload Check</h2>
        <div className="flex flex-col gap-3 mb-3">
          <label className="text-sm text-gray-600 font-medium">Select Image to Upload directly to S3:</label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleS3UploadCheck}
              disabled={s3Loading}
              className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            />
            
            {s3Loading && <span className="text-sm text-gray-500">Uploading...</span>}
            {s3Status === "OK" && (
              <span className="text-green-600 font-bold text-sm">S3 OK</span>
            )}
            {s3Status === "FAILED" && (
              <span className="text-red-600 font-bold text-sm">S3 FAILED</span>
            )}
          </div>
        </div>

        {s3FileUrl && (
          <div className="text-sm mt-3">
            <strong className="text-gray-700">Uploaded File Link: </strong>
            <a
              href={s3FileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline break-all"
            >
              {s3FileUrl}
            </a>
          </div>
        )}

        {s3Error && (
          <p className="text-sm text-red-500 mt-2">Error: {s3Error}</p>
        )}
      </section>

      {/* Section 3: AWS Bedrock Check */}
      <section className="mb-8 p-4 border border-gray-200 rounded">
        <h2 className="text-lg font-semibold mb-3">Section 3: AWS Bedrock LLM Check</h2>
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={handleBedrockCheck}
            disabled={bedrockLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 text-sm font-medium"
          >
            {bedrockLoading ? "Invoking model..." : "Test Bedrock Connection"}
          </button>
          
          {bedrockStatus === "OK" && (
            <span className="text-green-600 font-bold text-sm">Bedrock OK</span>
          )}
          {bedrockStatus === "FAILED" && (
            <span className="text-red-600 font-bold text-sm">Bedrock FAILED</span>
          )}
        </div>

        {bedrockMessage && (
          <div className="text-sm p-3 bg-gray-50 border border-gray-100 rounded">
            <strong className="text-gray-700">Claude Response:</strong>
            <p className="mt-1 text-gray-800">{bedrockMessage}</p>
          </div>
        )}

        {bedrockError && (
          <p className="text-sm text-red-500 mt-2">Error: {bedrockError}</p>
        )}
      </section>

      {/* --- Phase 2: AI Core Engine --- */}
      <h1 className="text-2xl font-bold mb-6 mt-12 border-t pt-8">Phase 2 — AI Core Engine</h1>

      {/* Subsection 1: Quality Check Tester */}
      <section className="mb-8 p-5 border border-gray-200 rounded-lg shadow-sm bg-white">
        <h2 className="text-lg font-semibold mb-4">1. Quality Check Tester</h2>
        <div className="flex flex-col gap-3 mb-4">
          <input type="text" placeholder="S3 Image URL (https://...)" className="w-full p-2 border rounded text-sm" value={qcUrl} onChange={e => setQcUrl(e.target.value)} />
          <select className="w-full p-2 border rounded text-sm bg-white" value={qcCategory} onChange={e => setQcCategory(e.target.value)}>
            <option value="footwear">Footwear</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="other">Other</option>
          </select>
          <button onClick={handleQualityCheck} disabled={qcLoading || !qcUrl} className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium disabled:opacity-50 transition-colors hover:bg-slate-800">
            {qcLoading ? "Running Quality Check..." : "Run Quality Check"}
          </button>
        </div>
        {qcError && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{qcError}</div>}
        {qcResult && (
          <div className="mt-4 p-4 border rounded bg-slate-50">
            <div className="flex items-center gap-2 mb-2">
              {qcResult.pass ? 
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded uppercase tracking-wider">Pass ✅</span> : 
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded uppercase tracking-wider">Fail ❌</span>
              }
            </div>
            <p className="text-sm text-gray-700 mb-2">{qcResult.reason}</p>
            {qcResult.failedChecks.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {qcResult.failedChecks.map(check => (
                  <span key={check} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full border border-red-200">{check}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Subsection 2: Grading Tester */}
      <section className="mb-8 p-5 border border-gray-200 rounded-lg shadow-sm bg-white">
        <h2 className="text-lg font-semibold mb-4">2. Grading Tester</h2>
        <div className="flex flex-col gap-3 mb-4">
          <textarea rows={3} placeholder="S3 Image URLs (one per line, max 4)" className="w-full p-2 border rounded text-sm font-mono" value={gradingUrls} onChange={e => setGradingUrls(e.target.value)} />
          <select className="w-full p-2 border rounded text-sm bg-white" value={gradingCategory} onChange={e => setGradingCategory(e.target.value)}>
            <option value="footwear">Footwear</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="other">Other</option>
          </select>
          <button onClick={handleGrading} disabled={gradingLoading || !gradingUrls} className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium disabled:opacity-50 transition-colors hover:bg-slate-800">
            {gradingLoading ? "Running Grading..." : "Run Grading"}
          </button>
        </div>
        {gradingError && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{gradingError}</div>}
        {gradingResult && (
          <div className="mt-4 p-4 border rounded bg-slate-50 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-sm font-bold rounded-full text-white ${
                gradingResult.grade === 'A' ? 'bg-green-500' :
                gradingResult.grade === 'B' ? 'bg-blue-500' :
                gradingResult.grade === 'C' ? 'bg-yellow-500' : 'bg-red-500'
              }`}>Grade {gradingResult.grade}</span>
              <span className="text-sm font-medium text-gray-600">Confidence: <span className="uppercase text-gray-900">{gradingResult.confidence}</span></span>
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                <span>Score</span>
                <span>{gradingResult.score}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-slate-800 h-2 rounded-full" style={{ width: `${gradingResult.score}%` }}></div>
              </div>
            </div>
            <p className="text-sm text-gray-700 italic border-l-4 border-gray-300 pl-3">{gradingResult.summary}</p>
            {gradingResult.flaws && gradingResult.flaws.length > 0 && (
              <div className="mt-2">
                <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Detected Flaws</h4>
                <ul className="space-y-2">
                  {gradingResult.flaws.map((flaw, idx) => (
                    <li key={idx} className="text-sm bg-white p-2 border rounded shadow-sm flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{flaw.name}</span>
                        <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded ${
                          flaw.severity === 'minor' ? 'bg-gray-100 text-gray-600' :
                          flaw.severity === 'moderate' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                        }`}>{flaw.severity}</span>
                      </div>
                      <div className="text-xs text-gray-500 font-mono">Box: [x:{flaw.x_percent}%, y:{flaw.y_percent}%, w:{flaw.width_percent}%, h:{flaw.height_percent}%]</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Subsection 3: Routing Tester */}
      <section className="mb-8 p-5 border border-gray-200 rounded-lg shadow-sm bg-white">
        <h2 className="text-lg font-semibold mb-4">3. Routing Tester</h2>
        <div className="flex flex-col gap-3 mb-4">
          <input type="number" placeholder="Original Price (₹)" className="w-full p-2 border rounded text-sm" value={routePrice} onChange={e => setRoutePrice(e.target.value)} />
          <button onClick={handleRouting} disabled={routeLoading || !routePrice || !gradingResult} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium disabled:opacity-50 transition-colors hover:bg-indigo-700">
            {routeLoading ? "Running Routing Decision..." : "Run Routing Decision (uses last grading result)"}
          </button>
        </div>
        {!gradingResult && <p className="text-xs text-gray-500">Run a grading test first to use this section.</p>}
        {routeError && <div className="text-sm text-red-600 bg-red-50 p-3 rounded mt-3">{routeError}</div>}
        {routeResult && (
          <div className="mt-4 p-4 border rounded bg-slate-50 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 text-sm font-bold rounded-full text-white ${
                routeResult.decision === 'relist_as_refurbished' ? 'bg-green-600' :
                routeResult.decision === 'needs_repair_then_relist' ? 'bg-blue-500' :
                routeResult.decision === 'donate' ? 'bg-purple-500' : 'bg-gray-500'
              }`}>
                {routeResult.decision.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-700">{routeResult.reasoning}</p>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="bg-white p-3 border rounded">
                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Est. Resale Price</div>
                <div className="text-lg font-bold text-green-700">₹{routeResult.estimatedResalePrice.toLocaleString()}</div>
              </div>
              <div className="bg-white p-3 border rounded">
                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">AI Confidence</div>
                <div className="text-lg font-bold text-gray-800">{routeResult.confidenceScore}%</div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${routeResult.confidenceScore}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
