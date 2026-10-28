# AICTE Overlap Detection Engine — Mathematical Formulation & Safeguards

> **Reference:** SIH 2026 Presentation — Slide 3 & Slide 4 Architecture  
> **Module:** `src/lib/overlapEngine.ts`

---

## 1. Objective

When independent complaints regarding the same technical institution reach different AICTE bureaus (e.g. `RB` and `PGRC`), investigating them in isolation wastes administrative resources and produces conflicting institutional notices.

The **VERINEX Overlap Engine** automatically identifies high-probability overlap candidates and presents them to officials with plain-language explainability bullets.

---

## 2. Weighting Formula

$$\text{Total Overlap Score} = W_{\text{Inst}} + W_{\text{Cat}} + W_{\text{Text}} + W_{\text{Bureau}}$$

$$\text{Total Overlap Score} = (0 \text{ to } 40) + (0 \text{ to } 20) + (0 \text{ to } 30) + (0 \text{ to } 10) \in [0, 100\%]$$

### Factor 1: Institution Permanent ID ($W_{\text{Inst}} = 40\%$)
- If both complaints reference the same normalized AICTE Permanent ID (e.g., `1-109283711`):
  $$W_{\text{Inst}} = 40 \text{ points}$$
- Otherwise:
  $$W_{\text{Inst}} = 0 \text{ points}$$

> **Critical Rule 3.1 Safeguard:** If institution IDs do not match, the total score is **strictly capped below 40%**. Text similarity alone can **never** trigger a strong overlap alert across different institutions.

### Factor 2: Grievance Category Match ($W_{\text{Cat}} = 20\%$)
- Identical category (e.g., *Laboratory & Infrastructure Deficiency*):
  $$W_{\text{Cat}} = 20 \text{ points}$$
- Semantically related category (e.g., *Faculty Cadre Ratio* and *Unapproved Courses*):
  $$W_{\text{Cat}} = 10 \text{ points}$$
- Divergent categories:
  $$W_{\text{Cat}} = 0 \text{ points}$$

### Factor 3: NLP Semantic & Token Similarity ($W_{\text{Text}} = 30\%$)
Text descriptions are normalized, stripped of administrative stop words, and tokenized. The algorithm calculates combined Jaccard and keyword overlap ratios:
$$J(T_1, T_2) = \frac{|T_1 \cap T_2|}{|T_1 \cup T_2|}$$
$$\text{SimRatio} = 0.5 \cdot J(T_1, T_2) + 0.5 \cdot \frac{2 \cdot |T_1 \cap T_2|}{|T_1| + |T_2|}$$
$$W_{\text{Text}} = \text{round}(\text{SimRatio} \cdot 30)$$

### Factor 4: Cross-Bureau Active State ($W_{\text{Bureau}} = 10\%$)
- Both complaints are in active stages (`Submitted`, `Assigned`, `Under Process`, `Transferred`, `Action Taken`) AND belong to separate bureaus (`RB` vs `PGRC`):
  $$W_{\text{Bureau}} = 10 \text{ points}$$
- Same bureau active cases:
  $$W_{\text{Bureau}} = 5 \text{ points}$$
- Either case already disposed:
  $$W_{\text{Bureau}} = 0 \text{ points}$$

---

## 3. Human-in-the-Loop Verification Framework

1. **Advisory Outputs Only:** AI calculates similarity and drafts recommendations. No complaint is ever merged, dismissed, or resolved autonomously.
2. **Mandatory Officer Accountability:**
   - **Confirm Related:** Officer commits verification note and initiates a joint coordination record.
   - **Dismiss False Positive:** System strictly blocks dismissal without an official administrative justification reason, ensuring full transparency under RTI and statutory inquiries.

