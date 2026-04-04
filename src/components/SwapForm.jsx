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
        className="w-full max-w-md bg-[#0b0b0f] border border-zinc-800 rounded-3xl shadow-2xl"
      >
        <div className="p-8">

          {/* TITLE */}
          <h2 className="text-3xl font-bold text-white mb-2">
            {isSignIn ? mergedTexts.signInTitle : mergedTexts.signUpTitle}
          </h2>

          <p className="text-zinc-400 mb-6">
            {isSignIn
              ? mergedTexts.signInSubtitle
              : mergedTexts.signUpSubtitle}
          </p>

          {/* ERROR */}
          {error && (
            <div className="mb-4 p-3 text-sm text-red-400 bg-red-900/30 rounded-xl border border-red-800">
              {error}
            </div>
          )}

          {/* GOOGLE */}
          <button
            type="button"
            onClick={onGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 mb-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 transition"
          >
            <FaGoogle />
            Continue with Google
          </button>

          {/* LinkedIn */}
          <button
          type="button"
          onClick={onLinkedInLogin} 
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 transition"
           >
           <FaLinkedin />
           Continue with LinkedIn
          </button>

          {/* DIVIDER */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-zinc-800"></div>
            <span className="px-3 text-sm text-zinc-500">OR</span>
            <div className="flex-1 h-px bg-zinc-800"></div>
          </div>

          {/* INPUTS */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-zinc-400">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="name@example.com"
                className="w-full mt-1 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400">
                {isSignIn ? "Password" : "Set Password"}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="••••••••"
                className="w-full mt-1 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>

            {/* BUTTON */}
            <button
              type="button"
              onClick={onSubmit}
              disabled={loading || !email || !password}
              className="w-full py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition disabled:opacity-50"
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
        <div className="py-4 text-center border-t border-zinc-800">
          <p className="text-sm text-zinc-500">
            {isSignIn
              ? mergedTexts.footerSignIn
              : mergedTexts.footerSignUp}
            <button
              onClick={() => onModeChange(!isSignIn)}
              className="ml-1 text-white font-medium hover:underline"
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
