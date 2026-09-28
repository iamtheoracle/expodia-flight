'use client';

import { useState } from 'react';

const pages = [
  ['1', 'Confirmation + traveler details'],
  ['2', 'Flight itinerary'],
  ['3', 'Price + payment + ticketing'],
  ['4', 'Important information + rules'],
] as const;

export default function EmailPreviewsPage() {
  const [selected, setSelected] = useState('1');
  const page = pages.find(([id]) => id === selected) ?? pages[0];

  return (
    <main style={{ minHeight: '100vh', background: '#fff', color: '#111', fontFamily: 'Arial,Helvetica,sans-serif' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 18px 56px' }}>
        <header style={{ borderBottom: '1px solid #111', paddingBottom: 22, marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em' }}>EXPODIA FLIGHTS · DOCUMENT TEMPLATES</div>
          <h1 style={{ fontSize: 30, lineHeight: 1.1, margin: '8px 0' }}>Flight receipt template</h1>
          <p style={{ maxWidth: 760, margin: 0, lineHeight: 1.5, fontSize: 14 }}>
            Production template for the passenger-facing flight booking confirmation/receipt. The structure follows established travel-confirmation information hierarchy and remains monochrome, transactional and multi-page.
          </p>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: '250px minmax(0,1fr)', gap: 28, alignItems: 'start' }}>
          <nav style={{ borderRight: '1px solid #111', paddingRight: 14 }}>
            {pages.map(([id, label]) => (
              <button
                key={id}
                onClick={() => setSelected(id)}
                style={{ display: 'block', width: '100%', textAlign: 'left', border: 0, borderBottom: '1px solid #bbb', background: selected === id ? '#eee' : '#fff', color: '#111', padding: '12px 10px', cursor: 'pointer', fontWeight: selected === id ? 700 : 400 }}
              >
                Page {id}<br /><span style={{ fontSize: 12 }}>{label}</span>
              </button>
            ))}
          </nav>

          <section>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12 }}>TEMPLATE PREVIEW · {page[1]}</div>
            <article style={{ maxWidth: 720, minHeight: 820, margin: '0 auto', border: '1px solid #111', padding: '42px 46px', boxSizing: 'border-box', background: '#fff' }}>
              <header style={{ borderBottom: '1px solid #111', paddingBottom: 18 }}>
                <div style={{ fontSize: 22, fontWeight: 700 }}>EXPODIA FLIGHTS</div>
                <div style={{ fontSize: 10, marginTop: 5 }}>FLIGHT BOOKING CONFIRMATION / RECEIPT</div>
              </header>

              {selected === '1' && <PageOne />}
              {selected === '2' && <PageTwo />}
              {selected === '3' && <PageThree />}
              {selected === '4' && <PageFour />}

              <footer style={{ borderTop: '1px solid #111', marginTop: 34, paddingTop: 12, fontSize: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span>EXPODIA FLIGHTS</span><span>Page {page[0]}</span>
              </footer>
            </article>

            <section style={{ maxWidth: 720, margin: '24px auto 0', borderTop: '1px solid #111', paddingTop: 18 }}>
              <h2 style={{ fontSize: 18, margin: '0 0 10px' }}>Generation instructions</h2>
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6, fontSize: 13 }}>
                <li>Populate only from the canonical booking, passenger, flight, payment and ticket records.</li>
                <li>Never invent airline, flight number, PNR, ticket number, time, terminal, aircraft, baggage, seat, fare, tax or payment information.</li>
                <li>Keep the receipt multi-page when the information requires it. Do not compress the complete document into one page.</li>
                <li>Use monochrome presentation only. No decorative colour, gradients, illustrations or marketing redesign.</li>
                <li>Expodia-generated documents identify Expodia Flights as issuer. Provider-issued documents retain their actual issuer.</li>
                <li>The receipt is the first transactional document when the configured booking/payment event occurs; later tickets and travel documents remain separate artifacts.</li>
              </ul>
            </section>
          </section>
        </section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section style={{ marginTop: 28 }}><h2 style={{ fontSize: 17, margin: '0 0 10px' }}>{title}</h2>{children}</section>;
}
function Row({ label, value }: { label: string; value: string }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', borderBottom: '1px solid #ccc', padding: '8px 0', fontSize: 12 }}><span>{label}</span><strong>{value}</strong></div>;
}
function PageOne() {
  return <><div style={{ marginTop: 26 }}><h1 style={{ fontSize: 24, margin: '0 0 10px' }}>Your flight is booked.</h1><p style={{ fontSize: 13, lineHeight: 1.5 }}>Your booking information is shown below.</p></div><Section title="Confirmation"><Row label="Itinerary #" value="[EXPODIA REFERENCE]" /><Row label="Provider confirmation" value="[WHEN SUPPLIED]" /><Row label="Booking status" value="[BOOKING STATUS]" /><Row label="Ticketing status" value="[TICKETING STATUS]" /><Row label="Issue date" value="[ISSUE DATE]" /></Section><Section title="Traveler details"><Row label="Traveler" value="[FULL NAME]" /><Row label="Passenger type" value="[ADULT / CHILD / INFANT]" /><Row label="Ticket status" value="[STATUS]" /><Row label="Ticket number" value="[WHEN ISSUED]" /></Section></>;
}
function PageTwo() {
  return <><Section title="Departure flight"><Row label="Date" value="[DATE]" /><Row label="From" value="[AIRPORT / IATA]" /><Row label="To" value="[AIRPORT / IATA]" /><Row label="Airline / flight" value="[CARRIER] · [FLIGHT NUMBER]" /><Row label="Departs" value="[DATE / LOCAL TIME]" /><Row label="Arrives" value="[DATE / LOCAL TIME]" /><Row label="Terminal" value="[WHEN VERIFIED]" /><Row label="Duration / stops" value="[WHEN VERIFIED]" /><Row label="Cabin / fare class" value="[WHEN SUPPLIED]" /></Section><Section title="Return flight"><Row label="Date" value="[DATE]" /><Row label="From" value="[AIRPORT / IATA]" /><Row label="To" value="[AIRPORT / IATA]" /><Row label="Airline / flight" value="[CARRIER] · [FLIGHT NUMBER]" /><Row label="Departs" value="[DATE / LOCAL TIME]" /><Row label="Arrives" value="[DATE / LOCAL TIME]" /></Section></>;
}
function PageThree() {
  return <><Section title="Price summary"><Row label="Total itinerary amount" value="[CURRENCY] [TOTAL]" /><Row label="Amount paid" value="[CURRENCY] [PAID]" /><Row label="Amount outstanding" value="[CURRENCY] [BALANCE]" /><Row label="Payment status" value="[PAID / PARTIALLY PAID]" /></Section><Section title="Payment"><Row label="Payment reference" value="[WHEN SUPPLIED]" /><Row label="Payment date" value="[WHEN SUPPLIED]" /></Section><Section title="Ticketing details"><Row label="PNR / confirmation" value="[WHEN SUPPLIED]" /><Row label="E-ticket number" value="[WHEN ISSUED]" /><Row label="Verification reference" value="[WHEN ISSUED]" /></Section></>;
}
function PageFour() {
  return <><Section title="Important information"><p style={{ fontSize: 12, lineHeight: 1.6 }}>Check-in, boarding, passport, visa, terminal, baggage and airline-specific requirements are shown only when verified from the applicable booking/provider record.</p><p style={{ fontSize: 12, lineHeight: 1.6 }}>A reservation, payment and ticket issuance are separate states. A receipt does not create an airline ticket where one has not been issued.</p></Section><Section title="Rules and restrictions"><p style={{ fontSize: 12, lineHeight: 1.6 }}>Cancellation, changes, refunds, no-show conditions and baggage restrictions are governed by the applicable fare and provider record.</p></Section><Section title="Issuer and support"><Row label="Issued by" value="Expodia Flights" /><Row label="Passenger email" value="[AUTHORIZED EMAIL]" /><Row label="Agent" value="[AUTHORIZED AGENT]" /><Row label="Document reference" value="[EXPODIA REFERENCE]" /></Section></>;
}
