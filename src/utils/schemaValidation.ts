import { FormData } from '../types';
import { useTranslation } from 'react-i18next';

export const validateForm = (data: FormData): string[] => {
  const { t } = useTranslation('plugin__contour-console-plugin');
  const errors: string[] = [];

  if (!data.name?.trim()) {
    errors.push(t('error_name_required'));
  }

  if (!data.fqdn?.trim()) {
    errors.push(t('error_hostname_required'));
  }

  if (!data.ingressClassName) {
    errors.push(t('error_proxy_type_required'));
  }

  if (!data.routes?.length) {
    errors.push(t('error_route_required'));
  } else {
    data.routes.forEach((route, routeIndex) => {
      if (!route.prefix?.trim()) {
        errors.push(t('error_route_path_required', { number: routeIndex + 1 }));
      }

      if (!route.services?.length) {
        errors.push(
          t('error_route_service_required', { number: routeIndex + 1 }),
        );
      } else {
        route.services.forEach((service, serviceIndex) => {
          if (!service.name) {
            errors.push(
              t('error_route_service_name_required', {
                number: routeIndex + 1,
                serviceNumber: serviceIndex + 1,
              }),
            );
          }
          if (!service.port) {
            errors.push(
              t('error_route_service_port_required', {
                number: routeIndex + 1,
                serviceNumber: serviceIndex + 1,
              }),
            );
          }
          if (service.validation) {
            if (!service.caSecret) {
              errors.push(
                t('error_route_service_ca_secret', {
                  number: routeIndex + 1,
                  serviceNumber: serviceIndex + 1,
                }),
              );
            }
            if (!service.subjectName?.trim()) {
              errors.push(
                t('error_route_service_subject_name', {
                  number: routeIndex + 1,
                  serviceNumber: serviceIndex + 1,
                }),
              );
            }
          }
        });
      }
    });
  }

  if (data.conditional?.secureRoute) {
    if (!data.conditional.termination) {
      errors.push(t('error_secure_route_termination'));
    }
    if (
      data.conditional.termination !== 'passthrough' &&
      !data.conditional.secrets
    ) {
      errors.push(t('error_secure_route_secret'));
    }
  }

  return errors;
};
