/**
 * Pure queue/label logic for the Warehouse Staff persona.
 *
 * These functions are intentionally side-effect free (no Supabase, no React) so they
 * can be unit- and property-tested independently of the rest of the app. They encode
 * the single source of truth for "which queue is this Return_Record in, if any" and
 * for the Destination_Label mapping.
 *
 * See: .kiro/specs/warehouse-staff-persona/design.md, "Components and Interfaces" #2.
 */

export type RoutingDecision =
  | 'relist_as_refurbished'
  | 'standard_return'
  | 'donate'
  | 'recycle'
  | string;

export interface WarehouseReturnRecord {
  id: string;
  status: string;
  ai_routing_decision: string | null;
  warehouse_confirmed_at: string | null;
  flaws_json: any | null;
  damage_origin: string | null;
}

const PHYSICAL_QUEUE_DECISIONS: readonly string[] = [
  'relist_as_refurbished',
  'standard_return',
  'donate',
  'recycle',
] as const;

const DESTINATION_LABELS: Record<string, string> = {
  relist_as_refurbished: 'Amazon Renewed (Refurbish)',
  standard_return: 'Restock (Sellable Inventory)',
  donate: 'Liquidation / Wholesale',
  recycle: 'E-Waste / Scrap',
};

/**
 * Requirement 2.1: a Return_Record belongs in the Physical_Handling_Queue when it was
 * auto-approved, its routing decision is one of the four physically-actionable
 * outcomes, and warehouse staff have not already confirmed the physical move.
 */
export function isInPhysicalHandlingQueue(r: WarehouseReturnRecord): boolean {
  return (
    r.status === 'accepted' &&
    r.ai_routing_decision !== null &&
    PHYSICAL_QUEUE_DECISIONS.includes(r.ai_routing_decision) &&
    r.warehouse_confirmed_at === null
  );
}

/**
 * Requirement 3.1: a Return_Record belongs in the Escalated_Queue when it is still
 * awaiting a seller decision (status === 'inspected') and was not auto-approved.
 */
export function isInEscalatedQueue(r: WarehouseReturnRecord): boolean {
  return r.status === 'inspected' && r.flaws_json?.auto_approved !== true;
}

/**
 * Requirement 2.3: map an `ai_routing_decision` value to its Destination_Label.
 * Total function: never throws, returns `null` for any unmapped value including
 * `null` or an empty string.
 */
export function getDestinationLabel(decision: string | null): string | null {
  if (decision === null) {
    return null;
  }
  return DESTINATION_LABELS[decision] ?? null;
}
