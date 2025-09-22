
import React from 'react';

// Sidebar navigation items
const sidebarItems = [
  { icon: '🏠', label: 'Dashboard' },
  { icon: '👥', label: 'Students' },
  { icon: '📚', label: 'Books Available' },
  { icon: '🔄', label: 'Book Issued/Return' },
  { icon: '💸', label: 'Fees pending' },
  { icon: '💖', label: 'Wishlist' },
  { icon: '⚙️', label: 'Settings' },
];

export default function AdminDashboard({data}) {
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
      { id: 1, title: 'Don’t Make Me Think', author: 'Steve Krug, 2000' },
      { id: 2, title: 'The Design of Everyday Things', author: 'Don Norman, 1988' },
      { id: 3, title: 'Rich Dad Poor Dad', author: 'Robert T. Kiyosaki, 1997' },
    ],
  };
  const sample = { ...defaults, ...(data || {}) };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f6f0ff' }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: 'linear-gradient(180deg,#7c3aed 0%,#a78bfa 100%)', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24, borderRadius: 24, margin: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 24, marginBottom: 32, letterSpacing: 1 }}>Library Pro</div>
        <nav style={{ width: '100%' }}>
          {sidebarItems.map((item, i) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', borderRadius: 12, background: i === 0 ? '#fff' : 'transparent', color: i === 0 ? '#7c3aed' : '#fff', fontWeight: 600, marginBottom: 6, cursor: 'pointer', fontSize: 16 }}>
              <span>{item.icon}</span> {item.label}
            </div>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', width: '100%' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 16, color: '#7c3aed', textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Want to upgrade?</div>
            <button style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Upgrade now</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#ede9fe', borderRadius: 12, padding: 10 }}>
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Admin" style={{ width: 36, height: 36, borderRadius: '50%' }} />
            <div>
              <div style={{ fontWeight: 600, color: '#7c3aed' }}>Vanshika Pandey</div>
              <div style={{ fontSize: 13, color: '#7c3aed' }}>HR Manager</div>
            </div>
          </div>
          <button style={{ marginTop: 16, width: '100%', background: '#fff', color: '#7c3aed', border: 'none', borderRadius: 8, padding: '8px 0', fontWeight: 600, cursor: 'pointer' }}>Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 32 }}>
        {/* Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#7c3aed' }}>Welcome Saiba Sen! 👋</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <input type="date" style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 12px', fontSize: 15 }} />
            <button style={{ background: '#ede9fe', color: '#7c3aed', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 600, cursor: 'pointer' }}>Sorting</button>
            <button style={{ background: '#ede9fe', color: '#7c3aed', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 600, cursor: 'pointer' }}>Filter</button>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px #ede9fe', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', borderTop: '4px solid #7c3aed' }}>
            <div style={{ color: '#7c3aed', fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Total Students</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{sample.totalStudents}</div>
            <div style={{ color: '#22c55e', fontWeight: 600, fontSize: 14 }}>+2.5%</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px #ede9fe', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', borderTop: '4px solid #a78bfa' }}>
            <div style={{ color: '#a78bfa', fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Books available</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{sample.booksAvailable}</div>
            <div style={{ color: '#22c55e', fontWeight: 600, fontSize: 14 }}>+2.5%</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px #ede9fe', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', borderTop: '4px solid #7c3aed' }}>
            <div style={{ color: '#7c3aed', fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Book Issued</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{sample.booksIssued}</div>
            <div style={{ color: '#ef4444', fontWeight: 600, fontSize: 14 }}>-2.5%</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px #ede9fe', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', borderTop: '4px solid #a78bfa' }}>
            <div style={{ color: '#a78bfa', fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Book due for Return</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{sample.booksDue}</div>
            <div style={{ color: '#22c55e', fontWeight: 600, fontSize: 14 }}>+2.5%</div>
          </div>
        </div>

        {/* Fees Pending & Student Profile */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr', gap: 24, marginBottom: 32 }}>
          {/* Fees Pending */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px #ede9fe' }}>
            <div style={{ fontWeight: 700, color: '#7c3aed', marginBottom: 12 }}>Fees Pending <span style={{ float: 'right', color: '#a78bfa', fontWeight: 500, fontSize: 14, cursor: 'pointer' }}>View All</span></div>
            <table style={{ width: '100%', fontSize: 15 }}>
              <thead>
                <tr style={{ color: '#a78bfa', textAlign: 'left' }}>
                  <th>Students</th><th>Date</th><th>Amount</th><th>Status</th><th>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {sample.feesPending.map(row => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #f3e8ff' }}>
                    <td>{row.student}</td>
                    <td>{row.date}</td>
                    <td>{row.amount}</td>
                    <td><span style={{ background: '#fde68a', color: '#b45309', borderRadius: 8, padding: '2px 10px', fontWeight: 600 }}>{row.status}</span></td>
                    <td><span style={{ color: '#a78bfa', fontWeight: 700, cursor: 'pointer' }}>🧾</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Student Profile */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px #ede9fe' }}>
            <div style={{ fontWeight: 700, color: '#7c3aed', marginBottom: 12 }}>Student Profile <span style={{ float: 'right', color: '#a78bfa', fontWeight: 500, fontSize: 14, cursor: 'pointer' }}>View All</span></div>
            <table style={{ width: '100%', fontSize: 15 }}>
              <thead>
                <tr style={{ color: '#a78bfa', textAlign: 'left' }}>
                  <th>Students</th><th>Class</th><th>D.O.J</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sample.studentProfile.map(row => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #f3e8ff' }}>
                    <td>{row.name}</td>
                    <td>{row.class}</td>
                    <td>{row.doj}</td>
                    <td><span style={{ background: '#bbf7d0', color: '#15803d', borderRadius: 8, padding: '2px 10px', fontWeight: 600 }}>{row.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Wishlist */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px #ede9fe', minWidth: 220 }}>
            <div style={{ fontWeight: 700, color: '#7c3aed', marginBottom: 12 }}>Wishlist</div>
            {sample.wishlist.map(book => (
              <div key={book.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <img src={`https://covers.openlibrary.org/b/id/${book.id + 823415}-M.jpg`} alt={book.title} style={{ width: 44, height: 60, borderRadius: 8, objectFit: 'cover', background: '#ede9fe' }} />
                <div>
                  <div style={{ fontWeight: 600, color: '#7c3aed' }}>{book.title}</div>
                  <div style={{ fontSize: 13, color: '#a78bfa' }}>{book.author}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Book Issued/Returned Table */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px #ede9fe', marginBottom: 32 }}>
          <div style={{ fontWeight: 700, color: '#7c3aed', marginBottom: 12 }}>Book Issued / Returned <span style={{ float: 'right', color: '#a78bfa', fontWeight: 500, fontSize: 14, cursor: 'pointer' }}>View All</span></div>
          <table style={{ width: '100%', fontSize: 15 }}>
            <thead>
              <tr style={{ color: '#a78bfa', textAlign: 'left' }}>
                <th>Sno.</th><th>Student name</th><th>Book name</th><th>Issued date</th><th>Return date</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sample.bookIssued.map(row => (
                <tr key={row.id} style={{ borderBottom: '1px solid #f3e8ff' }}>
                  <td>{row.sno}</td>
                  <td>{row.student}</td>
                  <td>{row.book}</td>
                  <td>{row.issued}</td>
                  <td>{row.return}</td>
                  <td><span style={{ background: row.status === 'Paid' ? '#bbf7d0' : '#fde68a', color: row.status === 'Paid' ? '#15803d' : '#b45309', borderRadius: 8, padding: '2px 10px', fontWeight: 600 }}>{row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
