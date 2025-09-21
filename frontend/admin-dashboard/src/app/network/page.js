"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function NetworkManagement() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, pendingUsers: 0, activeUsers: 0 });
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionLog, setActionLog] = useState([]);

  useEffect(() => {
    if (session) {
      loadUsers();
      // Auto-refresh every 10 seconds
      const interval = setInterval(loadUsers, 10000);
      return () => clearInterval(interval);
    }
  }, [session, filter]);

  async function loadUsers() {
    try {
      const response = await fetch(`/api/admin/keycloak-users${filter !== 'all' ? `?filter=${filter}` : ''}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setStats({
          totalUsers: data.totalUsers,
          pendingUsers: data.pendingUsers,
          activeUsers: data.activeUsers
        });
      } else {
        console.error('Failed to load users:', response.statusText);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load users:', error);
      setLoading(false);
    }
  }

  async function handleUserAction(admissionNumber, action, reason = '') {
    try {
      const user = users.find(u => u.admissionNumber === admissionNumber);
      
      const response = await fetch('/api/admin/keycloak-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admissionNumber,
          userId: user.id, // Include user ID for Keycloak API
          action,
          reason
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add to action log
        setActionLog(prev => [{
          timestamp: new Date().toISOString(),
          action: action.toUpperCase(),
          target: admissionNumber,
          admin: session?.user?.name || 'Admin',
          reason: reason
        }, ...prev.slice(0, 9)]); // Keep last 10 actions
        
        // Refresh users
        loadUsers();
        
        alert(`${action.charAt(0).toUpperCase() + action.slice(1)} action completed for ${admissionNumber}`);
      } else {
        alert('Action failed. Please try again.');
      }
    } catch (error) {
      console.error('Action failed:', error);
      alert('Action failed. Please check your connection.');
    }
  }

  function promptAction(admissionNumber, action) {
    const reason = prompt(`Reason for ${action}:`, '');
    if (reason !== null) {
      handleUserAction(admissionNumber, action, reason);
    }
  }

  if (!session) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>Please login as admin to access Network Management</h2>
      </div>
    );
  }

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    margin: 10,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  };

  const buttonStyle = {
    padding: '6px 12px',
    borderRadius: 4,
    border: 'none',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 12,
    margin: '0 2px'
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: 20
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: 32, 
          fontWeight: 700, 
          color: '#1f2937',
          marginBottom: 30
        }}>
          🛡️ Network Access Management
        </h1>

        {/* Stats Dashboard */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 20,
          marginBottom: 30
        }}>
          <div style={{...cardStyle, borderLeft: '4px solid #3b82f6'}}>
            <h3 style={{ color: '#1e40af', margin: 0 }}>Total Users</h3>
            <p style={{ fontSize: 28, fontWeight: 700, margin: '10px 0', color: '#1d4ed8' }}>
              {stats.totalUsers}
            </p>
          </div>
          
          <div style={{...cardStyle, borderLeft: '4px solid #f59e0b'}}>
            <h3 style={{ color: '#d97706', margin: 0 }}>Pending Approval</h3>
            <p style={{ fontSize: 28, fontWeight: 700, margin: '10px 0', color: '#b45309' }}>
              {stats.pendingUsers}
            </p>
          </div>
          
          <div style={{...cardStyle, borderLeft: '4px solid #10b981'}}>
            <h3 style={{ color: '#059669', margin: 0 }}>Active Sessions</h3>
            <p style={{ fontSize: 28, fontWeight: 700, margin: '10px 0', color: '#047857' }}>
              {stats.activeUsers}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          {/* Users Management */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3>User Management</h3>
              <div>
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #d1d5db', marginRight: 10 }}
                >
                  <option value="all">All Users</option>
                  <option value="pending">Pending Approval</option>
                  <option value="active">Active Sessions</option>
                </select>
                <button 
                  onClick={loadUsers}
                  style={{...buttonStyle, backgroundColor: '#6b7280', color: 'white'}}
                >
                  Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <p>Loading users...</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: 12, textAlign: 'left' }}>Identity</th>
                      <th style={{ padding: 12, textAlign: 'left' }}>Name</th>
                      <th style={{ padding: 12, textAlign: 'left' }}>Status</th>
                      <th style={{ padding: 12, textAlign: 'left' }}>Network</th>
                      <th style={{ padding: 12, textAlign: 'left' }}>Session</th>
                      <th style={{ padding: 12, textAlign: 'left' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={user.admissionNumber} style={{ 
                        borderBottom: '1px solid #f3f4f6',
                        backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white'
                      }}>
                        <td style={{ padding: 12, fontWeight: 600, fontFamily: 'monospace' }}>
                          {user.admissionNumber}
                        </td>
                        <td style={{ padding: 12 }}>
                          <div>
                            <div style={{ fontWeight: 500 }}>{user.name}</div>
                            <div style={{ fontSize: 12, color: '#6b7280' }}>{user.email}</div>
                          </div>
                        </td>
                        <td style={{ padding: 12 }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: 4,
                            fontSize: 12,
                            fontWeight: 600,
                            backgroundColor: 
                              user.status === 'approved' ? '#dcfce7' :
                              user.status === 'pending' ? '#fef3c7' : '#fee2e2',
                            color:
                              user.status === 'approved' ? '#16a34a' :
                              user.status === 'pending' ? '#d97706' : '#dc2626'
                          }}>
                            {user.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: 12 }}>
                          <span style={{
                            padding: '2px 6px',
                            backgroundColor: '#dbeafe',
                            color: '#1e40af',
                            borderRadius: 4,
                            fontSize: 11
                          }}>
                            {user.networkAccess.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: 12 }}>
                          {user.currentSession ? (
                            <div style={{ fontSize: 12 }}>
                              <div>{user.currentSession.vlan}</div>
                              <div style={{ color: '#6b7280' }}>{user.currentSession.ipAddress}</div>
                            </div>
                          ) : (
                            <span style={{ color: '#9ca3af', fontSize: 12 }}>No session</span>
                          )}
                        </td>
                        <td style={{ padding: 12 }}>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {user.status === 'pending' && (
                              <button
                                onClick={() => handleUserAction(user.admissionNumber, 'approve')}
                                style={{...buttonStyle, backgroundColor: '#10b981', color: 'white'}}
                              >
                                Approve
                              </button>
                            )}
                            
                            {user.status !== 'blocked' && (
                              <button
                                onClick={() => promptAction(user.admissionNumber, 'block')}
                                style={{...buttonStyle, backgroundColor: '#ef4444', color: 'white'}}
                              >
                                Block
                              </button>
                            )}
                            
                            {user.status === 'blocked' && (
                              <button
                                onClick={() => handleUserAction(user.admissionNumber, 'unblock')}
                                style={{...buttonStyle, backgroundColor: '#3b82f6', color: 'white'}}
                              >
                                Unblock
                              </button>
                            )}
                            
                            {user.currentSession && (
                              <button
                                onClick={() => handleUserAction(user.admissionNumber, 'terminate_session')}
                                style={{...buttonStyle, backgroundColor: '#f59e0b', color: 'white'}}
                              >
                                Disconnect
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Action Log */}
          <div style={cardStyle}>
            <h3 style={{ marginBottom: 20 }}>Recent Actions</h3>
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {actionLog.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center' }}>No recent actions</p>
              ) : (
                actionLog.map((log, index) => (
                  <div key={index} style={{
                    padding: 12,
                    borderBottom: '1px solid #f3f4f6',
                    fontSize: 12
                  }}>
                    <div style={{ fontWeight: 600, color: '#1f2937' }}>
                      {log.action} - {log.target}
                    </div>
                    <div style={{ color: '#6b7280', marginTop: 4 }}>
                      By: {log.admin}
                    </div>
                    <div style={{ color: '#6b7280' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                    {log.reason && (
                      <div style={{ color: '#9ca3af', fontStyle: 'italic', marginTop: 2 }}>
                        "{log.reason}"
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
