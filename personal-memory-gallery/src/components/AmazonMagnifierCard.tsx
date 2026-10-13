import React, { useState, useRef, useCallback } from 'react';
import { ZoomIn, Trash2, Heart, Edit3 } from 'lucide-react';
import { MemoryImage } from '../types/memory';

interface AmazonMagnifierCardProps {
  image: MemoryImage;
  onClick: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (image: MemoryImage) => void;
  onToggleFavorite?: (id: string) => void;
}

export const AmazonMagnifierCard: React.FC<AmazonMagnifierCardProps> = ({
  image,
  onClick,
  onDelete,
  onEdit,
  onToggleFavorite,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [lensState, setLensState] = useState<{
    visible: boolean;
    x: number;
    y: number;
    bgX: number;
    bgY: number;
    bgWidth: number;
    bgHeight: number;
  }>({
    visible: false,
    x: 0,
    y: 0,
    bgX: 0,
    bgY: 0,
    bgWidth: 0,
    bgHeight: 0,
  });

  const ZOOM_FACTOR = 2.6;
  const LENS_SIZE = 120; // 120px diameter loupe
  const LENS_RADIUS = LENS_SIZE / 2;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const img = imgRef.current;
    if (!img) return;

    const rect = img.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Check if within image bounds
    if (clientX < 0 || clientX > rect.width || clientY < 0 || clientY > rect.height) {
      setLensState((prev) => ({ ...prev, visible: false }));
      return;
    }

    const bgWidth = rect.width * ZOOM_FACTOR;
    const bgHeight = rect.height * ZOOM_FACTOR;
    const bgX = -(clientX * ZOOM_FACTOR - LENS_RADIUS);
    const bgY = -(clientY * ZOOM_FACTOR - LENS_RADIUS);

    setLensState({
      visible: true,
      x: clientX,
      y: clientY,
      bgX,
      bgY,
      bgWidth,
      bgHeight,
    });
  }, [ZOOM_FACTOR, LENS_RADIUS]);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setLensState((prev) => ({ ...prev, visible: false }));
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="group relative rounded-2xl overflow-hidden bg-stone-900 border border-stone-800/80 hover:border-amber-500/50 transition-all duration-300 shadow-md hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer flex flex-col h-full"
    >
      {/* 
        CRITICAL REQUIREMENT:
        - Never crop photographs automatically.
        - Never stretch or distort images.
        - Never force every photograph into the same aspect ratio.
        - Never cut off faces, heads, bodies, or scenery.
        - Never use object-fit: cover.
        Images render with natural aspect ratio (w-full h-auto) preserving 100% of original composition!
      */}
      <div 
        className="relative w-full overflow-hidden bg-stone-950 flex items-center justify-center select-none"
        onMouseMove={handleMouseMove}
      >
        <img
          ref={imgRef}
          src={image.url}
          alt={image.title}
          referrerPolicy="no-referrer"
          className="w-full h-auto block transition-transform duration-300 ease-out select-none"
          style={{
            // Zero cropping, zero distortion
            maxHeight: 'none',
          }}
        />

        {/* Amazon-Style Accurate Magnifying Lens Loupe on Hover */}
        {lensState.visible && (
          <div
            className="pointer-events-none absolute rounded-full border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4),0_8px_25px_rgba(0,0,0,0.8)] overflow-hidden z-30"
            style={{
              width: `${LENS_SIZE}px`,
              height: `${LENS_SIZE}px`,
              left: `${lensState.x - LENS_RADIUS}px`,
              top: `${lensState.y - LENS_RADIUS}px`,
            }}
          >
            {/* Magnified view with 1:1 pixel accuracy */}
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url(${image.url})`,
                backgroundSize: `${lensState.bgWidth}px ${lensState.bgHeight}px`,
                backgroundPosition: `${lensState.bgX}px ${lensState.bgY}px`,
                backgroundRepeat: 'no-repeat',
              }}
            />
            {/* Subtle optical specular highlight ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
          </div>
        )}

        {/* Top Floating Action Controls */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(image.id);
              }}
              className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                image.isFavorite
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'bg-stone-950/80 text-stone-300 hover:text-amber-400 hover:bg-stone-900'
              }`}
              title="Favorite memory"
            >
              <Heart className={`w-3.5 h-3.5 ${image.isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}

          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(image);
              }}
              className="p-2 rounded-full bg-stone-950/80 hover:bg-amber-500 hover:text-stone-950 text-stone-300 backdrop-blur-md transition-colors"
              title="Edit photo details"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(image.id);
              }}
              className="p-2 rounded-full bg-stone-950/80 hover:bg-rose-500/90 text-stone-300 hover:text-white backdrop-blur-md transition-colors"
              title="Delete memory"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Bottom hover badge */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-none">
          <div className="px-2.5 py-1 rounded-full bg-stone-950/85 backdrop-blur-md border border-stone-800 text-[11px] font-medium text-amber-300 flex items-center gap-1.5 shadow-lg">
            <ZoomIn className="w-3 h-3 text-amber-400" />
            <span>Click to expand</span>
          </div>
        </div>
      </div>

      {/* Memory Details (Clean, completely uncropped composition, no dates) */}
      <div className="p-4 flex flex-col justify-between border-t border-stone-800/60">
        <h3 className="text-sm font-semibold text-stone-100 group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
          {image.title}
        </h3>
        {image.caption && (
          <p className="text-xs text-stone-400 mt-1 line-clamp-3 leading-relaxed">
            {image.caption}
          </p>
        )}
      </div>
    </div>
  );
};
