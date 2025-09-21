import { getToken } from "next-auth/jwt";

// Mock database of users (in production, use PostgreSQL/MongoDB)
let mockUsers = [
  {
    admissionNumber: "14320803123",
    name: "John Student",
    email: "john@campus.edu",
    roles: ["Student"],
    status: "approved",
    networkAccess: "granted",
    lastLogin: new Date().toISOString(),
    registrationDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    currentSession: {
      vlan: "student_vlan",
      bandwidth: "10Mbps",
      ipAddress: "192.168.1.138"
    }
  },
  {
    admissionNumber: "12345678901", 
    name: "Jane Pending",
    email: "jane@campus.edu",
    roles: ["Student", "unconfirmed"],
    status: "pending",
    networkAccess: "blocked",
    lastLogin: null,
    registrationDate: new Date().toISOString(),
    currentSession: null
  },
  {
    admissionNumber: "98765432109",
    name: "Bob Faculty", 
    email: "bob@faculty.edu",
    roles: ["Faculty"],
    status: "approved",
    networkAccess: "granted",
    lastLogin: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    registrationDate: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
    currentSession: {
      vlan: "faculty_vlan",
      bandwidth: "50Mbps", 
      ipAddress: "192.168.2.45"
    }
  }
];

export default async function handler(req, res) {
  try {
    // Verify admin authentication
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check admin permissions
    let roles = [];
    if (token.access_token || token.accessToken) {
      const accessToken = token.access_token || token.accessToken;
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      roles = payload.realm_access?.roles || [];
    }

    const isAdmin = roles.some(role => role.toLowerCase().includes('administrator'));
    
    if (!isAdmin) {
      return res.status(403).json({ message: 'Admin privileges required' });
    }

    const adminNumber = token.preferred_username || token.sub;
    
    switch (req.method) {
      case 'GET':
        return getUsers(req, res, adminNumber);
      
      case 'POST':
        return updateUserStatus(req, res, adminNumber);
      
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Admin users API error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

function getUsers(req, res, adminNumber) {
  const { filter } = req.query;
  
  let filteredUsers = mockUsers;
  
  // Filter users based on query
  if (filter === 'pending') {
    filteredUsers = mockUsers.filter(user => user.status === 'pending');
  } else if (filter === 'active') {
    filteredUsers = mockUsers.filter(user => user.currentSession !== null);
  }

  console.log(`[ADMIN-AUDIT] ${adminNumber}: VIEW_USERS filter=${filter}`);
  
  return res.status(200).json({
    users: filteredUsers,
    totalUsers: filteredUsers.length,
    pendingUsers: mockUsers.filter(user => user.status === 'pending').length,
    activeUsers: mockUsers.filter(user => user.currentSession !== null).length
  });
}

function updateUserStatus(req, res, adminNumber) {
  const { admissionNumber, action, reason } = req.body;
  
  const userIndex = mockUsers.findIndex(user => user.admissionNumber === admissionNumber);
  
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  const user = mockUsers[userIndex];
  
  switch (action) {
    case 'approve':
      user.status = 'approved';
      user.networkAccess = 'granted';
      user.roles = user.roles.filter(role => role.toLowerCase() !== 'unconfirmed');
      break;
      
    case 'block':
      user.status = 'blocked';
      user.networkAccess = 'denied';
      user.currentSession = null; // Terminate session
      break;
      
    case 'unblock':
      user.status = 'approved';
      user.networkAccess = 'granted';
      break;
      
    case 'terminate_session':
      user.currentSession = null;
      break;
      
    default:
      return res.status(400).json({ message: 'Invalid action' });
  }

  console.log(`[ADMIN-AUDIT] ${adminNumber}: ${action.toUpperCase()}_USER target=${admissionNumber} reason="${reason}"`);
  
  return res.status(200).json({
    message: `User ${action} successful`,
    user: user,
    action: action,
    timestamp: new Date().toISOString()
  });
}
