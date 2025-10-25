import Button from './Button';

export default function GameScreen({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="flex flex-col items-center gap-8 p-8 w-full max-w-4xl animate-fade-in">
      <h2 className="text-4xl font-bold text-white">
        Game Screen 🎮
      </h2>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 w-full min-h-[400px] border border-white/20 flex items-center justify-center">
        <p className="text-white text-xl text-center">
          Your game content goes here!
          <br />
          <span className="text-purple-300 text-base mt-4 block">
            This is where the main gameplay will happen ✨
          </span>
        </p>
      </div>
      
      <div className="flex gap-4">
        <Button onClick={onRestart} variant="secondary" size="medium">
          Back to Title
        </Button>
        <Button variant="disabled" size="medium">
          Disabled Example
        </Button>
      </div>
    </div>
  );
}

