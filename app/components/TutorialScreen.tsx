import Button from "./Button";
import Label from "./Label";

export default function TutorialScreen({
  onContinue,
}: {
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-8 p-8 max-w-5xl animate-fade-in w-full">
      {/* Chalkboard with wooden frame */}
      <div className="relative w-full">
        {/* Wooden frame outer border */}
        <div
          className="relative p-8 rounded-lg shadow-2xl"
          style={{
            background:
              "linear-gradient(145deg, #8B6F47, #6B5435, #4A3829, #6B5435, #8B6F47)",
            boxShadow:
              "0 20px 50px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.3)",
          }}
        >
          {/* Wood grain texture overlay */}
          <div
            className="absolute inset-0 rounded-lg opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
            }}
          />

          {/* Chalkboard surface */}
          <div
            className="relative bg-linear-to-br from-slate-800 via-slate-900 to-black p-12 rounded shadow-inner"
            style={{
              boxShadow: "inset 0 4px 12px rgba(0,0,0,0.8)",
              backgroundImage:
                "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.03), transparent 50%)",
            }}
          >
            {/* Chalk dust texture */}
            <div
              className="absolute inset-0 opacity-5 pointer-events-none rounded"
              style={{
                backgroundImage:
                  "url(data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.3'/%3E%3C/svg%3E)",
              }}
            />

            {/* NEW RECIPE style label */}
            <div className="absolute -top-4 -right-4 z-10">
              <Label>Tutorial</Label>
            </div>

            {/* Title - Chalk style */}
            <div className="text-center mb-8">
              <h1
                className="text-6xl font-titan-one text-white mb-2"
                style={{
                  textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                  letterSpacing: "0.05em",
                }}
              >
                HOW TO CREATE MANGA
              </h1>
              {/* Chalk underline */}
              <div className="flex justify-center mt-4">
                <div
                  className="h-1 w-3/4 bg-white opacity-60 rounded-full"
                  style={{
                    boxShadow: "0 2px 4px rgba(255,255,255,0.3)",
                  }}
                />
              </div>
            </div>

            {/* Center diagram/image area */}
            <div className="relative my-12 min-h-[300px] flex items-center justify-center">
              {/* Transparent container for tutorial diagram */}
              <div className="bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-lg p-8 w-full">
                <div className="grid grid-cols-3 gap-6 items-center justify-items-center">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-24 h-24 bg-white/10 border-4 border-white/40 rounded-lg flex items-center justify-center">
                      <span className="text-6xl">🎨</span>
                    </div>
                    <div className="text-white/90 text-sm font-bold text-center">
                      CHOOSE
                      <br />
                      CHARACTERS
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="text-white/60 text-4xl">→</div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-24 h-24 bg-white/10 border-4 border-white/40 rounded-lg flex items-center justify-center">
                      <span className="text-6xl">💬</span>
                    </div>
                    <div className="text-white/90 text-sm font-bold text-center">
                      ADD
                      <br />
                      DIALOGUE
                    </div>
                  </div>

                  {/* Continue to next row */}
                  <div className="col-span-3 text-white/60 text-4xl">↓</div>

                  {/* Step 3 */}
                  <div className="col-span-3 flex flex-col items-center gap-3">
                    <div className="w-24 h-24 bg-white/10 border-4 border-white/40 rounded-lg flex items-center justify-center">
                      <span className="text-6xl">🌟</span>
                    </div>
                    <div className="text-white/90 text-sm font-bold text-center">
                      SHARE YOUR CREATION!
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom description text - Chalk style */}
            <div className="text-center mt-8">
              <p
                className="text-2xl text-white/90 font-bold leading-relaxed"
                style={{
                  textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                  letterSpacing: "0.02em",
                }}
              >
                CREATE AMAZING PANELS, ARRANGE YOUR STORY,
                <br />
                AND BRING YOUR MANGA TO LIFE!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Continue button */}
      <Button onClick={onContinue} variant="primary" size="large">
        START CREATING
      </Button>
    </div>
  );
}
