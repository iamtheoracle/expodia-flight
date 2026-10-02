'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_PACKING_ITEMS,
  MY_TRIPS,
  checklistStorageKey,
  formatTripDateTime,
  isUpcoming,
  type Trip,
} from '@/lib/traveler/trips';
import './trips.css';

type Tab = 'upcoming' | 'past';

type TrackingResponse = {
  status: 'ready' | 'processing' | 'unavailable';
  message: string;
  flight?: { flightNumber: string; status: string };
};

/** In-app departure reminder window ("a few hours before departure"). */
const REMINDER_WINDOW_MS = 6 * 60 * 60 * 1000;

export default function TravelerTripsPage() {
  const [tab, setTab] = useState<Tab>('upcoming');
  const [checklists, setChecklists] = useState<Record<string, Record<string, boolean>>>({});
  const [customItems, setCustomItems] = useState<Record<string, string[]>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, TrackingResponse>>({});

  useEffect(() => {
    const stored: Record<string, Record<string, boolean>> = {};
    for (const trip of MY_TRIPS) {
      try {
        const raw = window.localStorage.getItem(checklistStorageKey(trip.id));
        stored[trip.id] = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
      } catch {
        stored[trip.id] = {};
      }
    }
    setChecklists(stored);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const trip of MY_TRIPS) {
        try {
          const response = await fetch(
            `/api/flight-tracking?flight=${encodeURIComponent(trip.flightNumber)}`,
            { cache: 'no-store' },
          );
          const data = (await response.json()) as TrackingResponse;
          if (!cancelled) setStatuses((current) => ({ ...current, [trip.id]: data }));
        } catch {
          if (!cancelled) {
            setStatuses((current) => ({
              ...current,
              [trip.id]: { status: 'unavailable', message: 'Live status is temporarily unavailable.' },
            }));
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const upcoming = useMemo(() => MY_TRIPS.filter((trip) => isUpcoming(trip)), []);
  const past = useMemo(() => MY_TRIPS.filter((trip) => !isUpcoming(trip)), []);
  const visible = tab === 'upcoming' ? upcoming : past;

  const nextTrip = upcoming[0];
  const departingSoon =
    nextTrip && new Date(nextTrip.departureLocal).getTime() - Date.now() <= REMINDER_WINDOW_MS;

  function toggleItem(tripId: string, item: string) {
    setChecklists((current) => {
      const tripState = { ...(current[tripId] ?? {}), [item]: !current[tripId]?.[item] };
      try {
        window.localStorage.setItem(checklistStorageKey(tripId), JSON.stringify(tripState));
      } catch {
        /* storage unavailable — keep the in-memory state */
      }
      return { ...current, [tripId]: tripState };
    });
  }

  function addItem(tripId: string) {
    const value = (drafts[tripId] ?? '').trim();
    if (!value) return;
    setCustomItems((current) => ({ ...current, [tripId]: [...(current[tripId] ?? []), value] }));
    setDrafts((current) => ({ ...current, [tripId]: '' }));
  }

  return (
    <section className="travelerWorkspace">
      <div className="publicEyebrow">TRIPS</div>
      <h1>Your trips</h1>
      <p className="tripsIntro">
        Your confirmed journeys, packing progress and live operational status in one place.
      </p>

      {departingSoon && nextTrip && (
        <div className="tripsReminder" role="status">
          <strong>Departure reminder</strong>
          <span>
            {nextTrip.flightNumber} {nextTrip.originIata} → {nextTrip.destinationIata} departs{' '}
            {formatTripDateTime(nextTrip.departureLocal)}.
          </span>
        </div>
      )}

      <div className="tripsToolbar" role="tablist" aria-label="Trip period">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'upcoming'}
          className={tab === 'upcoming' ? 'active' : ''}
          onClick={() => setTab('upcoming')}
        >
          Upcoming ({upcoming.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'past'}
          className={tab === 'past' ? 'active' : ''}
          onClick={() => setTab('past')}
        >
          Past ({past.length})
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="planningEmpty">
          {tab === 'upcoming' ? 'No upcoming trips yet.' : 'No past trips yet.'}
        </div>
      ) : (
        <div className="tripsList">
          {visible.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              status={statuses[trip.id]}
              checklist={checklists[trip.id] ?? {}}
              customItems={customItems[trip.id] ?? []}
              draft={drafts[trip.id] ?? ''}
              onDraftChange={(value) => setDrafts((current) => ({ ...current, [trip.id]: value }))}
              onToggle={(item) => toggleItem(trip.id, item)}
              onAdd={() => addItem(trip.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function TripCard({
  trip,
  status,
  checklist,
  customItems,
  draft,
  onDraftChange,
  onToggle,
  onAdd,
}: {
  trip: Trip;
  status?: TrackingResponse;
  checklist: Record<string, boolean>;
  customItems: string[];
  draft: string;
  onDraftChange: (value: string) => void;
  onToggle: (item: string) => void;
  onAdd: () => void;
}) {
  const items = [...DEFAULT_PACKING_ITEMS, ...customItems];
  const done = items.filter((item) => checklist[item]).length;
  const percent = items.length ? Math.round((done / items.length) * 100) : 0;
  const liveStatus = status?.status === 'ready' && status.flight ? status.flight.status : undefined;

  return (
    <article className="tripCard">
      <header className="tripCardHeader">
        <div>
          <div className="tripAirline">
            {trip.airline} · {trip.flightNumber}
          </div>
          <div className="tripRoute">
            <strong>{trip.originIata}</strong>
            <span>{trip.originCity}</span>
            <em>→</em>
            <strong>{trip.destinationIata}</strong>
            <span>{trip.destinationCity}</span>
          </div>
        </div>
      </header>

      <div className="tripMeta">
        <span>Departs {formatTripDateTime(trip.departureLocal)}</span>
        {trip.arrivalLocal && <span>Arrives {formatTripDateTime(trip.arrivalLocal)}</span>}
      </div>

      <div className="tripStatusRow">
        <span className="tripStatusLabel">Live status</span>
        <span className={liveStatus ? 'tripStatusValue ready' : 'tripStatusValue'}>
          {liveStatus ?? status?.message ?? 'Checking status…'}
        </span>
      </div>

      <div className="tripChecklist">
        <div className="tripChecklistHead">
          <strong>Packing checklist</strong>
          <span>
            {done}/{items.length} packed
          </span>
        </div>
        <div className="tripChecklistBar" aria-hidden="true">
          <span style={{ width: `${percent}%` }} />
        </div>
        <ul>
          {items.map((item) => (
            <li key={item}>
              <label>
                <input
                  type="checkbox"
                  checked={Boolean(checklist[item])}
                  onChange={() => onToggle(item)}
                />
                <span>{item}</span>
              </label>
            </li>
          ))}
        </ul>
        <div className="tripChecklistAdd">
          <input
            value={draft}
            placeholder="Add an item"
            aria-label={`Add a packing item to ${trip.flightNumber}`}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                onAdd();
              }
            }}
          />
          <button type="button" onClick={onAdd}>
            Add
          </button>
        </div>
      </div>
    </article>
  );
}
