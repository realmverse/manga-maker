interface LabelProps {
  children: React.ReactNode;
}

export default function Label({ children }: LabelProps) {
  return (
    <span className="inline-block bg-rose-400 text-white text-base font-bold font-comic-neue px-3 py-1 rounded-full">
      {children}
    </span>
  );
}
