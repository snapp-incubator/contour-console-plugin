import React, { useState } from 'react';
import {
  Select,
  SelectOption,
  SelectVariant,
  SelectProps,
} from '@patternfly/react-core';
import { CustomDropdownProps } from './dropdown.type';

const CustomDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  isDisabled = false,
  className,
  'aria-label': ariaLabel,
}: CustomDropdownProps) => {
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
