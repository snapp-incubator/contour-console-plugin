import { match as RMatch } from 'react-router-dom';
import yamlParser from 'js-yaml';

export type ServiceType = {
  name: string;
  port: number;
  weight: number;
};
export type CreateRouteProps = {
  match: RMatch<{
    ns?: string;
  }>;
};

export const yamlParserType = [
  yamlParser.Type('!', {
    kind: 'scalar',
    resolve: (data) => data === null,
    construct: () => '',
    instanceOf: String,
    represent: () => '',
  }),
];
