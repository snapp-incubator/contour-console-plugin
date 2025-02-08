export const getClusterDomainFromBrowser = () => {
  if (typeof window === 'undefined') return null;
  const url = window.location.hostname;
  const match = url.match(/okd4\.[^.]+(?:-\d+)?\.(?:staging-)?snappcloud\.io/);
  return match ? match[0] : null;
};

export const constructConfigIngressUrl = () => {
  const browserClusterDomain = getClusterDomainFromBrowser();

  return `https://config-server.apps.private.${browserClusterDomain}/api/contour`;
};
