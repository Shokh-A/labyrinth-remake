import React, { useState } from "react";
import "./SelectButton.css";

interface SelectButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

const SelectButton: React.FC<SelectButtonProps> = ({
  children,
  onClick,
  disabled = false,
}) => {
  const [isSelected, setIsSelected] = useState(false);

  const handleButtonClick = () => {
    setIsSelected(!isSelected);
    onClick();
  };

  return (
    <button
      className="custom-select-button"
      onClick={handleButtonClick}
      disabled={disabled}
      style={{
        backgroundColor: isSelected ? "#008000" : "#28272a",
      }}
    >
      {children}
    </button>
  );
};

export default SelectButton;
