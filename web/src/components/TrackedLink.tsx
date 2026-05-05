import type { MouseEventHandler, ReactNode } from 'react';
import { Link as RouterLink, createPath, type LinkProps } from 'react-router-dom';
import { trackEvent, type AnalyticsProperties } from '@/lib/analytics';

interface TrackedLinkProps extends LinkProps {
  children: ReactNode;
  eventName?: string;
  trackingLabel?: string;
  trackingContext?: string;
  trackingProperties?: AnalyticsProperties;
}

export function TrackedLink({
  children,
  eventName = 'navigation_click',
  onClick,
  to,
  trackingContext,
  trackingLabel,
  trackingProperties,
  ...props
}: TrackedLinkProps) {
  const destination = typeof to === 'string' ? to : createPath(to);

  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    trackEvent(eventName, {
      context: trackingContext ?? window.location.pathname,
      destination,
      label: trackingLabel,
      ...trackingProperties,
    });

    onClick?.(event);
  };

  return (
    <RouterLink {...props} to={to} onClick={handleClick}>
      {children}
    </RouterLink>
  );
}