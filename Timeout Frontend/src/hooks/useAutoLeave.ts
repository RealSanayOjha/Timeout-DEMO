/**
 * Auto-leave hook for rooms and live sessions
 * Automatically leaves rooms/sessions when user closes browser or tab
 */
import { useEffect, useCallback } from 'react';
import { leaveRoom, leaveLiveSession } from '@/config/firebase';

interface AutoLeaveOptions {
  userId?: string;
  roomId?: string;
  sessionId?: string;
  classroomId?: string;
  onLeave?: () => void;
}

export const useAutoLeave = (options: AutoLeaveOptions) => {
  const { userId, roomId, sessionId, classroomId, onLeave } = options;

  const performAutoLeave = useCallback(async () => {
    try {
      console.log('🚪 Auto-leaving sessions...');

      // Leave room if in one
      if (roomId && userId) {
        try {
          await leaveRoom({ roomId, userId });
          console.log('✅ Auto-left room:', roomId);
        } catch (error) {
          console.warn('⚠️ Failed to auto-leave room:', error);
        }
      }

      // Leave live session if in one
      if (sessionId && userId) {
        try {
          await leaveLiveSession({ sessionId, userId });
          console.log('✅ Auto-left live session:', sessionId);
        } catch (error) {
          console.warn('⚠️ Failed to auto-leave live session:', error);
        }
      }

      // Call custom leave handler
      if (onLeave) {
        onLeave();
      }
    } catch (error) {
      console.error('❌ Auto-leave failed:', error);
    }
  }, [roomId, sessionId, userId, onLeave]);

  useEffect(() => {
    // Only set up auto-leave if we have something to leave
    if (!userId || (!roomId && !sessionId)) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Perform synchronous leave (best effort)
      performAutoLeave();
      
      // Optional: Show confirmation dialog
      const message = 'You will be automatically removed from the session.';
      event.returnValue = message;
      return message;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched tabs or minimized - perform leave
        performAutoLeave();
      }
    };

    const handlePageHide = () => {
      // More reliable than beforeunload for mobile
      performAutoLeave();
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Perform final leave when hook unmounts
      performAutoLeave();
    };
  }, [performAutoLeave, userId, roomId, sessionId]);

  return { performAutoLeave };
};