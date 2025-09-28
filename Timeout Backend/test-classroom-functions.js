/**
 * Test script for classroom functions
 * This script tests the new classroom functionality locally
 */

const { httpsCallable, connectFunctionsEmulator } = require('firebase/functions');
const { initializeApp } = require('firebase/app');
const { getFunctions } = require('firebase/functions');

// Firebase config for local testing
const firebaseConfig = {
  projectId: "timeout-backend",
  // Local emulator endpoints will be used
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// Connect to local functions emulator
connectFunctionsEmulator(functions, "127.0.0.1", 5001);

console.log("🔗 Connected to Firebase Functions emulator at 127.0.0.1:5001");

// Test data
const testTeacher = {
  userId: "test-teacher-123",
  displayName: "Dr. Test Teacher",
  firstName: "Dr. Test",
  lastName: "Teacher",
  role: "teacher",
  avatarUrl: "https://example.com/teacher-avatar.jpg"
};

const testStudent = {
  userId: "test-student-123", 
  displayName: "Test Student",
  firstName: "Test",
  lastName: "Student", 
  role: "student",
  avatarUrl: "https://example.com/student-avatar.jpg"
};

const testClassroomData = {
  name: "Advanced Physics",
  subject: "Physics",
  description: "Learn quantum mechanics and relativity",
  maxStudents: 30,
  isPublic: true
};

async function testClassroomFunctions() {
  try {
    console.log("🧪 Starting classroom function tests...\n");

    // Test 0: Check if emulators are responding
    console.log("0️⃣ Testing emulator connectivity...");
    try {
      const healthCheck = httpsCallable(functions, 'healthCheck');
      const healthResult = await healthCheck({});
      console.log("✅ Health check passed:", healthResult.data?.status || "OK");
    } catch (healthError) {
      console.log("⚠️ Health check failed, but continuing with classroom tests...");
      console.log("   Error:", healthError.message);
    }

    // Test 1: Create a classroom (as teacher)
    console.log("1️⃣ Testing createClassroom (as teacher)...");
    console.log("   Function URL should be: http://127.0.0.1:5001/timeout-backend-340e2/us-central1/createClassroom");
    
    const createClassroom = httpsCallable(functions, 'createClassroom');
    const createResult = await createClassroom({
      name: testClassroomData.name,
      subject: testClassroomData.subject,
      description: testClassroomData.description,
      maxStudents: testClassroomData.maxStudents,
      isPublic: testClassroomData.isPublic
    });
    
    const classroomId = createResult.data.classroomId;
    console.log("✅ Classroom created successfully:", classroomId);
    console.log("   Classroom data:", JSON.stringify(createResult.data.classroom, null, 2));

    // Test 2: Get available classrooms (as student)
    console.log("\n2️⃣ Testing getAvailableClassrooms...");
    const getAvailableClassrooms = httpsCallable(functions, 'getAvailableClassrooms');
    const availableResult = await getAvailableClassrooms({
      limit: 10,
      userId: testStudent.userId,
      role: testStudent.role
    });
    console.log("✅ Available classrooms retrieved:");
    console.log("   Found", availableResult.data.classrooms.length, "public classrooms");
    console.log("   Total:", availableResult.data.total);

    // Test 3: Join classroom (as student)
    console.log("\n3️⃣ Testing joinClassroom (as student)...");
    const joinClassroom = httpsCallable(functions, 'joinClassroom');
    const joinResult = await joinClassroom({
      classroomId: classroomId,
      userId: testStudent.userId,
      displayName: testStudent.displayName,
      role: testStudent.role
    });
    console.log("✅ Student joined classroom successfully");
    console.log("   Join result:", JSON.stringify(joinResult.data, null, 2));

    // Test 4: Get my classrooms (as student)
    console.log("\n4️⃣ Testing getMyClassrooms (as student)...");
    const getMyClassrooms = httpsCallable(functions, 'getMyClassrooms');
    const myClassroomsResult = await getMyClassrooms({
      userId: testStudent.userId,
      role: testStudent.role
    });
    console.log("✅ Student's classrooms retrieved:");
    console.log("   Enrolled classrooms:", myClassroomsResult.data.enrolledClassrooms?.length || 0);

    // Test 5: Start a live session (as teacher)
    console.log("\n5️⃣ Testing startClassSession (as teacher)...");
    const startClassSession = httpsCallable(functions, 'startClassSession');
    const sessionResult = await startClassSession({
      classroomId: classroomId,
      title: "Test Live Session",
      userId: testTeacher.userId,
      displayName: testTeacher.displayName,
      role: testTeacher.role
    });
    
    const sessionId = sessionResult.data.sessionId;
    console.log("✅ Live session started successfully:", sessionId);

    // Test 6: Join live session (as student)
    console.log("\n6️⃣ Testing joinLiveSession (as student)...");
    const joinLiveSession = httpsCallable(functions, 'joinLiveSession');
    const joinSessionResult = await joinLiveSession({
      sessionId: sessionId,
      userId: testStudent.userId,
      displayName: testStudent.displayName,
      role: testStudent.role
    });
    console.log("✅ Student joined live session successfully");

    console.log("\n🎉 All classroom function tests completed successfully!");
    console.log("🖥️  Check the Firestore UI to see the actual data structure");
    console.log("📂 New collections created: 'classrooms', 'liveSessions'");

  } catch (error) {
    console.error("❌ Test failed:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    
    if (error.code === 'unavailable') {
      console.log("\n🔧 Make sure Firebase emulators are running:");
      console.log("   Run: firebase emulators:start");
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  console.log("🚀 Initializing classroom function tests...");
  console.log("🔧 Make sure Firebase emulators are running first!");
  console.log("   Run: firebase emulators:start\n");
  
  // Wait a bit for emulators to be ready
  setTimeout(() => {
    testClassroomFunctions().finally(() => {
      console.log("\n✨ Test script completed!");
    });
  }, 2000);
}

module.exports = { testClassroomFunctions };