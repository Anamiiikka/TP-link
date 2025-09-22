"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { 
  getAdmissionNumber, 
  checkAdminPermissions, 
  logAdminActivity 
} from "../utils/identity";

function getRolesFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return new Set(payload?.realm_access?.roles || []);
  } catch {
    return new Set();
  }
}

export default function Home() {
  const { data: session } = useSession();

  async function handleLogout() {
    // IDENTITY-FIRST: Log admin logout
    if (session) {
      logAdminActivity(session, 'ADMIN_LOGOUT');
    }

    // Clear local NextAuth session without navigating yet
    await signOut({ redirect: false });

    // End the Keycloak SSO session and return to Admin "/"
    const issuer = "http://localhost:8080/realms/campus";
    const postLogout = "http://localhost:3002/"; // must be in Valid post logout redirect URIs
    const idToken = session?.idToken;

    if (idToken) {
      const url =
        `${issuer}/protocol/openid-connect/logout` +
        `?id_token_hint=${encodeURIComponent(idToken)}` +
        `&post_logout_redirect_uri=${encodeURIComponent(postLogout)}`;
      window.location.href = url;
    } else {
      // Fallback if no id_token yet (first run after code change)
      window.location.href = postLogout;
    }
  }

  // Enhanced Login Page UI [web:36][web:37]
  if (!session) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Animated Background Elements */}
        <div style={{
          position: "absolute",
          top: "-50%",
          right: "-50%",
          width: "100%",
          height: "100%",
          background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
          animation: "float 6s ease-in-out infinite"
        }}></div>
        <div style={{
          position: "absolute",
          bottom: "-50%",
          left: "-50%",
          width: "100%",
          height: "100%",
          background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)",
          animation: "float 8s ease-in-out infinite reverse"
        }}></div>

        {/* Login Card */}
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          padding: "48px 40px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 25px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          textAlign: "center",
          position: "relative",
          zIndex: 1
        }}>
          {/* Logo/Icon */}
          <div style={{
            width: "80px",
            height: "80px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            boxShadow: "0 10px 30px rgba(102, 126, 234, 0.4)"
          }}>
            <span style={{ fontSize: "36px", color: "white" }}>🎯</span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: "32px",
            fontWeight: "800",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            margin: "0 0 8px 0",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
          }}>
            Admin Dashboard
          </h1>

          {/* Subtitle */}
          <p style={{
            color: "#6b7280",
            fontSize: "16px",
            fontWeight: "500",
            margin: "0 0 32px 0",
            lineHeight: "1.5"
          }}>
            Sign in to access the UniCampus IAM Platform
          </p>

          {/* Login Button */}
          <button
            onClick={() => signIn("keycloak")}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "16px",
              padding: "16px 24px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 12px 35px rgba(102, 126, 234, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0px)";
              e.target.style.boxShadow = "0 8px 25px rgba(102, 126, 234, 0.3)";
            }}
          >
            🔐 Login with Admission Number
          </button>

          {/* Footer */}
          <div style={{
            marginTop: "32px",
            padding: "20px 0 0",
            borderTop: "1px solid #e5e7eb",
            color: "#9ca3af",
            fontSize: "14px"
          }}>
            UniCampus Identity & Access Management
          </div>
        </div>

        {/* CSS Animation */}
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
        `}</style>
      </div>
    );
  }

  // IDENTITY-FIRST: Get admin identity and permissions
  const adminNumber = getAdmissionNumber(session);
  const adminInfo = checkAdminPermissions(session);

  // IDENTITY-FIRST: Log admin access
  logAdminActivity(session, 'ADMIN_DASHBOARD_ACCESS', null, {
    ip: 'dynamic', // In real implementation, get actual IP
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
  });

  const roles = getRolesFromToken(session.accessToken || "");
  const isAdmin = roles.has("administrator") || roles.has("Administrator");

  // IDENTITY-FIRST: Enhanced logging
  console.log('Admin Identity:', adminNumber);
  console.log('Admin Level:', adminInfo?.adminLevel);
  console.log('Admin Permissions:', adminInfo?.permissions);
  console.log('All Roles:', Array.from(roles));

  // Enhanced Pending Approval UI [web:39][web:42]
  if (adminInfo?.isUnconfirmed) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Background Pattern */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
          backgroundSize: "20px 20px",
          opacity: 0.4
        }}></div>

        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          padding: "48px 40px",
          width: "100%",
          maxWidth: "480px",
          boxShadow: "0 20px 60px rgba(245, 158, 11, 0.2), 0 8px 25px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(251, 191, 36, 0.3)",
          textAlign: "center",
          position: "relative",
          zIndex: 1
        }}>
          {/* Icon */}
          <div style={{
            width: "80px",
            height: "80px",
            background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            boxShadow: "0 10px 30px rgba(245, 158, 11, 0.4)"
          }}>
            <span style={{ fontSize: "36px", color: "white" }}>⏳</span>
          </div>

          <h1 style={{
            fontSize: "28px",
            fontWeight: "800",
            color: "#dc2626",
            margin: "0 0 16px 0",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
          }}>
            Admin Access Pending Approval
          </h1>

          <div style={{
            background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
            borderRadius: "12px",
            padding: "20px",
            margin: "24px 0",
            border: "1px solid #f59e0b"
          }}>
            <p style={{
              color: "#92400e",
              fontSize: "16px",
              fontWeight: "600",
              margin: "0 0 8px 0"
            }}>
              Identity: <strong style={{ color: "#78350f" }}>{adminNumber}</strong>
            </p>
            <p style={{
              color: "#92400e",
              fontSize: "14px",
              lineHeight: "1.6",
              margin: 0
            }}>
              Your admin account requires approval before you can access the dashboard. 
              Please contact the system administrator for assistance.
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={{
              background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "14px 28px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 8px 25px rgba(220, 38, 38, 0.3)",
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 12px 35px rgba(220, 38, 38, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0px)";
              e.target.style.boxShadow = "0 8px 25px rgba(220, 38, 38, 0.3)";
            }}
          >
            🚪 Logout
          </button>

          <div style={{
            marginTop: "24px",
            color: "#6b7280",
            fontSize: "12px"
          }}>
            Contact: admin@unicampus.edu for immediate assistance
          </div>
        </div>
      </div>
    );
  }

  // Enhanced Access Denied UI [web:39][web:43]
  if (!isAdmin) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Background Pattern */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)",
          backgroundSize: "30px 30px",
          opacity: 0.3
        }}></div>

        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          padding: "48px 40px",
          width: "100%",
          maxWidth: "480px",
          boxShadow: "0 20px 60px rgba(220, 38, 38, 0.2), 0 8px 25px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(254, 202, 202, 0.5)",
          textAlign: "center",
          position: "relative",
          zIndex: 1
        }}>
          {/* Icon */}
          <div style={{
            width: "80px",
            height: "80px",
            background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            boxShadow: "0 10px 30px rgba(220, 38, 38, 0.4)"
          }}>
            <span style={{ fontSize: "36px", color: "white" }}>🚫</span>
          </div>

          <h1 style={{
            fontSize: "28px",
            fontWeight: "800",
            color: "#dc2626",
            margin: "0 0 16px 0",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
          }}>
            Access Denied
          </h1>

          <div style={{
            background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
            borderRadius: "12px",
            padding: "20px",
            margin: "24px 0",
            border: "1px solid #fecaca"
          }}>
            <p style={{
              color: "#b91c1c",
              fontSize: "16px",
              fontWeight: "600",
              margin: "0 0 12px 0"
            }}>
              Identity: <strong style={{ color: "#7f1d1d" }}>{adminNumber}</strong>
            </p>
            <p style={{
              color: "#b91c1c",
              fontSize: "14px",
              lineHeight: "1.6",
              margin: "0 0 16px 0"
            }}>
              Administrator role required to access this dashboard.
            </p>
            <div style={{
              background: "rgba(220, 38, 38, 0.1)",
              borderRadius: "8px",
              padding: "12px",
              border: "1px dashed #dc2626"
            }}>
              <p style={{
                color: "#7f1d1d",
                fontSize: "12px",
                margin: 0,
                fontWeight: "500"
              }}>
                <strong>Current Roles:</strong> {Array.from(roles).join(', ') || 'None assigned'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "14px 28px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 8px 25px rgba(220, 38, 38, 0.3)",
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 12px 35px rgba(220, 38, 38, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0px)";
              e.target.style.boxShadow = "0 8px 25px rgba(220, 38, 38, 0.3)";
            }}
          >
            🚪 Logout
          </button>

          <div style={{
            marginTop: "24px",
            color: "#6b7280",
            fontSize: "12px"
          }}>
            Need admin access? Contact your system administrator
          </div>
        </div>
      </div>
    );
  }

  // Original Admin Dashboard (Enhanced Header) [web:40][web:49]
  return (
    <main style={{ padding: 0, background: '#f6f8fa', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Enhanced Header */}
      <header style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 40px'
      }}>
        <div>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '800',
            margin: 0,
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Dashboard
          </h1>
          <div style={{
            color: '#64748b',
            fontSize: '16px',
            marginTop: '4px',
            fontWeight: '500'
          }}>
            UniCampus IAM Platform - System Overview and Analytics
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
            borderRadius: '16px',
            padding: '12px 20px',
            textAlign: 'right',
            border: '1px solid #cbd5e1'
          }}>
            <div style={{ fontWeight: '700', fontSize: '16px', color: '#1e293b' }}>
              {session.user?.name || session.user?.email}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
              System Administrator
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              border: 'none',
              borderRadius: '14px',
              padding: '12px 24px',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '15px',
              boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(220, 38, 38, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0px)';
              e.target.style.boxShadow = '0 4px 15px rgba(220, 38, 38, 0.3)';
            }}
          >
            🚪 Logout
          </button>
        </div>
      </header>

      {/* Rest of the dashboard remains the same */}
      {/* Top Cards */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, margin: '32px 40px 0 40px' }}>
        {/* Total Users */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e5e7eb', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ color: '#64748b', fontSize: 14 }}>Total Users</div>
          <div style={{ fontSize: 28, fontWeight: 700, margin: '8px 0' }}>4,756 <span style={{ color: '#16a34a', fontSize: 16, fontWeight: 600, marginLeft: 8 }}>↑12%</span></div>
        </div>
        {/* Active Sessions */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e5e7eb', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ color: '#64748b', fontSize: 14 }}>Active Sessions</div>
          <div style={{ fontSize: 28, fontWeight: 700, margin: '8px 0' }}>542 <span style={{ color: '#16a34a', fontSize: 16, fontWeight: 600, marginLeft: 8 }}>↑4.2%</span></div>
        </div>
        {/* System Health */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e5e7eb', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ color: '#64748b', fontSize: 14 }}>System Health</div>
          <div style={{ fontSize: 28, fontWeight: 700, margin: '8px 0' }}>99.2% <span style={{ color: '#dc2626', fontSize: 16, fontWeight: 600, marginLeft: 8 }}>↓0.1%</span></div>
        </div>
        {/* Security Alerts */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e5e7eb', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ color: '#64748b', fontSize: 14 }}>Security Alerts</div>
          <div style={{ fontSize: 28, fontWeight: 700, margin: '8px 0' }}>3 <span style={{ color: '#dc2626', fontSize: 16, fontWeight: 600, marginLeft: 8 }}>↓50%</span></div>
        </div>
      </section>

      {/* Middle Section: Charts */}
      <section style={{ display: 'grid', gridTemplateColumns: '2fr 2fr', gap: 24, margin: '32px 40px 0 40px' }}>
        {/* Service Adoption Bar Chart (Placeholder) */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e5e7eb', padding: 24 }}>
          <div style={{ color: '#64748b', fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Service Adoption</div>
          <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>User adoption rates across campus services</div>
          {/* Bar Chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', height: 180, gap: 32, marginTop: 16 }}>
            {/* Wi-Fi */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ background: '#ec4899', width: 36, height: 140, borderRadius: 8 }}></div>
              <div style={{ marginTop: 8, color: '#64748b', fontWeight: 600 }}>Wi-Fi</div>
            </div>
            {/* ERP */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ background: '#ec4899', width: 36, height: 100, borderRadius: 8 }}></div>
              <div style={{ marginTop: 8, color: '#64748b', fontWeight: 600 }}>ERP</div>
            </div>
            {/* LMS */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ background: '#ec4899', width: 36, height: 120, borderRadius: 8 }}></div>
              <div style={{ marginTop: 8, color: '#64748b', fontWeight: 600 }}>LMS</div>
            </div>
            {/* Library */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ background: '#ec4899', width: 36, height: 80, borderRadius: 8 }}></div>
              <div style={{ marginTop: 8, color: '#64748b', fontWeight: 600 }}>Library</div>
            </div>
          </div>
        </div>
        {/* Active Sessions Line Chart (Placeholder) */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e5e7eb', padding: 24 }}>
          <div style={{ color: '#64748b', fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Active Sessions</div>
          <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>Real-time user sessions throughout the day</div>
          {/* Line Chart (SVG) */}
          <svg width="100%" height="180" viewBox="0 0 400 180">
            <polyline fill="none" stroke="#8b5cf6" strokeWidth="3" points="0,160 50,150 100,120 150,80 200,60 250,100 300,140 350,120 400,100" />
            {/* Dots */}
            { [160,150,120,80,60,100,140,120,100].map((y,i) => (
              <circle key={i} cx={i*50} cy={y} r={4} fill="#a78bfa" />
            )) }
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: 13, marginTop: 8 }}>
            <span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span>
          </div>
        </div>
      </section>

      {/* Bottom Section: System Status, Compliance, Alerts (placeholders) */}
      <section style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr', gap: 24, margin: '32px 40px 40px 40px' }}>
        {/* System Status */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e5e7eb', padding: 24 }}>
          <div style={{ color: '#64748b', fontSize: 15, fontWeight: 600, marginBottom: 12 }}>System Status</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 15 }}>
            <li><span style={{ color: '#22c55e', fontWeight: 700 }}>●</span> Wi-Fi Authentication <span style={{ float: 'right', color: '#64748b' }}>99.8%</span></li>
            <li><span style={{ color: '#22c55e', fontWeight: 700 }}>●</span> ERP Access <span style={{ float: 'right', color: '#64748b' }}>99.5%</span></li>
            <li><span style={{ color: '#22c55e', fontWeight: 700 }}>●</span> LMS <span style={{ float: 'right', color: '#64748b' }}>99.7%</span></li>
            <li><span style={{ color: '#22c55e', fontWeight: 700 }}>●</span> Library <span style={{ float: 'right', color: '#64748b' }}>99.2%</span></li>
          </ul>
        </div>
        {/* Compliance Status */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e5e7eb', padding: 24 }}>
          <div style={{ color: '#64748b', fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Compliance Status</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 15 }}>
            <li><span style={{ color: '#22c55e', fontWeight: 700 }}>●</span> GDPR <span style={{ float: 'right', color: '#64748b' }}>Compliant</span></li>
            <li><span style={{ color: '#22c55e', fontWeight: 700 }}>●</span> UGC <span style={{ float: 'right', color: '#64748b' }}>Compliant</span></li>
            <li><span style={{ color: '#22c55e', fontWeight: 700 }}>●</span> NAAC <span style={{ float: 'right', color: '#64748b' }}>Compliant</span></li>
          </ul>
        </div>
        {/* Recent Alerts */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e5e7eb', padding: 24 }}>
          <div style={{ color: '#64748b', fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Recent Alerts</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 15 }}>
            <li style={{ color: '#dc2626', marginBottom: 8 }}>• Multiple failed login attempts detected for user ID: STU2024001</li>
            <li style={{ color: '#dc2626', marginBottom: 8 }}>• Unusual session activity from IP: 10.0.0.5</li>
            <li style={{ color: '#dc2626' }}>• New device login for admin: admin@campus.edu</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
