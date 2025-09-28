// Simplified user initialization with better error handling
import { useUser, useAuth } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';
import { safeInitializeUser } from '@/config/firebase';

export const useUserInitialization = () => {
  const [userInitialized, setUserInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const initializeUser = async () => {
      if (isSignedIn && user?.id && !isInitializing && !userInitialized) {
        setIsInitializing(true);
        setError(null);
        
        try {
          console.log('🔄 Initializing user in database...');
          console.log('📋 Clerk User ID:', user.id);
          
          // Simplified user data preparation
          const userData = {
            userId: user.id,
            email: user.emailAddresses?.[0]?.emailAddress || 'demo@example.com',
            firstName: user.firstName || 'Demo',
            lastName: user.lastName || 'User',
            avatarUrl: user.imageUrl || ''
          };
          
          console.log('📤 Sending user data to backend:', userData);
          
          const result = await safeInitializeUser(userData);
          
          console.log('✅ User initialized successfully:', result.data);
          setUserInitialized(true);
          
        } catch (error: any) {
          console.error('❌ Failed to initialize user:', error);
          
          // For development, allow continuing without backend initialization
          if (error.message?.includes('timeout') || error.message?.includes('Failed to fetch')) {
            console.warn('⚠️ Backend unavailable, continuing in offline mode');
            setUserInitialized(true); // Allow app to continue
          } else {
            setError(error.message || 'Failed to initialize user');
          }
        } finally {
          setIsInitializing(false);
        }
      }
    };

    // Reset states when user signs out
    if (!isSignedIn) {
      setUserInitialized(false);
      setIsInitializing(false);
      setError(null);
    }

    if (isLoaded) {
      initializeUser();
    }
  }, [isSignedIn, user?.id, userInitialized, isLoaded]);

  return {
    userInitialized,
    isInitializing,
    error
  };
};