import Button from "./Button";
import Label from "./Label";

export default function TutorialScreen({
  onContinue,
}: {
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-8 p-8 max-w-2xl animate-fade-in">
      <Label>How to Play</Label>

      <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 space-y-6 border border-white/20 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
            1
          </div>
          <div className="text-white">
            <h3 className="font-bold text-xl mb-2">Step One 🎨</h3>
            <p className="text-purple-200">
              Choose your characters and setting for your manga story
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="shrink-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
            2
          </div>
          <div className="text-white">
            <h3 className="font-bold text-xl mb-2">Step Two 💬</h3>
            <p className="text-purple-200">
              Arrange panels and add dialogue to create your narrative
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="shrink-0 w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
            3
          </div>
          <div className="text-white">
            <h3 className="font-bold text-xl mb-2">Step Three 🌟</h3>
            <p className="text-purple-200">
              Share your creation with the world!
            </p>
          </div>
        </div>
      </div>

      <Button onClick={onContinue} variant="primary" size="medium">
        CONTINUE
      </Button>
    </div>
  );
}
