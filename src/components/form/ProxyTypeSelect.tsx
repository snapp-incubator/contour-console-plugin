import React from 'react';
import CustomDropdown from '../shared/CustomDropdown';
import type { DropdownOption } from '../shared/CustomDropdown';

interface ProxyTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
}

const PROXY_OPTIONS: DropdownOption[] = [
  { label: 'Public', value: 'public' },
  { label: 'Private', value: 'private' },
];

const ProxyTypeSelect: React.FC<ProxyTypeSelectProps> = ({
  value,
  onChange,
  isDisabled,
}) => {
  return (
    <CustomDropdown
      options={PROXY_OPTIONS}
      value={value}
      onChange={onChange}
      placeholder="Select HTTP Proxy type"
      isDisabled={isDisabled}
      aria-label="Select HTTP Proxy type"
    />
  );
};

export default ProxyTypeSelect;
