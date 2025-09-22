import React from 'react';

const StatCard = ({title, value, accent, icon, trend}) => (
  <div className={`relative overflow-hidden bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border-l-4 ${accent || 'border-blue-500'} transform hover:scale-105 group`}>
    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-3">
        <div className="text-gray-600 text-sm font-semibold uppercase tracking-wider">{title}</div>
        <span className="text-3xl filter drop-shadow-lg">{icon}</span>
      </div>
      <div className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">{value}</div>
      {trend && (
        <div className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-500'} flex items-center`}>
          <span className="mr-1">{trend > 0 ? '↗️' : '↘️'}</span>
          {Math.abs(trend)}% from last month
        </div>
      )}
    </div>
  </div>
);

const ProgressBar = ({label, value, max, color, percentage}) => (
  <div className="mb-6">
    <div className="flex justify-between items-center text-sm mb-2">
      <span className="text-gray-700 font-medium">{label}</span>
      <span className="text-gray-800 font-bold">{percentage || Math.round((value/max)*100)}%</span>
    </div>
    <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3 shadow-inner">
      <div 
        className={`h-3 rounded-full ${color} transition-all duration-1000 ease-out shadow-lg relative overflow-hidden`} 
        style={{width: `${percentage || (value/max)*100}%`}}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
      </div>
    </div>
  </div>
);

const ActivityItem = ({activity}) => (
  <li className="flex justify-between items-start py-4 border-b border-gray-100 last:border-b-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl px-4 transition-all duration-300 group">
    <div className="flex items-start space-x-3">
      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 group-hover:scale-150 transition-transform duration-300"></div>
      <div className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors duration-300">{activity.text}</div>
    </div>
    <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full group-hover:bg-blue-100 group-hover:text-blue-700 transition-all duration-300">{activity.time}</div>
  </li>
);

export default function AdminDashboard({data, session, onLogout}){
  const userName = session?.user?.name || session?.user?.preferred_username || session?.user?.email || 'Administrator';
  
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

  const sample = {
    ...defaults,
    ...(data || {}),
    recentActivities: Array.isArray(data?.recentActivities) ? data.recentActivities : defaults.recentActivities,
    notifications: Array.isArray(data?.notifications) ? data.notifications : defaults.notifications,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl mb-6 transform hover:rotate-12 transition-transform duration-500">
            <span className="text-3xl">🎓</span>
          </div>
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
            LMS Control Center
          </h1>
          <p className="text-xl text-gray-600 mb-6 font-medium">Empower learning, track progress, shape futures</p>
          <div className="flex justify-center items-center gap-6 text-sm">
            <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700 font-medium">Welcome, {userName}</span>
            </div>
            <button 
              onClick={onLogout}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              🚪 Logout
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Courses" value={sample.totalCourses} accent="border-emerald-500" icon="📚" trend={12} />
          <StatCard title="Total Students" value={sample.totalStudents.toLocaleString()} accent="border-blue-500" icon="👥" trend={8} />
          <StatCard title="Active Lessons" value={sample.activeLessons} accent="border-amber-500" icon="📖" trend={5} />
          <StatCard title="Completion Rate" value={`${sample.completionRate}%`} accent="border-green-500" icon="✅" trend={3} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/50">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm mr-3">📊</span>
                Live Activity Stream
                <span className="ml-3 bg-gradient-to-r from-green-400 to-green-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse shadow-lg">Live</span>
              </h3>
              <ul className="space-y-1">
                {(sample.recentActivities || []).map(act => <ActivityItem key={act.id} activity={act} />)}
              </ul>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/50">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-sm mr-3">🚀</span>
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-2">
                  <span className="text-xl">➕</span>
                  <span>Create Course</span>
                </button>
                <button className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-white px-6 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-2">
                  <span className="text-xl">👤</span>
                  <span>Manage Students</span>
                </button>
                <button className="bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 hover:from-teal-600 hover:via-teal-700 hover:to-teal-800 text-white px-6 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-2">
                  <span className="text-xl">📈</span>
                  <span>Analytics</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/50">
              <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
                <span className="w-6 h-6 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center text-white text-sm mr-3">📈</span>
                Course Analytics
              </h3>
              <ProgressBar label="Active Enrollments" value={892} max={1247} color="bg-gradient-to-r from-green-400 to-green-600" percentage={71} />
              <ProgressBar label="Completed Courses" value={156} max={200} color="bg-gradient-to-r from-blue-400 to-blue-600" percentage={78} />
              <ProgressBar label="In Progress" value={67} max={200} color="bg-gradient-to-r from-yellow-400 to-orange-500" percentage={34} />
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/50">
              <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
                <span className="w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center text-white text-sm mr-3">🔔</span>
                Alerts & Notifications
              </h3>
              <ul className="space-y-4">
                {(sample.notifications || []).map(notif => (
                  <li key={notif.id} className="flex items-start space-x-3 p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border hover:shadow-lg transition-all duration-300 group">
                    <span className="text-2xl">{notif.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                    <div className="flex-1">
                      <div className="text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors duration-300">{notif.message}</div>
                      <div className="text-xs text-gray-500 mt-1 group-hover:text-gray-600 transition-colors duration-300">{notif.time}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/50">
              <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
                <span className="w-6 h-6 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg flex items-center justify-center text-white text-sm mr-3">⚙️</span>
                System Health
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                  <span className="text-gray-700 font-medium">LMS Platform</span>
                  <span className="bg-gradient-to-r from-green-400 to-green-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse shadow-lg">Operational</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                  <span className="text-gray-700 font-medium">Video Streaming</span>
                  <span className="bg-gradient-to-r from-blue-400 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse shadow-lg">Online</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                  <span className="text-gray-700 font-medium">Assignment Engine</span>
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse shadow-lg">Maintenance</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
