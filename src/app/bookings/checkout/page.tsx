'use client';

import Link from 'next/link';
import { useState } from 'react';

type Step = 'seats' | 'addons' | 'review';

const STEPS: Step[] = ['seats', 'addons', 'review'];

/**
 * Booking stepper stubs: seats → add-ons → review.
 * No invented seat maps or ancillary prices — skip until providers are connected.
 */
export default function CheckoutStepperPage() {
  const [step, setStep] = useState<Step>('seats');
  const [seatNote, setSeatNote] = useState('No seat map loaded — seat selection is not connected for this offer.');
  const [addonNote, setAddonNote] = useState('Optional add-ons appear only from connected partners.');
  const [skippedSeats, setSkippedSeats] = useState(false);
  const [addonsDeclined, setAddonsDeclined] = useState(false);

  const idx = STEPS.indexOf(step);

  function next() {
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  }

  function back() {
    if (idx > 0) setStep(STEPS[idx - 1]);
  }

  return (
    <main className="publicPage">
      <header className="publicHeader">
        <Link href="/" className="publicBrand">
          Expodia Flights
        </Link>
        <nav className="publicNav">
          <Link href="/explore">Explore</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/bookings/new">Search</Link>
          <Link href="/assistant">Assistant</Link>
        </nav>
      </header>

      <section className="publicSection" style={{ maxWidth: 560, margin: '0 auto' }}>
        <div className="publicEyebrow">CHECKOUT</div>
        <h1 style={{ marginTop: 8 }}>Complete your booking</h1>
        <p style={{ color: '#666', fontSize: 14, lineHeight: 1.5 }}>
          Smooth steps with skip paths. Seats and add-ons use connected providers only — nothing is invented.
        </p>

        <div style={{ display: 'flex', gap: 8, margin: '20px 0', alignItems: 'center', flexWrap: 'wrap' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  background: i <= idx ? '#17233c' : '#e8e8e4',
                  color: i <= idx ? '#fff' : '#888',
                }}
              >
                {i + 1}
              </div>
              <span style={{ fontSize: 12, fontWeight: 650, textTransform: 'capitalize', color: i === idx ? '#101010' : '#888' }}>
                {s === 'addons' ? 'Add-ons' : s}
              </span>
              {i < STEPS.length - 1 && <span style={{ color: '#ccc' }}>—</span>}
            </div>
          ))}
        </div>

        {step === 'seats' && (
          <div className="card" style={{ padding: 20 }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>Select seats</h2>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#555', lineHeight: 1.5 }}>{seatNote}</p>
            <div
              style={{
                border: '1px dashed #ccc',
                borderRadius: 12,
                padding: 24,
                textAlign: 'center',
                background: '#fafafa',
                fontSize: 13,
                color: '#666',
                marginBottom: 16,
              }}
            >
              Seat map placeholder
              <br />
              <small>When a seat-map API is connected, open seats and prices will render here (per segment).</small>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="publicSecondary"
                onClick={() => {
                  setSkippedSeats(true);
                  setSeatNote('Seat selection skipped. You can continue without assigned seats.');
                  next();
                }}
              >
                Skip seat selection
              </button>
              <button
                type="button"
                className="publicPrimary"
                onClick={() => {
                  setSeatNote(
                    'Seat maps are not connected yet. Use Skip to continue — Expodia will not invent seat availability or prices.',
                  );
                }}
              >
                Load seat map
              </button>
            </div>
          </div>
        )}

        {step === 'addons' && (
          <div className="card" style={{ padding: 20 }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>Select add-ons</h2>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#555', lineHeight: 1.5 }}>{addonNote}</p>
            <ul style={{ margin: '0 0 16px', paddingLeft: 18, fontSize: 13, color: '#444', lineHeight: 1.6 }}>
              <li>Trip flexibility / cancel products — when offered by provider</li>
              <li>Travel protection / claim assist — when partner connected</li>
              <li>Lounge access — when inventory exists for this itinerary</li>
            </ul>
            <div
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: 14,
                marginBottom: 16,
                background: '#f8fafc',
                fontSize: 12,
                color: '#475569',
              }}
            >
              No add-on catalog is loaded. Declining is safe and keeps the fare as selected.
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' }}>
              <button type="button" className="publicSecondary" onClick={back}>
                Back
              </button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="publicSecondary"
                  onClick={() => {
                    setAddonsDeclined(true);
                    setAddonNote('No optional add-ons selected.');
                    next();
                  }}
                >
                  No add-ons
                </button>
                <button type="button" className="publicPrimary" onClick={next}>
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="card" style={{ padding: 20 }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>Review</h2>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: '#555', lineHeight: 1.5 }}>
              Confirm details from your cart before payment. Booking commit requires a real provider offer and explicit
              confirm.
            </p>
            <dl style={{ margin: '0 0 16px', fontSize: 13, lineHeight: 1.7 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <dt style={{ color: '#777' }}>Seats</dt>
                <dd style={{ margin: 0 }}>{skippedSeats ? 'Skipped' : 'Not assigned (map offline)'}</dd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <dt style={{ color: '#777' }}>Add-ons</dt>
                <dd style={{ margin: 0 }}>{addonsDeclined ? 'None' : 'None selected'}</dd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <dt style={{ color: '#777' }}>Payment</dt>
                <dd style={{ margin: 0 }}>Not started</dd>
              </div>
            </dl>
            <div
              style={{
                padding: 12,
                borderRadius: 8,
                background: '#f1f5f9',
                fontSize: 12,
                color: '#334155',
                marginBottom: 16,
                lineHeight: 1.5,
              }}
            >
              Live charge and ticket issuance run only through connected booking providers. This step does not invent a
              PNR or total.
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' }}>
              <button type="button" className="publicSecondary" onClick={back}>
                Back
              </button>
              <div style={{ display: 'flex', gap: 10 }}>
                <Link className="publicSecondary" href="/cart">
                  Open cart
                </Link>
                <Link className="publicPrimary" href="/bookings/new">
                  Find another flight
                </Link>
              </div>
            </div>
          </div>
        )}

        <p style={{ marginTop: 20, fontSize: 12, color: '#888' }}>
          <Link href="/explore">← Back to Explore</Link>
        </p>
      </section>
    </main>
  );
}
