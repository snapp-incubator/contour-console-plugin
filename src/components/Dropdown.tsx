import * as React from 'react';
import { DropdownItem, Dropdown, DropdownToggle } from '@patternfly/react-core';

interface DynamicDropdownProps {
  items: Array<string | { id: string; name: string }>;
  selectedItem: string | null;
  selectedKey?: (selected: string) => void;
  onSelect: (selected: string) => void;
  placeholder?: string;
}

const DynamicDropdown: React.FC<DynamicDropdownProps> = ({
  items,
  selectedItem,
  onSelect,
  selectedKey,
  placeholder = 'Select an item',
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleToggle = (isOpenValue: boolean) => {
    setIsOpen(isOpenValue);
  };

  const handleSelect = (event) => {
    const targetElement = event.target;
    setIsOpen(!isOpen);
    onSelect(targetElement.textContent);
    selectedKey(targetElement.getAttribute('data-key'));
  };

  const dropdownItems = items.map((item, index) => {
    const label = typeof item === 'string' ? item : item.name;
    const key = typeof item === 'string' ? item : item.id;

    return (
      <DropdownItem data-key={key} key={key}>
        {label}
      </DropdownItem>
    );
  });

  return (
    <Dropdown
      className="dropdown--full-width"
      onSelect={handleSelect}
      toggle={
        <DropdownToggle onToggle={handleToggle}>
          {selectedItem || placeholder}
        </DropdownToggle>
      }
      isOpen={isOpen}
      dropdownItems={dropdownItems}
    />
  );
};

export default DynamicDropdown;
