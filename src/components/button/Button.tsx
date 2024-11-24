import React from "react";
import "./Button.css";

interface ButtonProps {
  label: string;
  onClick: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  float?: "left" | "right";
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  type = "button",
  disabled = false,
  float,
}) => {
  return (
    <button
      className="custom-button"
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ float }}
    >
      {label}
    </button>
  );
};

export default Button;
