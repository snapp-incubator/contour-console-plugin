import { Popover, Button } from '@patternfly/react-core';
import InfoCircleIcon from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';
import { PopoverContentProps, PopoverComponentProps } from './popover.type';

const PopoverContent = (props: PopoverContentProps) => {
  return (
    <div className="pf-v5-u-text-wrap pf-v5-u-white-space-pre-line">
      {props.content}
    </div>
  );
};

export const AlertPopover = (props: PopoverComponentProps) => {
  const { title, footer, content } = props;
  return (
    <Popover
      headerContent={title}
      headerIcon={<InfoCircleIcon />}
      headerComponent="h1"
      bodyContent={<PopoverContent content={content} />}
      footerContent={footer}
      appendTo={() => document.body}
      enableFlip
      showClose={false}
    >
      <Button className="pf-u-px-sm" variant="plain">
        <InfoCircleIcon />
      </Button>
    </Popover>
  );
};
