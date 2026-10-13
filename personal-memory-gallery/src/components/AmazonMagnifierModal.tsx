import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Sparkles,
  Move,
  Layers,
  CircleDot,
  Heart,
  Edit3,
  Trash2
} from 'lucide-react';
import { MemoryImage } from '../types/memory';

interface AmazonMagnifierModalProps {
  images: MemoryImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
  onDelete?: (id: string) => void;
  onEdit?: (image: MemoryImage) => void;
  onToggleFavorite?: (id: string) => void;
}

type MagnifierMode = 'side' | 'loupe' | 'pan';

export const AmazonMagnifierModal: React.FC<AmazonMagnifierModalProps> = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onSelectIndex,
  onDelete,
  onEdit,
  onToggleFavorite,
}) => {
  const currentImage = images[currentIndex];

  const [mode, setMode] = useState<MagnifierMode>('side');
  const [zoomLevel, setZoomLevel] = useState<number>(2.8);
  const [isHoveringImg, setIsHoveringImg] = useState<boolean>(false);

  // Accurate image bounds & coordinates
  const imgRef = useRef<HTMLImageElement>(null);
  const sideWindowRef = useRef<HTMLDivElement>(null);

  // Side lens state
  const [lensPos, setLensPos] = useState({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });

  // Background position for the side preview window
  const [previewBg, setPreviewBg] = useState({
    bgX: 0,
    bgY: 0,
    bgWidth: 0,
    bgHeight: 0,
  });

  // Loupe mode state
  const [loupePos, setLoupePos] = useState({
    x: 0,
    y: 0,
    bgX: 0,
    bgY: 0,
    bgWidth: 0,
    bgHeight: 0,
  });

  // Pan mode state
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; startPanX: number; startPanY: number }>({
    x: 0,
    y: 0,
    startPanX: 0,
    startPanY: 0,
  });

  // Reset states on image change
  useEffect(() => {
    setPanOffset({ x: 0, y: 0 });
    setIsHoveringImg(false);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onSelectIndex((currentIndex - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') onSelectIndex((currentIndex + 1) % images.length);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose, onSelectIndex]);

  // Handle accurate mouse movement strictly over the image
  const handleImageMouseMove = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    const img = imgRef.current;
    if (!img) return;

    const rect = img.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    if (cursorX < 0 || cursorX > rect.width || cursorY < 0 || cursorY > rect.height) {
      setIsHoveringImg(false);
      return;
    }

    setIsHoveringImg(true);

    // 1. Amazon Side Lens Geometry:
    // Lens size relative to zoom level
    const lensW = Math.max(60, Math.min(180, rect.width / zoomLevel));
    const lensH = Math.max(60, Math.min(180, rect.height / zoomLevel));

    // Clamp lens within image edges
    const clampedLensX = Math.max(0, Math.min(cursorX - lensW / 2, rect.width - lensW));
    const clampedLensY = Math.max(0, Math.min(cursorY - lensH / 2, rect.height - lensH));

    setLensPos({
      x: clampedLensX,
      y: clampedLensY,
      width: lensW,
      height: lensH,
    });

    // Side preview window dimensions
    const sideWin = sideWindowRef.current;
    const winWidth = sideWin ? sideWin.clientWidth : 500;
    const winHeight = sideWin ? sideWin.clientHeight : 500;

    const bgWidth = rect.width * zoomLevel;
    const bgHeight = rect.height * zoomLevel;

    // Amazon preview calculation: map lens position proportionally across zoomed backdrop
    const maxLensX = Math.max(1, rect.width - lensW);
    const maxLensY = Math.max(1, rect.height - lensH);
    const maxBgX = Math.max(0, bgWidth - winWidth);
    const maxBgY = Math.max(0, bgHeight - winHeight);

    const ratioX = clampedLensX / maxLensX;
    const ratioY = clampedLensY / maxLensY;

    setPreviewBg({
      bgX: -(ratioX * maxBgX),
      bgY: -(ratioY * maxBgY),
      bgWidth,
      bgHeight,
    });

    // 2. Loupe Lens Geometry:
    const LOUPE_RADIUS = 90;
    setLoupePos({
      x: cursorX,
      y: cursorY,
      bgX: -(cursorX * zoomLevel - LOUPE_RADIUS),
      bgY: -(cursorY * zoomLevel - LOUPE_RADIUS),
      bgWidth,
      bgHeight,
    });
  }, [zoomLevel]);

  // Pan mode dragging
  const handlePanMouseDown = (e: React.MouseEvent) => {
    if (mode === 'pan') {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        startPanX: panOffset.x,
        startPanY: panOffset.y,
      };
    }
  };

  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && mode === 'pan') {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      setPanOffset({
        x: dragStartRef.current.startPanX + deltaX,
        y: dragStartRef.current.startPanY + deltaY,
      });
    }
  }, [isDragging, mode]);

  const handleGlobalMouseUp = useCallback(() => {
    if (isDragging) setIsDragging(false);
  }, [isDragging]);

  useEffect(() => {
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [handleGlobalMouseMove, handleGlobalMouseUp]);

  if (!isOpen || !currentImage) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-950/98 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800/80 bg-stone-900/70 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h2 className="text-base font-semibold text-stone-100 tracking-tight line-clamp-1">
              {currentImage.title}
            </h2>
            {currentImage.caption && (
              <p className="text-xs text-stone-400 line-clamp-1 mt-0.5">
                {currentImage.caption}
              </p>
            )}
          </div>
        </div>

        {/* Center Mode Controls & Zoom */}
        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-stone-950 rounded-xl border border-stone-800">
            <button
              onClick={() => setMode('side')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                mode === 'side'
                  ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Amazon-style side magnification panel"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Side Magnifier</span>
            </button>
            <button
              onClick={() => setMode('loupe')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                mode === 'loupe'
                  ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Circular magnifying lens following cursor"
            >
              <CircleDot className="w-3.5 h-3.5" />
              <span>Lens Loupe</span>
            </button>
            <button
              onClick={() => setMode('pan')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                mode === 'pan'
                  ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Click & drag to explore high resolution"
            >
              <Move className="w-3.5 h-3.5" />
              <span>Pan & Zoom</span>
            </button>
          </div>

          {/* Zoom Multiplier */}
          <div className="flex items-center gap-2 px-3 py-1 bg-stone-900 rounded-xl border border-stone-800 text-xs text-stone-300">
            <ZoomOut className="w-3.5 h-3.5 text-stone-400" />
            <input
              type="range"
              min="1.8"
              max="4.5"
              step="0.3"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
              className="w-20 accent-amber-400 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
            />
            <ZoomIn className="w-3.5 h-3.5 text-stone-400" />
            <span className="font-mono text-amber-300 w-9 text-right font-semibold">
              {zoomLevel.toFixed(1)}x
            </span>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5">
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(currentImage.id)}
              className={`p-2 rounded-lg transition-colors ${
                currentImage.isFavorite
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800'
              }`}
              title="Favorite photo"
            >
              <Heart className={`w-4 h-4 ${currentImage.isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}

          {onEdit && (
            <button
              onClick={() => onEdit(currentImage)}
              className="p-2 text-stone-400 hover:text-amber-300 hover:bg-stone-800 rounded-lg transition-colors"
              title="Edit photo details"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(currentImage.id)}
              className="p-2 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition-colors"
              title="Delete photo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <a
            href={currentImage.url}
            download={`${currentImage.title.replace(/\s+/g, '_')}.jpg`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
            title="Download full quality image"
          >
            <Download className="w-4 h-4" />
          </a>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors ml-1"
            title="Close viewer (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="relative flex-1 flex items-center justify-center p-4 md:p-6 overflow-hidden">
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => onSelectIndex((currentIndex - 1 + images.length) % images.length)}
              className="absolute left-6 z-40 p-3 bg-stone-900/90 hover:bg-amber-400 hover:text-stone-950 text-stone-200 rounded-full border border-stone-800 transition-all shadow-2xl"
              title="Previous memory"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => onSelectIndex((currentIndex + 1) % images.length)}
              className="absolute right-6 z-40 p-3 bg-stone-900/90 hover:bg-amber-400 hover:text-stone-950 text-stone-200 rounded-full border border-stone-800 transition-all shadow-2xl"
              title="Next memory"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Mode 1: Amazon Side-by-Side Magnifier */}
        {mode === 'side' && (
          <div className="flex items-center justify-center gap-6 max-w-7xl w-full h-[74vh]">
            {/* Primary Source Image (100% original composition, completely uncropped!) */}
            <div className="relative flex-1 h-full flex items-center justify-center bg-stone-900/30 rounded-2xl border border-stone-800/80 overflow-hidden">
              <div 
                className="relative inline-block max-w-full max-h-full"
                onMouseLeave={() => setIsHoveringImg(false)}
              >
                <img
                  ref={imgRef}
                  src={currentImage.url}
                  alt={currentImage.title}
                  referrerPolicy="no-referrer"
                  onMouseMove={handleImageMouseMove}
                  className="max-w-full max-h-[72vh] w-auto h-auto object-contain cursor-crosshair rounded-lg block shadow-2xl"
                />

                {/* Amazon Rectangular Lens Box strictly inside image boundaries */}
                {isHoveringImg && (
                  <div
                    className="absolute pointer-events-none border-2 border-amber-400 bg-amber-400/20 shadow-[0_0_20px_rgba(245,158,11,0.35)] rounded-md transition-all duration-75"
                    style={{
                      left: `${lensPos.x}px`,
                      top: `${lensPos.y}px`,
                      width: `${lensPos.width}px`,
                      height: `${lensPos.height}px`,
                    }}
                  />
                )}
              </div>

              {!isHoveringImg && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-stone-950/90 border border-stone-800 rounded-full text-xs text-stone-300 flex items-center gap-1.5 shadow-xl pointer-events-none">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hover over photograph to inspect razor-sharp details</span>
                </div>
              )}
            </div>

            {/* Amazon Zoomed Magnification Window */}
            <div 
              ref={sideWindowRef}
              className="hidden lg:flex flex-1 max-w-2xl h-full flex-col bg-stone-900/60 rounded-2xl border border-stone-800 overflow-hidden shadow-2xl relative"
            >
              <div className="px-4 py-2.5 border-b border-stone-800 bg-stone-950/80 flex items-center justify-between text-xs text-stone-300">
                <span className="flex items-center gap-2 text-amber-300 font-medium">
                  <ZoomIn className="w-4 h-4 text-amber-400" /> Amazon Magnification Window ({zoomLevel.toFixed(1)}x)
                </span>
                <span className="text-stone-500 font-mono text-[11px]">Original Ratio Intact</span>
              </div>

              <div className="relative flex-1 overflow-hidden bg-stone-950 flex items-center justify-center">
                {isHoveringImg ? (
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${currentImage.url})`,
                      backgroundPosition: `${previewBg.bgX}px ${previewBg.bgY}px`,
                      backgroundSize: `${previewBg.bgWidth}px ${previewBg.bgHeight}px`,
                      backgroundRepeat: 'no-repeat',
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-8 text-stone-500">
                    <div className="w-16 h-16 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 mb-3">
                      <ZoomIn className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-medium text-stone-300">Magnifier Lens Ready</p>
                    <p className="text-xs text-stone-500 mt-1 max-w-xs leading-relaxed">
                      Move your cursor across the photograph on the left to reveal high-resolution details in this panel.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mode 2: Direct Lens Loupe */}
        {mode === 'loupe' && (
          <div className="relative max-w-5xl h-[74vh] w-full flex items-center justify-center bg-stone-900/30 rounded-2xl border border-stone-800 overflow-hidden">
            <div 
              className="relative inline-block max-w-full max-h-full"
              onMouseLeave={() => setIsHoveringImg(false)}
            >
              <img
                ref={imgRef}
                src={currentImage.url}
                alt={currentImage.title}
                referrerPolicy="no-referrer"
                onMouseMove={handleImageMouseMove}
                className="max-w-full max-h-[72vh] w-auto h-auto object-contain cursor-none rounded-lg block shadow-2xl"
              />

              {/* High-Precision Circular Loupe */}
              {isHoveringImg && (
                <div
                  className="pointer-events-none absolute w-48 h-48 rounded-full border-2 border-amber-400 shadow-[0_12px_36px_rgba(0,0,0,0.9),0_0_24px_rgba(245,158,11,0.4)] overflow-hidden bg-stone-950 z-30"
                  style={{
                    left: `${loupePos.x - 96}px`,
                    top: `${loupePos.y - 96}px`,
                  }}
                >
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url(${currentImage.url})`,
                      backgroundPosition: `${loupePos.bgX}px ${loupePos.bgY}px`,
                      backgroundSize: `${loupePos.bgWidth}px ${loupePos.bgHeight}px`,
                      backgroundRepeat: 'no-repeat',
                    }}
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mode 3: Pan & Zoom Mode */}
        {mode === 'pan' && (
          <div
            onMouseDown={handlePanMouseDown}
            className={`relative max-w-6xl h-[74vh] w-full flex items-center justify-center bg-stone-900/30 rounded-2xl border border-stone-800 overflow-hidden select-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            <div
              className="transition-transform duration-75 ease-out flex items-center justify-center"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
              }}
            >
              <img
                src={currentImage.url}
                alt={currentImage.title}
                referrerPolicy="no-referrer"
                draggable={false}
                className="max-w-[70vw] max-h-[68vh] w-auto h-auto object-contain drop-shadow-2xl pointer-events-none"
              />
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-stone-950/90 border border-stone-800 rounded-full text-xs text-stone-300 flex items-center gap-2 shadow-xl pointer-events-none">
              <Move className="w-3.5 h-3.5 text-amber-400" />
              <span>Click and drag to pan across high-resolution image ({zoomLevel.toFixed(1)}x)</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Thumbnails Strip */}
      {images.length > 1 && (
        <div className="px-6 py-3 border-t border-stone-800/80 bg-stone-950/90 flex items-center justify-center gap-3 overflow-x-auto shrink-0">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => onSelectIndex(idx)}
              className={`relative h-14 w-auto rounded-lg overflow-hidden border transition-all shrink-0 ${
                idx === currentIndex
                  ? 'border-amber-400 scale-105 ring-2 ring-amber-400/40'
                  : 'border-stone-800 opacity-60 hover:opacity-100 hover:border-stone-600'
              }`}
            >
              <img
                src={img.url}
                alt={img.title}
                referrerPolicy="no-referrer"
                className="h-14 w-auto object-contain bg-stone-950"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
