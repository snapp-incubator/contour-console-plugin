const domainRegex = /^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$/;

export const convertToDomain = (value: string): string => {
  if (value != null) {
    const domainRegex = /^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$/;

    if (domainRegex.test(value)) {
      return value;
    }

    const parts = value.split('.');
    if (parts.length > 0) {
      const hostname = window.location.hostname;
      const cleanedHostname = hostname.replace(/^console\./, '');
      return `${value}.${cleanedHostname}`;
    }
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
