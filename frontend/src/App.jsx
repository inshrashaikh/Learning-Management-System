import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import StudentLayout from './layouts/StudentLayout';
import InstructorLayout from './layouts/InstructorLayout';
import AdminLayout from './layouts/AdminLayout';

// Route Guards
import { ProtectedRoute, RoleBasedRoute } from './routes/RouteGuards';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import CourseCatalog from './pages/public/CourseCatalog';
import CourseDetail from './pages/public/CourseDetail';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyCourses from './pages/student/MyCourses';
import CourseLearn from './pages/student/CourseLearn';
import StudentAssignments from './pages/student/StudentAssignments';
import StudentQuizzes from './pages/student/StudentQuizzes';
import QuizRunner from './pages/student/QuizRunner';
import StudentResults from './pages/student/StudentResults';
import StudentProgress from './pages/student/StudentProgress';
import StudentNotifications from './pages/student/StudentNotifications';
import StudentProfile from './pages/student/StudentProfile';

// Instructor Pages
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import CourseList from './pages/instructor/CourseList';
import CourseBuilder from './pages/instructor/CourseBuilder';
import SubmissionsReview from './pages/instructor/SubmissionsReview';
import InstructorQuizzes from './pages/instructor/InstructorQuizzes';
import InstructorAnalytics from './pages/instructor/InstructorAnalytics';
import InstructorProfile from './pages/instructor/InstructorProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CourseManagement from './pages/admin/CourseManagement';
import EnrollmentMonitoring from './pages/admin/EnrollmentMonitoring';
import SystemSettings from './pages/admin/SystemSettings';

function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/courses" element={<CourseCatalog />} />
        <Route path="/courses/:courseId" element={<CourseDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Student Portal */}
      <Route
        path="/student"
        element={
          <RoleBasedRoute allowedRoles={['student', 'admin']}>
            <StudentLayout />
          </RoleBasedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="courses" element={<MyCourses />} />
        <Route path="courses/:courseId/learn" element={<CourseLearn />} />
        <Route path="courses/:courseId/lesson/:lessonId" element={<CourseLearn />} />
        <Route path="assignments" element={<StudentAssignments />} />
        <Route path="assignments/:assignmentId" element={<StudentAssignments />} />
        <Route path="quizzes" element={<StudentQuizzes />} />
        <Route path="quizzes/:quizId" element={<QuizRunner />} />
        <Route path="results" element={<StudentResults />} />
        <Route path="progress" element={<StudentProgress />} />
        <Route path="notifications" element={<StudentNotifications />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* Instructor Portal */}
      <Route
        path="/instructor"
        element={
          <RoleBasedRoute allowedRoles={['instructor', 'admin']}>
            <InstructorLayout />
          </RoleBasedRoute>
        }
      >
        <Route index element={<InstructorDashboard />} />
        <Route path="courses" element={<CourseList />} />
        <Route path="courses/new" element={<CourseBuilder />} />
        <Route path="courses/:id/edit" element={<CourseBuilder />} />
        <Route path="submissions" element={<SubmissionsReview />} />
        <Route path="quizzes" element={<InstructorQuizzes />} />
        <Route path="analytics" element={<InstructorAnalytics />} />
        <Route path="profile" element={<InstructorProfile />} />
      </Route>

      {/* Admin Portal */}
      <Route
        path="/admin"
        element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </RoleBasedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="courses" element={<CourseManagement />} />
        <Route path="enrollments" element={<EnrollmentMonitoring />} />
        <Route path="settings" element={<SystemSettings />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
