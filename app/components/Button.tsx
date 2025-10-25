"use client";

import { useAudio } from "./AudioProvider";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "disabled";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: "small" | "medium" | "large";
  color?: string;
}

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "medium",
  color,
}: ButtonProps) {
  const { playSFX } = useAudio();

  const handleHover = () => {
    if (variant !== "disabled") {
      playSFX("/audio/button-hover.wav", 0.2);
    }
  };

  const handleClick = () => {
    if (variant !== "disabled") {
      playSFX("/audio/button-click.wav", 0.2);
      onClick?.();
    }
  };
  const baseStyles =
    variant === "tertiary"
      ? `
      font-titan-one 
      rounded-lg
      transition-all 
      duration-300 
      relative 
      overflow-hidden
      border-2 border-black
    `
      : `
      font-titan-one 
      rounded-2xl 
      transition-all 
      duration-300 
      relative 
      overflow-hidden
      border-4 border-black
      shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]
      hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.8)]
      active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]
      active:translate-x-[2px] active:translate-y-[2px]
    `;

  const sizeStyles = {
    small: "px-6 py-2 text-base",
    medium: "px-10 py-4 text-xl",
    large: "px-12 py-5 text-2xl",
  };

  const variantStyles = {
    primary: `
      bg-gradient-to-br from-[#FF97A1] to-[#FFB2BC]
      hover:from-[#FFB2BC] hover:to-[#FFCCD3]
      hover:translate-x-[-2px] hover:translate-y-[-2px]
    `,
    secondary: `
      bg-white
      hover:bg-zinc-200
      hover:translate-x-[-2px] hover:translate-y-[-2px]
    `,
    tertiary: color
      ? `hover:opacity-90`
      : `
        bg-gray-600
        hover:bg-gray-500
      `,
    disabled: `
      bg-gray-400
      cursor-not-allowed opacity-60
      shadow-[2px_2px_0px_0px_rgba(0,0,0,0.4)]
      border-gray-600
    `,
  };

  const textStyles = {
    primary: "text-white text-outline",
    secondary: "text-black",
    tertiary: "text-white text-outline tracking-widest",
    disabled: "text-gray-600",
  };

  const isDisabled = variant === "disabled";

  return (
    <button
      onClick={handleClick}
      onMouseEnter={handleHover}
      disabled={isDisabled}
      style={
        color && variant === "tertiary" ? { backgroundColor: color } : undefined
      }
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        group
      `}
    >
      {/* Dithered gradient texture overlay */}
      <div
        className="absolute top-1/4 left-0 right-0 bottom-0 rounded-b-xl pointer-events-none opacity-80"
        style={{
          backgroundImage: "url(/images/dithered-gradient.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Inner light outline effect */}
      <div className="absolute inset-[2px] rounded-xl border-2 border-white/40 pointer-events-none" />

      <span
        className={`relative z-10 flex items-center gap-2 justify-center ${textStyles[variant]}`}
      >
        {children}
      </span>
    </button>
  );
}
