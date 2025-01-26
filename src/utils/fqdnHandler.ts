const domainRegex = /^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$/;

export const convertToDomain = (value: string): string => {
  if (!value || value.trim() === '') {
    return value;
  }

  // Remove leading/trailing dots and whitespace
  const cleanedValue = value.trim().replace(/^\.+|\.+$/g, '');

  if (domainRegex.test(cleanedValue)) {
    return cleanedValue;
  }

  // Only proceed if the cleaned value contains valid characters
  if (/^[a-zA-Z0-9-]+$/.test(cleanedValue)) {
    const hostname = window.location.hostname;
    const cleanedHostname = hostname.replace(/^console\./, '');
    return `${cleanedValue}.${cleanedHostname}`;
  }

  return value;
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
