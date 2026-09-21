# LearnSphere LMS — Requirements Specification Document

## 1. Project Overview & Executive Summary
LearnSphere is an enterprise-grade academic Learning Management System (LMS) engineered to solve the fragmentation of modern digital learning environments. Educational institutions often face disparate solutions for course catalog discovery, interactive study modules, homework assignment submissions, automated multiple-choice testing, and qualitative academic feedback. LearnSphere centralizes these critical capabilities into a single, unified, role-based platform designed with clean Software Engineering principles, strict authorization barriers, and robust validation.

## 2. Stakeholders & System Actors
The system defines three core human actors and external platform stakeholders:

| Actor | Description | Permissions & Responsibilities |
| :--- | :--- | :--- |
| **Student** | Active enrolled learner | Discovers courses, enrolls, navigates curriculum lessons, completes modules, uploads assignment deliverables, takes timed quizzes, tracks real-time progress, and reviews gradebook reports. |
| **Instructor** | Faculty / Teaching Staff | Authors courses, structures modules and lessons, sets due dates, publishes assignments, reviews submission queues, enters qualitative feedback and marks, and creates MCQ quiz assessments. |
| **Administrator** | Institutional Operations Officer | Oversees entire platform telemetry, monitors enrollment volumes, governs course publication status, manages user accounts (activate/deactivate), and audits compliance. |

## 3. Scope & System Boundaries
- **In Scope (Current MVP)**:
  - Role-based authentication via JWT in secure httpOnly cookies.
  - Public discovery catalog with real-time text search, category filtering, and difficulty classification.
  - Multi-step curriculum builder for instructors.
  - Interactive Course Player with collapsible syllabus tree, video player embeds, and downloadable resources.
  - Dynamic progress tracking engine computing real-time percentages based on completed lesson counts.
  - Assignment submission engine supporting written responses and external artifact links with automated late submission detection.
  - Automated MCQ quiz runner with server-side scoring, time limits, and question explanation breakdowns.
  - Centralized notification center for academic alerts (new assignments, grades released, enrollment confirmations).
  - Admin governance portal for user and curriculum oversight.
  - Complete automated test suite using Jest and Supertest.

- **Out of Scope (Post-MVP Roadmap)**:
  - Third-party payment gateway integration (Stripe/PayPal).
  - WebRTC live video streaming classrooms.
  - Automated PDF certificate generation.
  - Discussion forums and peer review workflows.

## 4. User Stories & Acceptance Criteria

### 4.1 Student Stories
- **US-01**: *As a student, I want to search and filter published courses by domain and difficulty, so that I can discover curriculums aligned with my academic goals.*
  - **Acceptance Criteria**: Search term matches title/description; category and difficulty filters apply instantly; unpublished draft courses are excluded from the public catalog.
- **US-02**: *As a student, I want to track my lesson completion dynamically, so that I can see accurate percentage progress across my active courses.*
  - **Acceptance Criteria**: Toggling a lesson as complete recalculates total progress on the server (`completed ÷ total × 100`) and immediately reflects on the player sidebar and student dashboard.
- **US-03**: *As a student, I want to take timed MCQ quizzes and receive instantaneous scores, so that I can validate my conceptual comprehension.*
  - **Acceptance Criteria**: Quiz questions must not disclose correct answers before submission; answers are evaluated server-side; instant scorecard displays points, percentage, and pass/fail benchmark.

### 4.2 Instructor Stories
- **US-04**: *As an instructor, I want a structured course authoring flow, so that I can configure course metadata, modules, and lessons without overwhelming forms.*
  - **Acceptance Criteria**: Multi-step wizard guides the instructor through metadata, curriculum, assignments, and publishing.
- **US-05**: *As an instructor, I want a centralized grading queue, so that I can inspect student submissions and assign marks with qualitative feedback.*
  - **Acceptance Criteria**: Submissions queue highlights pending vs. graded items; late submissions are clearly badged; marks cannot exceed assignment maximum; feedback is saved and student is alerted.

### 4.3 Administrator Stories
- **US-06**: *As an administrator, I want to view platform-wide telemetry, so that I can monitor student adoption and course publication rates.*
  - **Acceptance Criteria**: Overview dashboard displays live counts of total users, students, instructors, courses, active enrollments, and submissions.
