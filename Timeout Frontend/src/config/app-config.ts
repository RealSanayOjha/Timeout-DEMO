/**
 * Centralized Application Configuration
 * Single source of truth for all app configurations
 */

// Environment type
export type Environment = 'development' | 'staging' | 'production';

// Firebase emulator configuration
export interface EmulatorConfig {
  functions: { host: string; port: number };
  firestore: { host: string; port: number };
  auth: { host: string; port: number };
  hosting: { host: string; port: number };
}

// Application configuration interface
export interface AppConfig {
  environment: Environment;
  projectId: string;
  emulators: EmulatorConfig;
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  };
  api: {
    baseUrl: string;
    timeout: number;
  };
}

// Load configuration from emulator-config.json (for development)
const loadEmulatorConfig = (): EmulatorConfig => {
  // Default emulator configuration (matches emulator-config.json)
  return {
    functions: { host: '127.0.0.1', port: 5002 },
    firestore: { host: '127.0.0.1', port: 8096 },
    auth: { host: '127.0.0.1', port: 9098 },
    hosting: { host: '127.0.0.1', port: 5003 }
  };
};

// Determine current environment
const getCurrentEnvironment = (): Environment => {
  if (import.meta.env.PROD) return 'production';
  if (import.meta.env.VITE_ENVIRONMENT === 'staging') return 'staging';
  return 'development';
};

// Configuration factory
class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig;

  private constructor() {
    const environment = getCurrentEnvironment();
    const emulators = loadEmulatorConfig();

    this.config = {
      environment,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'timeout-backend-340e2',
      emulators,
      firebase: {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'timeout-backend-340e2',
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
      },
      api: {
        baseUrl: environment === 'production' 
          ? 'https://your-project.web.app'
          : `http://${emulators.hosting.host}:${emulators.hosting.port}`,
        timeout: 30000
      }
    };
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  getConfig(): AppConfig {
    return this.config;
  }

  getEnvironment(): Environment {
    return this.config.environment;
  }

  isDevelopment(): boolean {
    return this.config.environment === 'development';
  }

  isProduction(): boolean {
    return this.config.environment === 'production';
  }

  getFirebaseConfig() {
    return this.config.firebase;
  }

  getEmulatorConfig(): EmulatorConfig {
    return this.config.emulators;
  }

  getProjectId(): string {
    return this.config.projectId;
  }

  getFunctionsUrl(): string {
    if (this.isDevelopment()) {
      const emulator = this.config.emulators.functions;
      return `http://${emulator.host}:${emulator.port}`;
    }
    return `https://${this.config.projectId}.cloudfunctions.net`;
  }
}

// Export singleton instance
export const config = ConfigManager.getInstance();

// Export commonly used values
export const APP_CONFIG = config.getConfig();
export const FIREBASE_CONFIG = config.getFirebaseConfig();
export const EMULATOR_CONFIG = config.getEmulatorConfig();
export const PROJECT_ID = config.getProjectId();

// Constants for error codes and magic strings
export const ERROR_CODES = {
  FIREBASE_CONNECTION_FAILED: 'FIREBASE_CONNECTION_FAILED',
  EMULATOR_NOT_RUNNING: 'EMULATOR_NOT_RUNNING',
  FUNCTION_CALL_FAILED: 'FUNCTION_CALL_FAILED',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  NETWORK_ERROR: 'NETWORK_ERROR'
} as const;

export const COLLECTION_NAMES = {
  USERS: 'users',
  ROOMS: 'rooms',
  CLASSROOMS: 'classrooms',
  SESSIONS: 'sessions',
  PARTICIPANTS: 'participants',
  RESTRICTIONS: 'restrictions',
  ANALYTICS: 'analytics',
  ACHIEVEMENTS: 'achievements',
  LEADERBOARD: 'leaderboard'
} as const;

export const ROOM_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  FULL: 'full',
  ENDED: 'ended'
} as const;

export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
} as const;

export const SESSION_STATUS = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  PAUSED: 'paused',
  ENDED: 'ended'
} as const;