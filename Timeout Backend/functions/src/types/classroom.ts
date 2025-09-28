import { Timestamp } from "firebase-admin/firestore";
import { BaseDocument } from "./index";

/**
 * Core Classroom interface
 */
export interface Classroom extends BaseDocument {
  name: string;                    // "Physics 101"
  subject: string;                 // "Physics"
  teacherId: string;               // Teacher's Clerk ID
  teacherName: string;             // "Dr. Smith"
  teacherAvatar?: string;          // Teacher profile image URL
  description?: string;            // Optional class description
  maxStudents: number;             // Maximum enrollment (e.g., 30)
  currentStudents: number;         // Current enrollment count
  enrolledStudents: string[];      // Array of student Clerk IDs
  status: ClassroomStatus;         // Current classroom status
  isPublic: boolean;               // Whether students can discover and join
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Live class session interface
 */
export interface ClassSession extends BaseDocument {
  classroomId: string;             // Reference to parent classroom
  teacherId: string;               // Session host (teacher)
  teacherName: string;             // Teacher display name
  title: string;                   // "Today's Physics Lesson"
  startTime: Timestamp;            // When session started
  endTime?: Timestamp;             // When session ended (optional)
  status: SessionStatus;           // Current session status
  participants: string[];          // Array of participant user IDs
  participantDetails: Record<string, SessionParticipant>; // Detailed participant info
  videoEnabled: boolean;           // Whether video is active for session
  chatEnabled: boolean;            // Whether chat is enabled
  settings: SessionSettings;       // Session configuration
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Individual participant in a live session
 */
export interface SessionParticipant {
  userId: string;                  // Participant's Clerk ID
  displayName: string;             // Display name in session
  avatarUrl?: string;              // Profile image
  role: ClassroomParticipantRole;           // Teacher or student
  joinedAt: Timestamp;             // When they joined session
  leftAt?: Timestamp;              // When they left (if applicable)
  videoEnabled: boolean;           // Current video state
  audioEnabled: boolean;           // Current audio state
  isActive: boolean;               // Currently in session
  connectionStatus: ConnectionStatus; // Connection quality
}

/**
 * Session configuration settings
 */
export interface SessionSettings {
  allowStudentVideo: boolean;      // Students can turn on camera
  allowStudentAudio: boolean;      // Students can unmute
  allowStudentChat: boolean;       // Students can send messages
  autoMuteOnJoin: boolean;         // Mute students when they join
  maxParticipants: number;         // Limit concurrent participants
  requireApproval: boolean;        // Teacher must approve student joins
}

// Type unions for better type safety
export type ClassroomStatus = "active" | "inactive" | "archived";
export type SessionStatus = "scheduled" | "live" | "ended" | "cancelled";
export type ClassroomParticipantRole = "teacher" | "student";
export type ConnectionStatus = "excellent" | "good" | "poor" | "disconnected";

/**
 * Request/Response Types for API calls
 */

// Classroom Management
export interface CreateClassroomRequest {
  name: string;
  subject: string;
  description?: string;
  maxStudents?: number;           // Default: 30
  isPublic?: boolean;            // Default: true
}

export interface CreateClassroomResponse {
  success: boolean;
  classroomId: string;
  classroom: Classroom;
}

export interface JoinClassroomRequest {
  classroomId: string;
}

export interface JoinClassroomResponse {
  success: boolean;
  message: string;
  classroom: Classroom;
}

export interface LeaveClassroomRequest {
  classroomId: string;
}

export interface LeaveClassroomResponse {
  success: boolean;
  message: string;
}

export interface GetMyClassroomsResponse {
  success: boolean;
  classrooms: Classroom[];
  teachingClassrooms?: Classroom[]; // If user is teacher
  enrolledClassrooms?: Classroom[];  // If user is student
}

export interface GetAvailableClassroomsRequest {
  subject?: string;               // Filter by subject
  limit?: number;                 // Pagination limit
  offset?: number;                // Pagination offset
}

/**
 * Public classroom info (without sensitive data)
 */
export interface PublicClassroom extends Omit<Classroom, 'enrolledStudents'> {
  enrolledStudentsCount: number;  // Count instead of actual student IDs
}

export interface GetAvailableClassroomsResponse {
  success: boolean;
  classrooms: PublicClassroom[];
  total: number;                  // Total available classrooms
}

// Live Session Management
export interface StartSessionRequest {
  classroomId: string;
  title?: string;                 // Default: "Live Class Session"
  settings?: Partial<SessionSettings>;
}

export interface StartSessionResponse {
  success: boolean;
  sessionId: string;
  session: ClassSession;
}

export interface EndSessionRequest {
  sessionId: string;
}

export interface EndSessionResponse {
  success: boolean;
  message: string;
  sessionDuration: number;        // Duration in minutes
}

export interface JoinLiveSessionRequest {
  sessionId: string;
}

export interface JoinLiveSessionResponse {
  success: boolean;
  session: ClassSession;
  participantId: string;
}

export interface LeaveLiveSessionRequest {
  sessionId: string;
}

export interface LeaveLiveSessionResponse {
  success: boolean;
  message: string;
}

export interface UpdateSessionParticipantRequest {
  sessionId: string;
  updates: {
    videoEnabled?: boolean;
    audioEnabled?: boolean;
    connectionStatus?: ConnectionStatus;
  };
}

export interface UpdateSessionParticipantResponse {
  success: boolean;
  participant: SessionParticipant;
}

export interface GetLiveSessionDetailsRequest {
  sessionId: string;
}

export interface GetLiveSessionDetailsResponse {
  success: boolean;
  session: ClassSession;
}

/**
 * Teacher-specific management types
 */
export interface ManageStudentRequest {
  sessionId: string;
  studentId: string;
  action: StudentManagementAction;
}

export interface ManageStudentResponse {
  success: boolean;
  message: string;
}

export type StudentManagementAction = 
  | "mute_audio" 
  | "unmute_audio" 
  | "disable_video" 
  | "enable_video" 
  | "remove_from_session"
  | "approve_join_request";

/**
 * Utility types for validation and processing
 */
export interface ClassroomValidation {
  isValidName: (name: string) => boolean;
  isValidSubject: (subject: string) => boolean;
  isValidMaxStudents: (count: number) => boolean;
  canUserJoinClassroom: (classroom: Classroom, userId: string) => boolean;
  canUserManageClassroom: (classroom: Classroom, userId: string) => boolean;
}

export interface SessionValidation {
  canStartSession: (classroom: Classroom, userId: string) => boolean;
  canJoinSession: (session: ClassSession, userId: string) => boolean;
  isSessionActive: (session: ClassSession) => boolean;
  getSessionDuration: (session: ClassSession) => number; // in minutes
}

/**
 * Constants for classroom system
 */
export const CLASSROOM_CONSTANTS = {
  MAX_CLASSROOM_NAME_LENGTH: 100,
  MAX_SUBJECT_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 500,
  MIN_STUDENTS: 1,
  MAX_STUDENTS: 100,
  DEFAULT_MAX_STUDENTS: 30,
  MAX_SESSION_DURATION: 480,      // 8 hours in minutes
  MAX_CONCURRENT_SESSIONS: 5,     // Per teacher
  MAX_PARTICIPANTS_PER_SESSION: 50
} as const;

/**
 * Error messages for classroom operations
 */
export const CLASSROOM_ERRORS = {
  CLASSROOM_NOT_FOUND: 'Classroom not found',
  CLASSROOM_FULL: 'Classroom has reached maximum capacity',
  ALREADY_ENROLLED: 'User is already enrolled in this classroom',
  NOT_ENROLLED: 'User is not enrolled in this classroom',
  UNAUTHORIZED: 'User does not have permission for this action',
  SESSION_NOT_FOUND: 'Live session not found',
  SESSION_ENDED: 'Session has already ended',
  SESSION_FULL: 'Session has reached maximum participants',
  INVALID_CLASSROOM_NAME: 'Classroom name is invalid or too long',
  INVALID_SUBJECT: 'Subject is invalid or too long',
  INVALID_MAX_STUDENTS: 'Maximum students count is invalid'
} as const;