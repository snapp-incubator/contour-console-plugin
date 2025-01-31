import React, { useState } from 'react';
import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
} from '@patternfly/react-core';
import type { AlertType, ToastProps } from './toast.type';

export const useToast = () => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);

  const addAlert = (
    title: string,
    variant: 'danger' | 'success' = 'danger',
  ) => {
    const key = new Date().getTime();
    setAlerts([{ title, variant, key }]);

    setTimeout(() => {
      removeAlert(key);
    }, 3000);
  };

  const removeAlert = (key: number) => {
    setAlerts(alerts.filter((alert) => alert.key !== key));
  };

  return { alerts, addAlert, removeAlert };
};

export const Toast = ({ alerts, removeAlert }: ToastProps) => {
  return (
    <AlertGroup isToast>
      {alerts.map(({ key, variant, title }) => (
        <Alert
          variant={variant}
          title={title}
          actionClose={
            <AlertActionCloseButton
              title={title}
              onClose={() => removeAlert(key)}
            />
          }
          key={key}
        />
      ))}
    </AlertGroup>
  );
};
