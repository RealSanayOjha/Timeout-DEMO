/**
 * Test Data Factory
 * Generates realistic test data without hardcoded values
 * Uses current dates and dynamic IDs
 */

const { PROJECT_ID } = require('../config/constants');

class TestDataFactory {
  constructor() {
    this.currentDate = new Date();
    this.currentYear = this.currentDate.getFullYear();
    this.currentMonth = this.currentDate.getMonth();
  }

  // Generate unique IDs
  generateUserId(prefix = 'user') {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }

  generateClassCode(subject = 'SUB') {
    return `${subject.toUpperCase().substring(0, 4)}${this.currentYear}`;
  }

  // Generate current and future dates
  getCurrentDate() {
    return new Date();
  }

  getFutureDate(daysFromNow = 1) {
    const future = new Date();
    future.setDate(future.getDate() + daysFromNow);
    return future;
  }

  getTimeSlot(hour = 9, minute = 0) {
    const time = new Date();
    time.setHours(hour, minute, 0, 0);
    return {
      start: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      end: `${(hour + 1).toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    };
  }

  // User factory methods
  createStudentUser(overrides = {}) {
    const userId = this.generateUserId('student');
    return {
      userId,
      email: `student.${Date.now()}@testdomain.com`,
      firstName: "Test",
      lastName: "Student",
      displayName: "Test Student",
      role: "student",
      avatarUrl: `https://ui-avatars.com/api/?name=Test+Student&background=random`,
      createdAt: this.getCurrentDate(),
      updatedAt: this.getCurrentDate(),
      preferences: {
        theme: "system",
        notifications: true,
        emailUpdates: false
      },
      studyStats: {
        totalStudyTime: 0,
        sessionsCompleted: 0,
        streakDays: 0,
        lastActiveDate: this.getCurrentDate()
      },
      ...overrides
    };
  }

  createTeacherUser(overrides = {}) {
    const userId = this.generateUserId('teacher');
    const firstName = overrides.firstName || 'Dr. Sarah';
    const lastName = overrides.lastName || 'Wilson';
    
    return {
      userId,
      email: `teacher.${Date.now()}@testdomain.com`,
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`,
      role: "teacher",
      avatarUrl: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`,
      createdAt: this.getCurrentDate(),
      updatedAt: this.getCurrentDate(),
      preferences: {
        theme: "system",
        notifications: true,
        emailUpdates: true
      },
      ...overrides
    };
  }

  // Classroom factory methods
  createClassroom(teacherId, teacherName, subject = 'Physics', overrides = {}) {
    const timeSlot = this.getTimeSlot(9 + Math.floor(Math.random() * 8)); // 9 AM to 4 PM
    const nextSessionDate = this.getFutureDate(Math.floor(Math.random() * 7) + 1); // 1-7 days from now
    
    return {
      name: overrides.name || `Advanced ${subject}`,
      subject,
      description: overrides.description || `Comprehensive ${subject} course covering advanced topics`,
      teacherId,
      teacherName,
      teacherAvatar: `https://ui-avatars.com/api/?name=${teacherName.replace(' ', '+')}&background=random`,
      isPublic: true,
      maxStudents: 20 + Math.floor(Math.random() * 20), // 20-40 students
      currentStudents: Math.floor(Math.random() * 15), // 0-15 current students
      enrolledStudents: overrides.enrolledStudents || [],
      classCode: this.generateClassCode(subject.substring(0, 4)),
      schedule: {
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][Math.floor(Math.random() * 5)],
        startTime: timeSlot.start,
        endTime: timeSlot.end,
        timezone: "UTC"
      },
      createdAt: this.getCurrentDate(),
      updatedAt: this.getCurrentDate(),
      settings: {
        allowStudentVideo: true,
        allowStudentAudio: Math.random() > 0.5,
        allowStudentChat: true,
        autoMuteOnJoin: Math.random() > 0.3,
        requireApproval: Math.random() > 0.6
      },
      nextSession: {
        date: nextSessionDate.toISOString().split('T')[0], // YYYY-MM-DD format
        time: `${timeSlot.start}-${timeSlot.end}`,
        title: overrides.nextSessionTitle || `${subject} Session`
      },
      ...overrides
    };
  }

  // Live session factory
  createLiveSession(classroomId, teacherId, teacherName, overrides = {}) {
    const startedMinutesAgo = Math.floor(Math.random() * 60); // Started 0-60 minutes ago
    const startedAt = new Date(Date.now() - startedMinutesAgo * 60 * 1000);
    
    return {
      id: `session_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      classroomId,
      teacherId,
      teacherName,
      title: overrides.title || `Live Q&A Session`,
      isActive: true,
      startedAt,
      participants: overrides.participants || [],
      maxParticipants: 30,
      settings: {
        allowStudentVideo: true,
        allowStudentAudio: false,
        allowStudentChat: true,
        recordSession: false
      },
      ...overrides
    };
  }

  // Room factory (for study rooms)
  createRoom(hostUserId, hostName, overrides = {}) {
    return {
      id: `room_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: overrides.name || `Study Room ${Math.floor(Math.random() * 100)}`,
      description: overrides.description || "Focused study session",
      hostUserId,
      hostName,
      hostAvatar: `https://ui-avatars.com/api/?name=${hostName.replace(' ', '+')}&background=random`,
      isPublic: overrides.isPublic !== false,
      maxParticipants: 4 + Math.floor(Math.random() * 8), // 4-12 participants
      currentParticipants: Math.floor(Math.random() * 4), // 0-4 current participants
      participants: overrides.participants || [],
      status: 'active',
      subject: overrides.subject || 'General Study',
      studyDuration: 25 + Math.floor(Math.random() * 60), // 25-85 minutes
      createdAt: this.getCurrentDate(),
      updatedAt: this.getCurrentDate(),
      settings: {
        allowCamera: true,
        allowMicrophone: false,
        allowChat: true,
        focusMode: true
      },
      ...overrides
    };
  }

  // Batch creation methods
  createMultipleClassrooms(teacherId, teacherName, count = 3) {
    const subjects = ['Physics', 'Mathematics', 'Chemistry', 'Biology', 'Computer Science', 'History', 'Literature', 'Economics'];
    const classrooms = [];
    
    for (let i = 0; i < count; i++) {
      const subject = subjects[i % subjects.length];
      const classroom = this.createClassroom(teacherId, teacherName, subject);
      classrooms.push(classroom);
    }
    
    return classrooms;
  }

  createMultipleAvailableClassrooms(teacherId, teacherName, count = 2) {
    const subjects = ['Organic Chemistry', 'World History', 'Advanced Statistics', 'Philosophy', 'Psychology'];
    const classrooms = [];
    
    for (let i = 0; i < count; i++) {
      const subject = subjects[i % subjects.length];
      const classroom = this.createClassroom(teacherId, teacherName, subject, {
        enrolledStudents: [], // Available classrooms have no enrolled students initially
        currentStudents: Math.floor(Math.random() * 10) + 5 // 5-15 students already enrolled
      });
      classrooms.push(classroom);
    }
    
    return classrooms;
  }
}

module.exports = TestDataFactory;