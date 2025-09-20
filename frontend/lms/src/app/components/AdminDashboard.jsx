import React from 'react';

const StatCard = ({title, value, accent, icon}) => (
  <div className={`bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${accent || 'border-blue-500'} transform hover:scale-105`}>
    <div className="flex items-center justify-between mb-2">
      <div className="text-gray-600 text-sm font-medium">{title}</div>
      <span className="text-2xl">{icon}</span>
    </div>
    <div className="text-3xl font-bold text-gray-800">{value}</div>
  </div>
);

const ProgressBar = ({label, value, max, color}) => (
  <div className="mb-4">
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-800 font-medium">{value}/{max}</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className={`h-2 rounded-full ${color} transition-all duration-500`} style={{width: `${(value/max)*100}%`}}></div>
    </div>
  </div>
);

export default function AdminDashboard({data, session, onLogout}){
  const defaults = {
    totalCourses: 42,
    totalStudents: 1247,
    activeLessons: 156,
    completionRate: 78,
    recentActivities: [
      {id:1, text:'New student enrolled in "React Fundamentals"', time:'2h ago'},
      {id:2, text:'Assignment submitted in "Data Structures"', time:'4h ago'},
      {id:3, text:'Course "Machine Learning Basics" completed by 15 students', time:'1d ago'},
    ],
    notifications: [
      {id:1, type:'warning', message:'3 assignments pending review', time:'15m ago'},
      {id:2, type:'info', message:'New course materials uploaded', time:'2h ago'},
    ],
  };

  // Merge provided data with defaults to ensure arrays exist
  const sample = {
    ...defaults,
    ...(data || {}),
    recentActivities: Array.isArray(data?.recentActivities) ? data.recentActivities : defaults.recentActivities,
    notifications: Array.isArray(data?.notifications) ? data.notifications : defaults.notifications,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 animate-fade-in">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          🎓 LMS Admin Dashboard
        </h1>
        <p className="text-gray-600 text-lg">Manage courses, monitor progress, and oversee learning activities.</p>
        <div className="mt-4 flex justify-center gap-4">
          <span className="text-sm text-gray-600">Welcome, {session?.user?.name || session?.user?.email}</span>
          <button 
            onClick={onLogout}
            className="text-sm text-indigo-600 hover:text-indigo-800 underline"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Courses" value={sample.totalCourses} accent="border-teal-500" icon="�" />
        <StatCard title="Total Students" value={sample.totalStudents} accent="border-indigo-500" icon="👥" />
        <StatCard title="Active Lessons" value={sample.activeLessons} accent="border-amber-500" icon="📖" />
        <StatCard title="Completion Rate" value={`${sample.completionRate}%`} accent="border-green-500" icon="✅" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              📊 Recent Activity
              <span className="ml-2 bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">Live</span>
            </h3>
            <ul className="space-y-3">
              {(sample.recentActivities || []).map(act => (
                <li key={act.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded-lg px-2 transition-colors duration-200">
                  <div className="text-gray-700">{act.text}</div>
                  <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{act.time}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">🚀 Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md">
                ➕ Create Course
              </button>
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md">
                👤 Manage Students
              </button>
              <button className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md">
                📈 Analytics Report
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">📈 Course Analytics</h3>
            <ProgressBar label="Active Enrollments" value={892} max={1247} color="bg-green-500" />
            <ProgressBar label="Completed Courses" value={156} max={200} color="bg-blue-500" />
            <ProgressBar label="In Progress" value={67} max={200} color="bg-yellow-500" />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">🔔 Notifications</h3>
            <ul className="space-y-3">
              {(sample.notifications || []).map(notif => (
                <li key={notif.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-lg">{notif.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                  <div className="flex-1">
                    <div className="text-sm text-gray-700">{notif.message}</div>
                    <div className="text-xs text-gray-500 mt-1">{notif.time}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">⚙️ System Health</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">LMS Platform</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium animate-pulse">Operational</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Video Streaming</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium animate-pulse">Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Assignment Engine</span>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium animate-pulse">Maintenance</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}