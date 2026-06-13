# 1. Project Manifesto & Core Idea
**ReLife**
An AI system that prevents unnecessary returns, and when returns do happen, automatically grades, routes, and relists products — saving sellers time, reducing costs, and giving worthy products a second chance.
- **Target Audience:** E-commerce buyers (conscious shoppers) and sellers (looking to automate return processing and relisting).
- **Primary Value Proposition:** End-to-end automation of the return lifecycle via AI (Bedrock) vision grading, intelligent routing, and seamless transition to a refurbished marketplace, promoting sustainable resale.

# 2. Agent & Architecture Topology
- **Directory Structure:** 
  - `/Agents`: Contains role definitions for all active AI agents contributing to the project (e.g., orchestrator, UI/UX designers, AI/backend/frontend engineers, product managers, security, QA).
- **Tech Stack:** 
  - Frontend: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui.
  - Backend/Database: Supabase (PostgreSQL), AWS S3 (for image storage).
  - AI Engine: AWS Bedrock Runtime (for grading, routing, and product context).
- **Agent Roles (from `/Agents`):** We heavily utilize specific agent directives for Product Management, UI/UX Design, Engineering (Frontend, Backend, DevOps, SRE, AI), Security, and Testing.

# 3. Strict Rules & Protocols
- **Chat Directives:** 
  - Maintain absolute synchronization between the chat, codebase state, and this `context.md` file.
  - Act autonomously to keep this file as the single source of truth without asking for permission.
  - Always refer to the `/Agents` folder when building or taking on specific functional roles, dynamically aligning with the agent prompts outlined there.
- **Code Standards:** 
  - Write clean, type-safe Next.js (App Router) and TypeScript.
  - Use modular Tailwind utility classes or `shadcn/ui` components for styling.

# 4. Current State & Active Task
- **Completed:** 
  - Defined the finalized idea, phases, and workflows (`final_idea.md`, `project_roadmap.md`).
  - Outlined detailed agent personas in `/Agents`.
  - Initialized Next.js 14 project, Tailwind CSS, shadcn/ui, and installed core dependencies (`@aws-sdk/client-bedrock-runtime`, `@supabase/supabase-js`) in the root directory.
- **In Progress:** 
  - Generating AI prompts for scaffolding the UI pages (Buyer Marketplace, Return Flow, and Seller Dashboard) via external UI generators.
- **Blockers:** 
  - None currently.

# 5. Decision Log (Changelog)
- **[2026-06-14]** Initialized `context.md` to enforce the strict Context Manager directive and align agent topology.
