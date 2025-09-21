// Firebase user handler for frontend
import { getFirestore, doc, getDoc, setDoc, updateDoc, connectFirestoreEmulator, runTransaction } from 'firebase/firestore';
import { getApp } from 'firebase/app';

// Get the existing Firebase app (already initialized in config/firebase.ts)
const app = getApp();
export const db = getFirestore(app);

// Connect to Firestore emulator in development
if (import.meta.env.DEV) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8092);
    console.log('🔥 Connected to Firestore emulator on port 8092');
  } catch (error) {
    // This is expected if already connected
    if (error.code === 'failed-precondition') {
      console.log('🔥 Already connected to Firestore emulator');
    } else {
      console.warn('⚠️ Could not connect to Firestore emulator:', error);
    }
  }
}// Data preservation rules - defines what should never be overwritten
const PRESERVATION_RULES = {
  // NEVER TOUCH - Critical data that should be preserved forever
  IMMUTABLE: [
    'clerkId', 
    'email', 
    'createdAt', 
    'role',
    'studyStats.totalStudyTime',
    'studyStats.sessionsCompleted', 
    'studyStats.longestStreak',
    'studyStats.currentStreak'
  ],
  
  // PRESERVE IF EXISTS - User configurations that shouldn't be overwritten if already set
  PRESERVE_IF_SET: [
    'preferences.defaultFocusTime',
    'preferences.shortBreakTime',
    'preferences.longBreakTime',
    'preferences.sessionsBeforeLongBreak',
    'preferences.soundEnabled',
    'preferences.notificationsEnabled',
    'preferences.theme',
    'studyStats.weeklyGoal'
  ],
  
  // SAFE TO UPDATE - Profile/session data that can be refreshed from Clerk
  UPDATABLE: [
    'firstName',
    'lastName', 
    'displayName',
    'avatarUrl',
    'updatedAt',
    'isActive',
    'lastLoginAt'
  ],
  
  // ADD IF MISSING - Fill gaps in data structure
  ADD_IF_MISSING: [
    'studyStats.weeklyProgress',
    'isActive'
  ]
};

// Helper function to get nested property value
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Helper function to set nested property value
const setNestedValue = (obj: any, path: string, value: any) => {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
};

// Smart merge function that preserves critical data
const createSafeUpdates = (clerkUser: any, existingData: any) => {
  const updates: any = {};
  
  console.log('🔍 Creating safe updates for user:', clerkUser.id);
  console.log('📊 Existing data keys:', Object.keys(existingData));
  
  // Rule 1: Update safe profile fields that might have changed in Clerk
  const newFirstName = clerkUser.firstName || '';
  const newLastName = clerkUser.lastName || '';
  const newDisplayName = `${newFirstName} ${newLastName}`.trim() || 'Anonymous';
  const newAvatarUrl = clerkUser.imageUrl || '';
  
  if (newFirstName !== existingData.firstName) {
    updates.firstName = newFirstName;
    console.log('📝 Updating firstName:', existingData.firstName, '->', newFirstName);
  }
  
  if (newLastName !== existingData.lastName) {
    updates.lastName = newLastName;
    console.log('📝 Updating lastName:', existingData.lastName, '->', newLastName);
  }
  
  if (newDisplayName !== existingData.displayName) {
    updates.displayName = newDisplayName;
    console.log('📝 Updating displayName:', existingData.displayName, '->', newDisplayName);
  }
  
  if (newAvatarUrl !== existingData.avatarUrl) {
    updates.avatarUrl = newAvatarUrl;
    console.log('📝 Updating avatarUrl');
  }
  
  // Rule 2: Add missing structure without overwriting existing values
  if (!existingData.studyStats) {
    updates.studyStats = {
      totalStudyTime: 0,
      sessionsCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      weeklyGoal: 0,
      weeklyProgress: 0,
    };
    console.log('➕ Adding missing studyStats structure');
  } else {
    // Add missing study stats fields
    if (typeof existingData.studyStats.weeklyProgress === 'undefined') {
      updates['studyStats.weeklyProgress'] = 0;
      console.log('➕ Adding missing weeklyProgress');
    }
  }
  
  if (!existingData.preferences) {
    updates.preferences = {
      defaultFocusTime: 25,
      shortBreakTime: 5,
      longBreakTime: 15,
      sessionsBeforeLongBreak: 4,
      soundEnabled: true,
      notificationsEnabled: true,
      theme: 'system',
    };
    console.log('➕ Adding missing preferences structure');
  }
  
  // Rule 3: Ensure required fields exist
  if (typeof existingData.isActive === 'undefined') {
    updates.isActive = true;
    console.log('➕ Adding missing isActive field');
  }
  
  // Rule 4: NEVER update immutable fields - explicitly check and warn
  PRESERVATION_RULES.IMMUTABLE.forEach(field => {
    const existingValue = getNestedValue(existingData, field);
    if (existingValue !== null && existingValue !== undefined) {
      console.log(`🔒 PRESERVING ${field}:`, existingValue);
    }
  });
  
  // Rule 5: Always update metadata
  updates.updatedAt = new Date();
  
  console.log('✅ Safe updates prepared:', Object.keys(updates));
  return updates;
};

// Function to ensure user exists and create if not - with data preservation
export const ensureUserExists = async (clerkUser: any) => {
  try {
    console.log('🔍 Checking if user exists in database...', clerkUser.id);
    
    const userDocRef = doc(db, 'users', clerkUser.id);
    
    // Use transaction to ensure atomic operation
    return await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userDocRef);
      
      if (!userDoc.exists()) {
        console.log('👤 Creating new user in database...');
        
        // Create user data matching the backend structure we verified works
        const userData = {
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          displayName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Anonymous',
          avatarUrl: clerkUser.imageUrl || '',
          role: null, // Will be set during role selection
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          studyStats: {
            totalStudyTime: 0,
            sessionsCompleted: 0,
            currentStreak: 0,
            longestStreak: 0,
            weeklyGoal: 0,
            weeklyProgress: 0,
          },
          preferences: {
            defaultFocusTime: 25,
            shortBreakTime: 5,
            longBreakTime: 15,
            sessionsBeforeLongBreak: 4,
            soundEnabled: true,
            notificationsEnabled: true,
            theme: 'system',
          },
        };
        
        transaction.set(userDocRef, userData);
        console.log('✅ New user created successfully in database');
        return userData;
      } else {
        console.log('👤 User already exists - applying smart merge strategy...');
        const existingData = userDoc.data();
        
        // Create safe updates that preserve critical data
        const safeUpdates = createSafeUpdates(clerkUser, existingData);
        
        // Only update if there are actual changes needed
        if (Object.keys(safeUpdates).length > 1) { // More than just updatedAt
          console.log('📝 Applying safe updates:', Object.keys(safeUpdates));
          transaction.update(userDocRef, safeUpdates);
          
          // Return merged data
          return { ...existingData, ...safeUpdates };
        } else {
          console.log('✅ No updates needed - data is current');
          return existingData;
        }
      }
    });
  } catch (error) {
    console.error('❌ Error ensuring user exists:', error);
    throw error;
  }
};
  } catch (error) {
    console.error('❌ Error ensuring user exists:', error);
    throw error;
  }
};

export const getUserData = async (clerkUserId: string) => {
  try {
    const userDocRef = doc(db, 'users', clerkUserId);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error('❌ Error getting user data:', error);
    throw error;
  }
};

// Function to safely update user profile (preserving critical data)
export const safeUpdateUserProfile = async (clerkUserId: string, updates: any) => {
  try {
    console.log('🔒 Safe update requested for user:', clerkUserId);
    console.log('📝 Requested updates:', Object.keys(updates));
    
    const userDocRef = doc(db, 'users', clerkUserId);
    
    return await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const existingData = userDoc.data();
      const safeUpdates: any = {};
      
      // Filter updates to only allow safe changes
      Object.entries(updates).forEach(([key, value]) => {
        if (PRESERVATION_RULES.UPDATABLE.includes(key)) {
          safeUpdates[key] = value;
          console.log(`✅ Allowing update to ${key}`);
        } else if (PRESERVATION_RULES.IMMUTABLE.some(field => field === key || field.startsWith(key + '.'))) {
          console.warn(`🔒 BLOCKED update to protected field: ${key}`);
        } else {
          console.warn(`⚠️ Unknown field update attempted: ${key}`);
        }
      });
      
      // Always update timestamp
      safeUpdates.updatedAt = new Date();
      
      if (Object.keys(safeUpdates).length > 1) { // More than just updatedAt
        transaction.update(userDocRef, safeUpdates);
        console.log('✅ Safe profile update completed');
        return { ...existingData, ...safeUpdates };
      } else {
        console.log('ℹ️ No valid updates to apply');
        return existingData;
      }
    });
  } catch (error) {
    console.error('❌ Error safely updating user profile:', error);
    throw error;
  }
};

// Main auth success handler
export const handleAuthSuccess = async (clerkUser: any) => {
  try {
    const userData = await ensureUserExists(clerkUser);
    console.log('✅ Authentication success, user data:', userData);
    return userData;
  } catch (error) {
    console.error('❌ Auth handling failed:', error);
    throw error;
  }
};
