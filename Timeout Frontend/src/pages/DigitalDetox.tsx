import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  Users,
  Clock,
  Calendar,
  Settings,
  User,
  ShieldCheck,
  Activity,
  Target,
  LogOut,
  CheckCircle,
  Shield,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Plus,
  Pause,
  Smartphone,
  TrendingUp,
  BarChart3,
  Award,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  createAppRestriction,
  startFocusSession,
  endFocusSession,
  getUserRestrictions,
  getFocusAnalytics,
  updateDigitalWellbeing,
  recordBlockedUsage
} from "@/config/firebase";

// Types
interface AppRestriction {
  id: string;
  appName: string;
  restrictionType: 'complete' | 'scheduled' | 'time_limited';
  allowedTime?: number;
  isActive: boolean;
}

interface FocusSession {
  id: string;
  sessionType: 'focus' | 'break' | 'deep_work';
  duration: number;
  startTime: Date;
  status: 'active' | 'completed' | 'interrupted' | 'paused';
}

interface Analytics {
  todayStats: {
    totalFocusTime: number;
    sessionsCompleted: number;
    focusScore: number;
    streakDays: number;
  };
  weeklyTrend: Array<{
    date: string;
    focusTime: number;
    sessionsCompleted: number;
  }>;
  topAppsBlocked: Array<{
    appName: string;
    timeBlocked: number;
  }>;
  recommendations: string[];
}

interface AlertMessage {
  type: 'success' | 'error' | 'warning';
  message: string;
}

// Constants
const FOCUS_TIME_GOAL = 480; // 8 hours in minutes
const DAILY_SESSION_GOAL = 8;
const SESSION_TYPES = {
  focus: { duration: 25, icon: Target, label: 'Focus Session' },
  deep_work: { duration: 90, icon: Clock, label: 'Deep Work' },
  break: { duration: 5, icon: Pause, label: 'Short Break' }
} as const;

/**
 * DigitalDetox Component
 * 
 * A comprehensive digital wellness component that provides:
 * - Focus session management with fullscreen enforcement
 * - App restriction controls
 * - Analytics and progress tracking
 * - Scheduled focus periods
 * - Customizable settings
 * 
 * @returns {JSX.Element} The DigitalDetox component
 */
export default function DigitalDetox(): JSX.Element {
  // Hooks
  const { user } = useUser();
  
  // State
  const [restrictions, setRestrictions] = useState<AppRestriction[]>([]);
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionTimer, setSessionTimer] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Form states
  const [showCreateRestriction, setShowCreateRestriction] = useState<boolean>(false);
  const [newAppName, setNewAppName] = useState<string>('');
  const [restrictionType, setRestrictionType] = useState<'complete' | 'scheduled' | 'time_limited'>('complete');
  const [allowedTime, setAllowedTime] = useState<number>(30);

  // Computed values
  const userId = useMemo(() => user?.id || 'demo-user', [user?.id]);
  const activeRestrictions = useMemo(() => restrictions.filter(r => r.isActive), [restrictions]);
  const focusTimeProgress = useMemo(() => {
    const totalFocusTime = analytics?.todayStats?.totalFocusTime || 0;
    return (totalFocusTime / FOCUS_TIME_GOAL) * 100;
  }, [analytics?.todayStats?.totalFocusTime]);
  
  const sessionProgress = useMemo(() => {
    const sessionsCompleted = analytics?.todayStats?.sessionsCompleted || 0;
    return (sessionsCompleted / DAILY_SESSION_GOAL) * 100;
  }, [analytics?.todayStats?.sessionsCompleted]);

  /**
   * Format time in MM:SS format
   * @param seconds - Time in seconds
   * @returns Formatted time string
   */
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  /**
   * Show alert message with auto-dismiss
   * @param alert - Alert message object
   */
  const showAlert = useCallback((alert: AlertMessage) => {
    setAlertMessage(alert);
    setTimeout(() => setAlertMessage(null), 5000);
  }, []);

  /**
   * Handle errors with logging and user feedback
   * @param error - Error object or string
   * @param userMessage - User-friendly error message
   */
  const handleError = useCallback((error: unknown, userMessage: string) => {
    console.error('DigitalDetox Error:', error);
    setErrorMessage(userMessage);
    showAlert({ type: 'error', message: userMessage });
  }, [showAlert]);

  /**
   * Enter fullscreen mode with cross-browser support
   */
  const enterFullscreen = useCallback(async (): Promise<void> => {
    try {
      const element = document.documentElement;
      
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen();
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen();
      } else {
        throw new Error('Fullscreen API not supported');
      }
      
      setIsFullscreen(true);
      console.log('✅ Entered fullscreen mode');
    } catch (error) {
      console.error('❌ Failed to enter fullscreen:', error);
      showAlert({ 
        type: 'warning', 
        message: 'Could not enter fullscreen mode. Focus session will continue.' 
      });
    }
  }, [showAlert]);

  /**
   * Exit fullscreen mode with cross-browser support
   */
  const exitFullscreen = useCallback(async (): Promise<void> => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
      
      setIsFullscreen(false);
      console.log('✅ Exited fullscreen mode');
    } catch (error) {
      console.error('❌ Failed to exit fullscreen:', error);
      // Force set state even if API call failed
      setIsFullscreen(false);
    }
  }, []);

  /**
   * Check if browser is currently in fullscreen mode
   */
  const isCurrentlyFullscreen = useCallback((): boolean => {
    return !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).msFullscreenElement
    );
  }, []);

  // Fullscreen change event listener
  useEffect(() => {
    const handleFullscreenChange = (): void => {
      const isFullscreenActive = isCurrentlyFullscreen();
      setIsFullscreen(isFullscreenActive);
      
      // If user exits fullscreen during active session, end the session
      if (!isFullscreenActive && activeSession?.status === 'active') {
        console.log('🔴 Fullscreen exited during Digital Detox - ending session');
        handleEndSession('interrupted');
      }
    };

    // Add event listeners for all browser variations
    const events = ['fullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange'];
    events.forEach(event => {
      document.addEventListener(event, handleFullscreenChange);
    });

    // Cleanup event listeners
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleFullscreenChange);
      });
    };
  }, [activeSession?.status, isCurrentlyFullscreen, handleEndSession]);

  /**
   * Load user restrictions and analytics data
   */
  const loadUserData = useCallback(async (): Promise<void> => {
    if (!userId) {
      console.warn('No user ID available, skipping data load');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      
      const [restrictionsResult, analyticsResult] = await Promise.allSettled([
        getUserRestrictions({ userId }),
        getFocusAnalytics({ userId })
      ]);

      // Handle restrictions result
      if (restrictionsResult.status === 'fulfilled') {
        const restrictionsData = (restrictionsResult.value.data as any)?.restrictions || [];
        setRestrictions(restrictionsData);
        console.log('✅ Loaded restrictions:', restrictionsData.length);
      } else {
        console.warn('❌ Failed to load restrictions:', restrictionsResult.reason);
        setRestrictions([]);
      }

      // Handle analytics result
      if (analyticsResult.status === 'fulfilled') {
        const analyticsData = (analyticsResult.value.data as any);
        if (analyticsData?.todayStats) {
          setAnalytics(analyticsData);
          console.log('✅ Loaded analytics data');
        } else {
          throw new Error('Invalid analytics data structure');
        }
      } else {
        console.warn('❌ Failed to load analytics, using mock data:', analyticsResult.reason);
        // Provide fallback analytics data
        setAnalytics({
          todayStats: {
            totalFocusTime: 0,
            sessionsCompleted: 0,
            focusScore: 0,
            streakDays: 0
          },
          weeklyTrend: [],
          topAppsBlocked: [],
          recommendations: []
        });
      }
    } catch (error) {
      handleError(error, 'Failed to load your digital detox data');
    } finally {
      setLoading(false);
    }
  }, [userId, handleError]);

  // Load data when user changes
  useEffect(() => {
    if (userId !== 'demo-user' || user) {
      loadUserData();
    }
  }, [userId, loadUserData, user]);

  // Session timer effect with proper cleanup and dependency management
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeSession?.status === 'active') {
      interval = setInterval(() => {
        setSessionTimer((prevTimer) => {
          const newTimer = prevTimer + 1;
          const totalDurationInSeconds = activeSession.duration * 60;
          
          // Auto-complete session when timer reaches duration
          if (newTimer >= totalDurationInSeconds) {
            // Use setTimeout to avoid calling handleEndSession during render
            setTimeout(() => handleEndSession('completed'), 0);
            return totalDurationInSeconds;
          }
          
          return newTimer;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [activeSession?.status, activeSession?.duration]);

  /**
   * Start a focus session with comprehensive error handling
   */
  const handleStartFocusSession = useCallback(async (
    sessionType: 'focus' | 'break' | 'deep_work', 
    duration: number
  ): Promise<void> => {
    console.log('🟡 Starting Digital Detox session...', { sessionType, duration });
    
    setErrorMessage(null);
    
    try {
      const sessionPayload = {
        sessionType,
        duration,
        restrictedApps: activeRestrictions.map(r => r.appName),
        userId
      };

      const result = await startFocusSession(sessionPayload);
      const sessionData = (result.data as any)?.session;
      
      if (!sessionData) {
        throw new Error('Invalid session data received from server');
      }

      // Process start time with robust handling
      const processedStartTime = (() => {
        if (!sessionData.startTime) return new Date();
        
        if (sessionData.startTime instanceof Date) {
          return sessionData.startTime;
        }
        
        if (typeof sessionData.startTime === 'object' && sessionData.startTime !== null) {
          const timestampObj = sessionData.startTime as any;
          if ('toDate' in timestampObj && typeof timestampObj.toDate === 'function') {
            return timestampObj.toDate();
          }
        }
        
        return new Date();
      })();

      const newActiveSession: FocusSession = {
        id: sessionData.id || sessionData.sessionId || `session-${Date.now()}`,
        sessionType,
        duration,
        startTime: processedStartTime,
        status: 'active'
      };
      
      setActiveSession(newActiveSession);
      setSessionTimer(0);

      // Enter fullscreen for Digital Detox
      console.log('🟢 Starting Digital Detox - entering fullscreen mode');
      await enterFullscreen();
      
      showAlert({
        type: 'success',
        message: `${sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} session started! Focus mode activated.`
      });
      
    } catch (error: any) {
      console.error('❌ Failed to start focus session:', error);
      
      if (error.message?.includes('already has an active focus session')) {
        setActiveSession(null);
        setSessionTimer(0);
        setIsFullscreen(false);
        handleError(error, 'You already have an active session. Please refresh the page to sync your session state.');
      } else {
        handleError(error, 'Failed to start focus session');
      }
    }
  }, [userId, activeRestrictions, enterFullscreen, showAlert, handleError]);

  /**
   * End focus session with proper cleanup
   */
  const handleEndSession = useCallback(async (
    status: 'completed' | 'interrupted' | 'paused'
  ): Promise<void> => {
    if (!activeSession) {
      console.warn('No active session to end');
      return;
    }

    console.log('🛑 Ending session:', { sessionId: activeSession.id, status });
    
    try {
      const endPayload = {
        sessionId: activeSession.id,
        status,
        userId
      };
      
      await endFocusSession(endPayload);
      console.log('🟢 Session ended successfully');
    } catch (backendError) {
      console.error('❌ Backend session end failed:', backendError);
      // Continue with cleanup even if backend fails
    }
    
    // Always clear frontend state
    setActiveSession(null);
    setSessionTimer(0);
    
    // Exit fullscreen
    if (isFullscreen || isCurrentlyFullscreen()) {
      console.log('🔴 Ending Digital Detox - exiting fullscreen mode');
      try {
        await exitFullscreen();
        console.log('✅ Successfully exited fullscreen');
      } catch (fullscreenError) {
        console.error('❌ Error exiting fullscreen:', fullscreenError);
        setIsFullscreen(false);
      }
    }
    
    // Show success message
    showAlert({
      type: 'success',
      message: status === 'completed' 
        ? '🎉 Session completed successfully! Great focus!' 
        : 'Session ended. Keep up the great work!'
    });
    
    // Refresh analytics to get updated stats
    loadUserData();
  }, [activeSession, userId, isFullscreen, isCurrentlyFullscreen, exitFullscreen, showAlert, loadUserData]);

  /**
   * Create app restriction with validation
   */
  const handleCreateRestriction = useCallback(async (): Promise<void> => {
    const trimmedAppName = newAppName.trim();
    
    if (!trimmedAppName) {
      showAlert({ type: 'warning', message: 'Please enter an app name' });
      return;
    }

    // Check for duplicate restrictions
    const existingRestriction = restrictions.find(
      r => r.appName.toLowerCase() === trimmedAppName.toLowerCase()
    );
    
    if (existingRestriction) {
      showAlert({ type: 'warning', message: 'Restriction for this app already exists' });
      return;
    }

    try {
      const restriction = {
        appName: trimmedAppName,
        restrictionType,
        allowedTime: restrictionType === 'time_limited' ? allowedTime : undefined,
        userId
      };

      await createAppRestriction(restriction);
      
      // Reset form
      setNewAppName('');
      setRestrictionType('complete');
      setAllowedTime(30);
      setShowCreateRestriction(false);
      
      // Reload data to show new restriction
      loadUserData();
      
      showAlert({
        type: 'success',
        message: `Restriction created for ${trimmedAppName}`
      });
    } catch (error) {
      handleError(error, 'Failed to create app restriction');
    }
  }, [newAppName, restrictionType, allowedTime, userId, restrictions, showAlert, handleError, loadUserData]);

  /**
   * Emergency clear session function for troubleshooting
   */
  const handleClearSession = useCallback(async (): Promise<void> => {
    try {
      console.log('🧹 Clearing active session state');
      
      // Clear frontend state first
      setActiveSession(null);
      setSessionTimer(0);
      setIsFullscreen(false);
      setErrorMessage(null);
      
      // Exit fullscreen if active
      if (isCurrentlyFullscreen()) {
        await exitFullscreen();
      }
      
      try {
        // Try to force end any active session
        await endFocusSession({
          sessionId: 'force-cleanup',
          status: 'interrupted',
          userId
        });
        console.log('✅ Backend session cleared');
      } catch (cleanupError) {
        console.log('⚠️ Backend cleanup attempted:', cleanupError);
      }
      
      showAlert({
        type: 'success',
        message: '✅ Session state cleared successfully!'
      });
    } catch (error) {
      handleError(error, 'Cleanup failed. Try refreshing the page.');
    }
  }, [userId, isCurrentlyFullscreen, exitFullscreen, showAlert, handleError]);

  // Keyboard shortcuts for better UX
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent): void => {
      // ESC key to end session
      if (event.key === 'Escape' && activeSession?.status === 'active') {
        event.preventDefault();
        handleEndSession('interrupted');
      }
      
      // F11 for fullscreen toggle (in active session only)
      if (event.key === 'F11' && activeSession?.status === 'active') {
        event.preventDefault();
        if (isFullscreen) {
          exitFullscreen();
        } else {
          enterFullscreen();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [activeSession?.status, isFullscreen, handleEndSession, exitFullscreen, enterFullscreen]);

  // Auto-clear alert messages
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading your digital wellness data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with active session status */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Digital Detox</h1>
          <p className="text-muted-foreground">Take control of your digital habits and boost focus</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Emergency clear session button */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleClearSession}
            title="Clear active session state"
          >
            🧹 Clear Session
          </Button>
          
          {/* Active Session Display */}
          {activeSession && (
            <Card className={`p-4 transition-all duration-200 ${
              isFullscreen 
                ? 'border-red-500 bg-red-50 shadow-lg' 
                : 'border-blue-500 bg-blue-50'
            }`}>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono text-lg font-bold">
                    {formatTime(sessionTimer)}
                  </span>
                </div>
                <Badge variant={activeSession.status === 'active' ? 'default' : 'secondary'}>
                  {activeSession.sessionType.replace('_', ' ').toUpperCase()}
                </Badge>
                {isFullscreen && (
                  <Badge variant="destructive" className="bg-red-600 animate-pulse">
                    🔒 Fullscreen Mode
                  </Badge>
                )}
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleEndSession('interrupted')}
                  className="ml-auto"
                >
                  <StopCircle className="w-4 h-4 mr-1" />
                  End Session
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Alert Messages */}
      {alertMessage && (
        <Alert className={`border-l-4 ${
          alertMessage.type === 'success' ? 'border-l-green-500 bg-green-50' : 
          alertMessage.type === 'error' ? 'border-l-red-500 bg-red-50' : 
          'border-l-yellow-500 bg-yellow-50'
        }`}>
          <AlertDescription className={
            alertMessage.type === 'success' ? 'text-green-800' : 
            alertMessage.type === 'error' ? 'text-red-800' : 
            'text-yellow-800'
          }>
            {alertMessage.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Messages */}
      {errorMessage && (
        <Alert className="border-l-4 border-l-red-500 bg-red-50">
          <AlertDescription className="text-red-800 flex items-center justify-between">
            <span>❌ {errorMessage}</span>
            {errorMessage.includes('already have an active session') && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleClearSession}
                className="ml-4"
              >
                Clear Session
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setErrorMessage(null)}
              className="ml-2"
            >
              ✕
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              Focus Time Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.todayStats?.totalFocusTime ? Math.floor(analytics.todayStats.totalFocusTime / 60) : 0}h {analytics?.todayStats?.totalFocusTime ? analytics.todayStats.totalFocusTime % 60 : 0}m
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={focusTimeProgress} className="flex-1" />
              <span className="text-sm text-green-600">+12%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4" />
              Sessions Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.todayStats?.sessionsCompleted || 0}/{DAILY_SESSION_GOAL}</div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={sessionProgress} className="flex-1" />
              <span className="text-sm text-blue-600">{Math.round(sessionProgress)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4" />
              Focus Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{analytics?.todayStats?.focusScore || 0}/100</div>
            <div className="text-xs text-muted-foreground mt-1">
              {(analytics?.todayStats?.focusScore || 0) >= 85 ? 'Excellent!' : 
               (analytics?.todayStats?.focusScore || 0) >= 70 ? 'Good progress' : 'Keep going!'}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4" />
              Apps Blocked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{restrictions.filter(r => r.isActive).length}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-yellow-100 text-yellow-800">Active</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="focus" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="focus">Focus Sessions</TabsTrigger>
          <TabsTrigger value="apps">App Control</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Focus Sessions Tab */}
        <TabsContent value="focus" className="space-y-4">
          {!activeSession ? (
            <div className="space-y-4">
              <Alert className="border-orange-200 bg-orange-50">
                <Shield className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>⚠️ Fullscreen Enforcement:</strong> Starting a Digital Detox session will automatically fullscreen the website. 
                  Exiting fullscreen will immediately end your session to maintain focus discipline.
                </AlertDescription>
              </Alert>
              
              <div className="grid gap-4 md:grid-cols-3">
                {Object.entries(SESSION_TYPES).map(([type, config]) => {
                  const IconComponent = config.icon;
                  return (
                    <Card 
                      key={type}
                      className="p-6 text-center cursor-pointer hover:shadow-lg hover:shadow-green-500/20 hover:border-green-500/50 transition-all duration-200 group"
                      onClick={() => handleStartFocusSession(type as keyof typeof SESSION_TYPES, config.duration)}
                    >
                      <IconComponent className="w-8 h-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                      <h4 className="font-semibold">{config.label}</h4>
                      <p className="text-sm text-muted-foreground">{config.duration} minute{config.duration !== 1 ? 's' : ''}</p>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Card className="p-6">
                <div className="text-center">
                  <div className="text-6xl font-mono mb-4">{formatTime(sessionTimer)}</div>
                  <h3 className="text-xl font-semibold mb-2 capitalize">
                    {activeSession.sessionType.replace('_', ' ')} Session Active
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Stay focused! {isFullscreen ? 'Fullscreen mode is enforcing your focus.' : 'Switch to fullscreen to maintain focus.'}
                  </p>
                  <Progress 
                    value={(sessionTimer / (activeSession.duration * 60)) * 100} 
                    className="h-3 mb-4"
                  />
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="destructive"
                      onClick={() => handleEndSession('interrupted')}
                    >
                      <StopCircle className="w-4 h-4 mr-2" />
                      End Session
                    </Button>
                    {!isFullscreen && (
                      <Button
                        variant="outline"
                        onClick={enterFullscreen}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Enter Fullscreen
                      </Button>
                    )}
                  </div>
                </div>
              </Card>

              {/* Session Controls */}
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => {
                    // Simple check-in without photo
                    console.log('Check-in completed!');
                  }}
                  className="rounded-full shadow-lg"
                >
                  <User className="w-4 h-4 mr-2" />
                  Quick Check In
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* App Control Tab */}
        <TabsContent value="apps" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">App Restrictions</h3>
            <Dialog open={showCreateRestriction} onOpenChange={setShowCreateRestriction}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Restriction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create App Restriction</DialogTitle>
                  <DialogDescription>
                    Block or limit access to distracting apps during focus sessions
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="appName">App/Website Name</Label>
                    <Input
                      id="appName"
                      value={newAppName}
                      onChange={(e) => setNewAppName(e.target.value)}
                      placeholder="e.g., Instagram, Twitter, YouTube"
                    />
                  </div>
                  <div>
                    <Label htmlFor="restrictionType">Restriction Type</Label>
                    <Select value={restrictionType} onValueChange={(value: any) => setRestrictionType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="complete">Complete Block</SelectItem>
                        <SelectItem value="time_limited">Time Limited</SelectItem>
                        <SelectItem value="scheduled">Scheduled Block</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {restrictionType === 'time_limited' && (
                    <div>
                      <Label htmlFor="allowedTime">Allowed Time (minutes/day)</Label>
                      <Input
                        id="allowedTime"
                        type="number"
                        value={allowedTime}
                        onChange={(e) => setAllowedTime(Number(e.target.value))}
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={handleCreateRestriction} className="flex-1">
                      Create Restriction
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCreateRestriction(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="space-y-3">
            {restrictions.length === 0 ? (
              <Card className="p-8 text-center">
                <Smartphone className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No restrictions yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create app restrictions to block distracting websites and apps during focus sessions
                </p>
                <Button onClick={() => setShowCreateRestriction(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Restriction
                </Button>
              </Card>
            ) : (
              restrictions.map((restriction) => (
                <Card key={restriction.id}>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        {restriction.appName.toLowerCase().includes('web') ? (
                          <Globe className="w-4 h-4" />
                        ) : (
                          <Smartphone className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold">{restriction.appName}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {restriction.restrictionType.replace('_', ' ')}
                          {restriction.allowedTime && ` • ${restriction.allowedTime}min/day`}
                        </p>
                      </div>
                    </div>
                    <Switch checked={restriction.isActive} />
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <h3 className="text-lg font-semibold">Focus Analytics</h3>
          
          {!analytics || !analytics.todayStats || analytics.todayStats.sessionsCompleted === 0 ? (
            <Card className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Start tracking your progress</h3>
              <p className="text-muted-foreground mb-4">
                Complete focus sessions to see your analytics and insights
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Your first session will unlock detailed analytics</span>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Today's Achievements
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Focus Time Goal</span>
                    <Badge className="bg-green-100 text-green-800">
                      {analytics?.todayStats?.totalFocusTime ? Math.floor(analytics.todayStats.totalFocusTime / 60) : 0}h {analytics?.todayStats?.totalFocusTime ? analytics.todayStats.totalFocusTime % 60 : 0}m
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sessions Completed</span>
                    <Badge>{analytics?.todayStats?.sessionsCompleted || 0}/8</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Focus Streak</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {analytics?.todayStats?.streakDays || 0} days
                    </Badge>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Focus Score Breakdown
                </h4>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {analytics?.todayStats?.focusScore || 0}/100
                  </div>
                  <Progress value={analytics?.todayStats?.focusScore || 0} className="mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {(analytics?.todayStats?.focusScore || 0) >= 85 ? 'Outstanding focus today! 🌟' : 
                     (analytics?.todayStats?.focusScore || 0) >= 70 ? 'Great progress! Keep it up! ✨' : 'Building momentum! You got this! 💪'}
                  </p>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Focus Schedule</CardTitle>
              <CardDescription>Automated detox periods during study time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <h3 className="font-medium">Morning Focus</h3>
                  <p className="text-sm text-muted-foreground">9:00 AM - 12:00 PM</p>
                  <Switch className="mt-2" />
                </div>
                <div className="p-3 border rounded-lg">
                  <h3 className="font-medium">Afternoon Study</h3>
                  <p className="text-sm text-muted-foreground">2:00 PM - 6:00 PM</p>
                  <Switch className="mt-2" />
                </div>
                <div className="p-3 border rounded-lg">
                  <h3 className="font-medium">Evening Deep Work</h3>
                  <p className="text-sm text-muted-foreground">7:00 PM - 9:00 PM</p>
                  <Switch className="mt-2" />
                </div>
                <div className="p-3 border rounded-lg">
                  <h3 className="font-medium">Weekend Focus</h3>
                  <p className="text-sm text-muted-foreground">10:00 AM - 2:00 PM</p>
                  <Switch className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detox Preferences</CardTitle>
              <CardDescription>Customize your digital wellness experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Fullscreen enforcement</h3>
                    <p className="text-sm text-muted-foreground">Automatically enter fullscreen during focus sessions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Block notifications</h3>
                    <p className="text-sm text-muted-foreground">Silence all non-essential notifications during focus</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Break reminders</h3>
                    <p className="text-sm text-muted-foreground">Regular prompts to take healthy breaks</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Streak notifications</h3>
                    <p className="text-sm text-muted-foreground">Celebrate your focus streaks and milestones</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}