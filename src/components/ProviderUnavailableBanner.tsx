/**
 * Honest empty state when a live provider is not connected.
 * Use on Explore / Track — never invent inventory or operational data.
 */
type Props = {
  title: string;
  message: string;
  className?: string;
};

export default function ProviderUnavailableBanner({ title, message, className = '' }: Props) {
  return (
    <div
      className={`providerUnavailable ${className}`}
      role="status"
      style={{
        margin: '16px 0',
        padding: '14px 16px',
        borderRadius: 12,
        background: '#f1f5f9',
        border: '1px solid #e2e8f0',
        color: '#334155',
        maxWidth: 560,
      }}
    >
      <strong style={{ display: 'block', marginBottom: 4, color: '#0f172a' }}>{title}</strong>
      <span style={{ fontSize: 14, lineHeight: 1.45 }}>{message}</span>
    </div>
  );
}

export const FLIGHT_SEARCH_UNAVAILABLE = {
  title: 'Live flight search is not connected yet',
  message:
    'Expodia does not invent inventory, prices, or availability. Connect an approved flight provider to enable search.',
};

export const FLIGHT_TRACKING_UNAVAILABLE = {
  title: 'Live flight tracking is not configured yet',
  message:
    'Operational status is only shown from a connected tracking provider. No simulated positions are displayed.',
};
