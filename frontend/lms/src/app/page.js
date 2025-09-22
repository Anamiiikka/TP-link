"use client";
import { useSession } from "next-auth/react";
import Dashboard from "./components/Dashboard";

export default function Home() {
  const { data: session } = useSession();

  // IDENTITY-FIRST: Get Admission Number from token
  function getAdmissionNumber(session) {
    try {
      const payload = JSON.parse(atob(session.accessToken.split(".")[1]));
      return payload.admission_number || payload.preferred_username || payload.sub;
    } catch {
      return null;
    }
  }

  // IDENTITY-FIRST: Audit logging with admission number
  function logUserActivity(session, action, resource = null, metadata = {}) {
    const admissionNumber = getAdmissionNumber(session);
    const logEntry = {
      admissionNumber,
      action,
      resource,
      timestamp: new Date().toISOString(),
      source: 'lms-portal',
      ...metadata
    };
    
    console.log(`[AUDIT] ${admissionNumber}: ${action}`, logEntry);
    return logEntry;
  }

  async function handleLogout() {
    if (session) {
      logUserActivity(session, 'LOGOUT', 'lms');
    }

    const idToken = session?.idToken;
    const issuer = "http://localhost:8080/realms/campus";
    const postLogout = "http://localhost:3000/";

    if (idToken) {
      const url =
        `${issuer}/protocol/openid-connect/logout` +
        `?id_token_hint=${encodeURIComponent(idToken)}` +
        `&post_logout_redirect_uri=${encodeURIComponent(postLogout)}`;
      window.location.href = url;
    } else {
      window.location.href = postLogout;
    }
  }

  // CORRECTED: Decode the JWT access token to get roles
  function getRolesFromSession(session) {
    if (!session?.accessToken) {
      return [];
    }

    try {
      const token = session.accessToken;
      const parts = token.split('.');
      
      if (parts.length !== 3) {
        console.error('Invalid JWT format');
        return [];
      }

      const payload = JSON.parse(atob(parts[1]));
      const roles = payload.realm_access?.roles || [];
      return roles;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return [];
    }
  }

  // IDENTITY-FIRST: Log access attempt when user logs in
  if (session) {
    logUserActivity(session, 'PORTAL_ACCESS', 'lms', {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    });
  }

  // Get roles and determine user type
  const roles = getRolesFromSession(session) || [];
  const isAdmin = roles.some(role => String(role || '').toLowerCase() === 'administrator');
  const isStudent = roles.some(role => String(role || '').toLowerCase() === 'student');
  
  let primaryRole = 'UNKNOWN';
  if (isAdmin) primaryRole = 'ADMINISTRATOR';
  else if (isStudent) primaryRole = 'STUDENT';

  const admissionNumber = session ? getAdmissionNumber(session) : null;

  return (
    <Dashboard 
      session={session} 
      role={primaryRole}
      onLogout={handleLogout}
      admissionNumber={admissionNumber}
    />
  );
}
