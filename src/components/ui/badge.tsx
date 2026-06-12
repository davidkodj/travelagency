import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-subtle bg-raised text-ivory-dim',
        copper: 'border-copper/30 bg-copper/10 text-copper-light',
        destructive: 'border-red-800/40 bg-red-900/20 text-red-400',
        success: 'border-emerald-700/40 bg-emerald-900/20 text-emerald-400',
        outline: 'border-subtle text-ivory-dim bg-transparent',
        muted: 'border-transparent bg-surface text-ivory-muted',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
export { Badge, badgeVariants }
