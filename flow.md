# ReLife Platform: End-to-End Flow & Architecture

This document outlines the complete architectural flow of the ReLife smart returns platform. It serves as a technical reference guide for how data moves through the database, which APIs are triggered, and how each dashboard communicates with the central Supabase backend.

## 🔄 Complete Flowchart

```mermaid
sequenceDiagram
    participant B as Buyer (/orders)
    participant API as AI Engine (/api/process-return-ai)
    participant DB as Supabase (returns table)
    participant PA as Pickup Agent (/pickup)
    participant WH as Warehouse (/warehouse)
    participant SA as Seller (/seller/returns)

    B->>DB: 1. Initiates Return (Uploads 4 Photos)
    DB-->>B: Status: "processing"
    
    B->>API: 2. Triggers AI Inspection
    API->>API: AWS Bedrock Analyzes Flaws & Routing
    API->>DB: Updates Grade, Flaws, and Routing
    
    alt Seller Automation Rules Match
        API->>DB: Status: "inspected", auto_approved: true
    else Standard Process
        API->>DB: Status: "inspected"
    end
    
    SA->>DB: 3. Fetches Pending Returns (status: "inspected" AND !auto_approved)
    SA->>SA: Seller manually reviews AI Health Card
    SA->>DB: Seller decides: Relist, Refund, or Reject (sets seller_approved: true)
    
    PA->>DB: 4. Fetches "inspected" Returns with (auto_approved OR seller_approved)
    PA->>PA: Scans AWB & Visually Verifies Item
    
    alt Item Matches 
        PA->>DB: Status: "accepted"
    else Item Mismatch
        PA->>DB: Status: "accepted" (Flagged for Warehouse)
    else Wrong Item
        PA->>DB: Status: "rejected"
    end
    
    WH->>DB: 5. Fetches "accepted" Returns
    WH->>WH: Physically handles and routes item to bin
    WH->>DB: Updates warehouse_confirmed_at
    WH->>API: Triggers /api/relist if decision is relist
```

## 🔄 High-Level Process Flow

```mermaid
graph TD
    A([Buyer Initiates Return]) --> B[AWS Bedrock AI Inspection]
    
    B --> C{Condition & Fraud Check}
    C -- High Risk/Fraud --> D([Reject & Cancel])
    C -- Pass --> E{Matches Seller Automation Rules?}
    
    E -- Yes --> F[Flag as Auto-Approved]
    E -- No --> G[Pending Manual Review]
    
    G --> U[Seller Intelligence Dashboard]
    U --> V{Seller Final Override}
    
    V -->|Relist/Donate/Refund| W[Flag as Seller-Approved]
    V -->|Fraud/Mismatch| X([Reject - Return to Buyer])
    
    F --> H[Pickup Agent Verification]
    W --> H
    
    H --> I{Physical Item Match?}
    
    I -- Wrong Item --> J([Reject & Cancel Return])
    I -- Condition Mismatch --> K[Flag for Warehouse Escalation]
    I -- Perfect Match --> L[Confirm Pickup]
    
    K --> M[Warehouse Receiving]
    L --> M
    
    M --> N{Warehouse Physical Sorting}
    
    N -->|Grade A/B| O[Main Warehouse / Refurbishment]
    N -->|Grade C| P[Dark Store / Hyper-Local Deals]
    N -->|Grade D| Q[Donation & Recycle Bins]
    N -->|Mismatched Item| R[Escalation Queue]
    
    O --> T([Instant Relist])
    P --> T
    Q --> Y([Complete])
```

---

## 🛠️ Phase-by-Phase Technical Breakdown

### 1. Buyer Return Initiation (`/orders` -> `/returns/new`)
* **Trigger:** Buyer clicks "Initiate Return" on a past order.
* **Logic:** 
  * Buyer is forced to capture 4 live photos (Front, Back, Side, Damage) preventing gallery fraud.
  * Optionally selects a return reason.
* **Database State:** 
  * A new row is inserted into the `returns` table.
  * Initial `status` is set to `"processing"`.
  * `return_photo_urls` are populated with S3/Supabase storage links.

### 2. Instant AI Inspection (`/api/process-return-ai`)
* **Trigger:** Called automatically upon return submission.
* **Logic:** 
  * Sends the 4 photos and buyer reason to AWS Bedrock.
  * The LLM calculates the `ai_grade` (A/B/C/D), generates bounding box data (`flaws_json`), and determines a `routing_decision`.
  * **Seller Automation Check:** The API checks the Seller's automation settings (`/api/seller-automation-rules`). If the item matches the rules (e.g., Value < $50, Trust Score > 80, Grade A/B), the AI attaches an invisible `auto_approved: true` flag.
* **Database State:** 
  * `status` transitions to `"inspected"`.
  * `ai_grade`, `ai_score`, and `flaws_json` are saved to the `returns` table.

### 3. Seller Intelligence Dashboard (`/seller/returns`)
* **Trigger:** Seller manages their inventory BEFORE pickup.
* **Logic:** 
  * The dashboard fetches all returns from the DB.
  * **Pending AI/Manual Tab:** Filters for `status === "inspected"`. Hides any items where `auto_approved === true` or `seller_approved === true`.
  * Seller views the dual-column AI Health Card with precise flaw bounding boxes.
  * Seller makes a manual override decision (Relist, Refund, Reject).
* **Database State:** 
  * If Relist/Refund: the `flaws_json` is updated with `seller_approved: true` so it proceeds to pickup.
  * If Reject: `status` transitions to `"rejected"`.

### 4. Logistics Pickup Terminal (`/pickup`)
* **Trigger:** Delivery agent arrives at the buyer's doorstep.
* **Logic:** 
  * Terminal fetches all returns where `status === "inspected"` AND they are approved (`auto_approved` or `seller_approved`).
  * Agent scans the AWB barcode, which pulls up the AI's generated Health Card and photos.
  * Agent visually verifies the physical item against the AI's photos.
* **Database State:** 
  * If the agent clicks "Match": `status` transitions to `"accepted"`.
  * If the agent clicks "Mismatch": `status` transitions to `"accepted"`, but a `pickup_flagged: true` flag is added to alert the warehouse.
  * If "Wrong Item": `status` transitions to `"rejected"`.

### 5. Warehouse Physical Handling (`/warehouse`)
* **Trigger:** The delivery truck arrives at the sorting facility.
* **Logic:** 
  * Terminal fetches returns where `status` is `"accepted"`.
  * It splits them into a Physical Handling Queue (for routing to bins) and an Escalation Queue (for items flagged during pickup).
  * Worker clicks "Confirm Received" to acknowledge physical custody.
* **Database State:** 
  * Updates `warehouse_confirmed_at` with the current timestamp.
  * **Automation Trigger:** Triggers `/api/relist` if the routing decision is `relist_as_refurbished` (which transitions `status` to `"relisted"`). If donate/recycle, changes status to `"completed"`.

### 6. Seller Automation Studio (`/seller/automation`)
* **Logic:** A settings dashboard where sellers can configure the criteria for bypassing phase 5. Rules (like Max Value, Min Trust Score, Eligible Grades) are saved and queried by `/api/process-return-ai` during Phase 2.
