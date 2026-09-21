import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardShell from '../components/layout/DashboardShell';
import {
  ShieldAlert,
  Users,
  BookOpen,
  UserCheck,
  BarChart3,
  Settings
} from 'lucide-react';

const AdminLayout = () => {
  const adminNav = [
    { label: 'System Overview', path: '/admin', icon: BarChart3 },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'Course Catalog Governance', path: '/admin/courses', icon: BookOpen },
    { label: 'Platform Enrollments', path: '/admin/enrollments', icon: UserCheck },
    { label: 'Academic & System Info', path: '/admin/settings', icon: Settings }
  ];

  return (
    <DashboardShell
      portalTitle="System Administration"
      roleBadgeVariant="purple"
      navItems={adminNav}
    >
      <Outlet />
    </DashboardShell>
  );
};

export default AdminLayout;
