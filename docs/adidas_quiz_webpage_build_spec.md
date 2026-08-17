# adidas Running Product Quiz — Webpage Build Spec
*A prompt/spec document for Claude Code to build a standalone quiz webpage*

---

## 1. Project Summary

Build a mobile-first, single-page web app for a retail employee training quiz on the adidas Running lineup. Employees scan a QR code on their phone, fill in their info, take a 13-question multiple-choice quiz, and see their graded score + full answer breakdown immediately on-screen (no email dependency — this is a hard requirement, explained in Section 5).

This replaces a prior Jotform-based version that could not reliably display dynamic per-person grading in an autoresponder email — the whole point of this rebuild is to have grading and results display natively and instantly in the browser, with data still captured to a backend store for the admin (me) to review later.

---

## 2. Required Intake Fields (before the quiz starts)

Collect these fields first, all required except where noted:

1. **Employee Name** (text, required)
2. **Retail Store & Specific Location** (text, required) — e.g. "Fleet Feet Cincinnati — Rookwood Commons" — this needs to capture both the store/banner name AND the specific location/branch, so structure it as either one combined text field with placeholder guidance, or two fields (Store Name + Store Location) — favor two separate fields for cleaner downstream reporting.
3. **Shoe Size** (text or number input, required) — include a toggle or dropdown for **Men's (M) / Women's (W)** sizing so the size is captured alongside the correct gendered scale (e.g. "M 10.5" or "W 8").
4. **Clothing Size** (dropdown, required) — options: XS, S, M, L, XL, XXL, with the same **M/W** designation as a toggle or paired field (adidas clothing sizing differs by men's/women's cut).
5. **Email Address** (email input, required, validated)
6. **Favorite Snack** (dropdown or short text, required) — options: Smoothie, Coffee, Candy, Other (with free text entry if "Other" is selected)

All fields should be on a clean single intake screen (or a short 2-step form) before the quiz questions begin. Validate email format and require all fields before allowing the "Start Quiz" button to activate.

---

## 3. Quiz Content — 13 Graded Multiple Choice + 1 Open-Ended

Render one question at a time (or a scrollable single page — your call on UX, but one-at-a-time with a progress bar is preferred for mobile). All 13 core questions are single-answer radio button multiple choice. Do **not** display which answer is correct until after submission.

### Section: Hyperboost Edge

**Q1.** What gives the Hyperboost Edge its "super trainer" feel without being a race-day carbon shoe?
- A) A flexible carbon EnergyRod system, lighter than a full plate
- B) A plate-free midsole where the Hyperboost Pro foam itself provides the propulsion ✅ **CORRECT**
- C) A rigid nylon shank under the arch
- D) A dual-density plate sandwiched between two foam layers

**Q2.** A customer who owns an Ultraboost asks how the Hyperboost Edge compares. What's the most accurate answer?
- A) Same Boost foam, just a new colorway
- B) A completely different, next-gen pelletized foam (Hyperboost Pro) that's lighter and springier than original Boost, in a higher stack ✅ **CORRECT**
- C) Lower stack height than Ultraboost, built for speed
- D) Identical ride, just a lifestyle-focused redesign

**Q3.** How much stack height does the Hyperboost Edge offer?
- A) 39MM
- B) 42MM
- C) 45MM ✅ **CORRECT**
- D) 36MM

**Q4.** Which best describes where the Hyperboost Edge sits in the lineup relative to the Adios Pro 4?
- A) Both are plated race shoes; the Edge is just heavier
- B) The Edge is a max-cushioned, plate-free daily/everyday shoe; the Pro 4 is a plated race-day shoe ✅ **CORRECT**
- C) The Edge is the faster of the two over 26.2 miles
- D) They're built for the identical use case, just different price points

### Section: Adios Pro 4

**Q5.** A customer training for a sub-3:30 marathon asks what actually makes the Adios Pro 4 fast. What's the most complete answer?
- A) Its high stack height alone
- B) EnergyRods 2.0 combined with an aggressive forward rocker positioned to speed up the toe-off ✅ **CORRECT**
- C) Its woven upper reduces weight enough to matter on its own
- D) It uses the same Hyperboost Pro foam as the Edge, just in a lower stack

**Q6.** What's the Adios Pro 4 well suited for?
- A) Marathon race day
- B) Half marathon race day
- C) Tempo runs and track workouts
- D) 10K race day
- E) All of the above ✅ **CORRECT**

*(Note: this question was intentionally rewritten from an earlier "NOT well suited for" phrasing to test whether employees default to picking just one option when several are true — see Section 6 for design intent notes.)*

### Section: Evo SL / Evo SL Woven

**Q7.** A customer wants a shoe that feels fast without the price tag or stiffness of a plated racer. Why is the Evo SL a strong answer?
- A) It has EnergyRods but a cheaper upper
- B) It's plate-free, lighter than a max-cushioned trainer, with a smoother, more forgiving rocker than the Pro 4 ✅ **CORRECT**
- C) It has the same carbon plate as the Adios Pro 4 at a lower price
- D) It's actually the most cushioned shoe in the lineup

**Q8.** What actually distinguishes the Evo SL Woven from the standard Evo SL?
- A) A different, softer midsole tuned for comfort
- B) Just the upper material — everything underfoot is the same shoe ✅ **CORRECT**
- C) An added rock plate for trail use
- D) A lower stack height for a more grounded feel

### Section: Supernova Rise 3

**Q9.** A customer says the Supernova Rise 3 "felt softer than I expected for a running shoe" — what's driving that?
- A) It uses the same Lightstrike Pro foam as the race shoes, just in a taller stack
- B) Its Dreamstrike+ foam is tuned specifically for a plush, comfort-first daily ride ✅ **CORRECT**
- C) It has no midsole foam, just a gel insert
- D) It shares Hyperboost Pro foam with the Edge, just less of it

### Section: Situational Scenarios

**Q10.** A customer training for their first marathon wants ONE shoe to handle both long training runs and race day, and is budget-conscious. What's the strongest single recommendation, and why?
- A) Adios Pro 4 — it's the fastest option, so it will always be the right call regardless of budget
- B) Evo SL — versatile and more affordable, though it won't have quite the race-day propulsion of a plated shoe ✅ **CORRECT**
- C) Hyperboost Edge — max cushion means it can handle literally any run type equally well
- D) Supernova Rise 3 — comfort-first foam works fine for both training and racing

**Q11.** Two customers are comparing the Hyperboost Edge and the Adios Pro 4 side by side and ask you to explain the real difference in one sentence. Which explanation actually holds up?
- A) "The Pro 4 is for racing with a propulsive rocker and EnergyRods; the Edge is a plate-free daily shoe built for cushioned comfort at any pace." ✅ **CORRECT**
- B) "They're built for the exact same purpose, just different foams."
- C) "The Edge is actually the faster shoe of the two on race day."
- D) "The Pro 4 is more comfortable for easy miles than the Edge."

**Q12.** A high school cross country runner logging 30+ miles a week wants a shoe for daily practice — not meets — that can hold up to that volume without feeling dead by mile 3 of every run. Which is the better call, and why?
- A) Adios Pro 4 — race shoes are always the best choice for serious runners
- B) Evo SL — a durable, versatile trainer built for exactly this kind of daily mileage ✅ **CORRECT**
- C) Hyperboost Edge — max stack is always the safest choice for high mileage
- D) Doesn't matter, all adidas running shoes are built the same underfoot

**Q13.** A customer picks up the Adios Pro 4 and the Evo SL and asks why one costs significantly more. What's the most accurate, specific answer?
- A) "Honestly, no real difference — adidas just prices race shoes higher"
- B) "The Pro 4 has race-tuned EnergyRods and a more aggressive rocker built for speed; the Evo SL skips the plate for a lighter, more affordable everyday trainer" ✅ **CORRECT**
- C) "The Pro 4 is heavier, and heavier shoes cost more to produce"
- D) "The Evo SL is actually the newer technology, which is why it's cheaper"

### Closing Question — Open-Ended (Not Graded)

**Q14.** In your own words: what do you love about the adidas brand, and why do you feel confident recommending it to customers who walk into the store?

*(Free text, multi-line input. No wrong answers — do not grade or score this question. Store the response for the admin to read, but exclude it from the numeric score entirely.)*

---

## 4. Grading & Results Screen (Critical Feature)

This is the core functional requirement that the previous form-builder tool (Jotform) could not reliably deliver, so build this carefully:

- **Score all 13 multiple choice questions** against the answer key above (1 point each, 13 points possible). Q14 is never scored.
- **Immediately upon submission**, show a results screen with:
  - Total score, prominently displayed (e.g. "You scored **11 / 13**")
  - A full itemized breakdown of all 13 questions: the question text, the employee's selected answer, the correct answer, and a clear visual indicator (✅ / ❌ or green/red) for right vs. wrong
  - A congratulatory or encouraging message depending on score tier (see scoring tiers below)
- This must all render client-side/immediately — **do not** rely on an external email service to deliver the score. The score display in-browser is the primary delivery mechanism.

### Scoring Tiers (for messaging/incentive framing)
- 13/13 or 12/13: "Top tier" — biggest gear incentive messaging
- 11/13 or 10/13: "Strong" — smaller reward messaging
- Below 10/13: "Solid effort" — refresher-encouraged messaging, still positive in tone

---

## 5. Data Capture / Backend

Every submission needs to be saved somewhere the admin (me) can review later — think of this as replacing "the spreadsheet" from the old form tool. Requirements:

- Store every field: Employee Name, Store Name, Store Location, Shoe Size (with M/W), Clothing Size (with M/W), Email, Favorite Snack, all 13 answers, the open-ended response, the calculated score, and a timestamp.
- A simple backend (e.g. a lightweight database, or even a flat file/JSON store or Google Sheets integration if that's easiest to stand up quickly) is fine — the priority is that nothing is lost and it's reviewable/exportable later (ideally to CSV/spreadsheet format).
- If feasible, include a simple password-protected admin view/route that lists all submissions in a sortable table (name, store, score, timestamp) — this is a nice-to-have, not a blocker for v1.

---

## 6. Design & Branding Requirements

- **Color scheme:** black background, white text, bold sans-serif typography — clean, modern, sporty. This should feel like an adidas-branded experience, not a generic form.
- **adidas-style accent details:** consider using the three-stripe motif somewhere in the header or as a subtle design accent (e.g. angled white stripe elements), consistent with adidas's visual identity.
- **Mobile-first:** the primary use case is employees scanning a QR code on their phones at a training event, so design and test for mobile viewport first, with desktop as a secondary consideration.
- **Progress indicator:** show quiz progress (e.g. "Question 4 of 13") so users know how much is left.
- **Featured product emphasis:** the Hyperboost Edge is the company's current featured push — the intake/welcome screen copy can briefly nod to this (e.g. "Let's see how well you know the new Hyperboost Edge and the rest of the lineup!"), though this is a nice-to-have tone note, not a hard requirement.

---

## 7. QR Code Access

- The final deployed webpage needs a stable, public URL that does not require login to access (this is important — a prior attempt at sharing a Claude Design/Artifact link failed because it required authentication; the deployed version must be publicly accessible with no login wall).
- Once deployed, generate or provide the final URL so a QR code can be created pointing directly to the quiz's live entry point.

---

## 8. Nice-to-Haves (Not Blocking for v1)

- A lightweight "welcome/incentive" message on the intake screen mentioning that top scorers may be eligible for a reward (keep this generic/flexible — actual reward logic and fulfillment happens outside the app).
- Basic form validation with friendly inline error messages (e.g. "Please enter a valid email").
- A simple animated transition between questions for polish.
- Ability to export all captured submissions as a CSV from the (optional) admin view.

---

## 9. Explicit Non-Goals

- No email-sending functionality is required or expected in this build — grading and results display happen entirely in-browser at submission time. This was the source of significant friction in the previous Jotform-based build and is intentionally being designed out of this version.
- No login/account creation required for employees taking the quiz — it should be a frictionless, anonymous-except-for-form-fields experience.

---

## 10. Summary of What "Done" Looks Like

An employee scans a QR code → lands on a mobile-friendly intake form (name, store + location, shoe size M/W, clothing size M/W, email, favorite snack) → clicks into a 13-question multiple choice quiz plus 1 open-ended reflection question → submits → instantly sees their score out of 13 with a full right/wrong breakdown per question → the submission (all fields + score) is saved to a reviewable backend store for the admin.
