// Regular expression for valid domain
const domainRegex = /^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$/;

export const convertToDomain = (value: string): string => {
  if (value != null) {
    // Regular expression for valid domain
    const domainRegex = /^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$/;

    // Check if it's a valid domain
    if (domainRegex.test(value)) {
      return value;
    }

    const parts = value.split('.');
    if (parts.length > 0) {
      const hostname = window.location.hostname;
      // Remove 'console' from the hostname
      const cleanedHostname = hostname.replace(/^console\./, '');
      return `${value}.${cleanedHostname}`;
    }
  }
  return value;
};

export const convertToString = (value: string): string => {
  if (value != null) {
    // Check if it's a valid domain
    if (domainRegex.test(value)) {
      return value;
    }
  }

  return value;
};
