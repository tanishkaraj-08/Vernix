# VERINEX AI — AICTE Case Coordination Intelligence System

> **Smart India Hackathon (SIH) 2026**  
> **Problem Statement ID:** SIH26264  
> **Problem Statement Title:** Integrated dashboard for monitoring and tracking institutions related complaint cases across AICTE Bureaus/cells  
> **Theme:** AI POWERED SMART GOVERNANCE  
> **Team ID:** 197631 | **Team Name:** VERINEX AI  
> **Evaluation Prototype URL:** `http://localhost:3000`

---

## Executive Summary

Complaints concerning the same technical institution frequently reach different AICTE bureaus (e.g., Regulation & Approval Bureau `RB`, Public Grievance Redressal Cell `PGRC`, Chief Vigilance Cell). In legacy administrative setups, multiple open cases concerning identical or related grievances progress in parallel silos. This results in duplicate on-site inspections, contradictory legal notices, delayed resolution, and administrative confusion.

**VERINEX AI** resolves this fragmentation by providing an explainable, officer-centric intelligence platform that unifies cross-bureau case histories, alerts officials to high-probability complaint overlaps, and enforces statutory turnaround SLAs.

---

## 3 Core Pillars Demonstrated to Hackathon Judges

1. **One Unified Institutional Profile**  
   Consolidates institutional approvals, physical infrastructure parameters, and simultaneous complaints received across `RB` and `PGRC` into a unified single pane of glass.

2. **Explainable AI-Assisted Overlap Detection (Slide 3 Engine)**  
   Every duplicate or cross-bureau overlap alert is mathematically transparent. It is computed from a documented 4-pillar formula and accompanied by natural language reasons. Crucially, **AI outputs are advisory recommendations for human verification**—cases are never automatically merged, transferred, or closed without recorded officer justification.

3. **Complete Case Journey & Administrative Accountability**  
   Enforces a strict 6-stage case progression:  
   $$\text{Submitted} \longrightarrow \text{Assigned} \longrightarrow \text{Under Process} \longrightarrow \text{Transferred} \longrightarrow \text{Action Taken} \longrightarrow \text{Disposed}$$  
   Every status change, inter-bureau transfer, and official remark is timestamped in an immutable audit history with officer credentials.

---

## Explainable AI Overlap Engine (Slide 3 Formulation)

$$\text{Overlap Score} = W_{\text{Inst}} (40\%) + W_{\text{Cat}} (20\%) + W_{\text{Text}} (30\%) + W_{\text{Bureau}} (10\%)$$

| Component | Weight | Assessment Logic |
| :--- | :---: | :--- |
| **Institution Permanent ID** | **40%** | Exact AICTE Permanent ID match yields 40 pts. <br> **Rule 3.1 Safeguard:** If institution IDs differ, the score is strictly capped below 40% so text similarity alone can never trigger a false-positive duplicate alert. |
| **Grievance Category** | **20%** | Exact match in statutory handbook categories (e.g. Laboratory Deficiency, Cadre Ratio) awards 20 pts; semantically related groups award 10 pts. |
| **Text Semantic Similarity** | **30%** | Domain-specific token overlap and Jaccard similarity across technical keywords (e.g., "oscilloscopes", "VLSI software", "biometric attendance", "cadre ratio") scaled to 30 pts. |
| **Cross-Bureau Open Status** | **10%** | Both cases are active/unresolved AND belong to separate bureaus (`RB` vs `PGRC`), indicating urgent coordination need. |

---

## Seeded SIH Test Scenarios (Slide 6 Verification)

The application comes pre-seeded with realistic, internally consistent data verifying the exact presentation test cases:

- **Scenario A (Confirmed Overlap — 93% Match):**  
  *Institution:* Demo Institute of Technology & Science (`1-109283711`)  
  *Case 1 (`RB-2026-101`):* Faculty petition on uncalibrated DSP oscilloscopes.  
  *Case 2 (`PGRC-2026-201`):* Student petition regarding broken electronics lab equipment.  
  *Result:* 93% Overlap Alert triggered. Officials can compare side-by-side, view plain-language justifications, and establish Joint Coordination Record `COORD-2026-801`.

- **Scenario B (Divergent Issues at Same Institution — <50% Match):**  
  *Case 1 (`RB-2026-101`):* DSP laboratory equipment shortage.  
  *Case 2 (`PGRC-2026-204`):* Hostel Block C drinking water filtration grievance.  
  *Result:* Category & text diverge; score remains below threshold, avoiding unnecessary coordination alerts.

- **Scenario C (Similar Lab Wording, Different Institution — Capped <40%):**  
  *Case 1 (`RB-2026-101`):* DITS Bengaluru lab equipment.  
  *Case 2 (`RB-2026-103`):* NIAT Lucknow (`1-308192833`) lab equipment.  
  *Result:* High text similarity is safely capped below 40% by Rule 3.1.

---

## Application Structure & Routes

| Route | View | Description |
| :--- | :--- | :--- |
| `/dashboard` | **Overview Dashboard** | Executive KPIs, donut status distribution, 6-month trends, bureau workload, ageing buckets, and active overlap callout. |
| `/institutions` | **Institution Directory** | Searchable master directory of AICTE approved colleges with risk ratings and cross-bureau counts. |
| `/institutions/:id` | **Institution Profile** | Unified institutional dossier, cross-bureau history table, overlap warnings, and institutional graph. |
| `/complaints` | **Complaint Registry** | Paginated table with filters, search, sorting, CSV export, and "Register Demo Complaint" form. |
| `/complaints/:id` | **Case Journey Details** | Visual progression bar, timestamped audit history, AI case summary, missing-info detector, delay-risk score, and document attachments. |
| `/overlap-detection` | **AI Overlap Analysis** | AI analysis workspace, scenario filters, formula breakdown, and side-by-side dual case comparison modal. |
| `/case-tracking` | **Case Pipeline Board** | Kanban and sequential tracking across all 6 procedural stages. |
| `/sla-monitoring` | **SLA & Escalations** | Within SLA, Approaching Deadline, Breached, and Escalated buckets with one-click escalation to Council. |
| `/coordination` | **Bureau Coordination** | Cross-bureau workspace between `RB` and `PGRC` with interactive action checklists and discussion feed. |
| `/case-graph` | **Case Network Graph** | Interactive Canvas topology displaying institutions, complaint nodes, and overlap bridges. |
| `/reports` | **Reports & Analytics** | Filterable reporting engine with live charts, CSV download, and printable summaries. |
| `/notifications` | **Notification Center** | Real-time alert feed with urgency filters (`CRITICAL`, `WARNING`, `INFO`). |
| `/users` | **User & Role Access** | RBAC permission matrix for Admin, Bureau Head, Case Officer, and Auditor personas. |
| `/settings` | **Settings & Config** | SLA threshold editor, overlap weight sliders, and "Reset to Factory Demo Data" button. |

---

## Role-Based Access Control (RBAC)

The application includes a simulated demo role switcher in the top navigation bar:
- **System Administrator:** Full access to all modules, settings, and database reset tools.
- **Bureau Head (`RB` / `PGRC`):** Oversees bureau workload, approves case transfers, escalates overdue cases, and initiates joint bureau inquiries.
- **Case Scrutiny Officer:** Advances case stages, inputs mandatory audit remarks, and reviews AI overlap suggestions. Cannot alter global system settings.
- **Read-Only Auditor:** Inspects records, reviews timelines, and audits compliance histories without mutation privileges.

---

## Quickstart & Local Execution

### Option 1: Using the automated launcher
```bash
./start.sh
```

### Option 2: Running Vite development server directly
```bash
npm run dev
# Server binds at: http://localhost:3000
```

### Option 3: Production Build & Python Flask Server
```bash
npm run build
python3 server.py
# Production application serves at: http://localhost:3000
```

---

## Demonstration Data Integrity & Honesty

- All seeded records (institutions, student names, grievance descriptions) are realistic demonstrations created for the Smart India Hackathon 2026.
- The AI overlap scoring engine runs deterministically in real-time within the browser runtime using natural language token extraction and normalized multi-factor heuristics.
- All modifications (status updates, new complaints, coordination action item toggles) persist locally via `localStorage` and can be reverted anytime from **Settings → Reset Factory Demo Data**.
