import { AnimatePresence, motion } from "framer-motion";
import { FaGoogle, FaLinkedin } from "react-icons/fa";

const DEFAULT_TEXTS = {
  signInTitle: "Log In",
  signUpTitle: "Create Account",
  signInSubtitle: "Hey friend, welcome back!",
  signUpSubtitle: "Just one more step to get started!",
  signInButton: "Log In",
  signUpButton: "Create Account",
  footerSignIn: "Don't have an account?",
  footerSignUp: "Already have an account?",
  footerSignInCta: "Create Account",
  footerSignUpCta: "Log In",
};

export default function SwapForm({
  onLinkedInLogin,
  isSignIn,
  onModeChange,
  texts = {},
  email,
  onEmailChange,
  password,
  onPasswordChange,
  onSubmit,
  loading,
  error,
  onGoogleLogin,
}) {
  const mergedTexts = { ...DEFAULT_TEXTS, ...texts };

  const variants = {
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isSignIn ? "signin" : "signup"}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-slate-950 dark:bg-white border border-slate-800 dark:border-slate-200 rounded-3xl shadow-2xl transition-colors"
      >
        <div className="p-8">

          {/* TITLE */}
          <h2 className="text-3xl font-bold text-white dark:text-slate-900 mb-2 transition-colors">
            {isSignIn ? mergedTexts.signInTitle : mergedTexts.signUpTitle}
          </h2>

          <p className="text-slate-400 dark:text-slate-600 mb-6 transition-colors">
            {isSignIn
              ? mergedTexts.signInSubtitle
              : mergedTexts.signUpSubtitle}
          </p>

          {/* ERROR */}
          {error && (
            <div className="mb-4 p-3 text-sm text-red-400 dark:text-red-600 bg-red-900/30 dark:bg-red-100/50 rounded-xl border border-red-800 dark:border-red-300 transition-colors">
              {error}
            </div>
          )}

          {/* GOOGLE */}
          <button
            type="button"
            onClick={onGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 mb-3 rounded-xl bg-slate-900 dark:bg-slate-100 border border-slate-800 dark:border-slate-300 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
          >
            <FaGoogle />
            Continue with Google
          </button>

          {/* LinkedIn */}
          <button
          type="button"
          onClick={onLinkedInLogin} 
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-slate-900 dark:bg-slate-100 border border-slate-800 dark:border-slate-300 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
           >
           <FaLinkedin />
           Continue with LinkedIn
          </button>

          {/* DIVIDER */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-slate-800 dark:bg-slate-200 transition-colors"></div>
            <span className="px-3 text-sm text-slate-500 dark:text-slate-400 transition-colors">OR</span>
            <div className="flex-1 h-px bg-slate-800 dark:bg-slate-200 transition-colors"></div>
          </div>

          {/* INPUTS */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 dark:text-slate-600 transition-colors">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="name@example.com"
                className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-900 dark:bg-slate-100 border border-slate-800 dark:border-slate-300 text-white dark:text-slate-900 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-slate-900/20 transition-colors"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 dark:text-slate-600 transition-colors">
                {isSignIn ? "Password" : "Set Password"}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="••••••••"
                className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-900 dark:bg-slate-100 border border-slate-800 dark:border-slate-300 text-white dark:text-slate-900 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-slate-900/20 transition-colors"
              />
            </div>

            {/* BUTTON */}
            <button
              type="button"
              onClick={onSubmit}
              disabled={loading || !email || !password}
              className="w-full py-3 rounded-xl bg-white dark:bg-slate-900 text-black dark:text-white font-semibold hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 border border-white dark:border-slate-800"
            >
              {loading
                ? "Processing..."
                : isSignIn
                ? mergedTexts.signInButton
                : mergedTexts.signUpButton}
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="py-4 text-center border-t border-slate-800 dark:border-slate-200 transition-colors">
          <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">
            {isSignIn
              ? mergedTexts.footerSignIn
              : mergedTexts.footerSignUp}
            <button
              onClick={() => onModeChange(!isSignIn)}
              className="ml-1 text-white dark:text-slate-900 font-medium hover:underline transition-colors"
            >
              {isSignIn
                ? mergedTexts.footerSignInCta
                : mergedTexts.footerSignUpCta}
            </button>
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
