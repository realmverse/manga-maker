type ButtonVariant = 'primary' | 'secondary' | 'disabled';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: 'small' | 'medium' | 'large';
}

export default function Button({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'medium'
}: ButtonProps) {
  const baseStyles = `
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
    large: "px-12 py-5 text-2xl"
  };
  
  const variantStyles = {
    primary: `
      bg-gradient-to-br from-pink-400 via-pink-500 to-purple-500 
      hover:from-pink-300 hover:via-pink-400 hover:to-purple-400
      hover:translate-x-[-2px] hover:translate-y-[-2px]
    `,
    secondary: `
      bg-gradient-to-br from-cyan-300 via-blue-300 to-purple-300
      hover:from-cyan-200 hover:via-blue-200 hover:to-purple-200
      hover:translate-x-[-2px] hover:translate-y-[-2px]
    `,
    disabled: `
      bg-gray-400
      cursor-not-allowed opacity-60
      shadow-[2px_2px_0px_0px_rgba(0,0,0,0.4)]
      border-gray-600
    `
  };
  
  const textStyles = {
    primary: 'text-white [text-shadow:_-2px_-2px_0_#000,_2px_-2px_0_#000,_-2px_2px_0_#000,_2px_2px_0_#000,_-2px_0_0_#000,_2px_0_0_#000,_0_-2px_0_#000,_0_2px_0_#000]',
    secondary: 'text-white [text-shadow:_-2px_-2px_0_#000,_2px_-2px_0_#000,_-2px_2px_0_#000,_2px_2px_0_#000,_-2px_0_0_#000,_2px_0_0_#000,_0_-2px_0_#000,_0_2px_0_#000]',
    disabled: 'text-gray-600'
  };
  
  const isDisabled = variant === 'disabled';
  
  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        group
      `}
    >
      {/* Inner light outline effect */}
      <div className="absolute inset-[2px] rounded-xl border-2 border-white/40 pointer-events-none" />
      
      <span className={`relative z-10 flex items-center gap-2 justify-center ${textStyles[variant]}`}>
        {children}
      </span>
    </button>
  );
}

