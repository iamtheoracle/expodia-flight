import Link from 'next/link';

export default function TravelerCommunitiesPage() {
  return (
    <section className="travelerWorkspace">
      <div className="publicEyebrow">COMMUNITIES</div>
      <h1>Travel communities</h1>
      <p>Coordinate with companions and discover travel conversations without exposing private booking or identity data.</p>
      <div className="planningEmpty">
        Your trip groups and communities will appear here. Create or manage a group from the traveler workspace.
      </div>
      <Link className="publicPrimary" href="/traveler?view=groups">Open groups</Link>
    </section>
  );
}
