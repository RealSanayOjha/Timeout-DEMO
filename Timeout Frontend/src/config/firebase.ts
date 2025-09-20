// Firebase configuration for frontend
import { initializeApp } from 'firebase/app';
import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'firebase/functions';

// Firebase config - using environment variables (NO FALLBACKS for security)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// Connect to emulator in development
if (import.meta.env.DEV) {
  try {
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);
    console.log('🔧 Connected to Functions emulator');
  } catch (error) {
    console.warn('⚠️ Could not connect to Functions emulator:', error);
  }
}


// Callable functions (enabled)
export const createRoom = httpsCallable(functions, 'createRoom');
export const joinRoom = httpsCallable(functions, 'joinRoom');
export const leaveRoom = httpsCallable(functions, 'leaveRoom');
export const getPublicRooms = httpsCallable(functions, 'getPublicRooms');
export const getRoomDetails = httpsCallable(functions, 'getRoomDetails');
export const updateParticipantStatus = httpsCallable(functions, 'updateParticipantStatus');
export const updateUserRole = httpsCallable(functions, 'updateUserRole');
export const getUserProfile = httpsCallable(functions, 'getUserProfile');
export const updateUserPreferences = httpsCallable(functions, 'updateUserPreferences');
export const updateStudyStats = httpsCallable(functions, 'updateStudyStats');
export const safeInitializeUser = httpsCallable(functions, 'safeInitializeUser');

export { functions, app };
