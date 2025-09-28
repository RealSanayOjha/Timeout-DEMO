import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-lg border p-6 transition-all duration-normal hover:shadow-lg",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground shadow-md border-border",
        nature: "bg-gradient-nature text-white shadow-nature border-primary-light/20",
        wellness: "bg-gradient-wellness text-white shadow-wellness border-success/20",
        focus: "bg-card text-card-foreground shadow-nature border-primary/20",
        minimal: "bg-muted/50 text-muted-foreground shadow-sm border-border/50",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface StatsCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    label: string
    direction: "up" | "down" | "neutral"
  }
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ className, variant, size, title, value, description, icon, trend, ...props }, ref) => {
    const getTrendColor = (direction: "up" | "down" | "neutral") => {
      switch (direction) {
        case "up":
          return "text-success"
        case "down":
          return "text-destructive"
        default:
          return "text-muted-foreground"
      }
    }

    const isGradientVariant = variant === "nature" || variant === "wellness"

    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, size, className }))}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className={cn(
              "text-sm font-medium",
              isGradientVariant ? "text-white/80" : "text-muted-foreground"
            )}>
              {title}
            </p>
            <p className={cn(
              "text-3xl font-bold font-display",
              isGradientVariant ? "text-white" : "text-foreground"
            )}>
              {value}
            </p>
            {description && (
              <p className={cn(
                "text-sm",
                isGradientVariant ? "text-white/70" : "text-muted-foreground"
              )}>
                {description}
              </p>
            )}
            {trend && (
              <div className={cn(
                "flex items-center space-x-1 text-sm",
                isGradientVariant ? "text-white/80" : getTrendColor(trend.direction)
              )}>
                <span className="font-medium">
                  {trend.direction === "up" ? "↗" : trend.direction === "down" ? "↘" : "→"} {trend.value}%
                </span>
                <span className={cn(
                  isGradientVariant ? "text-white/60" : "text-muted-foreground"
                )}>
                  {trend.label}
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-lg",
              isGradientVariant ? "bg-white/10" : "bg-muted"
            )}>
              {icon}
            </div>
          )}
        </div>
      </div>
    )
  }
)
StatsCard.displayName = "StatsCard"

export { StatsCard, cardVariants }