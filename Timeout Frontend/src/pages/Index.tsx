import { 
  BookOpen, 
  Clock, 
  Target, 
  TrendingUp, 
  Users, 
  Brain,
  Leaf,
  TreePine,
  Heart,
  Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatsCard } from "@/components/ui/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import forestHero from "@/assets/forest-hero.jpg"

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div 
        className="relative h-64 bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${forestHero})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white max-w-2xl mx-auto px-6">
          <h1 className="text-4xl font-bold font-display mb-4 animate-fade-in-up">
            Welcome to Forest Flow Focus
          </h1>
          <p className="text-xl text-white/90 mb-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Your smart companion for focused learning and wellness
          </p>
          <div className="flex gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Button variant="wellness" size="lg" className="font-semibold">
              <TreePine className="mr-2 h-5 w-5" />
              Start Focus Session
            </Button>
            <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Calendar className="mr-2 h-5 w-5" />
              View Schedule
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-8">
        {/* Stats Overview */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-display text-foreground">Today's Overview</h2>
            <Button variant="minimal">View All Stats</Button>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              variant="nature"
              title="Study Hours Today"
              value="4.5h"
              description="85% of daily goal"
              icon={<BookOpen className="h-6 w-6 text-white" />}
              trend={{ value: 12, label: "vs yesterday", direction: "up" }}
            />
            <StatsCard
              variant="wellness"
              title="Focus Score"
              value="92%"
              description="Excellent focus!"
              icon={<Brain className="h-6 w-6 text-white" />}
              trend={{ value: 8, label: "this week", direction: "up" }}
            />
            <StatsCard
              variant="focus"
              title="Goals Completed"
              value="7/10"
              description="3 remaining today"
              icon={<Target className="h-6 w-6 text-primary" />}
              trend={{ value: 15, label: "completion rate", direction: "up" }}
            />
            <StatsCard
              variant="minimal"
              title="Wellness Score"
              value="8.5/10"
              description="Great balance!"
              icon={<Heart className="h-6 w-6 text-success" />}
              trend={{ value: 5, label: "this week", direction: "up" }}
            />
          </div>
        </section>

        {/* Quick Actions */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-display text-foreground">Quick Actions</h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="group hover:shadow-nature transition-all duration-normal cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-nature flex items-center justify-center">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Focus Timer</CardTitle>
                    <CardDescription>Start a focused study session</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="nature" className="w-full">
                  Start 25 min Session
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-wellness transition-all duration-normal cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-wellness flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Study Rooms</CardTitle>
                    <CardDescription>Join collaborative sessions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="wellness" className="w-full">
                  Browse Rooms
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-normal cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-secondary flex items-center justify-center">
                    <Leaf className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Digital Detox</CardTitle>
                    <CardDescription>Take a mindful break</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full">
                  Start Detox Mode
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-display text-foreground">Recent Activity</h2>
            <Button variant="minimal">View All Activity</Button>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[
                  { time: "2 hours ago", activity: "Completed Focus Session", duration: "25 minutes", type: "focus" },
                  { time: "4 hours ago", activity: "Joined Study Room: Math Group", duration: "1.5 hours", type: "social" },
                  { time: "Yesterday", activity: "Achieved Daily Goal", duration: "5 hours studied", type: "achievement" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      item.type === "focus" ? "bg-primary/10 text-primary" :
                      item.type === "social" ? "bg-success/10 text-success" :
                      "bg-secondary/10 text-secondary"
                    }`}>
                      {item.type === "focus" && <Clock className="h-4 w-4" />}
                      {item.type === "social" && <Users className="h-4 w-4" />}
                      {item.type === "achievement" && <TrendingUp className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{item.activity}</p>
                      <p className="text-xs text-muted-foreground">{item.duration}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Index;
