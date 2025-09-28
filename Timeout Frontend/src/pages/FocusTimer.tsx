import { Play, Pause, RotateCcw, Settings, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FocusTimer as FocusTimerComponent } from "@/components/focus-timer";

export default function FocusTimer() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Focus Timer</h1>
          <p className="text-muted-foreground">Boost productivity with Pomodoro technique</p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FocusTimerComponent />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">6/8</div>
                <p className="text-sm text-muted-foreground">Pomodoros completed</p>
              </div>
              <Progress value={75} className="h-3" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Target: 8</span>
                <span>Remaining: 2</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Focus Time</span>
                <span className="text-sm font-medium">3h 30m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Break Time</span>
                <span className="text-sm font-medium">45m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Productivity</span>
                <Badge className="bg-success/10 text-success">88%</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <Play className="h-4 w-4 mr-2" />
                Start Deep Work Session
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                Custom Timer
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset All Stats
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: "14:30 - 15:00", duration: "25 min", subject: "Mathematics", status: "completed" },
                { time: "13:45 - 14:10", duration: "25 min", subject: "Physics", status: "completed" },
                { time: "13:00 - 13:25", duration: "25 min", subject: "Chemistry", status: "completed" },
                { time: "12:15 - 12:40", duration: "25 min", subject: "Biology", status: "interrupted" }
              ].map((session, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded border">
                  <div>
                    <p className="text-sm font-medium">{session.subject}</p>
                    <p className="text-xs text-muted-foreground">{session.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{session.duration}</p>
                    <Badge 
                      variant={session.status === "completed" ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {session.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Focus Tips</CardTitle>
            <CardDescription>Maximize your productivity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm font-medium">Remove distractions</p>
                <p className="text-xs text-muted-foreground">Put your phone in another room during focus sessions</p>
              </div>
              <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                <p className="text-sm font-medium">Stay hydrated</p>
                <p className="text-xs text-muted-foreground">Keep a water bottle nearby for better concentration</p>
              </div>
              <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                <p className="text-sm font-medium">Take real breaks</p>
                <p className="text-xs text-muted-foreground">Step away from your desk and rest your eyes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}