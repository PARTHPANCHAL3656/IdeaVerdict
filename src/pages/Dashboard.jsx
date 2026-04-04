import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Lightbulb, Target, TrendingUp, Users, AlertCircle, CheckCircle } from 'lucide-react'

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
  const [activeSection, setActiveSection] = useState('idea')

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
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage }
            ]
          })
        })
          if (!response.ok) {
            const errText = await response.text()
            throw new Error(`Gemini API Error: ${response.status} - ${errText}`)
          }

          const rawData = await response.json()
          const contentStr = rawData.choices?.[0]?.message?.content

          if (contentStr) {
            let cleaned = contentStr.trim()
            if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7)
            if (cleaned.startsWith('```')) cleaned = cleaned.slice(3)
            if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3)
            parsedResult = JSON.parse(cleaned.trim())
          }
        } catch (apiError) {
          console.error('Gemini API error:', apiError)
          throw apiError
        }

      if (!parsedResult) throw new Error('Analysis generation failed. Please try again.');

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Lightbulb size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">IdeaVerdict</h1>
          </div>
          <nav className="flex items-center gap-8">
            <Link to="/history" className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors hover:underline">
              Library
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm font-medium px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="inline-block mb-4 px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-700/50">
            <span className="text-xs font-semibold text-cyan-300">Startup Evaluation</span>
          </div>
          <h2 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
            Validate Your Idea
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Get brutally honest AI-powered feedback on your startup idea. Discover if it's a <span className="text-cyan-400">Build It</span>, <span className="text-yellow-400">Pivot It</span>, <span className="text-orange-400">Drop It</span>, or a <span className="text-green-400">Sleeper Hit</span>.
          </p>
        </div>

        {/* Form Container */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-slate-900/60 backdrop-blur border border-slate-800/50 rounded-2xl p-8 lg:p-12">
            {/* Progress Indicator */}
            <div className="flex gap-2 mb-12">
              {[
                { id: 'idea', label: 'Your Idea', icon: Lightbulb },
                { id: 'market', label: 'Market Details', icon: Target },
                { id: 'competitive', label: 'Competitive', icon: TrendingUp },
                { id: 'team', label: 'Team & Funding', icon: Users }
              ].map((section, idx) => {
                const SectionIcon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                        : 'bg-slate-800/40 text-slate-400 hover:bg-slate-700/40'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <SectionIcon size={16} />
                      <span className="hidden sm:inline">{section.label}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
            {/* SECTION 1: Your Idea */}
            {(activeSection === 'idea' || true) && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                    <Lightbulb size={20} className="text-cyan-400" />
                    Your Idea
                  </h3>
                  <p className="text-sm text-slate-400">Tell us what you're building</p>
                </div>

                {/* Idea Title */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-200">
                    Idea Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="idea_title"
                    value={formData.idea_title}
                    onChange={handleChange}
                    placeholder="e.g. AI-powered HR onboarding for Indian SMBs"
                    className="w-full px-4 py-3 rounded-lg border border-slate-700/50 bg-slate-800/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                  />
                  {errors.idea_title && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle size={14} /> {errors.idea_title}
                    </p>
                  )}
                </div>

                {/* Idea Description */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-200">
                    What's your idea? <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="idea_description"
                    value={formData.idea_description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="What does it do, who is it for, and how does it work?"
                    className="w-full px-4 py-3 rounded-lg border border-slate-700/50 bg-slate-800/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all resize-none"
                  />
                  {errors.idea_description && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle size={14} /> {errors.idea_description}
                    </p>
                  )}
                </div>

                {/* Problem Statement */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-200">
                    What's the core problem? <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="problem_statement"
                    value={formData.problem_statement}
                    onChange={handleChange}
                    rows={3}
                    placeholder="e.g. Doctors lose 30+ mins daily to manual OPD records. Wait times avg 45 mins."
                    className="w-full px-4 py-3 rounded-lg border border-slate-700/50 bg-slate-800/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all resize-none"
                  />
                  {errors.problem_statement && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle size={14} /> {errors.problem_statement}
                    </p>
                  )}
                </div>

                {/* Expertise Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-200">
                      Your Domain Expertise
                      <span className="text-slate-500 font-normal text-xs ml-1">(optional)</span>
                    </label>
                    <input
                      type="text"
                      name="domain_expertise"
                      value={formData.domain_expertise}
                      onChange={handleChange}
                      placeholder="e.g. 1 year at a hospital"
                      className="w-full px-4 py-3 rounded-lg border border-slate-700/50 bg-slate-800/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-200">
                      Technical Skills
                      <span className="text-slate-500 font-normal text-xs ml-1">(optional)</span>
                    </label>
                    <input
                      type="text"
                      name="technical_skills"
                      value={formData.technical_skills}
                      onChange={handleChange}
                      placeholder="e.g. Can code, built 2 projects"
                      className="w-full px-4 py-3 rounded-lg border border-slate-700/50 bg-slate-800/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent"></div>

            {/* SECTION 2: Market Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                  <Target size={20} className="text-cyan-400" />
                  Market Details
                </h3>
                <p className="text-sm text-slate-400">Who you're building for and why</p>
              </div>

              {/* Target User */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-200">
                  Target User Profile <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="target_user"
                  value={formData.target_user}
                  onChange={handleChange}
                  placeholder="e.g. HR managers at 50–500 employee companies"
                  className="w-full px-4 py-3 rounded-lg border border-slate-700/50 bg-slate-800/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                />
                {errors.target_user && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.target_user}
                  </p>
                )}
              </div>

              {/* India Market Context */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-200">
                  India Market Context
                  <span className="text-slate-500 font-normal text-xs ml-1">(optional)</span>
                </label>
                <textarea
                  name="india_market_context"
                  value={formData.india_market_context}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Pricing, regulations, distribution, local behavior..."
                  className="w-full px-4 py-3 rounded-lg border border-slate-700/50 bg-slate-800/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all resize-none"
                />
              </div>

              {/* Revenue Timeline */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-200">
                  When do you expect first revenue? <span className="text-red-400">*</span>
                </label>
                <select
                  name="expects_revenue"
                  value={formData.expects_revenue}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-slate-700/50 bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                >
                  <option value="day_1">Day 1 (transactional)</option>
                  <option value="3_6mo">3–6 months</option>
                  <option value="6_12mo">6–12 months</option>
                  <option value="12mo_plus">12+ months / VC path</option>
                </select>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent"></div>

            {/* SECTION 3: Competitive Landscape */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                  <TrendingUp size={20} className="text-cyan-400" />
                  Your Competitive Edge
                </h3>
                <p className="text-sm text-slate-400">What sets you apart?</p>
              </div>

              {/* Competitors Checkbox */}
              <div className="flex items-center p-4 rounded-lg bg-slate-800/30 border border-slate-700/30 hover:border-slate-700/50 transition-colors cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, knows_competitors: !prev.knows_competitors }))}>
                <input
                  type="checkbox"
                  id="knows_competitors"
                  name="knows_competitors"
                  checked={formData.knows_competitors}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                />
                <label htmlFor="knows_competitors" className="ml-3 block font-medium text-slate-200 cursor-pointer flex-1">
                  I know my direct competitors
                </label>
              </div>

              {formData.knows_competitors && (
                <div className="pl-4">
                  <label className="block text-sm font-semibold mb-2 text-slate-200">
                    Name your competitors
                  </label>
                  <textarea
                    name="named_competitors"
                    value={formData.named_competitors}
                    onChange={handleChange}
                    rows={2}
                    placeholder="e.g. Keka, Darwinbox, Zoho People"
                    className="w-full px-4 py-3 rounded-lg border border-slate-700/50 bg-slate-800/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all resize-none"
                  />
                  {errors.named_competitors && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle size={14} /> {errors.named_competitors}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent"></div>

            {/* SECTION 4: Team & Funding */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                  <Users size={20} className="text-cyan-400" />
                  Team & Resources
                </h3>
                <p className="text-sm text-slate-400">Who's building this and what's needed</p>
              </div>

              {/* Team Size */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-200">
                  Team Size <span className="text-red-400">*</span>
                </label>
                <select
                  name="team_size"
                  value={formData.team_size}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-slate-700/50 bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                >
                  <option value="Solo">Solo</option>
                  <option value="2">2</option>
                  <option value="3–5">3–5</option>
                  <option value="6+">6+</option>
                </select>
              </div>

              {/* Funding Checkbox */}
              <div className="flex items-center p-4 rounded-lg bg-slate-800/30 border border-slate-700/30 hover:border-slate-700/50 transition-colors cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, needs_funding: !prev.needs_funding }))}>
                <input
                  type="checkbox"
                  id="needs_funding"
                  name="needs_funding"
                  checked={formData.needs_funding}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                />
                <label htmlFor="needs_funding" className="ml-3 block font-medium text-slate-200 cursor-pointer flex-1">
                  Need external funding to launch
                </label>
              </div>
            </div>

            {/* Error Message */}
            {apiError && (
              <div className="p-4 rounded-lg bg-red-950/50 border border-red-800/50 flex items-start gap-3">
                <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{apiError}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-8 flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 text-base font-semibold text-white transition-all hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analysing your idea...
                  </>
                ) : (
                  <>
                    <Lightbulb size={20} />
                    Get Verdict
                  </>
                )}
              </button>
            </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-slate-500 pb-8">
          <p>Your ideas are evaluated with IVSM (Idea Viability Scoring Model) powered by AI</p>
        </div>
      </main>
    </div>
  )
}

