import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardShell from '../components/layout/DashboardShell';
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  FileCheck,
  CheckCircle2,
  BarChart3,
  User
} from 'lucide-react';

const InstructorLayout = () => {
  const instructorNav = [
    { label: 'Instructor Dashboard', path: '/instructor', icon: LayoutDashboard },
    { label: 'Manage Courses', path: '/instructor/courses', icon: BookOpen },
    { label: 'Create Course', path: '/instructor/courses/new', icon: PlusCircle },
    { label: 'Submissions & Grading', path: '/instructor/submissions', icon: FileCheck },
    { label: 'Quiz Management', path: '/instructor/quizzes', icon: CheckCircle2 },
    { label: 'Cohort Analytics', path: '/instructor/analytics', icon: BarChart3 },
    { label: 'Instructor Profile', path: '/instructor/profile', icon: User }
  ];

  return (
    <DashboardShell
      portalTitle="Instructor Hub"
      roleBadgeVariant="indigo"
      navItems={instructorNav}
    >
      <Outlet />
    </DashboardShell>
  );
};

export default InstructorLayout;
