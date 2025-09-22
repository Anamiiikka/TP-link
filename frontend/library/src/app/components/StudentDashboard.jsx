

const sidebarItems = [
  { icon: '🏠', label: 'Dashboard' },
  { icon: '📚', label: 'My Books' },
  { icon: '🔍', label: 'Search' },
  { icon: '💸', label: 'Fees' },
  { icon: '💖', label: 'Wishlist' },
  { icon: '⚙️', label: 'Settings' },
];

export default function StudentDashboard({data}) {
  const defaults = {
    name: 'John Doe',
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
    <div style={{ minHeight: '100vh', background: '#f6f0ff', width: '100vw', margin: 0, padding: 0 }}>
      {/* Top Bar with Profile/Login/Logout */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '32px 48px 0 48px', width: '100%' }}>
        <div style={{ fontWeight: 700, fontSize: 28, color: '#7c3aed', letterSpacing: 1 }}>Library Pro</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src="https://randomuser.me/api/portraits/men/33.jpg" alt="Student" style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #a78bfa' }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 600, color: '#7c3aed', fontSize: 18 }}>{sample.name}</div>
            <div style={{ fontSize: 14, color: '#a78bfa' }}>Student</div>
          </div>
          <button style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 600, cursor: 'pointer', fontSize: 16 }}>Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 32px 0 32px', width: '100%' }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: '#7c3aed', marginBottom: 24, marginTop: 8 }}>Welcome, {sample.name} 👋</div>

        {/* Borrowed Books */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px #ede9fe', marginBottom: 32 }}>
          <div style={{ fontWeight: 700, color: '#7c3aed', marginBottom: 12 }}>Borrowed Books</div>
          <table style={{ width: '100%', fontSize: 15 }}>
            <thead>
              <tr style={{ color: '#a78bfa', textAlign: 'left' }}>
                <th>Title</th><th>Author</th><th>Due</th>
              </tr>
            </thead>
            <tbody>
              {sample.borrowed.map(book => (
                <tr key={book.id} style={{ borderBottom: '1px solid #f3e8ff' }}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td><span style={{ background: '#fde68a', color: '#b45309', borderRadius: 8, padding: '2px 10px', fontWeight: 600 }}>{book.due}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recommendations & Reading Streak */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32 }}>
          {/* Recommendations */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px #ede9fe' }}>
            <div style={{ fontWeight: 700, color: '#7c3aed', marginBottom: 12 }}>📚 Recommendations</div>
            {sample.recommendations.map(rec => (
              <div key={rec.id} style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, color: '#7c3aed' }}>{rec.title}</div>
                <div style={{ fontSize: 13, color: '#a78bfa' }}>{rec.author}</div>
              </div>
            ))}
          </div>
          {/* Reading Streak */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px #ede9fe' }}>
            <div style={{ fontWeight: 700, color: '#7c3aed', marginBottom: 12 }}>📈 Reading Streak</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#a78bfa', marginBottom: 8 }}>{sample.readingStreak} days</div>
            <div style={{ background: '#bbf7d0', height: 10, borderRadius: 8, width: `${Math.min((sample.readingStreak/30)*100, 100)}%`, transition: 'width 0.5s' }}></div>
            <div style={{ color: '#64748b', fontSize: 14, marginTop: 8 }}>Keep up the great work!</div>
          </div>
        </div>

        {/* Favorite Genres */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px #ede9fe', marginBottom: 32 }}>
          <div style={{ fontWeight: 700, color: '#7c3aed', marginBottom: 12 }}>🎯 Favorite Genres</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {sample.favoriteGenres.map((genre, i) => (
              <span key={i} style={{ background: '#ede9fe', color: '#7c3aed', padding: '6px 18px', borderRadius: 16, fontWeight: 600, fontSize: 15 }}>{genre}</span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

