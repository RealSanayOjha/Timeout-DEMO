import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, RedirectToSignIn } from '@clerk/clerk-react';
import { ForestSidebar } from "@/components/forest-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { useUserInitialization } from "@/utils/userInitialization";
import Index from "./pages/Index";
import StudySessions from "./pages/StudySessions";
import StudyRooms from "./pages/StudyRooms";
import Schedule from "./pages/Schedule";
import Analytics from "./pages/Analytics";
import DigitalDetox from "./pages/DigitalDetox";
import WellnessDashboard from "./pages/WellnessDashboard";
import FocusTimer from "./pages/FocusTimer";
import Goals from "./pages/Goals";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Import Clerk publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

// Component that handles user initialization after sign-in
const AuthenticatedApp = () => {
  const { userInitialized, isInitializing, error } = useUserInitialization();

  // Show loading while initializing user
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Setting up your account...</p>
        </div>
      </div>
    );
  }

  // Show error if user initialization failed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8">
          <div className="text-destructive">⚠️</div>
          <h2 className="text-lg font-semibold">Account Setup Failed</h2>
          <p className="text-muted-foreground">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show main app once user is initialized
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <ForestSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/study" element={<StudySessions />} />
              <Route path="/rooms" element={<StudyRooms />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/detox" element={<DigitalDetox />} />
              <Route path="/wellness" element={<WellnessDashboard />} />
              <Route path="/focus" element={<FocusTimer />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <ClerkProvider 
    publishableKey={PUBLISHABLE_KEY}
    signInUrl="/sign-in"
    signUpUrl="/sign-up"
    afterSignInUrl="/"
    afterSignUpUrl="/"
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SignedIn>
            <AuthenticatedApp />
          </SignedIn>
          <SignedOut>
            <div className="min-h-screen flex items-center justify-center bg-background">
              <div className="text-center space-y-6 p-8">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold">Welcome to TimeOut</h1>
                  <p className="text-muted-foreground">
                    Your collaborative study platform
                  </p>
                </div>
                <SignInButton mode="modal">
                  <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    Sign In to Continue
                  </button>
                </SignInButton>
              </div>
            </div>
          </SignedOut>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ClerkProvider>
);

export default App;
