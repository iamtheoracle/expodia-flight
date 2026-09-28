'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import '@/components/home/home-feed.css';

type FeedCard = {
  id: string;
  community: string;
  title: string;
  body: string;
  href?: string;
  kind: 'info' | 'action' | 'empty';
};

/**
 * Reddit-style travel Home for signed-in travelers.
 * Additive route: does not modify /traveler planner logic.
 * No fabricated flights, fares, or live status — only navigation + honest empty states.
 */
export default function HomeFeedPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('Traveler');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        const user = data.user;
        if (!user) {
          setUserId(null);
          setLoading(false);
          return;
        }
        setUserId(user.id);
        const meta = user.user_metadata as { full_name?: string; name?: string; username?: string } | undefined;
        const name =
          meta?.full_name ||
          meta?.name ||
          meta?.username ||
          (user.email ? user.email.split('@')[0] : 'Traveler');
        setDisplayName(name);
      } catch {
        if (mounted) setUserId(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    setUserId(null);
  }

  if (loading) {
    return (
      <div className="expodiaHome">
        <div className="ehGate">
          <p>Loading your space…</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="expodiaHome">
        <div className="ehGate">
          <h1>Your travel home</h1>
          <p>
            Sign in to open a personalized feed for trips, routes, and conversations. Expodia does not invent
            flight data for the feed.
          </p>
          <Link href="/traveler/login">Sign in</Link>
          <Link href="/traveler/signup" className="secondary">
            Create traveler account
          </Link>
          <Link href="/" className="secondary">
            Back to public site
          </Link>
        </div>
      </div>
    );
  }

  const cards: FeedCard[] = [
    {
      id: 'plan',
      community: 'r/MyPlan',
      title: 'Continue planning your journey',
      body: 'Flights, stays, events, and requirements stay in one traveler space. Open My Plan to add or review items.',
      href: '/traveler',
      kind: 'action',
    },
    {
      id: 'track',
      community: 'r/Tracking',
      title: 'Track a flight',
      body: 'Live status appears only when a tracking provider is connected. No simulated positions are shown.',
      href: '/track',
      kind: 'action',
    },
    {
      id: 'explore',
      community: 'r/Explore',
      title: 'Search flights and travel options',
      body: 'Bookable results come from connected providers only. If search is not connected, Expodia will say so honestly.',
      href: '/explore',
      kind: 'action',
    },
    {
      id: 'assistant',
      community: 'r/Assistant',
      title: 'Ask the Virtual Agent',
      body: 'One assistant on the surface. Specialists run underneath — you never have to pick an agent.',
      href: '/assistant',
      kind: 'action',
    },
    {
      id: 'intel',
      community: 'r/Intelligence',
      title: 'Personalized intelligence is not populated yet',
      body: 'When continuous research and personalization are connected, relevant route and destination cards will appear here. Until then, this space stays empty rather than inventing news or fares.',
      kind: 'empty',
    },
  ];

  return (
    <div className="expodiaHome">
      <header className="ehTopBar">
        <Link href="/home" className="ehBrand">
          Expodia <span>Home</span>
        </Link>
        <form className="ehSearch" action="/explore" method="get" role="search">
          <input name="q" type="search" placeholder="Search Expodia" aria-label="Search Expodia" />
        </form>
        <div className="ehTopActions">
          <Link href="/notifications">Notifications</Link>
          <Link href="/traveler/inbox">Messages</Link>
          <Link href="/traveler/profile">Profile</Link>
          <button type="button" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>

      <div className="ehLayout">
        <aside className="ehSide">
          <nav className="ehCard ehNavList" aria-label="Home navigation">
            <Link href="/home" className="active">
              Home
            </Link>
            <Link href="/explore">Explore</Link>
            <Link href="/traveler">My Plan</Link>
            <Link href="/track">Track</Link>
            <Link href="/marketplace">Marketplace</Link>
            <Link href="/assistant">Assistant</Link>
            <Link href="/traveler/inbox">Messages</Link>
            <Link href="/traveler/profile">Profile</Link>
          </nav>
          <div className="ehCard">
            <div className="ehSectionTitle">Communities</div>
            <div className="ehChipRow">
              <Link className="ehChip" href="/aviation-public">
                Aviation
              </Link>
              <Link className="ehChip" href="/explore">
                Routes
              </Link>
              <Link className="ehChip" href="/marketplace">
                Stays
              </Link>
              <Link className="ehChip" href="/traveler">
                My trips
              </Link>
            </div>
          </div>
        </aside>

        <main className="ehFeed">
          <section className="ehCard ehWelcome">
            <h1>Good to see you, {displayName}</h1>
            <p>
              This is your travel home — personalized when intelligence is available. Operational data only comes from
              connected providers.
            </p>
          </section>

          {cards.map((card) => (
            <article key={card.id} className="ehCard ehPost">
              <div className="ehVote" aria-hidden="true">
                <span>▲</span>
                <span>·</span>
                <span>▼</span>
              </div>
              <div className="ehPostBody">
                <div className="ehMeta">
                  <strong>{card.community}</strong>
                  {card.kind === 'empty' ? ' · waiting on verified intelligence' : ' · Expodia'}
                </div>
                <h2>{card.title}</h2>
                <p>{card.body}</p>
                <div className="ehActions">
                  {card.href ? (
                    <Link href={card.href}>{card.kind === 'action' ? 'Open →' : 'View'}</Link>
                  ) : (
                    <span>No invented content</span>
                  )}
                  <Link href="/assistant">Ask Virtual Agent</Link>
                </div>
              </div>
            </article>
          ))}
        </main>

        <aside className="ehRail">
          <div className="ehCard ehCardPad">
            <div className="ehSectionTitle" style={{ padding: 0, marginBottom: 8 }}>
              Shortcuts
            </div>
            <div className="ehNavList" style={{ padding: 0 }}>
              <Link href="/traveler">My Plan</Link>
              <Link href="/bookings">Bookings</Link>
              <Link href="/documents">Documents</Link>
              <Link href="/support">Support</Link>
            </div>
          </div>
          <div className="ehCard ehCardPad">
            <div className="ehSectionTitle" style={{ padding: 0, marginBottom: 8 }}>
              About this feed
            </div>
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: '#7c7c7c' }}>
              Cards here are navigation and honest status only. Aviation news, fares, and live tracking appear when
              verified sources are connected — never as placeholders.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
