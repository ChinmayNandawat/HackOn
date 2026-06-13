# ReLife — Final Idea & Workflow

> **One-liner:** An AI system that prevents unnecessary returns, and when returns do happen, automatically grades, routes, and relists products — saving sellers time, reducing costs, and giving worthy products a second chance.

---

## The App

One web app. Two roles. Toggle between them. No separate marketplace — it's **built into both views**.

- **Buyer View** — Where customers shop (new + refurbished products), get return warnings, initiate returns, and track their impact
- **Seller View** — Where sellers see AI-processed returns, full inspection reports, relist products as refurbished, manage their listings, and view analytics

---

## Feature 1: Return Prevention

**Where:** Buyer View → Product Page

**When a buyer is browsing a product that has a high return history**, show a warning banner:

- A return risk percentage (e.g., "73% of buyers return this")
- The main reason why people return it (e.g., "Runs smaller than expected")
- A personalized suggestion based on the buyer's past orders (e.g., "You usually buy Size 9. This runs small — try Size 9.5")
- A suggestion to consider a different variant (e.g., different size/color) that has a lower return rate
- A link to a **cheaper refurbished version** if one exists (e.g., "Same product, Grade A condition — ₹2,100 instead of ₹3,500")

**Goal:** Stop bad purchases before they happen. The best return is no return.

---

## Feature 2: Smart Return Flow

**Where:** Buyer View → My Orders → Return

When a buyer decides to return a product, this is the flow:

### Step 1: Buyer selects return reason
Simple dropdown: changed mind / wrong size / damaged / doesn't match description / other

### Step 2: Buyer captures live photos (camera only — no gallery uploads)
The app opens the camera with **guided overlay silhouettes** and prompts the buyer to capture 4 photos from specific angles:
1. **Front** — full product face-on
2. **Back** — flip and capture
3. **Top/Side** — capture from above or side angle
4. **Close-up** — any area with visible damage

The buyer can also add a text description of any issues.

**Why live capture only:** Prevents buyers from uploading edited/old photos or stock images. Ensures authentic, real-time product condition.

### Step 3: Image Quality Check (buyer-facing — NOT inspection)
After each photo, the AI runs a **quality check only** (not a damage inspection). The buyer sees:
- ✅ *"Good capture"* — photo is clear, well-lit, properly framed → move to next angle
- 🔄 *"Too blurry / too dark / product not fully visible — please retake"* → buyer retakes that specific angle

**Critical design decision:** The buyer does **NOT** see any inspection results — no grade, no score, no flaw annotations. This is intentional:
- **Prevents gaming:** If buyers saw "scratch detected on top-left," they'd angle the next photo to hide it
- **Reduces friction:** Buyer doesn't need to understand or argue with an AI grade
- **Faster flow:** No review/accept screen — just capture and submit

The quality check loop continues until all 4 photos pass the clarity threshold.

### Step 4: Submission + Background Processing
Once all 4 photos pass quality checks, the buyer sees:
> *"Photos submitted! Your return is being processed. Check the status anytime in My Returns."*

The buyer is **free to leave** — no waiting, no loading screen. They can close the app and come back later.

**In the background,** the AI performs the full inspection:
- Analyzes all photos for damage (scratches, dents, scuffs, stains, missing parts)
- Assigns a condition grade (A = Excellent, B = Good, C = Fair, D = Poor) and score out of 100
- Highlights every detected flaw on the photos with red/yellow bounding boxes
- Generates a confidence score for its assessment

### Step 5: AI decides the best route (automatically, in backend)
Based on the grade, product value, demand, and logistics cost, the AI picks one of four paths:

| Route | When | What happens |
|-------|------|--------------|
| **Return to Seller (Resellable)** | Product is in good condition (Grade A/B) | Full refund to buyer. Product shipped back to seller with AI inspection report. Seller gets a one-click **"Relist as Refurbished"** option. |
| **Buyer keeps + partial refund** | Product is low-value (shipping it back costs more than it's worth) | Buyer keeps the item, gets a partial refund. No shipping needed. |
| **Return to Seller (Needs Repair)** | Product has fixable issues + high enough value to justify repair | Full refund to buyer. Flagged for refurbishment before relisting. |
| **Donate** | Too damaged to sell but still functional | Routed to donation. Buyer earns extra green credits. |

### Step 6: Buyer checks status on website (no notifications — just a status page)
The buyer can check their return status anytime by going to **Buyer View → My Returns**. Each return shows a status card:

| Status | What the buyer sees |
|--------|--------------------|
| **Processing** | *"Your return is being reviewed. Check back shortly."* |
| **Decision Ready** | The routing decision + brief reason (e.g., *"Return approved. Ship it back by June 20."*) |
| **Accepted** | Buyer accepted the AI decision. Shows next steps. |

What the buyer sees once the decision is ready:
- The **routing decision** and a brief reason
- Their options: accept the AI decision OR choose standard refund instead
- How many **green credits** they earn for choosing the sustainable option
- The **CO₂ they save** by not shipping the product back (for keep+refund route)

**What the buyer does NOT see:** Condition grade, score, flaw list, annotated photos, or confidence levels. This keeps the experience simple and prevents disputes over AI grading.

**Why no notifications:** Keeps the build simple — no push notification infrastructure, no email service, no real-time websockets. The buyer just checks the page. Processing is fast enough (~2 seconds) that by the time they navigate to My Returns, the result is usually ready.

> **Note:** The full inspection report (grade, annotated photos, flaw details) goes exclusively to the **Seller Dashboard** — see Feature 3 below.

---

## Feature 3: Seller Dashboard

**Where:** Seller View

The seller opens their dashboard and sees all returns **already processed by AI**. No manual inspection needed. **This is the only place the full AI inspection report is visible** — buyers never see it.

### What each return card shows:
- Product name and order details
- Original product photo vs return photo (side by side)
- **AI's annotated return photos** — every detected flaw highlighted with red/yellow bounding boxes
- The **condition grade** (A/B/C/D) and **score out of 100**
- **AI confidence level** — High / Medium / Low (if Medium/Low, flagged for manual review)
- AI-suggested resale price (if product is resellable)
- The routing decision the AI made and why
- Scores for all 4 possible routes so seller can see the reasoning
- **"Relist as Refurbished" button** — one-click to list the product on the marketplace (for Grade A/B products)

### Seller's role:
- **Default: Do nothing.** AI handled it.
- **Override if needed:** Seller can change the AI's decision (e.g., change from "resell" to "refurbish" if they know something the AI doesn't)
- **Relist returned products:** For resellable items, seller clicks "Relist as Refurbished" → AI auto-generates the listing with Health Card, suggested price, and condition details
- **Fraud flag:** If the AI detects the returned product doesn't match the original listing photos, it flags it for seller to review

### My Listings section:
A dedicated section within the seller dashboard showing:
- All their refurbished products currently listed
- Status of each listing (active / sold / pending)
- AI-suggested price vs actual price set
- Views and interest on each listing

### Seller analytics section:
- How many returns were auto-processed this month
- Revenue recovered through refurbished relists
- Top return reasons (so seller can improve their listings)
- Time saved vs manual inspection
- Suggestion: "34% of returns are for size issues — consider adding a size guide to your listing"

---

## Feature 4: Integrated Marketplace + Product Health Card

**Not a separate view** — the marketplace lives inside both the Buyer and Seller views.

### Buyer side: Browse Refurbished Products

**Where:** Buyer View → Product browsing (same page as new products)

Refurbished products appear alongside new products, clearly distinguished:
- **"AI Verified ✓"** badge on each refurbished product card
- **Condition grade** (A/B) shown as a badge
- **Discount %** shown prominently (e.g., "40% off vs new")
- Filter toggle: **All** / **New Only** / **Refurbished**

When a buyer clicks a refurbished product, they see the **Product Health Card**:
- **Condition grade** (A/B/C/D) with score out of 100
- **Annotated photos** — AI-highlighted flaws on actual product photos
- **What the AI found** — list of issues with severity (e.g., "Minor scuff on bottom edge — cosmetic only")
- **Product history** — when it was originally bought, why it was returned
- **Price comparison** — refurbished price vs original price, how much buyer saves
- **Guarantee** — 30-day guarantee: if product doesn't match the Health Card, full refund
- **Environmental impact** — "Buying this instead of new saves X kg of CO₂"

### Seller side: Relist Returned Products

**Where:** Seller View → Returns Dashboard → "Relist as Refurbished" button

When a product is graded A or B, the seller sees a **"Relist as Refurbished"** button. One click and:
- AI auto-generates the listing using the inspection data
- Health Card is created automatically from the AI grading report
- AI suggests a price based on condition, original price, and market demand
- Seller can adjust the price or description before publishing
- The product goes live in the buyer's product browsing feed

---

## Feature 5: Impact Dashboard + Green Credits

**Where:** Buyer View → My Impact

A section showing the buyer's personal sustainability contribution:

- Products they helped divert from landfill
- Green credits earned (can be redeemed as Amazon discount)
- CO₂ they saved
- Their sustainability tier (Bronze → Silver → Gold based on credits)

**How credits are earned:**
- Chose "keep + partial refund" instead of full return → earn credits
- Bought a refurbished product instead of new → earn credits
- Chose donation route → earn extra credits

**Platform-wide counters** (visible to everyone):
- Total returns processed by AI
- Total CO₂ saved
- Total money saved by customers

---

## End-to-End Workflow (The Complete Loop)

```
                    ┌─────────────────────────────┐
                    │  BUYER BROWSES PRODUCTS      │
                    │  (new + refurbished mixed)   │
                    └──────────────┬──────────────┘
                                   │
                         ┌─────────▼─────────┐
                         │ Return risk high?  │
                         └─────────┬─────────┘
                          Yes ─────┤───── No
                           │       │       │
                    ┌──────▼───┐   │   ┌───▼──────┐
                    │ Show     │   │   │ Normal   │
                    │ warning  │   │   │ product  │
                    │ + suggest│   │   │ page     │
                    │ better   │   │   └───┬──────┘
                    │ fit/size │   │       │
                    │ + show   │   │       │
                    │ refurb   │   │       │
                    │ option   │   │       │
                    └──────┬───┘   │       │
                           │       │       │
               ┌───────────▼───────▼───────▼────────────┐
               │    BUYER PURCHASES (new or refurbished)│
               └───────────────────┬────────────────────┘
                                   │
                         ┌─────────▼──────────┐
                         │  Wants to return?   │
                         └─────────┬──────────┘
                                   │ Yes
                                   │
       ┌───────────────────────────▼──────────────────┐
       │      BUYER CAPTURES 4 LIVE PHOTOS            │
       │      (camera only, guided overlays)          │
       └───────────────────┬──────────────────────────┘
                           │
       ┌───────────────────▼──────────────────────┐
       │      QUALITY CHECK (buyer sees this)     │
       │      • Clear? ✅ Proceed                  │
       │      • Blurry/dark? 🔄 Retake            │
       └───────────────────┬──────────────────────┘
                           │ All 4 photos pass
                           │
       ┌───────────────────▼──────────────────────┐
       │      "Photos submitted! Check status     │
       │       in My Returns anytime."            │
       │      (buyer is FREE TO LEAVE)            │
       └───────────────────┬──────────────────────┘
                           │
       ┌───────────────────▼──────────────────────┐
       │      BACKGROUND: AI FULL INSPECTION      │
       │      • Finds every flaw                  │
       │      • Highlights them on photos         │
       │      • Scores condition (0-100)          │
       │      • Assigns grade (A/B/C/D)           │
       │      (buyer does NOT see this)           │
       └───────────────────┬──────────────────────┘
                           │
       ┌───────────────────▼──────────────────────┐
       │      AI DECIDES BEST ROUTE               │
       │      (automatically, in background)       │
       └───┬───────┬──────────┬───────────┬───────┘
           │       │          │           │
     ┌─────▼──┐ ┌──▼─────┐ ┌─▼────────┐ ┌▼──────┐
     │RETURN  │ │ KEEP + │ │RETURN    │ │DONATE │
     │TO      │ │PARTIAL │ │TO SELLER │ │       │
     │SELLER  │ │REFUND  │ │(REPAIR)  │ │       │
     │(GOOD)  │ │        │ │          │ │       │
     └───┬────┘ └───┬────┘ └────┬─────┘ └──┬───┘
         │          │           │           │
         │     Buyer keeps     │           │
         │     product +       │           │
         │     gets ₹ back     │           │
         │                     │           │
       ┌─▼─────────────────────▼───────────▼──────┐
       │  BUYER CHECKS "MY RETURNS" PAGE          │
       │  (status: Processing → Decision Ready)   │
       │  (routing decision only — no grade/flaws)│
       └──────────────────┬───────────────────────┘
                          │
       ┌──────────────────▼───────────────────────┐
       │  SELLER DASHBOARD                        │
       │  (sees FULL AI inspection report)        │
       │  • Annotated photos with flaws           │
       │  • Grade + score + confidence            │
       │  • Routing decision + reasoning          │
       │  • Can override if needed                │
       └──────────────────┬───────────────────────┘
                          │
              Grade A/B?  │
                          │ Yes
       ┌──────────────────▼───────────────────────┐
       │  SELLER CLICKS "RELIST AS REFURBISHED"   │
       │  • AI auto-generates listing             │
       │  • Health Card created from grading data │
       │  • AI suggests price                     │
       │  • Product goes live in buyer feed       │
       └──────────────────┬───────────────────────┘
                          │
       ┌──────────────────▼───────────────────────┐
       │  NEXT BUYER FINDS REFURBISHED PRODUCT    │
       │  • Sees Health Card (grade, flaws, etc.) │
       │  • Buys at 30-60% off                   │
       │  • 30-day guarantee                     │
       └──────────────────┬───────────────────────┘
                          │
       ┌──────────────────▼───────────────────────┐
       │  IMPACT TRACKED                          │
       │  • Green credits awarded                 │
       │  • CO₂ saved calculated                  │
       │  • Returns processed counter +1          │
       └──────────────────────────────────────────┘
```

---

## Build Priority

| Priority | Feature | Without this... |
|----------|---------|-----------------|
| **MUST** | AI Grading (live photos → grade + highlighted flaws in backend) | ...you have no project |
| **MUST** | Smart Routing (auto-decide return/keep/repair/donate) | ...you just have a photo grader, not a system |
| **MUST** | Seller Dashboard (full inspection report + relist controls) | ...you miss the Small Seller persona entirely |
| **MUST** | Integrated Marketplace + Product Health Card | ...no trust layer for refurbished products, judges will ask "what happens to the graded products?" |
| **SHOULD** | Return Prevention banner on product page | ...you miss Amazon's 4th pillar and your biggest differentiator |
| **NICE** | Impact Dashboard + Green Credits | ...you lose the emotional hook, but core still works |

---

## Future Roadmap (Not in current scope)

These features are planned for future iterations but are **not being built now**:

| Feature | Description |
|---------|-------------|
| **"Give It a Second Life"** | AI proactively suggests listing unused products (e.g., *"Your baby monitor bought 8 months ago — estimated resale value: ₹2,800"*). Uses the same photo → AI grading → listing flow. |
