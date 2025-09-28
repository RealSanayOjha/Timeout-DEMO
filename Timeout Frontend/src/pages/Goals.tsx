import { Target, Plus, CheckCircle, Clock, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const goals = [
  {
    id: 1,
    title: "Complete Calculus Course",
    description: "Finish all modules and pass final exam",
    progress: 75,
    deadline: "Dec 2024",
    category: "Academic",
    status: "active"
  },
  {
    id: 2,
    title: "Study 40 hours per week",
    description: "Maintain consistent study schedule",
    progress: 85,
    deadline: "Ongoing",
    category: "Study Habits",
    status: "active"
  },
  {
    id: 3,
    title: "Master Physics Concepts",
    description: "Complete quantum mechanics section",
    progress: 45,
    deadline: "Jan 2025",
    category: "Academic",
    status: "active"
  },
  {
    id: 4,
    title: "Improve Focus Duration",
    description: "Achieve 2-hour uninterrupted sessions",
    progress: 100,
    deadline: "Nov 2024",
    category: "Personal",
    status: "completed"
  }
];

const habits = [
  { name: "Daily meditation", streak: 12, target: 30, completed: true },
  { name: "Exercise", streak: 8, target: 21, completed: false },
  { name: "Read for 30 minutes", streak: 15, target: 30, completed: true },
  { name: "No social media during study", streak: 5, target: 14, completed: true }
];

export default function Goals() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Goals</h1>
          <p className="text-muted-foreground">Track and achieve your objectives</p>
        </div>
        <Button className="bg-gradient-nature text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Active Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-sm text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">12</div>
            <p className="text-sm text-muted-foreground">This year</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">87%</div>
            <p className="text-sm text-muted-foreground">Overall</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Avg Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45 days</div>
            <p className="text-sm text-muted-foreground">To complete</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="goals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {goals.map((goal) => (
              <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <CardDescription>{goal.description}</CardDescription>
                    </div>
                    <Badge 
                      variant={goal.status === "completed" ? "default" : "outline"}
                      className={goal.status === "completed" ? "bg-success/10 text-success" : ""}
                    >
                      {goal.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{goal.deadline}</span>
                    </div>
                    <Badge variant="outline">{goal.category}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="habits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Habits</CardTitle>
              <CardDescription>Build consistent routines for success</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {habits.map((habit, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      habit.completed ? 'bg-success text-white' : 'bg-muted'
                    }`}>
                      {habit.completed && <CheckCircle className="h-3 w-3" />}
                    </div>
                    <div>
                      <p className="font-medium">{habit.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {habit.streak}/{habit.target} day streak
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Progress value={(habit.streak / habit.target) * 100} className="w-20 mb-1" />
                    <p className="text-xs text-muted-foreground">
                      {Math.round((habit.streak / habit.target) * 100)}%
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Goal Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Academic</span>
                    <div className="flex items-center gap-2">
                      <Progress value={65} className="w-20" />
                      <span className="text-sm font-medium">65%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Personal</span>
                    <div className="flex items-center gap-2">
                      <Progress value={80} className="w-20" />
                      <span className="text-sm font-medium">80%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Study Habits</span>
                    <div className="flex items-center gap-2">
                      <Progress value={90} className="w-20" />
                      <span className="text-sm font-medium">90%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-3xl font-bold text-primary">78%</div>
                  <p className="text-sm text-muted-foreground">Average completion rate</p>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-success">5</div>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-warning">3</div>
                      <p className="text-xs text-muted-foreground">In Progress</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}