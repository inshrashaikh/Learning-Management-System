import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardShell from '../components/layout/DashboardShell';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck,
  CheckCircle2,
  Award,
  BarChart3,
  Bell,
  User
} from 'lucide-react';

const StudentLayout = () => {
  const studentNav = [
    { label: 'Overview', path: '/student', icon: LayoutDashboard },
    { label: 'My Enrolled Courses', path: '/student/courses', icon: BookOpen },
    { label: 'Assignments', path: '/student/assignments', icon: FileCheck },
    { label: 'Quizzes & Tests', path: '/student/quizzes', icon: CheckCircle2 },
    { label: 'Results & Grades', path: '/student/results', icon: Award },
    { label: 'Learning Progress', path: '/student/progress', icon: BarChart3 },
    { label: 'Notifications', path: '/student/notifications', icon: Bell },
    { label: 'Student Profile', path: '/student/profile', icon: User }
  ];

  return (
    <DashboardShell
      portalTitle="Student Learning Portal"
      roleBadgeVariant="emerald"
      navItems={studentNav}
    >
      <Outlet />
    </DashboardShell>
  );
};

export default StudentLayout;
