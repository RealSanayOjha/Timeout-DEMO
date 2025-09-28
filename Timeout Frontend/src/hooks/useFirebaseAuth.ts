// Custom hook to handle Clerk + Firebase authentication
import { useAuth, useUser } from '@clerk/clerk-react';
import { auth } from '@/config/firebase';
import { signInAnonymously, signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';

export const useFirebaseAuth = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [firebaseUser, setFirebaseUser] = useState(auth.currentUser);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const authenticateWithFirebase = async () => {
      if (isSignedIn && user && !firebaseUser && !isAuthenticating) {
        setIsAuthenticating(true);
        setAuthError(null);
        
        try {
          console.log('🔐 Signing in to Firebase anonymously for development...');
          
          // For development with emulators, sign in anonymously
          // This provides auth context that Firebase functions need
          const userCredential = await signInAnonymously(auth);
          
          // Override the UID to match Clerk user ID for consistency
          Object.defineProperty(userCredential.user, 'uid', {
            value: user.id,
            writable: false
          });
          
          setFirebaseUser(userCredential.user);
          console.log('✅ Successfully authenticated with Firebase (development mode)');
          
        } catch (error: any) {
          console.error('❌ Firebase authentication failed:', error);
          setAuthError(error.message || 'Firebase authentication failed');
        } finally {
          setIsAuthenticating(false);
        }
      }
      
      // Sign out of Firebase when signed out of Clerk
      if (!isSignedIn && firebaseUser) {
        try {
          await signOut(auth);
          setFirebaseUser(null);
          console.log('🔓 Signed out of Firebase');
        } catch (error) {
          console.error('Error signing out of Firebase:', error);
        }
      }
    };

    authenticateWithFirebase();
  }, [isSignedIn, user, firebaseUser, isAuthenticating]);

  return {
    firebaseUser,
    isAuthenticating,
    authError,
    isFirebaseAuthenticated: !!firebaseUser
  };
};