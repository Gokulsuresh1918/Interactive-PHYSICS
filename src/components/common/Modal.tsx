import type { ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import './modal.css'

interface ModalProps {
  open: boolean
  title: string
  eyebrow?: string
  description?: string
  onClose: () => void
  children: ReactNode
  size?: 'sm' | 'lg'
}

/**
 * Accessible popup (Radix Dialog — the primitive behind shadcn/ui's Dialog),
 * styled with our own design tokens and animated with Framer Motion.
 */
export function Modal({ open, title, eyebrow, description, onClose, children, size = 'sm' }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                className={`modal modal-${size}`}
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="modal-head">
                  <div>
                    {eyebrow && <p className="eyebrow">{eyebrow}</p>}
                    <Dialog.Title className="modal-title">{title}</Dialog.Title>
                    {description ? (
                      <Dialog.Description className="modal-desc">{description}</Dialog.Description>
                    ) : (
                      <Dialog.Description className="sr-only">{title}</Dialog.Description>
                    )}
                  </div>
                  <Dialog.Close className="btn btn-icon btn-ghost" aria-label="Close">
                    <X size={18} />
                  </Dialog.Close>
                </div>
                {children}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
