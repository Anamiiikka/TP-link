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

export function checkUserPermissions(session) {
  const roles = getRolesFromSession(session);
  const isAdmin = roles.some(role => role.toLowerCase() === 'administrator');
  const isStudent = roles.some(role => role.toLowerCase() === 'student');
  const isUnconfirmed = roles.some(role => role.toLowerCase() === 'unconfirmed');

  let primaryRole = 'UNKNOWN';
  if (isAdmin) primaryRole = 'ADMINISTRATOR';
  else if (isStudent) primaryRole = 'STUDENT';

  return { roles, isAdmin, isStudent, isUnconfirmed, primaryRole };
}

export function logUserActivity(session, action, resource = null, metadata = {}) {
  const admissionNumber = getAdmissionNumber(session);
  const logEntry = {
    admissionNumber,
    action,
    resource,
    timestamp: new Date().toISOString(),
    source: 'library-portal',
    ...metadata
  };
  
  console.log(`[AUDIT] ${admissionNumber}: ${action}`, logEntry);
  
  // In production, send to audit service:
  // fetch('/api/audit', { method: 'POST', body: JSON.stringify(logEntry) });
  
  return logEntry;
}

export function createUserIdentity(session) {
  const admissionNumber = getAdmissionNumber(session);
  const { roles } = checkUserPermissions(session);
  
  return {
    admissionNumber,
    displayName: session.user?.name || 'Unknown User',
    email: session.user?.email,
    roles,
    timestamp: new Date().toISOString()
  };
}
