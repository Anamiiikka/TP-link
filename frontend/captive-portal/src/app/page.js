"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { 
  getAdmissionNumber, 
  checkNetworkAccess, 
  logNetworkActivity 
} from "../utils/identity";

export default function Home() {
  const { data: session } = useSession();
  const [networkAuth, setNetworkAuth] = useState(null);
  const [loading, setLoading] = useState(false);

  const cardStyle = {
    background: "rgba(255,255,255,0.90)",
    borderRadius: 20,
    boxShadow: "0 4px 32px 2px #d2e1fc99",
    padding: "42px 48px",
    minWidth: 340,
    marginTop: 40,
    maxWidth: "90vw",
    textAlign: "center",
    border: "1.5px solid #cff3ff"
  };

  // STEP 2: Get real network authorization from API
  async function requestNetworkAccess() {
    setLoading(true);
    try {
      console.log('Requesting network authorization...');
      
      const response = await fetch('/api/network/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Network Authorization Response:', data);
      
      if (data.success) {
        setNetworkAuth(data);
        logNetworkActivity(session, 'NETWORK_AUTHORIZED', {
          vlan: data.networkPolicy.vlan,
          bandwidth: data.networkPolicy.bandwidth,
          accessLevel: data.networkPolicy.accessLevel
        });
      } else {
        console.error('Network authorization failed:', data.message);
      }
    } catch (error) {
      console.error('Network authorization error:', error);
    }
    setLoading(false);
  }

  // Auto-request network access when user logs in
  useEffect(() => {
    if (session && !networkAuth) {
      requestNetworkAccess();
    }
  }, [session]);

  async function handleLogout() {
    // IDENTITY-FIRST: Log network disconnect
    if (session) {
      logNetworkActivity(session, 'NETWORK_DISCONNECT');
    }

    await signOut({ redirect: false });

    const issuer = "http://localhost:8080/realms/campus";
    const postLogout = "http://localhost:3003/";
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

  // IDENTITY-FIRST: Get identity information
  const admissionNumber = session ? getAdmissionNumber(session) : null;
  const networkInfo = session ? checkNetworkAccess(session) : null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(120deg, #e0edfc 0%, #fffbe2 70%, #e4ffe6 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      {!session ? (
        <div style={cardStyle}>
          <h1 style={{
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: 0.5,
            color: "#2288e2",
            marginBottom: 14
          }}>Wi‑Fi Captive Portal</h1>
          <p style={{
            color: "#44496a",
            fontSize: 18,
            marginBottom: 30,
            fontWeight: 500
          }}>
            Sign in to get network access.
          </p>
          <button
            onClick={() => signIn("keycloak")}
            style={{
              marginTop: 15,
              padding: "10px 44px",
              borderRadius: 7,
              fontWeight: 600,
              fontSize: 17,
              background: "linear-gradient(90deg,#4eb8f4,#6adec4 90%)",
              color: "#fff",
              border: "none",
              boxShadow: "0 2px 16px #bfefff70",
              letterSpacing: 1,
              cursor: "pointer"
            }}>
            Login with Admission Number
          </button>
        </div>
      ) : loading ? (
        // Loading state while getting network authorization
        <div style={{...cardStyle, border: "1.5px solid #fbbf24"}}>
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#f59e0b",
            marginBottom: 12
          }}>
            Authorizing Network Access...
          </h1>
          <p style={{
            fontSize: 18,
            color: "#92400e",
            marginBottom: 10,
            fontWeight: 500
          }}>Identity: <strong>{admissionNumber}</strong></p>
          <p style={{ color: "#78716c", fontSize: 17, marginBottom: 30 }}>
            Checking network permissions...
          </p>
        </div>
      ) : networkAuth?.networkPolicy?.accessLevel === 'PENDING_APPROVAL' || networkInfo?.isUnconfirmed ? (
        // IDENTITY-FIRST: Block unconfirmed users from network access
        <div style={{...cardStyle, border: "1.5px solid #f39c12"}}>
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#e67e22",
            marginBottom: 12
          }}>
            Network Access Pending Approval
          </h1>
          <p style={{
            fontSize: 18,
            color: "#7f8c8d",
            marginBottom: 10,
            fontWeight: 500
          }}>Identity: <strong>{admissionNumber}</strong></p>
          <p style={{ color: "#7f8c8d", fontSize: 17, marginBottom: 30 }}>
            Your account requires admin approval for network access.
            <br />Please wait for confirmation.
          </p>
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 44px",
              borderRadius: 7,
              fontWeight: 600,
              fontSize: 16,
              background: "#e74c3c",
              color: "#fff",
              border: "none",
              cursor: "pointer"
            }}>
            Disconnect
          </button>
        </div>
      ) : networkAuth?.success ? (
        // STEP 2: Show real network authorization data
        <div style={cardStyle}>
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#11b681",
            marginBottom: 12
          }}>
            Network Access Granted
          </h1>
          <p style={{
            fontSize: 18,
            color: "#3d7356",
            marginBottom: 15,
            fontWeight: 500
          }}>Identity: <strong>{admissionNumber}</strong></p>
          
          {/* Real Network Details from API */}
          <div style={{
            backgroundColor: "#f0f9ff",
            border: "1px solid #bae6fd",
            borderRadius: 10,
            padding: 20,
            margin: "20px 0",
            textAlign: "left"
          }}>
            <h3 style={{color: "#0c4a6e", marginBottom: 15}}>Network Configuration:</h3>
            <p><strong>VLAN:</strong> {networkAuth.networkPolicy.vlan}</p>
            <p><strong>Bandwidth:</strong> {networkAuth.networkPolicy.bandwidth}</p>
            <p><strong>Access Level:</strong> {networkAuth.networkPolicy.accessLevel}</p>
            <p><strong>Session Duration:</strong> {networkAuth.networkPolicy.sessionDuration}</p>
            <p><strong>Allowed Ports:</strong> {networkAuth.networkPolicy.allowedPorts.join(', ')}</p>
            <p><strong>Session ID:</strong> {networkAuth.networkPolicy.sessionId}</p>
          </div>

          <p style={{ margin: "18px 0 24px", color: "#5a5b70" }}>
            {networkAuth.networkPolicy.message}
          </p>
          
          <button
            onClick={requestNetworkAccess}
            style={{
              padding: "10px 30px",
              borderRadius: 7,
              fontWeight: 600,
              fontSize: 16,
              background: "linear-gradient(90deg,#4CAF50,#45a049 100%)",
              color: "#fff",
              border: "none",
              marginRight: 10,
              cursor: "pointer"
            }}>
            Refresh Access
          </button>
          
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 44px",
              borderRadius: 7,
              fontWeight: 600,
              fontSize: 16,
              background: "linear-gradient(90deg,#e14b6b,#5ac3cb 100%)",
              color: "#fff",
              border: "none",
              boxShadow: "0 2px 12px #f9bfc570",
              letterSpacing: 1,
              cursor: "pointer"
            }}>
            Disconnect
          </button>
        </div>
      ) : (
        // Fallback if network auth fails
        <div style={{...cardStyle, border: "1.5px solid #ef4444"}}>
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#dc2626",
            marginBottom: 12
          }}>
            Network Access Failed
          </h1>
          <p style={{
            fontSize: 18,
            color: "#7f1d1d",
            marginBottom: 10,
            fontWeight: 500
          }}>Identity: <strong>{admissionNumber}</strong></p>
          <p style={{ color: "#78716c", fontSize: 17, marginBottom: 30 }}>
            Unable to authorize network access. Please try again.
          </p>
          <button
            onClick={requestNetworkAccess}
            style={{
              padding: "10px 30px",
              borderRadius: 7,
              fontWeight: 600,
              fontSize: 16,
              background: "#ef4444",
              color: "#fff",
              border: "none",
              marginRight: 10,
              cursor: "pointer"
            }}>
            Retry
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 30px",
              borderRadius: 7,
              fontWeight: 600,
              fontSize: 16,
              background: "#6b7280",
              color: "#fff",
              border: "none",
              cursor: "pointer"
            }}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
