import { ReactNode, createElement } from "react";

type TitleProps = {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  align?: "left" | "center" | "right";
  color?: string;
  weight?: "normal" | "medium" | "semibold" | "bold";
};

const Title = ({
  children,
  level = 5,
  className = "",
  align = "left",
  color = "text-base",
  weight = "bold",
}: TitleProps) => {
  const sizes = {
    1: "text-4xl md:text-5xl",
    2: "text-3xl md:text-4xl",
    3: "text-2xl md:text-3xl",
    4: "text-xl md:text-2xl",
    5: "text-lg md:text-xl",
    6: "text-base md:text-lg",
  };

  const weights = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  };

  const aligns = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const baseClasses = `
    ${sizes[level]}
    ${weights[weight]}
    ${color}
    ${aligns[align]}
    leading-tight
    mb-4
  `;

  return createElement(
    `h${level}`,
    { className: `${baseClasses} ${className}` },
    children
  );
};

export default Title;
