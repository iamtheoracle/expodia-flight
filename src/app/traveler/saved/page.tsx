import Link from 'next/link';

export default function TravelerSavedPage() {
  return (
    <section className="travelerWorkspace">
      <div className="publicEyebrow">SAVED</div>
      <h1>Saved travel</h1>
      <p>Flights, places, activities and intelligence you save for later belong to your private traveler space.</p>
      <div className="planningEmpty">
        Your saved items will appear here. Expodia will not display provider inventory or recommendations that are not available.
      </div>
      <Link className="publicPrimary" href="/traveler">Open traveler home</Link>
    </section>
  );
}
