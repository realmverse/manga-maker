import { GradeResponse } from "@/app/gameloop/manga-grader";
import { PanelItem } from "./MangaCanvas";

const SPEECH_BUBBLES = [
  {
    name: "Small",
    path: "/speech-bubbles/speech-small.svg",
    width: 150,
    height: 100,
  },
  {
    name: "Wide",
    path: "/speech-bubbles/speech-wide.svg",
    width: 200,
    height: 100,
  },
  {
    name: "Tall",
    path: "/speech-bubbles/speech-tall.svg",
    width: 120,
    height: 180,
  },
  {
    name: "Thought",
    path: "/speech-bubbles/thought-speech.svg",
    width: 150,
    height: 150,
  },
  {
    name: "Tail",
    path: "/speech-bubbles/speech-tail.svg",
    width: 140,
    height: 120,
  },
  {
    name: "Thought Tail",
    path: "/speech-bubbles/thought-tail.svg",
    width: 140,
    height: 140,
  },
];

const PANEL_RATIOS = [
  {
    name: "1:1",
    ratio: 1,
    displayWidth: 200,
    displayHeight: 200,
    genWidth: 1024,
    genHeight: 1024,
  },
  {
    name: "16:9",
    ratio: 16 / 9,
    displayWidth: 240,
    displayHeight: 135,
    genWidth: 1024,
    genHeight: 576,
  },
  {
    name: "9:16",
    ratio: 9 / 16,
    displayWidth: 135,
    displayHeight: 240,
    genWidth: 576,
    genHeight: 1024,
  },
  {
    name: "2:3",
    ratio: 2 / 3,
    displayWidth: 160,
    displayHeight: 240,
    genWidth: 768,
    genHeight: 1152,
  },
  {
    name: "3:2",
    ratio: 3 / 2,
    displayWidth: 240,
    displayHeight: 160,
    genWidth: 1152,
    genHeight: 768,
  },
  {
    name: "4:5",
    ratio: 4 / 5,
    displayWidth: 160,
    displayHeight: 200,
    genWidth: 1024,
    genHeight: 1280,
  },
  {
    name: "5:4",
    ratio: 5 / 4,
    displayWidth: 200,
    displayHeight: 160,
    genWidth: 1280,
    genHeight: 1024,
  },
];

interface ToolDisplayProps {
  addNewText: () => void;
  addPanel: (
    displayWidth: number,
    displayHeight: number,
    genWidth: number,
    genHeight: number
  ) => void;
  addSpeechBubble: (bubblePath: string, width: number, height: number) => void;
  submitForGrading: () => void;
  grading: boolean;
  gradeError: string | null;
  grades: GradeResponse | null;
  selectedId: string | null;
  panels: PanelItem[];
  updatePanel: (id: string, updates: Partial<PanelItem>) => void;
  generatePanelImage: (panelId: string) => void;
  deleteSelected: () => void;
  mangaWidth: number;
  mangaHeight: number;
}

export default function ToolDisplay({
  addNewText,
  addPanel,
  addSpeechBubble,
  submitForGrading,
  grading,
  gradeError,
  grades,
  selectedId,
  panels,
  updatePanel,
  generatePanelImage,
  deleteSelected,
  mangaWidth,
  mangaHeight,
}: ToolDisplayProps) {
  return (
    <div className="w-64 flex flex-col gap-4 bg-black/30 backdrop-blur-md rounded-lg p-4 border border-white/20 shadow-2xl overflow-y-auto">
      <h3 className="text-white font-bold text-lg">Tools</h3>

      {/* Text Tool */}
      <div className="flex flex-col gap-2">
        <button
          onClick={addNewText}
          className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
        >
          + Add Text
        </button>
      </div>

      {/* Panels */}
      <div className="border-t border-white/20 pt-3">
        <h4 className="text-white/80 font-semibold text-sm mb-2">
          AI Image Panels
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {PANEL_RATIOS.map((panel) => (
            <button
              key={panel.name}
              onClick={() =>
                addPanel(
                  panel.displayWidth,
                  panel.displayHeight,
                  panel.genWidth,
                  panel.genHeight
                )
              }
              className="px-2 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors"
            >
              {panel.name}
            </button>
          ))}
        </div>
      </div>

      {/* Speech Bubbles */}
      <div className="border-t border-white/20 pt-3">
        <h4 className="text-white/80 font-semibold text-sm mb-2">
          Speech Bubbles
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {SPEECH_BUBBLES.map((bubble) => (
            <button
              key={bubble.path}
              onClick={() =>
                addSpeechBubble(bubble.path, bubble.width, bubble.height)
              }
              className="px-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
            >
              {bubble.name}
            </button>
          ))}
        </div>
      </div>

      {/* Panel Prompt Input - only show when panel is selected */}
      {selectedId &&
        selectedId.startsWith("panel-") &&
        (() => {
          const panel = panels.find((p) => p.id === selectedId);
          return panel ? (
            <div className="border-t border-white/20 pt-3">
              <h4 className="text-white/80 font-semibold text-sm mb-2">
                Generate AI Image
              </h4>
              <input
                type="text"
                value={panel.prompt}
                onChange={(e) =>
                  updatePanel(selectedId, { prompt: e.target.value })
                }
                placeholder="Describe the image..."
                className="w-full px-3 py-2 bg-white/10 text-white rounded border border-white/20 text-sm placeholder-white/40 focus:outline-none focus:border-green-500 mb-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !panel.isGenerating) {
                    generatePanelImage(selectedId);
                  }
                }}
              />
              <button
                onClick={() => generatePanelImage(selectedId)}
                disabled={!panel.prompt.trim() || panel.isGenerating}
                className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm font-medium transition-colors"
              >
                {panel.isGenerating ? "Generating..." : "Generate Image"}
              </button>
              {panel.error && (
                <p className="text-red-400 text-xs mt-2">{panel.error}</p>
              )}
            </div>
          ) : null;
        })()}

      {/* Delete Button */}
      {selectedId && (
        <button
          onClick={deleteSelected}
          className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
        >
          Delete Selected
        </button>
      )}

      <div className="flex-1 border-t border-white/20 pt-4 mt-2">
        <p className="text-white/60 text-sm whitespace-pre-line">
          {selectedId
            ? selectedId.startsWith("text-")
              ? "✓ Text selected\n\nDrag to move\nUse handles to resize/rotate\nDouble-click to edit"
              : selectedId.startsWith("panel-")
              ? "✓ Panel selected\n\nEnter a prompt above to generate an AI image"
              : "✓ Bubble selected\n\nDrag to move\nUse handles to resize/rotate"
            : "Add panels, text, or speech bubbles to get started"}
        </p>
      </div>

      {/* Submit / Grading */}
      <div className="border-t border-white/20 pt-3">
        <h4 className="text-white/80 font-semibold text-sm mb-2">Submit</h4>
        <button
          onClick={submitForGrading}
          disabled={grading}
          className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm font-medium transition-colors"
        >
          {grading ? "Submitting…" : "Submit For Review"}
        </button>
        {gradeError && (
          <p className="text-red-400 text-xs mt-2">{gradeError}</p>
        )}
        {grades && (
          <div className="mt-3 space-y-2">
            {grades.grades.map((g, i) => (
              <div
                key={i}
                className="p-2 rounded bg-white/5 border border-white/10"
              >
                <div className="text-white text-sm font-semibold">
                  {g.judge} — {g.score}/100
                </div>
                <div className="text-white/80 text-xs mt-1 whitespace-pre-wrap">
                  {g.review}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
