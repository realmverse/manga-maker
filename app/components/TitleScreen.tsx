import Image from 'next/image';
import Button from './Button';

export default function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center gap-12 p-8 text-center animate-fade-in">
      <div className="space-y-4">
        <Image 
          src="/images/manga-maker-logo.png" 
          alt="Manga Maker" 
          width={800}
          height={256}
          className="w-full max-w-[800px] h-auto drop-shadow-2xl"
          priority
        />
      </div>
      
      <Button onClick={onStart} variant="primary" size="large">
        START
      </Button>
      
      <div className="absolute bottom-8 text-purple-300 text-sm animate-pulse">
        Press START to begin
      </div>
    </div>
  );
}

