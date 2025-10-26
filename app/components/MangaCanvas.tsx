"use client";

import {
  Stage,
  Layer,
  Text,
  Transformer,
  Image,
  Rect,
  Group,
} from "react-konva";
import ToolDisplay from "./ToolDisplay";
import { useRef, useState, useEffect, useMemo } from "react";
import Konva from "konva";
import { KodoClient } from "@/lib/api/client";
import { TMangaContract } from "@/app/gameloop/manga-contract-generator";
import ContractDetails from "./ContractDetails";
import { gradeMangaPage, GradeResponse } from "@/app/gameloop/manga-grader";

interface TextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fill: string;
  rotation: number;
  width: number;
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

export interface PanelItem {
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

export default function MangaCanvas({
  contract,
  onSubmitForGrading,
}: {
  contract: TMangaContract;
  onSubmitForGrading?: (contract: TMangaContract, imageDataUrl: string) => void;
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
  // Keep a ref to panels to avoid stale closures during concurrent async ops
  const panelsRef = useRef<PanelItem[]>([]);
  useEffect(() => {
    panelsRef.current = panels;
  }, [panels]);

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
      width: 200,
    };
    setTextItems((prev) => [...prev, newText]);
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
    setSpeechBubbles((prev) => [...prev, newBubble]);
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
    setPanels((prev) => [...prev, newPanel]);
    setSelectedId(newPanel.id);
  };

  const updateText = (id: string, updates: Partial<TextItem>) => {
    setTextItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const updateBubble = (id: string, updates: Partial<SpeechBubbleItem>) => {
    setSpeechBubbles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const updatePanel = (id: string, updates: Partial<PanelItem>) => {
    setPanels((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const generatePanelImage = async (panelId: string) => {
    // Read the latest panel state from ref to avoid stale closures during concurrent generations
    const panel = panelsRef.current.find((p) => p.id === panelId);
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
        } catch (e: unknown) {
          const msg =
            e instanceof Error ? e.message : "Failed to load generated image";
          updatePanel(panelId, {
            isGenerating: false,
            error: msg,
          });
        }
      } else {
        updatePanel(panelId, {
          isGenerating: false,
          error: `Generation ${result.status}`,
        });
      }
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to generate image";
      updatePanel(panelId, {
        isGenerating: false,
        error: msg,
      });
    }
  };

  const deleteSelected = () => {
    if (selectedId) {
      setTextItems((prev) => prev.filter((item) => item.id !== selectedId));
      setSpeechBubbles((prev) => prev.filter((item) => item.id !== selectedId));
      setPanels((prev) => prev.filter((item) => item.id !== selectedId));
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
    } catch {
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

    // If a parent handler is provided, delegate navigation to scoring screen
    if (onSubmitForGrading) {
      try {
        onSubmitForGrading(derivedContract, dataUrl);
      } finally {
        setGrading(false);
      }
      return;
    }

    // Fallback: do grading here (legacy flow)
    try {
      const res = await gradeMangaPage(derivedContract, dataUrl, "gpt-5-mini");
      setGrades(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Grading failed";
      setGradeError(msg);
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
      <ContractDetails contract={contract} />

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
            {/* White Background Layer (absolute bottom) */}
            <Layer>
              <Rect
                x={0}
                y={0}
                width={MANGA_WIDTH}
                height={MANGA_HEIGHT}
                fill="white"
                listening={false}
              />
            </Layer>

            {/* Panel Layer */}
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
      <ToolDisplay
        addNewText={addNewText}
        addPanel={addPanel}
        addSpeechBubble={addSpeechBubble}
        submitForGrading={submitForGrading}
        grading={grading}
        gradeError={gradeError}
        grades={grades}
        selectedId={selectedId}
        panels={panels}
        updatePanel={updatePanel}
        generatePanelImage={generatePanelImage}
        deleteSelected={deleteSelected}
        mangaWidth={MANGA_WIDTH}
        mangaHeight={MANGA_HEIGHT}
      />
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
  useEffect(() => {
    if (isSelected && transformerRef.current && textRef.current) {
      transformerRef.current.nodes([textRef.current]);
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
    const node = textRef.current;
    if (node) {
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      // Reset scale and update width directly
      node.scaleX(1);
      node.scaleY(1);

      onChange({
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
        fontSize: Math.max(10, item.fontSize * scaleY),
        width: Math.max(20, item.width * scaleX),
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
    textarea.style.width = item.width + "px";
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
    textarea.style.wordWrap = "break-word";
    textarea.style.whiteSpace = "pre-wrap";

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
        wrap="word"
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
            "middle-left",
            "middle-right",
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
        alt="Speech Bubble"
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
  const generatedImage = useMemo(() => {
    if (!item.imageDataUrl) return null;
    const img = new window.Image();
    img.src = item.imageDataUrl; // data URL avoids CORS tainting
    return img;
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
          stroke={isSelected ? "#10b981" : "#000000"}
          strokeWidth={isSelected ? 6 : 4}
        />

        {/* Generated image or placeholder */}
        {generatedImage ? (
          <Image
            image={generatedImage}
            width={item.width}
            height={item.height}
            alt="Generated Image"
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
