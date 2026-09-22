# LearnSphere — Enterprise-Grade Academic Learning Management System

LearnSphere is a modern, production-style Learning Management System (LMS) engineered for academic software engineering excellence. It provides role-based portals for **Students**, **Instructors**, and **Administrators**, featuring comprehensive course delivery, dynamic progress tracking, homework submissions and evaluations, automated multiple-choice testing, and platform governance.

---

## 🚀 Key Features

### 🎓 Student Experience

- **Public Discovery Catalog**: Full-text search, category filters, and difficulty badges.
- **One-Click Course Enrollment**: Instant enrollment with duplicate conflict protection.
- **Interactive Course Player**: Module/lesson syllabus sidebar, rich markdown lessons, video embeds, and resource downloads.
- **Dynamic Progress Engine**: Real-time progress percentage recalculation upon lesson completion milestones.
- **Assignment System**: Deliverable submission with text/URL attachments and automated late submission detection.
- **Interactive Quiz Runner**: Timed MCQ assessments with automatic server-side scoring and detailed scorecards.
- **Academic Gradebook**: Consolidated marks and qualitative faculty feedback.
- **Notification Center**: Real-time alerts for assignments, evaluation grades, and course announcements.

### 👨‍🏫 Instructor Hub

- **Teaching Dashboard**: Real-time metrics for authored courses, enrolled students, and pending evaluations.
- **Multi-Step Course Builder**: Wizard guiding course metadata, curriculum modules, lessons, and assignments.
- **Publish / Unpublish Controls**: Instantaneous visibility toggle for the public course catalog.
- **Submissions & Grading Queue**: Review submissions, award points, and record qualitative feedback.
- **Quiz & Question Authoring**: Construct 4-option MCQ assessments with custom point values and explanation keys.
- **Cohort Analytics**: Track student enrollment numbers and completion ratios per course.

### 👑 Administrator Governance

- **Platform Telemetry**: Holistic counts of users, students, faculty, courses, enrollments, and submissions.
- **Identity & Access Management**: Search and filter accounts, toggle user active/deactivated status.
- **Curriculum Quality Oversight**: Review course publication states and feature standout courses.
- **Audit Logs**: Complete log of student enrollments and system activity.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 18 & Vite
  - React Router v6 (Nested Layouts, Protected & Role-Based Routes)
  - Tailwind CSS (Curated Indigo/Slate/Emerald design system, Glassmorphism)
  - Lucide React Icons
  - Axios with Request/Response Interceptors

- **Backend**:
  - Node.js (v26) & Express.js
  - MongoDB 7 & Mongoose ODM
  - JSON Web Tokens (JWT) stored in secure `httpOnly` cookies
  - Zod Request Schema Validation
  - Multer for local/development file attachments
  - Morgan HTTP request logging

- **Testing & Tooling**:
  - Jest & Supertest Integration Test Suite (25 automated integration tests)
  - Docker & Docker Compose for full-stack local containerization

---

## 🔑 Demo Credentials

To evaluate the application across all roles, use these pre-seeded accounts:

| Role              | Email                        | Password       | Permissions                                                        |
| :---------------- | :--------------------------- | :------------- | :----------------------------------------------------------------- |
| **👑 Admin**      | `admin@learnsphere.com`      | `Password123!` | Full platform telemetry, user management, course governance        |
| **👨‍🏫 Instructor** | `instructor@learnsphere.com` | `Password123!` | Course authoring, module/lesson builder, submission grading        |
| **🎓 Student**    | `student@learnsphere.com`    | `Password123!` | Course enrollment, learning player, assignment submission, quizzes |

> 💡 **Tip**: The login page at `/login` includes one-click demo buttons that pre-fill these credentials instantly.

---

## 📂 Project Structure

```
Learning-Management-System/
├── backend/
│   ├── src/
│   │   ├── config/          # db.js, environment configuration
│   │   ├── controllers/     # auth, course, module, lesson, enrollment, assignment, submission, quiz, progress, notification, admin
│   │   ├── middleware/      # auth (JWT), role (RBAC), validate (Zod), upload (Multer), errorHandler
│   │   ├── models/          # User, Course, Module, Lesson, Enrollment, Assignment, Submission, Quiz, Question, QuizAttempt, Progress, Notification
│   │   ├── routes/          # RESTful endpoint routers
│   │   ├── services/        # progressService, notificationService
│   │   ├── utils/           # apiResponse, appError, seedData.js
│   │   ├── validators/      # Zod validation schemas
│   │   ├── app.js           # Express app definition & middleware
│   │   └── server.js        # Server listener
│   ├── tests/               # Jest + Supertest integration tests (api.test.js)
│   ├── uploads/             # Static file uploads
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Common UI primitives (Button, Card, Badge, Modal, ProgressBar, LoadingSpinner, EmptyState)
│   │   ├── context/         # AuthContext, ToastContext
│   │   ├── layouts/         # PublicLayout, StudentLayout, InstructorLayout, AdminLayout
│   │   ├── pages/
│   │   │   ├── public/      # LandingPage, CourseCatalog, CourseDetail, Login, Register, ForgotPassword
│   │   │   ├── student/     # StudentDashboard, MyCourses, CourseLearn, StudentAssignments, StudentQuizzes, QuizRunner, StudentResults, StudentProgress, StudentNotifications, StudentProfile
│   │   │   ├── instructor/  # InstructorDashboard, CourseList, CourseBuilder, SubmissionsReview, InstructorQuizzes, InstructorAnalytics, InstructorProfile
│   │   │   └── admin/       # AdminDashboard, UserManagement, CourseManagement, EnrollmentMonitoring, SystemSettings
│   │   ├── routes/          # RouteGuards (ProtectedRoute, RoleBasedRoute)
│   │   ├── services/        # Axios API client (api.js)
│   │   ├── App.jsx          # Route hierarchy
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── docs/                    # Complete Software Engineering Academic Deliverables
│   ├── requirements.md
│   ├── functional-requirements.md
│   ├── non-functional-requirements.md
│   ├── system-architecture.md
│   ├── database-design.md
│   ├── api-documentation.md
│   ├── testing.md
│   ├── risk-analysis.md
│   └── future-scope.md
├── docker-compose.yml       # Frontend, backend, and MongoDB orchestration
├── TODO.md                  # Implementation roadmap & status
└── README.md                # Comprehensive documentation
```

---

## ⚡ Quick Start & Setup Instructions

### 1. Prerequisites

- **Docker Engine** with the **Docker Compose** plugin

### 2. Start the Full Stack with Docker

From the repository root:

```bash
docker compose up -d --build
```

This starts:

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- MongoDB: `localhost:27017` with persistent volume storage

Check service status and logs:

```bash
docker compose ps
docker compose logs -f backend frontend
```

To populate the database with demo users and courses:

```bash
docker compose exec backend npm run seed
```

To stop the stack while keeping MongoDB data:

```bash
docker compose down
```

To stop it and delete the MongoDB volume:

```bash
docker compose down -v
```

### 3. Run Without Docker

If you prefer local Node.js processes, install **Node.js v18 or higher** and run MongoDB on `localhost:27017`:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
npm run dev
```

This starts the backend and frontend together. To seed data locally, run `npm run seed` from the repository root.

---

## 🧪 Automated Testing

Execute the complete backend integration test suite:

```bash
cd backend
npm test
```

This runs 25 automated integration tests covering authentication, RBAC authorization, course authoring, duplicate enrollment rejection, dynamic progress calculation, assignment grading, and server-side quiz scoring.

---

## 📚 Academic Software Engineering Deliverables

Comprehensive project documentation is maintained in the [`docs/`](./docs) directory:

- [Requirements Specification](./docs/requirements.md)
- [Functional Requirements](./docs/functional-requirements.md)
- [Non-Functional Requirements](./docs/non-functional-requirements.md)
- [System Architecture & Dataflow](./docs/system-architecture.md)
- [Database Design & ER Diagram](./docs/database-design.md)
- [RESTful API Documentation](./docs/api-documentation.md)
- [Testing Strategy & Automated Results](./docs/testing.md)
- [Risk Analysis & Security Mitigations](./docs/risk-analysis.md)
- [Post-MVP Future Scope](./docs/future-scope.md)
