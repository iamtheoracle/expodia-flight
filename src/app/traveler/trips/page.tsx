import Link from 'next/link';

export default function TravelerTripsPage() {
  return (
    <section className="travelerWorkspace">
      <div className="publicEyebrow">TRIPS</div>
      <h1>Your trips</h1>
      <p>Confirmed journeys and itinerary items will appear here when connected providers create them.</p>
      <div className="planningEmpty">
        No confirmed trips yet. Start planning from your traveler home or ask Expodia to help coordinate a journey.
      </div>
      <Link className="publicPrimary" href="/traveler">Open traveler home</Link>
    </section>
  );
}
