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
    <section>
      {records.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <FileText className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-gray-700">No returns currently awaiting seller decision</p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs">
            Escalated returns will appear here while a seller decides how to handle them.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {records.map((item) => {
            const title = item.product?.title || "Unknown Product";
            const imageUrl = item.product?.image_url || null;
            const gradeClass = item.ai_grade ? gradeClasses[item.ai_grade] : "";

            return (
              <div
                key={item.id}
                className="group grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 md:px-8 py-5 hover:bg-amber-50/50 transition-colors"
              >
                {/* Package / Item (Col 1-4) */}
                <div className="col-span-4 flex items-center gap-5">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={title}
                      className="w-20 h-20 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center flex-shrink-0 text-xs font-semibold uppercase">
                      {title.substring(0, 2)}
                    </div>
                  )}
                  <div className="min-w-0 flex flex-col gap-1">
                    <h3 className="text-sm font-extrabold text-gray-900 truncate">
                      {title}
                    </h3>
                    {/* AWB not available in basic escalated record currently, omit or stub */}
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-mono font-semibold bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">
                         AWB-PENDING
                       </span>
                    </div>
                  </div>
                </div>

                {/* AI Grade (Col 5-6) */}
                <div className="col-span-2 flex flex-col gap-1">
                   <span className={`w-fit px-2.5 py-1 rounded-md text-[11px] font-extrabold tracking-wide uppercase ${gradeClass}`}>
                     Grade {item.ai_grade}
                   </span>
                   <span className="text-[10px] text-gray-500 font-semibold">
                     Score: {item.ai_score}/100
                   </span>
                </div>

                {/* Target Route (Col 7-9) */}
                <div className="col-span-3 flex flex-col gap-1">
                   <span className="text-xs font-bold text-gray-900">
                     {item.ai_routing_decision ? item.ai_routing_decision.replace(/_/g, ' ') : "Pending"}
                   </span>
                   <div className="flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded w-fit">
                     <span>Awaiting Seller Review</span>
                   </div>
                </div>

                {/* Action (Col 10-12) */}
                <div className="col-span-3 flex justify-end">
                  <button disabled className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-400 rounded-lg text-xs font-bold border border-gray-200 cursor-not-allowed">
                    Locked
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
