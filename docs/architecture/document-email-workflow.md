# Canonical document and email workflow

Travel documents and transactional emails are workflow artifacts, not isolated templates.

## Lifecycle

Verified booking/payment/ticket event → document intelligence → approved template/provider document → verification → canonical document record → app display/download → authorized email queue → delivery history.

Every artifact retains its document version, template version, issuer, source references and event history. A changed document creates a new version and records which document it supersedes.

## Agent contract

All Expodia workers use the central agent rules. Document Intelligence identifies what is required; Document Retrieval obtains provider-issued artifacts; Document Verification checks authoritative identifiers; Document Renderer uses only approved templates; Document Distribution publishes the canonical artifact to the authorized customer/agent surfaces and queues email; Communication Worker handles delivery; Integrity Worker blocks incomplete or contradictory artifacts.

No worker may invent a ticket number, PNR, payment, fare, boarding pass, booking confirmation or provider document. Provider-issued artifacts keep their issuer identity. Expodia-generated artifacts use the currently authorized Expodia document identity/configuration.

## Display and download

The Documents surface reads canonical records. READY artifacts can be downloaded only through the controlled document endpoint. A download is recorded in document history. Missing storage content is reported as unavailable; the system does not generate a fake download.

## Email

Emails are selected from the registered template family from verified workflow events. The queue records recipient, template/version, subject, document/booking link and delivery status. Sending is separate from rendering, so a slow or unavailable mail provider cannot make a document appear sent.

## History

Document history records creation, verification, publication, download and supersession. Email history records queued/sent/delivered/failed/cancelled. This is the audit trail for what the system actually produced and delivered.

## Branding

Brand identity is configuration, not hard-coded business logic. The current code must not impersonate an external issuer. If an authorized brand/issuer configuration changes later, new artifacts use the new configuration while historical artifacts retain the identity and template version with which they were issued.
