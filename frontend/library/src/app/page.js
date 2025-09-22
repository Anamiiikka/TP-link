"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Dashboard from "./components/Dashboard";
import React from "react";
import { 
  getAdmissionNumber, 
  checkUserPermissions, 
  logUserActivity 
} from "../utils/identity";

export default function Home() {
  const { data: session } = useSession();

  const cardStyle = {
    background: "rgba(255,255,255,0.95)",
    borderRadius: 24,
    boxShadow: "0 8px 40px 8px rgba(139, 92, 246, 0.15)",
    padding: "48px 44px",
    minWidth: 360,
    maxWidth: "90vw",
    marginTop: 40,
    textAlign: "center",
    border: "1px solid rgba(139, 92, 246, 0.2)",
    backdropFilter: "blur(10px)",
  };

  async function handleLogout() {
    // IDENTITY-FIRST: Log logout activity
    if (session) {
      logUserActivity(session, 'LOGOUT', 'library');
    }

    // Clear local app session first
    await signOut({ redirect: false });

    // End the Keycloak SSO session with id_token_hint and return to app root
    const issuer = "http://localhost:8080/realms/campus";
    const postLogout = "http://localhost:3001/"; // adjust port for your app
    const idToken = session?.idToken;

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

  // Decode JWT access token to extract roles
  function getRolesFromToken(session) {
    try {
      if (!session?.accessToken) {
        console.log('No access token found in session');
        return [];
      }
      
      // Split JWT and decode the payload (middle part)
      const token = session.accessToken;
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Invalid JWT format');
        return [];
      }

      const base64Payload = parts[1];
      const payload = JSON.parse(atob(base64Payload));
      
      // Log the full payload for debugging
      console.log('Decoded JWT payload:', payload);
      console.log('Realm access:', payload.realm_access);
      
      // Extract roles from realm_access
      const roles = payload.realm_access?.roles || [];
      console.log('Extracted roles:', roles);
      
      return roles;
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return [];
    }
  }

  // IDENTITY-FIRST: Log access attempt when user logs in
  if (session) {
    logUserActivity(session, 'PORTAL_ACCESS', 'library', {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    });
  }

  // Get roles and determine user's primary role
  const roles = getRolesFromToken(session);
  const isAdmin = roles.some(role => role.toLowerCase() === 'administrator');
  const isStudent = roles.some(role => role.toLowerCase() === 'student');
  const isUnconfirmed = roles.some(role => role.toLowerCase() === 'unconfirmed');

  // Determine primary role for display and dashboard
  let primaryRole = 'UNKNOWN';
  let dashboardRole = 'student';
  if (isAdmin) {
    primaryRole = 'ADMINISTRATOR';
    dashboardRole = 'admin';
  } else if (isStudent) {
    primaryRole = 'STUDENT';
    dashboardRole = 'student';
  }

  // IDENTITY-FIRST: Enhanced logging with admission number
  const admissionNumber = session ? getAdmissionNumber(session) : null;
  console.log('Identity:', admissionNumber);
  console.log('All user roles:', roles);
  console.log('Is administrator:', isAdmin);
  console.log('Is student:', isStudent);
  console.log('Primary role:', primaryRole);
  console.log('Needs approval:', isUnconfirmed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {!session ? (
          <div className="flex items-center justify-center min-h-screen p-6">
            <div style={cardStyle}>
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <span className="text-3xl">📚</span>
              </div>
              <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Library Portal
              </h1>
              <p className="text-gray-600 text-lg mb-8 font-medium">
                Sign in to access your digital library and learning resources.
              </p>
              <button
                onClick={() => signIn("keycloak")}
                className="bg-gradient-to-r from-purple-500 via-purple-600 to-blue-600 hover:from-purple-600 hover:via-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl"
              >
                🔐 Login with Admission Number
              </button>
            </div>
          </div>
        ) : isUnconfirmed ? (
          // IDENTITY-FIRST: Block unconfirmed users with their admission number
          <div className="flex items-center justify-center min-h-screen p-6">
            <div style={{...cardStyle, border: "1px solid rgba(245, 158, 11, 0.3)"}}>
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <span className="text-3xl">⏳</span>
              </div>
              <h1 className="text-3xl font-bold text-orange-600 mb-4">
                Account Pending Approval
              </h1>
              <p className="text-gray-600 text-lg mb-2">
                Identity: <strong className="text-purple-600">{admissionNumber}</strong>
              </p>
              <p className="text-gray-600 mb-8">
                Your registration is successful but requires admin approval.
                <br />Please wait for confirmation.
              </p>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        ) : (
          <Dashboard 
            role={dashboardRole} 
            data={{ user: session.user, roles: roles }}
            session={session}
            onLogout={handleLogout}
            admissionNumber={admissionNumber}
          />
        )}
      </div>
    </div>
  );
}
