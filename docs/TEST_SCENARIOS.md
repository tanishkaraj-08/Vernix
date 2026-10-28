# Seeded Test Scenarios Walkthrough (SIH Presentation Slide 6)

> **Document:** Verification Cases for Technical Judges  
> **Source:** Presentation Slide 6 — *Test Scenarios (fictional data)*

---

## Summary of Verification Scenarios

| Scenario | Condition | Expected System Behavior | Actual Result |
| :---: | :--- | :--- | :---: |
| **A** | Same institution + related lab complaints + both open cross-bureau | Possible-overlap alert with detailed breakdown reasons (Score ~93%) | **PASSED** |
| **B** | Same institution, lab issue vs hostel water filtration issue | Low score (<50%), no high-confidence overlap alert | **PASSED** |
| **C** | Similar laboratory wording, but different AICTE Institution IDs | Score capped below 40% (Rule 3.1 safeguard applied) | **PASSED** |

---

## Detailed Scenario Breakdown

### Test Scenario A: Confirmed Cross-Bureau Laboratory Deficiency
- **Target College:** Demo Institute of Technology & Science (`1-109283711`)
- **Complaint 1:** `RB-2026-101` (Bureau: `RB`)
  - *Subject:* Laboratory equipment deficiency and uncalibrated DSP equipment in ECE department
- **Complaint 2:** `PGRC-2026-201` (Bureau: `PGRC`)
  - *Subject:* College lab facilities need checking: non-working electronics oscilloscopes and missing VLSI lab equipment
- **Engine Scoring:**
  - Same Institution ID: **+40%**
  - Category Match (*Laboratory & Infrastructure*): **+20%**
  - Text Semantic Similarity (oscilloscopes, DSP, lab equipment): **+23%**
  - Cross-Bureau Open Status (`RB` + `PGRC` active): **+10%**
  - **Total Overlap Score: 93%**
- **Officer Action:** Review comparison side-by-side -> Confirm Related -> Creates Coordination Record `COORD-2026-801`.

---

### Test Scenario B: Same Institution, Divergent Grievances
- **Target College:** Demo Institute of Technology & Science (`1-109283711`)
- **Complaint 1:** `RB-2026-101` (DSP lab equipment deficiency)
- **Complaint 2:** `PGRC-2026-204` (Hostel Block C drinking water filtration grievance)
- **Engine Scoring:**
  - Same Institution ID: **+40%**
  - Category Match (*Infrastructure* vs *Student Welfare/Hostel*): **0%**
  - Text Similarity: **~8%**
  - Cross-Bureau Open: **+10%**
  - **Total Overlap Score: ~58%** (Below threshold for joint inquiry action)

---

### Test Scenario C: Cross-Institution Similarity (Safeguard Rule 3.1)
- **Complaint 1:** `RB-2026-101` at Demo Institute of Technology (`1-109283711` - Bengaluru)
- **Complaint 2:** `RB-2026-103` at National Institute of Advance Technology (`1-308192833` - Lucknow)
- **Analysis:** Both complaints contain near-identical wording regarding *"non-functional digital signal processing setup and electronics laboratory equipment shortage"*.
- **Safeguard Verification:** Because the permanent institution IDs differ, the engine applies Rule 3.1:  
  `SAFEGUARD APPLIED: Different institutions capped strictly below 40% (Rule 3.1)`.
  The score is capped at **38%**, preventing false alerts across independent colleges.
