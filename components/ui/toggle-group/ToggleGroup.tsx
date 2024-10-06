import React from 'react';
import ToggleButton from './ToggleButton';

type ToggleOption = {
  label: string;
  value: string;
};

type Props = {
  onToggle: (_options: string[]) => void;
  options: ToggleOption[];
  selectedValues: string[];
};

export default function ToggleGroup({ onToggle, options, selectedValues }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(option => {
        const isActive = selectedValues.includes(option.value);
        return (
          <ToggleButton
            key={option.value}
            active={isActive}
            onClick={() => {
              if (isActive) {
                onToggle(
                  selectedValues.filter(selectedValue => {
                    return selectedValue !== option.value;
                  }),
                );
              } else {
                onToggle([...selectedValues, option.value]);
              }
            }}
          >
            {option.label}
          </ToggleButton>
        );
      })}
    </div>
  );
}
