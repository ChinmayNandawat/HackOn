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

  return (
    <main className="p-8 max-w-2xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-6">ReLife Phase 1 Integration Sandbox</h1>
      <p className="text-sm text-gray-500 mb-8">
        This is an internal sandbox page used to verify services integration.
      </p>

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
    </main>
  );
}
