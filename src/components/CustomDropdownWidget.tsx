import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { WidgetProps } from '@rjsf/core';

const CustomDropdownWidget = (props: WidgetProps) => {
  const {
    id,
    value,
    required,
    onChange,
    options,
    schema,
    rawErrors = [],
  } = props;

  const { className } = options as { className: string };

  // States to manage the dropdown visibility and search term
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValue, setSelectedValue] = useState(value);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Function to handle the search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  // Filtered options based on the search term
  const filteredOptions = schema.enum?.filter((item: any) => {
    const label =
      typeof item.label === 'string' ? item.label : String(item.label);
    return label.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Handle option selection
  const handleOptionSelect = (selectedOption: {
    label: string;
    value: string;
  }) => {
    setSelectedValue(selectedOption.label);
    onChange(selectedOption.value);
    setIsDropdownOpen(false);
  };

  return (
    <div className={className} ref={dropdownRef}>
      <input
        type="hidden"
        id={id}
        value={selectedValue || ''}
        required={required}
      />
      <div className="custom-dropdown">
        <div
          className="custom-dropdown-header pf-c-form-control"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          {selectedValue || 'Select an option'}
        </div>
        {isDropdownOpen && (
          <div className="custom-dropdown-body">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pf-c-form-control"
            />
            <div
              className="custom-dropdown-options"
              style={{ maxHeight: '100px', overflowY: 'auto' }}
            >
              {filteredOptions &&
                filteredOptions.map(
                  (item: { label: string; value: string }) => (
                    <div
                      key={item.value}
                      className="custom-dropdown-option"
                      onClick={() => handleOptionSelect(item)}
                    >
                      {item.label}
                    </div>
                  ),
                )}
            </div>
          </div>
        )}
      </div>

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

export default CustomDropdownWidget;
