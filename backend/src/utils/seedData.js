require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const Progress = require('../models/Progress');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');
const Notification = require('../models/Notification');

/**
 * Core seeding logic — can be called when Mongoose is already connected.
 * Exported for use by server.js auto-seed.
 */
const runSeed = async () => {
  try {
    // Clear existing data cleanly
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Module.deleteMany({}),
      Lesson.deleteMany({}),
      Enrollment.deleteMany({}),
      Progress.deleteMany({}),
      Assignment.deleteMany({}),
      Submission.deleteMany({}),
      Quiz.deleteMany({}),
      Question.deleteMany({}),
      QuizAttempt.deleteMany({}),
      Notification.deleteMany({})
    ]);
    console.log('[Seed] Cleared existing database records.');

    // 1. Create Users
    const admin = await User.create({
      name: 'Eleanor Vance (Admin)',
      email: 'admin@learnsphere.com',
      password: 'Password123!',
      role: 'admin',
      headline: 'Platform Operations Administrator',
      bio: 'Administrator responsible for curriculum quality, platform compliance, and institutional governance.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'
    });

    const instructor1 = await User.create({
      name: 'Dr. Sarah Chen',
      email: 'instructor@learnsphere.com',
      password: 'Password123!',
      role: 'instructor',
      headline: 'Lead Software Architect & Distinguished Fellow',
      bio: 'Former Staff Engineer at Google with 14+ years designing fault-tolerant distributed web systems.',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80'
    });

    const instructor2 = await User.create({
      name: 'Alex Rivera',
      email: 'alex.rivera@learnsphere.com',
      password: 'Password123!',
      role: 'instructor',
      headline: 'DevOps & Distributed Systems Specialist',
      bio: 'Cloud Architect with certifications across AWS, GCP, and Kubernetes. Passionate about automated pipelines.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
    });

    const student1 = await User.create({
      name: 'Jordan Taylor',
      email: 'student@learnsphere.com',
      password: 'Password123!',
      role: 'student',
      headline: 'Computer Science Undergraduate',
      bio: 'Junior CS student specializing in full-stack web applications, distributed algorithms, and cloud infrastructure.',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80'
    });

    const student2 = await User.create({
      name: 'Emma Watson',
      email: 'emma.watson@learnsphere.com',
      password: 'Password123!',
      role: 'student',
      headline: 'Software Engineering Major',
      bio: 'Passionate about frontend aesthetics, accessible UI design, and responsive design systems.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80'
    });

    const student3 = await User.create({
      name: 'Liam Smith',
      email: 'liam.smith@learnsphere.com',
      password: 'Password123!',
      role: 'student',
      headline: 'Data Engineering Enthusiast',
      bio: 'Focused on high-performance backend pipelines and scalable microservices.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
    });

    console.log('[Seed] Users seeded successfully.');

    // 2. Create Courses
    const course1 = await Course.create({
      title: 'Full-Stack Web Engineering with React & Node.js',
      slug: 'full-stack-web-engineering-react-nodejs',
      shortDescription: 'Master scalable web architectures, REST APIs, state management, and modern component systems.',
      description: `### Course Overview
This comprehensive course takes you from foundational client-server concepts to constructing enterprise-grade full-stack web applications. 

You will master:
- Modern component-driven React architecture and custom hooks
- Express.js modular routing, middleware pipelines, and validation
- Schema design and indexing strategies with MongoDB and Mongoose
- Security best practices: JWT cookies, CORS, rate limiting, and input sanitization
- Automated integration testing and CI/CD deployment pipelines

Each module is paired with practical assignments, interactive code quizzes, and capstone checkpoints.`,
      instructor: instructor1._id,
      category: 'Web Development',
      difficulty: 'intermediate',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
      estimatedDuration: '8 Weeks',
      status: 'published',
      isFeatured: true,
      learningOutcomes: [
        'Architect end-to-end full-stack web applications from scratch',
        'Implement bulletproof JWT authentication with httpOnly cookie storage',
        'Design efficient MongoDB database schemas with Mongoose models',
        'Build and consume modular RESTful APIs with error boundaries',
        'Write integration test suites with Jest and Supertest'
      ],
      prerequisites: [
        'Solid foundational understanding of JavaScript (ES6+)',
        'Basic familiarity with HTML, CSS, and terminal commands'
      ]
    });

    const course2 = await Course.create({
      title: 'Modern Software Architecture & Microservices',
      slug: 'modern-software-architecture-microservices',
      shortDescription: 'Design decoupled, fault-tolerant distributed systems using domain-driven design and event streams.',
      description: `### Course Overview
Explore how large-scale technology companies structure high-availability software. We dive deep into domain-driven design (DDD), asynchronous message brokers, API gateways, database decomposition patterns, and circuit breakers.`,
      instructor: instructor1._id,
      category: 'Software Architecture',
      difficulty: 'advanced',
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
      estimatedDuration: '10 Weeks',
      status: 'published',
      isFeatured: true,
      learningOutcomes: [
        'Decompose monolithic systems into bounded microservices',
        'Implement resilient inter-service communication with message queues',
        'Manage distributed data consistency using Saga patterns'
      ],
      prerequisites: ['Prior experience building backend web servers']
    });

    const course3 = await Course.create({
      title: 'Cybersecurity Fundamentals & Defensive Systems',
      slug: 'cybersecurity-fundamentals-defensive-systems',
      shortDescription: 'Understand vulnerabilities, OWASP Top 10, cryptographic primitives, and threat mitigation.',
      description: `Protect modern networks and applications. Covers threat modeling, zero-trust architectures, TLS/SSL, authentication protocols, and vulnerability scanning.`,
      instructor: instructor2._id,
      category: 'Cybersecurity',
      difficulty: 'beginner',
      thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
      estimatedDuration: '6 Weeks',
      status: 'published',
      isFeatured: false,
      learningOutcomes: [
        'Identify and patch OWASP Top 10 web vulnerabilities',
        'Apply cryptographic algorithms for data at rest and in transit',
        'Perform security audits on web applications'
      ]
    });

    const course4 = await Course.create({
      title: 'Cloud Infrastructure & DevOps Automation',
      slug: 'cloud-infrastructure-devops-automation',
      shortDescription: 'Build reliable CI/CD pipelines, containerize applications with Docker, and orchestrate with Kubernetes.',
      description: `Step into modern cloud engineering. Learn infrastructure as code (IaC), container orchestration, automated testing pipelines, and observability monitoring.`,
      instructor: instructor2._id,
      category: 'Cloud Computing',
      difficulty: 'intermediate',
      thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop&q=80',
      estimatedDuration: '7 Weeks',
      status: 'published',
      isFeatured: true,
      learningOutcomes: [
        'Containerize multi-tier web applications using Docker',
        'Configure automated CI/CD workflows using GitHub Actions',
        'Deploy and monitor workloads in Kubernetes clusters'
      ]
    });

    console.log('[Seed] Courses seeded successfully.');

    // 3. Create Modules & Lessons for Course 1
    const mod1 = await Module.create({
      courseId: course1._id,
      title: 'Module 1: Modern Full-Stack Architecture & Setup',
      description: 'Understanding client-server separation, REST principles, and environment scaffolding.',
      order: 1
    });

    const mod2 = await Module.create({
      courseId: course1._id,
      title: 'Module 2: Advanced React & State Management',
      description: 'Component lifecycles, custom hooks, context providers, and performance profiling.',
      order: 2
    });

    const mod3 = await Module.create({
      courseId: course1._id,
      title: 'Module 3: Secure Express API & Database Integration',
      description: 'Routing patterns, Mongoose ODM schemas, middleware chains, and JWT security.',
      order: 3
    });

    const lesson1_1 = await Lesson.create({
      courseId: course1._id,
      moduleId: mod1._id,
      title: '1.1 Principles of Decoupled Web Architecture',
      content: `## Modern Full-Stack System Architecture

In a production web ecosystem, separating concerns between frontend client presentation and backend business logic is paramount.

### Core Architecture Pillars:
1. **Presentation Layer (Client-Side)**: React handles interactive user state, DOM diffing, and component composition.
2. **Application Layer (Server-Side)**: Express orchestrates HTTP request lifecycles, route dispatching, authentication filters, and error handlers.
3. **Data Layer (Persistence)**: MongoDB stores schemaless JSON-like BSON documents, structured through Mongoose schemas with compound indexes.

\`\`\`
[ Browser Client ]  <--->  HTTPS (JSON / Cookies)  <--->  [ Express API Gateway ]
                                                                 |
                                                          [ Mongoose ODM ]
                                                                 |
                                                          [ MongoDB Cluster ]
\`\`\`

### Key Takeaways
- The frontend never trusts the client's internal state.
- All authorization decisions take place at the server middleware layer.
- APIs should follow consistent RESTful schema definitions with predictable status codes.`,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      durationMinutes: 15,
      order: 1,
      isFreePreview: true,
      resources: [
        { title: 'Architecture Diagram (PDF)', url: 'https://example.com/arch.pdf', fileType: 'pdf' },
        { title: 'Starter Boilerplate Repository', url: 'https://github.com/example/boilerplate', fileType: 'link' }
      ]
    });

    const lesson1_2 = await Lesson.create({
      courseId: course1._id,
      moduleId: mod1._id,
      title: '1.2 RESTful API Design & Status Code Standards',
      content: `## RESTful API Conventions

A well-structured REST API uses HTTP methods semantically:
- \`GET\`: Retrieve resources (idempotent, no side effects)
- \`POST\`: Create new resources
- \`PUT\`: Replace existing resource entirely
- \`PATCH\`: Partially modify existing resource
- \`DELETE\`: Remove resource

### Standardized Status Codes:
- **200 OK**: Request succeeded
- **201 Created**: Resource successfully created
- **400 Bad Request**: Client validation failure
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Authenticated user lacks role permissions
- **404 Not Found**: Resource does not exist
- **409 Conflict**: Duplicate key or constraint violation
- **500 Internal Server Error**: Unhandled operational or programming error`,
      durationMinutes: 20,
      order: 2,
      isFreePreview: false
    });

    const lesson2_1 = await Lesson.create({
      courseId: course1._id,
      moduleId: mod2._id,
      title: '2.1 Mastering Custom React Hooks & Context',
      content: `## Custom Hooks & React Context

Custom hooks extract component logic into reusable functions:
\`\`\`jsx
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
\`\`\`

Context is ideal for global application concerns such as:
1. Current logged-in user profile
2. Toast alert queues
3. Theme mode (dark/light)
4. Unread notification counters`,
      durationMinutes: 25,
      order: 1,
      isFreePreview: false
    });

    const lesson2_2 = await Lesson.create({
      courseId: course1._id,
      moduleId: mod2._id,
      title: '2.2 Performance Optimization & Memoization',
      content: `## React Rendering Optimization

Optimize heavy re-renders using \`useMemo\` and \`useCallback\`.
Always measure before optimizing to avoid unnecessary complexity overhead.`,
      durationMinutes: 18,
      order: 2,
      isFreePreview: false
    });

    const lesson3_1 = await Lesson.create({
      courseId: course1._id,
      moduleId: mod3._id,
      title: '3.1 JWT Authentication with HttpOnly Cookies',
      content: `## Secure Token Storage

Storing JWT tokens in \`localStorage\` exposes users to Cross-Site Scripting (XSS) credential theft. 

### Best Practice:
Set tokens in **httpOnly**, **secure**, **sameSite** cookies:
\`\`\`javascript
res.cookie('jwt', token, {
  httpOnly: true, // Inaccessible to client JavaScript
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax'
});
\`\`\``,
      durationMinutes: 22,
      order: 1,
      isFreePreview: false
    });

    console.log('[Seed] Modules and Lessons seeded successfully.');

    // 4. Create Enrollments and Progress
    const enrollment1 = await Enrollment.create({
      studentId: student1._id,
      courseId: course1._id,
      status: 'active',
      enrolledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    });

    const enrollment2 = await Enrollment.create({
      studentId: student1._id,
      courseId: course4._id,
      status: 'active',
      enrolledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    });

    const enrollment3 = await Enrollment.create({
      studentId: student2._id,
      courseId: course1._id,
      status: 'active',
      enrolledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    });

    // Seed progress: student 1 has completed lesson1_1 and lesson1_2 (2 of 5 lessons = 40%)
    await Progress.create({
      studentId: student1._id,
      courseId: course1._id,
      completedLessons: [
        { lessonId: lesson1_1._id, completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
        { lessonId: lesson1_2._id, completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
      ],
      lastAccessedLesson: lesson2_1._id,
      percentage: 40,
      isCompleted: false
    });

    await Progress.create({
      studentId: student1._id,
      courseId: course4._id,
      completedLessons: [],
      percentage: 0,
      isCompleted: false
    });

    console.log('[Seed] Enrollments and Progress seeded successfully.');

    // 5. Create Assignments and Submissions
    const assignment1 = await Assignment.create({
      courseId: course1._id,
      moduleId: mod1._id,
      instructorId: instructor1._id,
      title: 'Assignment 1: REST API Schema Design & Documentation',
      description: `### Instructions
Design a normalized schema and write OpenAPI/REST documentation for a multi-tenant course catalog.
1. Outline all required collections and relationships.
2. Define index keys and explain your rationale for query optimization.
3. Detail request and response payloads with status codes.

Submit your solution as markdown text or a public repository link below.`,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days in future
      maxMarks: 100,
      status: 'published'
    });

    const assignment2 = await Assignment.create({
      courseId: course1._id,
      moduleId: mod2._id,
      instructorId: instructor1._id,
      title: 'Assignment 2: Custom Hook for Infinite Scroll Pagination',
      description: `Implement a production-grade \`useInfiniteScroll\` React hook with intersection observers and abort controller cleanup.`,
      dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      maxMarks: 50,
      status: 'published'
    });

    // Student 1 submitted Assignment 1 and received grade & feedback
    await Submission.create({
      assignmentId: assignment1._id,
      studentId: student1._id,
      courseId: course1._id,
      content: `I designed a normalized schema with Course, Module, and Lesson collections. To prevent N+1 queries during curriculum loading, I created compound indexes on { courseId: 1, order: 1 }. 
Attached is the OpenAPI specification link and test suite summary: https://github.com/jordantaylor/schema-design-project`,
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      isLate: false,
      status: 'graded',
      marksAwarded: 94,
      feedback: 'Excellent schema design, Jordan! Your indexing strategy on { courseId, order } shows strong grasp of query execution planning. Keep up the high standard.',
      gradedAt: new Date(),
      gradedBy: instructor1._id
    });

    // Student 2 submitted Assignment 1 (pending evaluation)
    await Submission.create({
      assignmentId: assignment1._id,
      studentId: student2._id,
      courseId: course1._id,
      content: `My submission covers user authentication models and course hierarchies with full validation schemas using Zod.`,
      submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      isLate: false,
      status: 'submitted'
    });

    console.log('[Seed] Assignments and Submissions seeded successfully.');

    // 6. Create Quizzes, Questions, and Attempts
    const quiz1 = await Quiz.create({
      courseId: course1._id,
      moduleId: mod1._id,
      instructorId: instructor1._id,
      title: 'Quiz 1: Web Architecture & HTTP Fundamentals',
      description: 'Test your understanding of client-server models, RESTful constraints, and HTTP status codes.',
      durationMinutes: 15,
      passingScore: 60,
      totalMarks: 3,
      status: 'published'
    });

    const q1 = await Question.create({
      quizId: quiz1._id,
      questionText: 'Which HTTP method should be used to partially update an existing resource according to REST conventions?',
      options: ['GET', 'POST', 'PATCH', 'PUT'],
      correctAnswerIndex: 2, // PATCH
      explanation: 'PATCH is intended for partial modifications to an existing resource, whereas PUT replaces the target entity entirely.',
      marks: 1,
      order: 1
    });

    const q2 = await Question.create({
      quizId: quiz1._id,
      questionText: 'What is the primary security advantage of storing authentication JWTs in an httpOnly cookie rather than in localStorage?',
      options: [
        'The cookie automatically compresses data for faster network transit',
        'JavaScript running on the page cannot access the cookie, preventing XSS token theft',
        'HttpOnly cookies never expire and require no token refresh logic',
        'HttpOnly cookies allow unlimited storage beyond the 5MB browser quota'
      ],
      correctAnswerIndex: 1,
      explanation: 'Because client-side scripts cannot access httpOnly cookies via document.cookie, attackers cannot steal authentication credentials through Cross-Site Scripting (XSS).',
      marks: 1,
      order: 2
    });

    const q3 = await Question.create({
      quizId: quiz1._id,
      questionText: 'Which HTTP status code should a server return when a client makes a syntactically correct request for an entity that violates a unique database constraint (e.g. duplicate email)?',
      options: ['200 OK', '404 Not Found', '409 Conflict', '500 Internal Server Error'],
      correctAnswerIndex: 2, // 409
      explanation: 'HTTP 409 Conflict indicates that the request could not be processed because of a conflict in the request state, such as duplicate key constraints.',
      marks: 1,
      order: 3
    });

    // Student 1 completed Quiz 1 with 100% score
    await QuizAttempt.create({
      quizId: quiz1._id,
      studentId: student1._id,
      courseId: course1._id,
      answers: [
        { questionId: q1._id, selectedOptionIndex: 2, isCorrect: true, marksAwarded: 1 },
        { questionId: q2._id, selectedOptionIndex: 1, isCorrect: true, marksAwarded: 1 },
        { questionId: q3._id, selectedOptionIndex: 2, isCorrect: true, marksAwarded: 1 }
      ],
      score: 3,
      totalMarks: 3,
      percentage: 100,
      passed: true,
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });

    console.log('[Seed] Quizzes, Questions, and Attempts seeded successfully.');

    // 7. Create Notifications
    await Notification.create({
      userId: student1._id,
      title: 'Assignment Graded',
      message: 'Your submission for "Assignment 1: REST API Schema Design" has been evaluated: 94/100.',
      type: 'assignment_graded',
      link: `/student/assignments/${assignment1._id}`,
      isRead: false
    });

    await Notification.create({
      userId: student1._id,
      title: 'Course Enrollment',
      message: 'Welcome to Full-Stack Web Engineering with React & Node.js!',
      type: 'enrollment',
      link: `/student/courses/${course1._id}/learn`,
      isRead: true
    });

    await Notification.create({
      userId: instructor1._id,
      title: 'New Assignment Submission',
      message: 'Emma Watson submitted "Assignment 1: REST API Schema Design".',
      type: 'assignment_new',
      link: '/instructor/submissions',
      isRead: false
    });

    console.log('[Seed] Notifications seeded successfully.');

    console.log('\n=============================================');
    console.log('✅ LearnSphere Database Seed Completed Successfully!');
    console.log('=============================================');
    console.log('Demo Credentials for Evaluation:');
    console.log('---------------------------------------------');
    console.log('👑 Admin:');
    console.log('   Email:    admin@learnsphere.com');
    console.log('   Password: Password123!');
    console.log('👨‍🏫 Instructor:');
    console.log('   Email:    instructor@learnsphere.com');
    console.log('   Password: Password123!');
    console.log('🎓 Student:');
    console.log('   Email:    student@learnsphere.com');
    console.log('   Password: Password123!');
    console.log('=============================================\n');
  } catch (error) {
    console.error('[Seed Error]', error);
    throw error;
  }
};

/**
 * Standalone CLI entry point: connects to MongoDB, seeds, and exits.
 */
const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/learnsphere';
    await mongoose.connect(mongoUri);
    console.log(`[Seed] Connected to MongoDB: ${mongoUri}`);
    await runSeed();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

// Export for reuse by server.js
module.exports = { runSeed };

// Run directly when invoked as a script (e.g. `node src/utils/seedData.js`)
if (require.main === module) {
  seedDatabase();
}
