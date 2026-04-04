# 🧠 IdeaVerdict

> **AI-powered startup idea stress-tester. Get investor-grade feedback in 60 seconds — not hype.**

Built for the **OceanLab × CHARUSAT Hacks 2026** · April 3–5, DEPSTAR Campus · Theme: *Build AI-First SaaS*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-ideaverdict.vercel.app-black?style=flat-square)](https://ideaverdict.vercel.app)
[![Built with Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![Gemini 2.5 Flash](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-4285F4?style=flat-square&logo=google)](https://ai.google.dev)
[![UI by Watermelon](https://img.shields.io/badge/UI-Watermelon%20sh-FF6B6B?style=flat-square)](https://ui.watermelon.sh)

---

## 🚀 What Is IdeaVerdict?

Most startup feedback is either **generic encouragement** or **vague negativity**. Neither helps founders build better.

IdeaVerdict runs your startup idea through the **IVSM framework** — 6 scored dimensions, each out of 10 — and returns one of four honest verdicts with specific, actionable critique. Think of it as a brutally honest co-founder who has read every YC rejection letter.

### The Four Verdicts

| Verdict | Score | Meaning |
|---|---|---|
| ✅ **Build It** | 50–60 | Strong fundamentals. Ship it. |
| 🔄 **Pivot It** | 40–49 | Core insight is valid. Execution needs rethinking. |
| ❌ **Drop It** | 25–39 | Fundamental problems. Don't waste runway. |
| 💡 **Sleeper Hit** | Override | High differentiation + revenue potential in a quiet market. |

> **Sleeper Hit** is a hard numerical override — not AI discretion. It triggers when competition ≥7, revenue ≥7, India fit ≥6, and there are ≤2 well-known competitors.

---

## ⚙️ The IVSM Scoring Model (v1.1)

Six factors, each scored **0–10**, for a maximum of **60 points**.

| # | Factor | What It Measures |
|---|---|---|
| 1 | **Problem Clarity** | Is the problem real, specific, and painful enough? |
| 2 | **Target User Fit** | Is the user segment clearly defined and reachable? |
| 3 | **India Market Fit** | Does this work in the Indian context — price, behaviour, infrastructure? |
| 4 | **Competition & Differentiation** | Is there room, and does this idea own a distinct position? |
| 5 | **Domain Expertise Required** | Can a first-time founder realistically execute this? |
| 6 | **First Revenue Likelihood** | How quickly can this generate real revenue, not just users? |

Each analysis also returns:
- **Why This Will Fail** — 3 idea-specific failure modes (no generic answers)
- **Confidence Score** — 8 deterministic binary checks on input quality (max 100%)
- **Competitor Confidence** — High / Medium / Low (model reasons from training data only, no live web search)

---

## 🛠️ Tech Stack

```
Frontend    →  React + Vite + Tailwind CSS
UI Library  →  Watermelon UI (ui.watermelon.sh)
Auth + DB   →  Supabase (PostgreSQL + Row Level Security)
AI Proxy    →  Supabase Edge Function (Deno) — API key never exposed client-side
AI Model    →  Gemini 2.5 Flash via Google AI Studio
              Base URL: https://generativelanguage.googleapis.com/v1beta/openai/
Hosting     →  Vercel
```

### Why Watermelon UI?

We're using [**ui.watermelon.sh**](https://ui.watermelon.sh) for the component layer. It gave us production-grade, accessible UI components with a clean design system that we could customise with Tailwind — without spending hackathon hours rebuilding buttons and modals from scratch. It directly contributed to the polish of the results dashboard and the verdict badge system.

### Why Gemini 2.5 Flash?

Fast, cheap, and capable of structured JSON output — exactly what IVSM needs. We call it through a **Supabase Edge Function** that injects the system prompt, validates the JWT, and handles rate limiting server-side. The API key never touches the client.

---

## 🗄️ Database Schema

```sql
-- Users (auto-created on signup via Supabase trigger)
profiles (
  id          uuid references auth.users primary key,
  email       text,
  created_at  timestamptz default now()
)

-- All analyses are stored per user
analyses (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references profiles(id),
  idea_title  text,
  idea_slug   text,           -- server-injected, URL-safe identifier
  result      jsonb,          -- full IVSM JSON output
  scored_at   timestamptz,    -- server-injected timestamp
  created_at  timestamptz default now()
)
```

**RLS Policy:** `auth.uid() = user_id` — users can only read and write their own analyses.

---

## 🏃 Running Locally

### Prerequisites

- Node.js 18+
- Supabase CLI
- A Google AI Studio API key ([get one free here](https://aistudio.google.com))

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/ideaverdict.git
cd ideaverdict

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 4. Run the schema in Supabase SQL Editor
# (copy contents of schema.sql and execute)

# 5. Deploy the Edge Function
supabase functions deploy analyze

# 6. Set the Gemini API key as a Supabase secret
supabase secrets set GEMINI_API_KEY=your_key_here

# 7. Start the dev server
npm run dev
```

### Environment Variables

**Frontend (`.env.local`):**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Supabase Secrets (set via CLI or dashboard):**
```
GEMINI_API_KEY=your_google_ai_studio_key
```

---

## 📁 Project Structure

```
ideaverdict/
├── src/
│   ├── pages/
│   │   ├── Landing.jsx       # Public landing page
│   │   ├── Auth.jsx          # Signup / signin
│   │   ├── Dashboard.jsx     # Idea input form + submit
│   │   ├── Results.jsx       # IVSM verdict display
│   │   └── History.jsx       # Past analyses per user
│   ├── components/
│   │   ├── VerdictBadge.jsx  # Color-coded verdict chip
│   │   ├── ScoreBar.jsx      # Per-factor score visualiser
│   │   ├── FailureCard.jsx   # Why This Will Fail section
│   │   └── ConfidenceMeter.jsx
│   └── lib/
│       └── supabase.js       # Supabase client init
├── supabase/
│   └── functions/
│       └── analyze/
│           └── index.ts      # Edge Function — AI proxy
├── schema.sql                # Full DB schema + RLS policies
├── CONTEXT.md                # AI coding tool handoff file
└── README.md
```

---

## 🧪 Sample Output

**Input idea:** *Hospital management SaaS for tier-2 Indian cities*

```json
{
  "verdict": "Pivot It",
  "total_score": 41,
  "idea_slug": "hospital-saas-tier2-india",
  "scores": {
    "problem_clarity": 8,
    "target_user_fit": 7,
    "india_market_fit": 7,
    "competition_differentiation": 5,
    "domain_expertise_required": 6,
    "first_revenue_likelihood": 8
  },
  "why_this_will_fail": [
    "Hospital procurement cycles in India average 9–14 months...",
    "Existing players like Practo and eVitalRx already have...",
    "The sales motion requires physical presence in each city..."
  ],
  "confidence_score": 75,
  "competitor_confidence": "medium"
}
```

---

## 👥 Team

| Name | Role |
|---|---|
| **Parth Panchal** | Lead — AI layer, prompt engineering, Supabase, all product decisions |
| **Prafful Sharma** | Backend edge cases, PPT, primary judge presenter |

---

## 📋 Hackathon Build Plan

### Day 1 — April 3 (11 AM start)

| Hours | Target |
|---|---|
| 0–2 | Repo live, env vars set, Supabase auth working, GitHub link submitted |
| 2–5 | Core flow: input form → Edge Function → Gemini → results dashboard |
| 5–10 | History page, Watermelon UI applied, mobile check |
| By 9 PM | **Evaluation Round 1** — demo the working core flow |

### Day 2 — April 4

| Hours | Target |
|---|---|
| Morning | Polish, edge case handling, landing page |
| By 11 AM | **Evaluation Round 2** — full product with history + PPT ready |
| Afternoon | Wow factor, rate limiting, input validation |
| By 9 PM | **Evaluation Round 3** — final demo-ready state |

### Day 3 — April 5

| Hours | Target |
|---|---|
| Morning | Final round prep, demo script dry run |
| 9 AM+ | **Final Round** — live pitch + demo |

### Demo Idea (pre-tested)

Use **Hospital SaaS for tier-2 Indian cities** as the live demo input.
- Scores 41/60 → **Pivot It** verdict
- Dramatic enough to show the product's honesty
- Close it with IdeaVerdict's own self-score: **52/60 → Build It**

---

## 🏆 Judging Criteria (from rules)

| Criterion | How IdeaVerdict Addresses It |
|---|---|
| Technical Feasibility | Supabase + Edge Function + Gemini — fully wired, no mocks |
| System Architecture & Design | Proxy pattern, RLS, server-side secret injection |
| AI Integration & Intelligence | IVSM v1.1, structured JSON, confidence scoring |
| Technical Implementation | React + Vite, Watermelon UI, clean component structure |
| Problem-Solving & Innovation | Sleeper Hit override, India-specific scoring factor |
| Prototype & Execution | Live demo, real data, history page |
| Product Value & Usability | Solves a real founder pain, usable in 60 seconds |

---

## 📄 License

This project was built during OceanLab × CHARUSAT Hacks 2026. IP belongs to the team per hackathon rules (Section 10).

---

*"Most startup ideas don't fail because founders are bad. They fail because nobody gave honest feedback early enough."*
