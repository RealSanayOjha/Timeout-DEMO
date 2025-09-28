/**
 * Test script to create demo user profile and classroom data
 * Uses TestDataFactory for dynamic, realistic test data
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, connectFirestoreEmulator, doc, setDoc, collection, addDoc } = require('firebase/firestore');
const TestDataFactory = require('./factories/test-data-factory');
const { PROJECT_ID, EMULATOR_CONFIG, COLLECTIONS } = require('./config/constants');

// Firebase config for local testing
const firebaseConfig = {
  projectId: PROJECT_ID,
  // Local emulator endpoints will be used
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to local Firestore emulator
try {
  connectFirestoreEmulator(db, EMULATOR_CONFIG.firestore.host, EMULATOR_CONFIG.firestore.port);
  console.log(`🔥 Connected to Firestore emulator at ${EMULATOR_CONFIG.firestore.host}:${EMULATOR_CONFIG.firestore.port}`);
} catch (error) {
  console.log("⚠️ Firestore emulator already connected or connection failed");
}

async function createTestData() {
  try {
    console.log("🚀 Creating dynamic test data...");
    
    // Initialize factory
    const factory = new TestDataFactory();

    // Create demo student user
    console.log("👤 Creating demo student user...");
    const testUser = factory.createStudentUser({
      userId: "demo-user", // Keep this ID for consistency with existing tests
      email: "demo@example.com",
      firstName: "Demo",
      lastName: "Student"
    });
    await setDoc(doc(db, COLLECTIONS.USERS, testUser.userId), testUser);
    
    // Create teacher user
    console.log("👨‍🏫 Creating teacher user...");
    const teacherUser = factory.createTeacherUser({
      userId: "teacher-demo", // Keep this ID for consistency
      email: "teacher@example.com",
      firstName: "Dr. Sarah",
      lastName: "Wilson"
    });
    await setDoc(doc(db, COLLECTIONS.USERS, teacherUser.userId), teacherUser);

    // Create enrolled classrooms (student is enrolled in these)
    console.log("📚 Creating enrolled classrooms...");
    const enrolledClassrooms = factory.createMultipleClassrooms(
      teacherUser.userId, 
      teacherUser.displayName, 
      3
    );
    
    // Add the demo student to enrolled classrooms
    enrolledClassrooms.forEach(classroom => {
      classroom.enrolledStudents = [testUser.userId];
      classroom.currentStudents += 1;
    });

    const enrolledClassroomIds = [];
    for (const classroom of enrolledClassrooms) {
      const docRef = await addDoc(collection(db, COLLECTIONS.CLASSROOMS), classroom);
      enrolledClassroomIds.push(docRef.id);
      console.log(`  ✅ Created classroom: ${classroom.name} (ID: ${docRef.id})`);
    }

    // Create available classrooms (student can join these)
    console.log("🌟 Creating available classrooms...");
    const availableClassrooms = factory.createMultipleAvailableClassrooms(
      teacherUser.userId,
      teacherUser.displayName,
      2
    );
    
    for (const classroom of availableClassrooms) {
      const docRef = await addDoc(collection(db, COLLECTIONS.CLASSROOMS), classroom);
      console.log(`  ✅ Created available classroom: ${classroom.name} (ID: ${docRef.id})`);
    }

    // Create a live session for the first enrolled classroom
    if (enrolledClassroomIds.length > 0) {
      console.log("📺 Creating live session...");
      const liveSession = factory.createLiveSession(
        enrolledClassroomIds[0],
        teacherUser.userId,
        teacherUser.displayName,
        {
          title: `Live ${enrolledClassrooms[0].subject} Q&A Session`,
          participants: [testUser.userId]
        }
      );
      
      const sessionRef = await addDoc(collection(db, COLLECTIONS.LIVE_SESSIONS), liveSession);
      console.log(`  ✅ Created live session: ${liveSession.title} (ID: ${sessionRef.id})`);
    }

    console.log("\n🎉 Dynamic test data created successfully!");
    console.log("\n📋 Summary:");
    console.log(`  • 2 users created (student: ${testUser.userId}, teacher: ${teacherUser.userId})`);
    console.log(`  • ${enrolledClassrooms.length} enrolled classrooms`);
    console.log(`  • ${availableClassrooms.length} available classrooms`);
    console.log(`  • 1 live session`);
    
    console.log("\n🔧 Test with these credentials:");
    console.log(`  • User ID: ${testUser.userId}`);
    console.log(`  • Display Name: ${testUser.displayName}`);
    console.log(`  • Role: ${testUser.role}`);
    console.log(`  • Project ID: ${PROJECT_ID}`);

    process.exit(0);

  } catch (error) {
    console.error("❌ Error creating test data:", error);
    process.exit(1);
  }
}

// Run the script
createTestData();