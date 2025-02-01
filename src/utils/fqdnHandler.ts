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
    const parts = hostname.replace(/^console\./, '').split('.');

    // Extract all components
    const subdomain = parts[0];
    const currentIngressClass = parts[1];
    const cluster = parts[2];
    const region = parts.slice(3).join('.');

    const newDomain = `${subdomain}.${
      ingressClassName || currentIngressClass
    }.${cluster}.${region}`;
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
