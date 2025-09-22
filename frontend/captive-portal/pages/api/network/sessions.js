import { getToken } from "next-auth/jwt";

// Simulated active sessions store (in production, use Redis/Database)
let activeSessions = new Map();

export default async function handler(req, res) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const admissionNumber = token.preferred_username || token.sub;

  switch (req.method) {
    case 'GET':
      // Get active sessions for user or all sessions (admin only)
      return getActiveSessions(admissionNumber, token, res);
    
    case 'POST':
      // Create new session
      return createSession(admissionNumber, req.body, res);
    
    case 'DELETE':
      // Terminate session
      return terminateSession(admissionNumber, req.body.sessionId, res);
    
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

function getActiveSessions(admissionNumber, token, res) {
  // Check if user is admin (can see all sessions)
  let roles = [];
  try {
    if (token.access_token || token.accessToken) {
      const accessToken = token.access_token || token.accessToken;
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      roles = payload.realm_access?.roles || [];
    }
  } catch (error) {
    roles = token.realm_access?.roles || [];
  }

  const isAdmin = roles.some(role => role.toLowerCase().includes('administrator'));
  
  if (isAdmin) {
    // Admin can see all active sessions
    const allSessions = Array.from(activeSessions.values());
    return res.status(200).json({
      sessions: allSessions,
      totalSessions: allSessions.length
    });
  } else {
    // Regular user can only see their own sessions
    const userSessions = Array.from(activeSessions.values())
      .filter(session => session.username === admissionNumber);
    
    return res.status(200).json({
      sessions: userSessions,
      totalSessions: userSessions.length
    });
  }
}

function createSession(admissionNumber, sessionData, res) {
  const sessionId = `sess_${admissionNumber}_${Date.now()}`;
  
  const session = {
    sessionId,
    username: admissionNumber,
    vlan: sessionData.vlan || 'student_vlan',
    bandwidth: sessionData.bandwidth || '10Mbps',
    accessLevel: sessionData.accessLevel || 'STUDENT_ACCESS',
    startTime: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    ipAddress: sessionData.ipAddress || 'dynamic',
    macAddress: sessionData.macAddress || 'unknown',
    status: 'active'
  };

  activeSessions.set(sessionId, session);
  
  console.log(`[SESSION-MANAGER] Created session ${sessionId} for ${admissionNumber}`);
  
  return res.status(201).json({
    message: 'Session created successfully',
    session
  });
}

function terminateSession(admissionNumber, sessionId, res) {
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }

  if (session.username !== admissionNumber) {
    return res.status(403).json({ message: 'Not authorized to terminate this session' });
  }

  session.status = 'terminated';
  session.endTime = new Date().toISOString();
  
  activeSessions.delete(sessionId);
  
  console.log(`[SESSION-MANAGER] Terminated session ${sessionId} for ${admissionNumber}`);
  
  return res.status(200).json({
    message: 'Session terminated successfully',
    session
  });
}
