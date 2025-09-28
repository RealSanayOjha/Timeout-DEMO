import { useState, useEffect } from "react"
import { Play, Pause, RotateCcw, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface FocusTimerProps {
  className?: string
}

export function FocusTimer({ className }: FocusTimerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [initialTime] = useState(25 * 60)
  const [session, setSession] = useState<"focus" | "break">("focus")

  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      // Switch between focus and break
      setSession(session === "focus" ? "break" : "focus")
      setTimeLeft(session === "focus" ? 5 * 60 : 25 * 60) // 5 min break, 25 min focus
      setIsRunning(false)
    }

    return () => clearInterval(interval)
  }, [isRunning, timeLeft, session])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((initialTime - timeLeft) / initialTime) * 100

  const handleStart = () => setIsRunning(!isRunning)
  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(25 * 60)
    setSession("focus")
  }

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <div className={cn(
            "h-3 w-3 rounded-full",
            session === "focus" ? "bg-primary animate-pulse-gentle" : "bg-success animate-pulse-gentle"
          )} />
          {session === "focus" ? "Focus Session" : "Break Time"}
        </CardTitle>
        <CardDescription>
          {session === "focus" ? "Time to concentrate and be productive" : "Take a well-deserved break"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center space-y-4">
          <div className={cn(
            "text-6xl font-bold font-display transition-colors duration-normal",
            session === "focus" ? "text-primary" : "text-success"
          )}>
            {formatTime(timeLeft)}
          </div>
          
          <Progress 
            value={progress} 
            className={cn(
              "h-2 transition-all duration-normal",
              session === "focus" ? "[&>div]:bg-primary" : "[&>div]:bg-success"
            )}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button
            variant={session === "focus" ? "nature" : "wellness"}
            size="lg"
            onClick={handleStart}
            className="min-w-[120px]"
          >
            {isRunning ? (
              <>
                <Pause className="mr-2 h-5 w-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" />
                Start
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={handleReset}
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Reset
          </Button>
          
          <Button variant="ghost" size="icon-lg">
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Session Info */}
        <div className="text-center text-sm text-muted-foreground">
          {session === "focus" ? (
            "Stay focused! You're doing great."
          ) : (
            "Relax and recharge for the next session."
          )}
        </div>
      </CardContent>
    </Card>
  )
}