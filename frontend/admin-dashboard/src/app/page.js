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

  if (!session) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Admin Dashboard</h1>
        <button onClick={() => signIn("keycloak")}>Login with Admission Number</button>
      </main>
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

  if (adminInfo?.isUnconfirmed) {
    return (
      <main style={{ 
        padding: 24,
        backgroundColor: '#fff5f5',
        borderRadius: 8,
        border: '1px solid #fecaca',
        margin: 24
      }}>
        <h1 style={{ color: '#dc2626' }}>Admin Access Pending Approval</h1>
        <p>Identity: <strong>{adminNumber}</strong></p>
        <p>Your admin account requires approval before you can access the dashboard.</p>
        <button 
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}>
          Logout
        </button>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main style={{ 
        padding: 24,
        backgroundColor: '#fef2f2',
        borderRadius: 8,
        border: '1px solid #fecaca',
        margin: 24
      }}>
        <h1 style={{ color: '#dc2626' }}>Access Denied</h1>
        <p>Identity: <strong>{adminNumber}</strong></p>
        <p>Administrator role required.</p>
        <button 
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}>
          Logout
        </button>
      </main>
    );
  }

  return (
    <main style={{ padding: 0, background: '#f6f8fa', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 40px 0 40px' }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>Dashboard</h1>
          <div style={{ color: '#64748b', fontSize: 15, marginTop: 4 }}>UniCampus IAM Platform - System Overview and Analytics</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right', marginRight: 8 }}>
            <div style={{ fontWeight: 600 }}>{session.user?.name || session.user?.email}</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>System Administrator</div>
          </div>
          <button onClick={handleLogout} style={{ background: '#f1f5f9', border: 'none', borderRadius: 20, padding: '8px 18px', color: '#dc2626', fontWeight: 600, cursor: 'pointer' }}>Logout</button>
        </div>
      </header>

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
