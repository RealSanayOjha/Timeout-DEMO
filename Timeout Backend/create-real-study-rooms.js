const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin for emulator
if (process.env.NODE_ENV !== 'production') {
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8096';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9098';
  process.env.FUNCTIONS_EMULATOR = 'true';
}

admin.initializeApp({
  projectId: 'timeout-backend-340e2'
});

// Connect to Firestore emulator
const db = admin.firestore();
if (process.env.NODE_ENV === 'development' || process.env.FUNCTIONS_EMULATOR === 'true') {
  db.settings({
    host: '127.0.0.1:8096',
    ssl: false
  });
  console.log('🔥 Connected to Firestore emulator at 127.0.0.1:8096');
}

async function createRealStudyRooms() {
  console.log('🚀 Creating real study rooms that match frontend expectations...');
  
  try {
    // First, create the user profile that will be used
    const userId = 'user_2oMzRQ8BBRTP9Qjy9t4qFkuNOgp'; // Your actual Clerk user ID
    const userProfile = {
      id: userId,
      email: 'ojhasanay@gmail.com',
      firstName: 'Sanay',
      lastName: 'Ojha',
      displayName: 'Sanay Ojha',
      avatarUrl: null,
      role: 'student',
      studyStats: {
        totalStudyTime: 0,
        focusStreaks: 0,
        roomsJoined: 0,
        achievementsUnlocked: 0
      },
      preferences: {
        studyReminders: true,
        focusMode: true,
        soundEnabled: true,
        theme: 'light'
      },
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    };

    await db.collection('users').doc(userId).set(userProfile);
    console.log('✅ Created user profile for:', userProfile.displayName);

    // Create real study rooms that you can actually join
    const studyRooms = [
      {
        id: 'focus-warriors-room',
        name: 'Focus Warriors',
        description: 'Intense study sessions with photo verification',
        subject: 'General',
        hostId: userId,
        hostName: 'Sanay Ojha',
        visibility: 'public',
        status: 'active',
        maxParticipants: 12,
        currentParticipants: 1,
        participants: {
          [userId]: {
            userId: userId,
            displayName: 'Sanay Ojha',
            role: 'host',
            joinedAt: admin.firestore.Timestamp.now(),
            isActive: true,
            studyTime: 0
          }
        },
        timer: {
          phase: 'focus',
          focusMinutes: 25,
          shortBreakMinutes: 5,
          longBreakMinutes: 15,
          currentPhaseStarted: admin.firestore.Timestamp.now(),
          remainingTime: 25 * 60,
          isRunning: false,
          cycle: 1
        },
        settings: {
          requirePhotoVerification: true,
          allowBreakExtension: true,
          autoStartBreaks: true,
          allowLateJoin: true,
          showParticipantProgress: true,
          muteChat: false
        },
        stats: {
          totalFocusTime: 0,
          totalBreakTime: 0,
          sessionsCompleted: 0,
          participantCount: 1
        },
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'calm-studiers-room',
        name: 'Calm Studiers',
        description: 'Peaceful group study environment',
        subject: 'General',
        hostId: userId,
        hostName: 'Sanay Ojha',
        visibility: 'public',
        status: 'active',
        maxParticipants: 6,
        currentParticipants: 1,
        participants: {
          [userId]: {
            userId: userId,
            displayName: 'Sanay Ojha',
            role: 'host',
            joinedAt: admin.firestore.Timestamp.now(),
            isActive: true,
            studyTime: 0
          }
        },
        timer: {
          phase: 'focus',
          focusMinutes: 30,
          shortBreakMinutes: 10,
          longBreakMinutes: 20,
          currentPhaseStarted: admin.firestore.Timestamp.now(),
          remainingTime: 30 * 60,
          isRunning: false,
          cycle: 1
        },
        settings: {
          requirePhotoVerification: false,
          allowBreakExtension: true,
          autoStartBreaks: true,
          allowLateJoin: true,
          showParticipantProgress: true,
          muteChat: false
        },
        stats: {
          totalFocusTime: 0,
          totalBreakTime: 0,
          sessionsCompleted: 0,
          participantCount: 1
        },
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'night-hawks-room',
        name: 'Night Hawks',
        description: 'Late night study squad with achievements',
        subject: 'General',
        hostId: userId,
        hostName: 'Sanay Ojha',
        visibility: 'public',
        status: 'active',
        maxParticipants: 15,
        currentParticipants: 1,
        participants: {
          [userId]: {
            userId: userId,
            displayName: 'Sanay Ojha',
            role: 'host',
            joinedAt: admin.firestore.Timestamp.now(),
            isActive: true,
            studyTime: 0
          }
        },
        timer: {
          phase: 'focus',
          focusMinutes: 50,
          shortBreakMinutes: 10,
          longBreakMinutes: 30,
          currentPhaseStarted: admin.firestore.Timestamp.now(),
          remainingTime: 50 * 60,
          isRunning: false,
          cycle: 1
        },
        settings: {
          requirePhotoVerification: false,
          allowBreakExtension: true,
          autoStartBreaks: true,
          allowLateJoin: true,
          showParticipantProgress: true,
          muteChat: false
        },
        stats: {
          totalFocusTime: 0,
          totalBreakTime: 0,
          sessionsCompleted: 0,
          participantCount: 1
        },
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      }
    ];

    // Create each room in Firestore
    for (const room of studyRooms) {
      await db.collection('studyRooms').doc(room.id).set(room);
      console.log(`✅ Created study room: ${room.name} (ID: ${room.id})`);
    }

    console.log(`\n🎉 Successfully created ${studyRooms.length} real study rooms!`);
    console.log('\n📋 Room Details:');
    studyRooms.forEach(room => {
      console.log(`  • ${room.name} - ${room.description}`);
      console.log(`    ID: ${room.id}`);
      console.log(`    Max participants: ${room.maxParticipants}`);
      console.log(`    Status: ${room.status}`);
    });

    console.log('\n🎯 You can now join these rooms from the frontend!');
    console.log('👤 User Profile Created:');
    console.log(`  • Name: ${userProfile.displayName}`);
    console.log(`  • Email: ${userProfile.email}`);
    console.log(`  • ID: ${userId}`);

  } catch (error) {
    console.error('❌ Error creating study rooms:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run the script
createRealStudyRooms().catch(console.error);