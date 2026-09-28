'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import FlightOfferCard from '@/components/flights/FlightOfferCard';
import type { NormalizedFlightOffer } from '@/lib/flights/domain';
import '@/components/flights/flight-offer-card.css';

type SearchState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'auth' }
  | { kind: 'unavailable'; message: string }
  | { kind: 'error'; message: string }
  | { kind: 'success'; offers: NormalizedFlightOffer[] };

type SortMode = 'price' | 'duration';

export default function ExplorePage() {
  const [searchState, setSearchState] = useState<SearchState>({ kind: 'idle' });
  const [sort, setSort] = useState<SortMode>('price');
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  const sortedOffers = useMemo(() => {
    if (searchState.kind !== 'success') return [];
    const list = [...searchState.offers];
    if (sort === 'price') {
      list.sort((a, b) => a.totalAmount - b.totalAmount);
    } else {
      list.sort((a, b) => {
        const da = durationMs(a) ?? Number.MAX_SAFE_INTEGER;
        const db = durationMs(b) ?? Number.MAX_SAFE_INTEGER;
        return da - db;
      });
    }
    return list;
  }, [searchState, sort]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice('');
    setSearchState({ kind: 'loading' });
    const form = new FormData(event.currentTarget);
    const returnDate = String(form.get('return') ?? '');
    const payload = {
      originIata: String(form.get('origin') ?? '').trim().toUpperCase(),
      destinationIata: String(form.get('destination') ?? '').trim().toUpperCase(),
      departureDate: String(form.get('departure') ?? ''),
      returnDate: returnDate || undefined,
      tripType: returnDate ? 'ROUND_TRIP' : 'ONE_WAY',
      adults: Number(form.get('adults') ?? 1),
      children: Number(form.get('children') ?? 0),
      infants: 0,
      cabin: String(form.get('cabin') ?? 'ECONOMY'),
    };

    try {
      const response = await fetch('/api/flights/search', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => ({}));

      if (response.status === 401) {
        setSearchState({ kind: 'auth' });
        return;
      }
      if (response.status === 503) {
        setSearchState({
          kind: 'unavailable',
          message:
            body.error?.message ??
            'Live flight search is not connected yet. Expodia does not invent inventory, prices, or availability.',
        });
        return;
      }
      if (!response.ok) {
        setSearchState({
          kind: 'error',
          message: body.error?.message ?? 'Flight search could not be completed.',
        });
        return;
      }
      setSearchState({ kind: 'success', offers: body.offers ?? [] });
    } catch {
      setSearchState({
        kind: 'error',
        message: 'The search service could not be reached. No invented results are shown.',
      });
    }
  }

  async function selectOffer(offer: NormalizedFlightOffer) {
    setSelectingId(offer.id);
    setNotice('');
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ offerId: offer.id }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setNotice(body.error?.message ?? 'Could not add this offer to the cart.');
        return;
      }
      setNotice('Offer added to cart. Continue to checkout when ready.');
    } catch {
      setNotice('Cart service could not be reached.');
    } finally {
      setSelectingId(null);
    }
  }

  return (
    <main className="publicPage">
      <header className="publicHeader">
        <Link href="/" className="publicBrand">
          Expodia Flights
        </Link>
        <nav className="publicNav">
          <Link href="/home">Home</Link>
          <Link href="/track">Track</Link>
          <Link href="/bookings/new">Book</Link>
          <Link href="/traveler">My Plan</Link>
          <Link href="/assistant">Assistant</Link>
          <Link href="/access" className="agentAccess">
            Sign in
          </Link>
        </nav>
      </header>

      <section className="publicSection publicPageIntro">
        <div className="publicEyebrow">FLIGHT DISCOVERY</div>
        <h1>Explore flights and routes.</h1>
        <p>
          Search connected providers only. Results use real offers — Expodia will not invent availability or prices.
        </p>

        <form className="card" onSubmit={handleSubmit} style={{ marginTop: 16, padding: 16 }}>
          <div
            className="formGrid"
            style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}
          >
            <label>
              From
              <input name="origin" required maxLength={3} placeholder="JFK" style={{ display: 'block', width: '100%', marginTop: 4 }} />
            </label>
            <label>
              To
              <input name="destination" required maxLength={3} placeholder="SYD" style={{ display: 'block', width: '100%', marginTop: 4 }} />
            </label>
            <label>
              Departure
              <input name="departure" required type="date" style={{ display: 'block', width: '100%', marginTop: 4 }} />
            </label>
            <label>
              Return
              <input name="return" type="date" style={{ display: 'block', width: '100%', marginTop: 4 }} />
            </label>
            <label>
              Adults
              <input name="adults" type="number" min={1} max={9} defaultValue={1} style={{ display: 'block', width: '100%', marginTop: 4 }} />
            </label>
            <label>
              Children
              <input name="children" type="number" min={0} max={8} defaultValue={0} style={{ display: 'block', width: '100%', marginTop: 4 }} />
            </label>
            <label>
              Cabin
              <select name="cabin" defaultValue="ECONOMY" style={{ display: 'block', width: '100%', marginTop: 4 }}>
                <option value="ECONOMY">Economy</option>
                <option value="PREMIUM_ECONOMY">Premium economy</option>
                <option value="BUSINESS">Business</option>
                <option value="FIRST">First</option>
              </select>
            </label>
          </div>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="publicPrimary" type="submit" disabled={searchState.kind === 'loading'}>
              {searchState.kind === 'loading' ? 'Searching…' : 'Search flights'}
            </button>
          </div>
        </form>
      </section>

      <section className="publicSection">
        {searchState.kind === 'auth' && (
          <div className="focEmpty">
            Sign in is required to search live inventory.
            <div style={{ marginTop: 12 }}>
              <Link className="publicPrimary" href="/access">
                Sign in
              </Link>
            </div>
          </div>
        )}
        {searchState.kind === 'unavailable' && <div className="focEmpty">{searchState.message}</div>}
        {searchState.kind === 'error' && <div className="focEmpty">{searchState.message}</div>}
        {searchState.kind === 'idle' && (
          <div className="focEmpty">Enter a route and date, then search. No placeholder flights are shown.</div>
        )}
        {searchState.kind === 'success' && (
          <>
            <div className="focChips">
              <button type="button" className={`focChip ${sort === 'price' ? 'active' : ''}`} onClick={() => setSort('price')}>
                Cheapest
              </button>
              <button type="button" className={`focChip ${sort === 'duration' ? 'active' : ''}`} onClick={() => setSort('duration')}>
                Fastest
              </button>
              <Link className="focChip" href="/bookings/checkout">
                Checkout steps
              </Link>
              <Link className="focChip" href="/cart">
                Cart
              </Link>
            </div>
            {sortedOffers.length === 0 ? (
              <div className="focEmpty">The provider returned no offers for this search.</div>
            ) : (
              <div className="focList">
                {sortedOffers.map((offer) => (
                  <FlightOfferCard
                    key={offer.id}
                    offer={offer}
                    onSelect={selectOffer}
                    selecting={selectingId === offer.id}
                    selectLabel="Select"
                  />
                ))}
              </div>
            )}
            {notice && (
              <p style={{ marginTop: 14, fontSize: 13 }}>
                {notice}{' '}
                <Link href="/bookings/checkout">Continue checkout</Link> · <Link href="/cart">Cart</Link>
              </p>
            )}
          </>
        )}
      </section>
    </main>
  );
}

function durationMs(offer: NormalizedFlightOffer) {
  const segs = offer.segments;
  if (!segs.length) return null;
  try {
    return new Date(segs[segs.length - 1].arrivalLocal).getTime() - new Date(segs[0].departureLocal).getTime();
  } catch {
    return null;
  }
}
