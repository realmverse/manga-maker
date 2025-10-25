interface LabelProps {
  children: React.ReactNode;
}

export default function Label({ children }: LabelProps) {
  return (
    <div className="relative inline-block">
      {/* Main label body */}
      <div
        className="relative px-8 py-4 text-white font-titan-one text-4xl rounded-l-full"
        style={{
          background:
            "linear-gradient(135deg, #FF6B9D 0%, #FFA9D0 50%, #FFD4E5 100%)",
          clipPath: "polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%)",
          minWidth: "200px",
        }}
      >
        {/* Inner glow effect */}
        <div
          className="absolute inset-0 rounded-l-full opacity-30 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), transparent 50%)",
            clipPath: "polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%)",
          }}
        />

        {/* Border accent */}
        <div
          className="absolute inset-0 rounded-l-full pointer-events-none"
          style={{
            border: "3px solid rgba(255, 255, 255, 0.4)",
            clipPath: "polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%)",
          }}
        />

        {/* Text with stroke outline */}
        <span className="relative z-10 [text-shadow:-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000,2px_2px_0_#000,-2px_0_0_#000,2px_0_0_#000,0_-2px_0_#000,0_2px_0_#000]">
          {children}
        </span>
      </div>

      {/* Decorative sparkles */}
      <div className="absolute -top-1 -right-2 w-3 h-3 bg-white rounded-full opacity-80 animate-pulse" />
      <div className="absolute top-1/2 -right-1 w-2 h-2 bg-pink-200 rounded-full opacity-60" />
    </div>
  );
}
