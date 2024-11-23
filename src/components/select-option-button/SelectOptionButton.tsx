import React from "react";
import "./SelectOptionButton.css";

interface SelectOptionButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  isDisabled?: boolean;
  isSelected?: boolean;
}

const SelectOptionButton: React.FC<SelectOptionButtonProps> = ({
  children,
  onClick,
  isDisabled = false,
  isSelected = false,
}) => {
  return (
    <button
      className="custom-select-option-button"
      onClick={onClick}
      disabled={isDisabled}
      style={{
        backgroundColor: isSelected ? "#008000" : "#28272a",
      }}
    >
      {children}
    </button>
  );
};

export default SelectOptionButton;
