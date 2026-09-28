export type WorkTrigger =
  | 'SCHEDULE'
  | 'EVENT'
  | 'USER'
  | 'HUMAN_AGENT'
  | 'ADMIN'
  | 'AGENT';

export interface ContinuousWorkItem {
  id: string;
  workerKey: string;
  trigger: WorkTrigger;
  action: string;
  input: Record<string, unknown>;
  idempotencyKey: string;
  scheduledFor?: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  maxAttempts?: number;
}

export interface WorkMemory {
  workerKey: string;
  scope: string;
  lastObservedAt?: string;
  lastSuccessfulRunAt?: string;
  cursor?: string;
  sourceState: Record<string, unknown>;
  processedIds: string[];
}

export interface WorkResult {
  status: 'STARTED' | 'SUCCEEDED' | 'FAILED' | 'REQUIRES_REVIEW';
  workerKey: string;
  action: string;
  startedAt: string;
  completedAt?: string;
  changesDetected: number;
  output: Record<string, unknown>;
  nextWork?: ContinuousWorkItem[];
}

export function buildDiscoveryIdempotencyKey(workerKey: string, source: string, sourceVersion: string): string {
  return `discovery:${workerKey}:${source}:${sourceVersion}`;
}

export function shouldProcessObservation(
  memory: WorkMemory,
  source: string,
  sourceVersion: string,
): boolean {
  const key = `${source}:${sourceVersion}`;
  const processed = memory.processedIds.includes(key);
  const lastVersion = memory.sourceState[source]?.version;
  return !processed && lastVersion !== sourceVersion;
}

export function recordObservation(
  memory: WorkMemory,
  source: string,
  sourceVersion: string,
  observedAt: string,
): WorkMemory {
  const key = `${source}:${sourceVersion}`;
  return {
    ...memory,
    lastObservedAt: observedAt,
    sourceState: {
      ...memory.sourceState,
      [source]: { version: sourceVersion, observedAt },
    },
    processedIds: [...memory.processedIds, key],
  };
}
