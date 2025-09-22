"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { 
  getAdmissionNumber, 
  checkNetworkAccess, 
  logNetworkActivity 
} from "../utils/identity";

export default function Home() {
  const { data: session } = useSession();
  const [networkAuth, setNetworkAuth] = useState(null);
  const [loading, setLoading] = useState(false);

  // Modern card styling with inline styles that work
  const baseCardStyle = {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "24px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)",
    padding: "48px",
    minWidth: "360px",
    maxWidth: "500px",
    margin: "16px",
    textAlign: "center",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    animation: "fadeInUp 0.6s ease-out"
  };
  
  const cardVariants = {
    default: { borderColor: "rgba(56, 189, 248, 0.3)", background: "rgba(255, 255, 255, 0.95)" },
    success: { borderColor: "rgba(16, 185, 129, 0.4)", background: "rgba(236, 253, 245, 0.9)" },
    warning: { borderColor: "rgba(245, 158, 11, 0.4)", background: "rgba(254, 252, 232, 0.9)" },
    error: { borderColor: "rgba(239, 68, 68, 0.4)", background: "rgba(254, 242, 242, 0.9)" },
    loading: { borderColor: "rgba(59, 130, 246, 0.4)", background: "rgba(239, 246, 255, 0.9)" }
  };

  // STEP 2: Get real network authorization from API
  const requestNetworkAccess = useCallback(async () => {
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
  }, [session]);

  // Auto-request network access when user logs in
  useEffect(() => {
    if (session && !networkAuth) {
      requestNetworkAccess();
    }
  }, [session, networkAuth, requestNetworkAccess]);

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
      background: "linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #f0fdf4 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px"
    }}>
      {!session ? (
        <div style={{...baseCardStyle, ...cardVariants.default}}>
          <div style={{ marginBottom: "32px" }}>
            <div style={{
              width: "64px",
              height: "64px",
              background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
              borderRadius: "50%",
              margin: "0 auto 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)"
            }}>
              <svg style={{ width: "32px", height: "32px", color: "white" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
            </div>
            <h1 style={{
              fontSize: "32px",
              fontWeight: "800",
              color: "#1e293b",
              marginBottom: "16px",
              letterSpacing: "-0.5px"
            }}>
              Wi‑Fi Captive Portal
            </h1>
            <p style={{
              color: "#64748b",
              fontSize: "18px",
              fontWeight: "500",
              lineHeight: "1.6"
            }}>
              Sign in to get network access
            </p>
          </div>
          
          <button
            onClick={() => signIn("keycloak")}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
              color: "white",
              fontWeight: "600",
              fontSize: "16px",
              padding: "16px 32px",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 8px 25px rgba(59, 130, 246, 0.5)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(59, 130, 246, 0.4)";
            }}
          >
            <svg style={{ width: "20px", height: "20px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Login with Admission Number
          </button>
        </div>
      ) : loading ? (
        // Loading state while getting network authorization
        <div style={{...baseCardStyle, ...cardVariants.loading}}>
          <div style={{ marginBottom: "32px" }}>
            <div style={{
              width: "64px",
              height: "64px",
              background: "#dbeafe",
              borderRadius: "50%",
              margin: "0 auto 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <div style={{
                width: "32px",
                height: "32px",
                border: "3px solid #3b82f6",
                borderTop: "3px solid transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }}></div>
            </div>
            <h1 style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#1d4ed8",
              marginBottom: "24px"
            }}>
              Authorizing Network Access...
            </h1>
            <div style={{
              background: "rgba(255, 255, 255, 0.7)",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "16px"
            }}>
              <p style={{
                color: "#1e40af",
                fontWeight: "600",
                fontSize: "16px",
                marginBottom: "8px"
              }}>
                Identity: <span style={{
                  fontFamily: "monospace",
                  background: "#dbeafe",
                  padding: "4px 8px",
                  borderRadius: "4px"
                }}>{admissionNumber}</span>
              </p>
            </div>
            <p style={{
              color: "#64748b",
              fontSize: "14px"
            }}>
              Checking network permissions and configuring access...
            </p>
          </div>
          
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  width: "8px",
                  height: "8px",
                  background: "#3b82f6",
                  borderRadius: "50%",
                  animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite both`
                }}
              ></div>
            ))}
          </div>
        </div>
      ) : networkAuth?.networkPolicy?.accessLevel === 'PENDING_APPROVAL' || networkInfo?.isUnconfirmed ? (
        // IDENTITY-FIRST: Block unconfirmed users from network access
        <div style={{...baseCardStyle, ...cardVariants.warning}}>
          <div style={{ marginBottom: "32px" }}>
            <div style={{
              width: "64px",
              height: "64px",
              background: "#fef3c7",
              borderRadius: "50%",
              margin: "0 auto 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <svg style={{ width: "32px", height: "32px", color: "#d97706" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#b45309",
              marginBottom: "24px"
            }}>
              Network Access Pending
            </h1>
            <div style={{
              background: "rgba(255, 255, 255, 0.7)",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "24px"
            }}>
              <p style={{
                color: "#92400e",
                fontWeight: "600",
                fontSize: "16px"
              }}>
                Identity: <span style={{
                  fontFamily: "monospace",
                  background: "#fef3c7",
                  padding: "4px 8px",
                  borderRadius: "4px"
                }}>{admissionNumber}</span>
              </p>
            </div>
            <div style={{
              background: "#fffbeb",
              border: "1px solid #fed7aa",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "24px"
            }}>
              <p style={{
                color: "#92400e",
                fontSize: "15px",
                lineHeight: "1.6",
                margin: "0"
              }}>
                Your account requires admin approval for network access.
                <br />
                <strong>Please wait for confirmation from the IT department.</strong>
              </p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              color: "white",
              fontWeight: "600",
              fontSize: "16px",
              padding: "12px 24px",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(239, 68, 68, 0.4)",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 8px 25px rgba(239, 68, 68, 0.5)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(239, 68, 68, 0.4)";
            }}
          >
            <svg style={{ width: "20px", height: "20px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Disconnect
          </button>
        </div>
      ) : networkAuth?.success ? (
        // STEP 2: Show real network authorization data
        <div style={{...baseCardStyle, ...cardVariants.success}}>
          <div style={{ marginBottom: "32px" }}>
            <div style={{
              width: "64px",
              height: "64px",
              background: "#d1fae5",
              borderRadius: "50%",
              margin: "0 auto 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <svg style={{ width: "32px", height: "32px", color: "#059669" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#047857",
              marginBottom: "24px"
            }}>
              Network Access Granted
            </h1>
            <div style={{
              background: "rgba(255, 255, 255, 0.8)",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "24px"
            }}>
              <p style={{
                color: "#065f46",
                fontWeight: "600",
                fontSize: "16px"
              }}>
                Identity: <span style={{
                  fontFamily: "monospace",
                  background: "#d1fae5",
                  padding: "4px 8px",
                  borderRadius: "4px"
                }}>{admissionNumber}</span>
              </p>
            </div>
          </div>
          
          {/* Real Network Details from API */}
          <div style={{
            background: "rgba(255, 255, 255, 0.9)",
            border: "1px solid #a7f3d0",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "24px",
            textAlign: "left"
          }}>
            <h3 style={{
              color: "#065f46",
              fontWeight: "700",
              fontSize: "18px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <svg style={{ width: "20px", height: "20px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Network Configuration
            </h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "12px",
              fontSize: "14px"
            }}>
              {[
                { label: "VLAN", value: networkAuth.networkPolicy.vlan },
                { label: "Bandwidth", value: networkAuth.networkPolicy.bandwidth },
                { label: "Access Level", value: networkAuth.networkPolicy.accessLevel },
                { label: "Duration", value: networkAuth.networkPolicy.sessionDuration },
                { label: "Allowed Ports", value: networkAuth.networkPolicy.allowedPorts.join(', '), fullWidth: true },
                { label: "Session ID", value: networkAuth.networkPolicy.sessionId, fullWidth: true }
              ].map((item, index) => (
                <div
                  key={index}
                  style={{
                    background: "#ecfdf5",
                    padding: "12px",
                    borderRadius: "8px",
                    gridColumn: item.fullWidth ? "1 / -1" : "auto"
                  }}
                >
                  <span style={{ fontWeight: "600", color: "#047857" }}>{item.label}:</span>
                  <br />
                  <span style={{
                    fontFamily: "monospace",
                    color: "#065f46",
                    fontSize: item.fullWidth && item.label === "Session ID" ? "12px" : "14px",
                    wordBreak: "break-all"
                  }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "24px"
          }}>
            <p style={{
              color: "#065f46",
              fontSize: "14px",
              lineHeight: "1.6",
              margin: "0"
            }}>
              {networkAuth.networkPolicy.message}
            </p>
          </div>
          
          <div style={{
            display: "flex",
            flexDirection: window.innerWidth < 640 ? "column" : "row",
            gap: "12px"
          }}>
            <button
              onClick={requestNetworkAccess}
              style={{
                flex: "1",
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "white",
                fontWeight: "600",
                fontSize: "16px",
                padding: "12px 24px",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 8px 25px rgba(16, 185, 129, 0.5)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(16, 185, 129, 0.4)";
              }}
            >
              <svg style={{ width: "20px", height: "20px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Access
            </button>
            
            <button
              onClick={handleLogout}
              style={{
                flex: "1",
                background: "linear-gradient(135deg, #64748b, #475569)",
                color: "white",
                fontWeight: "600",
                fontSize: "16px",
                padding: "12px 24px",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(100, 116, 139, 0.4)",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 8px 25px rgba(100, 116, 139, 0.5)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(100, 116, 139, 0.4)";
              }}
            >
              <svg style={{ width: "20px", height: "20px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Disconnect
            </button>
          </div>
        </div>
      ) : (
        // Fallback if network auth fails
        <div style={{...baseCardStyle, ...cardVariants.error}}>
          <div style={{ marginBottom: "32px" }}>
            <div style={{
              width: "64px",
              height: "64px",
              background: "#fee2e2",
              borderRadius: "50%",
              margin: "0 auto 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <svg style={{ width: "32px", height: "32px", color: "#dc2626" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#b91c1c",
              marginBottom: "24px"
            }}>
              Network Access Failed
            </h1>
            <div style={{
              background: "rgba(255, 255, 255, 0.7)",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "24px"
            }}>
              <p style={{
                color: "#991b1b",
                fontWeight: "600",
                fontSize: "16px"
              }}>
                Identity: <span style={{
                  fontFamily: "monospace",
                  background: "#fee2e2",
                  padding: "4px 8px",
                  borderRadius: "4px"
                }}>{admissionNumber}</span>
              </p>
            </div>
            <div style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "24px"
            }}>
              <p style={{
                color: "#991b1b",
                fontSize: "15px",
                lineHeight: "1.6",
                margin: "0"
              }}>
                Unable to authorize network access. This could be due to:
                <br />
                • Network connectivity issues
                <br />
                • Server maintenance
                <br />
                • Account permissions
              </p>
            </div>
          </div>
          
          <div style={{
            display: "flex",
            flexDirection: window.innerWidth < 640 ? "column" : "row",
            gap: "12px"
          }}>
            <button
              onClick={requestNetworkAccess}
              style={{
                flex: "1",
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                color: "white",
                fontWeight: "600",
                fontSize: "16px",
                padding: "12px 24px",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(239, 68, 68, 0.4)",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 8px 25px rgba(239, 68, 68, 0.5)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(239, 68, 68, 0.4)";
              }}
            >
              <svg style={{ width: "20px", height: "20px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry
            </button>
            <button
              onClick={handleLogout}
              style={{
                flex: "1",
                background: "linear-gradient(135deg, #64748b, #475569)",
                color: "white",
                fontWeight: "600",
                fontSize: "16px",
                padding: "12px 24px",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(100, 116, 139, 0.4)",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 8px 25px rgba(100, 116, 139, 0.5)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(100, 116, 139, 0.4)";
              }}
            >
              <svg style={{ width: "20px", height: "20px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
