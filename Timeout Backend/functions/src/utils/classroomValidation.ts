import { APP_CONFIG } from '../config/constants';
import { Classroom, ClassSession, SessionParticipant, PublicClassroom } from '../types/classroom';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Classroom validation utilities
 */
export class ClassroomValidator {
  /**
   * Validates classroom name
   */
  static isValidName(name: string): boolean {
    if (!name || typeof name !== 'string') return false;
    const trimmed = name.trim();
    return trimmed.length > 0 && trimmed.length <= APP_CONFIG.CLASSROOM.MAX_NAME_LENGTH;
  }

  /**
   * Validates classroom subject
   */
  static isValidSubject(subject: string): boolean {
    if (!subject || typeof subject !== 'string') return false;
    const trimmed = subject.trim();
    return trimmed.length > 0 && trimmed.length <= APP_CONFIG.CLASSROOM.MAX_SUBJECT_LENGTH;
  }

  /**
   * Validates description length
   */
  static isValidDescription(description?: string): boolean {
    if (!description) return true; // Description is optional
    return description.length <= APP_CONFIG.CLASSROOM.MAX_DESCRIPTION_LENGTH;
  }

  /**
   * Validates max students count
   */
  static isValidMaxStudents(count: number): boolean {
    return Number.isInteger(count) && 
           count >= APP_CONFIG.CLASSROOM.MIN_STUDENTS && 
           count <= APP_CONFIG.CLASSROOM.MAX_STUDENTS;
  }

  /**
   * Checks if user can join classroom
   */
  static canUserJoinClassroom(classroom: Classroom, userId: string): boolean {
    // Can't join if already enrolled
    if (classroom.enrolledStudents.includes(userId)) return false;
    
    // Can't join if classroom is full
    if (classroom.currentStudents >= classroom.maxStudents) return false;
    
    // Can't join if classroom is not active
    if (classroom.status !== 'active') return false;
    
    // Can't join if not public (unless invited - future feature)
    if (!classroom.isPublic) return false;
    
    return true;
  }

  /**
   * Checks if user can manage classroom (is the teacher)
   */
  static canUserManageClassroom(classroom: Classroom, userId: string): boolean {
    return classroom.teacherId === userId;
  }

  /**
   * Validates complete classroom data for creation
   */
  static validateCreateClassroomData(data: {
    name: string;
    subject: string;
    description?: string;
    maxStudents?: number;
    isPublic?: boolean;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.isValidName(data.name)) {
      errors.push('Invalid classroom name');
    }

    if (!this.isValidSubject(data.subject)) {
      errors.push('Invalid subject');
    }

    if (!this.isValidDescription(data.description)) {
      errors.push('Description is too long');
    }

    const maxStudents = data.maxStudents ?? APP_CONFIG.CLASSROOM.DEFAULT_MAX_STUDENTS;
    if (!this.isValidMaxStudents(maxStudents)) {
      errors.push('Invalid maximum students count');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * Session validation utilities
 */
export class SessionValidator {
  /**
   * Checks if user can start a session for classroom
   */
  static canStartSession(classroom: Classroom, userId: string): boolean {
    // Only the teacher can start sessions
    if (classroom.teacherId !== userId) return false;
    
    // Classroom must be active
    if (classroom.status !== 'active') return false;
    
    return true;
  }

  /**
   * Checks if user can join a live session
   */
  static canJoinSession(session: ClassSession, classroom: Classroom, userId: string): boolean {
    // Session must be live
    if (session.status !== 'live') return false;
    
    // User must be enrolled in classroom or be the teacher
    if (userId !== classroom.teacherId && !classroom.enrolledStudents.includes(userId)) {
      return false;
    }
    
    // Session must not be full
    if (session.participants.length >= APP_CONFIG.CLASSROOM.MAX_PARTICIPANTS_PER_SESSION) {
      return false;
    }
    
    // User shouldn't already be in session
    if (session.participants.includes(userId)) return false;
    
    return true;
  }

  /**
   * Checks if session is currently active/live
   */
  static isSessionActive(session: ClassSession): boolean {
    return session.status === 'live';
  }

  /**
   * Calculates session duration in minutes
   */
  static getSessionDuration(session: ClassSession): number {
    if (!session.endTime) {
      // Session is still active, calculate duration from start to now
      const now = Timestamp.now();
      const durationMs = now.toMillis() - session.startTime.toMillis();
      return Math.floor(durationMs / (1000 * 60)); // Convert to minutes
    } else {
      // Session has ended, calculate total duration
      const durationMs = session.endTime.toMillis() - session.startTime.toMillis();
      return Math.floor(durationMs / (1000 * 60)); // Convert to minutes
    }
  }

  /**
   * Checks if session has exceeded maximum duration
   */
  static hasSessionExceededMaxDuration(session: ClassSession): boolean {
    const duration = this.getSessionDuration(session);
    return duration > APP_CONFIG.CLASSROOM.MAX_SESSION_DURATION;
  }

  /**
   * Validates session title
   */
  static isValidSessionTitle(title: string): boolean {
    if (!title || typeof title !== 'string') return false;
    const trimmed = title.trim();
    return trimmed.length > 0 && trimmed.length <= 200; // Reasonable limit for session titles
  }

  /**
   * Checks if user can manage participants in session
   */
  static canManageParticipants(session: ClassSession, userId: string): boolean {
    return session.teacherId === userId;
  }
}

/**
 * Participant validation utilities
 */
export class ParticipantValidator {
  /**
   * Checks if participant data is valid
   */
  static isValidParticipant(participant: SessionParticipant): boolean {
    return !!(
      participant.userId &&
      participant.displayName &&
      participant.role &&
      ['teacher', 'student'].includes(participant.role) &&
      participant.joinedAt &&
      typeof participant.videoEnabled === 'boolean' &&
      typeof participant.audioEnabled === 'boolean' &&
      typeof participant.isActive === 'boolean'
    );
  }

  /**
   * Checks if user can update participant settings
   */
  static canUpdateParticipantSettings(
    session: ClassSession, 
    targetUserId: string, 
    requestingUserId: string
  ): boolean {
    // Teacher can update any participant
    if (session.teacherId === requestingUserId) return true;
    
    // Users can update their own settings
    if (targetUserId === requestingUserId) return true;
    
    return false;
  }

  /**
   * Checks if user can remove participant from session
   */
  static canRemoveParticipant(
    session: ClassSession,
    targetUserId: string,
    requestingUserId: string
  ): boolean {
    // Only teacher can remove participants
    if (session.teacherId !== requestingUserId) return false;
    
    // Can't remove themselves
    if (targetUserId === requestingUserId) return false;
    
    return true;
  }
}

/**
 * General utility functions for classroom system
 */
export class ClassroomUtils {
  /**
   * Generates a safe classroom name from user input
   */
  static sanitizeClassroomName(name: string): string {
    return name.trim().slice(0, APP_CONFIG.CLASSROOM.MAX_NAME_LENGTH);
  }

  /**
   * Generates a safe subject from user input
   */
  static sanitizeSubject(subject: string): string {
    return subject.trim().slice(0, APP_CONFIG.CLASSROOM.MAX_SUBJECT_LENGTH);
  }

  /**
   * Generates a safe description from user input
   */
  static sanitizeDescription(description?: string): string | undefined {
    if (!description) return undefined;
    return description.trim().slice(0, APP_CONFIG.CLASSROOM.MAX_DESCRIPTION_LENGTH);
  }

  /**
   * Creates default session settings
   */
  static getDefaultSessionSettings() {
    return {
      allowStudentVideo: APP_CONFIG.SESSION.DEFAULT_SETTINGS.ALLOW_STUDENT_VIDEO,
      allowStudentAudio: APP_CONFIG.SESSION.DEFAULT_SETTINGS.ALLOW_STUDENT_AUDIO,
      allowStudentChat: APP_CONFIG.SESSION.DEFAULT_SETTINGS.ALLOW_STUDENT_CHAT,
      autoMuteOnJoin: APP_CONFIG.SESSION.DEFAULT_SETTINGS.AUTO_MUTE_ON_JOIN,
      maxParticipants: APP_CONFIG.CLASSROOM.MAX_PARTICIPANTS_PER_SESSION,
      requireApproval: APP_CONFIG.SESSION.DEFAULT_SETTINGS.REQUIRE_APPROVAL,
    };
  }

  /**
   * Creates participant object for new session joiner
   */
  static createSessionParticipant(
    userId: string,
    displayName: string,
    role: 'teacher' | 'student',
    avatarUrl?: string
  ): SessionParticipant {
    return {
      userId,
      displayName,
      avatarUrl,
      role,
      joinedAt: Timestamp.now(),
      videoEnabled: false, // Start with video off
      audioEnabled: !APP_CONFIG.SESSION.DEFAULT_SETTINGS.AUTO_MUTE_ON_JOIN, // Respect auto-mute setting
      isActive: true,
      connectionStatus: 'good' // Default to good connection
    };
  }

  /**
   * Formats classroom for public display (removes sensitive info)
   */
  static formatClassroomForPublic(classroom: Classroom): PublicClassroom {
    const { enrolledStudents, ...publicData } = classroom;
    return {
      ...publicData,
      enrolledStudentsCount: classroom.currentStudents
    };
  }

  /**
   * Checks if classroom name/subject combination is unique (for future use)
   */
  static generateClassroomCode(name: string, subject: string): string {
    const nameCode = name.slice(0, 3).toUpperCase();
    const subjectCode = subject.slice(0, 3).toUpperCase();
    const randomCode = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${nameCode}${subjectCode}${randomCode}`;
  }
}

/**
 * Error handling utilities
 */
export class ClassroomErrors {
  static readonly MESSAGES = APP_CONFIG.ERRORS;

  static createError(code: keyof typeof APP_CONFIG.ERRORS, details?: string) {
    const message = this.MESSAGES[code];
    return new Error(details ? `${message}: ${details}` : message);
  }

  static isClassroomError(error: Error): boolean {
    const classroomErrorMessages = [
      this.MESSAGES.CLASSROOM_NOT_FOUND,
      this.MESSAGES.CLASSROOM_FULL,
      this.MESSAGES.ALREADY_ENROLLED,
      this.MESSAGES.NOT_ENROLLED,
      this.MESSAGES.SESSION_NOT_FOUND,
      this.MESSAGES.SESSION_ENDED,
      this.MESSAGES.SESSION_FULL,
    ];
    
    return classroomErrorMessages.some(msg => error.message.includes(msg));
  }
}