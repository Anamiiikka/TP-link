"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function NetworkMonitor() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState([]);
  const [radiusStats, setRadiusStats] = useState({ accepts: 0, rejects: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      loadNetworkData();
      // Refresh every 30 seconds
      const interval = setInterval(loadNetworkData, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  async function loadNetworkData() {
    try {
      // Load active sessions
      const sessionsResponse = await fetch('/api/network/sessions');
      const sessionsData = await sessionsResponse.json();
      setSessions(sessionsData.sessions || []);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load network data:', error);
      setLoading(false);
    }
  }

  async function testRADIUS() {
    try {
      const response = await fetch('/api/network/radius', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'Access-Request',
          username: session?.user?.name || 'test-user'
        })
      });
      
      const data = await response.json();
      console.log('RADIUS Test Result:', data);
      
      if (data.radiusResponse === 'Access-Accept') {
        setRadiusStats(prev => ({ ...prev, accepts: prev.accepts + 1 }));
      } else {
        setRadiusStats(prev => ({ ...prev, rejects: prev.rejects + 1 }));
      }
      
      // Refresh sessions after test
      loadNetworkData();
    } catch (error) {
      console.error('RADIUS test failed:', error);
    }
  }

  async function createTestSession() {
    try {
      const response = await fetch('/api/network/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vlan: 'student_vlan',
          bandwidth: '10Mbps',
          accessLevel: 'STUDENT_ACCESS',
          ipAddress: `192.168.1.${Math.floor(Math.random() * 100) + 100}`,
          macAddress: generateMacAddress()
        })
      });
      
      const data = await response.json();
      console.log('Session created:', data);
      loadNetworkData(); // Refresh
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  }

  function generateMacAddress() {
    const chars = '0123456789ABCDEF';
    let mac = '';
    for (let i = 0; i < 6; i++) {
      mac += chars.charAt(Math.floor(Math.random() * 16));
      mac += chars.charAt(Math.floor(Math.random() * 16));
      if (i < 5) mac += ':';
    }
    return mac;
  }

  if (!session) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>Please login to access Network Monitor</h2>
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

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: 20
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: 32, 
          fontWeight: 700, 
          color: '#1f2937',
          marginBottom: 30
        }}>
          🌐 Network Access Control Monitor
        </h1>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: 20,
          marginBottom: 30
        }}>
          <div style={{...cardStyle, borderLeft: '4px solid #10b981'}}>
            <h3 style={{ color: '#059669', margin: 0 }}>Active Sessions</h3>
            <p style={{ fontSize: 28, fontWeight: 700, margin: '10px 0', color: '#047857' }}>
              {sessions.length}
            </p>
          </div>
          
          <div style={{...cardStyle, borderLeft: '4px solid #3b82f6'}}>
            <h3 style={{ color: '#2563eb', margin: 0 }}>RADIUS Accepts</h3>
            <p style={{ fontSize: 28, fontWeight: 700, margin: '10px 0', color: '#1d4ed8' }}>
              {radiusStats.accepts}
            </p>
          </div>
          
          <div style={{...cardStyle, borderLeft: '4px solid #ef4444'}}>
            <h3 style={{ color: '#dc2626', margin: 0 }}>RADIUS Rejects</h3>
            <p style={{ fontSize: 28, fontWeight: 700, margin: '10px 0', color: '#b91c1c' }}>
              {radiusStats.rejects}
            </p>
          </div>
        </div>

        {/* Control Buttons */}
        <div style={{...cardStyle, textAlign: 'center', marginBottom: 30}}>
          <h3 style={{ marginBottom: 20 }}>Network Testing</h3>
          <button
            onClick={testRADIUS}
            style={{
              padding: '12px 24px',
              margin: '0 10px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              cursor: 'pointer'
            }}>
            Test RADIUS Authentication
          </button>
          
          <button
            onClick={createTestSession}
            style={{
              padding: '12px 24px',
              margin: '0 10px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              cursor: 'pointer'
            }}>
            Create Test Session
          </button>
          
          <button
            onClick={loadNetworkData}
            style={{
              padding: '12px 24px',
              margin: '0 10px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              cursor: 'pointer'
            }}>
            Refresh Data
          </button>
        </div>

        {/* Active Sessions Table */}
        <div style={cardStyle}>
          <h3 style={{ marginBottom: 20 }}>Active Network Sessions</h3>
          {loading ? (
            <p>Loading sessions...</p>
          ) : sessions.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No active sessions found. Create a test session to see data.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: 12, textAlign: 'left' }}>User Identity</th>
                    <th style={{ padding: 12, textAlign: 'left' }}>VLAN</th>
                    <th style={{ padding: 12, textAlign: 'left' }}>Bandwidth</th>
                    <th style={{ padding: 12, textAlign: 'left' }}>IP Address</th>
                    <th style={{ padding: 12, textAlign: 'left' }}>Start Time</th>
                    <th style={{ padding: 12, textAlign: 'left' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session, index) => (
                    <tr key={session.sessionId} style={{ 
                      borderBottom: '1px solid #f3f4f6',
                      backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white'
                    }}>
                      <td style={{ padding: 12, fontWeight: 600 }}>
                        {session.username}
                      </td>
                      <td style={{ padding: 12 }}>
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: '#dbeafe',
                          color: '#1e40af',
                          borderRadius: 4,
                          fontSize: 12
                        }}>
                          {session.vlan}
                        </span>
                      </td>
                      <td style={{ padding: 12 }}>{session.bandwidth}</td>
                      <td style={{ padding: 12 }}>{session.ipAddress}</td>
                      <td style={{ padding: 12 }}>
                        {new Date(session.startTime).toLocaleString()}
                      </td>
                      <td style={{ padding: 12 }}>
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: '#dcfce7',
                          color: '#16a34a',
                          borderRadius: 4,
                          fontSize: 12
                        }}>
                          {session.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
