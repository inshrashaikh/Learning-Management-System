# LearnSphere LMS — Functional Requirements Specification

## 1. Authentication & Session Module (FR-AUTH)
- **FR-AUTH-01 (Registration)**: The system shall allow users to register with name, unique email, password (min 6 characters), and role selection (`student`, `instructor`).
- **FR-AUTH-02 (Password Hashing)**: All passwords must be salted and hashed with `bcryptjs` (work factor 10) prior to database persistence.
- **FR-AUTH-03 (Token Generation)**: Upon successful authentication, the system shall issue a JSON Web Token signed with a 256-bit secret and set it in a secure, httpOnly, sameSite cookie.
- **FR-AUTH-04 (Role-Based Access Control)**: Middleware must inspect `req.user.role` on all protected endpoints, returning `403 Forbidden` if unauthorized.
- **FR-AUTH-05 (Session Invalidation)**: Calling `/api/auth/logout` must clear the authentication cookie and invalidate client-side session state.

## 2. Course & Curriculum Module (FR-CRS)
- **FR-CRS-01 (Course Creation)**: Instructors and admins can create courses with title, category, difficulty, duration, and overview.
- **FR-CRS-02 (Hierarchical Curriculum)**: Courses contain ordered Modules (`Module.order`), which contain ordered Lessons (`Lesson.order`).
- **FR-CRS-03 (Public Catalog Filtering)**: Unauthenticated and authenticated users can search courses by keyword, category, difficulty, and sort order.
- **FR-CRS-04 (Publishing State)**: Only published courses (`status: 'published'`) shall appear in the public catalog or permit student enrollments.

## 3. Enrollment & Progress Engine Module (FR-ENR)
- **FR-ENR-01 (One-Click Enrollment)**: Registered students can enroll in any published course.
- **FR-ENR-02 (Duplicate Prevention)**: Compound unique indexing (`{ studentId: 1, courseId: 1 }`) prevents double-enrollment, returning `409 Conflict`.
- **FR-ENR-03 (Dynamic Progress Calculation)**: Course progress is calculated as:
  $$\text{Progress \%} = \min\left(100, \left\lfloor \frac{\text{Completed Lessons}}{\text{Total Course Lessons}} \times 100 \right\rfloor\right)$$
- **FR-ENR-04 (Milestone Toggling)**: Students can toggle lesson completion on or off, immediately triggering progress recalculation.

## 4. Assignment & Submission Module (FR-ASN)
- **FR-ASN-01 (Assignment Authoring)**: Instructors can create assignments bound to a course/module, defining instructions, due date, and maximum marks.
- **FR-ASN-02 (Deliverable Submission)**: Enrolled students can submit written text solutions or repository artifact URLs.
- **FR-ASN-03 (Late Detection)**: If $\text{submission timestamp} > \text{assignment due date}$, the system automatically flags the submission with `isLate: true`.
- **FR-ASN-04 (Grading & Evaluation)**: Instructors award marks ($\le \text{maxMarks}$) and provide qualitative text feedback.

## 5. Quiz & Assessment Module (FR-QZ)
- **FR-QZ-01 (Quiz Structure)**: Instructors create quizzes with multiple choice questions, each having 4 options, a correct answer index (0..3), and point values.
- **FR-QZ-02 (Answer Sanitization)**: The API must strip `correctAnswerIndex` and `explanation` from questions when students fetch an active quiz.
- **FR-QZ-03 (Server Scoring)**: Quiz attempts submitted by students are evaluated strictly on the backend, generating score, percentage, and pass/fail state based on `passingScore`.
- **FR-QZ-04 (Scorecard & Review)**: Post-submission, students receive their scorecard along with question explanations.

## 6. Notification & Governance Module (FR-SYS)
- **FR-SYS-01 (Event Dispatch)**: The system automatically generates in-app notifications for: new assignment posted, assignment graded, enrollment confirmed, and course updates.
- **FR-SYS-02 (Admin Telemetry)**: Admins can view platform metrics (total users, active enrollments, course counts) and toggle user account status (`isActive`).
