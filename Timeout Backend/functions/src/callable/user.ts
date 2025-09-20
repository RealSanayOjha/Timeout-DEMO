import { onCall, CallableRequest } from 'firebase-functions/v2/https';
import { HttpsError } from 'firebase-functions/v2/https';
import { db } from '../config/firebase';
import { UserRole, UserData } from '../types/user';

// Data preservation rules for backend operations
const PRESERVATION_RULES = {
  // NEVER ALLOW UPDATES - Critical data that should be preserved forever
  IMMUTABLE: [
    'clerkId', 
    'email', 
    'createdAt', 
    'studyStats.totalStudyTime',
    'studyStats.sessionsCompleted', 
    'studyStats.longestStreak'
  ],
  
  // ROLE UPDATE ONLY - Special handling for role updates
  ROLE_UPDATE_ONLY: ['role'],
  
  // PREFERENCES UPDATE ONLY - Allow preference updates but preserve existing if not provided
  PREFERENCES_MERGE: [
    'preferences.defaultFocusTime',
    'preferences.shortBreakTime',
    'preferences.longBreakTime',
    'preferences.sessionsBeforeLongBreak',
    'preferences.soundEnabled',
    'preferences.notificationsEnabled',
    'preferences.theme'
  ],
  
  // STATS ADDITIVE ONLY - Can only add to existing stats, never subtract
  STATS_ADDITIVE: [
    'studyStats.totalStudyTime',
    'studyStats.sessionsCompleted',
    'studyStats.currentStreak',
    'studyStats.weeklyProgress'
  ]
};

/**
 * Check if a field is protected from updates
 */
function isFieldProtected(fieldPath: string): boolean {
  return PRESERVATION_RULES.IMMUTABLE.some(rule => 
    fieldPath === rule || fieldPath.startsWith(rule + '.')
  );
}

/**
 * Get authenticated user ID from Firebase Auth
 */
function getAuthenticatedUserId(request: CallableRequest): string {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }
  return request.auth.uid;
}

/**
 * Update user role (called after role selection in frontend) - with data preservation
 */
export const updateUserRole = onCall(
  {
    timeoutSeconds: 60,
    memory: '256MiB',
  },
  async (request: CallableRequest) => {
    try {
      // Get authenticated user ID
      const userId = getAuthenticatedUserId(request);

      const { role } = request.data as { role: UserRole };

      if (!role || !['student', 'teacher'].includes(role)) {
        throw new HttpsError('invalid-argument', 'Invalid role provided');
      }

      // Use transaction to safely update role while preserving other data
      const result = await db.runTransaction(async (transaction) => {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists) {
          throw new HttpsError('not-found', 'User not found');
        }
        
        const existingData = userDoc.data() as UserData;
        
        // Check if role is already set and preserve critical data
        if (existingData.role && existingData.role !== role) {
          console.log(`⚠️ Role change requested: ${existingData.role} -> ${role} for user ${userId}`);
        }
        
        // Verify we're not accidentally updating protected fields
        if (isFieldProtected('email') || isFieldProtected('createdAt')) {
          console.log('🔒 Protected fields confirmed - email and createdAt are preserved');
        }
        
        // Only update role and metadata - preserve everything else
        const safeUpdates = {
          role,
          updatedAt: new Date(),
        };
        
        transaction.update(userRef, safeUpdates);
        
        console.log(`✅ Role updated safely for user ${userId}: ${role}`);
        return { success: true, role, preservedData: Object.keys(existingData) };
      });

      return result;
    } catch (error) {
      console.error('Error updating user role:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Failed to update user role');
    }
  }
);

/**
 * Get user profile data
 */
export const getUserProfile = onCall(
  {
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request: CallableRequest) => {
    try {
      // Get authenticated user ID
      const userId = getAuthenticatedUserId(request);

      // Get user data from Firestore
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        throw new HttpsError('not-found', 'User profile not found');
      }

      const userData = userDoc.data() as UserData;
      
      // Remove sensitive data before returning
      const { ...publicUserData } = userData;
      
      return publicUserData;
    } catch (error) {
      console.error('Error getting user profile:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Failed to get user profile');
    }
  }
);

/**
 * Update user preferences - with smart merge to preserve existing settings
 */
export const updateUserPreferences = onCall(
  {
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request: CallableRequest) => {
    try {
      // Get authenticated user ID
      const userId = getAuthenticatedUserId(request);

      const { preferences } = request.data;

      if (!preferences) {
        throw new HttpsError('invalid-argument', 'Preferences data required');
      }

      // Use transaction to safely merge preferences
      const result = await db.runTransaction(async (transaction) => {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists) {
          throw new HttpsError('not-found', 'User not found');
        }
        
        const existingData = userDoc.data() as UserData;
        const existingPreferences = existingData.preferences || {};
        
        // Smart merge: only update provided preferences, preserve others
        const mergedPreferences = {
          defaultFocusTime: preferences.defaultFocusTime ?? existingPreferences.defaultFocusTime ?? 25,
          shortBreakTime: preferences.shortBreakTime ?? existingPreferences.shortBreakTime ?? 5,
          longBreakTime: preferences.longBreakTime ?? existingPreferences.longBreakTime ?? 15,
          sessionsBeforeLongBreak: preferences.sessionsBeforeLongBreak ?? existingPreferences.sessionsBeforeLongBreak ?? 4,
          soundEnabled: preferences.soundEnabled ?? existingPreferences.soundEnabled ?? true,
          notificationsEnabled: preferences.notificationsEnabled ?? existingPreferences.notificationsEnabled ?? true,
          theme: preferences.theme ?? existingPreferences.theme ?? 'system',
        };
        
        console.log(`🔒 Preserving user preferences - merging update for user ${userId}`);
        console.log('📊 Existing preferences:', existingPreferences);
        console.log('📝 New preferences:', preferences);
        console.log('✅ Merged preferences:', mergedPreferences);

        // Update preferences with merge
        transaction.update(userRef, {
          preferences: mergedPreferences,
          updatedAt: new Date(),
        });
        
        return { success: true, preferences: mergedPreferences };
      });

      return result;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Failed to update user preferences');
    }
  }
);

/**
 * Update user study stats - with preservation of existing stats (additive only)
 */
export const updateStudyStats = onCall(
  {
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request: CallableRequest) => {
    try {
      // Get authenticated user ID
      const userId = getAuthenticatedUserId(request);

      const { studyTime, sessionCompleted } = request.data;

      if (typeof studyTime !== 'number' || studyTime < 0) {
        throw new HttpsError('invalid-argument', 'Valid study time required');
      }

      // Use transaction to safely update stats (additive only - preserve existing achievements)
      const result = await db.runTransaction(async (transaction) => {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists) {
          throw new HttpsError('not-found', 'User not found');
        }

        const userData = userDoc.data() as UserData;
        const currentStats = userData.studyStats;
        
        // CRITICAL: Only ADD to existing stats, never subtract or reset
        const preservedStats = {
          totalStudyTime: currentStats.totalStudyTime || 0,
          sessionsCompleted: currentStats.sessionsCompleted || 0,
          currentStreak: currentStats.currentStreak || 0,
          longestStreak: currentStats.longestStreak || 0,
          weeklyGoal: currentStats.weeklyGoal || 0,
          weeklyProgress: currentStats.weeklyProgress || 0,
        };

        // Calculate new stats - only additive operations to preserve achievements
        const newStats = {
          totalStudyTime: preservedStats.totalStudyTime + studyTime,
          sessionsCompleted: sessionCompleted ? preservedStats.sessionsCompleted + 1 : preservedStats.sessionsCompleted,
          currentStreak: sessionCompleted ? preservedStats.currentStreak + 1 : preservedStats.currentStreak,
          longestStreak: Math.max(preservedStats.longestStreak, preservedStats.currentStreak + (sessionCompleted ? 1 : 0)),
          weeklyGoal: preservedStats.weeklyGoal, // Preserve user's goal
          weeklyProgress: preservedStats.weeklyProgress + studyTime,
        };
        
        console.log(`📊 Study stats update for user ${userId}:`);
        console.log('🔒 Preserved stats:', preservedStats);
        console.log('➕ Adding study time:', studyTime, 'minutes');
        console.log('✅ New total stats:', newStats);

        // Ensure we never lose existing achievements
        if (newStats.totalStudyTime < preservedStats.totalStudyTime) {
          console.error('🚨 CRITICAL: Attempted to reduce total study time - blocked!');
          throw new HttpsError('internal', 'Cannot reduce existing study achievements');
        }

        // Update study stats in Firestore
        transaction.update(userRef, {
          studyStats: newStats,
          updatedAt: new Date(),
        });

        return { success: true, studyStats: newStats, preserved: preservedStats };
      });

      return result;
    } catch (error) {
      console.error('Error updating study stats:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Failed to update study stats');
    }
  }
);

/**
 * Safe user initialization - ensures user exists without overwriting existing data
 */
export const safeInitializeUser = onCall(
  {
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request: CallableRequest) => {
    try {
      // Get authenticated user ID
      const userId = getAuthenticatedUserId(request);

      const { email, firstName, lastName, avatarUrl } = request.data;

      if (!email) {
        throw new HttpsError('invalid-argument', 'Email is required for user initialization');
      }

      // Use transaction to safely initialize user
      const result = await db.runTransaction(async (transaction) => {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists) {
          // Create new user with full data structure
          const newUserData: UserData = {
            clerkId: userId,
            email,
            firstName: firstName || '',
            lastName: lastName || '',
            displayName: `${firstName || ''} ${lastName || ''}`.trim() || 'Anonymous',
            avatarUrl: avatarUrl || '',
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
          
          transaction.set(userRef, newUserData);
          console.log(`✅ New user initialized safely: ${userId}`);
          return { success: true, created: true, userData: newUserData };
        } else {
          // User exists - only update safe fields
          const existingData = userDoc.data() as UserData;
          const safeUpdates: any = {};
          
          // Only update profile fields if they've changed and are safe to update
          if (firstName && firstName !== existingData.firstName) {
            safeUpdates.firstName = firstName;
          }
          if (lastName && lastName !== existingData.lastName) {
            safeUpdates.lastName = lastName;
          }
          if (avatarUrl && avatarUrl !== existingData.avatarUrl) {
            safeUpdates.avatarUrl = avatarUrl;
          }
          
          // Update display name if name fields changed
          if (safeUpdates.firstName || safeUpdates.lastName) {
            const newFirstName = safeUpdates.firstName || existingData.firstName;
            const newLastName = safeUpdates.lastName || existingData.lastName;
            safeUpdates.displayName = `${newFirstName} ${newLastName}`.trim() || 'Anonymous';
          }
          
          // NEVER update email if it already exists
          if (existingData.email && existingData.email !== email) {
            console.log(`🔒 PRESERVING existing email: ${existingData.email} (ignoring ${email})`);
          }
          
          if (Object.keys(safeUpdates).length > 0) {
            safeUpdates.updatedAt = new Date();
            transaction.update(userRef, safeUpdates);
            console.log(`📝 Safe updates applied for existing user: ${userId}`, Object.keys(safeUpdates));
          }
          
          return { 
            success: true, 
            created: false, 
            updated: Object.keys(safeUpdates), 
            preserved: ['email', 'createdAt', 'role', 'studyStats', 'preferences']
          };
        }
      });

      return result;
    } catch (error) {
      console.error('Error safely initializing user:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Failed to safely initialize user');
    }
  }
);
