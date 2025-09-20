import React from 'react';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';

/**
 * Dashboard wrapper
 * props:
 * - role: 'admin' | 'student' | null
 * - data: optional data to pass to specific dashboard
 */
export default function Dashboard({role = 'student', data}){
  // If no role is provided, default to student dashboard
  const dashboardRole = role || 'student';
  
  if(dashboardRole === 'admin') return <AdminDashboard data={data} />;
  return <StudentDashboard data={data} />;
}
