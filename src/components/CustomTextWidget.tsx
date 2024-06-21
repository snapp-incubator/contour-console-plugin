import * as React from 'react';
import { WidgetProps } from '@rjsf/core';

const CustomTextWidget = (props: WidgetProps) => {
  const { id, value, required, options, onChange, rawErrors = [] } = props;
  const { className } = options as { className: string };
  return (
    <div className={className}>
      <input
        className="pf-c-form-control"
        type="text"
        id={id}
        value={value || ''}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
      {rawErrors.length > 0 && (
        <div className="help-block">
          {rawErrors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomTextWidget;
