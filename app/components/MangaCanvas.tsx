"use client";

import { useRef, useState, useEffect } from "react";
import {
  Stage,
  Layer,
  Text,
  Transformer,
  Image,
  Rect,
  Group,
} from "react-konva";
import Konva from "konva";
import { KodoClient } from "@/lib/api/client";
import { TMangaContract } from "@/app/gameloop/manga-contract-generator";
import { gradeMangaPage, GradeResponse } from "@/app/gameloop/manga-grader";
import ContractDisplay from "./ContractDisplay";

interface TextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fill: string;
  rotation: number;
  width?: number;
}

interface SpeechBubbleItem {
  id: string;
  imagePath: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

interface PanelItem {
  id: string;
  x: number;
  y: number;
  width: number; // Display width on canvas
  height: number; // Display height on canvas
  genWidth: number; // Generation width (multiple of 64)
  genHeight: number; // Generation height (multiple of 64)
  rotation: number;
  scaleX: number;
  scaleY: number;
  prompt: string;
  imageDataUrl?: string;
  isGenerating: boolean;
  error?: string;
}

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

export default function MangaCanvas({
  contract,
}: {
  contract: TMangaContract;
}) {
  const [grading, setGrading] = useState(false);
  const [grades, setGrades] = useState<GradeResponse | null>(null);
  const [gradeError, setGradeError] = useState<string | null>(null);
  const [textItems, setTextItems] = useState<TextItem[]>([]);
  const [speechBubbles, setSpeechBubbles] = useState<SpeechBubbleItem[]>([]);
  const [panels, setPanels] = useState<PanelItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const kodoClient = useRef(new KodoClient());

  const addNewText = () => {
    const newText: TextItem = {
      id: `text-${Date.now()}`,
      text: "Double-click to edit",
      x: 100,
      y: 100,
      fontSize: 24,
      fontFamily: "Comic Neue",
      fill: "#000000",
      rotation: 0,
    };
    setTextItems([...textItems, newText]);
    setSelectedId(newText.id);
  };

  const addSpeechBubble = (
    bubblePath: string,
    width: number,
    height: number
  ) => {
    const newBubble: SpeechBubbleItem = {
      id: `bubble-${Date.now()}`,
      imagePath: bubblePath,
      x: 200,
      y: 200,
      width,
      height,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    };
    setSpeechBubbles([...speechBubbles, newBubble]);
    setSelectedId(newBubble.id);
  };

  const addPanel = (
    displayWidth: number,
    displayHeight: number,
    genWidth: number,
    genHeight: number
  ) => {
    const newPanel: PanelItem = {
      id: `panel-${Date.now()}`,
      x: 150,
      y: 150,
      width: displayWidth,
      height: displayHeight,
      genWidth,
      genHeight,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      prompt: "",
      isGenerating: false,
    };
    setPanels([...panels, newPanel]);
    setSelectedId(newPanel.id);
  };

  const updateText = (id: string, updates: Partial<TextItem>) => {
    setTextItems(
      textItems.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const updateBubble = (id: string, updates: Partial<SpeechBubbleItem>) => {
    setSpeechBubbles(
      speechBubbles.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const updatePanel = (id: string, updates: Partial<PanelItem>) => {
    setPanels(
      panels.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const generatePanelImage = async (panelId: string) => {
    const panel = panels.find((p) => p.id === panelId);
    if (!panel || !panel.prompt.trim()) return;

    updatePanel(panelId, { isGenerating: true, error: undefined });

    try {
      // Use the stored generation dimensions (already multiples of 64)
      const result = await kodoClient.current.generate({
        description: panel.prompt,
        width: panel.genWidth,
        height: panel.genHeight,
        timeoutMs: 180000, // 3 minutes
      });

      if (result.url) {
        try {
          const res = await fetch(result.url);
          if (!res.ok) throw new Error(`Failed to fetch image (${res.status})`);
          const blob = await res.blob();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          updatePanel(panelId, {
            isGenerating: false,
            imageDataUrl: dataUrl,
            error: undefined,
          });
        } catch (e: any) {
          updatePanel(panelId, {
            isGenerating: false,
            error: e?.message || "Failed to load generated image",
          });
        }
      } else {
        updatePanel(panelId, {
          isGenerating: false,
          error: `Generation ${result.status}`,
        });
      }
    } catch (error: any) {
      updatePanel(panelId, {
        isGenerating: false,
        error: error.message || "Failed to generate image",
      });
    }
  };

  const deleteSelected = () => {
    if (selectedId) {
      setTextItems(textItems.filter((item) => item.id !== selectedId));
      setSpeechBubbles(speechBubbles.filter((item) => item.id !== selectedId));
      setPanels(panels.filter((item) => item.id !== selectedId));
      setSelectedId(null);
    }
  };

  async function submitForGrading() {
    if (!stageRef.current) return;
    setGrading(true);
    setGradeError(null);
    setGrades(null);

    // Try to export canvas to data URL. This may fail if cross-origin images are present.
    let dataUrl: string | null = null;
    try {
      dataUrl = stageRef.current.toDataURL({
        mimeType: "image/png",
        quality: 1,
        pixelRatio: 2,
      });
    } catch (e: any) {
      setGradeError(
        "Failed to export canvas. If you used external AI images, the browser may block export due to CORS. Try removing external images or use only text/bubbles."
      );
      setGrading(false);
      return;
    }

    if (!dataUrl) {
      setGradeError("Failed to capture canvas image.");
      setGrading(false);
      return;
    }

    // Use the page-provided contract, adjusting panelCount to current page if needed
    const derivedContract: TMangaContract = {
      ...contract,
      panelCount: Math.max(
        3,
        Math.min(5, panels.length || contract.panelCount || 3)
      ),
    };

    try {
      const res = await gradeMangaPage(derivedContract, dataUrl, "gpt-5");
      setGrades(res);
    } catch (err: any) {
      setGradeError(err?.message || "Grading failed");
    } finally {
      setGrading(false);
    }
  }

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Deselect when clicking on empty area
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
    }
  };

  // Manga page proportions (Japanese B5: ~7:10 ratio)
  const MANGA_WIDTH = 600;
  const MANGA_HEIGHT = 850;

  return (
    <div className="flex gap-6 w-full h-full">
      {/* Contract Box (left) */}
      <ContractDisplay contract={contract} />

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center">
        <div
          className="bg-white rounded-lg shadow-2xl overflow-hidden relative"
          style={{ width: MANGA_WIDTH, height: MANGA_HEIGHT }}
        >
          <Stage
            ref={stageRef}
            width={MANGA_WIDTH}
            height={MANGA_HEIGHT}
            onClick={handleStageClick}
            onTap={handleStageClick}
          >
            {/* Panel Layer (bottom-most - rendered first) */}
            <Layer>
              {panels.map((item) => (
                <Panel
                  key={item.id}
                  item={item}
                  isSelected={item.id === selectedId}
                  onSelect={() => setSelectedId(item.id)}
                  onChange={(updates) => updatePanel(item.id, updates)}
                  onGenerateImage={() => generatePanelImage(item.id)}
                />
              ))}
            </Layer>

            {/* Speech Bubble Layer */}
            <Layer>
              {speechBubbles.map((item) => (
                <SpeechBubble
                  key={item.id}
                  item={item}
                  isSelected={item.id === selectedId}
                  onSelect={() => setSelectedId(item.id)}
                  onChange={(updates) => updateBubble(item.id, updates)}
                />
              ))}
            </Layer>

            {/* Text Layer (top - rendered last, always on top) */}
            <Layer>
              {textItems.map((item) => (
                <EditableText
                  key={item.id}
                  item={item}
                  isSelected={item.id === selectedId}
                  onSelect={() => setSelectedId(item.id)}
                  onChange={(updates) => updateText(item.id, updates)}
                />
              ))}
            </Layer>
          </Stage>
        </div>
      </div>

      {/* Right Toolbar */}
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

        <div className="border-t border-white/20 pt-4 text-white/40 text-xs">
          Page Size: {MANGA_WIDTH} × {MANGA_HEIGHT}px
          <br />
          <span className="text-white/30">(Japanese B5 proportions)</span>
        </div>
      </div>
    </div>
  );
}

interface EditableTextProps {
  item: TextItem;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<TextItem>) => void;
}

function EditableText({
  item,
  isSelected,
  onSelect,
  onChange,
}: EditableTextProps) {
  const textRef = useRef<Konva.Text>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // Attach transformer when selected
  useState(() => {
    if (isSelected && transformerRef.current && textRef.current) {
      transformerRef.current.nodes([textRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  });

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange({
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleTransformEnd = () => {
    const node = textRef.current;
    if (node) {
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      // Reset scale and update fontSize instead
      node.scaleX(1);
      node.scaleY(1);

      onChange({
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
        fontSize: Math.max(10, item.fontSize * scaleY),
        width: node.width() * scaleX,
      });
    }
  };

  const handleDblClick = () => {
    const node = textRef.current;
    if (!node) return;

    // Create textarea for editing
    const textPosition = node.getAbsolutePosition();
    const stageBox = node.getStage()?.container().getBoundingClientRect();
    if (!stageBox) return;

    const areaPosition = {
      x: stageBox.left + textPosition.x,
      y: stageBox.top + textPosition.y,
    };

    // Create textarea
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);

    textarea.value = item.text;
    textarea.style.position = "absolute";
    textarea.style.top = areaPosition.y + "px";
    textarea.style.left = areaPosition.x + "px";
    textarea.style.fontSize = item.fontSize + "px";
    textarea.style.fontFamily = item.fontFamily;
    textarea.style.border = "2px solid #8B5CF6";
    textarea.style.padding = "4px";
    textarea.style.margin = "0px";
    textarea.style.overflow = "hidden";
    textarea.style.background = "white";
    textarea.style.outline = "none";
    textarea.style.resize = "none";
    textarea.style.transformOrigin = "left top";
    textarea.style.textAlign = "left";
    textarea.style.color = item.fill;
    textarea.style.zIndex = "1000";

    textarea.focus();
    textarea.select();

    const removeTextarea = () => {
      textarea.parentNode?.removeChild(textarea);
      window.removeEventListener("click", handleOutsideClick);
    };

    const handleOutsideClick = (e: MouseEvent) => {
      if (e.target !== textarea) {
        onChange({ text: textarea.value });
        removeTextarea();
      }
    };

    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        onChange({ text: textarea.value });
        removeTextarea();
      }
      if (e.key === "Escape") {
        removeTextarea();
      }
    });

    setTimeout(() => {
      window.addEventListener("click", handleOutsideClick);
    }, 0);
  };

  return (
    <>
      <Text
        ref={textRef}
        {...item}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        onDblClick={handleDblClick}
        onDblTap={handleDblClick}
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={true}
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit minimum size
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}

interface SpeechBubbleProps {
  item: SpeechBubbleItem;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<SpeechBubbleItem>) => void;
}

function SpeechBubble({
  item,
  isSelected,
  onSelect,
  onChange,
}: SpeechBubbleProps) {
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  // Load image
  useEffect(() => {
    const img = new window.Image();
    img.src = item.imagePath;
    img.onload = () => {
      setImage(img);
    };
  }, [item.imagePath]);

  // Attach transformer when selected
  useEffect(() => {
    if (isSelected && transformerRef.current && imageRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange({
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleTransformEnd = () => {
    const node = imageRef.current;
    if (node) {
      onChange({
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
        scaleX: node.scaleX(),
        scaleY: node.scaleY(),
      });
    }
  };

  if (!image) return null;

  return (
    <>
      <Image
        ref={imageRef}
        image={image}
        x={item.x}
        y={item.y}
        width={item.width}
        height={item.height}
        scaleX={item.scaleX}
        scaleY={item.scaleY}
        rotation={item.rotation}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={true}
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit minimum size
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}

interface PanelProps {
  item: PanelItem;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<PanelItem>) => void;
  onGenerateImage: () => void;
}

function Panel({ item, isSelected, onSelect, onChange }: PanelProps) {
  const groupRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [generatedImage, setGeneratedImage] = useState<HTMLImageElement | null>(
    null
  );

  // Load generated image when base64 data URL changes
  useEffect(() => {
    if (item.imageDataUrl) {
      const img = new window.Image();
      img.src = item.imageDataUrl; // data URL avoids CORS tainting
      img.onload = () => {
        setGeneratedImage(img);
      };
    } else {
      setGeneratedImage(null);
    }
  }, [item.imageDataUrl]);

  // Attach transformer when selected
  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange({
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleTransformEnd = () => {
    const node = groupRef.current;
    if (node) {
      onChange({
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
        scaleX: node.scaleX(),
        scaleY: node.scaleY(),
      });
    }
  };

  return (
    <>
      <Group
        ref={groupRef}
        x={item.x}
        y={item.y}
        scaleX={item.scaleX}
        scaleY={item.scaleY}
        rotation={item.rotation}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        {/* Background rectangle */}
        <Rect
          width={item.width}
          height={item.height}
          fill={generatedImage ? "#ffffff" : "#f0f0f0"}
          stroke={isSelected ? "#10b981" : "#cccccc"}
          strokeWidth={isSelected ? 3 : 2}
        />

        {/* Generated image or placeholder */}
        {generatedImage ? (
          <Image
            image={generatedImage}
            width={item.width}
            height={item.height}
          />
        ) : (
          <Text
            text={
              item.isGenerating
                ? "Generating..."
                : item.error
                ? "Error"
                : "Click to add prompt"
            }
            width={item.width}
            height={item.height}
            align="center"
            verticalAlign="middle"
            fontSize={14}
            fill={item.error ? "#ef4444" : "#999999"}
            fontFamily="Comic Neue"
          />
        )}
      </Group>

      {isSelected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={true}
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit minimum size
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}
