# LearnSphere LMS — Risk Analysis & OWASP Mitigations

## 1. Technical & Architecture Risks

| Risk Identifier | Severity | Impact Description | Mitigation Strategy Implemented |
| :--- | :--- | :--- | :--- |
| **R-01: Insecure Client State** | High | Relying on frontend role checks could allow malicious requests to escalate privileges. | Enforced RBAC middleware on all backend endpoints; client-supplied role values are discarded during registration. |
| **R-02: Credential Exposure** | Critical | Plaintext or reversible passwords expose accounts upon database compromise. | Utilized `bcryptjs` with salt rounds = 10; schema marks password with `select: false`. |
| **R-03: Token Theft via XSS** | High | Storing JWT tokens in browser `localStorage` allows malicious scripts to extract bearer tokens. | Implemented `httpOnly`, `sameSite: 'lax'`, and production `secure` cookie flags. |
| **R-04: Quiz Cheat Vulnerability** | High | Exposing correct answers in client DOM or JSON payload lets students cheat on assessments. | Sanitized Question schema queries on student attempts, stripping `correctAnswerIndex` and `explanation`. |
| **R-05: Double Enrollment Duplication** | Medium | Concurrent clicks on "Enroll Now" could create duplicate enrollment records and skew progress. | Enforced MongoDB compound unique index `{ studentId: 1, courseId: 1 }`. |

## 2. Operational & Dependency Risks
- **Kernel Incompatibility**: Local MongoDB service failed to run natively on Linux kernel 6.19+.
  - *Mitigation*: Isolated MongoDB inside an official Docker container (`mongo:7`), mapping port 27017 with persistent local volume storage.
