import { Calendar, Plus, Clock, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const todayEvents = [
  {
    id: 1,
    title: "Mathematics Study Session",
    time: "9:00 AM - 10:30 AM",
    type: "study",
    subject: "Calculus"
  },
  {
    id: 2,
    title: "Physics Lab",
    time: "2:00 PM - 4:00 PM",
    type: "lab",
    subject: "Quantum Physics"
  },
  {
    id: 3,
    title: "Group Study - Chemistry",
    time: "6:00 PM - 8:00 PM",
    type: "group",
    subject: "Organic Chemistry"
  }
];

const weekEvents = [
  { day: "Monday", events: 3 },
  { day: "Tuesday", events: 2 },
  { day: "Wednesday", events: 4 },
  { day: "Thursday", events: 3 },
  { day: "Friday", events: 2 },
  { day: "Saturday", events: 1 },
  { day: "Sunday", events: 0 }
];

export default function Schedule() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Schedule</h1>
          <p className="text-muted-foreground">Manage your study schedule and events</p>
        </div>
        <Button className="bg-gradient-nature text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      <Tabs defaultValue="today" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Schedule
              </CardTitle>
              <CardDescription>Monday, March 25, 2024</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                      {event.type === "study" && <BookOpen className="h-5 w-5 text-primary" />}
                      {event.type === "lab" && <Clock className="h-5 w-5 text-primary" />}
                      {event.type === "group" && <Users className="h-5 w-5 text-primary" />}
                    </div>
                    <div>
                      <h3 className="font-medium">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">{event.time}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{event.subject}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          <div className="grid grid-cols-7 gap-4">
            {weekEvents.map((day) => (
              <Card key={day.day} className="text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{day.day}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{day.events}</div>
                  <p className="text-xs text-muted-foreground">events</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>Full calendar integration coming soon</CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Calendar view will be available in the next update</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}