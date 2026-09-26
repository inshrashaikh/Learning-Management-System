const request = require('supertest');
const mongoose = require('mongoose');
const app = require('/home/mustafa-kde/Documents/Learning-Management-System/backend/src/app');
const User = require('/home/mustafa-kde/Documents/Learning-Management-System/backend/src/models/User');
const Course = require('/home/mustafa-kde/Documents/Learning-Management-System/backend/src/models/Course');
const Enrollment = require('/home/mustafa-kde/Documents/Learning-Management-System/backend/src/models/Enrollment');

async function runMatrix() {
  await mongoose.connect('mongodb://127.0.0.1:27017/learnsphere');
  console.log('Connected to MongoDB for Test Matrix verification.\n');

  const results = [];
  function assert(title, condition, detail = '') {
    results.push({ title, pass: !!condition, detail });
    console.log(`${condition ? '✅ [PASS]' : '❌ [FAIL]'} ${title}${detail ? ' — ' + detail : ''}`);
  }

  // ==========================================
  // AUTHENTICATION MATRIX
  // ==========================================
  console.log('--- AUTHENTICATION TESTS ---');

  // 1. Default Admin login
  const adminRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@learnsphere.com', password: 'Password123!' });
  assert('Default Admin login works', adminRes.status === 200 && adminRes.body.data?.user?.role === 'admin', `status: ${adminRes.status}`);
  const adminToken = adminRes.body.data?.token;

  // 2. Default Instructor login
  const instRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'instructor@learnsphere.com', password: 'Password123!' });
  assert('Default Instructor login works', instRes.status === 200 && instRes.body.data?.user?.role === 'instructor', `status: ${instRes.status}`);
  const instructorToken = instRes.body.data?.token;

  // 3. Default Student login
  const studentRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'student@learnsphere.com', password: 'Password123!' });
  assert('Default Student login works', studentRes.status === 200 && studentRes.body.data?.user?.role === 'student', `status: ${studentRes.status}`);
  const studentToken = studentRes.body.data?.token;

  // 4. Invalid credentials correctly fail
  const badLogin1 = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@learnsphere.com', password: 'WrongPassword!' });
  assert('Invalid credentials correctly fail (wrong password)', badLogin1.status === 401 && badLogin1.body.message === 'Invalid email or password.');

  const badLogin2 = await request(app)
    .post('/api/auth/login')
    .send({ email: 'nonexistent@learnsphere.com', password: 'Password123!' });
  assert('Invalid credentials correctly fail (nonexistent email)', badLogin2.status === 401 && badLogin2.body.message === 'Account not found with this email address.');

  // 5. Correct roles assigned
  assert('Correct role is assigned: admin', adminRes.body.data?.user?.role === 'admin');
  assert('Correct role is assigned: instructor', instRes.body.data?.user?.role === 'instructor');
  assert('Correct role is assigned: student', studentRes.body.data?.user?.role === 'student');

  // 6. Refresh preserves session via /auth/me
  const studentMe = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${studentToken}`);
  assert('Refresh preserves expected session (Student /auth/me)', studentMe.status === 200 && studentMe.body.data?.user?.email === 'student@learnsphere.com' && studentMe.body.data?.user?.id);

  const instMe = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${instructorToken}`);
  assert('Refresh preserves expected session (Instructor /auth/me)', instMe.status === 200 && instMe.body.data?.user?.email === 'instructor@learnsphere.com' && instMe.body.data?.user?.id);

  const adminMe = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${adminToken}`);
  assert('Refresh preserves expected session (Admin /auth/me)', adminMe.status === 200 && adminMe.body.data?.user?.email === 'admin@learnsphere.com' && adminMe.body.data?.user?.id);


  // ==========================================
  // STUDENT MATRIX
  // ==========================================
  console.log('\n--- STUDENT TESTS ---');

  // 7. Student dashboard endpoints load
  const [enrRes, analyticsRes, assignRes] = await Promise.all([
    request(app).get('/api/enrollments/my-enrollments').set('Authorization', `Bearer ${studentToken}`),
    request(app).get('/api/progress/student/analytics').set('Authorization', `Bearer ${studentToken}`),
    request(app).get('/api/assignments/student/my-assignments').set('Authorization', `Bearer ${studentToken}`)
  ]);

  assert('Student dashboard loads', enrRes.status === 200 && analyticsRes.status === 200 && assignRes.status === 200);

  // 8. Enrolled courses appear
  const studentCourses = enrRes.body.data || [];
  assert('Enrolled courses appear', studentCourses.length >= 2, `Enrolled count: ${studentCourses.length}`);

  // 9. Course details appear
  const firstEnr = studentCourses[0];
  assert('Course details appear', firstEnr?.courseId?.title && firstEnr?.courseId?.instructor?.name && firstEnr?.courseCode, `Title: ${firstEnr?.courseId?.title}, Instructor: ${firstEnr?.courseId?.instructor?.name}, Code: ${firstEnr?.courseCode}`);

  // 10. Activities appear
  assert('Activities appear', firstEnr?.activities && typeof firstEnr.activities.lessonCount === 'number' && typeof firstEnr.activities.assignmentCount === 'number', `Lessons: ${firstEnr?.activities?.lessonCount}, Assignments: ${firstEnr?.activities?.assignmentCount}, Quizzes: ${firstEnr?.activities?.quizCount}`);

  // 11. Enrollment state is correct
  assert('Enrollment state is correct', firstEnr?.status === 'active' && typeof firstEnr.progress?.percentage === 'number');

  // 12. Student cannot access unauthorized admin/instructor features
  const studentAdminAttempt = await request(app)
    .get('/api/admin/stats')
    .set('Authorization', `Bearer ${studentToken}`);
  assert('Student cannot access unauthorized admin features (403)', studentAdminAttempt.status === 403);

  const studentInstAttempt = await request(app)
    .get('/api/courses/instructor/my-courses')
    .set('Authorization', `Bearer ${studentToken}`);
  assert('Student cannot access unauthorized instructor features (403)', studentInstAttempt.status === 403);


  // ==========================================
  // INSTRUCTOR MATRIX
  // ==========================================
  console.log('\n--- INSTRUCTOR TESTS ---');

  // 13. Instructor dashboard loads
  const instCoursesRes = await request(app)
    .get('/api/courses/instructor/my-courses')
    .set('Authorization', `Bearer ${instructorToken}`);
  assert('Instructor dashboard loads', instCoursesRes.status === 200);

  // 14. Instructor courses appear
  const instCourses = instCoursesRes.body.data || [];
  assert('Instructor courses appear', instCourses.length >= 2, `Courses taught: ${instCourses.length}`);

  // 15. Enrollment count appears
  const c1 = instCourses.find((c) => c.title.includes('Full-Stack Web Engineering'));
  assert('Enrollment count appears', c1 && typeof c1.studentCount === 'number' && c1.studentCount >= 2, `Course 1 studentCount: ${c1?.studentCount}`);

  // 16. Enrolled students appear
  assert('Enrolled students appear', c1 && Array.isArray(c1.enrolledStudents) && c1.enrolledStudents.length >= 2, `Enrolled count: ${c1?.enrolledStudents?.length}`);

  // 17. Only relevant students are shown
  const enrolledStudentNames = (c1?.enrolledStudents || []).map((s) => s.name);
  assert('Only relevant students are shown', enrolledStudentNames.includes('Jordan Taylor') && enrolledStudentNames.includes('Emma Watson'));

  // 18. Course activities appear
  assert('Course activities appear if already implemented', c1 && c1.moduleCount > 0 && c1.lessonCount > 0 && c1.assignmentCount > 0 && c1.quizCount > 0, `Modules: ${c1?.moduleCount}, Lessons: ${c1?.lessonCount}, Assignments: ${c1?.assignmentCount}, Quizzes: ${c1?.quizCount}`);


  // ==========================================
  // ADMIN MATRIX
  // ==========================================
  console.log('\n--- ADMIN TESTS ---');

  // 19. Admin dashboard loads
  const adminStatsRes = await request(app)
    .get('/api/admin/stats')
    .set('Authorization', `Bearer ${adminToken}`);
  assert('Admin dashboard loads', adminStatsRes.status === 200);

  const stats = adminStatsRes.body.data;
  // 20. Student count is correct
  assert('Student count is correct', stats?.totalStudents === 3, `totalStudents: ${stats?.totalStudents}`);

  // 21. Instructor count is correct
  assert('Instructor count is correct', stats?.totalInstructors === 2, `totalInstructors: ${stats?.totalInstructors}`);

  // 22. Course count is correct
  assert('Course count is correct', stats?.totalCourses === 4, `totalCourses: ${stats?.totalCourses}`);

  // 23. Enrollment count is correct
  assert('Enrollment count is correct', stats?.totalEnrollments === 6, `totalEnrollments: ${stats?.totalEnrollments}`);

  // 24. Recent/system-wide enrollment data appears
  assert('Recent/system-wide enrollment data appears', Array.isArray(stats?.recentEnrollments) && stats.recentEnrollments.length > 0 && stats.courseEnrollmentCounts?.length === 4, `recentEnrollments: ${stats?.recentEnrollments?.length}, courseEnrollmentCounts: ${stats?.courseEnrollmentCounts?.length}`);


  // ==========================================
  // END-TO-END LIFECYCLE MATRIX
  // ==========================================
  console.log('\n--- END-TO-END LIFECYCLE TESTS ---');

  // Pick Course 2 (taught by instructor 1), where student 1 is not yet enrolled
  const course2 = await Course.findOne({ title: /Modern Software Architecture/ });

  // Baseline check
  const priorEnrollment = await Enrollment.findOne({ studentId: studentRes.body.data.user.id, courseId: course2._id });
  if (priorEnrollment) {
    await Enrollment.deleteOne({ _id: priorEnrollment._id });
  }

  // Step 1: Student enrolls in Course 2
  const e2eEnrollRes = await request(app)
    .post(`/api/courses/${course2._id}/enroll`)
    .set('Authorization', `Bearer ${studentToken}`);
  assert('Student enrolls in course', e2eEnrollRes.status === 201, `Status: ${e2eEnrollRes.status}`);

  // Step 2: Student sees course in my-enrollments
  const e2eStudentCheck = await request(app)
    .get('/api/enrollments/my-enrollments')
    .set('Authorization', `Bearer ${studentToken}`);
  const hasCourse2 = (e2eStudentCheck.body.data || []).some((e) => e.courseId?._id.toString() === course2._id.toString());
  assert('Student sees course', hasCourse2, 'Course found in student enrollments');

  // Step 3: Instructor sees student in Course 2 roster
  const e2eInstCheck = await request(app)
    .get('/api/courses/instructor/my-courses')
    .set('Authorization', `Bearer ${instructorToken}`);
  const instCourse2 = (e2eInstCheck.body.data || []).find((c) => c._id.toString() === course2._id.toString());
  const instructorSeesStudent = (instCourse2?.enrolledStudents || []).some((s) => s.email === 'student@learnsphere.com');
  assert('Instructor sees student', instructorSeesStudent, `Student found in Instructor's Course 2 roster: ${instructorSeesStudent}`);

  // Step 4: Admin sees enrollment in stats
  const e2eAdminCheck = await request(app)
    .get('/api/admin/stats')
    .set('Authorization', `Bearer ${adminToken}`);
  const adminCourse2Density = (e2eAdminCheck.body.data?.courseEnrollmentCounts || []).find((c) => c._id.toString() === course2._id.toString());
  assert('Admin sees enrollment', adminCourse2Density && adminCourse2Density.enrollmentCount >= 2, `Admin Course 2 count: ${adminCourse2Density?.enrollmentCount}`);

  console.log('\n==========================================');
  const allPassed = results.every((r) => r.pass);
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${results.filter((r) => r.pass).length} | FAILED: ${results.filter((r) => !r.pass).length}`);
  console.log(allPassed ? 'ALL TEST MATRIX ITEMS PASSED! 🎉' : 'SOME TESTS FAILED!');
  console.log('==========================================\n');

  await mongoose.disconnect();
}

runMatrix().catch(console.error);
