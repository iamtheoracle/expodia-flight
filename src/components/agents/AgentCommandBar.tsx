'use client';

import Link from 'next/link';
import { useState } from 'react';
import { orchestrate } from '@/lib/agents/orchestrate';
import type { AgentAnswer, AgentCommand, AgentIntent } from '@/lib/agents/types';
import './agent-command-bar.css';

type Props = {
  onAnswer?: (answer: AgentAnswer) => void;
  onSupportHandoff?: () => void | Promise<void>;
  compact?: boolean;
};

const PRIMARY: { intent: AgentIntent; label: string }[] = [
  { intent: 'SEARCH_FLIGHTS', label: 'Search flights' },
  { intent: 'TRACK_FLIGHT', label: 'Track' },
  { intent: 'PLAN_ADD', label: 'My Plan' },
  { intent: 'STAY_SEARCH', label: 'Stays' },
  { intent: 'SUPPORT_HANDOFF', label: 'Talk to a person' },
];

export default function AgentCommandBar({ onAnswer, onSupportHandoff, compact }: Props) {
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState<AgentAnswer | null>(null);

  async function run(command: AgentCommand) {
    if (command.intent === 'SUPPORT_HANDOFF' && onSupportHandoff) {
      await onSupportHandoff();
      return;
    }
    setBusy(true);
    try {
      const result = await orchestrate(command);
      setAnswer(result);
      onAnswer?.(result);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`agentCommandBar ${compact ? 'compact' : ''}`}>
      <div className="acbLabel">Commands</div>
      <div className="acbRow" role="toolbar" aria-label="Expodia agent commands">
        {PRIMARY.map((btn) => (
          <button
            key={btn.intent}
            type="button"
            className="acbBtn"
            disabled={busy}
            onClick={() => run({ intent: btn.intent })}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {answer && (
        <div className="acbAnswer" role="status">
          <p className="acbSummary">{answer.summary}</p>
          {answer.blocks.map((block, i) => {
            if (block.type === 'unavailable') {
              return (
                <p key={i} className="acbUnavailable">
                  {block.text}
                </p>
              );
            }
            return (
              <p key={i} className="acbMsg">
                {block.text}
              </p>
            );
          })}
          {answer.actions.length > 0 && (
            <div className="acbActions">
              {answer.actions.map((action) =>
                action.href ? (
                  <Link key={action.id} className="acbAction" href={action.href}>
                    {action.label}
                  </Link>
                ) : action.intent ? (
                  <button
                    key={action.id}
                    type="button"
                    className="acbAction"
                    disabled={busy}
                    onClick={() => run({ intent: action.intent! })}
                  >
                    {action.label}
                  </button>
                ) : null,
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
