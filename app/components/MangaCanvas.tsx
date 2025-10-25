'use client';

import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Text, Transformer, Image } from 'react-konva';
import Konva from 'konva';

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

const SPEECH_BUBBLES = [
  { name: 'Small', path: '/speech-bubbles/speech-small.svg', width: 150, height: 100 },
  { name: 'Wide', path: '/speech-bubbles/speech-wide.svg', width: 200, height: 100 },
  { name: 'Tall', path: '/speech-bubbles/speech-tall.svg', width: 120, height: 180 },
  { name: 'Thought', path: '/speech-bubbles/thought-speech.svg', width: 150, height: 150 },
  { name: 'Tail', path: '/speech-bubbles/speech-tail.svg', width: 140, height: 120 },
  { name: 'Thought Tail', path: '/speech-bubbles/thought-tail.svg', width: 140, height: 140 },
];

export default function MangaCanvas() {
  const [textItems, setTextItems] = useState<TextItem[]>([]);
  const [speechBubbles, setSpeechBubbles] = useState<SpeechBubbleItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const stageRef = useRef<Konva.Stage>(null);

  const addNewText = () => {
    const newText: TextItem = {
      id: `text-${Date.now()}`,
      text: 'Double-click to edit',
      x: 100,
      y: 100,
      fontSize: 24,
      fontFamily: 'Comic Neue',
      fill: '#000000',
      rotation: 0,
    };
    setTextItems([...textItems, newText]);
    setSelectedId(newText.id);
  };

  const addSpeechBubble = (bubblePath: string, width: number, height: number) => {
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

  const updateText = (id: string, updates: Partial<TextItem>) => {
    setTextItems(textItems.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const updateBubble = (id: string, updates: Partial<SpeechBubbleItem>) => {
    setSpeechBubbles(speechBubbles.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const deleteSelected = () => {
    if (selectedId) {
      setTextItems(textItems.filter(item => item.id !== selectedId));
      setSpeechBubbles(speechBubbles.filter(item => item.id !== selectedId));
      setSelectedId(null);
    }
  };

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
            {/* Speech Bubble Layer (bottom - rendered first) */}
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
      <div className="w-64 flex flex-col gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 overflow-y-auto">
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

        {/* Speech Bubbles */}
        <div className="border-t border-white/20 pt-3">
          <h4 className="text-white/80 font-semibold text-sm mb-2">Speech Bubbles</h4>
          <div className="grid grid-cols-2 gap-2">
            {SPEECH_BUBBLES.map((bubble) => (
              <button
                key={bubble.path}
                onClick={() => addSpeechBubble(bubble.path, bubble.width, bubble.height)}
                className="px-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
              >
                {bubble.name}
              </button>
            ))}
          </div>
        </div>
        
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
              ? selectedId.startsWith('text-')
                ? '✓ Text selected\n\nDrag to move\nUse handles to resize/rotate\nDouble-click to edit'
                : '✓ Bubble selected\n\nDrag to move\nUse handles to resize/rotate'
              : 'Add text or speech bubbles to get started'}
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

function EditableText({ item, isSelected, onSelect, onChange }: EditableTextProps) {
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
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    textarea.value = item.text;
    textarea.style.position = 'absolute';
    textarea.style.top = areaPosition.y + 'px';
    textarea.style.left = areaPosition.x + 'px';
    textarea.style.fontSize = item.fontSize + 'px';
    textarea.style.fontFamily = item.fontFamily;
    textarea.style.border = '2px solid #8B5CF6';
    textarea.style.padding = '4px';
    textarea.style.margin = '0px';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'white';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.transformOrigin = 'left top';
    textarea.style.textAlign = 'left';
    textarea.style.color = item.fill;
    textarea.style.zIndex = '1000';

    textarea.focus();
    textarea.select();

    const removeTextarea = () => {
      textarea.parentNode?.removeChild(textarea);
      window.removeEventListener('click', handleOutsideClick);
    };

    const handleOutsideClick = (e: MouseEvent) => {
      if (e.target !== textarea) {
        onChange({ text: textarea.value });
        removeTextarea();
      }
    };

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        onChange({ text: textarea.value });
        removeTextarea();
      }
      if (e.key === 'Escape') {
        removeTextarea();
      }
    });

    setTimeout(() => {
      window.addEventListener('click', handleOutsideClick);
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
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right',
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

function SpeechBubble({ item, isSelected, onSelect, onChange }: SpeechBubbleProps) {
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
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right',
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
