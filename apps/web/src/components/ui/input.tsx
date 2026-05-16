import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full min-w-0 rounded-[10px] border border-border bg-secondary px-[14px] py-3 text-sm text-foreground transition-colors outline-none",
        "placeholder:text-muted-foreground",
        "hover:border-border-strong",
        "focus-visible:border-foreground focus-visible:shadow-[0_0_0_3px_color-mix(in_oklch,var(--brand)_18%,transparent)]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45 disabled:bg-muted",
        "aria-invalid:border-destructive aria-invalid:focus-visible:shadow-[0_0_0_3px_color-mix(in_oklch,var(--destructive)_18%,transparent)]",
        "file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Input }
