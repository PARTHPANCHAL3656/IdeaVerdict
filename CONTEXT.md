# IdeaVerdict - Project Context

## Stack Decisions

**Vite + React + Tailwind**: Chosen for rapid development with minimal boilerplate. No component library to keep the bundle lean during this scaffold phase.

**Supabase**: Provides auth, database, and edge functions in one SDK. Eliminates need for separate backend while maintaining production-grade infrastructure.

**Gemini 2.0 Flash via AI Studio**: Fast, cost-effective model with OpenAI-compatible API endpoint. Allows us to use standard fetch patterns instead of vendor-specific SDKs.

## Edge Function URL Pattern

The analyze Edge Function is deployed at:
```
https://{SUPABASE_PROJECT_REF}.supabase.co/functions/v1/analyze
```

Called from Dashboard.jsx with the user's auth token for secure access.

## IVSM Version

**v1.1** - IdeaVerdict Scoring Model with:
- 6 scoring factors (0-10 each, max 60 points)
- 4 verdict types: Build it, Pivot it, Drop it, Sleeper Hit
- Sleeper Hit hard-gate override on high differentiation + revenue potential
- Execution risk calculation based on expertise vs team size
- 8-point confidence scoring from user input quality

## Required Env Vars

**Frontend (.env.local)**:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_GEMINI_API_KEY` - Google AI Studio API key (used client-side in Phase 2)

**Supabase Secrets** (for Phase 3 Edge Function):
- `GEMINI_API_KEY` - Google AI Studio API key

## What's Wired (Phase 1 + Phase 2)

- Authentication flow (signup/signin) with profile creation
- Intake form inside Dashboard.jsx with 9 fields + inline validation
- Direct client-side Gemini 2.0 Flash API call with IVSM v1.1 scoring
- Results display: verdict badge, score breakdown bars, failure reasons, validate-first box, confidence meter + pills
- "Analyse Another Idea" reset flow

## What's TODO (Phase 3)

- Move AI analysis to Supabase Edge Function (move API key server-side)
- Database saving to 'analyses' table
- Analysis history with expandable cards
- Row Level Security on analyses table
- Analysis deletion
- Share/export results
- Email verification flow
- User settings/profile page
- Rate limiting on Edge Function

## Next Session Starting Point

1. Run `npm run dev` to verify frontend
2. Test full flow: signup → submit idea → view AI result → reset
3. Begin Phase 3: Edge Function, DB persistence, history page
