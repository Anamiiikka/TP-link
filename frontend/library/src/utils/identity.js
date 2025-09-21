// Minimal identity utilities used across pages

export function getAdmissionNumber(session) {
  try {
    if (!session?.accessToken) return session?.user?.email || session?.user?.sub || null;
    const parts = session.accessToken.split('.');
    if (parts.length !== 3) return session?.user?.sub || null;
    const payload = JSON.parse(atob(parts[1]));
    return payload.admission_number || payload.preferred_username || payload.sub || session?.user?.sub || null;
  } catch (e) {
    console.error('getAdmissionNumber error', e);
    return session?.user?.sub || null;
  }
}

export function checkUserPermissions(session, requiredRoles = []){
  try {
    if (!session?.accessToken) return false;
    const parts = session.accessToken.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    const roles = payload.realm_access?.roles || [];
    const lowered = roles.map(r => String(r).toLowerCase());
    return requiredRoles.some(req => lowered.includes(String(req).toLowerCase()));
  } catch (e) {
    console.error('checkUserPermissions error', e);
    return false;
  }
}

export function logUserActivity(session, action, resource = null, metadata = {}){
  const admission = getAdmissionNumber(session);
  const entry = {
    admissionNumber: admission,
    action,
    resource,
    timestamp: new Date().toISOString(),
    source: 'library-portal',
    ...metadata
  };
  // For now we log to console; replace with real audit endpoint in production
  console.log('[AUDIT]', entry);
  return entry;
}
