import React from 'react';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';

/**
 * LMS Dashboard wrapper
 * props:
 * - role: 'ADMINISTRATOR' | 'STUDENT' | null
 * - session: session object from NextAuth
 * - onLogout: logout function
 * - data: optional data to pass to specific dashboard
 */
export default function Dashboard({role = 'STUDENT', session, onLogout, data}){
  // Normalize role to handle different formats
  const normalizedRole = role?.toLowerCase();
  
  console.log('Dashboard received role:', role);
  console.log('Normalized role:', normalizedRole);
  
  // Check for admin roles
  if(normalizedRole === 'administrator' || normalizedRole === 'admin') {
    return <AdminDashboard data={data} session={session} onLogout={onLogout} />;
  }
  
  // Default to student dashboard
  return <StudentDashboard data={data} session={session} onLogout={onLogout} />;
}