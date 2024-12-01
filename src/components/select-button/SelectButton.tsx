import React, { useEffect, useState } from "react";
import SelectOptionButton from "../select-option-button/SelectOptionButton";
import "./SelectButton.css";

interface SelectButtonProps {
  label: string;
  value?: any;
  options: { label: string; value: any }[];
  onSelect: (option: any) => void;
}

const SelectButton: React.FC<SelectButtonProps> = ({
  label,
  value,
  options,
  onSelect,
}) => {
  const [selectedOption, setSelectedOption] = useState<any>();

  useEffect(() => {
    setSelectedOption(value);
  }, [value]);

  const handleOptionClick = (value: any) => {
    if (value === selectedOption) {
      setSelectedOption(undefined);
      onSelect(undefined);
    } else {
      setSelectedOption(value);
      onSelect(value);
    }
  };

  return (
    <div className="option-button">
      <label>{label}</label>
      <div className="option-buttons-container">
        {options.map(({ label, value }) => (
          <SelectOptionButton
            key={label}
            isSelected={value === selectedOption}
            onClick={() => handleOptionClick(value)}
          >
            {label}
          </SelectOptionButton>
        ))}
      </div>
    </div>
  );
};

export default SelectButton;
