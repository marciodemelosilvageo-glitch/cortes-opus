import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold tracking-tight transition-all duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:brightness-105 active:brightness-95",
        destructive:
          "bg-destructive text-white shadow-[0_2px_8px_rgba(255,59,48,0.25)] hover:brightness-105 active:brightness-95",
        outline:
          "border border-border/80 bg-background/80 backdrop-blur-md text-foreground shadow-xs hover:bg-secondary/80 active:bg-secondary",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/60",
        ghost:
          "hover:bg-accent/80 hover:text-accent-foreground active:bg-accent",
        link: "text-primary underline-offset-4 hover:underline rounded-none active:scale-100",
      },
      size: {
        default: "min-h-[44px] h-11 px-5 py-2.5 has-[>svg]:px-4",
        sm: "min-h-[36px] h-9 rounded-full gap-1.5 px-3.5 text-xs has-[>svg]:px-2.5",
        lg: "min-h-[48px] h-12 rounded-full px-7 text-base has-[>svg]:px-5",
        icon: "size-11 rounded-full",
        "icon-sm": "size-9 rounded-full",
        "icon-lg": "size-12 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
