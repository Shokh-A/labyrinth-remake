import React, { useEffect, useState } from "react";
import SelectOptionButton from "../select-option-button/SelectOptionButton";
import "./SelectButton.css";

interface SelectButtonProps {
  label: string;
  value?: string;
  options: string[];
  onSelect: (option: string) => void;
}

const SelectButton: React.FC<SelectButtonProps> = ({
  label,
  value,
  options,
  onSelect,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>("");

  useEffect(() => {
    setSelectedOption(value || "");
  }, [value]);

  const handleOptionClick = (value: string) => {
    if (value === selectedOption) {
      setSelectedOption("");
      onSelect("");
    } else {
      setSelectedOption(value);
      onSelect(value);
    }
  };

  return (
    <div className="option-button">
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
