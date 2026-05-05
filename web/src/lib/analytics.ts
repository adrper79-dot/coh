type AnalyticsPrimitive = string | number | boolean | null;

export type AnalyticsProperties = Record<string, AnalyticsPrimitive | undefined>;

declare global {
  interface Window {
    posthog?: {
      capture?: (eventName: string, properties?: Record<string, unknown>) => void;
    };
  }
}

export function trackEvent(eventName: string, properties: AnalyticsProperties = {}): void {
  if (typeof window === 'undefined') {
    return;
  }

  const payload = Object.fromEntries(
    Object.entries({
      ...properties,
      path: window.location.pathname,
      timestamp: new Date().toISOString(),
    }).filter(([, value]) => value !== undefined)
  );

  window.dispatchEvent(
    new CustomEvent('cypher:analytics', {
      detail: {
        eventName,
        properties: payload,
      },
    })
  );

  window.posthog?.capture?.(eventName, payload);

  if (import.meta.env.DEV) {
    console.info('[analytics]', eventName, payload);
  }
}