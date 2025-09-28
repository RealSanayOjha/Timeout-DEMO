import { Brain, Play, Pause, Volume2, VolumeX, Timer, Flower } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const meditationSessions = [
  { name: "Deep Breathing", duration: "5 min", difficulty: "Beginner", category: "Breathing" },
  { name: "Body Scan", duration: "15 min", difficulty: "Intermediate", category: "Relaxation" },
  { name: "Loving Kindness", duration: "10 min", difficulty: "Beginner", category: "Compassion" },
  { name: "Focus Meditation", duration: "20 min", difficulty: "Advanced", category: "Concentration" }
];

const mindfulnessQuotes = [
  "The present moment is the only time over which we have dominion. - Thích Nhất Hạnh",
  "Mindfulness is about being fully awake in our lives. - Jon Kabat-Zinn",
  "Peace comes from within. Do not seek it without. - Buddha"
];

export default function Mindfulness() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mindfulness</h1>
          <p className="text-muted-foreground">Cultivate awareness and inner peace</p>
        </div>
        <Button className="bg-gradient-wellness text-white">
          <Play className="h-4 w-4 mr-2" />
          Quick Session
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">12 days</div>
            <p className="text-sm text-muted-foreground">Keep it up!</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Total Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">24h 15m</div>
            <p className="text-sm text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flower className="h-5 w-5" />
              Mindfulness Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">Intermediate</div>
            <Progress value={65} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sessions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="breathing">Breathing</TabsTrigger>
          <TabsTrigger value="wisdom">Wisdom</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meditationSessions.map((session, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{session.name}</CardTitle>
                      <CardDescription>{session.duration}</CardDescription>
                    </div>
                    <Badge variant="outline">{session.difficulty}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{session.category}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Volume2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" className="bg-gradient-wellness text-white">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Sessions completed</span>
                    <span className="text-sm font-medium">18/21</span>
                  </div>
                  <Progress value={86} className="h-3" />
                  <div className="flex justify-between">
                    <span className="text-sm">Time meditated</span>
                    <span className="text-sm font-medium">4h 30m</span>
                  </div>
                  <Progress value={75} className="h-3" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                      <Brain className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">First Week Complete</p>
                      <p className="text-xs text-muted-foreground">7 consecutive days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Timer className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Time Master</p>
                      <p className="text-xs text-muted-foreground">20+ hours meditated</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 opacity-50">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Flower className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Zen Master</p>
                      <p className="text-xs text-muted-foreground">30 day streak (locked)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="breathing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Breathing Exercise</CardTitle>
              <CardDescription>4-7-8 breathing technique for relaxation</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="relative">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-wellness/20 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-wellness/40 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-wellness flex items-center justify-center">
                      <span className="text-white font-bold text-lg">4</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-lg font-medium">Inhale</p>
                <p className="text-sm text-muted-foreground">Breathe in for 4 seconds</p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button className="bg-gradient-wellness text-white">
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </Button>
                <Button variant="outline">
                  <VolumeX className="h-4 w-4 mr-2" />
                  Mute
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wisdom" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {mindfulnessQuotes.map((quote, index) => (
              <Card key={index} className="p-6 text-center">
                <CardContent>
                  <blockquote className="text-lg italic text-muted-foreground">
                    "{quote}"
                  </blockquote>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}