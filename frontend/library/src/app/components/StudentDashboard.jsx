import React from 'react';

const sidebarItems = [
  { icon: '🏠', label: 'Dashboard', active: true },
  { icon: '📚', label: 'My Books' },
  { icon: '🔍', label: 'Search' },
  { icon: '💸', label: 'Fees' },
  { icon: '💖', label: 'Wishlist' },
  { icon: '⚙️', label: 'Settings' },
];

const BookCard = ({book, type = 'borrowed'}) => (
  <div className="bg-white/90 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50 transform hover:scale-105 hover:-translate-y-1 group relative overflow-hidden">
    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700"></div>
    <div className="relative z-10">
      <div className="flex items-start gap-4">
        <div className="w-16 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
          <span className="text-purple-600 text-2xl">📖</span>
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-lg text-gray-800 group-hover:text-purple-600 transition-colors duration-300 mb-2">{book.title}</h4>
          <p className="text-gray-600 mb-3 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            {book.author}
          </p>
          {type === 'borrowed' && book.due && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Due:</span>
              <span className="bg-gradient-to-r from-orange-400 to-red-400 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                {book.due}
              </span>
            </div>
          )}
          {type === 'recommendation' && (
            <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Add to Wishlist
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

const StatCard = ({title, value, icon, color, description}) => (
  <div className={`bg-white/90 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50 transform hover:scale-105 group relative overflow-hidden`}>
    <div className={`absolute top-0 right-0 w-20 h-20 ${color}/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700`}></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <span className="text-4xl filter drop-shadow-lg">{icon}</span>
        <div className="text-right">
          <div className="text-3xl font-black text-gray-800">{value}</div>
        </div>
      </div>
      <div className="text-gray-600 font-semibold text-sm uppercase tracking-wider mb-1">{title}</div>
      <div className="text-xs text-gray-500">{description}</div>
    </div>
  </div>
);

export default function StudentDashboard({data, session, onLogout}) {
  const studentName = session?.user?.name || session?.user?.preferred_username || session?.user?.email || 'Student';
  const studentId = session?.user?.sub || session?.user?.admission_number || 'N/A';

  const defaults = {
    borrowed: [
      { id: 1, title: 'Eloquent JavaScript', author: 'Marijn Haverbeke', due: 'Sep 28' },
      { id: 2, title: 'The Pragmatic Programmer', author: 'Andrew Hunt', due: 'Oct 2' },
    ],
    recommendations: [
      { id: 1, title: 'You Don\'t Know JS', author: 'Kyle Simpson' },
      { id: 2, title: 'Refactoring', author: 'Martin Fowler' },
    ],
    readingStreak: 7,
    favoriteGenres: ['Fiction', 'Technology', 'Science'],
  };
  const sample = {
    ...defaults,
    ...(data || {}),
    borrowed: Array.isArray(data?.borrowed) ? data.borrowed : defaults.borrowed,
    recommendations: Array.isArray(data?.recommendations) ? data.recommendations : defaults.recommendations,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Enhanced Top Bar */}
        <div className="bg-white/70 backdrop-blur-sm border-b border-white/50 shadow-lg">
          <div className="flex justify-between items-center px-8 py-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <span className="text-2xl">📚</span>
              </div>
              <div className="font-black text-3xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent tracking-wide">
                Library Pro
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <img 
                  src="https://randomuser.me/api/portraits/men/33.jpg" 
                  alt="Student" 
                  className="w-12 h-12 rounded-full border-3 border-purple-300 shadow-lg" 
                />
                <div className="text-right">
                  <div className="font-bold text-purple-600 text-lg">{studentName}</div>
                  <div className="text-sm text-purple-400">ID: {studentId}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="p-8">
          {/* Welcome Section */}
          <div className="text-center mb-10">
            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent leading-tight">
              Welcome back, {studentName}! 👋
            </h1>
            <p className="text-xl text-gray-600 font-medium">Your personal learning sanctuary awaits</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatCard
              title="Reading Streak"
              value={`${sample.readingStreak} days`}
              icon="📈"
              color="bg-gradient-to-r from-green-400 to-teal-500"
              description="Keep it up!"
            />
            <StatCard
              title="Books Borrowed"
              value={sample.borrowed.length}
              icon="📚"
              color="bg-gradient-to-r from-blue-400 to-purple-500"
              description="Currently reading"
            />
            <StatCard
              title="Favorite Genres"
              value={sample.favoriteGenres.length}
              icon="🎯"
              color="bg-gradient-to-r from-purple-400 to-pink-500"
              description="Your interests"
            />
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Borrowed Books */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-500">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-purple-600 flex items-center">
                  <span className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white mr-4">📖</span>
                  My Books
                  <span className="ml-3 bg-gradient-to-r from-purple-400 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {sample.borrowed.length} active
                  </span>
                </h3>
              </div>
              
              {sample.borrowed.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <div className="text-gray-500 font-medium text-lg">No books borrowed yet</div>
                  <p className="text-gray-400 mt-2">Start exploring our collection!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {sample.borrowed.map(book => <BookCard key={book.id} book={book} type="borrowed" />)}
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-2xl font-bold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2">
                  <span>🔍</span>
                  <span>Browse Library</span>
                </button>
                <button className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-6 py-3 rounded-2xl font-bold hover:from-teal-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2">
                  <span>📊</span>
                  <span>Reading Progress</span>
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Recommendations */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-500">
                <h3 className="text-xl font-bold text-purple-600 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm mr-3">✨</span>
                  Recommendations
                </h3>
                <div className="space-y-4">
                  {sample.recommendations.map(rec => <BookCard key={rec.id} book={rec} type="recommendation" />)}
                </div>
              </div>

              {/* Reading Progress */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-500">
                <h3 className="text-xl font-bold text-purple-600 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center text-white text-sm mr-3">📈</span>
                  Reading Streak
                </h3>
                <div className="text-center mb-6">
                  <div className="text-4xl font-black bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent mb-2">
                    {sample.readingStreak} Days
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-4 shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-teal-500 h-4 rounded-full shadow-lg transition-all duration-1000 ease-out relative overflow-hidden"
                      style={{width: `${Math.min((sample.readingStreak/30)*100, 100)}%`}}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"></div>
                    </div>
                  </div>
                  <div className="text-gray-600 font-medium">Keep up the amazing work!</div>
                </div>
              </div>

              {/* Favorite Genres */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-500">
                <h3 className="text-xl font-bold text-purple-600 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-sm mr-3">🎯</span>
                  Favorite Genres
                </h3>
                <div className="flex flex-wrap gap-3">
                  {sample.favoriteGenres.map((genre, i) => (
                    <span 
                      key={i} 
                      className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-600 px-4 py-2 rounded-full font-semibold hover:from-purple-200 hover:to-blue-200 transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-md"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
