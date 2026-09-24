'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { AppShell } from '@/components/app-shell/AppShell';
import type { NormalizedFlightOffer } from '@/lib/flights/domain';

type SearchState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'unavailable'; message: string }
  | { kind: 'error'; message: string }
  | { kind: 'success'; searchId: string; offers: NormalizedFlightOffer[] };

export default function NewBookingPage() {
  const [searchState, setSearchState] = useState<SearchState>({ kind: 'idle' });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cartMessage, setCartMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchState({ kind: 'loading' });
    setSelectedId(null);
    setCartMessage('');

    const form = new FormData(event.currentTarget);
    const returnDate = String(form.get('return') ?? '');
    const payload = {
      originIata: String(form.get('origin') ?? ''),
      destinationIata: String(form.get('destination') ?? ''),
      departureDate: String(form.get('departure') ?? ''),
      returnDate: returnDate || undefined,
      tripType: returnDate ? 'ROUND_TRIP' : 'ONE_WAY',
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

      setSearchState({ kind: 'success', searchId: body.searchId, offers: body.offers ?? [] });
    } catch {
      setSearchState({ kind: 'error', message: 'The search service could not be reached. No booking has been created.' });
    }
  }

  async function selectOffer(offer: NormalizedFlightOffer) {
    setSelectedId(offer.id);
    setCartMessage('');
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ offerId: offer.id }),
      });
      const body = await response.json();
      if (!response.ok) {
        setCartMessage(body.error?.message ?? 'The selected flight could not be added to the cart.');
        return;
      }
      setCartMessage('Selected itinerary added to the Expodia cart.');
    } catch {
      setCartMessage('The cart service could not be reached. No booking was created.');
    } finally {
      setSelectedId(null);
    }
  }

  return (
    <AppShell currentPath="/bookings/new">
      <section className="content">
        <div className="pageIntro">
          <div>
            <h1>Find a flight</h1>
            <p className="subtitle">Discover authorized inventory, inspect the exact itinerary, then move the selected offer into the Expodia cart.</p>
          </div>
          <Link className="secondary" href="/cart">Open cart</Link>
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
              {searchState.kind === 'loading' ? 'Searching…' : 'Search flights'}
            </button>
          </div>
          {searchState.kind === 'unavailable' && <div className="notice" role="status">{searchState.message} Expodia will not substitute invented availability, fares, bookings, or tickets.</div>}
          {searchState.kind === 'error' && <div className="notice" role="alert">{searchState.message}</div>}
        </form>

        {searchState.kind === 'success' && (
          <section className="resultsSection" aria-live="polite">
            <div className="resultsHeader">
              <div>
                <h2>Available itineraries</h2>
                <p>{searchState.offers.length.toLocaleString()} authorized offer(s) returned for this search.</p>
              </div>
              <span className="resultBadge">{searchState.offers.length.toLocaleString()} results</span>
            </div>

            {searchState.offers.length === 0 ? (
              <div className="card empty">The provider returned no available offers for this search.</div>
            ) : (
              <div className="flightResults">
                {searchState.offers.map((offer) => (
                  <article className="card flightCard" key={offer.id}>
                    <div className="flightCardTop">
                      <div>
                        <div className="eyebrow">{offer.provider} · {offer.source}</div>
                        <div className="routeLine">
                          {offer.segments.map((segment, index) => (
                            <span key={`${offer.id}-route-${index}`}>{segment.originIata} → {segment.destinationIata}</span>
                          ))}
                        </div>
                      </div>
                      <div className="priceBlock">
                        <strong>{offer.currency} {offer.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                        <span>Total fare</span>
                      </div>
                    </div>

                    <div className="segmentList">
                      {offer.segments.map((segment, index) => (
                        <div className="segment" key={`${offer.id}-segment-${index}`}>
                          <div><strong>{segment.originIata}</strong><span>{new Date(segment.departureLocal).toLocaleString()}</span></div>
                          <div className="segmentArrow">→</div>
                          <div><strong>{segment.destinationIata}</strong><span>{new Date(segment.arrivalLocal).toLocaleString()}</span></div>
                          <div className="segmentFlight">{segment.carrierCode} {segment.flightNumber} · {segment.stops === 0 ? 'Nonstop' : `${segment.stops} stop(s)`}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flightCardFooter">
                      <span>{offer.expiresAt ? `Offer expires ${new Date(offer.expiresAt).toLocaleString()}` : 'Provider validity not supplied'}</span>
                      <button className="secondary" type="button" disabled={selectedId === offer.id} onClick={() => selectOffer(offer)}>
                        {selectedId === offer.id ? 'Adding…' : 'Select flight'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {cartMessage && <div className="notice" role="status">{cartMessage} <Link href="/cart">View cart</Link></div>}
          </section>
        )}
      </section>
    </AppShell>
  );
}
