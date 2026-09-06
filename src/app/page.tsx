const metrics = [
  ['Confirmed bookings', '0'],
  ['Tickets pending', '0'],
  ['Active flights', '0'],
  ['Provider alerts', '0'],
];

export default function HomePage() {
  return (
    <div className="shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand">Expodia Flights</div>
        <nav className="nav">
          <a href="/" aria-current="page">Dashboard</a>
          <a href="/bookings/new">New booking</a>
          <a href="/bookings">Bookings</a>
          <a href="/passengers">Passengers</a>
          <a href="/tickets">Tickets</a>
          <a href="/tracking">Flight tracking</a>
          <a href="/notifications">Notifications</a>
          <a href="/audit">Audit</a>
        </nav>
      </aside>

      <main className="main">
        <header className="header">
          <div className="headerTitle">Agent workspace</div>
          <div className="status"><span className="statusDot" aria-hidden="true" /> System ready</div>
        </header>

        <section className="content">
          <div className="pageIntro">
            <div>
              <h1>Good morning. Ready to book?</h1>
              <p className="subtitle">Search live provider inventory, confirm the fare, and let the connected systems execute the booking.</p>
            </div>
            <a href="/bookings/new"><button className="primary">New booking</button></a>
          </div>

          <div className="grid" aria-label="Operational metrics">
            {metrics.map(([label, value]) => (
              <div className="card" key={label}>
                <div className="metricLabel">{label}</div>
                <div className="metricValue">{value}</div>
              </div>
            ))}
          </div>

          <div className="panel card">
            <div className="panelHeader"><h2 className="panelTitle">Recent activity</h2></div>
            <div className="empty">No production activity yet. Confirmed searches, bookings, tickets, tracking events, notifications, and audit events will appear here only after they actually occur.</div>
          </div>

          <div className="notice">
            Provider connection is not configured yet. Expodia Flights will not display invented inventory or simulated booking activity. Connect an approved flight-ticket provider before production search and booking are enabled.
          </div>
        </section>
      </main>
    </div>
  );
}
