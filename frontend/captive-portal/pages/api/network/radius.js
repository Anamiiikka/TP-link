import { getToken } from "next-auth/jwt";

// Simulated RADIUS server responses
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { action, username, sessionId } = req.body;

  try {
    // Get JWT token for authentication
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      return res.status(401).json({
        radiusResponse: 'Access-Reject',
        message: 'Authentication required'
      });
    }

    // Extract admission number and roles
    const admissionNumber = token.preferred_username || token.sub;
    let roles = [];
    
    if (token.access_token || token.accessToken) {
      try {
        const accessToken = token.access_token || token.accessToken;
        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        roles = payload.realm_access?.roles || [];
      } catch (error) {
        roles = token.realm_access?.roles || [];
      }
    }

    console.log(`[RADIUS-SERVER] ${action} request for ${admissionNumber}`);

    switch (action) {
      case 'Access-Request':
        return handleAccessRequest(admissionNumber, roles, res);
      
      case 'Accounting-Request':
        return handleAccountingRequest(admissionNumber, sessionId, req.body, res);
      
      case 'CoA-Request': // Change of Authorization
        return handleCoARequest(admissionNumber, sessionId, res);
      
      default:
        return res.status(400).json({
          radiusResponse: 'Access-Reject',
          message: 'Unknown RADIUS action'
        });
    }

  } catch (error) {
    console.error('RADIUS server error:', error);
    res.status(500).json({
      radiusResponse: 'Access-Reject',
      message: 'RADIUS server error'
    });
  }
}

function handleAccessRequest(admissionNumber, roles, res) {
  const isUnconfirmed = roles.some(role => role.toLowerCase() === 'unconfirmed');
  const isAdmin = roles.some(role => role.toLowerCase().includes('administrator'));
  const isFaculty = roles.some(role => role.toLowerCase().includes('faculty'));
  const isStudent = roles.some(role => role.toLowerCase().includes('student'));

  let radiusAttributes = {};

  if (isUnconfirmed) {
    console.log(`[RADIUS] Access-Reject for ${admissionNumber} - unconfirmed account`);
    return res.status(200).json({
      radiusResponse: 'Access-Reject',
      message: 'Account pending approval',
      attributes: {
        'Reply-Message': 'Your account requires admin approval'
      }
    });
  }

  // Admin access
  if (isAdmin) {
    radiusAttributes = {
      'Tunnel-Type': 'VLAN',
      'Tunnel-Medium-Type': 'IEEE-802',
      'Tunnel-Private-Group-ID': 'admin_vlan',
      'Session-Timeout': 43200, // 12 hours
      'Filter-Id': 'bandwidth_limit_100Mbps',
      'Framed-Protocol': 'PPP',
      'Service-Type': 'Framed-User',
      'Reply-Message': 'Admin network access granted'
    };
  }
  // Faculty access
  else if (isFaculty) {
    radiusAttributes = {
      'Tunnel-Type': 'VLAN',
      'Tunnel-Medium-Type': 'IEEE-802',
      'Tunnel-Private-Group-ID': 'faculty_vlan',
      'Session-Timeout': 28800, // 8 hours
      'Filter-Id': 'bandwidth_limit_50Mbps',
      'Framed-Protocol': 'PPP',
      'Service-Type': 'Framed-User',
      'Reply-Message': 'Faculty network access granted'
    };
  }
  // Student access
  else if (isStudent) {
    radiusAttributes = {
      'Tunnel-Type': 'VLAN',
      'Tunnel-Medium-Type': 'IEEE-802',
      'Tunnel-Private-Group-ID': 'student_vlan',
      'Session-Timeout': 28800, // 8 hours
      'Filter-Id': 'bandwidth_limit_10Mbps',
      'Framed-Protocol': 'PPP',
      'Service-Type': 'Framed-User',
      'Reply-Message': 'Student network access granted'
    };
  }
  // Default deny
  else {
    console.log(`[RADIUS] Access-Reject for ${admissionNumber} - no valid role`);
    return res.status(200).json({
      radiusResponse: 'Access-Reject',
      message: 'No valid network access role',
      attributes: {
        'Reply-Message': 'Contact administrator for network access'
      }
    });
  }

  console.log(`[RADIUS] Access-Accept for ${admissionNumber} - ${radiusAttributes['Tunnel-Private-Group-ID']}`);
  
  return res.status(200).json({
    radiusResponse: 'Access-Accept',
    message: 'Network access granted',
    attributes: radiusAttributes,
    sessionInfo: {
      username: admissionNumber,
      vlan: radiusAttributes['Tunnel-Private-Group-ID'],
      bandwidth: radiusAttributes['Filter-Id'],
      sessionStart: new Date().toISOString(),
      sessionId: `radius_${admissionNumber}_${Date.now()}`
    }
  });
}

function handleAccountingRequest(admissionNumber, sessionId, body, res) {
  const { accountingType, sessionTime, inputOctets, outputOctets } = body;

  console.log(`[RADIUS-ACCOUNTING] ${accountingType} for ${admissionNumber} session ${sessionId}`);

  // Simulate accounting record storage
  const accountingRecord = {
    username: admissionNumber,
    sessionId,
    accountingType, // Start, Stop, Interim-Update
    timestamp: new Date().toISOString(),
    sessionTime: sessionTime || 0,
    inputOctets: inputOctets || 0,
    outputOctets: outputOctets || 0,
    totalOctets: (inputOctets || 0) + (outputOctets || 0)
  };

  // In a real system, this would be stored in database
  console.log('[RADIUS-ACCOUNTING] Record:', accountingRecord);

  return res.status(200).json({
    radiusResponse: 'Accounting-Response',
    message: 'Accounting record processed',
    record: accountingRecord
  });
}

function handleCoARequest(admissionNumber, sessionId, res) {
  // Change of Authorization - force user to re-authenticate
  console.log(`[RADIUS-COA] Disconnect request for ${admissionNumber} session ${sessionId}`);

  return res.status(200).json({
    radiusResponse: 'CoA-ACK',
    message: 'User session terminated',
    action: 'disconnect',
    sessionId
  });
}
