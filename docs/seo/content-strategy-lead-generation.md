# Content Strategy & Lead Generation Guide

**Alluring Plastic Surgery - Miami, FL**

**Version:** 1.0  
**Last Updated:** December 2025  
**Purpose:** Comprehensive guide for creating website content that reduces friction and maximizes lead generation

> **Claims: the claims canon governs.** This guide predates the claims canon (`docs/claims/canon.md`, issue #354), which overrides it on every claim: identity and tagline, the one surgeon and her credentials, facility, experience and reviews, prices, financing, travel and market, contact, and wording. Its retired claims (luxury and affordable, Latin America and the Caribbean, double board certification, ABPS, accreditation, 5,000+ patients, 15+ years, a 4.9 rating, 0% financing, monthly payments, response-time promises) were removed or corrected on 2026-10-25. No Alluring price is typed anywhere: pages read the pricing resolver and text uses claim tokens (`packages/shared/src/claims/README.md`). Where anything below still disagrees with the canon, the canon wins.

---

## Table of Contents

1. [Business & Audience Deep Dive](#1-business--audience-deep-dive)
2. [Primary Keyword Reference](#2-primary-keyword-reference)
3. [SEO Best Practices for Medical Websites](#3-seo-best-practices-for-medical-websites)
4. [Psychological Hooks & Copywriting](#4-psychological-hooks--copywriting)
5. [Friction Reduction Strategies](#5-friction-reduction-strategies)
6. [Content Templates & Patterns](#6-content-templates--patterns)
7. [Implementation Checklists](#7-implementation-checklists)

---

## 1. Business & Audience Deep Dive

### 1.1 Business Overview

**Alluring Plastic Surgery** is a cosmetic surgery practice in Miami, FL, serving South Florida locals and patients who fly in from other US states.

| Attribute          | Details                                                                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tagline**        | "Personal care. Honest price." (#290)                                                                                                                      |
| **Industry**       | Elective cosmetic procedures                                                                                                                               |
| **Purchase Cycle** | High-consideration, research-heavy                                                                                                                         |
| **Sales Model**    | Consultation-first (every page drives to booking)                                                                                                          |
| **Credentials**    | Victoria Karlinsky, MD, FACS: board certified in general surgery by the American Board of Surgery (since 2008); Fellow of the American College of Surgeons |

**Core Value Proposition:**
Cosmetic surgery in Miami, Florida, with one surgeon: Victoria Karlinsky, MD, FACS. Prices start from the practice's published price list, financing is available, and your surgeon confirms your price at consultation.

### 1.2 Target Audience Profile

#### Primary Audience: Women 25-55

| Demographic   | Details                                           |
| ------------- | ------------------------------------------------- |
| **Age Range** | 25-55 years old                                   |
| **Gender**    | Primarily female (85%+)                           |
| **Location**  | Miami-Dade County, South Florida, other US states |
| **Device**    | 60%+ mobile users                                 |
| **Language**  | English primary, Spanish secondary                |

#### Psychographic Segments

**Segment 1: The Busy Professional (30-45)**

- High income, time-poor
- Values efficiency and quality
- Makes decisions based on credentials and results
- Willing to pay for convenience
- Research-driven but doesn't want to waste time

**Segment 2: The Post-Pregnancy Mother (28-40)**

- Seeking body restoration after childbirth
- Emotionally motivated (regaining pre-baby body)
- Budget-conscious but will invest in self
- Values safety and surgeon expertise
- Often searches "mommy makeover"

**Segment 3: The Self-Investor (25-35)**

- Career-focused, image-conscious
- Sees cosmetic surgery as personal investment
- Active on social media, influenced by Instagram/TikTok
- Compares multiple providers thoroughly
- Attracted to modern, polished aesthetics

**Segment 4: The Out-of-State Patient (30-55)**

- Lives in another US state
- Price-sensitive (seeking Miami quality at good value)
- Arranges her own travel; needs her surgery, pre-op and follow-up dates confirmed in writing and how many nights to stay in Miami before she's cleared to fly home (the practice does not coordinate travel)
- Values bilingual staff and cultural familiarity

### 1.3 Patient Journey Mapping

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PATIENT JOURNEY                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  AWARENESS          CONSIDERATION         DECISION           ACTION        │
│  ──────────         ─────────────         ────────           ──────        │
│                                                                             │
│  "I want to         "Which procedure      "Which surgeon     "Book my      │
│   change this"       is right?"            should I choose?"  consultation"│
│                                                                             │
│  ↓                  ↓                     ↓                  ↓             │
│                                                                             │
│  Blog posts         Procedure pages       Before/After       Contact form  │
│  Social media       Comparison content    Testimonials       Click-to-call │
│  Before/After       FAQ sections          Surgeon bios       Chat widget   │
│  Word of mouth      Cost information      Financing info     Consultation  │
│                     Recovery guides       Credentials        booking       │
│                                                                             │
│  EMOTIONS:          EMOTIONS:             EMOTIONS:          EMOTIONS:     │
│  Hope, desire,      Uncertainty, fear,    Trust, confidence, Excitement,   │
│  frustration        information           reassurance        commitment    │
│  with current       overload                                               │
│  appearance                                                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Key Touchpoints by Stage

**Awareness Stage (Cold)**

- Finding us via Google search ("BBL Miami", "plastic surgery Miami")
- Social media content (Instagram, TikTok)
- Friend/family referral
- Blog content answering questions

**Consideration Stage (Warm)**

- Browsing procedure pages
- Reading before/after galleries
- Checking surgeon credentials
- Comparing us to competitors
- Reading patient testimonials

**Decision Stage (Hot)**

- Reviewing financing options
- Looking at specific pricing information
- Reading FAQs about their specific procedure
- Checking location/hours
- Looking for "proof" (verified credentials, real reviews, real results)

**Action Stage (Ready to Convert)**

- Contact form submission
- Phone call
- Chat interaction
- Consultation booking

### 1.4 Pain Points & Motivations

#### Primary Pain Points

| Pain Point                                     | Emotional Driver                                | Content Solution                                                              |
| ---------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------- |
| "I don't feel confident in my body"            | Low self-esteem, avoidance behaviors            | Transformation stories, before/after showing real people                      |
| "I can't afford plastic surgery"               | Financial stress, feeling excluded              | Starting prices with the caveat; financing partners named, no payment figures |
| "I'm scared of surgery"                        | Fear of pain, complications, anesthesia         | Sourced safety facts, the surgeon's verified credentials, recovery guides     |
| "I don't know who to trust"                    | Overwhelmed by options, fear of botched results | Real reviews, verified credentials, real results                              |
| "I don't have time for long recovery"          | Busy lifestyle, can't take time off             | Recovery timeline clarity, quick procedure options                            |
| "I want results but don't want to look 'fake'" | Fear of judgment, desire for natural appearance | Natural results messaging, subtle enhancement focus                           |

#### Primary Motivations

| Motivation                                | Emotional Driver                 | Content Approach                                      |
| ----------------------------------------- | -------------------------------- | ----------------------------------------------------- |
| Look younger                              | Preserve youth, stay competitive | Anti-aging focused content, facial procedure emphasis |
| Feel confident naked                      | Intimacy, self-acceptance        | Body contouring, privacy-respecting before/afters     |
| Restore pre-pregnancy body                | Reclaim identity, self-care      | Mommy makeover content, motherhood narratives         |
| Enhance natural features                  | Self-expression, proportion      | Natural enhancement messaging                         |
| Match inner feeling with outer appearance | Alignment, authenticity          | Transformation as self-actualization                  |
| Celebrate a life milestone                | Divorce, weight loss, birthday   | Investment in self narratives                         |

### 1.5 Decision-Making Psychology

#### High-Consideration Purchase Factors

Cosmetic surgery is a **high-consideration purchase** with these characteristics:

1. **High Financial Investment**
2. **High Emotional Stakes** - Permanent body changes
3. **High Risk Perception** - Medical procedure concerns
4. **Long Research Cycle** - 3-12 months typical
5. **Multiple Decision Makers** - Often involves partner, family input

#### Trust Hierarchy for Cosmetic Surgery

Patients evaluate trust in this order:

```
1. SURGEON CREDENTIALS
   - Board certification, with the board named (ABS since 2008)
   - Fellowship (FACS) and an active Florida license
   - One surgeon performs every procedure

2. VISUAL PROOF
   - Before/after photos
   - Video testimonials
   - Gallery consistency

3. PATIENT STORIES
   - Written testimonials
   - Google reviews
   - Real patient narratives

4. SAFETY CREDIBILITY
   - Florida's office-surgery and BBL rules, as the facts files state them
   - Safety protocols the practice has confirmed in writing

5. PEER VALIDATION
   - Friend recommendations
   - Social media presence
   - Word of mouth
```

#### Positioning

"Personal care. Honest price." (#290). Show the value; never claim it: give the price and what happens, and never write "luxury" or "affordable" (claims canon §1 and §10).

**Messaging Framework:**

```
❌ AVOID: "Cheap plastic surgery"
❌ AVOID: "Discount cosmetic procedures"
❌ AVOID: "Budget-friendly surgery"

✅ USE: "Financing is available through Cherry, CareCredit and United Credit for qualified applicants."
✅ USE: "Investment in yourself with payment options"
```

---

## 2. Primary Keyword Reference

> **Full Keyword Guide:** For comprehensive keyword data organized by procedure, search intent, and content type, see [`docs/keyword-reference-guide.md`](keyword-reference-guide.md).

### 2.1 Top 20 Highest-Volume Keywords

These keywords drive the most search traffic in our industry. Prioritize these in content strategy:

| Rank | Keyword                          | Monthly Searches | Competition | Priority Use                      |
| ---- | -------------------------------- | ---------------- | ----------- | --------------------------------- |
| 1    | plastic surgery                  | 50,000           | Low (29)    | Homepage, general SEO             |
| 2    | cosmetic surgery                 | 50,000           | Low (32)    | Homepage, general SEO             |
| 3    | mommy makeover                   | 50,000           | Medium (49) | Procedure page H1                 |
| 4    | mommy makeover cost              | 50,000           | Medium (50) | Pricing section, FAQ              |
| 5    | bbl before and after             | 50,000           | Low (7)     | Gallery, image SEO                |
| 6    | tummy tuck before and after      | 50,000           | Low (20)    | Gallery, image SEO                |
| 7    | breast augmentation surgeon      | 50,000           | Low (0)     | Surgeon pages                     |
| 8    | dr miami                         | 50,000           | Low (17)    | Competitor awareness              |
| 9    | liposuction after before         | 50,000           | Low (16)    | Gallery content                   |
| 10   | breast lift how much             | 50,000           | Medium (35) | Pricing FAQ                       |
| 11   | bbl miami                        | 5,000            | High (76)   | BBL procedure page                |
| 12   | mommy makeover miami             | 5,000            | High (90)   | **TOP PRIORITY** local            |
| 13   | tummy tuck miami                 | 5,000            | High (82)   | Tummy tuck page                   |
| 14   | miami plastic surgery            | 5,000            | Medium (58) | Homepage local SEO                |
| 15   | breast augmentation miami fl     | 5,000            | High (78)   | Breast procedure page             |
| 16   | financing for plastic surgery    | 5,000            | High (69)   | Financing page                    |
| 17   | best plastic surgery near me     | 5,000            | High (71)   | Local landing page                |
| 18   | miami liposuction                | 5,000            | Low (23)    | **OPPORTUNITY** - Low competition |
| 19   | affordable plastic surgery       | 5,000            | Low (21)    | **OPPORTUNITY** - Financing       |
| 20   | plastic surgery before and after | 5,000            | Low (6)     | **OPPORTUNITY** - Gallery         |

### 2.2 Priority Keywords by Procedure

#### BBL (Brazilian Butt Lift)

| Type        | Keywords                                 | Action                  |
| ----------- | ---------------------------------------- | ----------------------- |
| **Primary** | bbl miami, brazilian butt lift miami     | Procedure page title    |
| **Gallery** | bbl before and after (50K, Low comp)     | Optimize gallery images |
| **Cost**    | bbl cost miami, how much does a bbl cost | Pricing FAQ             |
| **Combo**   | bbl and tummy tuck, bbl tummy tuck       | Combo procedure content |

#### Mommy Makeover

| Type         | Keywords                             | Action                   |
| ------------ | ------------------------------------ | ------------------------ |
| **Primary**  | mommy makeover miami (5K, HIGH comp) | Long-term SEO investment |
| **General**  | mommy makeover (50K, Medium)         | H1, procedure overview   |
| **Cost**     | mommy makeover cost miami            | Pricing section          |
| **Recovery** | mommy makeover recovery time         | Blog content             |

#### Tummy Tuck

| Type        | Keywords                               | Action               |
| ----------- | -------------------------------------- | -------------------- |
| **Primary** | tummy tuck miami (5K, HIGH comp)       | Procedure page       |
| **Gallery** | tummy tuck before and after (50K, Low) | Gallery optimization |
| **Cost**    | tummy tuck price                       | Pricing FAQ          |

#### Breast Procedures

| Type             | Keywords                                  | Action             |
| ---------------- | ----------------------------------------- | ------------------ |
| **Augmentation** | breast augmentation miami fl              | Procedure page     |
| **Lift**         | breast lift miami, boob lift miami        | Separate lift page |
| **Financing**    | breast augmentation financing (Low comp!) | **OPPORTUNITY**    |

#### Liposuction

| Type          | Keywords                      | Action                         |
| ------------- | ----------------------------- | ------------------------------ |
| **Primary**   | miami liposuction (Low comp!) | **QUICK WIN** - Procedure page |
| **Secondary** | lipo in miami                 | Local variations               |

### 2.3 Quick-Win Opportunities (Low Competition)

These keywords have LOW competition and should be prioritized for quick ranking wins:

| Keyword                          | Volume | Competition | Recommended Content                 |
| -------------------------------- | ------ | ----------- | ----------------------------------- |
| miami liposuction                | 5,000  | 23          | Optimize liposuction procedure page |
| plastic surgery before and after | 5,000  | 6           | Create/optimize gallery hub page    |
| breast augmentation financing    | 5,000  | 5           | Dedicated financing content         |
| affordable plastic surgery       | 5,000  | 21          | Financing page positioning          |
| bbl before and after             | 50,000 | 7           | Gallery image optimization          |
| tummy tuck before and after      | 50,000 | 20          | Gallery image optimization          |

### 2.4 Content Type Keyword Mapping

Use the right keywords for each content type:

| Content Type         | Keyword Pattern                   | Example                         |
| -------------------- | --------------------------------- | ------------------------------- |
| **Procedure Pages**  | [procedure] + miami               | "bbl miami", "tummy tuck miami" |
| **Gallery Pages**    | [procedure] + before and after    | "bbl before and after"          |
| **Blog Posts**       | [procedure] + recovery/guide/tips | "mommy makeover recovery time"  |
| **Pricing Content**  | [procedure] + cost/price + miami  | "bbl cost miami"                |
| **Financing Pages**  | [procedure] + financing           | "breast augmentation financing" |
| **Comparison Posts** | [procedure] + vs + [alternative]  | "bbl vs butt implants"          |

### 2.5 Search Intent Quick Reference

Understand what users want when they search:

| Intent            | Trigger Words                                 | Content Strategy                  |
| ----------------- | --------------------------------------------- | --------------------------------- |
| **Informational** | what is, how does, before and after, recovery | Blog posts, FAQ sections, guides  |
| **Commercial**    | cost, price, how much, financing, affordable  | Pricing sections, financing pages |
| **Transactional** | miami, near me, consultation, book            | Procedure pages, contact forms    |
| **Navigational**  | dr miami, [specific clinic name]              | About page, competitor awareness  |

---

## 3. SEO Best Practices for Medical Websites

### 2.1 E-E-A-T for Medical Content

Google holds medical websites to higher standards under **YMYL (Your Money or Your Life)** guidelines. Cosmetic surgery content must demonstrate:

#### Experience

Show real-world experience with procedures:

```
✅ DO:
- State the board certification with its year ("board certified in general surgery by the American Board of Surgery since 2008"); never compute a tenure
- Share verifiable facts, never procedure or patient counts
- Reference real case scenarios in content
- Include patient journey testimonials

❌ DON'T:
- Make generic claims without proof
- Use stock photos instead of real patient results
- Write content that sounds theoretical vs. practical
```

#### Expertise

Demonstrate specialized knowledge:

```
✅ DO:
- Feature the surgeon's verified credentials in the canon's wording (American Board of Surgery since 2008, FACS, Florida license ME130613). Never ABPS.
- Education and training lines only once verified (canon D9)
- Cite medical sources and studies
- Create detailed, accurate procedure descriptions

❌ DON'T:
- Oversimplify medical information
- Make claims without medical backing
- Omit important safety information
```

#### Authoritativeness

Establish the clinic as a trusted authority:

```
✅ DO:
- Highlight verified credentials only (American Board of Surgery since 2008, FACS, Florida license ME130613)
- Feature media appearances and publications that exist
- Include awards and recognition only once verified
- Link to professional associations

❌ DON'T:
- Make unverifiable claims
- Ignore competitor comparisons
- Skip credential verification
```

#### Trustworthiness

Build trust through transparency:

```
✅ DO:
- Display real patient testimonials with photos
- Include clear starting prices (from the pricing resolver, with the caveat)
- Show contact information prominently
- Provide honest recovery timeline expectations

❌ DON'T:
- Hide pricing information entirely
- Use fake or stock testimonial photos
- Omit risk information
- Make unrealistic promises
```

### 2.2 Local SEO for Miami Market

#### Google Business Profile Optimization

**Essential Information:**

- Business name: "Alluring Plastic Surgery"
- Category: "Cosmetic Surgeon" (primary). The claims canon never calls Dr. Karlinsky a "plastic surgeon" (CR7); changing the live profile's primary category is a separate owner call, because of its local-ranking impact.
- Address, hours and phone: from `siteConfig.contact` (canon §9)

**Photo Strategy:**

- Exterior facility photos (3-5)
- Interior/waiting room photos (5-10)
- Surgeon professional photos
- Before/after galleries (where allowed)
- Staff photos

**Review Strategy:**

- Target: 50+ reviews with 4.8+ average
- Respond to all reviews within 24-48 hours
- Address negative reviews professionally
- Encourage post-procedure reviews

#### Local Keyword Strategy

**Primary Local Keywords:**

| Keyword                   | Monthly Search Volume | Difficulty | Priority |
| ------------------------- | --------------------- | ---------- | -------- |
| plastic surgery miami     | 3,600                 | High       | 1        |
| bbl miami                 | 2,900                 | High       | 1        |
| breast augmentation miami | 1,300                 | Medium     | 1        |
| tummy tuck miami          | 1,000                 | Medium     | 2        |
| mommy makeover miami      | 720                   | Medium     | 2        |
| liposuction miami         | 880                   | Medium     | 2        |
| facelift miami            | 480                   | Low        | 3        |

**Long-Tail Keywords:**

| Keyword                           | Intent        | Content Type          |
| --------------------------------- | ------------- | --------------------- |
| best bbl surgeon in miami         | Comparison    | About/Surgeons page   |
| how much does a bbl cost in miami | Transactional | Procedure + Financing |
| plastic surgery financing miami   | Transactional | Financing page        |
| miami plastic surgeon reviews     | Trust         | Testimonials page     |
| mommy makeover recovery time      | Informational | Blog/FAQ              |
| bbl recovery tips                 | Informational | Blog post             |

### 2.3 Procedure-Specific Keyword Strategies

#### BBL (Brazilian Butt Lift) - Highest Volume

**Primary Keywords:**

- brazilian butt lift miami
- bbl miami
- bbl surgery miami
- fat transfer buttocks miami

**Secondary Keywords:**

- bbl recovery
- bbl cost miami
- bbl before and after
- bbl surgeon near me

**Long-Tail Keywords:**

- how long does bbl swelling last
- can you sit after bbl surgery
- what is the safest bbl technique
- bbl vs implants pros and cons

**Content Strategy:**

- Comprehensive procedure page (2,000+ words)
- FAQ section with 10+ questions
- Recovery guide blog post
- Before/after gallery with 20+ cases
- Cost and financing section

#### Breast Augmentation

**Primary Keywords:**

- breast augmentation miami
- breast implants miami
- boob job miami

**Secondary Keywords:**

- silicone implants miami
- breast enhancement
- breast surgery cost

**Long-Tail Keywords:**

- natural looking breast implants
- breast augmentation recovery time
- what size implants should i get
- breast augmentation vs lift

#### Mommy Makeover

**Primary Keywords:**

- mommy makeover miami
- post pregnancy surgery miami

**Long-Tail Keywords:**

- mommy makeover cost with financing
- how long after breastfeeding can i get mommy makeover
- what procedures are included in mommy makeover
- mommy makeover before and after

### 2.4 Schema.org Structured Data

#### Required Schema Types

**1. MedicalBusiness Schema**

```json
{
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": "Alluring Plastic Surgery",
    "description": "Cosmetic surgery in Miami, Florida, with one surgeon: Victoria Karlinsky, MD, FACS.",
    "address": "(from siteConfig.contact)",
    "telephone": "(from siteConfig.contact)",
    "priceRange": "$$$"
}
```

No `medicalSpecialty`. The description is the canon's short description (`@workspace/shared/claims/identity`), and `areaServed` covers Miami, South Florida, Florida and the United States only.

**2. Physician Schema (the one surgeon)**

Use `karlinskyPersonNode` (`apps/web/lib/seo/surgeon-graph.util.ts`): American Board of Surgery (General Surgery), FACS and the Florida license ME130613 as credentials, each linked to its record. No `medicalSpecialty`, no ASPS `memberOf`, and no ABCS credential node.

**3. FAQPage Schema**

Every procedure page should include FAQPage schema for rich snippet eligibility.

**4. Review/AggregateRating Schema**

Only on `/reviews`, built from the synced Google `ratingValue` and `totalCount` (canon D12). Never a typed rating or review count.

### 2.5 Content Length & Quality Standards

#### Procedure Pages

| Element             | Minimum | Recommended | Maximum |
| ------------------- | ------- | ----------- | ------- |
| Total word count    | 1,500   | 2,500       | 4,000   |
| H2 sections         | 5       | 8           | 12      |
| FAQ questions       | 8       | 12          | 20      |
| Before/after images | 6       | 12          | 30      |
| Internal links      | 3       | 6           | 10      |

#### Blog Posts

| Post Type            | Word Count  | Purpose            |
| -------------------- | ----------- | ------------------ |
| Procedure guides     | 1,500-2,500 | In-depth education |
| Recovery tips        | 1,000-1,500 | Practical help     |
| News/updates         | 500-800     | Timely information |
| Before/after stories | 800-1,200   | Social proof       |
| FAQ roundups         | 1,200-2,000 | SEO capture        |

---

## 4. Psychological Hooks & Copywriting

### 4.1 Emotional Triggers for Cosmetic Surgery

Understanding the emotional drivers behind cosmetic surgery decisions:

#### The Transformation Narrative

Patients aren't buying a procedure - they're buying a **transformation**. The emotional journey:

```
CURRENT STATE              →              DESIRED STATE
────────────────                          ────────────────
Avoiding mirrors                          Loving what you see
Hiding body in clothes                    Wearing what you want
Feeling invisible                         Commanding attention
Low confidence                            Walking tall
Avoiding photos                           Taking selfies with pride
```

**Content Application:**

- Lead with the desired emotional state, not the procedure
- Use transformation language: "become," "reveal," "discover"
- Show the journey, not just the destination

#### Core Emotional Drivers

**1. Confidence Restoration**

```
✅ EFFECTIVE:
"Walk into any room knowing you look as good as you feel."
"Reclaim the confidence that's been waiting inside you."

❌ INEFFECTIVE:
"Get bigger breasts with our implant procedure."
"Enhance your buttocks with fat transfer."
```

**2. Self-Investment**

```
✅ EFFECTIVE:
"This is your moment to invest in yourself."
"You've put everyone else first. Now it's your turn."

❌ INEFFECTIVE:
"Book surgery now."
"Don't wait - call today."
```

**3. Alignment (Inner/Outer Match)**

```
✅ EFFECTIVE:
"Finally look the way you've always felt inside."
"Your outside should match your inside."

❌ INEFFECTIVE:
"Fix your imperfections."
"Correct your problem areas."
```

**4. Life Milestone Celebration**

```
✅ EFFECTIVE:
"Celebrate your new chapter with a fresh start."
"You've earned this transformation."

❌ INEFFECTIVE:
"Surgery specials this month."
"Book before prices increase."
```

### 4.2 Pain-Agitate-Solution Framework

Adapted for cosmetic surgery messaging:

#### Framework Structure

**PAIN:** Identify the specific struggle
**AGITATE:** Deepen the emotional impact
**SOLUTION:** Position procedure as the answer

#### Example: BBL Page Hero

**PAIN:**

> You've tried everything—diets, exercises, shapewear. But your curves still don't reflect the confidence you feel inside.

**AGITATE:**

> Every outfit is a compromise. Every beach day comes with anxiety. You deserve to feel proud of your silhouette, not hide from it.

**SOLUTION:**

> A Brazilian Butt Lift uses your own body fat to create natural, beautiful curves. Sculpt your waist while enhancing your shape—no implants, just you, elevated.

#### Example: Mommy Makeover Hero

**PAIN:**

> Pregnancy changed your body in ways diet and exercise can't undo. You're proud of being a mother—but you miss feeling like yourself.

**AGITATE:**

> You put your family first every single day. But when you look in the mirror, you barely recognize the woman you used to be. That doesn't feel fair.

**SOLUTION:**

> A Mommy Makeover restores what pregnancy changed—your breasts, your tummy, your confidence. One procedure, full transformation, designed around your goals.

### 4.3 Trust-Building Content Elements

#### Before/After Gallery Best Practices

**Photo Requirements:**

- Consistent lighting and positioning
- Multiple angles (front, side, 45°)
- Clear "before" and "after" labels
- Time since procedure noted
- Similar clothing/positioning

**Gallery Page Elements:**

- Filter by procedure type
- Filter by body type (when appropriate)
- Include brief patient story with each
- Display results at 3, 6, and 12 months when available

**Trust Signals Within Gallery:**

- "Unretouched photos"
- "Real patients, real results"
- Procedure name and surgeon for each case

#### Testimonial Best Practices

Testimonials are real Google reviews only, as synced and unedited (marked "Translated by Google" where Google translated them). Never write, paraphrase, merge or cherry-pick one (canon §4). The structure and example below describe what makes a real review effective to feature; they are not copy to write.

**Effective Testimonial Structure:**

```
"[Specific result achieved]. [Emotional impact]. [Experience with clinic/surgeon]."
— [First Name], [Procedure], [Time Since Surgery]
```

**Example:**

```
"I finally feel comfortable in a bikini for the first time in 10 years.
The confidence boost has affected every part of my life—my career,
my relationships, everything. Dr. [Name] made me feel safe from the
very first consultation."
— Maria, BBL + Liposuction, 8 months post-op
```

**Testimonial Placement Strategy:**

- Hero section: 1 short, powerful quote
- Mid-page: 2-3 relevant testimonials
- Before booking CTA: Social proof cluster
- FAQ section: Relevant patient experience quotes

#### Credential Display

**Surgeon Credentials (Display Prominently), in the canon's wording only:**

- Board certified in general surgery by the American Board of Surgery since 2008
- Fellow of the American College of Surgeons
- Active Florida medical license ME130613, no discipline on record
- One surgeon performs every procedure at Alluring
- Each credential linked to the issuing body's record (`karlinskyRecords`)

**Trust Statistics:**

- Rating: 4.7 on Google, read from the synced `google_reviews_settings` (`siteConfig.trustStats.rating` as the fallback only)
- Review count: from the synced `totalCount`, never typed

### 4.4 Communicating Value

Show the value; never claim it (canon §1). Give the starting price (from the pricing resolver, with the caveat), name the financing partners, and say what happens next.

#### Messaging Patterns

**Pattern 1: Financing**

```
"Financing is available through Cherry, CareCredit and United Credit
for qualified applicants. See financing."
```

**Pattern 2: Investment Reframe**

```
"You're investing in a result you'll live with every day. Financing is
available through Cherry, CareCredit and United Credit for qualified
applicants."
```

#### Financing Messaging Guidelines

**DO:**

- Mention financing options early (hero or second section)
- Include specific partner names (Cherry, CareCredit, United Credit), with the shared sentence (`FINANCING_SENTENCE_SHORT`, `[[financing]]`)
- Say approval and terms are set by the lender
- Position financing as smart, not desperate

**DON'T:**

- Make cost the primary message (leads to price shoppers)
- Use "cheap" or "discount" language
- Quote a weekly or monthly payment, APR, "0%", a term or "as low as" (Reg Z trigger terms; canon §6)
- Claim fast, easy, instant or guaranteed approval
- Hide financing until contact
- Make patients feel embarrassed about needing financing

### 4.5 Storytelling Patterns

#### The Transformation Arc

Structure patient stories and testimonials using this arc:

```
1. BEFORE (The Struggle)
   "For years, I avoided..."
   "I never felt comfortable..."
   "I dreamed of..."

2. DECISION (The Turning Point)
   "When I finally decided..."
   "My consultation changed everything..."
   "I knew I had found the right surgeon when..."

3. EXPERIENCE (The Journey)
   "The day of surgery..."
   "The team made me feel..."
   "Recovery was..."

4. AFTER (The Transformation)
   "Now I..."
   "For the first time in my life..."
   "The confidence I feel..."

5. IMPACT (The Ripple Effect)
   "This has affected..."
   "People notice..."
   "My life has changed because..."
```

#### Narrative Integration on Procedure Pages

Don't just describe procedures—weave in patient narratives:

```
❌ CLINICAL ONLY:
"The BBL procedure involves harvesting fat from donor sites
via liposuction, processing the fat cells, and reinjecting
them into the buttocks."

✅ NARRATIVE + CLINICAL:
"Maria had tried every gym exercise for three years. Her results
never matched her effort. Now, with a Brazilian Butt Lift,
her own body fat—harvested gently via liposuction and carefully
processed—creates the curves that finally match her confidence."
```

---

## 5. Friction Reduction Strategies

### 5.1 Mobile-First Optimization

With 60%+ mobile users, mobile experience is paramount:

#### Mobile UX Priorities

**1. Tap Targets**

- All buttons minimum 44x44px
- Adequate spacing between interactive elements
- Thumb-friendly placement for CTAs

**2. Page Speed**

- Target: < 3 seconds load time
- Optimize images (WebP format)
- Minimize JavaScript blocking
- Use Next.js Image component

**3. Sticky Elements**

- Floating "Call Now" button on mobile
- Sticky header with phone number
- Easy access to chat widget

**4. Form Optimization**

- Single-column forms only
- Large input fields
- Autofill enabled
- Numeric keyboard for phone fields

#### Mobile CTA Placement

```
┌─────────────────────────────────────┐
│           HEADER (sticky)           │
│  [Logo]            [☎ Call Now]    │
├─────────────────────────────────────┤
│                                     │
│           HERO CONTENT              │
│                                     │
│    [Book Consultation - Primary]    │
│    [Call Us - Secondary]            │
│                                     │
├─────────────────────────────────────┤
│                                     │
│           PAGE CONTENT              │
│                                     │
├─────────────────────────────────────┤
│                                     │
│      FLOATING CTA (sticky bottom)   │
│  [📞 Call Now]  [💬 Chat]          │
│                                     │
└─────────────────────────────────────┘
```

### 5.2 Form Optimization

#### Minimal Field Strategy

**Contact Form Fields:**

| Field              | Required?      | Purpose             |
| ------------------ | -------------- | ------------------- |
| First Name         | Yes            | Personalization     |
| Phone              | Yes            | Primary follow-up   |
| Email              | Yes            | Secondary follow-up |
| Procedure Interest | Yes (dropdown) | Lead qualification  |
| Message            | No             | Additional context  |

**Why Minimal:**

- Each additional field tends to lower completion
- Collect detailed info during consultation, not on form
- Phone is highest-priority for conversion

#### Form Placement Strategy

**High-Intent Pages (Procedure, Contact):**

- Form visible without scrolling
- Floating form option on long pages
- Form at top AND bottom of page

**Medium-Intent Pages (About, Gallery):**

- CTA buttons to contact page
- Inline form at page end
- Sticky header with contact option

**Low-Intent Pages (Blog, FAQ):**

- Soft CTAs within content
- Newsletter signup option
- Related procedure links

#### Form UX Best Practices

```
✅ DO:
- Use progress indicators for multi-step forms
- Show inline validation (green checkmarks)
- Provide clear error messages
- Include "We'll never share your info" privacy note
- Show what happens next ("We'll text you to set up your consultation"), never a promised response time

❌ DON'T:
- Require account creation
- Ask for unnecessary information
- Use CAPTCHA that frustrates users
- Have forms that are hard to find
- Leave users wondering if form submitted
```

### 5.3 Click-to-Call Optimization

Phone calls usually convert better than forms for cosmetic surgery.

#### Click-to-Call Placement

**Primary Locations:**

- Header (always visible)
- Hero section (as secondary CTA)
- Floating mobile button
- Footer
- Contact page

**Contextual Placement:**

- After pricing/financing sections
- After FAQ sections
- After testimonials
- Next to form (as alternative)

#### Click-to-Call Messaging

```
✅ EFFECTIVE:
"Call to discuss your options: [phone from siteConfig]"
"Have questions? Call us"
"Ready to book? Call now: [phone from siteConfig]"

❌ INEFFECTIVE:
"Call us"
"Contact"
"Phone"
```

### 5.4 Chat/Concierge Integration

#### Chat Widget Best Practices

**Timing:**

- Appear after 30-60 seconds (not immediately)
- Trigger on exit intent
- Activate on pricing/financing pages faster

**Messaging:**

```
INITIAL MESSAGE:
"Hi, I'm Sofía, our concierge. Have questions about a
procedure or want help scheduling? I'm here to help."

NOT:
"Welcome to Alluring Plastic Surgery! How can I help you today?"
(Too generic, sounds automated)
```

**Quick Responses to Offer:**

- "What does a BBL cost?"
- "How do I schedule a consultation?"
- "What financing options do you have?"
- "I have a question about recovery"

#### Response Time Expectations

Say what happens next, never a response time (canon §9):

```
Form: "We'll text you to set up your consultation"
Phone: "Call us Monday–Friday 9 AM–5 PM, Saturday 9 AM–3 PM" (hours from siteConfig)
```

### 5.5 Financing Friction Reduction

Cost is the #1 friction point. Address it proactively.

#### Financing Messaging Placement

**Hero Section:**
Brief mention of financing availability

```
"Flexible financing available. See your options →"
```

**Dedicated Section (mid-page):**
Expand on financing options without making it the focus

```
## Your Investment, Your Terms

Financing is available through Cherry, CareCredit and United
Credit for qualified applicants. Approval and terms are set by
the lender.

[Check Your Options →]
```

**Near CTAs:**
Reduce friction at the conversion point

```
"Financing is available. Book your consultation to discuss
your options."
```

#### Pricing Transparency Strategy

**What to Show:**

- The "starting at" price per procedure, from the pricing resolver, with the variant named and the price caveat. No ranges, except BBL's "most patients pay" range (`[[price-range:bbl]]`)
- The consultation and what happens at it
- What's included: BBL page only, until the practice confirms one inclusion list for every procedure (canon D4). Never "no hidden fees" or "all-inclusive"

**What NOT to Show:**

- Exact pricing before consultation (procedure requires customization)
- Competitor pricing comparisons
- "Cheap" or discount positioning

---

## 6. Content Templates & Patterns

### 6.1 Hero Section Formulas

#### Procedure Page Hero

**Structure:**

```
[BADGE]: Procedure Category
[HEADLINE]: Outcome-focused, with no promise of results
[SUBHEADLINE]: Procedure benefit + credibility
[CTA PRIMARY]: Book Consultation
[CTA SECONDARY]: Learn More / Call Us
[TRUST ELEMENTS]: Verified facts only (canon §2 and §4)
```

**Example - BBL Page:**

```
[BADGE]: Body Contouring

[HEADLINE]:
Curves That Turn Heads. Confidence That Lasts.

[SUBHEADLINE]:
Enhance your natural silhouette with a Brazilian Butt Lift
that uses your own fat.

[TRUST ELEMENTS]:
✓ Board certified in general surgery (American Board of Surgery) since 2008 | ✓ One surgeon performs every procedure | ✓ Financing available

[CTA PRIMARY]: Book Your Consultation
[CTA SECONDARY]: Call [phone from siteConfig]
```

#### Homepage Hero

**Structure:**

```
[BADGE]: Brand positioning
[HEADLINE]: Core value proposition
[SUBHEADLINE]: Proof + invitation
[CTA]: Primary conversion action
[SOCIAL PROOF]: Key statistic or testimonial snippet
```

**Example:**

```
[BADGE]: Cosmetic surgery in Miami

[HEADLINE]:
Personal care. Honest price.

[SUBHEADLINE]:
One surgeon: Victoria Karlinsky, MD, FACS. Starting prices
published, and financing available for qualified applicants.

[TRUST]: 4.7★ on Google (read from the synced google_reviews_settings) | Board certified in general surgery by the ABS since 2008 | One surgeon performs every procedure

[CTA PRIMARY]: Book Your Consultation
[CTA SECONDARY]: Explore Procedures
```

### 6.2 FAQ Optimization

#### FAQ Writing for Featured Snippets

Structure FAQs to capture voice search and featured snippets:

**Question Format:**

- Use natural question phrasing
- Start with "What," "How," "Is," "Can," "Does"
- Match how users actually search

**Answer Format:**

- Start with a direct answer (first sentence)
- Expand with detail (2-3 sentences)
- Include specific data when possible

**Example - Optimized FAQ:**

```
Q: How long does BBL recovery take?

A: Most people return to desk work and driving 10 to 14 days
after a BBL, sitting on a pillow (Cleveland Clinic, The
Aesthetic Society); ASPS says some go back between days 7 and
10. Cleveland Clinic puts full recovery at 2 to 3 months, and
notes it can take up to 6. For at least 2 weeks you avoid
sitting or lying on your buttocks (Cleveland Clinic). After
the first month, light activity such as fast walking is fine
(Kamran Azad, MD, in an ASPS article), and The Aesthetic
Society says exercise can resume after 8 weeks, once your
surgeon clears you.
```

#### FAQ Categories for Procedure Pages

**Category 1: Procedure Basics**

- What is [procedure]?
- Am I a candidate for [procedure]?
- How is [procedure] different from [alternative]?

**Category 2: Process & Timeline**

- How long does [procedure] take?
- What happens during consultation?
- How should I prepare for [procedure]?

**Category 3: Results & Recovery**

- How long is [procedure] recovery?
- When will I see results?
- Are results permanent?

**Category 4: Safety & Risks**

- Is [procedure] safe?
- What are the risks of [procedure]?
- What if I'm not happy with results?

**Category 5: Cost & Logistics**

- How much does [procedure] cost?
- Do you offer financing?
- Is [procedure] covered by insurance?

### 6.3 Blog Post Templates

#### Procedure Guide Template

```markdown
# [Procedure Name] in Miami: Your Complete Guide

**TL;DR**

- [Key benefit 1]
- [Key benefit 2]
- [What to expect briefly]

## What Is [Procedure]?

[2-3 paragraphs explaining the procedure in accessible language]

## Am I a Candidate for [Procedure]?

### Ideal Candidates

- [Characteristic 1]
- [Characteristic 2]
- [Characteristic 3]

### Who Should Wait

- [Contraindication 1]
- [Contraindication 2]

## The [Procedure] Process

### Step 1: Consultation

[Description]

### Step 2: Preparation

[Description]

### Step 3: The Procedure

[Description]

### Step 4: Recovery

[Description]

## [Procedure] Results: What to Expect

[Timeline of results with realistic expectations]

## [Procedure] Cost and Financing

[Cost context without exact pricing + financing options]

## Why Choose Alluring Plastic Surgery for Your [Procedure]

[Differentiation + credentials]

## Ready to Learn More?

[Soft CTA with consultation invitation]

---

## Frequently Asked Questions

[5-8 FAQs in proper format]
```

#### Recovery Guide Template

```markdown
# [Procedure] Recovery: Week-by-Week Guide

**Quick Overview**

- Time off work: [X days/weeks]
- Return to exercise: [X weeks]
- Full results: [X months]

## Before Your [Procedure]: Preparation Checklist

- [ ] [Prep item 1]
- [ ] [Prep item 2]
- [ ] [Prep item 3]

## Week 1: The First Days

### What to Expect

[Honest description of immediate post-op]

### Tips for Week 1

- [Tip 1]
- [Tip 2]

## Week 2-3: Early Recovery

[Content]

## Week 4-6: Return to Normal

[Content]

## Month 2-3: Seeing Results

[Content]

## 6 Months and Beyond: Your New Normal

[Content]

## Warning Signs: When to Call Us

[Important safety information]

## Recovery FAQs

[Relevant recovery questions]
```

### 6.4 CTA Copy Variants

#### Consultation CTAs

**Primary (High Commitment):**

- "Schedule Your Consultation"
- "Book Your Consultation"
- "Start Your Transformation"

**Secondary (Lower Commitment):**

- "Learn More"
- "See Our Results"
- "Call to Discuss Options"

No urgency or scarcity CTAs ("limited appointments", "filling fast"): the canon bans fake urgency (§10).

#### Phone CTAs

**Direct:**

- "Call [phone from siteConfig]"
- "Speak With Our Team"
- "Call to Discuss Your Goals"

**Benefit-Focused:**

- "Get Answers Today - Call Us"
- "Questions? We're Here to Help"

#### Chat CTAs

- "Chat with our concierge"
- "Ask a Question"
- "Get Quick Answers"

### 6.5 Trust Signal Placement

#### Above the Fold (Every Page)

```
[Header]: Phone number visible
[Hero Area]: The synced Google rating (4.7, from google_reviews_settings)
[Hero Area]: Credential line (Victoria Karlinsky, MD, FACS; board certified in general surgery by the American Board of Surgery)
```

#### Procedure Pages

```
[Hero]: Trust statistics
[After Overview]: Surgeon credentials
[Mid-Page]: 2-3 testimonials
[Before/After Section]: "Real patients, real results"
[Before CTA]: Trust cluster (stats + credentials + testimonial)
[FAQ Area]: Relevant testimonial quotes
```

#### Contact/Booking Pages

```
[Hero]: "No-obligation consultation"
[Form Area]: Privacy assurance
[After Form]: What to expect next
[Sidebar]: Trust statistics + testimonial
```

---

## 7. Implementation Checklists

### 7.1 Pre-Publish Content Checklist

Before publishing ANY page or blog post:

#### Brand & Voice

- [ ] No prohibited words (revolutionize, cutting-edge, world-class, seamlessly, and everything the claims canon §10 bans)
- [ ] No claim the claims canon (`docs/claims/canon.md`) removes, and no typed Alluring price (resolver or claim tokens only)
- [ ] Uses active voice primarily
- [ ] Sentences average 15-20 words
- [ ] Matches Alluring brand voice ("Personal care. Honest price.": plain words, no "luxury" or "affordable")
- [ ] Speaks to emotional drivers, not just features

#### SEO Essentials

- [ ] Primary keyword in H1 (page title)
- [ ] Primary keyword in first 100 words
- [ ] Secondary keywords in H2 subheadings
- [ ] Meta title: 50-60 characters with keyword
- [ ] Meta description: 150-160 characters, compelling
- [ ] URL slug is descriptive and keyword-rich
- [ ] Image alt text is descriptive (not "image1.jpg")
- [ ] Internal links to 3-5 related pages
- [ ] External links to authority sources (when appropriate)

#### E-E-A-T Requirements

- [ ] Author/surgeon attribution where appropriate
- [ ] Credentials mentioned or linked, in the canon's wording only
- [ ] Medical accuracy verified
- [ ] Risks/limitations honestly addressed
- [ ] Real patient testimonials (not stock)

#### Conversion Elements

- [ ] Clear primary CTA visible without scrolling
- [ ] Phone number accessible
- [ ] Chat widget functional
- [ ] Financing mentioned (procedure pages)
- [ ] Trust signals present (synced rating, verified credentials, real reviews)
- [ ] Mobile-optimized layout

#### Technical

- [ ] Page loads in < 3 seconds
- [ ] Images optimized (WebP, compressed)
- [ ] Schema.org structured data implemented
- [ ] Mobile-responsive design verified
- [ ] All links functional
- [ ] Form submission tested

### 7.2 Page-by-Page Optimization Guide

#### Homepage

| Element              | Requirement                    | Priority |
| -------------------- | ------------------------------ | -------- |
| Hero headline        | Clear value prop, emotional    | Critical |
| Trust stats          | 3-4 key metrics visible        | Critical |
| Procedure preview    | 4-6 procedures with images     | High     |
| Testimonial          | 1-2 powerful quotes            | High     |
| Before/After preview | 4-6 compelling transformations | High     |
| Surgeon introduction | Brief credibility section      | Medium   |
| Financing mention    | Brief, linked to page          | Medium   |
| FAQ section          | 6-8 common questions           | Medium   |
| Final CTA            | Strong conversion section      | Critical |

#### Procedure Pages

| Element              | Requirement                           | Priority |
| -------------------- | ------------------------------------- | -------- |
| Hero                 | Transformation promise + trust stats  | Critical |
| Quick stats          | Duration, recovery, anesthesia        | High     |
| Overview             | What is the procedure (300-500 words) | Critical |
| Candidate criteria   | Who is this for                       | High     |
| Benefits             | 4-6 specific benefits                 | High     |
| Process steps        | Step-by-step explanation              | High     |
| Before/After gallery | 10+ cases                             | Critical |
| Recovery info        | Timeline and expectations             | High     |
| FAQ section          | 10-12 questions                       | Critical |
| Financing section    | Options and CTA                       | High     |
| Final CTA            | Consultation booking                  | Critical |

#### Financing Page

| Element             | Requirement                                                                    | Priority |
| ------------------- | ------------------------------------------------------------------------------ | -------- |
| Reassuring headline | Remove money anxiety                                                           | Critical |
| Partner logos       | CareCredit, Cherry, etc.                                                       | High     |
| How it works        | Simple 3-4 step process                                                        | High     |
| Lender terms        | "Approval and terms are set by the lender"; no approval, APR or payment claims | High     |
| FAQ                 | 6-8 financing questions                                                        | High     |
| CTA                 | Check options / Contact us                                                     | Critical |

#### About Page

| Element          | Requirement                                      | Priority |
| ---------------- | ------------------------------------------------ | -------- |
| Story/mission    | Why we exist                                     | High     |
| Surgeon profile  | Credentials and photos                           | Critical |
| Facility tour    | Images of clinic                                 | High     |
| Credential links | ABS (since 2008), FACS, Florida license ME130613 | High     |
| Values/approach  | What makes us different                          | Medium   |
| CTA              | Book consultation                                | High     |

#### Contact Page

| Element        | Requirement                                   | Priority |
| -------------- | --------------------------------------------- | -------- |
| Simple form    | 4-5 fields maximum                            | Critical |
| Phone number   | Click-to-call prominent                       | Critical |
| Hours          | Clear business hours                          | High     |
| Location       | Map and address                               | High     |
| Next step      | What happens next (no promised response time) | High     |
| What to expect | After form submission                         | Medium   |

### 7.3 A/B Testing Priorities

Test these elements in order of expected impact:

#### Priority 1: High Impact (Test First)

| Test                           | Hypothesis                                              | Metric           |
| ------------------------------ | ------------------------------------------------------- | ---------------- |
| Hero CTA text                  | "Book Your Consultation" vs "Start Your Transformation" | Form submissions |
| Mobile click-to-call placement | Floating vs. header only                                | Phone calls      |
| Form fields                    | 5 fields vs. 3 fields                                   | Completion rate  |
| Financing mention in hero      | With vs. without                                        | Bounce rate      |

#### Priority 2: Medium Impact

| Test                        | Hypothesis             | Metric        |
| --------------------------- | ---------------------- | ------------- |
| Before/after gallery layout | Grid vs. slider        | Time on page  |
| Testimonial format          | Text vs. video         | Engagement    |
| Trust stat display          | Numbers vs. badges     | Click-through |
| FAQ placement               | Collapsed vs. expanded | Scroll depth  |

#### Priority 3: Refinement

| Test                   | Hypothesis                  | Metric      |
| ---------------------- | --------------------------- | ----------- |
| CTA button color       | Gold vs. stone              | Click rate  |
| Form button text       | "Submit" vs. "Get in Touch" | Completion  |
| Chat widget timing     | 30s vs. 60s delay           | Engagement  |
| Page header variations | Different headlines         | Bounce rate |

---

## Appendix: Quick Reference

### Trust Statistics (Use Consistently)

From the claims canon (`@workspace/shared/claims/trust`):

- Board certified in general surgery since: 2008 (American Board of Surgery)
- Fellow of the American College of Surgeons; Florida license ME130613
- One surgeon performs every procedure
- Patient rating: 4.7 on Google (read from the synced `google_reviews_settings`; `siteConfig.trustStats.rating` as the fallback only)

### Contact Information

From `siteConfig.contact` (canon §9):

- Phone: +1 (786) 305-8649
- Email: info@alluringplasticsurgery.com
- Address: 8435 SW 24th St, Miami, FL 33155
- Hours: Mon-Fri 9AM-5PM, Sat 9AM-3PM; closed Sunday and public holidays

### Financing Partners

- Cherry
- CareCredit
- United Credit

### Prohibited Words & Phrases

Never use in content:

- Revolutionary / revolutionize
- Game-changing / game-changer
- Cutting-edge
- World-class
- Best-in-class
- Blazing fast
- Seamlessly / seamless
- Leverage
- Transform (as buzzword)
- Empower
- In today's fast-paced world
- Unlock the potential
- Take it to the next level
- Everything the claims canon removes: "luxury", "affordable", superlatives about the practice, the surgeon or results, guarantees, volume or tenure counts, accreditation, payment figures, travel help (`docs/claims/canon.md` §10 and §11)

### Approved Messaging Patterns

Show the value; never claim it. Give the price and what happens.

- "Financing is available through Cherry, CareCredit and United Credit for qualified applicants."
- "Your investment, your terms"
- "Personalized care"
- "Natural-looking results"

---

**Document Version:** 1.0  
**Created:** December 2025  
**Maintained By:** Content Team  
**Review Schedule:** Quarterly

---

_This document should be used in conjunction with:_

- [`docs/claims/canon.md`](../claims/canon.md) - The claims canon (overrides this document on every claim)
- [`docs/brand/brand-guidelines.md`](brand/brand-guidelines.md) - Visual and voice guidelines
- [`docs/blog-writing-guidelines.md`](blog-writing-guidelines.md) - Blog-specific guidelines
- [`.cursor/rules/seo-content-expert.mdc`](../.cursor/rules/seo-content-expert.mdc) - AI agent rules
