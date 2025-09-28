import { Heart, Activity, Droplets, Sun, Moon, Brain } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/ui/stats-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { WellnessIndicators } from "@/components/wellness-indicators";

export default function WellnessDashboard() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Wellness Dashboard</h1>
        <p className="text-muted-foreground">Monitor your overall health and well-being</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Wellness Score"
          value="87"
          trend={{ value: 5, label: "this week", direction: "up" }}
          icon={<Heart className="h-6 w-6" />}
          variant="wellness"
        />
        <StatsCard
          title="Energy Level"
          value="82%"
          trend={{ value: 3, label: "today", direction: "up" }}
          icon={<Activity className="h-6 w-6" />}
          variant="nature"
        />
        <StatsCard
          title="Hydration"
          value="6/8"
          description="glasses today"
          icon={<Droplets className="h-6 w-6" />}
          variant="focus"
        />
        <StatsCard
          title="Sleep Quality"
          value="8.2"
          trend={{ value: 2, label: "this week", direction: "up" }}
          icon={<Moon className="h-6 w-6" />}
          variant="minimal"
        />
      </div>

      <WellnessIndicators />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Mental Health Check-in
            </CardTitle>
            <CardDescription>How are you feeling today?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-5 gap-2">
              {["😰", "😔", "😐", "😊", "😄"].map((emoji, index) => (
                <button
                  key={index}
                  className="p-3 text-2xl rounded-lg border hover:bg-accent transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="text-center">
              <Badge className="bg-success/10 text-success">Feeling Good</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              Daily Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Drink 8 glasses of water</span>
                <span className="text-sm text-muted-foreground">6/8</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Take breaks every hour</span>
                <span className="text-sm text-muted-foreground">5/8</span>
              </div>
              <Progress value={62.5} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Practice mindfulness</span>
                <span className="text-sm text-success">Complete</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Get sunlight exposure</span>
                <span className="text-sm text-muted-foreground">30 min</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Wellness Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Stress Level</span>
                <div className="flex items-center gap-2">
                  <Progress value={30} className="w-20" />
                  <span className="text-sm text-success">Low</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Physical Activity</span>
                <div className="flex items-center gap-2">
                  <Progress value={75} className="w-20" />
                  <span className="text-sm text-primary">Good</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Social Connection</span>
                <div className="flex items-center gap-2">
                  <Progress value={60} className="w-20" />
                  <span className="text-sm">Moderate</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Health Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                <p className="text-sm font-medium text-success">Great job on your sleep!</p>
                <p className="text-xs text-muted-foreground">You've maintained 8+ hours for 5 days</p>
              </div>
              <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                <p className="text-sm font-medium text-warning">Increase water intake</p>
                <p className="text-xs text-muted-foreground">Try setting hourly reminders</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm font-medium text-primary">Consider a walking break</p>
                <p className="text-xs text-muted-foreground">You've been focused for 2 hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}