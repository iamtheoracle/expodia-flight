export interface Trip {
  id: string;
  airline: string;
  flightNumber: string;
  originIata: string;
  originCity: string;
  destinationIata: string;
  destinationCity: string;
  /** Local departure date-time, exactly as supplied by the traveler (no timezone offset). */
  departureLocal: string;
  /** Local arrival date-time, only when the traveler supplied one. */
  arrivalLocal?: string;
}

/**
 * The traveler's real flights, entered manually.
 * Only what the traveler supplied is stored — arrival times are omitted because
 * none were given, and Expodia never invents schedule data.
 */
export const MY_TRIPS: Trip[] = [
  {
    id: 'aa123-2026-10-15',
    airline: 'American Airlines',
    flightNumber: 'AA123',
    originIata: 'JFK',
    originCity: 'New York',
    destinationIata: 'LAX',
    destinationCity: 'Los Angeles',
    departureLocal: '2026-10-15T10:00',
  },
  {
    id: 'aa456-2026-10-20',
    airline: 'American Airlines',
    flightNumber: 'AA456',
    originIata: 'LAX',
    originCity: 'Los Angeles',
    destinationIata: 'JFK',
    destinationCity: 'New York',
    departureLocal: '2026-10-20T14:00',
  },
];

/** Generic packing essentials offered as a starting checklist for every trip. */
export const DEFAULT_PACKING_ITEMS = [
  'Passport / ID',
  'Boarding pass',
  'Phone + charger',
  'Medications',
  'Travel adapter',
  'Cards / cash',
];

export function isUpcoming(trip: Trip, now: number = Date.now()): boolean {
  return new Date(trip.departureLocal).getTime() >= now;
}

export function formatTripDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function checklistStorageKey(tripId: string): string {
  return `expodia:trip-checklist:${tripId}`;
}
