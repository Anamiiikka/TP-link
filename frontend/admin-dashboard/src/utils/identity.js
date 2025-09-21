export function getAdmissionNumber(session) {
  try {
    const payload = JSON.parse(atob(session.accessToken.split(".")[1]));
    return payload.admission_number || payload.preferred_username || payload.sub;
  } catch {
    return null;
  }
}

export function getRolesFromSession(session) {
  if (!session?.accessToken) {
    console.log('No access token in session:', session);
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

export function checkAdminPermissions(session) {
  const roles = getRolesFromSession(session);
  const isAdmin = roles.some(role => role.toLowerCase() === 'administrator');
  const isSuperAdmin = roles.some(role => role.toLowerCase() === 'superadmin');
  const isUnconfirmed = roles.some(role => role.toLowerCase() === 'unconfirmed');

  // Admin permission levels
  let adminLevel = 'NO_ACCESS';
  let permissions = {
    canViewUsers: false,
    canApproveUsers: false,
    canDeleteUsers: false,
    canManageRoles: false,
    canViewAudits: false,
    canManageSystem: false
  };

  if (isUnconfirmed) {
    adminLevel = 'PENDING_APPROVAL';
  } else if (isSuperAdmin) {
    adminLevel = 'SUPER_ADMIN';
    permissions = {
      canViewUsers: true,
      canApproveUsers: true, 
      canDeleteUsers: true,
      canManageRoles: true,
      canViewAudits: true,
      canManageSystem: true
    };
  } else if (isAdmin) {
    adminLevel = 'ADMIN';
    permissions = {
      canViewUsers: true,
      canApproveUsers: true,
      canDeleteUsers: false, // Only super admin can delete
      canManageRoles: true,
      canViewAudits: true,
      canManageSystem: false // Only super admin
    };
  }

  return { roles, isAdmin, isSuperAdmin, isUnconfirmed, adminLevel, permissions };
}

export function logAdminActivity(session, action, targetUser = null, metadata = {}) {
  const adminNumber = getAdmissionNumber(session);
  const { adminLevel } = checkAdminPermissions(session);
  
  const logEntry = {
    adminNumber,
    action,
    targetUser,
    adminLevel,
    timestamp: new Date().toISOString(),
    source: 'admin-dashboard',
    ...metadata
  };
  
  console.log(`[ADMIN-AUDIT] ${adminNumber}: ${action}`, logEntry);
  
  // In production, send to security audit system:
  // fetch('/api/admin/audit', { method: 'POST', body: JSON.stringify(logEntry) });
  
  return logEntry;
}

export function createAdminSession(session) {
  const adminNumber = getAdmissionNumber(session);
  const { adminLevel, permissions } = checkAdminPermissions(session);
  
  return {
    adminNumber,
    displayName: session.user?.name || 'Unknown Admin',
    email: session.user?.email,
    adminLevel,
    permissions,
    sessionStart: new Date().toISOString()
  };
}
