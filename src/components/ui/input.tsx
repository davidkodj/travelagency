import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-subtle bg-surface px-4 py-2 text-sm text-ivory placeholder:text-ivory-muted transition-colors",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-copper/60 focus-visible:border-copper/60",
        "disabled:cursor-not-allowed disabled:opacity-40",

        "placeholder:text-muted-foreground/35",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";
export { Input };
