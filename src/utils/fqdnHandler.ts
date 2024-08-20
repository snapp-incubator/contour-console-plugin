// Regular expression for valid domain
const domainRegex = /^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$/;

export const convertToDomain = (value: string): string => {
  if (value != null) {
    // Check if it's a valid domain
    if (domainRegex.test(value)) {
      return value;
    }
    const parts = value.split('.');
    if (parts.length > 0) {
      const hostname = window.location.hostname;
      return `${value}.${hostname}`;
    }
  }

  return value;
};

export const convertToString = (value: string): string => {
  if (value != null) {
    // Regular expression for valid domain
    const hostname = window.location.hostname;
    const parts = value.split('.');

    if (parts.length > 0 && parts[1] === hostname) {
      return parts[0];
    }

    // Check if it's a valid domain
    if (domainRegex.test(value)) {
      return value;
    }
  }

  return value;
};
