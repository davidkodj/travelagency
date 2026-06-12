import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        'flex min-h-[100px] w-full rounded-lg border border-subtle bg-surface px-4 py-3 text-sm text-ivory placeholder:text-ivory-muted resize-none transition-colors',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-copper/60 focus-visible:border-copper/60',
        'disabled:cursor-not-allowed disabled:opacity-40',
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Textarea.displayName = 'Textarea'
export { Textarea }
