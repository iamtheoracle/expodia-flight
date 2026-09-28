'use client';

import type { NormalizedFlightOffer } from '@/lib/flights/domain';
import './flight-offer-card.css';

type Props = {
  offer: NormalizedFlightOffer;
  onSelect?: (offer: NormalizedFlightOffer) => void;
  selecting?: boolean;
  selectLabel?: string;
};

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

function segmentSummary(offer: NormalizedFlightOffer) {
  const segs = offer.segments;
  if (!segs.length) return { route: '—', times: '', duration: '', carriers: '', stops: '' };
  const first = segs[0];
  const last = segs[segs.length - 1];
  const stops = segs.reduce((n, s) => n + (s.stops ?? 0), 0) + Math.max(0, segs.length - 1);
  const carriers = [...new Set(segs.map((s) => s.carrierCode).filter(Boolean))].join(', ');
  let duration = '';
  try {
    const ms = new Date(last.arrivalLocal).getTime() - new Date(first.departureLocal).getTime();
    if (ms > 0) {
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      duration = `${h}h ${m}m`;
    }
  } catch {
    /* ignore */
  }
  return {
    route: `${first.originIata} → ${last.destinationIata}`,
    times: `${formatTime(first.departureLocal)} – ${formatTime(last.arrivalLocal)}`,
    duration,
    carriers,
    stops: stops === 0 ? 'Nonstop' : `${stops} stop(s)`,
  };
}

/** Trip.com-style offer row. Renders only provider-backed NormalizedFlightOffer data. */
export default function FlightOfferCard({ offer, onSelect, selecting, selectLabel = 'Select' }: Props) {
  const s = segmentSummary(offer);
  const price = offer.totalAmount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return (
    <article className="focCard">
      <div className="focMain">
        <div className="focTimes">
          <span className="focTime">{s.times}</span>
          {s.duration ? <span className="focDur">{s.duration}</span> : null}
        </div>
        <div className="focRoute">{s.route}</div>
        <div className="focMeta">
          <span>{s.carriers || offer.provider}</span>
          <span>{s.stops}</span>
          <span>
            {offer.provider} · {offer.source}
          </span>
        </div>
      </div>
      <div className="focPriceCol">
        <div className="focPrice">
          {offer.currency} {price}
          <span>Total</span>
        </div>
        {onSelect ? (
          <button
            type="button"
            className="focSelect"
            disabled={selecting}
            onClick={() => onSelect(offer)}
          >
            {selecting ? '…' : selectLabel}
          </button>
        ) : null}
      </div>
    </article>
  );
}
