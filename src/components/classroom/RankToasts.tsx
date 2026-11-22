import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import type { RankToast } from './useRankEvents'

/** Floating, friendly ranking announcements at the top of the screen. */
export function RankToasts({ toasts }: { toasts: RankToast[] }) {
  return createPortal(
    <div className="toasts" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            className="toast"
            layout
            initial={{ opacity: 0, y: -24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          >
            <motion.span
              className="toast-emoji"
              animate={{ rotate: [0, -12, 12, 0], scale: [1, 1.3, 1] }}
              transition={{ duration: 0.7 }}
            >
              {t.emoji}
            </motion.span>
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  )
}
