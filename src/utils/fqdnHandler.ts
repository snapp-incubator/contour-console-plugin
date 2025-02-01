const domainRegex = /^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$/;

export const convertToDomain = (
  ingressClassName: string,
  fqdn: string,
): string => {
  if (!fqdn || fqdn.trim() === '') {
    return fqdn;
  }

  // Remove leading/trailing dots and whitespace
  const cleanedValue = fqdn.trim().replace(/^\.+|\.+$/g, '');

  if (domainRegex.test(cleanedValue)) {
    return cleanedValue;
  }

  if (/^[a-zA-Z0-9-]+$/.test(cleanedValue)) {
    const hostname = window.location.hostname;

    // Extract domain parts
    const [subdomain, currentIngressClass, cluster, ...regionParts] = hostname
      .replace(/^console\./, '')
      .split('.');

    const region = regionParts.join('.');
    const ingressClass = ingressClassName || currentIngressClass;

    const domainParts = [subdomain, ingressClass, cluster, region].filter(
      Boolean,
    );

    const newDomain = domainParts.join('.');
    return `${cleanedValue}.${newDomain}`;
  }

  return fqdn;
};

export const convertToString = (value: string): string => {
  if (value != null) {
    if (domainRegex.test(value)) {
      return value;
    }
  }

  return value;
};

export const getBaseURL = () => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  return parts.slice(1).join('.');
};
