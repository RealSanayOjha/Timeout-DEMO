import { useState, useEffect } from "react"
import { useUser } from "@clerk/clerk-react"
import { 
  Users, 
  Clock, 
  BookOpen, 
  Video, 
  Mic, 
  MicOff,
  VideoOff,
  Plus,
  Search,
  Filter,
  Globe,
  Lock,
  LogOut,
  Circle,
  Timer,
  Target,
  BarChart3,
  Star,
  Camera,
  Upload
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { getPublicRooms, joinRoom, leaveRoom, createRoom } from "@/config/firebase"
import { useAutoLeave } from "@/hooks/useAutoLeave"

interface StudyRoom {
  id: string;
  name: string;
  subject: string;
  participants: number;
  maxParticipants: number;
  duration?: string;
  type: "public" | "private";
  level?: string;
  description: string;
  isActive: boolean;
  tags?: string[];
  hostName?: string;
  status?: string;
}

interface GroupSessionState {
  groupId: string;
  groupName: string;
}

const StudyRooms = () => {
  const { user } = useUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("browse")
  const [studyRooms, setStudyRooms] = useState<StudyRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeGroupSession, setActiveGroupSession] = useState<GroupSessionState | null>(null)
  
  // Photo check-in states for Study Rooms
  const [showPhotoCheckIn, setShowPhotoCheckIn] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)
  const [checkInProgress, setCheckInProgress] = useState<string>('')

  // Auto-leave hook
  useAutoLeave({
    userId: user?.id,
    roomId: activeGroupSession?.groupId,
    onLeave: () => {
      console.log('🚪 Auto-leaving study room')
      setActiveGroupSession(null)
    }
  })

  // Load study rooms from backend
  useEffect(() => {
    const loadRooms = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const result = await getPublicRooms({ 
          limit: 20,
          userId: user?.id || 'demo-user'
        })
        
        const roomsData = (result.data as any).rooms || []
        
        // Transform backend data to frontend format
        const transformedRooms: StudyRoom[] = roomsData.map((room: any) => ({
          id: room.id || room.roomId || 'unknown',
          name: room.name || 'Unnamed Room',
          subject: room.subject || 'General',
          participants: room.currentParticipants || 0,
          maxParticipants: room.maxParticipants || 10,
          duration: calculateDuration(room.createdAt),
          type: room.visibility === 'private' ? 'private' : 'public',
          level: 'All Levels',
          description: room.description || 'Study room for collaborative learning',
          isActive: room.status === 'active',
          tags: [room.subject || 'General', 'Study', 'Collaborative'],
          hostName: room.hostName || 'Unknown Host',
          status: room.status
        }))
        
        setStudyRooms(transformedRooms)
      } catch (err) {
        console.error('❌ Failed to load study rooms:', err)
        setError('Failed to load study rooms')
      } finally {
        setLoading(false)
      }
    }

    loadRooms()
  }, [user])

  // Calculate room duration (placeholder)
  const calculateDuration = (createdAt: any) => {
    // Simple duration calculation - in real app, this would be more sophisticated
    return "Active session"
  }

  // Handle joining a room
  const handleJoinRoom = async (room: StudyRoom) => {
    if (!user) return

    try {
      setLoading(true)
      
      const result = await joinRoom({ 
        roomId: room.id,
        userId: user.id,
        displayName: user.fullName || user.firstName || 'Anonymous',
        avatarUrl: user.imageUrl
      })
      
      console.log('✅ Joined room:', result.data)
      
      setActiveGroupSession({
        groupId: room.id,
        groupName: room.name
      })
      
    } catch (err) {
      console.error('❌ Failed to join room:', err)
      setError('Failed to join room')
    } finally {
      setLoading(false)
    }
  }

  // Handle leaving a room
  const handleLeaveRoom = async () => {
    if (!user || !activeGroupSession) return

    try {
      await leaveRoom({ 
        roomId: activeGroupSession.groupId,
        userId: user.id
      })
      
      console.log('✅ Left room successfully')
      setActiveGroupSession(null)
    } catch (err) {
      console.error('❌ Failed to leave room:', err)
    }
  }

  // Handle creating a new room
  const handleCreateRoom = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      const result = await createRoom({
        name: `${user.firstName}'s Study Room`,
        description: 'Collaborative study session',
        visibility: 'public',
        maxParticipants: 10,
        subject: 'General',
        focusTime: 25,
        shortBreakTime: 5,
        longBreakTime: 15,
        userId: user.id
      })
      
      console.log('✅ Created room:', result.data)
      
      // Refresh rooms list
      window.location.reload()
      
    } catch (err) {
      console.error('❌ Failed to create room:', err)
      setError('Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  // Photo check-in functions for Study Rooms
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedPhoto(file)
    }
  }

  const handleSubmitPhoto = async () => {
    if (!selectedPhoto || !activeGroupSession) return

    try {
      setCheckInProgress('Uploading photo verification...')
      
      // In a real implementation, you would upload to storage and call backend
      console.log('📸 Photo check-in submitted for room:', activeGroupSession.groupName)
      console.log('Photo:', selectedPhoto.name)
      
      setCheckInProgress('Photo submitted successfully! +10 focus points')
      setSelectedPhoto(null)
      setShowPhotoCheckIn(false)
      
      setTimeout(() => setCheckInProgress(''), 3000)
    } catch (error) {
      console.error('Failed to submit photo:', error)
      setCheckInProgress('Failed to submit photo')
      setTimeout(() => setCheckInProgress(''), 3000)
    }
  }

  const filteredRooms = studyRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (room.tags && room.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  )

  // If user is in an active session, show the session interface
  if (activeGroupSession) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display">Study Session</h1>
            <p className="text-muted-foreground mt-2">
              Currently in: {activeGroupSession.groupName}
            </p>
          </div>
          <Button variant="destructive" onClick={handleLeaveRoom}>
            <LogOut className="mr-2 h-4 w-4" />
            Leave Room
          </Button>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Study Session Active</h3>
            <p className="text-muted-foreground text-center mb-6">
              You're currently in the study room: {activeGroupSession.groupName}
            </p>
            
            {/* Study Room Controls with Photo Check-in */}
            <div className="flex gap-4 mb-6">
              <Dialog open={showPhotoCheckIn} onOpenChange={setShowPhotoCheckIn}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-full">
                    <Camera className="w-4 h-4 mr-2" />
                    Photo Check-in
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Study Room Photo Check-in</DialogTitle>
                    <DialogDescription>
                      Upload a photo to verify your study session progress
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload"
                      />
                      {selectedPhoto ? (
                        <div>
                          <img 
                            src={URL.createObjectURL(selectedPhoto)} 
                            alt="Selected" 
                            className="max-w-full h-32 object-cover rounded mx-auto mb-2"
                          />
                          <p className="text-sm text-muted-foreground">{selectedPhoto.name}</p>
                        </div>
                      ) : (
                        <label htmlFor="photo-upload" className="cursor-pointer">
                          <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to select a photo
                          </p>
                        </label>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSubmitPhoto} 
                        disabled={!selectedPhoto || !!checkInProgress}
                        className="flex-1"
                      >
                        Submit Photo
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSelectedPhoto(null)
                          setShowPhotoCheckIn(false)
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" className="rounded-full">
                <Timer className="w-4 h-4 mr-2" />
                Start Timer
              </Button>
            </div>
            
            {checkInProgress && (
              <p className="text-sm text-blue-600 mb-4">{checkInProgress}</p>
            )}
            
            <p className="text-sm text-muted-foreground text-center">
              Use photo check-ins to verify your study progress and earn focus points
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display">Study Rooms</h1>
          <p className="text-muted-foreground mt-2">Join collaborative study sessions or create your own</p>
        </div>
        <Button variant="nature" size="lg" onClick={handleCreateRoom} disabled={loading}>
          <Plus className="mr-2 h-5 w-5" />
          Create Room
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search rooms by name, subject, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">Browse Rooms</TabsTrigger>
          <TabsTrigger value="active">Active Session</TabsTrigger>
          <TabsTrigger value="my-rooms">My Rooms</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>
        
        <TabsContent value="browse" className="mt-6">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <p className="text-destructive">❌ {error}</p>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : filteredRooms.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No study rooms found</h3>
                <p className="text-muted-foreground text-center mb-6">
                  {searchQuery ? "Try adjusting your search terms" : "Be the first to create a study room!"}
                </p>
                <Button variant="nature" onClick={handleCreateRoom}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Room
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredRooms.map((room) => (
                <Card key={room.id} className={cn(
                  "hover:shadow-lg transition-all duration-normal cursor-pointer",
                  room.isActive && "ring-2 ring-primary/20"
                )}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {room.type === "private" ? (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        )}
                        <Badge variant={room.isActive ? "default" : "secondary"}>
                          {room.isActive ? "Active" : "Scheduled"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {room.participants}/{room.maxParticipants}
                      </div>
                    </div>
                    
                    <CardTitle className="text-lg">{room.name}</CardTitle>
                    <CardDescription>{room.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="font-medium">{room.subject}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{room.duration}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {room.tags && (
                      <div className="flex flex-wrap gap-1">
                        {room.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Participants Preview */}
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {[...Array(Math.min(5, room.participants))].map((_, i) => (
                          <Avatar key={i} className="h-6 w-6 border-2 border-background">
                            <AvatarFallback className="text-xs">
                              {String.fromCharCode(65 + i)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {room.participants > 5 && (
                          <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">+{room.participants - 5}</span>
                          </div>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {room.level || "All Levels"}
                      </Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        variant={room.isActive ? "nature" : "outline"} 
                        className="flex-1"
                        size="sm"
                        onClick={() => handleJoinRoom(room)}
                        disabled={loading}
                      >
                        {room.isActive ? "Join Room" : "Reserve Spot"}
                      </Button>
                      <Button variant="ghost" size="icon-sm">
                        {room.isActive ? <Video className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active" className="mt-6">
          {activeGroupSession ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Circle className="h-3 w-3 text-green-500 fill-current" />
                        {activeGroupSession.groupName}
                      </CardTitle>
                      <CardDescription>Active Study Session</CardDescription>
                    </div>
                    <Badge variant="default">In Session</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Session Time</div>
                      <div className="font-medium">01:23:45</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Participants</div>
                      <div className="font-medium">5/8</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Room Type</div>
                      <div className="font-medium">Public</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Status</div>
                      <div className="flex items-center gap-2">
                        <Circle className="h-2 w-2 text-green-500 fill-current" />
                        <span className="font-medium text-green-700">Active</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-6">
                    <Button variant="outline" className="flex-1">
                      <Video className="mr-2 h-4 w-4" />
                      Camera Settings
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Users className="mr-2 h-4 w-4" />
                      Participants (5)
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleLeaveRoom}
                      disabled={loading}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Leave Session
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Session Controls */}
              <Card>
                <CardHeader>
                  <CardTitle>Session Controls</CardTitle>
                  <CardDescription>Manage your study session and focus tools</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Button variant="outline" className="h-20 flex-col">
                      <Timer className="h-6 w-6 mb-2" />
                      <span>Focus Timer</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Target className="h-6 w-6 mb-2" />
                      <span>Goals</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <BarChart3 className="h-6 w-6 mb-2" />
                      <span>Analytics</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Circle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Session</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Join a study room to start your focused learning session
                </p>
                <Button variant="nature" onClick={() => setActiveTab("browse")}>
                  <Search className="mr-2 h-4 w-4" />
                  Browse Study Rooms
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="my-rooms" className="mt-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No rooms created yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                Create your first study room to start collaborating with others
              </p>
              <Button variant="nature" onClick={handleCreateRoom}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Room
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="favorites" className="mt-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Star className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                Save your favorite study rooms for quick access
              </p>
              <Button variant="outline" onClick={() => setActiveTab("browse")}>
                <Search className="mr-2 h-4 w-4" />
                Browse Rooms
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default StudyRooms