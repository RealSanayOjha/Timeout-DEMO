// Application constants and configuration
import { backendEnvConfig } from './environment';

// Clerk configuration - use environment config
export const CLERK_WEBHOOK_SECRET = backendEnvConfig.getClerkWebhookSecret();
export const CLERK_SECRET_KEY = backendEnvConfig.getClerkSecretKey();
export const CLERK_PUBLISHABLE_KEY = backendEnvConfig.getClerkPublishableKey();

export const APP_CONFIG = {
  // Room settings - from environment
  ROOM_EXPIRY_HOURS: backendEnvConfig.getRoomExpiryHours(),
  MAX_ROOM_MEMBERS: backendEnvConfig.getMaxRoomMembers(),
  SESSION_TIMEOUT_MINUTES: backendEnvConfig.getSessionTimeoutMinutes(),
  
  // Timer settings
  MIN_TIMER_DURATION: 5, // 5 minutes
  MAX_TIMER_DURATION: 480, // 8 hours
  TIMER_UPDATE_INTERVAL: 1000, // 1 second
  
  // User roles
  USER_ROLES: {
    STUDENT: "student",
    TEACHER: "teacher",
    ADMIN: "admin",
  } as const,
  
  // Room visibility
  ROOM_VISIBILITY: {
    PUBLIC: "public",
    PRIVATE: "private",
  } as const,
  
  // Room status
  ROOM_STATUS: {
    WAITING: "waiting",
    ACTIVE: "active", 
    PAUSED: "paused",
    COMPLETED: "completed",
  } as const,
  
  // Collection names
  COLLECTIONS: {
    USERS: "users",
    STUDY_ROOMS: "studyRooms",
    SESSIONS: "sessions",
    MESSAGES: "messages",
    CLASSROOMS: "classrooms",
    LIVE_SESSIONS: "liveSessions",
  } as const,
  
  // Error messages
  ERRORS: {
    UNAUTHORIZED: "Unauthorized access",
    ROOM_NOT_FOUND: "Study room not found",
    ROOM_FULL: "Study room is at capacity",
    INVALID_TIMER: "Invalid timer operation",
    PERMISSION_DENIED: "Permission denied",
    // Classroom errors
    CLASSROOM_NOT_FOUND: "Classroom not found",
    CLASSROOM_FULL: "Classroom has reached maximum capacity",
    ALREADY_ENROLLED: "User is already enrolled in this classroom",
    NOT_ENROLLED: "User is not enrolled in this classroom",
    SESSION_NOT_FOUND: "Live session not found",
    SESSION_ENDED: "Session has already ended",
    SESSION_FULL: "Session has reached maximum participants",
    INVALID_CLASSROOM_NAME: "Classroom name is invalid or too long",
    INVALID_SUBJECT: "Subject is invalid or too long",
  } as const,

  // Security settings
  SECURITY: {
    RATE_LIMIT_REQUESTS_PER_MINUTE: backendEnvConfig.getRateLimitRequestsPerMinute(),
    CORS_ALLOWED_ORIGINS: backendEnvConfig.getCorsAllowedOrigins(),
    JWT_VERIFY_STRICT: backendEnvConfig.shouldVerifyJwtStrict(),
  } as const,

  // Monitoring settings
  MONITORING: {
    DETAILED_LOGGING: backendEnvConfig.isDetailedLoggingEnabled(),
    METRICS_ENABLED: backendEnvConfig.isMetricsEnabled(),
    SENTRY_DSN: backendEnvConfig.getSentryDsn(),
  } as const,

  // Database settings
  DATABASE: {
    RETRY_CONFIG: backendEnvConfig.getFirestoreRetryConfig(),
    CACHE_ENABLED: backendEnvConfig.isFirestoreCacheEnabled(),
  } as const,

  // Classroom settings
  CLASSROOM: {
    MAX_NAME_LENGTH: 100,
    MAX_SUBJECT_LENGTH: 50,
    MAX_DESCRIPTION_LENGTH: 500,
    MIN_STUDENTS: 1,
    MAX_STUDENTS: 100,
    DEFAULT_MAX_STUDENTS: 30,
    MAX_SESSION_DURATION: 480, // 8 hours in minutes
    MAX_CONCURRENT_SESSIONS: 5, // Per teacher
    MAX_PARTICIPANTS_PER_SESSION: 50,
  } as const,

  // Session settings
  SESSION: {
    STATUS: {
      SCHEDULED: "scheduled",
      LIVE: "live",
      ENDED: "ended",
      CANCELLED: "cancelled",
    } as const,
    CONNECTION_STATUS: {
      EXCELLENT: "excellent",
      GOOD: "good",
      POOR: "poor",
      DISCONNECTED: "disconnected",
    } as const,
    DEFAULT_SETTINGS: {
      ALLOW_STUDENT_VIDEO: true,
      ALLOW_STUDENT_AUDIO: true,
      ALLOW_STUDENT_CHAT: true,
      AUTO_MUTE_ON_JOIN: false,
      REQUIRE_APPROVAL: false,
    } as const,
  } as const,
} as const;

// Export type for APP_CONFIG
export type AppConfig = typeof APP_CONFIG;
