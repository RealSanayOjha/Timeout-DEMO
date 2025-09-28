import { BarChart3, TrendingUp, Target, Clock, BookOpen, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/ui/stats-card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Analytics() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Track your progress and performance insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Study Hours"
          value="42.5h"
          trend={{ value: 12, label: "from last week", direction: "up" }}
          icon={<Clock className="h-6 w-6" />}
          variant="nature"
        />
        <StatsCard
          title="Sessions"
          value="28"
          trend={{ value: 8, label: "from last week", direction: "up" }}
          icon={<BookOpen className="h-6 w-6" />}
          variant="wellness"
        />
        <StatsCard
          title="Focus Score"
          value="87%"
          trend={{ value: 5, label: "from last week", direction: "up" }}
          icon={<Target className="h-6 w-6" />}
          variant="focus"
        />
        <StatsCard
          title="Group Sessions"
          value="12"
          trend={{ value: 3, label: "from last week", direction: "up" }}
          icon={<Users className="h-6 w-6" />}
          variant="minimal"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Weekly Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Focus Time</span>
                    <span className="text-sm font-medium">32h</span>
                  </div>
                  <Progress value={80} className="h-2" />
                  <div className="flex justify-between">
                    <span className="text-sm">Productivity</span>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Growth Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Study Streak</span>
                    <span className="text-lg font-bold text-success">12 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Best Focus Session</span>
                    <span className="text-lg font-bold text-primary">2h 45m</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg Session Length</span>
                    <span className="text-lg font-bold">1h 23m</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["Mathematics", "Physics", "Chemistry", "Biology"].map((subject) => (
              <Card key={subject}>
                <CardHeader>
                  <CardTitle className="text-lg">{subject}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Time Spent</span>
                      <span className="font-medium">8h 30m</span>
                    </div>
                    <Progress value={Math.random() * 100} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium text-success">+15%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Goals Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Study 40 hours</span>
                  <span className="text-sm text-muted-foreground">32/40 hours</span>
                </div>
                <Progress value={80} className="h-3" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Complete 25 sessions</span>
                  <span className="text-sm text-muted-foreground">22/25 sessions</span>
                </div>
                <Progress value={88} className="h-3" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Maintain focus above 85%</span>
                  <span className="text-sm text-muted-foreground">87% avg</span>
                </div>
                <Progress value={100} className="h-3" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Your learning patterns over time</CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Detailed trend charts coming in next update</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}