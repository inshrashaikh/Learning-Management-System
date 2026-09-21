# LearnSphere LMS — RESTful API Specification

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Register User
- **Method**: `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "Jordan Taylor",
    "email": "student@learnsphere.com",
    "password": "Password123!",
    "role": "student"
  }
  ```
- **Responses**:
  - `201 Created`: Sets `jwt` httpOnly cookie and returns user profile.
  - `400 Bad Request`: Validation failure.
  - `409 Conflict`: Email already registered.

### 1.2 Login User
- **Method**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "student@learnsphere.com",
    "password": "Password123!"
  }
  ```
- **Responses**:
  - `200 OK`: Sets `jwt` cookie, returns user object and fallback token.
  - `401 Unauthorized`: Invalid credentials.

### 1.3 Get Current User
- **Method**: `GET /api/auth/me`
- **Access**: Protected (`protect`)
- **Responses**:
  - `200 OK`: Returns authenticated user profile.

---

## 2. Course & Curriculum Endpoints (`/api/courses`)

### 2.1 Get Public Courses
- **Method**: `GET /api/courses`
- **Query Parameters**: `search`, `category`, `difficulty`, `sort`, `page`, `limit`
- **Responses**: `200 OK` with paginated courses list and module/lesson counts.

### 2.2 Get Course Details
- **Method**: `GET /api/courses/:id`
- **Access**: Public (with optional session detection for `isEnrolled` flag).
- **Responses**: `200 OK` with populated modules, lessons, and instructor details.

### 2.3 Create Course
- **Method**: `POST /api/courses`
- **Access**: Protected (`authorize('instructor', 'admin')`)
- **Responses**: `201 Created` with new course document.

---

## 3. Enrollment & Progress Endpoints (`/api/enrollments`, `/api/progress`)

### 3.1 Enroll in Course
- **Method**: `POST /api/courses/:courseId/enroll`
- **Access**: Protected (`authorize('student', 'admin')`)
- **Responses**: `201 Created` with enrollment record, initial progress doc, and notification.

### 3.2 Get Course Progress
- **Method**: `GET /api/progress/:courseId`
- **Access**: Protected
- **Responses**: `200 OK` with dynamic percentage and completed lesson IDs.

### 3.3 Toggle Lesson Completion
- **Method**: `POST /api/progress/:courseId/lessons/:lessonId/toggle`
- **Access**: Protected (`authorize('student', 'admin')`)
- **Responses**: `200 OK` with recalculated completion percentage.

---

## 4. Assignment & Quiz Endpoints (`/api/assignments`, `/api/quizzes`)

### 4.1 Submit Assignment
- **Method**: `POST /api/assignments/:id/submit`
- **Access**: Protected (`student`, `admin`)
- **Request Body**: `{ "content": "Text", "attachmentUrl": "https://..." }`
- **Responses**: `201 Created` with late submission status.

### 4.2 Evaluate Submission
- **Method**: `PATCH /api/submissions/:id/evaluate`
- **Access**: Protected (`instructor`, `admin`)
- **Request Body**: `{ "marksAwarded": 95, "feedback": "Great work." }`
- **Responses**: `200 OK` with updated status: `'graded'`.

### 4.3 Attempt Quiz
- **Method**: `POST /api/quizzes/:id/attempt`
- **Access**: Protected (`student`, `admin`)
- **Request Body**: `{ "answers": [{ "questionId": "...", "selectedOptionIndex": 1 }] }`
- **Responses**: `201 Created` with server-evaluated score, percentage, and passed boolean.
