export function getAdmissionNumber(session) {
  try {
    const payload = JSON.parse(atob(session.accessToken.split(".")[1]));
    return payload.admission_number || payload.preferred_username || payload.sub;
  } catch {
    return null;
  }
}

export function createUserIdentity(session) {
  const admissionNumber = getAdmissionNumber(session);
  return {
    admissionNumber,
    displayName: session.user?.name || 'Unknown User',
    email: session.user?.email,
    roles: getUserRoles(session),
    timestamp: new Date().toISOString()
  };
}

export function logUserActivity(session, action, resource = null, metadata = {}) {
  const identity = createUserIdentity(session);
  const logEntry = {
    ...identity,
    action,
    resource,
    metadata,
    source: 'lms-portal',
    ip: metadata.ip || 'unknown'
  };
  
  console.log(`[AUDIT] ${identity.admissionNumber}: ${action}`, logEntry);
  
  // In production, send to audit service:
  // fetch('/api/audit', { method: 'POST', body: JSON.stringify(logEntry) });
  
  return logEntry;
}

function getUserRoles(session) {
  try {
    const payload = JSON.parse(atob(session.accessToken.split(".")[1]));
    return payload?.realm_access?.roles || [];
  } catch {
    return [];
  }
}
