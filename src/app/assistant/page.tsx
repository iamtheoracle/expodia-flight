'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import AgentCommandBar from '@/components/agents/AgentCommandBar';
import type { AgentAnswer } from '@/lib/agents/types';

const suggestions = [
  'I want to book a flight',
  'I need help with an existing trip',
  'I need a place to stay',
  'I am planning a trip with family',
];

export default function AssistantPage() {
  const router = useRouter();
  const [request, setRequest] = useState('');
  const [reply, setReply] = useState(
    'Tell me what you are here to do. I can help you find the right part of Expodia and, when needed, connect you with an available travel professional.',
  );
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<string[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);

  function onCommandAnswer(answer: AgentAnswer) {
    setReply(answer.summary);
    setSources([]);
  }

  async function connectHuman() {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setReply(
        'A travel professional can join the conversation when you are signed in. Sign in as a traveler first, then ask me to connect you.',
      );
      setLoading(false);
      return;
    }
    const { data: agents } = await supabase
      .from('agent_presence')
      .select('user_id,display_name')
      .eq('status', 'ONLINE')
      .gte('last_seen_at', new Date(Date.now() - 120000).toISOString())
      .order('last_seen_at', { ascending: false })
      .limit(1);
    const selected = agents?.[0];
    const { data: conversationId, error } = await supabase.rpc('create_traveler_support_conversation', {
      p_subject: (request.trim() || 'Traveler support request').slice(0, 200),
      p_agent_user_id: selected?.user_id ?? null,
    });
    if (error || !conversationId) {
      setReply('I could not open the support handoff right now. Please try again.');
      setLoading(false);
      return;
    }
    if (request.trim()) {
      await supabase.from('support_messages').insert({
        conversation_id: conversationId,
        sender_user_id: user.id,
        body: request.trim(),
      });
    }
    if (selected) {
      setReply(
        `I found an available Expodia travel professional. ${selected.display_name || 'They'} can now take over this conversation.`,
      );
      router.push(`/traveler/inbox?id=${conversationId}`);
    } else {
      setReply(
        'No travel professional is available right now. Your request is in the support queue. You can keep planning while Expodia waits for an available professional.',
      );
      router.push(`/traveler/inbox?id=${conversationId}`);
    }
    setLoading(false);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const value = request.trim();
    if (!value) return;
    setLoading(true);
    setSources([]);
    try {
      const response = await fetch('/api/travel-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: value, mode: 'assistant', conversationId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setReply(data.error || 'Travel research is temporarily unavailable.');
        return;
      }
      setReply(data.answer || 'No verified answer was returned.');
      setSources(Array.isArray(data.sources) ? data.sources : []);
      if (data.conversationId) setConversationId(data.conversationId);
    } catch {
      setReply('Travel research is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="publicPage">
      <header className="publicHeader">
        <Link href="/" className="publicBrand">
          Expodia Flights
        </Link>
        <nav className="publicNav">
          <Link href="/home">Home</Link>
          <Link href="/explore">Explore</Link>
          <Link href="/track">Track</Link>
          <Link href="/traveler">Plan</Link>
          <Link href="/access" className="agentAccess">
            Sign in
          </Link>
        </nav>
      </header>
      <section className="assistantPage">
        <div className="assistantBadge">
          <span /> EXPODIA VIRTUAL AGENT
        </div>
        <h1>What are you here to do?</h1>
        <p>
          Tell Expodia in ordinary language or use a command. I can guide you through planning, tracking and support. I
          will not invent availability, prices, bookings or ticket status.
        </p>

        <AgentCommandBar onAnswer={onCommandAnswer} onSupportHandoff={connectHuman} />

        <form className="assistantComposer" onSubmit={submit}>
          <input
            value={request}
            onChange={(event) => setRequest(event.target.value)}
            placeholder="Ask Expodia to research something…"
          />
          <button className="publicPrimary" type="submit" disabled={loading}>
            {loading ? 'Researching…' : 'Research'}
          </button>
        </form>
        <div className="assistantSuggestions">
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setRequest(item);
                setReply(
                  `I can help you organise “${item}”. If a travel professional is needed, I can route the conversation to an eligible professional who is online.`,
                );
              }}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="assistantReply">{reply}</div>
        {sources.length > 0 && (
          <div className="assistantSources">
            <strong>Sources</strong>
            {sources.map((source) => (
              <a key={source} href={source} target="_blank" rel="noreferrer">
                {source}
              </a>
            ))}
          </div>
        )}
        <div className="assistantHandoff">
          <div>
            <strong>Need a travel professional?</strong>
            <span>
              Expodia can check for an eligible professional who is currently online and route the conversation without
              asking you for an agent ID.
            </span>
          </div>
          <button className="publicSecondary" type="button" onClick={connectHuman} disabled={loading}>
            {loading ? 'Checking…' : 'Connect me'}
          </button>
        </div>
        <Link className="publicSecondary assistantPlanLink" href="/traveler">
          Open My Plan
        </Link>
      </section>
    </main>
  );
}
