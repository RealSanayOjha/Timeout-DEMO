/**
 * Backend Constants
 * Centralized constants to eliminate magic strings and values
 */

// Firebase Configuration
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'timeout-backend-340e2';

// Emulator Configuration (matches emulator-config.json)
const EMULATOR_CONFIG = {
  functions: { host: '127.0.0.1', port: 5002 },
  firestore: { host: '127.0.0.1', port: 8096 },
  auth: { host: '127.0.0.1', port: 9098 },
  hosting: { host: '127.0.0.1', port: 5003 }
};

// Collection Names
const COLLECTIONS = {
  USERS: 'users',
  ROOMS: 'rooms',
  CLASSROOMS: 'classrooms',
  SESSIONS: 'sessions',
  LIVE_SESSIONS: 'liveSessions',
  PARTICIPANTS: 'participants',
  RESTRICTIONS: 'restrictions',
  ANALYTICS: 'analytics',
  ACHIEVEMENTS: 'achievements',
  LEADERBOARD: 'leaderboard',
  STUDY_GROUPS: 'studyGroups',
  NOTIFICATIONS: 'notifications',
  FOCUS_SESSIONS: 'focusSessions'
};

// User Roles
const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
};

// Room/Session Status
const ROOM_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  FULL: 'full',
  ENDED: 'ended',
  WAITING: 'waiting',
  PAUSED: 'paused'
};

const SESSION_STATUS = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  PAUSED: 'paused',
  ENDED: 'ended',
  CANCELLED: 'cancelled'
};

// Participant Status
const PARTICIPANT_STATUS = {
  JOINED: 'joined',
  LEFT: 'left',
  KICKED: 'kicked',
  BANNED: 'banned',
  ACTIVE: 'active',
  IDLE: 'idle'
};

// Error Codes
const ERROR_CODES = {
  INVALID_REQUEST: 'INVALID_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  ROOM_FULL: 'ROOM_FULL',
  SESSION_ENDED: 'SESSION_ENDED',
  ALREADY_JOINED: 'ALREADY_JOINED',
  NOT_PARTICIPANT: 'NOT_PARTICIPANT',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  DATABASE_ERROR: 'DATABASE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR'
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500
};

// Validation Limits
const LIMITS = {
  MAX_ROOM_NAME_LENGTH: 100,
  MAX_ROOM_DESCRIPTION_LENGTH: 500,
  MAX_CLASSROOM_NAME_LENGTH: 150,
  MAX_PARTICIPANTS_PER_ROOM: 12,
  MAX_PARTICIPANTS_PER_CLASSROOM: 50,
  MAX_USER_DISPLAY_NAME_LENGTH: 100,
  MIN_PASSWORD_LENGTH: 6,
  MAX_SESSION_DURATION_HOURS: 8
};

// Time Constants (in milliseconds)
const TIME_CONSTANTS = {
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  IDLE_TIMEOUT: 10 * 60 * 1000,    // 10 minutes
  CLEANUP_INTERVAL: 5 * 60 * 1000  // 5 minutes
};

// Default Settings
const DEFAULT_SETTINGS = {
  ROOM: {
    allowCamera: true,
    allowMicrophone: false,
    allowChat: true,
    focusMode: true,
    maxParticipants: 6
  },
  CLASSROOM: {
    allowStudentVideo: true,
    allowStudentAudio: false,
    allowStudentChat: true,
    autoMuteOnJoin: true,
    requireApproval: false,
    maxStudents: 30
  },
  USER: {
    theme: 'system',
    notifications: true,
    emailUpdates: false,
    autoJoinRooms: false
  }
};

// Notification Types
const NOTIFICATION_TYPES = {
  ROOM_INVITE: 'room_invite',
  CLASSROOM_INVITE: 'classroom_invite',
  SESSION_STARTED: 'session_started',
  SESSION_ENDING: 'session_ending',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  SYSTEM_ANNOUNCEMENT: 'system_announcement'
};

// Achievement Types
const ACHIEVEMENT_TYPES = {
  STUDY_STREAK: 'study_streak',
  HOURS_STUDIED: 'hours_studied',
  ROOMS_JOINED: 'rooms_joined',
  SESSIONS_COMPLETED: 'sessions_completed',
  COMMUNITY_HELPER: 'community_helper'
};

module.exports = {
  PROJECT_ID,
  EMULATOR_CONFIG,
  COLLECTIONS,
  USER_ROLES,
  ROOM_STATUS,
  SESSION_STATUS,
  PARTICIPANT_STATUS,
  ERROR_CODES,
  HTTP_STATUS,
  LIMITS,
  TIME_CONSTANTS,
  DEFAULT_SETTINGS,
  NOTIFICATION_TYPES,
  ACHIEVEMENT_TYPES
};