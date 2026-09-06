export interface AuditEventInput {
  actorId?: string;
  action: string;
  entityType: string;
  entityId: string;
  outcome: 'SUCCESS' | 'FAILED' | 'REJECTED';
  providerName?: string;
  providerRequestId?: string;
  metadata?: Record<string, unknown>;
}

export function createAuditEvent(input: AuditEventInput) {
  if (!input.action || !input.entityType || !input.entityId) {
    throw new Error('Audit event requires action, entity type, and entity ID');
  }
  return {
    ...input,
    metadata: input.metadata ?? {},
    createdAt: new Date().toISOString(),
  };
}
