import { Flex, Popover, Button } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@patternfly/react-icons';

interface Condition {
  errors?: Array<{
    message: string;
    reason: string;
    status: string;
    type: string;
  }>;
}

interface StatusIndicatorProps {
  status: string;
  t: (key: string) => string;
  conditions?: Condition[];
}

export const StatusIndicator = ({
  status,
  t,
  conditions,
}: StatusIndicatorProps): JSX.Element => {
  const hasErrors = conditions?.some(
    (condition) => condition.errors?.length > 0,
  );

  const ErrorContent = () => (
    <div>
      {conditions?.map((condition, index) =>
        condition.errors?.map((error, errorIndex) => (
          <div key={`${index}-${errorIndex}`} className="pf-u-mb-md">
            <div>
              <strong>{t('type')}:</strong> {error.type}
            </div>
            <div>
              <strong>{t('reason')}:</strong> {error.reason}
            </div>
            <div>
              <strong>{t('message')}:</strong> {error.message}
            </div>
          </div>
        )),
      )}
    </div>
  );

  if (status === 'valid') {
    return (
      <Flex>
        <CheckCircleIcon className="pf-u-mr-xs" color="green" />
        {t('accepted')}
      </Flex>
    );
  }

  return (
    <Flex alignItems={{ default: 'alignItemsCenter' }}>
      {hasErrors ? (
        <>
          <ExclamationCircleIcon className="pf-u-mr-xs" color="red" />
          <Popover
            enableFlip
            hasAutoWidth
            position="right"
            headerContent={t('error_details')}
            bodyContent={<ErrorContent />}
          >
            <Button variant="link" className="pf-u-mt-0 pf-u-mb-0" isInline>
              {t('error')}
              <span className="pf-u-ml-xs">({t('error_details')})</span>
            </Button>
          </Popover>
        </>
      ) : (
        <Flex>
          <ExclamationCircleIcon className="pf-u-mr-xs" color="red" />
          {t('error')}
        </Flex>
      )}
    </Flex>
  );
};
