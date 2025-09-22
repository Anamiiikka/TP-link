import { getToken } from "next-auth/jwt";

const KEYCLOAK_ADMIN_URL = "http://localhost:8080/admin/realms/campus";

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

    switch (req.method) {
      case 'GET':
        return await fetchKeycloakUsers(req, res, token);
      
      case 'POST':
        return await updateKeycloakUser(req, res, token);
      
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Keycloak admin API error:', error);
    res.status(500).json({ message: 'Failed to connect to Keycloak' });
  }
}

async function getAdminAccessToken() {
  try {
    // Get admin token from Keycloak
    const response = await fetch('http://localhost:8080/realms/master/protocol/openid-connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: 'admin-cli',
        // In production, use proper client credentials
        username: 'admin',
        password: 'admin',
        grant_type: 'password'
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.access_token;
    } else {
      throw new Error('Failed to get admin token');
    }
  } catch (error) {
    console.error('Admin token error:', error);
    throw error;
  }
}

async function fetchKeycloakUsers(req, res, sessionToken) {
  try {
    // Get admin access token
    const adminToken = await getAdminAccessToken();
    
    // Fetch users from Keycloak
    const usersResponse = await fetch(`${KEYCLOAK_ADMIN_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!usersResponse.ok) {
      throw new Error('Failed to fetch users from Keycloak');
    }

    const users = await usersResponse.json();
    
    // Enhance users with role and session information
    const enhancedUsers = await Promise.all(users.map(async (user) => {
      try {
        // Get user roles
        const rolesResponse = await fetch(`${KEYCLOAK_ADMIN_URL}/users/${user.id}/role-mappings/realm`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });
        
        const userRoles = rolesResponse.ok ? await rolesResponse.json() : [];
        const roleNames = userRoles.map(role => role.name);
        
        // Determine user status
        const isUnconfirmed = roleNames.some(role => role.toLowerCase() === 'unconfirmed');
        const isBlocked = !user.enabled;
        
        let status = 'approved';
        if (isBlocked) status = 'blocked';
        else if (isUnconfirmed) status = 'pending';
        
        // Determine network access
        let networkAccess = 'granted';
        if (isBlocked || isUnconfirmed) networkAccess = 'blocked';
        
        // Mock current session (in production, get from session store)
        let currentSession = null;
        if (status === 'approved' && user.enabled) {
          const isStudent = roleNames.some(role => role.toLowerCase().includes('student'));
          const isFaculty = roleNames.some(role => role.toLowerCase().includes('faculty'));
          const isAdmin = roleNames.some(role => role.toLowerCase().includes('administrator'));
          
          if (Math.random() > 0.5) { // 50% chance of active session
            currentSession = {
              vlan: isAdmin ? 'admin_vlan' : isFaculty ? 'faculty_vlan' : 'student_vlan',
              bandwidth: isAdmin ? '100Mbps' : isFaculty ? '50Mbps' : '10Mbps',
              ipAddress: `192.168.${isAdmin ? '3' : isFaculty ? '2' : '1'}.${Math.floor(Math.random() * 200) + 10}`,
              sessionStart: new Date(Date.now() - Math.floor(Math.random() * 7200000)).toISOString() // Random time in last 2 hours
            };
          }
        }

        return {
          id: user.id,
          admissionNumber: user.username,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
          email: user.email || 'No email set',
          roles: roleNames,
          status: status,
          networkAccess: networkAccess,
          enabled: user.enabled,
          lastLogin: user.attributes?.lastLogin?.[0] || null,
          registrationDate: new Date(user.createdTimestamp).toISOString(),
          currentSession: currentSession
        };
      } catch (error) {
        console.error(`Error processing user ${user.username}:`, error);
        return {
          id: user.id,
          admissionNumber: user.username,
          name: user.username,
          email: user.email || 'No email set',
          roles: [],
          status: 'unknown',
          networkAccess: 'unknown',
          enabled: user.enabled,
          lastLogin: null,
          registrationDate: new Date(user.createdTimestamp).toISOString(),
          currentSession: null
        };
      }
    }));

    // Filter based on query parameters
    const { filter } = req.query;
    let filteredUsers = enhancedUsers;
    
    if (filter === 'pending') {
      filteredUsers = enhancedUsers.filter(user => user.status === 'pending');
    } else if (filter === 'active') {
      filteredUsers = enhancedUsers.filter(user => user.currentSession !== null);
    }

    // Log admin action
    const adminNumber = sessionToken.preferred_username || sessionToken.sub;
    console.log(`[ADMIN-AUDIT] ${adminNumber}: VIEW_KEYCLOAK_USERS filter=${filter}`);
    
    return res.status(200).json({
      users: filteredUsers,
      totalUsers: filteredUsers.length,
      pendingUsers: enhancedUsers.filter(user => user.status === 'pending').length,
      activeUsers: enhancedUsers.filter(user => user.currentSession !== null).length
    });

  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ message: 'Failed to fetch users from Keycloak' });
  }
}

async function updateKeycloakUser(req, res, sessionToken) {
  const { admissionNumber, action, reason, userId } = req.body;
  
  try {
    const adminToken = await getAdminAccessToken();
    const adminNumber = sessionToken.preferred_username || sessionToken.sub;
    
    console.log(`[ADMIN-AUDIT] ${adminNumber}: ${action.toUpperCase()}_USER target=${admissionNumber} reason="${reason}"`);
    
    switch (action) {
      case 'approve':
        // Remove unconfirmed role
        await removeUserRole(adminToken, userId, 'unconfirmed');
        break;
        
      case 'block':
        // Disable user account
        await updateUserEnabled(adminToken, userId, false);
        break;
        
      case 'unblock':
        // Enable user account
        await updateUserEnabled(adminToken, userId, true);
        break;
        
      case 'terminate_session':
        // In production, this would invalidate active sessions
        console.log(`Session termination requested for ${admissionNumber}`);
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    return res.status(200).json({
      message: `User ${action} successful`,
      admissionNumber: admissionNumber,
      action: action,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Failed to update user in Keycloak' });
  }
}

async function removeUserRole(adminToken, userId, roleName) {
  // Get role ID
  const rolesResponse = await fetch(`${KEYCLOAK_ADMIN_URL}/roles`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  
  const roles = await rolesResponse.json();
  const role = roles.find(r => r.name === roleName);
  
  if (role) {
    // Remove role from user
    await fetch(`${KEYCLOAK_ADMIN_URL}/users/${userId}/role-mappings/realm`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([role])
    });
  }
}

async function updateUserEnabled(adminToken, userId, enabled) {
  await fetch(`${KEYCLOAK_ADMIN_URL}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      enabled: enabled
    })
  });
}
