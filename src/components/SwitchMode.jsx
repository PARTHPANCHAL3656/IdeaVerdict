import { useTheme } from './ThemeContext'
import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'

export function SwitchMode() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-between w-16 h-8 rounded-full bg-slate-700 dark:bg-slate-300 transition-colors border border-slate-600 dark:border-slate-400"
      title={`Switch to ${isDark ? 'dark' : 'light'} mode`}
    >
      {/* Moon Icon - Left */}
      <div className="relative z-10 flex items-center justify-center w-7 h-7 ml-0.5">
        <Moon size={16} className="text-slate-400 dark:text-cyan-300" />
      </div>

      {/* Slider Circle */}
      <motion.div
        className="absolute top-1 left-1 w-6 h-6 bg-white dark:bg-slate-700 rounded-full shadow-md border border-slate-500 dark:border-slate-600"
        initial={false}
        animate={{
          x: isDark ? 32 : 0,
        }}
        transition={{
          duration: 0.3,
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      />

      {/* Sun Icon - Right */}
      <div className="relative z-10 flex items-center justify-center w-7 h-7 mr-0.5">
        <Sun size={16} className="text-amber-400 dark:text-slate-400" />
      </div>
    </motion.button>
  )
}
