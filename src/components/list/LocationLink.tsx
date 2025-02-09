import { ExternalLinkAltIcon } from '@patternfly/react-icons';

interface LocationLinkProps {
  route: any;
}

export const LocationLink = ({ route }: LocationLinkProps) => {
  const url = route?.spec?.virtualhost
    ? `${route?.spec?.virtualhost?.tls ? 'https' : 'http'}://${
        route?.spec?.virtualhost?.fqdn
      }`
    : '';

  return url ? (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {url}
      <ExternalLinkAltIcon className="pf-u-ml-xs" />
    </a>
  ) : null;
};
