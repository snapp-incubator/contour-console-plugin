export interface DropdownOption {
  label: string;
  value: string;
}

export interface CustomDropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
  className?: string;
  'aria-label'?: string;
}
