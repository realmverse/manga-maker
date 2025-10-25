interface LabelProps {
  children: React.ReactNode;
}

export default function Label({ children }: LabelProps) {
  return (
    <span className="inline-block bg-rose-400 text-white text-xs font-semibold px-3 py-1 rounded-full">
      {children}
    </span>
  );
}
