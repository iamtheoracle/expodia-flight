'use client';

import { FormEvent, useState } from 'react';

export default function NewBookingPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="content">
      <div className="pageIntro">
        <div>
          <h1>New booking</h1>
          <p className="subtitle">Search for provider-backed inventory. Nothing is reserved until the provider confirms the booking.</p>
        </div>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
          <label>From<input name="origin" required placeholder="Airport or IATA" /></label>
          <label>To<input name="destination" required placeholder="Airport or IATA" /></label>
          <label>Departure<input name="departure" required type="date" /></label>
          <label>Return<input name="return" type="date" /></label>
          <label>Adults<input name="adults" required min="1" type="number" defaultValue="1" /></label>
          <label>Children<input name="children" min="0" type="number" defaultValue="0" /></label>
          <label>Infants<input name="infants" min="0" type="number" defaultValue="0" /></label>
          <label>Cabin<select name="cabin" defaultValue="ECONOMY"><option>ECONOMY</option><option>PREMIUM_ECONOMY</option><option>BUSINESS</option><option>FIRST</option></select></label>
        </div>
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="primary" type="submit">Search provider inventory</button>
        </div>
        {submitted && (
          <div className="notice" role="status">
            Production flight search is intentionally blocked until a real flight-ticket provider is configured. Expodia will never substitute invented availability or fares.
          </div>
        )}
      </form>
    </main>
  );
}
