import type { ReactNode } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'

/** Small accessible tooltip (Radix — the primitive behind shadcn/ui's Tooltip). */
export function Tip({ label, children, side = 'top' }: { label: string; children: ReactNode; side?: 'top' | 'bottom' | 'left' | 'right' }) {
  return (
    <Tooltip.Root delayDuration={250}>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className="tip-content" side={side} sideOffset={6}>
          {label}
          <Tooltip.Arrow className="tip-arrow" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

export const TipProvider = Tooltip.Provider
