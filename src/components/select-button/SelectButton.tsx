import React, { useState } from "react";
import "./SelectButton.css";
import SelectOptionButton from "../select-option-button/SelectOptionButton";

interface SelectButtonProps {
  label: string;
  options: string[];
  onSelect: (option: string) => void;
}

const SelectButton: React.FC<SelectButtonProps> = ({
  label,
  options,
  onSelect,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [optionValues, setOptions] = useState<string[]>(options);

  const handleOptionClick = (value: string) => {
    setSelectedOption(value);
    setOptions(optionValues);
    onSelect(value);
  };

  return (
    <div>
      <label>{label}</label>
      <div className="option-buttons-container">
        {options.map((option: string) => (
          <SelectOptionButton
            key={option}
            isSelected={option === selectedOption}
            onClick={() => handleOptionClick(option)}
          >
            {option}
          </SelectOptionButton>
        ))}
      </div>
    </div>
  );
};

export default SelectButton;
