import React from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownToggle,
  InputGroup,
  TextInput,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';

interface HTTPProxyFiltersProps {
  selectedFilter: string;
  searchValue: string;
  isFilterOpen: boolean;
  onFilterToggle: (isOpen: boolean) => void;
  onFilterSelect: (event: React.SyntheticEvent<HTMLDivElement>) => void;
  onSearchChange: (value: string) => void;
  t: (key: string, options?: object) => string;
}

export const HTTPProxyFilters = ({
  selectedFilter,
  searchValue,
  isFilterOpen,
  onFilterToggle,
  onFilterSelect,
  onSearchChange,
  t,
}: HTTPProxyFiltersProps): JSX.Element => {
  const filterItems = [
    <DropdownItem key="name">{t('name')}</DropdownItem>,
    <DropdownItem key="label">{t('label')}</DropdownItem>,
  ];

  return (
    <Flex className="pf-u-mt-xl">
      <FlexItem>
        <InputGroup>
          <Dropdown
            toggle={
              <DropdownToggle onToggle={onFilterToggle} icon={<FilterIcon />}>
                {selectedFilter}
              </DropdownToggle>
            }
            isOpen={isFilterOpen}
            dropdownItems={filterItems}
            onSelect={onFilterSelect}
          />
          <TextInput
            value={searchValue}
            type="text"
            onChange={onSearchChange}
            aria-label={t('search_by', { filter: selectedFilter })}
            placeholder={t('search_by_placeholder').replace(
              '{{filter}}',
              selectedFilter.toLowerCase(),
            )}
          />
        </InputGroup>
      </FlexItem>
    </Flex>
  );
};
