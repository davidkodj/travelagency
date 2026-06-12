import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-raised text-ivory-DEFAULT border border-subtle hover:border-copper/40 hover:bg-raised/80',
        copper: 'bg-copper-gradient text-abyss font-semibold shadow-lg shadow-copper-900/30 hover:opacity-90 hover:-translate-y-px transition-all',
        outline: 'border border-subtle text-ivory-dim hover:text-ivory hover:border-copper/50 bg-transparent',
        ghost: 'text-ivory-dim hover:text-ivory hover:bg-raised/60 bg-transparent',
        destructive: 'bg-red-900/30 text-red-400 border border-red-800/40 hover:bg-red-900/50',
        secondary: 'bg-surface text-ivory-dim border border-subtle hover:border-copper/30 hover:text-ivory',
        link: 'text-copper underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-md',
        default: 'h-10 px-5 py-2',
        lg: 'h-12 px-8 text-base rounded-xl',
        xl: 'h-14 px-10 text-base rounded-xl',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
Button.displayName = 'Button'
export { Button, buttonVariants }
