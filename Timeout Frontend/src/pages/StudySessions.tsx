import { Calendar, Clock, BookOpen, Users, Play, Pause, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const activeSessions = [
  {
    id: 1,
    subject: "Mathematics",
    topic: "Calculus Integration",
    duration: 120,
    elapsed: 45,
    participants: 3,
    status: "active"
  },
  {
    id: 2,
    subject: "Physics",
    topic: "Quantum Mechanics",
    duration: 90,
    elapsed: 30,
    participants: 1,
    status: "paused"
  }
];

const recentSessions = [
  {
    id: 3,
    subject: "Chemistry",
    topic: "Organic Reactions",
    duration: 60,
    completed: true,
    date: "Today, 2:30 PM"
  },
  {
    id: 4,
    subject: "Biology",
    topic: "Cell Structure",
    duration: 75,
    completed: true,
    date: "Yesterday, 4:15 PM"
  }
];

export default function StudySessions() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Study Sessions</h1>
          <p className="text-muted-foreground">Track and manage your focused study time</p>
        </div>
        <Button className="bg-gradient-nature text-white">
          <Play className="h-4 w-4 mr-2" />
          Start New Session
        </Button>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Sessions</TabsTrigger>
          <TabsTrigger value="recent">Recent Sessions</TabsTrigger>
          <TabsTrigger value="analytics">Session Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeSessions.map((session) => (
            <Card key={session.id} className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      {session.subject}
                    </CardTitle>
                    <CardDescription>{session.topic}</CardDescription>
                  </div>
                  <Badge variant={session.status === "active" ? "default" : "secondary"}>
                    {session.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {session.elapsed}m / {session.duration}m
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {session.participants} participant{session.participants > 1 ? 's' : ''}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                <Progress value={(session.elapsed / session.duration) * 100} className="h-2" />
                <div className="flex gap-2">
                  <Button size="sm" variant={session.status === "active" ? "secondary" : "default"}>
                    {session.status === "active" ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                    {session.status === "active" ? "Pause" : "Resume"}
                  </Button>
                  <Button size="sm" variant="outline">End Session</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          {recentSessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      {session.subject}
                    </CardTitle>
                    <CardDescription>{session.topic}</CardDescription>
                  </div>
                  <Badge variant="outline">{session.duration}m</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{session.date}</span>
                  <Badge className="bg-success/10 text-success">Completed</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Study Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24h 30m</div>
                <p className="text-sm text-muted-foreground">This week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Sessions Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18</div>
                <p className="text-sm text-muted-foreground">This week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Average Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-sm text-muted-foreground">This week</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}