import type { AgentAnswer, AgentCommand } from './types';

/**
 * Super Agent stub: maps intents to safe navigation / honest messaging.
 * Does not invent flights, fares, or live status.
 * Wire domain.execute() here as specialists come online.
 */
export async function orchestrate(command: AgentCommand): Promise<AgentAnswer> {
  const { intent, payload, confirm } = command;

  switch (intent) {
    case 'NAV_HOME':
      return nav('Open your travel home.', '/home');
    case 'NAV_TRIPS':
      return nav('Open My Plan and trips.', '/traveler');
    case 'NAV_EXPLORE':
      return nav('Open flight explore. Bookable results only appear from connected providers.', '/explore');
    case 'NAV_TRACK':
      return nav('Open flight tracking. Live status only when a tracking provider is connected.', '/track');

    case 'SEARCH_FLIGHTS': {
      const q = [payload?.origin, payload?.destination, payload?.date].filter(Boolean).join(' ');
      return {
        status: 'nav',
        summary: q
          ? `Continue search (${q}) in Explore. Expodia does not invent availability or prices.`
          : 'Open Explore to search flights from connected providers only.',
        blocks: [
          {
            type: 'message',
            text: 'Flight search uses connected providers only. If none are connected, Explore will say so honestly.',
          },
        ],
        actions: [
          { id: 'open_explore', label: 'Open Explore', href: '/explore', intent: 'NAV_EXPLORE' },
          { id: 'plan', label: 'My Plan', href: '/traveler', intent: 'NAV_TRIPS' },
        ],
      };
    }

    case 'TRACK_FLIGHT':
      return {
        status: 'nav',
        summary: payload?.flightNumber
          ? `Track ${payload.flightNumber} when live tracking is configured.`
          : 'Open Track. No simulated positions are shown.',
        blocks: [
          {
            type: 'unavailable',
            domain: 'flight_tracking',
            text: 'Live tracking appears only from a connected provider. Expodia will not invent aircraft positions.',
          },
        ],
        actions: [
          { id: 'open_track', label: 'Open Track', href: '/track', intent: 'NAV_TRACK' },
          { id: 'support', label: 'Talk to a person', intent: 'SUPPORT_HANDOFF' },
        ],
      };

    case 'COMPARE_FLIGHTS':
      return {
        status: 'clarify',
        summary: 'Compare works on real offers from a completed search—not on invented schedules.',
        blocks: [{ type: 'message', text: 'Run a search in Explore first, then refine with cabin or stops filters on real results.' }],
        actions: [{ id: 'open_explore', label: 'Open Explore', href: '/explore' }],
      };

    case 'SELECT_OFFER':
      return {
        status: 'clarify',
        summary: payload?.offerId
          ? `Offer ${payload.offerId} would be selected when search results are live.`
          : 'Select an offer from a real search result list before booking.',
        blocks: [{ type: 'message', text: 'Booking requires a real provider offer id. Nothing is reserved yet.' }],
        actions: [{ id: 'open_explore', label: 'Open Explore', href: '/explore' }],
      };

    case 'BOOK_START':
      return {
        status: 'nav',
        summary: 'Start booking only from a selected real offer.',
        blocks: [{ type: 'message', text: 'Use Explore → select an offer → cart / booking. Expodia will not invent a PNR.' }],
        actions: [
          { id: 'explore', label: 'Explore', href: '/explore' },
          { id: 'cart', label: 'Cart', href: '/cart' },
        ],
      };

    case 'BOOK_COMMIT':
      if (!confirm) {
        return {
          status: 'clarify',
          summary: 'Confirm required before booking commit.',
          blocks: [{ type: 'message', text: 'Mutating booking actions need an explicit confirm step.' }],
          actions: [{ id: 'book_start', label: 'Review booking', intent: 'BOOK_START' }],
        };
      }
      return {
        status: 'not_configured',
        summary: 'Booking commit runs only through connected booking providers.',
        blocks: [
          {
            type: 'unavailable',
            domain: 'booking',
            text: 'Complete booking in the booking flow when providers are connected. No ticket will be invented here.',
          },
        ],
        actions: [
          { id: 'bookings', label: 'Bookings', href: '/bookings' },
          { id: 'support', label: 'Talk to a person', intent: 'SUPPORT_HANDOFF' },
        ],
      };

    case 'STAY_SEARCH':
      return nav('Open Marketplace for stays and services from connected partners.', '/marketplace');

    case 'PLAN_ADD':
      return nav('Open My Plan to add flights, stays, and requirements.', '/traveler');

    case 'DOCUMENT_VERIFY':
      return nav('Open Documents to work with real Expodia or provider records.', '/documents');

    case 'SUPPORT_HANDOFF':
      return {
        status: 'nav',
        summary: 'Connect with an Expodia travel professional when signed in.',
        blocks: [
          {
            type: 'message',
            text: 'Support handoff uses your traveler session and does not invent booking status.',
          },
        ],
        actions: [
          { id: 'support_page', label: 'Support', href: '/support' },
          { id: 'inbox', label: 'Inbox', href: '/traveler/inbox' },
        ],
      };

    case 'FREE_TEXT': {
      const text = (payload?.text || '').trim().toLowerCase();
      if (!text) {
        return {
          status: 'clarify',
          summary: 'Tell Expodia what you need.',
          blocks: [{ type: 'message', text: 'Try a command button or describe a trip, track request, or support need.' }],
          actions: [
            { id: 'search', label: 'Search flights', intent: 'SEARCH_FLIGHTS' },
            { id: 'track', label: 'Track', intent: 'TRACK_FLIGHT' },
          ],
        };
      }
      if (/(track|where is|status)/.test(text)) {
        return orchestrate({ intent: 'TRACK_FLIGHT', payload });
      }
      if (/(hotel|stay|accommodation)/.test(text)) {
        return orchestrate({ intent: 'STAY_SEARCH', payload });
      }
      if (/(support|agent|human|person|help me)/.test(text)) {
        return orchestrate({ intent: 'SUPPORT_HANDOFF', payload });
      }
      if (/(book|flight|fly|ticket)/.test(text)) {
        return orchestrate({ intent: 'SEARCH_FLIGHTS', payload: { text: payload?.text } });
      }
      if (/(plan|trip|itinerary)/.test(text)) {
        return orchestrate({ intent: 'PLAN_ADD', payload });
      }
      return {
        status: 'ok',
        summary: 'I can guide you to the right part of Expodia. I will not invent availability, prices, or ticket status.',
        blocks: [
          {
            type: 'message',
            text: 'Use Search, Track, My Plan, or Support—or ask in plain language. Operational data only comes from connected providers.',
          },
        ],
        actions: [
          { id: 'search', label: 'Search flights', intent: 'SEARCH_FLIGHTS' },
          { id: 'track', label: 'Track', intent: 'TRACK_FLIGHT' },
          { id: 'plan', label: 'My Plan', href: '/traveler' },
          { id: 'support', label: 'Talk to a person', intent: 'SUPPORT_HANDOFF' },
        ],
      };
    }

    default:
      return {
        status: 'error',
        summary: 'Unknown command.',
        blocks: [{ type: 'message', text: 'That control is not mapped yet.' }],
        actions: [{ id: 'home', label: 'Home', href: '/home' }],
      };
  }
}

function nav(summary: string, href: string): AgentAnswer {
  return {
    status: 'nav',
    summary,
    blocks: [{ type: 'nav', href, text: summary }],
    actions: [{ id: 'go', label: 'Continue', href }],
  };
}
