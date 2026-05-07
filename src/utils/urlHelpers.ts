export const getClusterDomainFromBrowser = () => {
  if (typeof window === 'undefined') return null;
  const url = window.location.hostname;
  const match = url.match(/okd4\.[^.]+(?:-\d+)?\.(?:staging-)?snappcloud\.io/);
  return match ? match[0] : null;
};

export const isSnappgroupUrl = () => {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.includes('snappgroup');
};

/** Returns config-server URL for Contour ingress metadata, or null when the cluster domain cannot be detected. */
export const constructConfigIngressUrl = (): string | null => {
  const browserClusterDomain = getClusterDomainFromBrowser();
  if (!browserClusterDomain) {
    return null;
  }
  return `https://config-server.apps.private.${browserClusterDomain}/api/contour`;
};
