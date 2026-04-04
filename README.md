# 🧠 IdeaVerdict

> **AI-powered startup idea stress-tester. Get investor-grade feedback in 60 seconds — not hype.**

Built for the **OceanLab × CHARUSAT Hacks 2026** · April 3–5, DEPSTAR Campus · Theme: *Build AI-First SaaS*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-ideaverdict.vercel.app-black?style=flat-square)](https://idea-verdict.vercel.app)
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

## 🍉 Why Watermelon UI?

We're using [**ui.watermelon.sh**](https://ui.watermelon.sh) for the component layer. It gave us production-grade, accessible UI components with a clean design system that we could customise with Tailwind — without spending hackathon hours rebuilding buttons and modals from scratch.

This directly improved the polish of our results dashboard, scoring UI, and overall user experience.

---

## 🍉 What We Used from Watermelon UI

We leveraged selected components and design patterns from Watermelon UI to accelerate development and maintain a polished, production-grade interface.

### 🔧 Components Used (in order of integration)

- **Auth Page Pattern**  
  Used as the base for login/signup flow with a clean and accessible layout.

- **Theme Switch (`switch-mode`)**  
  Enables light/dark mode toggling for improved usability.

- **Progress Indicator (`labeled-progress-indicator`)**  
  Displays scoring progress and analysis stages clearly to the user.

- **Dashboard UI Inspiration**  
  Used layout and spacing patterns for:
  - Results page
  - Verdict badge
  - Score breakdown cards

---

### 🔗 References

- Swap Form Animation  
  https://ui.watermelon.sh/animated-components/swap-form  

- Theme Switch  
  https://ui.watermelon.sh/animated-components/switch-mode  

- Progress Indicator  
  https://ui.watermelon.sh/animated-components/labeled-progress-indicator  

- Dashboard Designs  
  https://ui.watermelon.sh/dashboards  

---

### 📌 Note

All components were customized using Tailwind CSS to match the IdeaVerdict design system and ensure consistency across the application.

### Why Gemini 2.5 Flash?

Fast, cheap, and capable of structured JSON output — exactly what IVSM needs. We call it through a **Supabase Edge Function** that injects the system prompt, validates the JWT, and handles rate limiting server-side. The API key never touches the client.

---

## 🗄️ Database Schema

```sql
-- 1. Profiles table

create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  created_at timestamptz default now()
);
alter table profiles enable row level security;

drop policy if exists "Users can read own profile" on profiles;  -- ADD THIS
create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

-- 2. Drop + recreate analyses
drop table if exists analyses;

create table analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,

  -- Server-injected
  idea_slug text not null,
  scored_at timestamptz default now() not null,

  -- Input fields
  idea_title text not null,
  idea_description text not null,
  problem_statement text,
  domain_expertise text,
  technical_skills text,
  target_user text not null,
  india_market_context text,
  expects_revenue text not null,
  knows_competitors boolean default false,
  named_competitors text,
  team_size text not null,
  needs_funding boolean default false,

  -- Denormalized for history queries
  verdict text not null,
  total_score integer not null,

  -- Full AI response
  result jsonb not null
);

create index on analyses(user_id, scored_at desc);

alter table analyses enable row level security;

create policy "Users can read own analyses"
  on analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert own analyses"
  on analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own analyses"
  on analyses for delete
  using (auth.uid() = user_id);

-- 3. Trigger (drop first to avoid duplicate error)
drop trigger if exists on_auth_user_created on auth.users;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
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
IdeaVerdict/
│
├── api/                         # Serverless backend (Vercel functions)
│   └── analyze.js              # Core AI analysis endpoint
│
├── src/                        # Frontend source code
│   │
│   ├── components/             # Reusable UI components
│   │   ├── AuthGuard.jsx
│   │   ├── SwapForm.jsx
│   │   ├── SwitchMode.jsx
│   │   └── ThemeContext.jsx
│   │
│   ├── lib/                    # Utility & external integrations
│   │   ├── supabase.js
│   │   └── utils.js
│   │
│   ├── pages/                  # Page-level components (routing views)
│   │   ├── Landing.jsx
│   │   ├── Results.jsx
│   │   ├── Dashboard.jsx
│   │   ├── History.jsx
│   │   └── Auth.jsx
│   │
│   ├── App.jsx                 # Root React component
│   ├── main.jsx                # App entry point
│   └── index.css               # Global styles
│
├── public/                     # Static assets (if used)
│
├── dist/                       # Production build (auto-generated)
├── node_modules/               # Dependencies (ignored)
│
├── .env.local                  # Environment variables (DO NOT COMMIT)
├── .gitignore
│
├── components.json             # UI config (likely shadcn/ui)
├── CONTEXT.md                  # Project context / AI prompts
│
├── index.html                  # Vite entry HTML
├── package.json
├── package-lock.json
│
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
│
├── vercel.json                 # Deployment config
└── README.md
```

---

## 🧪 Sample Output

**Input idea:** *Hospital management SaaS for tier-2 Indian cities*

```json
{
  "idea_slug": "ai-whatsapp-tutor-tier2-tier3-india",
  "verdict": "Pivot It",
  "total_score": 49,
  "scores": {
    "problem_clarity": 9,
    "target_user_fit": 9,
    "india_market_fit": 9,
    "first_revenue_likelihood": 7,
    "domain_expertise_required": 8,
    "competition_differentiation": 7
  },
  "why_this_will_fail": [
    "Parents in India prioritize trust and proven outcomes over accessibility; an AI-only tutor may struggle to compete with human tutors and established edtech platforms.",
    "Ensuring consistently accurate, syllabus-aligned explanations across CBSE, state boards, and multiple languages is a complex and resource-heavy challenge for a small team.",
    "Generic AI APIs may produce shallow or incorrect explanations, which can directly impact learning outcomes and user trust.",
    "WhatsApp lacks built-in mechanisms for long-term engagement such as structured curriculum tracking, accountability, and peer learning.",
    "Sustaining student motivation over months requires mentorship, personalization, and feedback loops beyond simple Q&A interactions."
  ],
  "validate_this_first": [
    "Can the AI consistently provide accurate, step-by-step explanations for Math and Science problems in Hinglish or regional languages?",
    "Will parents trust and pay for an AI tutor delivered via WhatsApp for exam preparation?",
    "Can meaningful learning outcomes be achieved without structured curriculum delivery or live mentorship?"
  ],
  "confidence_score": 85,
  "competitor_confidence": "medium",
  "analysis_metadata": {
    "market": "India",
    "target_segment": "Tier 2/3 students",
    "use_case": "Exam preparation support",
    "platform": "WhatsApp-first",
    "analysis_date": "2026-04-04"
  }
}
```


---

## 📄 License

This project was built during OceanLab × CHARUSAT Hacks 2026. IP belongs to the team per hackathon rules (Section 10).

---

*"Most startup ideas don't fail because founders are bad. They fail because nobody gave honest feedback early enough."*
