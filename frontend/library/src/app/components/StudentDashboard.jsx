import React from 'react';

const BookRow = ({book}) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded-lg px-2 transition-colors duration-200">
    <div>
      <div className="font-semibold text-gray-800">{book.title}</div>
      <div className="text-sm text-gray-600">{book.author}</div>
    </div>
    <div className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded-full">{book.due ? `Due ${book.due}` : 'Available'}</div>
  </div>
);

const ProgressBar = ({label, value, max, color}) => (
  <div className="mb-4">
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-800 font-medium">{value} days</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className={`h-2 rounded-full ${color} transition-all duration-500`} style={{width: `${Math.min((value/max)*100, 100)}%`}}></div>
    </div>
  </div>
);

export default function StudentDashboard({data}){
  const defaults = {
    name: 'John Doe',
    borrowed: [
      {id:1, title:'Eloquent JavaScript', author:'Marijn Haverbeke', due:'Sep 28'},
      {id:2, title:'The Pragmatic Programmer', author:'Andrew Hunt', due:'Oct 2'},
    ],
    recommendations: [
      {id:1, title:'You Don\'t Know JS', author:'Kyle Simpson'},
      {id:2, title:'Refactoring', author:'Martin Fowler'},
    ],
    readingStreak: 7,
    favoriteGenres: ['Fiction', 'Technology', 'Science'],
  };

  // Merge provided data with defaults to ensure arrays exist
  const sample = {
    ...defaults,
    ...(data || {}),
    borrowed: Array.isArray(data?.borrowed) ? data.borrowed : defaults.borrowed,
    recommendations: Array.isArray(data?.recommendations) ? data.recommendations : defaults.recommendations,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6 animate-fade-in">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Welcome, {sample.name} 👋
        </h1>
        <p className="text-gray-600 text-lg">Here's your library overview and curated recommendations.</p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              📖 Your Borrowed Books
              <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">{(sample.borrowed || []).length} active</span>
            </h3>
            {(sample.borrowed || []).length === 0 ? (
              <div className="text-gray-500 py-4 text-center">You have no borrowed books right now.</div>
            ) : (
              <div>
                {(sample.borrowed || []).map(b => <BookRow key={b.id} book={b} />)}
              </div>
            )}
            <div className="flex flex-wrap gap-3 mt-4">
              <button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md">🔄 Renew All</button>
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md">📅 Request Extension</button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              🔥 Reading Streak
              <span className="ml-2 text-2xl">🔥</span>
            </h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">{sample.readingStreak}</div>
              <div className="text-gray-600">days in a row</div>
              <ProgressBar label="This Week" value={sample.readingStreak} max={7} color="bg-orange-500" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              💡 Recommended for You
              <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Personalized</span>
            </h3>
            <ul className="space-y-3">
              {(sample.recommendations || []).map(r => (
                <li key={r.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded-lg px-2 transition-colors duration-200">
                  <div>
                    <strong className="text-gray-800">{r.title}</strong>
                    <div className="text-sm text-gray-600">{r.author}</div>
                  </div>
                  <button className="bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105">❤️ Add to Wishlist</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">📚 Your Favorite Genres</h3>
            <div className="flex flex-wrap gap-2">
              {sample.favoriteGenres.map((genre, index) => (
                <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  {genre}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">� Library Tips</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Check due dates to avoid fines.</li>
              <li>Use the reading rooms during quiet hours.</li>
              <li>Reserve popular titles in advance.</li>
              <li>Keep your reading streak going! 📚</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}
