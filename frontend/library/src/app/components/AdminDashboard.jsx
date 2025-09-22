import React from 'react';

// Sidebar navigation items
const sidebarItems = [
  { icon: '🏠', label: 'Dashboard', active: true },
  { icon: '👥', label: 'Students' },
  { icon: '📚', label: 'Books Available' },
  { icon: '🔄', label: 'Book Issued/Return' },
  { icon: '💸', label: 'Fees pending' },
  { icon: '💖', label: 'Wishlist' },
  { icon: '⚙️', label: 'Settings' },
];

const StatCard = ({title, value, accent, icon, trend, description}) => (
  <div className={`relative overflow-hidden bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 ${accent} transform hover:scale-105 group cursor-pointer`}>
    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/10 to-blue-400/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <span className="text-4xl filter drop-shadow-lg">{icon}</span>
        <div className="text-right">
          <div className="text-2xl font-black text-gray-800">{value}</div>
          {trend && (
            <div className={`text-sm font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-500'} flex items-center justify-end`}>
              <span className="mr-1">{trend > 0 ? '↗️' : '↘️'}</span>
              {Math.abs(trend)}%
            </div>
          )}
        </div>
      </div>
      <div className="text-gray-600 font-semibold text-sm uppercase tracking-wider mb-1">{title}</div>
      <div className="text-xs text-gray-500">{description}</div>
    </div>
  </div>
);

export default function AdminDashboard({data, session, onLogout}) {
  const adminName = session?.user?.name || session?.user?.preferred_username || session?.user?.email || 'Administrator';
  
  const defaults = {
    totalStudents: 2589,
    booksAvailable: 22589,
    booksIssued: 15,
    booksDue: 250,
    feesPending: [
      { id: 1, student: 'Alony Haust', date: 'May 25,2023', amount: '$31.48', status: 'Pending' },
      { id: 2, student: 'Jimmy Fermin', date: 'May 31,2023', amount: '$50.18', status: 'Pending' },
    ],
    studentProfile: [
      { id: 1, name: 'Wade Warren', class: '2nd Year BTech', doj: 'May 20,2023', status: 'Approved' },
      { id: 2, name: 'Robert Fox', class: '3rd Year BTech', doj: 'May 12,2023', status: 'Approved' },
    ],
    bookIssued: [
      { id: 1, sno: 'A02', student: 'Floyd Miles', book: 'The Journey Within', issued: 'May 22,2023', return: 'July 20,2023', status: 'Paid' },
      { id: 2, sno: 'A05', student: 'Robert Fox', book: 'Hidden Secrets', issued: 'May 21,2023', return: 'Aug 10,2023', status: 'Pending' },
      { id: 3, sno: 'AC04', student: 'Guy Hawkins', book: 'Beyond Boundaries', issued: 'April 10,2023', return: 'May 20,2023', status: 'Paid' },
      { id: 4, sno: 'A09', student: 'Jenny Wilson', book: 'Serenity Found', issued: 'April 30,2023', return: 'Dec 20,2023', status: 'Paid' },
      { id: 5, sno: 'A05', student: 'Jerry Wilson', book: 'The Mother', issued: 'April 20,2023', return: 'Dec 23,2023', status: 'Paid' },
    ],
    wishlist: [
      { id: 1, title: 'Dont Make Me Think', author: 'Steve Krug, 2000' },
      { id: 2, title: 'The Design of Everyday Things', author: 'Don Norman, 1988' },
      { id: 3, title: 'Rich Dad Poor Dad', author: 'Robert T. Kiyosaki, 1997' },
    ],
  };
  const sample = { ...defaults, ...(data || {}) };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="flex relative z-10">
        {/* Enhanced Sidebar */}
        <aside className="w-72 bg-gradient-to-b from-purple-600 via-purple-700 to-indigo-800 text-white flex flex-col p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
          
          <div className="relative z-10">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-3">
                <span className="text-2xl">📚</span>
              </div>
              <div className="font-black text-2xl tracking-wide">Library Pro</div>
            </div>

            <nav className="flex-1 space-y-2">
              {sidebarItems.map((item, i) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-300 group ${
                    item.active 
                      ? 'bg-white text-purple-600 shadow-lg' 
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="text-xl group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">{item.label}</span>
                </div>
              ))}
            </nav>

            <div className="mt-8 space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
                <div className="font-semibold mb-2">Want to upgrade?</div>
                <button className="bg-white text-purple-600 px-6 py-2 rounded-xl font-bold hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105">
                  Upgrade Now
                </button>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                <img 
                  src="https://randomuser.me/api/portraits/men/32.jpg" 
                  alt="Admin" 
                  className="w-10 h-10 rounded-full border-2 border-white/30" 
                />
                <div className="flex-1">
                  <div className="font-semibold text-sm">{adminName}</div>
                  <div className="text-xs text-white/70">Library Admin</div>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="w-full bg-red-500/90 hover:bg-red-600 text-white py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 relative z-10">
          {/* Enhanced Top Bar */}
          <div className="flex justify-between items-center mb-8 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Welcome, {adminName}! 👋
              </h1>
              <p className="text-gray-600 font-medium">Manage your library ecosystem with ease</p>
            </div>
            <div className="flex gap-3">
              <input 
                type="date" 
                className="border-2 border-purple-200 rounded-xl px-4 py-2 font-semibold focus:border-purple-400 focus:outline-none transition-colors duration-300" 
              />
              <button className="bg-purple-100 text-purple-600 px-6 py-2 rounded-xl font-semibold hover:bg-purple-200 transition-all duration-300 transform hover:scale-105">
                📊 Sorting
              </button>
              <button className="bg-blue-100 text-blue-600 px-6 py-2 rounded-xl font-semibold hover:bg-blue-200 transition-all duration-300 transform hover:scale-105">
                🔍 Filter
              </button>
            </div>
          </div>

          {/* Enhanced Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Students"
              value={sample.totalStudents.toLocaleString()}
              accent="border-l-4 border-purple-500"
              icon="👥"
              trend={2.5}
              description="Active learners"
            />
            <StatCard
              title="Books Available"
              value={sample.booksAvailable.toLocaleString()}
              accent="border-l-4 border-blue-500"
              icon="📚"
              trend={1.8}
              description="In collection"
            />
            <StatCard
              title="Books Issued"
              value={sample.booksIssued}
              accent="border-l-4 border-teal-500"
              icon="📖"
              trend={-2.5}
              description="Currently out"
            />
            <StatCard
              title="Books Due"
              value={sample.booksDue}
              accent="border-l-4 border-amber-500"
              icon="⏰"
              trend={3.2}
              description="Return pending"
            />
          </div>

          {/* Enhanced Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Fees Pending */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-purple-600 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-sm mr-3">💸</span>
                  Fees Pending
                </h3>
                <button className="text-purple-400 hover:text-purple-600 font-semibold text-sm transition-colors duration-300">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-purple-400 border-b border-purple-100">
                      <th className="text-left py-2 font-semibold">Students</th>
                      <th className="text-left py-2 font-semibold">Date</th>
                      <th className="text-left py-2 font-semibold">Amount</th>
                      <th className="text-left py-2 font-semibold">Status</th>
                      <th className="text-left py-2 font-semibold">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sample.feesPending.map(row => (
                      <tr key={row.id} className="border-b border-gray-100 hover:bg-purple-50 transition-colors duration-200">
                        <td className="py-3 font-medium text-gray-700">{row.student}</td>
                        <td className="py-3 text-gray-600">{row.date}</td>
                        <td className="py-3 font-bold text-gray-800">{row.amount}</td>
                        <td className="py-3">
                          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">
                            {row.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <button className="text-purple-500 hover:text-purple-700 text-lg hover:scale-110 transition-all duration-200">🧾</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Student Profile */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-purple-600 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg flex items-center justify-center text-white text-sm mr-3">👥</span>
                  Student Profile
                </h3>
                <button className="text-purple-400 hover:text-purple-600 font-semibold text-sm transition-colors duration-300">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-purple-400 border-b border-purple-100">
                      <th className="text-left py-2 font-semibold">Students</th>
                      <th className="text-left py-2 font-semibold">Class</th>
                      <th className="text-left py-2 font-semibold">D.O.J</th>
                      <th className="text-left py-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sample.studentProfile.map(row => (
                      <tr key={row.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-200">
                        <td className="py-3 font-medium text-gray-700">{row.name}</td>
                        <td className="py-3 text-gray-600">{row.class}</td>
                        <td className="py-3 text-gray-600">{row.doj}</td>
                        <td className="py-3">
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Wishlist */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500">
              <h3 className="text-xl font-bold text-purple-600 mb-6 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm mr-3">💖</span>
                Wishlist
              </h3>
              <div className="space-y-4">
                {sample.wishlist.map(book => (
                  <div key={book.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-purple-50 transition-colors duration-300 group">
                    <div className="w-12 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
                      <span className="text-purple-600 text-lg">📖</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">{book.title}</div>
                      <div className="text-sm text-gray-500">{book.author}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Book Issued/Returned Table */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-purple-600 flex items-center">
                <span className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl flex items-center justify-center text-white mr-4">🔄</span>
                Book Issued / Returned
              </h3>
              <button className="text-purple-400 hover:text-purple-600 font-semibold transition-colors duration-300">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-purple-400 border-b-2 border-purple-100">
                    <th className="text-left py-3 font-bold">Sno.</th>
                    <th className="text-left py-3 font-bold">Student Name</th>
                    <th className="text-left py-3 font-bold">Book Name</th>
                    <th className="text-left py-3 font-bold">Issued Date</th>
                    <th className="text-left py-3 font-bold">Return Date</th>
                    <th className="text-left py-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sample.bookIssued.map(row => (
                    <tr key={row.id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-300">
                      <td className="py-4 font-bold text-purple-600">{row.sno}</td>
                      <td className="py-4 font-semibold text-gray-700">{row.student}</td>
                      <td className="py-4 text-gray-600">{row.book}</td>
                      <td className="py-4 text-gray-600">{row.issued}</td>
                      <td className="py-4 text-gray-600">{row.return}</td>
                      <td className="py-4">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                          row.status === 'Paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
