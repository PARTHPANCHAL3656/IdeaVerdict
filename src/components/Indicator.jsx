import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb } from 'lucide-react'

export function Indicator({ labels, intervalMs = 2000 }) {
  const [currentLabelIndex, setCurrentLabelIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  // Cycle through labels
  useEffect(() => {
    const labelInterval = setInterval(() => {
      setCurrentLabelIndex((prev) => (prev + 1) % labels.length)
    }, intervalMs)

    return () => clearInterval(labelInterval)
  }, [labels.length, intervalMs])

  // Animate progress bar
  useEffect(() => {
    // Start at 0, gradually increase to 90%, then hold
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90
        return prev + Math.random() * 20 + 5
      })
    }, 500)

    return () => clearInterval(progressInterval)
  }, [])

  const currentLabel = labels[currentLabelIndex]

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Icon */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center"
      >
        <Lightbulb size={28} className="text-white" />
      </motion.div>

      {/* Label Text */}
      <motion.div
        key={currentLabel}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <p className="text-lg font-semibold text-white dark:text-slate-900 transition-colors">
          {currentLabel}
        </p>
      </motion.div>

      {/* Progress Bar Container */}
      <div className="w-full max-w-xs">
        {/* Bar Background */}
        <div className="relative h-1 bg-slate-700 dark:bg-slate-300 rounded-full overflow-hidden transition-colors">
          {/* Animated Progress Bar */}
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>

        {/* Progress Percentage Text */}
        <div className="text-center mt-2">
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 transition-colors">
            {Math.round(progress)}%
          </p>
        </div>
      </div>

      {/* Loading Text */}
      <p className="text-sm text-slate-400 dark:text-slate-500 transition-colors">
        Analyzing your idea...
      </p>
    </div>
  )
}
