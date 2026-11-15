import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold tracking-tight w-fit whitespace-nowrap shrink-0 [&>svg]:size-3.5 gap-1.5 [&>svg]:pointer-events-none transition-colors overflow-hidden select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/12 text-primary dark:bg-primary/20",
        secondary:
          "border-transparent bg-black/[0.05] text-foreground dark:bg-white/[0.08] dark:text-white",
        success:
          "border-transparent bg-[#34C759]/15 text-[#34C759] dark:bg-[#30D158]/20 dark:text-[#30D158]",
        destructive:
          "border-transparent bg-destructive/15 text-destructive dark:bg-destructive/25 dark:text-red-400",
        outline:
          "border-border/80 text-foreground bg-background/50 backdrop-blur-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
