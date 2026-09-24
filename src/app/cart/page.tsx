import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/app-shell/AppShell';

export default async function CartPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: cart } = user
    ? await supabase.from('carts').select('id, status, currency, created_at, cart_items(id, quantity, flight_offers(id, provider_name, provider_offer_id, currency, total_amount, source, expires_at, raw_offer))').eq('agent_id', user.id).eq('status', 'ACTIVE').order('created_at', { ascending: false }).limit(1).maybeSingle()
    : { data: null };

  const items = (cart?.cart_items ?? []) as Array<{
    id: string;
    quantity: number;
    flight_offers: { id: string; provider_name: string; provider_offer_id: string; currency: string; total_amount: number; source: string; expires_at: string | null; raw_offer: { segments?: Array<{ carrierCode: string; flightNumber: string; originIata: string; destinationIata: string; departureLocal: string; arrivalLocal: string }> } | null } | null;
  }>;

  return (
    <AppShell currentPath="/cart">
      <section className="content">
        <div className="pageIntro">
          <div>
            <h1>Expodia cart</h1>
            <p className="subtitle">The exact flight selected by the agent is captured here before passenger and payment workflows begin.</p>
          </div>
          <Link className="secondary" href="/bookings/new">Back to search</Link>
        </div>

        {!cart || items.length === 0 ? (
          <section className="card empty">Your Expodia cart is empty. Search for a flight and select an itinerary to add it here.</section>
        ) : (
          <div className="cartList">
            {items.map((item) => {
              const offer = item.flight_offers;
              const segments = offer?.raw_offer?.segments ?? [];
              return (
                <article className="card cartItem" key={item.id}>
                  <div className="cartItemHeader">
                    <div>
                      <div className="eyebrow">{offer?.provider_name} · {offer?.source}</div>
                      <h2>{segments.map((segment) => `${segment.originIata} → ${segment.destinationIata}`).join(' · ')}</h2>
                    </div>
                    <strong>{offer?.currency} {Number(offer?.total_amount ?? 0).toLocaleString()}</strong>
                  </div>
                  <div className="segmentList">
                    {segments.map((segment, index) => (
                      <div className="segment" key={`${item.id}-${index}`}>
                        <div><strong>{segment.originIata}</strong><span>{new Date(segment.departureLocal).toLocaleString()}</span></div>
                        <div className="segmentArrow">→</div>
                        <div><strong>{segment.destinationIata}</strong><span>{new Date(segment.arrivalLocal).toLocaleString()}</span></div>
                        <div className="segmentFlight">{segment.carrierCode} {segment.flightNumber}</div>
                      </div>
                    ))}
                  </div>
                  <div className="cartFooter">
                    <span>Quantity {item.quantity}</span>
                    <span>Revalidation required before payment.</span>
                  </div>
                </article>
              );
            })}
            <div className="notice">The cart is an Expodia record. It does not claim that an airline seat has been held or that a ticket has been issued.</div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
