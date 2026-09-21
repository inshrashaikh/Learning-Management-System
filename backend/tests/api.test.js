const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Module = require('../src/models/Module');
const Lesson = require('../src/models/Lesson');
const Enrollment = require('../src/models/Enrollment');
const Progress = require('../src/models/Progress');
const Assignment = require('../src/models/Assignment');
const Submission = require('../src/models/Submission');
const Quiz = require('../src/models/Quiz');
const Question = require('../src/models/Question');
const QuizAttempt = require('../src/models/QuizAttempt');

beforeAll(async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/learnsphere_test';
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Clean test db and close connection
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('LearnSphere Full System Integration Tests', () => {
  let adminToken = '';
  let instructorToken = '';
  let studentToken = '';
  let instructorId = '';
  let studentId = '';
  let createdCourseId = '';
  let createdModuleId = '';
  let createdLessonId = '';
  let createdAssignmentId = '';
  let createdSubmissionId = '';
  let createdQuizId = '';
  let question1Id = '';

  // 1. Authentication & Authorization Tests
  describe('Phase 1: Authentication & Authorization', () => {
    it('should register a new student account', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Student',
          email: 'test.student@example.com',
          password: 'Password123!',
          role: 'student'
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user.email).toBe('test.student@example.com');
      expect(res.body.data.token).toBeDefined();
      studentToken = res.body.data.token;
      studentId = res.body.data.user.id;
    });

    it('should reject registration with duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another Student',
          email: 'test.student@example.com',
          password: 'Password123!'
        });

      expect(res.status).toBe(409);
      expect(res.body.status).toBe('fail');
    });

    it('should reject login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test.student@example.com',
          password: 'WrongPassword!'
        });

      expect(res.status).toBe(401);
    });

    it('should register and login an instructor', async () => {
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Instructor',
          email: 'test.instructor@example.com',
          password: 'Password123!',
          role: 'instructor'
        });

      expect(regRes.status).toBe(201);
      instructorToken = regRes.body.data.token;
      instructorId = regRes.body.data.user.id;
    });

    it('should register and login an admin', async () => {
      // Create admin user
      const admin = await User.create({
        name: 'Super Admin',
        email: 'test.admin@example.com',
        password: 'Password123!',
        role: 'admin'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test.admin@example.com',
          password: 'Password123!'
        });

      expect(res.status).toBe(200);
      adminToken = res.body.data.token;
    });

    it('should forbid student from creating a course (Role Authorization)', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Unauthorized Student Course',
          shortDescription: 'Short description for testing',
          description: 'Long enough description for testing purposes here.',
          category: 'Web Development'
        });

      expect(res.status).toBe(403);
    });

    it('should forbid instructor from accessing admin endpoints', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect(res.status).toBe(403);
    });

    it('should allow admin to access admin statistics', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalUsers).toBeDefined();
    });
  });

  // 2. Course, Module & Lesson Tests
  describe('Phase 2: Course & Curriculum Management', () => {
    it('should allow instructor to create a new course in draft mode', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: 'Advanced React Architecture',
          shortDescription: 'Deep dive into hooks, state trees, and concurrent rendering.',
          description: 'Comprehensive course covering production React architectural design and optimization.',
          category: 'Web Development',
          difficulty: 'advanced'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.course.title).toBe('Advanced React Architecture');
      expect(res.body.data.course.status).toBe('draft');
      createdCourseId = res.body.data.course._id;
    });

    it('should allow instructor to add a module to course', async () => {
      const res = await request(app)
        .post(`/api/modules/course/${createdCourseId}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: 'Module 1: React Internals & Fiber',
          description: 'Understanding the reconciliation engine'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.module.title).toBe('Module 1: React Internals & Fiber');
      createdModuleId = res.body.data.module._id;
    });

    it('should allow instructor to add a lesson to module', async () => {
      const res = await request(app)
        .post(`/api/modules/${createdModuleId}/lessons`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: '1.1 Deep Dive into Fiber Nodes',
          content: 'Detailed explanation of work loops, unit of work, and alternate fiber trees.',
          durationMinutes: 20,
          isFreePreview: false
        });

      expect(res.status).toBe(201);
      expect(res.body.data.lesson.title).toBe('1.1 Deep Dive into Fiber Nodes');
      createdLessonId = res.body.data.lesson._id;
    });

    it('should allow instructor to publish the course', async () => {
      const res = await request(app)
        .patch(`/api/courses/${createdCourseId}/publish`)
        .set('Authorization', `Bearer ${instructorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.course.status).toBe('published');
    });

    it('should list the course in the public course catalog', async () => {
      const res = await request(app).get('/api/courses');
      expect(res.status).toBe(200);
      const found = res.body.data.find((c) => c._id === createdCourseId);
      expect(found).toBeDefined();
      expect(found.moduleCount).toBe(1);
      expect(found.lessonCount).toBe(1);
    });
  });

  // 3. Enrollment & Progress Calculation Tests
  describe('Phase 3: Enrollment & Dynamic Progress Tracking', () => {
    it('should allow student to enroll in the published course', async () => {
      const res = await request(app)
        .post(`/api/courses/${createdCourseId}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(201);
      expect(res.body.data.enrollment.status).toBe('active');
    });

    it('should reject duplicate enrollment by the same student', async () => {
      const res = await request(app)
        .post(`/api/courses/${createdCourseId}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(409);
    });

    it('should calculate 0% progress initially for newly enrolled student', async () => {
      const res = await request(app)
        .get(`/api/progress/${createdCourseId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.progress.percentage).toBe(0);
      expect(res.body.data.totalLessons).toBe(1);
    });

    it('should mark lesson complete and dynamically update progress to 100%', async () => {
      const res = await request(app)
        .post(`/api/progress/${createdCourseId}/lessons/${createdLessonId}/toggle`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.isCompleted).toBe(true);
      expect(res.body.data.percentage).toBe(100);
      expect(res.body.data.completedCount).toBe(1);
    });

    it('should toggle lesson back to incomplete and update progress to 0%', async () => {
      const res = await request(app)
        .post(`/api/progress/${createdCourseId}/lessons/${createdLessonId}/toggle`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.isCompleted).toBe(false);
      expect(res.body.data.percentage).toBe(0);
    });
  });

  // 4. Assignment Submission & Evaluation Tests
  describe('Phase 4: Assignment Submission & Instructor Evaluation', () => {
    it('should allow instructor to create an assignment', async () => {
      const res = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          courseId: createdCourseId,
          moduleId: createdModuleId,
          title: 'Implement Custom Concurrent Queue',
          description: 'Construct a prioritized task scheduler adhering to cooperative multitasking.',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          maxMarks: 100
        });

      expect(res.status).toBe(201);
      expect(res.body.data.assignment.title).toBe('Implement Custom Concurrent Queue');
      createdAssignmentId = res.body.data.assignment._id;
    });

    it('should allow student to submit an assignment', async () => {
      const res = await request(app)
        .post(`/api/assignments/${createdAssignmentId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          content: 'Here is my implementation using a min-heap binary priority queue with task slicing.'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.submission.status).toBe('submitted');
      expect(res.body.data.submission.isLate).toBe(false);
      createdSubmissionId = res.body.data.submission._id;
    });

    it('should allow instructor to evaluate and grade submission', async () => {
      const res = await request(app)
        .patch(`/api/submissions/${createdSubmissionId}/evaluate`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          marksAwarded: 95,
          feedback: 'Impressive time complexity optimization and clear documentation.'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.submission.status).toBe('graded');
      expect(res.body.data.submission.marksAwarded).toBe(95);
      expect(res.body.data.submission.feedback).toBe(
        'Impressive time complexity optimization and clear documentation.'
      );
    });

    it('should reject marks exceeding maximum allowed marks', async () => {
      const res = await request(app)
        .patch(`/api/submissions/${createdSubmissionId}/evaluate`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          marksAwarded: 150, // max is 100
          feedback: 'Excess marks test'
        });

      expect(res.status).toBe(400);
    });
  });

  // 5. Quiz Creation & Automatic Scoring Tests
  describe('Phase 5: Quiz Creation & Automatic Scoring', () => {
    it('should allow instructor to create a quiz and add questions', async () => {
      const quizRes = await request(app)
        .post('/api/quizzes')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          courseId: createdCourseId,
          title: 'React Reconciliation Quiz',
          durationMinutes: 10,
          passingScore: 50
        });

      expect(quizRes.status).toBe(201);
      createdQuizId = quizRes.body.data.quiz._id;

      // Add Question 1 (Correct answer is option index 1)
      const q1Res = await request(app)
        .post(`/api/quizzes/${createdQuizId}/questions`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          questionText: 'What algorithm does React use for reconciliation?',
          options: ['Binary Search', 'Heuristic O(n) Algorithm', 'Quicksort', 'Depth First Dijkstra'],
          correctAnswerIndex: 1,
          marks: 2,
          explanation: 'React implements a heuristic O(n) diffing algorithm based on element types and keys.'
        });

      expect(q1Res.status).toBe(201);
      question1Id = q1Res.body.data.question._id;

      // Add Question 2 (Correct answer is option index 0)
      const q2Res = await request(app)
        .post(`/api/quizzes/${createdQuizId}/questions`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          questionText: 'Why should keys in React lists be stable and unique?',
          options: [
            'To preserve component state across re-renders and identity matches',
            'To automatically sort the array alphabetically',
            'To bypass HTML5 DOM parsing',
            'To reduce CSS bundle size'
          ],
          correctAnswerIndex: 0,
          marks: 2,
          explanation: 'Stable keys allow React to identify which items have changed, been added, or removed.'
        });

      expect(q2Res.status).toBe(201);
    });

    it('should strip correct answers when student fetches the quiz', async () => {
      const res = await request(app)
        .get(`/api/quizzes/${createdQuizId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.questions.length).toBe(2);
      expect(res.body.data.questions[0].correctAnswerIndex).toBeUndefined();
      expect(res.body.data.questions[0].explanation).toBeUndefined();
    });

    it('should automatically score student attempt on the server', async () => {
      // Student answers Question 1 correctly (index 1), but leaves Q2 unanswered/wrong
      const res = await request(app)
        .post(`/api/quizzes/${createdQuizId}/attempt`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          answers: [
            { questionId: question1Id, selectedOptionIndex: 1 }
          ]
        });

      expect(res.status).toBe(201);
      // Total marks: 2 + 2 = 4. Score: 2. Percentage: 50%. Passing: 50% -> passed: true
      expect(res.body.data.score).toBe(2);
      expect(res.body.data.totalMarks).toBe(4);
      expect(res.body.data.percentage).toBe(50);
      expect(res.body.data.passed).toBe(true);
    });
  });
});
