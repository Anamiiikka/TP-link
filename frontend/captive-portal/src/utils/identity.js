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

export function checkNetworkAccess(session) {
  const roles = getRolesFromSession(session);
  const isAdmin = roles.some(role => role.toLowerCase() === 'administrator');
  const isStudent = roles.some(role => role.toLowerCase() === 'student');
  const isFaculty = roles.some(role => role.toLowerCase() === 'faculty');
  const isUnconfirmed = roles.some(role => role.toLowerCase() === 'unconfirmed');

  // Network access rules
  let networkPolicy = {
    vlan: 'guest_vlan',
    bandwidth: '1Mbps',
    allowedPorts: [80, 443],
    accessLevel: 'BLOCKED'
  };

  if (isUnconfirmed) {
    networkPolicy.accessLevel = 'PENDING_APPROVAL';
  } else if (isAdmin) {
    networkPolicy = {
      vlan: 'admin_vlan',
      bandwidth: '100Mbps', 
      allowedPorts: [22, 80, 443, 8080, 3389],
      accessLevel: 'FULL_ACCESS'
    };
  } else if (isFaculty) {
    networkPolicy = {
      vlan: 'faculty_vlan',
      bandwidth: '50Mbps',
      allowedPorts: [80, 443, 8080, 22],
      accessLevel: 'FACULTY_ACCESS'
    };
  } else if (isStudent) {
    networkPolicy = {
      vlan: 'student_vlan', 
      bandwidth: '10Mbps',
      allowedPorts: [80, 443, 8080],
      accessLevel: 'STUDENT_ACCESS'
    };
  }

  return { roles, networkPolicy, isUnconfirmed };
}

export function logNetworkActivity(session, action, metadata = {}) {
  const admissionNumber = getAdmissionNumber(session);
  const { networkPolicy } = checkNetworkAccess(session);
  
  const logEntry = {
    admissionNumber,
    action,
    networkPolicy,
    timestamp: new Date().toISOString(),
    source: 'captive-portal',
    ...metadata
  };
  
  console.log(`[NETWORK-AUDIT] ${admissionNumber}: ${action}`, logEntry);
  
  // In production, send to network management system:
  // fetch('/api/network/audit', { method: 'POST', body: JSON.stringify(logEntry) });
  
  return logEntry;
}
