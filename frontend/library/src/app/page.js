"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Dashboard from "./components/Dashboard";
import React from "react";

export default function Home() {
  const { data: session } = useSession();

  const cardStyle = {
    background: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    boxShadow: "0 4px 32px 2px #d3e9ff77",
    padding: "44px 40px",
    minWidth: 330,
    maxWidth: "90vw",
    marginTop: 40,
    textAlign: "center",
    border: "1.5px solid #dde9fa"
  };

  async function handleLogout() {
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

  // Get roles and determine user's primary role
  const roles = getRolesFromToken(session);
  const isAdmin = roles.includes('Administrator') || roles.includes('administrator');
  const isStudent = roles.includes('student');
  
  // Determine primary role for display
  let primaryRole = 'UNKNOWN';
  if (isAdmin) {
    primaryRole = 'ADMINISTRATOR';
  } else if (isStudent) {
    primaryRole = 'STUDENT';
  }

  console.log('All user roles:', roles);
  console.log('Is administrator:', isAdmin);
  console.log('Is student:', isStudent);
  console.log('Primary role:', primaryRole);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(120deg,#f9f6ff 0%,#caf7f6 70%,#dedfff 100%)",
      padding: 20,
    }}>
      {!session ? (
        <div style={{display:'flex', alignItems:'center', justifyContent:'center', minHeight:'80vh'}}>
          <div style={cardStyle}>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: "#5541ac", marginBottom: 10 }}>
              📚 Library Portal
            </h1>
            <p style={{ color: "#674ea7", fontSize: 17, marginBottom: 30, fontWeight: 500 }}>
              Please sign in to access library resources.
            </p>
            <button
              onClick={() => signIn("keycloak")}
              style={{
                marginTop: 15,
                padding: "11px 42px",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 17,
                background: "linear-gradient(90deg,#6e63e9,#7fcaea 90%)",
                color: "#fff",
                border: "none",
                boxShadow: "0 2px 16px #e4bcf860",
                letterSpacing: 1,
                cursor: "pointer"
              }}>
              Login
            </button>
          </div>
        </div>
      ) : (
        <div style={{maxWidth:1200, margin:'0 auto'}}>
          <div style={{display:'flex', justifyContent:'flex-end', marginBottom:12}}>
            <div style={{display:'flex', gap:8, alignItems:'center'}}>
              <div style={{textAlign:'right', marginRight:8}}>
                <div style={{fontSize:13, color:'#334155'}}>
                  {session.user?.name || session.user?.email}
                </div>
                <div style={{fontSize:12, color:'#64748b'}}>
                  {primaryRole}
                </div>
                <div style={{fontSize:11, color:'#94a3b8'}}>
                  Roles: {roles.join(', ') || 'None'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer"
                }}>
                Logout
              </button>
            </div>
          </div>

          <Dashboard role={primaryRole} data={{ user: session.user, roles: roles }} />
        </div>
      )}
    </div>
  );
}
