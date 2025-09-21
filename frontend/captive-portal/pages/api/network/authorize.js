import { getToken } from "next-auth/jwt";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get and verify JWT token
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      return res.status(401).json({ 
        message: 'Unauthorized',
        networkAccess: 'DENIED'
      });
    }

    // FIXED: Extract admission number and roles correctly
    const admissionNumber = token.preferred_username || token.sub;

    // DEBUGGING: Let's see exactly what we're getting
    console.log('=== DEBUG TOKEN STRUCTURE ===');
    console.log('Full JWT token:', token);
    console.log('Full token keys:', Object.keys(token));
    console.log('preferred_username:', token.preferred_username);
    console.log('sub:', token.sub);
    console.log('access_token exists:', !!token.access_token);
    console.log('accessToken exists:', !!token.accessToken);
    console.log('realm_access:', token.realm_access);

    // Try different ways to get the access token
    const accessToken = token.access_token || token.accessToken || token.rawAccessToken;
    console.log('Found accessToken:', !!accessToken);

    // FIXED: Get roles from the actual JWT access token, not the NextAuth token
    let roles = [];
    if (accessToken) {
      try {
        const parts = accessToken.split('.');
        const payload = JSON.parse(atob(parts[1]));
        console.log('Access token payload keys:', Object.keys(payload));
        console.log('realm_access from token:', payload.realm_access);
        roles = payload.realm_access?.roles || [];
      } catch (error) {
        console.error('Error parsing access token:', error);
        roles = token.realm_access?.roles || [];
      }
    } else {
      console.log('No access token found, using NextAuth token structure');
      roles = token.realm_access?.roles || [];
    }

    console.log('Final extracted roles:', roles);
    console.log('=== END DEBUG ===');

    console.log(`[NETWORK-AUTH] Processing user: ${admissionNumber} with roles:`, roles);

    // Determine network policy based on roles
    let networkPolicy = {
      admissionNumber,
      vlan: 'guest_vlan',
      bandwidth: '1Mbps',
      allowedPorts: [80, 443],
      sessionDuration: '1hour',
      accessLevel: 'BLOCKED',
      radiusResponse: 'Access-Reject'
    };

    // Check for unconfirmed status
    const isUnconfirmed = roles.some(role => role.toLowerCase() === 'unconfirmed');
    const isAdmin = roles.some(role => role.toLowerCase().includes('administrator'));
    const isFaculty = roles.some(role => role.toLowerCase().includes('faculty'));
    const isStudent = roles.some(role => role.toLowerCase().includes('student'));

    console.log('Role checks:', { isUnconfirmed, isAdmin, isFaculty, isStudent });
    
    if (isUnconfirmed) {
      networkPolicy.accessLevel = 'PENDING_APPROVAL';
      networkPolicy.radiusResponse = 'Access-Reject';
      networkPolicy.message = 'Account pending admin approval';
    }
    // Admin network access
    else if (isAdmin) {
      networkPolicy = {
        admissionNumber,
        vlan: 'admin_vlan',
        bandwidth: '100Mbps',
        allowedPorts: [22, 80, 443, 8080, 3389, 5432],
        sessionDuration: '12hours',
        accessLevel: 'ADMIN_ACCESS',
        radiusResponse: 'Access-Accept',
        message: 'Full network access granted'
      };
    }
    // Faculty network access
    else if (isFaculty) {
      networkPolicy = {
        admissionNumber,
        vlan: 'faculty_vlan', 
        bandwidth: '50Mbps',
        allowedPorts: [80, 443, 8080, 22],
        sessionDuration: '8hours',
        accessLevel: 'FACULTY_ACCESS',
        radiusResponse: 'Access-Accept',
        message: 'Faculty network access granted'
      };
    }
    // Student network access
    else if (isStudent) {
      networkPolicy = {
        admissionNumber,
        vlan: 'student_vlan',
        bandwidth: '10Mbps', 
        allowedPorts: [80, 443, 8080],
        sessionDuration: '8hours',
        accessLevel: 'STUDENT_ACCESS',
        radiusResponse: 'Access-Accept',
        message: 'Student network access granted'
      };
    }

    // Add timestamp and session info
    networkPolicy.timestamp = new Date().toISOString();
    networkPolicy.sessionId = `sess_${admissionNumber}_${Date.now()}`;

    // Log the network authorization
    console.log(`[NETWORK-AUTH] ${admissionNumber}: ${networkPolicy.accessLevel}`, networkPolicy);

    // Return network authorization response
    res.status(200).json({
      success: true,
      networkPolicy,
      // RADIUS-like response for real NAC integration
      radiusAttributes: {
        'User-Name': admissionNumber,
        'Tunnel-Type': 'VLAN',
        'Tunnel-Medium-Type': 'IEEE-802',
        'Tunnel-Private-Group-ID': networkPolicy.vlan,
        'Session-Timeout': parseSessionDuration(networkPolicy.sessionDuration),
        'Filter-Id': `bandwidth_limit_${networkPolicy.bandwidth}`,
        'Reply-Message': networkPolicy.message
      }
    });

  } catch (error) {
    console.error('Network authorization error:', error);
    res.status(500).json({ 
      message: 'Network authorization failed',
      networkAccess: 'DENIED'
    });
  }
}

function parseSessionDuration(duration) {
  // Convert duration to seconds for RADIUS Session-Timeout
  const matches = duration.match(/(\d+)(hour|minute)s?/);
  if (!matches) return 3600; // Default 1 hour

  const value = parseInt(matches[1]);
  const unit = matches[2];
  
  if (unit === 'hour') return value * 3600;
  if (unit === 'minute') return value * 60;
  return 3600;
}
