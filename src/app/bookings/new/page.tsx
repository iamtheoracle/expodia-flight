'use client';

import { FormEvent, useState } from 'react';

type SearchState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'unavailable'; message: string }
  | { kind: 'error'; message: string }
  | { kind: 'success'; count: number };

export default function NewBookingPage() {
  const [searchState, setSearchState] = useState<SearchState>({ kind: 'idle' });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchState({ kind: 'loading' });

    const form = new FormData(event.currentTarget);
    const tripType = form.get('return') ? 'ROUND_TRIP' : 'ONE_WAY';

    const payload = {
      originIata: String(form.get('origin') ?? ''),
      destinationIata: String(form.get('destination') ?? ''),
      departureDate: String(form.get('departure') ?? ''),
      returnDate: form.get('return') ? String(form.get('return')) : undefined,
      tripType,
      adults: Number(form.get('adults') ?? 1),
      children: Number(form.get('children') ?? 0),
      infants: Number(form.get('infants') ?? 0),
      cabin: String(form.get('cabin') ?? 'ECONOMY'),
    };

    try {
      const response = await fetch('/api/flights/search', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await response.json();

      if (response.status === 503) {
        setSearchState({ kind: 'unavailable', message: body.error?.message ?? 'No approved flight provider is configured.' });
        return;
      }
      if (!response.ok) {
        setSearchState({ kind: 'error', message: body.error?.message ?? 'Flight search could not be completed.' });
        return;
      }
      setSearchState({ kind: 'success', count: body.offers?.length ?? 0 });
    } catch {
      setSearchState({ kind: 'error', message: 'The search service could not be reached. No booking has been created.' });
    }
  }

  return (
    <main className="content">
      <div className="pageIntro">
        <div>
          <h1>New booking</h1>
          <p className="subtitle">Search provider-backed inventory. Nothing is reserved until the connected provider confirms the booking.</p>
        </div>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        <div className="formGrid">
          <label>From<input name="origin" required maxLength={3} placeholder="IATA, e.g. LOS" /></label>
          <label>To<input name="destination" required maxLength={3} placeholder="IATA, e.g. LHR" /></label>
          <label>Departure<input name="departure" required type="date" /></label>
          <label>Return<input name="return" type="date" /></label>
          <label>Adults<input name="adults" required min="1" max="9" type="number" defaultValue="1" /></label>
          <label>Children<input name="children" min="0" max="8" type="number" defaultValue="0" /></label>
          <label>Infants<input name="infants" min="0" max="4" type="number" defaultValue="0" /></label>
          <label>Cabin<select name="cabin" defaultValue="ECONOMY"><option value="ECONOMY">Economy</option><option value="PREMIUM_ECONOMY">Premium economy</option><option value="BUSINESS">Business</option><option value="FIRST">First</option></select></label>
        </div>
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="primary" type="submit" disabled={searchState.kind === 'loading'}>
            {searchState.kind === 'loading' ? 'Searching provider…' : 'Search provider inventory'}
          </button>
        </div>

        {searchState.kind === 'unavailable' && (
          <div className="notice" role="status">{searchState.message} Expodia will not substitute invented availability, fares, bookings, or tickets.</div>
        )}
        {searchState.kind === 'error' && (
          <div className="notice" role="alert">{searchState.message}</div>
        )}
        {searchState.kind === 'success' && (
          <div className="notice" role="status">Provider returned {searchState.count} available offer(s). No booking has been created.</div>
        )}
      </form>
    </main>
  );
}
