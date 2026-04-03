import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const navigate = useNavigate()
  const resultRef = useRef(null)

  const [formData, setFormData] = useState({
    idea_title: '',
    idea_description: '',
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
  const [result, setResult] = useState(null)
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
Target User: ${formData.target_user}
India Market Context: ${formData.india_market_context || "Not provided"}
Expected First Revenue: ${formData.expects_revenue}
Knows Competitors: ${formData.knows_competitors}
Named Competitors: ${formData.named_competitors || "None provided"}
Team Size: ${formData.team_size}
Needs External Funding: ${formData.needs_funding}`;

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GEMINI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gemini-2.0-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error('API Request failed');
      }

      const rawData = await response.json();
      const contentStr = rawData.choices[0].message.content;
      
      let cleanedJsonStr = contentStr.trim();
      if (cleanedJsonStr.startsWith('```json')) cleanedJsonStr = cleanedJsonStr.slice(7);
      if (cleanedJsonStr.startsWith('```')) cleanedJsonStr = cleanedJsonStr.slice(3);
      if (cleanedJsonStr.endsWith('```')) cleanedJsonStr = cleanedJsonStr.slice(0, -3);
      cleanedJsonStr = cleanedJsonStr.trim();
      
      const parsedResult = JSON.parse(cleanedJsonStr);
      setResult(parsedResult);
      
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (e) {
      console.error(e);
      setApiError("Analysis failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getVerdictStyle = (verdict) => {
    switch (verdict) {
      case 'Build It': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Pivot It': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Drop It': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Sleeper Hit': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const factorLabels = {
    problem_clarity: "Problem Clarity",
    target_user_fit: "Target User Fit",
    india_market_fit: "India Market Fit",
    competition_differentiation: "Competition & Differentiation",
    domain_expertise_required: "Domain Expertise Required",
    first_revenue_likelihood: "First Revenue Likelihood"
  };

  const confidenceLabels = {
    problem_clearly_defined: "Problem Defined",
    target_user_specific: "User Specific",
    india_context_provided: "India Context",
    competitors_named: "Competitors Named",
    revenue_timeline_given: "Revenue Timeline",
    team_size_known: "Team Size Known",
    funding_stance_clear: "Funding Stance",
    idea_description_sufficient: "Description Sufficient"
  };

  return (
    <div className="flex min-h-screen flex-col p-6 bg-slate-950 text-white pb-24">
      <header className="flex items-center justify-between py-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-white">IdeaVerdict</h1>
        <button
          onClick={handleLogout}
          className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors"
        >
          Logout
        </button>
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
                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent text-white"
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
                className="flex w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent min-h-[80px] text-white"
              />
              {errors.idea_description && <p className="mt-1 text-sm text-red-500">{errors.idea_description}</p>}
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
                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent text-white"
              />
              {errors.target_user && <p className="mt-1 text-sm text-red-500">{errors.target_user}</p>}
            </div>

            {/* 4. india_market_context */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-300">India Market Context (optional)</label>
              <textarea 
                name="india_market_context"
                value={formData.india_market_context}
                onChange={handleChange}
                rows={2}
                placeholder="Pricing, regulations, distribution, local behaviour"
                className="flex w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent text-white"
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
                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent text-white"
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
                  className="flex w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent text-white"
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
                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent text-white"
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

        {/* RESULTS SECTION */}
        {result && (
          <div ref={resultRef} className="w-full max-w-2xl text-left bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl mt-8 space-y-10">
            
            {/* VERDICT BADGE */}
            <div className={`flex flex-col items-center justify-center p-8 border rounded-xl ${getVerdictStyle(result.verdict)}`}>
              <span className="uppercase text-sm tracking-widest font-bold opacity-80 mb-2">Verdict</span>
              <span className="text-5xl font-black mb-2 tracking-tight">{result.verdict}</span>
              <span className="text-xl opacity-90 font-medium">Score: {result.total_score} / 60</span>
              {result.verdict === 'Sleeper Hit' && result.sleeper_hit_reason && (
                <p className="mt-5 text-center text-sm font-medium border-t border-current/20 pt-4 px-4 w-full max-w-md">{result.sleeper_hit_reason}</p>
              )}
            </div>

            {/* SCORE BREAKDOWN */}
            <div>
              <h3 className="text-lg font-bold mb-5 tracking-tight text-white border-b border-slate-800 pb-2">Score Breakdown</h3>
              <div className="space-y-5">
                {Object.entries(result.scores || {}).map(([key, score]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300 font-medium">{factorLabels[key] || key}</span>
                      <span className="text-slate-400 font-mono font-medium">{score}/10</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 break-inside-avoid">
                      <div className="bg-slate-400 h-2 rounded-full" style={{ width: `${(score / 10) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WHY THIS WILL FAIL */}
            {(result.why_this_will_fail && result.why_this_will_fail.length > 0) && (
              <div>
                <h3 className="text-lg font-bold mb-4 tracking-tight text-white border-b border-slate-800 pb-2">Why This Will Fail</h3>
                <div className="space-y-3">
                  {result.why_this_will_fail.map((reason, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-sm leading-relaxed">
                      {reason}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ONE THING TO VALIDATE FIRST */}
            {result.one_thing_to_validate_first && (
              <div>
                <h3 className="text-lg font-bold mb-4 tracking-tight text-white border-b border-slate-800 pb-2">Validate This First</h3>
                <div className="p-5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-base font-medium leading-relaxed shadow-inner">
                  {result.one_thing_to_validate_first}
                </div>
              </div>
            )}

            {/* CONFIDENCE METER */}
            <div>
              <h3 className="text-lg font-bold mb-5 tracking-tight text-white border-b border-slate-800 pb-2">Analysis Confidence: {result.confidence}%</h3>
              <div className="mb-5">
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className={`h-2 rounded-full ${result.confidence >= 70 ? 'bg-green-500' : result.confidence >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${result.confidence}%` }}></div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {Object.entries(result.confidence_breakdown || {}).map(([key, isTrue]) => (
                  <span key={key} className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${isTrue ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                    {confidenceLabels[key] || key}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setResult(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full flex items-center justify-center rounded-md bg-transparent border border-slate-700 px-4 py-3 text-sm font-bold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white mt-8 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              ANALYSE ANOTHER IDEA
            </button>

          </div>
        )}
      </main>
    </div>
  )
}

