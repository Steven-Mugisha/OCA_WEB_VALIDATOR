import React from "react";

interface ButtonProps {
  children: string;
  onClick?: () => void;
}

const button = ({ children, onClick }: ButtonProps) => {
    return (
        <button className="btn btn-primary" onClick={onClick}>{children}</button>
    );
};

export default button;
 