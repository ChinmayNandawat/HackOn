"use client";

import { FileText } from "lucide-react";

/**
 * Shape of a single Escalated_Queue row, as constructed by `/warehouse`'s page
 * component (task 8.5) from the shared `returns` + `products` Supabase query.
 *
 * Deliberately kept structurally compatible with `PhysicalHandlingQueueSection`'s
 * item type (same `id`/`ai_grade`/`ai_score`/`ai_routing_decision`/`product` shape) so
 * the page can build both queues' arrays from the same mapped row objects without
 * needing two incompatible shapes — extra fields on the source object (e.g.
 * `damage_origin`, `warehouse_confirmed_at`) are simply ignored here since the
 * Escalated_Queue never displays or acts on them (Requirement 3.2, 3.3).
 */
export interface EscalatedQueueItem {
  id: string;
  ai_grade: string | null;
  ai_score: number | null;
  ai_routing_decision: string | null;
  product: {
    title: string;
    image_url: string | null;
  } | null;
}

interface EscalatedQueueSectionProps {
  records: EscalatedQueueItem[];
}

const gradeClasses: Record<string, string> = {
  A: "bg-emerald-50 text-emerald-700 border-emerald-200",
  B: "bg-teal-50 text-teal-700 border-teal-200",
  C: "bg-amber-50 text-amber-700 border-amber-200",
  D: "bg-red-50 text-red-700 border-red-200",
};

/**
 * Escalated_Queue section of the Warehouse_Queue_Page (Requirement 3).
 *
 * Read-only by design (Requirement 3.3): this component intentionally renders no
 * button, link, or other interactive control that could trigger the
 * Confirm_Physical_Routing_Action or any other mutation. These Return_Records are
 * still awaiting a seller decision, so there is nothing for Warehouse Staff to act on.
 */
export default function EscalatedQueueSection({ records }: EscalatedQueueSectionProps) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Escalated Queue</h2>
        <span className="text-xs text-gray-400 font-medium">
          {records.length} return{records.length !== 1 ? "s" : ""} awaiting seller decision
        </span>
      </div>

      {records.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
          <FileText className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-gray-700">No returns currently awaiting seller decision</p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs">
            Escalated returns will appear here while a seller decides how to handle them.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((item) => {
            const title = item.product?.title || "Unknown Product";
            const imageUrl = item.product?.image_url || null;
            const gradeClass = item.ai_grade ? gradeClasses[item.ai_grade] : "";

            return (
              <div
                key={item.id}
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4"
              >
                {/* Thumbnail */}
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-12 h-12 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center flex-shrink-0 text-xs font-semibold uppercase">
                    {title.substring(0, 2)}
                  </div>
                )}

                {/* Card Main Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <h3 className="text-sm font-extrabold text-gray-800 truncate">{title}</h3>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded border text-[10px] font-bold bg-blue-50 text-blue-700 border-blue-200">
                        Needs Seller Review
                      </span>
                      {item.ai_grade && (
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${gradeClass}`}>
                          Grade {item.ai_grade}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-400 font-semibold space-x-2 flex items-center flex-wrap gap-y-1">
                    {item.ai_score !== null && (
                      <>
                        <span className="text-gray-600 font-bold">Score: {item.ai_score}/100</span>
                        <span className="text-gray-300">•</span>
                      </>
                    )}
                    <span>
                      Routing: <span className="text-gray-500 font-normal">{item.ai_routing_decision ?? "N/A"}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
