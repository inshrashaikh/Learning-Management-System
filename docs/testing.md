# LearnSphere LMS — Testing Strategy & Results

## 1. Automated Integration Test Strategy
The testing suite is executed using **Jest** and **Supertest** (`backend/tests/api.test.js`). Tests execute against a real MongoDB test database (`mongodb://127.0.0.1:27017/learnsphere_test`), verifying:
1. **Authentication & Authorization**: Registration, duplicate rejection, wrong passwords, role authorization barriers.
2. **Curriculum Lifecycle**: Course creation, module hierarchy, lesson authoring, publication toggles.
3. **Enrollment & Progress Calculation**: Enrollment creation, duplicate conflict rejection (409), dynamic percentage recalculation.
4. **Assignment & Grading**: Student submissions, late detection flag, instructor grade recording, rejection of scores exceeding maximum marks.
5. **Quiz Engine**: Question creation, student answer sanitization, server-side score and percentage computation.

## 2. Test Execution Results

```bash
$ npm test --prefix backend

PASS tests/api.test.js
  LearnSphere Full System Integration Tests
    Phase 1: Authentication & Authorization
      ✓ should register a new student account (263 ms)
      ✓ should reject registration with duplicate email (15 ms)
      ✓ should reject login with incorrect password (81 ms)
      ✓ should register and login an instructor (80 ms)
      ✓ should register and login an admin (129 ms)
      ✓ should forbid student from creating a course (Role Authorization) (10 ms)
      ✓ should forbid instructor from accessing admin endpoints (13 ms)
      ✓ should allow admin to access admin statistics (31 ms)
    Phase 2: Course & Curriculum Management
      ✓ should allow instructor to create a new course in draft mode (15 ms)
      ✓ should allow instructor to add a module to course (22 ms)
      ✓ should allow instructor to add a lesson to module (25 ms)
      ✓ should allow instructor to publish the course (16 ms)
      ✓ should list the course in the public course catalog (23 ms)
    Phase 3: Enrollment & Dynamic Progress Tracking
      ✓ should allow student to enroll in the published course (26 ms)
      ✓ should reject duplicate enrollment by the same student (15 ms)
      ✓ should calculate 0% progress initially for newly enrolled student (13 ms)
      ✓ should mark lesson complete and dynamically update progress to 100% (35 ms)
      ✓ should toggle lesson back to incomplete and update progress to 0% (30 ms)
    Phase 4: Assignment Submission & Instructor Evaluation
      ✓ should allow instructor to create an assignment (30 ms)
      ✓ should allow student to submit an assignment (26 ms)
      ✓ should allow instructor to evaluate and grade submission (21 ms)
      ✓ should reject marks exceeding maximum allowed marks (15 ms)
    Phase 5: Quiz Creation & Automatic Scoring
      ✓ should allow instructor to create a quiz and add questions (59 ms)
      ✓ should strip correct answers when student fetches the quiz (19 ms)
      ✓ should automatically score student attempt on the server (21 ms)

Test Suites: 1 passed, 1 total
Tests:       25 passed, 25 total
Snapshots:   0 total
Time:        1.699 s
```

## 3. Manual Verification Checklist
- [x] Backend Express API listening on port 5000 with CORS and `/api/health`.
- [x] Frontend React SPA running on port 5173 with proxy configuration.
- [x] Public Landing Page renders 10 sections with interactive LMS visual card.
- [x] One-click demo credentials for Student, Instructor, and Admin in `/login`.
- [x] Dynamic progress engine accurately recalculates percentages upon lesson toggles.
- [x] Submissions queue permits instructors to record marks and qualitative feedback.
- [x] Quizzes evaluate answers strictly server-side and produce instant scorecards.
