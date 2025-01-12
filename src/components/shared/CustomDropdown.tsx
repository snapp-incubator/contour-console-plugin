import React, { useState } from 'react';
import {
  Select,
  SelectOption,
  SelectVariant,
  SelectProps,
} from '@patternfly/react-core';

export interface DropdownOption {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  isDisabled = false,
  className,
  'aria-label': ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const onToggle = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const onSelect: SelectProps['onSelect'] = (_, value) => {
    onChange(value as string);
    setIsOpen(false);
  };

  return (
    <Select
      variant={SelectVariant.single}
      aria-label={ariaLabel || placeholder}
      onToggle={onToggle}
      onSelect={onSelect}
      selections={value}
      isOpen={isOpen}
      placeholderText={placeholder}
      isDisabled={isDisabled}
      className={className}
    >
      {options.map(({ label, value }) => (
        <SelectOption key={value} value={value}>
          {label}
        </SelectOption>
      ))}
    </Select>
  );
};

export default CustomDropdown;
