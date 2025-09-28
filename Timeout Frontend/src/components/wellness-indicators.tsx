import { Heart, Brain, Leaf, Sun, Moon, Droplets } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface WellnessIndicatorsProps {
  className?: string
}

const wellnessMetrics = [
  {
    id: "focus",
    label: "Focus Level",
    value: 85,
    icon: Brain,
    color: "text-primary",
    bgColor: "bg-primary/10",
    description: "Great concentration today!"
  },
  {
    id: "energy",
    label: "Energy Level", 
    value: 72,
    icon: Sun,
    color: "text-warning",
    bgColor: "bg-warning/10", 
    description: "Moderate energy - consider a break"
  },
  {
    id: "stress",
    label: "Stress Level",
    value: 25,
    icon: Heart,
    color: "text-success",
    bgColor: "bg-success/10",
    description: "Low stress - excellent!"
  },
  {
    id: "hydration",
    label: "Hydration",
    value: 60,
    icon: Droplets,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    description: "Time for some water"
  },
  {
    id: "rest",
    label: "Rest Quality",
    value: 90,
    icon: Moon,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    description: "Well rested!"
  },
  {
    id: "balance",
    label: "Digital Balance",
    value: 78,
    icon: Leaf,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    description: "Good digital wellness"
  }
]

export function WellnessIndicators({ className }: WellnessIndicatorsProps) {
  const getStatusBadge = (value: number) => {
    if (value >= 80) return { label: "Excellent", variant: "default" as const, color: "bg-success" }
    if (value >= 60) return { label: "Good", variant: "secondary" as const, color: "bg-warning" }
    return { label: "Needs Attention", variant: "destructive" as const, color: "bg-destructive" }
  }

  const overallScore = Math.round(
    wellnessMetrics.reduce((sum, metric) => sum + metric.value, 0) / wellnessMetrics.length
  )

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overall Wellness Score */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-success/5">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-display">Overall Wellness</CardTitle>
          <div className="text-4xl font-bold text-primary mt-2">{overallScore}/100</div>
          <Badge 
            variant={getStatusBadge(overallScore).variant}
            className="mt-2"
          >
            {getStatusBadge(overallScore).label}
          </Badge>
        </CardHeader>
      </Card>

      {/* Individual Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {wellnessMetrics.map((metric) => {
          const Icon = metric.icon
          const status = getStatusBadge(metric.value)
          
          return (
            <Card key={metric.id} className="hover:shadow-lg transition-all duration-normal">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", metric.bgColor)}>
                      <Icon className={cn("h-5 w-5", metric.color)} />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{metric.label}</h3>
                      <p className="text-xs text-muted-foreground">{metric.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn("text-lg font-bold", metric.color)}>
                      {metric.value}%
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Progress 
                    value={metric.value}
                    className="h-2"
                  />
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                  >
                    {status.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Wellness Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-success" />
            Today's Wellness Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/20">
              <Droplets className="h-4 w-4 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Stay Hydrated</p>
                <p className="text-xs text-muted-foreground">Drink a glass of water every hour to maintain focus</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <Brain className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Take Mental Breaks</p>
                <p className="text-xs text-muted-foreground">Step away from screens every 25 minutes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}