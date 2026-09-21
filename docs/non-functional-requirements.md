# LearnSphere LMS — Non-Functional Requirements Specification

## 1. Security & Data Protection (NFR-SEC)
- **NFR-SEC-01 (Credential Encryption)**: User passwords must never be stored in plaintext. Password hashing must utilize `bcryptjs` with a cost factor of 10.
- **NFR-SEC-02 (XSS & Session Defense)**: JWT tokens are delivered through `httpOnly`, `sameSite: 'lax'` cookies to prevent client-side JavaScript theft via Cross-Site Scripting (XSS).
- **NFR-SEC-03 (Input Sanitization & Schema Validation)**: All incoming request payloads must be strictly validated against Zod schemas at the middleware boundary before controller execution.
- **NFR-SEC-04 (Role-Based Access Enforcement)**: Backend route handlers must enforce role authorization independently of frontend UI state. The server must reject unauthorized requests with HTTP `403 Forbidden`.
- **NFR-SEC-05 (Information Disclosure)**: The User model must remove password hashes from JSON serialization (`toJSON` transform). Error handlers in production mode must omit raw stack traces.

## 2. Performance & Scalability (NFR-PERF)
- **NFR-PERF-01 (API Latency)**: Core read and write endpoints (course retrieval, progress updates, assignment submissions) must complete under 200ms under standard operational loads.
- **NFR-PERF-02 (Database Indexing)**: High-cardinality queries must leverage indexes:
  - Text search index on `Course.title` and `Course.description`.
  - Compound unique index on `Enrollment { studentId: 1, courseId: 1 }`.
  - Compound unique index on `Submission { assignmentId: 1, studentId: 1 }`.
  - Compound unique index on `Progress { studentId: 1, courseId: 1 }`.
- **NFR-PERF-03 (Asset Compression)**: Production frontend bundles are minimized with Vite/Rolldown, generating static chunks under 550KB with Gzip compression.

## 3. Reliability, Availability & Error Handling (NFR-REL)
- **NFR-REL-01 (Graceful Error Degradation)**: The system utilizes a centralized Express error handling pipeline with custom operational `AppError` mapping for duplicate keys (409), validation errors (400), cast errors (400), and unhandled server errors (500).
- **NFR-REL-02 (Data Integrity)**: Cascade deletion handlers ensure that deleting a course cleans up associated modules, lessons, and enrollment records.

## 4. Usability & Accessibility (NFR-UX)
- **NFR-UX-01 (Responsive Design)**: The interface must render seamlessly across desktop (1440px+), laptop (1024px), tablet (768px), and mobile (375px) displays using responsive Tailwind breakpoints.
- **NFR-UX-02 (Zero Blank Screens)**: Every data-driven page must implement distinct visual states for Loading (spinners/skeletons), Error (descriptive alert banners), Empty State (illustrations with call-to-actions), and Success (toasts).
- **NFR-UX-03 (Accessible Contrast)**: Typography and UI controls meet WCAG AA contrast standards (minimum 4.5:1 for normal text).
