/** Shared agent command + answer types. No fabricated operational data. */

export type AgentIntent =
  | 'SEARCH_FLIGHTS'
  | 'COMPARE_FLIGHTS'
  | 'TRACK_FLIGHT'
  | 'SELECT_OFFER'
  | 'BOOK_START'
  | 'BOOK_COMMIT'
  | 'STAY_SEARCH'
  | 'PLAN_ADD'
  | 'DOCUMENT_VERIFY'
  | 'SUPPORT_HANDOFF'
  | 'FREE_TEXT'
  | 'NAV_TRIPS'
  | 'NAV_HOME'
  | 'NAV_EXPLORE'
  | 'NAV_TRACK';

export type AgentCommand = {
  intent: AgentIntent;
  payload?: {
    origin?: string;
    destination?: string;
    date?: string;
    cabin?: string;
    maxStops?: number;
    sort?: 'price' | 'duration' | 'value';
    offerId?: string;
    flightNumber?: string;
    text?: string;
  };
  /** Required true for BOOK_COMMIT */
  confirm?: boolean;
};

export type JobStatus = 'ok' | 'empty' | 'not_configured' | 'error' | 'conflict' | 'nav' | 'clarify';

export type AnswerAction = {
  id: string;
  label: string;
  intent?: AgentIntent;
  href?: string;
};

export type AnswerBlock =
  | { type: 'message'; text: string }
  | { type: 'unavailable'; domain: string; text: string }
  | { type: 'nav'; href: string; text: string };

export type AgentAnswer = {
  status: JobStatus;
  summary: string;
  blocks: AnswerBlock[];
  actions: AnswerAction[];
};
