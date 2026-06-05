# Tofler Email Newsletter Creation Pipeline & Skill

This document is the master skill reference for generating Tofler's email newsletters. It covers the **entire pipeline**—from information gathering and copywriting to the HTML structure, design system, and brand consistency.

## 1. Information Gathering (Before Starting)
Before drafting a new email, ensure you understand the goal. If the user hasn't provided the following information, **ask them**:
- **Core Topic:** What is the specific product, feature, or insight we are highlighting?
- **Audience:** Who is receiving this email? (e.g., SME founders, Enterprise risk teams)
- **Primary Goal:** What should the user do after reading?
- **Visuals:** Are there any specific graphs, charts, or images to include?

## 2. Copywriting Pipeline
**Headline Formula:** `[Action verb] + [specific outcome]` or `[Audience] + [trigger event]`
- *Rule:* Short, direct, value-forward. Name a problem or capability. (e.g., "Stop missing hidden debt risks")

**Subheadline Formula:** `[Because/How] + [specific relief or mechanism]`
- *Rule:* One sentence that earns the read. Adds context. (e.g., "Because companies rarely operate alone")

**Content Structure (The 3-Part Arc):**
1. **The Problem (2–3 lines):** State what's broken or hidden. No preamble.
2. **The Mechanism:** Name what the tool/feature does concretely. Use checkboxes (`&#9633;`).
3. **The Reframe / Closing Line:** A bold, pithy statement elevating the message. (e.g., "Stop looking at isolated numbers. Start tracking structural health.")

**Stylistic Rules:**
- **No filler words.** Short sentences (under 12 words).
- **CTAs:** Use action verbs ("Explore Dashboard", "Benchmark Now"). Ensure there is **only 1 main CTA**, placed early (after the Hero). Do not repeat CTAs at the bottom.
- **The Footer Rhythm:** End every email with a 3-word rhythm acting as a brand signature (e.g., "Sharper analysis • Faster decisions • Zero blind spots").

## 3. Design & Brand Consistency (HTML Template)
To maintain brand consistency, the HTML generation must strictly follow these design guidelines:

**Layout & Container Structure:**
- **Wrapper:** `max-width: 680px` HTML table, centered.
- **Backgrounds:** The outer body should be light gray (`#f2f4f7`). The inner email container must be white (`#ffffff`).
- **Responsive Grids:** Always use nested HTML tables for layouts. Use the `stack-column` class for mobile responsiveness so side-by-side elements stack vertically on small screens.

**Typography & Styling:**
- **Fonts:** `Arial, Helvetica, sans-serif`.
- **H1 (Hero Title):** `30px`, Bold (`700`), Color: `#613dc1` (Tofler Purple), Line-height: `1.3`.
- **H2 (Subheadline):** `20px` to `26px`, Bold (`700`), Color: `#202124` (Dark Gray), Line-height: `1.4`.
- **H3 (Section Headers):** `24px`, Bold, Color: `#202124` or `#613dc1`.
- **Body Text:** `14px` to `16px`, Color: `#5f6368` (Medium Gray), Line-height: `1.5` to `1.6`.

**Brand Color Palette:**
- **Primary Brand Purple:** `#613dc1` (Used for headers, CTAs, and accents).
- **Primary Text:** `#202124` (Dark gray/black).
- **Secondary Text:** `#5f6368` (Medium gray).
- **Dark Sections:** `#111827` (Used for the final "Why this matters" takeaway section).

**Buttons (CTAs):**
- Background: `#613dc1`, Text color: `#ffffff`.
- Padding: `12px 22px`, Border-radius: `6px`.
- Display as `inline-block`, text decoration `none`, font size `14px` bold.

**Visuals & Icons:**
- Use clean, flat icons (e.g., from Flaticon). Standardize their sizes (e.g., `32px` width) and keep their styling consistent.
- Content images (charts, dashboard screenshots) should have the class `fluid-img` with styles `width: 100%; max-width: 100%; height: auto;` to ensure they scale responsively. Side-by-side images should be placed in a 2-column table (`48%` width each with a `4%` spacer).

**Alignment & Consistency:**
- Do not mix random alignment layouts. If the section above uses centered text or centered grids, continue that pattern. 
- Use bordered cards (`border: 1px solid #e0e0e0; border-radius: 12px;`) for lists, features, or metrics rather than plain text lists to make it feel like a polished dashboard/report.

## 4. Execution Pipeline (Step-by-Step HTML Generation)
1. **Analyze Requirements:** Review the prompt, understand the topic, identify images.
2. **Draft Copy:** Formulate the Hero, 3-part arc, and footer rhythm following the copywriting rules.
3. **Build the Head:** Create the standard HTML `<head>` with the mobile `<style>` block containing classes: `.container`, `.mobile-padding`, `.stack-column`, `.fluid-img`, etc.
4. **Assemble the Email Body:**
   - **Header:** Insert the standard Tofler logo table row.
   - **Hero Section:** Insert H1, H2, the 3-part arc content, and the single primary CTA button.
   - **Content Blocks:** Use the 2-column grid or stacked bordered cards for features/metrics. Insert icons consistently.
   - **Visuals:** Add provided charts in structured tables.
   - **Dark Takeaway Section:** Build a full-width `#111827` background cell with a final reframe statement in white/light blue text.
   - **Footer:** Append the 3-word footer rhythm, copyright text, and social links.
5. **Review:** Ensure there are no nested layout breaks, colors match the brand `#613dc1`, and the copy has no filler.
