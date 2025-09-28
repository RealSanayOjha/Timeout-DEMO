// Firebase configuration for frontend
import { initializeApp } from 'firebase/app';
import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'firebase/functions';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { config, FIREBASE_CONFIG, EMULATOR_CONFIG, ERROR_CODES } from './app-config';

// Initialize Firebase with centralized config
const app = initializeApp(FIREBASE_CONFIG);
const functions = getFunctions(app);
const auth = getAuth(app);

// Connect to emulator in development BEFORE creating callable functions
if (config.isDevelopment()) {
  try {
    const emulatorConfig = EMULATOR_CONFIG.functions;
    connectFunctionsEmulator(functions, emulatorConfig.host, emulatorConfig.port);
    console.log(`🔧 Connected to Functions emulator on ${emulatorConfig.host}:${emulatorConfig.port}`);
  } catch (error) {
    console.warn(`⚠️ Could not connect to Functions emulator:`, error);
  }
  
  try {
    // Connect Auth emulator
    const authConfig = EMULATOR_CONFIG.auth;
    connectAuthEmulator(auth, `http://${authConfig.host}:${authConfig.port}`, { 
      disableWarnings: true 
    });
    console.log(`🔧 Connected to Auth emulator on ${authConfig.host}:${authConfig.port}`);
  } catch (error) {
    console.warn(`⚠️ Could not connect to Auth emulator:`, error);
  }
}

// Export auth for use in authentication
export { auth };


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
export const safeInitializeUser = httpsCallable(functions, 'safeInitializeUser');
export const updateStudyStats = httpsCallable(functions, 'updateStudyStats');

// Digital Detox functions
export const createAppRestriction = httpsCallable(functions, 'createAppRestriction');
export const startFocusSession = httpsCallable(functions, 'startFocusSession');
export const endFocusSession = httpsCallable(functions, 'endFocusSession');
export const getUserRestrictions = httpsCallable(functions, 'getUserRestrictions');
export const getFocusAnalytics = httpsCallable(functions, 'getFocusAnalytics');
export const updateDigitalWellbeing = httpsCallable(functions, 'updateDigitalWellbeing');
export const recordBlockedUsage = httpsCallable(functions, 'recordBlockedUsage');

// Community functions
export const createStudyCheckIn = httpsCallable(functions, 'createStudyCheckIn');
export const submitPhotoVerification = httpsCallable(functions, 'submitPhotoVerification');
export const votePhotoVerification = httpsCallable(functions, 'votePhotoVerification');
export const getLeaderboard = httpsCallable(functions, 'getLeaderboard');
export const getUserAchievements = httpsCallable(functions, 'getUserAchievements');
export const createStudyGroup = httpsCallable(functions, 'createStudyGroup');

// Classroom functions
export const createClassroom = httpsCallable(functions, 'createClassroom');
export const joinClassroom = httpsCallable(functions, 'joinClassroom');
export const leaveClassroom = httpsCallable(functions, 'leaveClassroom');
export const getMyClassrooms = httpsCallable(functions, 'getMyClassrooms');
export const getAvailableClassrooms = httpsCallable(functions, 'getAvailableClassrooms');
export const startClassSession = httpsCallable(functions, 'startClassSession');
export const endClassSession = httpsCallable(functions, 'endClassSession');
export const joinLiveSession = httpsCallable(functions, 'joinLiveSession');
export const leaveLiveSession = httpsCallable(functions, 'leaveLiveSession');
export const updateSessionParticipant = httpsCallable(functions, 'updateSessionParticipant');

export { functions, app };