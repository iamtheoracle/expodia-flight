export type DiscoveryCadence = 'EVENT_DRIVEN' | 'ADAPTIVE' | 'FREQUENT' | 'STANDARD';

export type DiscoveryDomain =
  | 'FLIGHTS'
  | 'AIRPORTS'
  | 'AIRCRAFT'
  | 'HOTELS'
  | 'DESTINATIONS'
  | 'PLACES'
  | 'TOURS'
  | 'ACTIVITIES'
  | 'EXPERIENCES'
  | 'TRAVEL_NEWS'
  | 'PARTNER_UPDATES'
  | 'TECHNICAL_UPDATES';

export interface DiscoveryAgentInstruction {
  key: string;
  mission: string;
  domains: readonly DiscoveryDomain[];
  cadence: DiscoveryCadence;
  continuous: boolean;
  memoryRequired: boolean;
  changeDetectionRequired: boolean;
  deduplicateSeenResults: boolean;
  publishOnlyMeaningfulChanges: boolean;
  sourceRules: readonly string[];
  outputRules: readonly string[];
}

export const DISCOVERY_WORKFORCE: readonly DiscoveryAgentInstruction[] = [
  {
    key: 'flight_discovery',
    mission: 'Continuously discover, verify and interpret meaningful changes in flights, routes, schedules, fares and airline travel availability from approved sources.',
    domains: ['FLIGHTS'],
    cadence: 'FREQUENT',
    continuous: true,
    memoryRequired: true,
    changeDetectionRequired: true,
    deduplicateSeenResults: true,
    publishOnlyMeaningfulChanges: true,
    sourceRules: [
      'Use approved sources and provider-authoritative data where available.',
      'Respect source terms, rate limits, caching and backoff requirements.',
      'Never fabricate an offer, fare, schedule or airline announcement.',
    ],
    outputRules: [
      'Record what was observed and when.',
      'Compare against the last verified state.',
      'Emit only new or materially changed information.',
      'Keep provider/source provenance attached to every result.',
    ],
  },
  {
    key: 'airport_discovery',
    mission: 'Continuously monitor airports for meaningful operational, route, facility and travel-relevant updates.',
    domains: ['AIRPORTS'],
    cadence: 'FREQUENT',
    continuous: true,
    memoryRequired: true,
    changeDetectionRequired: true,
    deduplicateSeenResults: true,
    publishOnlyMeaningfulChanges: true,
    sourceRules: ['Prefer official airport, aviation authority and provider sources for operational facts.'],
    outputRules: ['Retain source, timestamp and change history.', 'Do not repeat unchanged information as new discovery.'],
  },
  {
    key: 'travel_discovery',
    mission: 'Continuously discover useful destinations, places, hotels, tours, activities, experiences and travel opportunities from approved sources.',
    domains: ['HOTELS', 'DESTINATIONS', 'PLACES', 'TOURS', 'ACTIVITIES', 'EXPERIENCES'],
    cadence: 'STANDARD',
    continuous: true,
    memoryRequired: true,
    changeDetectionRequired: true,
    deduplicateSeenResults: true,
    publishOnlyMeaningfulChanges: true,
    sourceRules: [
      'Use approved partner and public sources according to their permitted access.',
      'Preserve the actual source and any referral/deep link.',
      'Do not represent an external provider booking as an Expodia booking.',
    ],
    outputRules: [
      'Store useful discoveries for later presentation even when no user is online.',
      'Keep source provenance and freshness.',
      'Make discoveries shareable into authorized groups, profiles and feeds.',
    ],
  },
  {
    key: 'travel_news',
    mission: 'Continuously monitor approved news and official information sources for meaningful travel, airline, airport, destination and industry updates.',
    domains: ['TRAVEL_NEWS'],
    cadence: 'FREQUENT',
    continuous: true,
    memoryRequired: true,
    changeDetectionRequired: true,
    deduplicateSeenResults: true,
    publishOnlyMeaningfulChanges: true,
    sourceRules: [
      'Verify important claims against reliable primary or high-quality secondary sources.',
      'Record publication time and source.',
      'Respect source access rules and rate limits.',
    ],
    outputRules: [
      'A previously seen story may be revisited only when there is a material update.',
      'Preserve the distinction between source reporting and agent interpretation.',
      'Store updates even when no customer is currently viewing the app.',
    ],
  },
  {
    key: 'technical_update_discovery',
    mission: 'Monitor assigned technical sources such as repositories, releases, commits and documentation for meaningful changes relevant to Expodia.',
    domains: ['TECHNICAL_UPDATES'],
    cadence: 'FREQUENT',
    continuous: true,
    memoryRequired: true,
    changeDetectionRequired: true,
    deduplicateSeenResults: true,
    publishOnlyMeaningfulChanges: true,
    sourceRules: [
      'Monitor only explicitly assigned repositories and technical sources.',
      'Identify commits, releases, issues and documentation changes using source identifiers.',
      'Do not treat an old observation as a new event merely because it was fetched again.',
    ],
    outputRules: [
      'Maintain last-seen source state.',
      'Record new commits/releases/issues as changes.',
      'Allow authorized sharing into internal agent context and relevant user/group surfaces.',
    ],
  },
];

export function getDiscoveryInstruction(key: string): DiscoveryAgentInstruction | undefined {
  return DISCOVERY_WORKFORCE.find((agent) => agent.key === key);
}
