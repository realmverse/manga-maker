import Button from './Button';

export default function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center gap-12 p-8 text-center animate-fade-in">
      <div className="space-y-4">
        <h1 className="text-7xl font-titan-one text-white drop-shadow-2xl tracking-tight">
          MANGA MAKER
        </h1>
        <p className="text-xl text-purple-200 mt-4">
          Create Your Story
        </p>
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

