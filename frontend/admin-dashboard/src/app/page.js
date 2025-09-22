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
    <main style={{ 
      padding: 24,
      backgroundColor: '#f0fdf4',
      borderRadius: 8,
      border: '1px solid #bbf7d0',
      margin: 24
    }}>
      <h1 style={{ color: '#15803d' }}>Welcome {session.user?.name || session.user?.email}</h1>
      <p><strong>Admin Identity:</strong> {adminNumber}</p>
      <p><strong>Admin Level:</strong> {adminInfo?.adminLevel}</p>
      <p><strong>Permissions:</strong></p>
      <ul style={{ margin: '10px 0' }}>
        {adminInfo?.permissions?.canViewUsers && <li>✅ View Users</li>}
        {adminInfo?.permissions?.canApproveUsers && <li>✅ Approve Users</li>}
        {adminInfo?.permissions?.canDeleteUsers && <li>✅ Delete Users</li>}
        {adminInfo?.permissions?.canManageRoles && <li>✅ Manage Roles</li>}
        {adminInfo?.permissions?.canViewAudits && <li>✅ View Audits</li>}
        {adminInfo?.permissions?.canManageSystem && <li>✅ Manage System</li>}
      </ul>
      <button 
        onClick={handleLogout}
        style={{
          padding: '10px 20px',
          backgroundColor: '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          marginTop: 20
        }}>
        Logout
      </button>
    </main>
  );
}
