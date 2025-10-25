import Button from './Button';
import MangaCanvas from './MangaCanvas';

export default function GameScreen({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 p-6 w-full h-screen animate-fade-in">
      <div className="flex items-center justify-between w-full max-w-7xl">
        <h2 className="text-3xl font-bold text-white">
          Manga Maker
        </h2>
        
        <Button onClick={onRestart} variant="secondary" size="medium">
          Back to Title
        </Button>
      </div>
      
      <div className="flex-1 w-full max-w-7xl">
        <MangaCanvas />
      </div>
    </div>
  );
}

