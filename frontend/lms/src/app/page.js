"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Dashboard from "./components/Dashboard";

export default function Home() {
  const { data: session } = useSession();

  const cardStyle = {
    background: "rgba(255,255,255,0.96)",
    borderRadius: 20,
    boxShadow: "0 4px 34px 2px #dfe6fb88",
    padding: "44px 40px",
    minWidth: 330,
    maxWidth: "90vw",
    marginTop: 40,
    textAlign: "center",
    border: "1.5px solid #b6e0fa",
  };

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
    
    // In production, send to audit service:
    // fetch('/api/audit', { method: 'POST', body: JSON.stringify(logEntry) });
    
    return logEntry;
  }

  async function handleLogout() {
    // IDENTITY-FIRST: Log logout activity
    if (session) {
      logUserActivity(session, 'LOGOUT', 'lms');
    }

    await signOut({ redirect: false });

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
      console.log('No access token in session:', session);
      return [];
    }

    try {
      // Decode JWT access token
      const token = session.accessToken;
      const parts = token.split('.');
      
      if (parts.length !== 3) {
        console.error('Invalid JWT format');
        return [];
      }

      const payload = JSON.parse(atob(parts[1]));
      console.log('Full JWT payload:', payload);
      
      // Extract roles from realm_access
      const roles = payload.realm_access?.roles || [];
      console.log('Realm roles found:', roles);
      
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

  // Get roles and determine user type (case-insensitive)
  const roles = getRolesFromSession(session) || [];
  const isAdmin = roles.some(role => String(role || '').toLowerCase() === 'administrator');
  const isStudent = roles.some(role => String(role || '').toLowerCase() === 'student');
  const isUnconfirmed = roles.some(role => String(role || '').toLowerCase() === 'unconfirmed');
  
  let primaryRole = 'UNKNOWN';
  if (isAdmin) primaryRole = 'ADMINISTRATOR';
  else if (isStudent) primaryRole = 'STUDENT';

  // IDENTITY-FIRST: Enhanced logging with admission number
  const admissionNumber = session ? getAdmissionNumber(session) : null;
  console.log('Identity:', admissionNumber);
  console.log('All roles:', roles);
  console.log('Primary role:', primaryRole);
  console.log('Is admin:', isAdmin);
  console.log('Needs approval:', isUnconfirmed);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(120deg,#fffdfe 0%,#def5fc 80%,#fffaff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {!session ? (
        <div style={cardStyle}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#1773b7", marginBottom: 12 }}>
            📖 LMS Portal
          </h1>
          <p style={{ color: "#426cad", fontSize: 17, marginBottom: 30, fontWeight: 500 }}>
            Access learning materials and assignments.
          </p>
          <button
            onClick={() => signIn("keycloak")}
            style={{
              marginTop: 15,
              padding: "11px 36px",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 17,
              background: "linear-gradient(90deg,#36b3fc,#a9d5ff 90%)",
              color: "#fff",
              border: "none",
              boxShadow: "0 2px 16px #a2c9ed80",
              letterSpacing: 1,
              cursor: "pointer",
            }}
          >
            Login with Admission Number
          </button>
        </div>
      ) : isUnconfirmed ? (
        // IDENTITY-FIRST: Block unconfirmed users with their admission number
        <div style={{...cardStyle, border: "1.5px solid #f39c12"}}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#e67e22", marginBottom: 12 }}>
            Account Pending Approval
          </h1>
          <p style={{ color: "#7f8c8d", fontSize: 17, marginBottom: 10 }}>
            Identity: <strong>{admissionNumber}</strong>
          </p>
          <p style={{ color: "#7f8c8d", fontSize: 17, marginBottom: 30 }}>
            Your registration is successful but requires admin approval.
            <br />Please wait for confirmation.
          </p>
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 40px",
              borderRadius: 7,
              fontWeight: 600,
              fontSize: 16,
              background: "#e74c3c",
              color: "#fff",
              border: "none",
              cursor: "pointer"
            }}>
            Logout
          </button>
        </div>
      ) : (
        <Dashboard 
          session={session} 
          role={primaryRole}
          onLogout={handleLogout}
          admissionNumber={admissionNumber} // IDENTITY-FIRST: Pass admission number to Dashboard
        />
      )}
    </div>
  );
}
