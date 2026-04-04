import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    idea_title: '',
    idea_description: '',
    problem_statement: '',
    domain_expertise: '',
    technical_skills: '',
    target_user: '',
    india_market_context: '',
    expects_revenue: 'day_1',
    knows_competitors: false,
    named_competitors: '',
    team_size: 'Solo',
    needs_funding: false
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState(null)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/auth')
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setApiError(null);
    const newErrors = {};

    if (!formData.idea_title.trim()) newErrors.idea_title = "Title is required";
    if (!formData.idea_description.trim()) newErrors.idea_description = "Description is required";
    if (!formData.problem_statement.trim()) newErrors.problem_statement = "Problem statement is required";
    if (!formData.target_user.trim()) newErrors.target_user = "Target user is required";
    if (formData.knows_competitors && !formData.named_competitors.trim()) {
      newErrors.named_competitors = "Please name your competitors";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const systemPrompt = `You are IVSM (Idea Viability Scoring Model), a brutally honest startup idea evaluator
trained on Indian market dynamics, venture capital patterns, and first-principles product thinking.

Your job is to score a startup idea across 6 factors and return a structured JSON verdict.
You do not use live web search. You reason from training data only.

## Scoring Factors (each scored 0–10)
1. problem_clarity — Is the problem real, urgent, and well-defined?
2. target_user_fit — Is the target user specific and reachable?
3. india_market_fit — Does this work in India given pricing, infra, and behaviour?
4. competition_differentiation — Is there a real moat vs existing players?
5. domain_expertise_required — How much specialized expertise does this require? (10 = very high barrier)
6. first_revenue_likelihood — How likely is first revenue within 12 months?

## Verdict Rules (apply in this order)
- Sleeper Hit (hard override): competition_differentiation >= 7 AND first_revenue_likelihood >= 7
  AND india_market_fit >= 6 AND known_competitor_count <= 2
- Build It: total >= 50
- Pivot It: total >= 40
- Drop It: total >= 25
- Reject (score 0 on all): idea is nonsensical, harmful, or completely undefined

## Output (strict JSON, no markdown, no explanation outside JSON)
{
  "verdict": "Build It" | "Pivot It" | "Drop It" | "Sleeper Hit",
  "total_score": <number 0–60>,
  "scores": {
    "problem_clarity": <0–10>,
    "target_user_fit": <0–10>,
    "india_market_fit": <0–10>,
    "competition_differentiation": <0–10>,
    "domain_expertise_required": <0–10>,
    "first_revenue_likelihood": <0–10>
  },
  "why_this_will_fail": [
    "<reason 1 — 2+ sentences, specific to this idea, no generic advice>",
    "<reason 2 — 2+ sentences, specific to this idea>",
    "<reason 3 — 2+ sentences, specific to this idea>"
  ],
  "one_thing_to_validate_first": "<single most important assumption to test before building>",
  "confidence": <0–100>,
  "confidence_breakdown": {
    "problem_clearly_defined": true | false,
    "target_user_specific": true | false,
    "india_context_provided": true | false,
    "competitors_named": true | false,
    "revenue_timeline_given": true | false,
    "team_size_known": true | false,
    "funding_stance_clear": true | false,
    "idea_description_sufficient": true | false
  },
  "sleeper_hit_reason": "<only present if verdict is Sleeper Hit, else omit>"
}`;

      const userMessage = `Idea Title: ${formData.idea_title}
Description: ${formData.idea_description}
Problem Statement: ${formData.problem_statement || "Not provided"}
Domain Expertise: ${formData.domain_expertise || "Not provided"}
Technical Skills: ${formData.technical_skills || "Not provided"}
Target User: ${formData.target_user}
India Market Context: ${formData.india_market_context || "Not provided"}
Expected First Revenue: ${formData.expects_revenue}
Knows Competitors: ${formData.knows_competitors}
Named Competitors: ${formData.named_competitors || "None provided"}
Team Size: ${formData.team_size}
Needs External Funding: ${formData.needs_funding}`;

      let parsedResult = null;

      try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': import.meta.env.VITE_GEMINI_API_KEY,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          },
          body: JSON.stringify({
            model: 'gemini-2.5-flash',
            response_mime_type: "application/json",
            max_tokens: 1500,
            system: systemPrompt,
            messages: [
              { role: 'user', content: userMessage }
            ]
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Anthropic API Error: ${response.status} - ${errText}`);
        }

        const rawData = await response.json();
        const contentStr = rawData.content?.[0]?.text;

        if (contentStr) {

          let cleanedJsonStr = contentStr.trim();
          if (cleanedJsonStr.startsWith('\`\`\`json')) cleanedJsonStr = cleanedJsonStr.slice(7);
          if (cleanedJsonStr.startsWith('\`\`\`')) cleanedJsonStr = cleanedJsonStr.slice(3);
          if (cleanedJsonStr.endsWith('\`\`\`')) cleanedJsonStr = cleanedJsonStr.slice(0, -3);
          cleanedJsonStr = cleanedJsonStr.trim();

          parsedResult = JSON.parse(cleanedJsonStr);
        }
      } catch (apiError) {
        console.error("Anthropic API error:", apiError);
        throw apiError;
      }

      if (!parsedResult) throw new Error('All models failed');

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) throw new Error("Authentication error. Please log in again.");

      const ideaSlug = formData.idea_title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'idea';

      const { data: insertedData, error: insertError } = await supabase
        .from('analyses')
        .insert({
          user_id: userData.user.id,
          idea_slug: ideaSlug,
          idea_title: formData.idea_title,
          idea_description: formData.idea_description,
          problem_statement: formData.problem_statement,
          domain_expertise: formData.domain_expertise,
          technical_skills: formData.technical_skills,
          target_user: formData.target_user,
          india_market_context: formData.india_market_context,
          expects_revenue: formData.expects_revenue,
          knows_competitors: formData.knows_competitors,
          named_competitors: formData.named_competitors,
          team_size: formData.team_size,
          needs_funding: formData.needs_funding,
          verdict: parsedResult.verdict,
          total_score: parsedResult.total_score,
          result: parsedResult
        })
        .select()
        .single();
        
      if (insertError) throw insertError;

      navigate(`/results/${insertedData.id}`);

    } catch (e) {
      console.error(e);
      setApiError("Analysis failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col p-6 bg-slate-950 text-white pb-24">
      <header className="flex items-center justify-between py-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-white">IdeaVerdict</h1>
        <div className="flex items-center gap-6">
          <Link to="/history" className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors">
            Library
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex flex-col items-center flex-1 space-y-6 mt-8">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-100">
            Analyse Your Idea
          </h2>
          <p className="text-slate-400 max-w-lg mt-2 mx-auto">
            Ready to put your vision to the test? Start a new analysis and see if it's a Build It, Pivot It, Drop It, or a Sleeper Hit.
          </p>
        </div>

        <div className="w-full max-w-2xl text-left bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl mt-6">
          <div className="space-y-6">

            {/* 1. idea_title */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-300">Idea Title *</label>
              <input
                type="text"
                name="idea_title"
                value={formData.idea_title}
                onChange={handleChange}
                placeholder="e.g. AI-powered HR onboarding for Indian SMBs"
                className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-white"
              />
              {errors.idea_title && <p className="mt-1 text-sm text-red-500">{errors.idea_title}</p>}
            </div>

            {/* 2. idea_description */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-300">Describe your idea *</label>
              <textarea
                name="idea_description"
                value={formData.idea_description}
                onChange={handleChange}
                rows={3}
                placeholder="What does it do, who is it for, and how does it work?"
                className="flex w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent min-h-[80px] text-white"
              />
              {errors.idea_description && <p className="mt-1 text-sm text-red-500">{errors.idea_description}</p>}
            </div>

            {/* Field A: problem_statement */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-300">What is the core problem? *</label>
              <textarea
                name="problem_statement"
                value={formData.problem_statement}
                onChange={handleChange}
                rows={2}
                placeholder="e.g. Doctors lose 30+ mins daily to manual OPD records. Wait times avg 45 mins."
                className="flex w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent min-h-[64px] text-white"
              />
              {errors.problem_statement && <p className="mt-1 text-sm text-red-500">{errors.problem_statement}</p>}
            </div>

            {/* Field B: domain_expertise */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-300">Your Domain Expertise <span className="text-slate-500 font-normal">(optional)</span></label>
              <input
                type="text"
                name="domain_expertise"
                value={formData.domain_expertise}
                onChange={handleChange}
                placeholder="e.g. 1 year working at a private hospital in Ahmedabad"
                className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-white"
              />
            </div>

            {/* Field C: technical_skills */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-300">Technical Skills <span className="text-slate-500 font-normal">(optional)</span></label>
              <input
                type="text"
                name="technical_skills"
                value={formData.technical_skills}
                onChange={handleChange}
                placeholder="e.g. Can code, has built 2 side projects"
                className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-white"
              />
            </div>

            {/* 3. target_user */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-300">Target User *</label>
              <input
                type="text"
                name="target_user"
                value={formData.target_user}
                onChange={handleChange}
                placeholder="e.g. HR managers at 50–500 employee companies"
                className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-white"
              />
              {errors.target_user && <p className="mt-1 text-sm text-red-500">{errors.target_user}</p>}
            </div>

            {/* 4. india_market_context */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-300">India Market Context <span className="text-slate-500 font-normal">(optional)</span></label>
              <textarea
                name="india_market_context"
                value={formData.india_market_context}
                onChange={handleChange}
                rows={2}
                placeholder="Pricing, regulations, distribution, local behaviour"
                className="flex w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-white"
              />
            </div>

            {/* visual divider: "Market & Team" */}
            <div className="flex items-center pt-4 pb-2">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="shrink-0 px-4 text-sm font-semibold text-slate-500 uppercase tracking-widest">Market & Team</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* 5. expects_revenue */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-300">When do you expect first revenue? *</label>
              <select
                name="expects_revenue"
                value={formData.expects_revenue}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-white"
              >
                <option value="day_1">Day 1 (transactional)</option>
                <option value="3_6mo">3–6 months</option>
                <option value="6_12mo">6–12 months</option>
                <option value="12mo_plus">12+ months / VC path</option>
              </select>
            </div>

            {/* 6. knows_competitors boolean toggle */}
            <div className="flex items-center pt-2">
              <input
                type="checkbox"
                id="knows_competitors"
                name="knows_competitors"
                checked={formData.knows_competitors}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-indigo-500 focus:ring-indigo-500"
              />
              <label htmlFor="knows_competitors" className="ml-2 block text-sm font-medium text-slate-300 cursor-pointer">
                Do you know your direct competitors?
              </label>
            </div>

            {formData.knows_competitors && (
              <div className="pl-6 pt-1">
                <label className="block text-sm font-medium mb-1.5 text-slate-400">Name your competitors</label>
                <textarea
                  name="named_competitors"
                  value={formData.named_competitors}
                  onChange={handleChange}
                  rows={2}
                  placeholder="e.g. Keka, Darwinbox, Zoho People"
                  className="flex w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-white"
                />
                {errors.named_competitors && <p className="mt-1 text-sm text-red-500">{errors.named_competitors}</p>}
              </div>
            )}

            {/* 7. team_size */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-300">Team Size *</label>
              <select
                name="team_size"
                value={formData.team_size}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-white"
              >
                <option value="Solo">Solo</option>
                <option value="2">2</option>
                <option value="3–5">3–5</option>
                <option value="6+">6+</option>
              </select>
            </div>

            {/* 8. needs_funding boolean toggle */}
            <div className="flex items-center pt-2 pb-4">
              <input
                type="checkbox"
                id="needs_funding"
                name="needs_funding"
                checked={formData.needs_funding}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-indigo-500 focus:ring-indigo-500"
              />
              <label htmlFor="needs_funding" className="ml-2 block text-sm font-medium text-slate-300 cursor-pointer">
                Do you need external funding to launch?
              </label>
            </div>

            {/* apiError display */}
            {apiError && (
              <div className="p-3 text-sm text-red-500 bg-red-950/50 rounded-md border border-red-500/50">
                {apiError}
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full flex items-center justify-center rounded-md bg-white px-4 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analysing...
                </span>
              ) : (
                "Analyse My Idea →"
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
