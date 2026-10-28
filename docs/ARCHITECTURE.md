# VERINEX AI — Technical Architecture & Design Document

> **Platform:** AICTE Case Coordination Intelligence System  
> **Smart India Hackathon 2026** • Problem Statement: **SIH26264** • Team: **197631**

---

## 1. System Overview

VERINEX AI is an intelligence and coordination system designed for the All India Council for Technical Education (AICTE). It unifies grievance records across multiple internal bureaus, identifies concurrent overlapping complaints regarding the same technical institution, enforces turnaround SLAs, and provides an explainable, human-verified audit history.

---

## 2. Technology Stack

- **Frontend Framework:** React 18 with TypeScript
- **Build & Bundling:** Vite 5 with code splitting and optimized chunks
- **Styling & Design System:** Tailwind CSS with custom government palette (Royal Blue `#1D4ED8`, Slate `#0F172A`, Teal accent, AI Violet)
- **Data Visualizations:** Recharts (Donut, Multi-area trends, Grouped bar charts, Ageing distribution)
- **Icons:** Lucide React
- **Network Graph:** Canvas-based interactive topology engine representing institution hubs, complaint nodes, and overlap bridges
- **Routing:** React Router v6 with declarative nested layout routes
- **Data Persistence:** LocalStorage-backed reactive client state with pre-seeded demo records and factory reset capability
- **Server:** Python 3 + Flask API and static file serving engine (`server.py`)
- **Deployment Ready:** Vercel SPA rewrites (`vercel.json`) and GitHub Actions CI workflow (`.github/workflows/ci.yml`)

---

## 3. High-Level Architecture

```
                  +----------------------------------------------+
                  |         AICTE Grievance Portal Web App        |
                  +----------------------------------------------+
                                         |
                                         v
                  +----------------------------------------------+
                  |               App Shell & Layout             |
                  |  - Topbar (Breadcrumbs, Search, Role Switch) |
                  |  - Collapsible Sidebar with Dynamic Badges   |
                  |  - SIH 2026 Prototype Banner & Disclaimer    |
                  +----------------------------------------------+
                                         |
     +-----------------+-----------------+-----------------+-----------------+
     |                 |                 |                 |                 |
     v                 v                 v                 v                 v
[Overview]       [Institution]      [Complaint]       [AI Overlap]      [Coordination]
Dashboard         Directory &       Registry &         Detection         Workspace &
(KPIs/Charts)     Profiles          Case Journey       Engine            Action Items
```

---

## 4. Key Subsystems

### 4.1 Master Institution Repository
Aggregates technical colleges across all Indian administrative regions (Southern, Western, Northern, Eastern, Central). Stores official Permanent IDs (e.g. `1-109283711`), regional jurisdiction, approved intake programs, and cross-bureau complaint tallies.

### 4.2 Multi-Bureau Complaint Registry
Maintains comprehensive records filed under:
- **Regulation Bureau (RB):** Approval Process Handbook compliance, laboratory infrastructure, cadre ratios.
- **Public Grievance Redressal Cell (PGRC):** Student and faculty petitions, fee overcharging, withholding of certificates.
- **Chief Vigilance Cell:** Whistleblower disclosures.

### 4.3 6-Stage Case Journey Lifecycle
Enforces statutory progression:
1. `Submitted` — Intake recorded in repository.
2. `Assigned` — Designated scrutiny officer attached.
3. `Under Process` — Evidence gathering, show-cause notices.
4. `Transferred` — Inter-bureau referral with intact history.
5. `Action Taken` — Institutional compliance or penalty ordered.
6. `Disposed` — Formal closure with audit acknowledgment.

---

## 5. Security & Role-Based Access Control (RBAC)

The application simulates four distinct government tiers:

| Role | Permissions | Scope |
| :--- | :--- | :--- |
| **System Administrator** | Full read/write, algorithm tuning, user roster management, database factory reset | Whole council |
| **Bureau Head** | Oversees bureau workload, approves case transfers, escalates overdue cases, convenes joint inquiries | Designated bureau (`RB` or `PGRC`) |
| **Case Officer** | Advances case stages, inputs mandatory audit remarks, evaluates AI overlap flags | Assigned cases |
| **Read-Only Auditor** | Inspects timeline records, reviews compliance reports, audits turnaround times (all mutations restricted) | Read-only inspection |
