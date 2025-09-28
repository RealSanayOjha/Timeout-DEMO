import { onCall, CallableRequest } from 'firebase-functions/v2/https';
import { HttpsError } from 'firebase-functions/v2/https';
import { db } from '../config/firebase';
import { APP_CONFIG } from '../config/constants';
import { 
  Classroom, 
  ClassSession,
  CreateClassroomRequest,
  CreateClassroomResponse,
  JoinClassroomRequest,
  JoinClassroomResponse,
  LeaveClassroomRequest,
  LeaveClassroomResponse,
  GetMyClassroomsResponse,
  GetAvailableClassroomsRequest,
  GetAvailableClassroomsResponse,
  StartSessionRequest,
  StartSessionResponse,
  EndSessionRequest,
  EndSessionResponse,
  JoinLiveSessionRequest,
  JoinLiveSessionResponse,
  LeaveLiveSessionRequest,
  LeaveLiveSessionResponse,
  UpdateSessionParticipantRequest,
  UpdateSessionParticipantResponse
} from '../types/classroom';
import { 
  ClassroomValidator, 
  SessionValidator, 
  ClassroomUtils 
} from '../utils/classroomValidation';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

/**
 * Get authenticated user ID from Firebase Auth
 * In emulator mode, allows bypassing auth for testing
 */
function getAuthenticatedUserId(request: CallableRequest): string {
  if (process.env.FUNCTIONS_EMULATOR === 'true') {
    // In emulator mode, allow test user ID
    return request.data.userId || 'demo-user';
  }
  
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  return request.auth.uid;
}

/**
 * Create a new classroom
 */
export const createClassroom = onCall(
  {
    timeoutSeconds: 60,
    memory: '256MiB',
  },
  async (request: CallableRequest): Promise<CreateClassroomResponse> => {
    try {
      const userId = getAuthenticatedUserId(request);
      
      const { 
        name, 
        subject,
        description,
        maxStudents = APP_CONFIG.CLASSROOM.DEFAULT_MAX_STUDENTS,
        isPublic = true
      } = request.data as CreateClassroomRequest;

      // Validate input data
      const validation = ClassroomValidator.validateCreateClassroomData({
        name,
        subject,
        description,
        maxStudents,
        isPublic
      });

      if (!validation.valid) {
        throw new HttpsError('invalid-argument', validation.errors.join(', '));
      }

      // Get user data to include teacher info
      const userDoc = await db.collection(APP_CONFIG.COLLECTIONS.USERS).doc(userId).get();
      if (!userDoc.exists) {
        throw new HttpsError('not-found', 'User profile not found');
      }
      
      const userData = userDoc.data();
      
      // Verify user is a teacher
      if (userData?.role !== 'teacher') {
        throw new HttpsError('permission-denied', 'Only teachers can create classrooms');
      }

      // Create classroom document
      const classroomRef = db.collection(APP_CONFIG.COLLECTIONS.CLASSROOMS).doc();
      const classroomId = classroomRef.id;
      
      const now = Timestamp.now();
      
      const classroomData: Classroom = {
        name: ClassroomUtils.sanitizeClassroomName(name),
        subject: ClassroomUtils.sanitizeSubject(subject),
        teacherId: userId,
        teacherName: userData.displayName || userData.firstName + ' ' + userData.lastName,
        teacherAvatar: userData.avatarUrl,
        description: ClassroomUtils.sanitizeDescription(description),
        maxStudents,
        currentStudents: 0,
        enrolledStudents: [],
        status: 'active',
        isPublic,
        createdAt: now,
        updatedAt: now
      };

      await classroomRef.set(classroomData);

      console.log(`✅ Classroom created: ${classroomId} by ${userData.displayName}`);

      return { 
        success: true, 
        classroomId,
        classroom: classroomData
      };
    } catch (error) {
      console.error('❌ Error creating classroom:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Failed to create classroom');
    }
  }
);

/**
 * Join a classroom (for students)
 */
export const joinClassroom = onCall(
  {
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request: CallableRequest): Promise<JoinClassroomResponse> => {
    try {
      const userId = getAuthenticatedUserId(request);
      
      const { classroomId } = request.data as JoinClassroomRequest;

      if (!classroomId) {
        throw new HttpsError('invalid-argument', 'Classroom ID is required');
      }

      // Get user data
      const userDoc = await db.collection(APP_CONFIG.COLLECTIONS.USERS).doc(userId).get();
      if (!userDoc.exists) {
        throw new HttpsError('not-found', 'User profile not found');
      }
      const userData = userDoc.data();

      // Use transaction to ensure consistency
      const result = await db.runTransaction(async (transaction) => {
        const classroomRef = db.collection(APP_CONFIG.COLLECTIONS.CLASSROOMS).doc(classroomId);
        const classroomDoc = await transaction.get(classroomRef);
        
        if (!classroomDoc.exists) {
          throw new HttpsError('not-found', APP_CONFIG.ERRORS.CLASSROOM_NOT_FOUND);
        }

        const classroomData = classroomDoc.data() as Classroom;

        // Validate user can join
        if (!ClassroomValidator.canUserJoinClassroom(classroomData, userId)) {
          if (classroomData.enrolledStudents.includes(userId)) {
            throw new HttpsError('failed-precondition', APP_CONFIG.ERRORS.ALREADY_ENROLLED);
          }
          if (classroomData.currentStudents >= classroomData.maxStudents) {
            throw new HttpsError('failed-precondition', APP_CONFIG.ERRORS.CLASSROOM_FULL);
          }
          throw new HttpsError('failed-precondition', 'Cannot join this classroom');
        }

        // Update classroom with new student
        const updatedData = {
          enrolledStudents: FieldValue.arrayUnion(userId),
          currentStudents: classroomData.currentStudents + 1,
          updatedAt: Timestamp.now()
        };

        transaction.update(classroomRef, updatedData);

        return {
          ...classroomData,
          enrolledStudents: [...classroomData.enrolledStudents, userId],
          currentStudents: classroomData.currentStudents + 1
        };
      });

      console.log(`✅ User ${userData?.displayName} joined classroom: ${classroomId}`);

      return { 
        success: true, 
        message: 'Successfully joined classroom',
        classroom: result
      };
    } catch (error) {
      console.error('❌ Error joining classroom:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Failed to join classroom');
    }
  }
);

/**
 * Leave a classroom (for students)
 */
export const leaveClassroom = onCall(
  {
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request: CallableRequest): Promise<LeaveClassroomResponse> => {
    try {
      const userId = getAuthenticatedUserId(request);
      
      const { classroomId } = request.data as LeaveClassroomRequest;

      if (!classroomId) {
        throw new HttpsError('invalid-argument', 'Classroom ID is required');
      }

      // Use transaction to ensure consistency
      await db.runTransaction(async (transaction) => {
        const classroomRef = db.collection(APP_CONFIG.COLLECTIONS.CLASSROOMS).doc(classroomId);
        const classroomDoc = await transaction.get(classroomRef);
        
        if (!classroomDoc.exists) {
          throw new HttpsError('not-found', APP_CONFIG.ERRORS.CLASSROOM_NOT_FOUND);
        }

        const classroomData = classroomDoc.data() as Classroom;

        // Check if user is enrolled
        if (!classroomData.enrolledStudents.includes(userId)) {
          throw new HttpsError('failed-precondition', APP_CONFIG.ERRORS.NOT_ENROLLED);
        }

        // Can't leave if you're the teacher
        if (classroomData.teacherId === userId) {
          throw new HttpsError('failed-precondition', 'Teachers cannot leave their own classroom');
        }

        // Update classroom - remove student
        const updatedData = {
          enrolledStudents: FieldValue.arrayRemove(userId),
          currentStudents: Math.max(0, classroomData.currentStudents - 1),
          updatedAt: Timestamp.now()
        };

        transaction.update(classroomRef, updatedData);
      });

      console.log(`✅ User ${userId} left classroom: ${classroomId}`);

      return { 
        success: true, 
        message: 'Successfully left classroom'
      };
    } catch (error) {
      console.error('❌ Error leaving classroom:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Failed to leave classroom');
    }
  }
);

/**
 * Get user's classrooms (both teaching and enrolled)
 */
export const getMyClassrooms = onCall(
  {
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request: CallableRequest): Promise<GetMyClassroomsResponse> => {
    try {
      const userId = getAuthenticatedUserId(request);

      // Get user data to determine role
      const userDoc = await db.collection(APP_CONFIG.COLLECTIONS.USERS).doc(userId).get();
      if (!userDoc.exists) {
        throw new HttpsError('not-found', 'User profile not found');
      }
      const userData = userDoc.data();

      let teachingClassrooms: Classroom[] = [];
      let enrolledClassrooms: Classroom[] = [];

      // If teacher, get classrooms they created
      if (userData?.role === 'teacher') {
        const teachingQuery = await db
          .collection(APP_CONFIG.COLLECTIONS.CLASSROOMS)
          .where('teacherId', '==', userId)
          .where('status', '==', 'active')
          .orderBy('createdAt', 'desc')
          .get();

        teachingClassrooms = teachingQuery.docs.map(doc => doc.data() as Classroom);
      }

      // Get classrooms user is enrolled in (for students or teachers who might also be students)
      const enrolledQuery = await db
        .collection(APP_CONFIG.COLLECTIONS.CLASSROOMS)
        .where('enrolledStudents', 'array-contains', userId)
        .where('status', '==', 'active')
        .orderBy('createdAt', 'desc')
        .get();

      enrolledClassrooms = enrolledQuery.docs.map(doc => doc.data() as Classroom);

      // Combine all classrooms for the response
      const allClassrooms = [...teachingClassrooms, ...enrolledClassrooms];

      console.log(`✅ Retrieved ${allClassrooms.length} classrooms for user ${userId}`);

      return { 
        success: true, 
        classrooms: allClassrooms,
        teachingClassrooms: userData?.role === 'teacher' ? teachingClassrooms : undefined,
        enrolledClassrooms
      };
    } catch (error) {
      console.error('❌ Error getting user classrooms:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Failed to get classrooms');
    }
  }
);

/**
 * Get available public classrooms for students to browse
 */
export const getAvailableClassrooms = onCall(
  {
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request: CallableRequest): Promise<GetAvailableClassroomsResponse> => {
    try {
      getAuthenticatedUserId(request); // Ensure user is authenticated
      
      const { 
        subject,
        limit = 20,
        offset = 0 
      } = request.data as GetAvailableClassroomsRequest;

      // Build query for public, active classrooms
      let query = db
        .collection(APP_CONFIG.COLLECTIONS.CLASSROOMS)
        .where('isPublic', '==', true)
        .where('status', '==', 'active');

      // Add subject filter if provided
      if (subject) {
        query = query.where('subject', '==', subject);
      }

      // Add pagination
      query = query
        .orderBy('createdAt', 'desc')
        .limit(limit);

      if (offset > 0) {
        // For proper pagination, we'd need to use startAfter with a document snapshot
        // For now, using offset (less efficient but simpler)
        query = query.offset(offset);
      }

      const querySnapshot = await query.get();
      const classrooms = querySnapshot.docs.map(doc => {
        const classroomData = doc.data() as Classroom;
        // Return public-safe version (no enrolled student IDs)
        return ClassroomUtils.formatClassroomForPublic(classroomData);
      });

      // Get total count for pagination (separate query)
      let countQuery = db
        .collection(APP_CONFIG.COLLECTIONS.CLASSROOMS)
        .where('isPublic', '==', true)
        .where('status', '==', 'active');

      if (subject) {
        countQuery = countQuery.where('subject', '==', subject);
      }

      const countSnapshot = await countQuery.count().get();
      const total = countSnapshot.data().count;

      console.log(`✅ Retrieved ${classrooms.length} available classrooms (${total} total)`);

      return { 
        success: true, 
        classrooms,
        total
      };
    } catch (error) {
      console.error('❌ Error getting available classrooms:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Failed to get available classrooms');
    }
  }
);

/**
 * Start a live class session (for teachers)
 */
export const startClassSession = onCall(
  {
    timeoutSeconds: 60,
    memory: '256MiB',
  },
  async (request: CallableRequest): Promise<StartSessionResponse> => {
    try {
      const userId = getAuthenticatedUserId(request);
      
      const { 
        classroomId,
        title,
        settings = ClassroomUtils.getDefaultSessionSettings()
      } = request.data as StartSessionRequest;

      if (!classroomId) {
        throw new HttpsError('invalid-argument', 'Classroom ID is required');
      }

      // Get classroom data
      const classroomDoc = await db.collection(APP_CONFIG.COLLECTIONS.CLASSROOMS).doc(classroomId).get();
      if (!classroomDoc.exists) {
        throw new HttpsError('not-found', APP_CONFIG.ERRORS.CLASSROOM_NOT_FOUND);
      }

      const classroomData = classroomDoc.data() as Classroom;

      // Verify user can start session
      if (!SessionValidator.canStartSession(classroomData, userId)) {
        throw new HttpsError('permission-denied', 'Only the classroom teacher can start sessions');
      }

      // Get user data for teacher info
      const userDoc = await db.collection(APP_CONFIG.COLLECTIONS.USERS).doc(userId).get();
      const userData = userDoc.data();

      // Create session document
      const sessionRef = db.collection(APP_CONFIG.COLLECTIONS.LIVE_SESSIONS).doc();
      const sessionId = sessionRef.id;
      
      const now = Timestamp.now();
      
      // Create teacher participant
      const teacherParticipant = ClassroomUtils.createSessionParticipant(
        userId,
        userData?.displayName || `${userData?.firstName} ${userData?.lastName}`,
        'teacher',
        userData?.avatarUrl
      );

      const sessionData: ClassSession = {
        classroomId,
        teacherId: userId,
        teacherName: teacherParticipant.displayName,
        title: title || 'Live Class Session',
        startTime: now,
        status: 'live',
        participants: [userId],
        participantDetails: {
          [userId]: teacherParticipant
        },
        videoEnabled: true,
        chatEnabled: true,
        settings: {
          ...ClassroomUtils.getDefaultSessionSettings(),
          ...settings
        },
        createdAt: now,
        updatedAt: now
      };

      await sessionRef.set(sessionData);

      console.log(`✅ Live session started: ${sessionId} for classroom ${classroomId}`);

      return { 
        success: true, 
        sessionId,
        session: sessionData
      };
    } catch (error) {
      console.error('❌ Error starting class session:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Failed to start class session');
    }
  }
);

/**
 * End a live class session (for teachers)
 */
export const endClassSession = onCall(
  {
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request: CallableRequest): Promise<EndSessionResponse> => {
    try {
      const userId = getAuthenticatedUserId(request);
      
      const { sessionId } = request.data as EndSessionRequest;

      if (!sessionId) {
        throw new HttpsError('invalid-argument', 'Session ID is required');
      }

      // Use transaction to update session
      const sessionDuration = await db.runTransaction(async (transaction) => {
        const sessionRef = db.collection(APP_CONFIG.COLLECTIONS.LIVE_SESSIONS).doc(sessionId);
        const sessionDoc = await transaction.get(sessionRef);
        
        if (!sessionDoc.exists) {
          throw new HttpsError('not-found', APP_CONFIG.ERRORS.SESSION_NOT_FOUND);
        }

        const sessionData = sessionDoc.data() as ClassSession;

        // Verify user can end session
        if (sessionData.teacherId !== userId) {
          throw new HttpsError('permission-denied', 'Only the session teacher can end it');
        }

        if (sessionData.status !== 'live') {
          throw new HttpsError('failed-precondition', 'Session is not currently live');
        }

        const now = Timestamp.now();
        const duration = SessionValidator.getSessionDuration({
          ...sessionData,
          endTime: now
        });

        // Update session to ended
        const updatedData = {
          status: 'ended',
          endTime: now,
          updatedAt: now
        };

        transaction.update(sessionRef, updatedData);

        return duration;
      });

      console.log(`✅ Live session ended: ${sessionId} (${sessionDuration} minutes)`);

      return { 
        success: true, 
        message: 'Session ended successfully',
        sessionDuration
      };
    } catch (error) {
      console.error('❌ Error ending class session:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Failed to end class session');
    }
  }
);

/**
 * Join a live class session (for students and teachers)
 */
export const joinLiveSession = onCall(
  {
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request: CallableRequest): Promise<JoinLiveSessionResponse> => {
    try {
      const userId = getAuthenticatedUserId(request);
      
      const { sessionId } = request.data as JoinLiveSessionRequest;

      if (!sessionId) {
        throw new HttpsError('invalid-argument', 'Session ID is required');
      }

      // Get user data
      const userDoc = await db.collection(APP_CONFIG.COLLECTIONS.USERS).doc(userId).get();
      if (!userDoc.exists) {
        throw new HttpsError('not-found', 'User profile not found');
      }
      const userData = userDoc.data();
      if (!userData) {
        throw new HttpsError('not-found', 'User data not found');
      }

      // Use transaction to join session
      const result = await db.runTransaction(async (transaction) => {
        const sessionRef = db.collection(APP_CONFIG.COLLECTIONS.LIVE_SESSIONS).doc(sessionId);
        const sessionDoc = await transaction.get(sessionRef);
        
        if (!sessionDoc.exists) {
          throw new HttpsError('not-found', APP_CONFIG.ERRORS.SESSION_NOT_FOUND);
        }

        const sessionData = sessionDoc.data() as ClassSession;

        // Get classroom to validate enrollment
        const classroomRef = db.collection(APP_CONFIG.COLLECTIONS.CLASSROOMS).doc(sessionData.classroomId);
        const classroomDoc = await transaction.get(classroomRef);
        
        if (!classroomDoc.exists) {
          throw new HttpsError('not-found', APP_CONFIG.ERRORS.CLASSROOM_NOT_FOUND);
        }

        const classroomData = classroomDoc.data() as Classroom;

        // Validate user can join session
        if (!SessionValidator.canJoinSession(sessionData, classroomData, userId)) {
          throw new HttpsError('permission-denied', 'Cannot join this session');
        }

        // Create participant object
        const participant = ClassroomUtils.createSessionParticipant(
          userId,
          userData.displayName || `${userData.firstName} ${userData.lastName}`,
          userData.role === 'teacher' ? 'teacher' : 'student',
          userData.avatarUrl
        );

        // Update session with new participant
        const updatedData = {
          participants: FieldValue.arrayUnion(userId),
          [`participantDetails.${userId}`]: participant,
          updatedAt: Timestamp.now()
        };

        transaction.update(sessionRef, updatedData);

        return {
          ...sessionData,
          participants: [...sessionData.participants, userId],
          participantDetails: {
            ...sessionData.participantDetails,
            [userId]: participant
          }
        };
      });

      console.log(`✅ User ${userData.displayName} joined session: ${sessionId}`);

      return { 
        success: true, 
        session: result,
        participantId: userId
      };
    } catch (error) {
      console.error('❌ Error joining live session:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Failed to join live session');
    }
  }
);

/**
 * Leave a live class session
 */
export const leaveLiveSession = onCall(
  {
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request: CallableRequest): Promise<LeaveLiveSessionResponse> => {
    try {
      const userId = getAuthenticatedUserId(request);
      
      const { sessionId } = request.data as LeaveLiveSessionRequest;

      if (!sessionId) {
        throw new HttpsError('invalid-argument', 'Session ID is required');
      }

      // Use transaction to leave session
      await db.runTransaction(async (transaction) => {
        const sessionRef = db.collection(APP_CONFIG.COLLECTIONS.LIVE_SESSIONS).doc(sessionId);
        const sessionDoc = await transaction.get(sessionRef);
        
        if (!sessionDoc.exists) {
          throw new HttpsError('not-found', APP_CONFIG.ERRORS.SESSION_NOT_FOUND);
        }

        const sessionData = sessionDoc.data() as ClassSession;

        // Check if user is in session
        if (!sessionData.participants.includes(userId)) {
          throw new HttpsError('failed-precondition', 'User is not in this session');
        }

        // Update participant details to mark as left
        const now = Timestamp.now();
        const updatedData = {
          participants: FieldValue.arrayRemove(userId),
          [`participantDetails.${userId}.leftAt`]: now,
          [`participantDetails.${userId}.isActive`]: false,
          updatedAt: now
        };

        transaction.update(sessionRef, updatedData);
      });

      console.log(`✅ User ${userId} left session: ${sessionId}`);

      return { 
        success: true, 
        message: 'Successfully left session'
      };
    } catch (error) {
      console.error('❌ Error leaving live session:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Failed to leave live session');
    }
  }
);

/**
 * Update participant settings in live session
 */
export const updateSessionParticipant = onCall(
  {
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request: CallableRequest): Promise<UpdateSessionParticipantResponse> => {
    try {
      const userId = getAuthenticatedUserId(request);
      
      const { 
        sessionId,
        updates 
      } = request.data as UpdateSessionParticipantRequest;

      if (!sessionId || !updates) {
        throw new HttpsError('invalid-argument', 'Session ID and updates are required');
      }

      // Use transaction to update participant
      const result = await db.runTransaction(async (transaction) => {
        const sessionRef = db.collection(APP_CONFIG.COLLECTIONS.LIVE_SESSIONS).doc(sessionId);
        const sessionDoc = await transaction.get(sessionRef);
        
        if (!sessionDoc.exists) {
          throw new HttpsError('not-found', APP_CONFIG.ERRORS.SESSION_NOT_FOUND);
        }

        const sessionData = sessionDoc.data() as ClassSession;

        // Check if user is in session
        if (!sessionData.participants.includes(userId)) {
          throw new HttpsError('failed-precondition', 'User is not in this session');
        }

        const currentParticipant = sessionData.participantDetails[userId];
        if (!currentParticipant) {
          throw new HttpsError('not-found', 'Participant details not found');
        }

        // Create updated participant data
        const updatedParticipant = {
          ...currentParticipant,
          ...updates,
          updatedAt: Timestamp.now()
        };

        // Update in database
        const updateData = {
          [`participantDetails.${userId}`]: updatedParticipant,
          updatedAt: Timestamp.now()
        };

        transaction.update(sessionRef, updateData);

        return updatedParticipant;
      });

      console.log(`✅ Updated participant ${userId} in session: ${sessionId}`);

      return { 
        success: true, 
        participant: result
      };
    } catch (error) {
      console.error('❌ Error updating session participant:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Failed to update session participant');
    }
  }
);