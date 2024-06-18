import { match as RMatch } from 'react-router-dom';

export type ServiceType = {
  name: string;
  protocol: string;
  port: number;
  weight: number;
};
export type CreateRouteProps = {
  match: RMatch<{
    ns?: string;
  }>;
};
