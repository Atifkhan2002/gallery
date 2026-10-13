import React, { useState, useRef } from 'react';
import { Play, Trash2, Heart, Edit3 } from 'lucide-react';
import { MemoryVideo } from '../types/memory';

interface VideoCardProps {
  video: MemoryVideo;
  onClick: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (video: MemoryVideo) => void;
  onToggleFavorite?: (id: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onClick,
  onDelete,
  onEdit,
  onToggleFavorite,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden bg-stone-900 border border-stone-800/80 hover:border-amber-500/40 transition-all duration-300 shadow-md hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer flex flex-col"
    >
      {/* Video Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={video.url}
          poster={video.poster}
          muted
          loop
          playsInline
          preload="metadata"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Ambient Overlay */}
        <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-transparent transition-colors" />

        {/* Play Icon in center when not hovered */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
            isHovered ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-stone-900/80 backdrop-blur-md border border-stone-700 text-stone-200 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-stone-950 transition-all">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Top Actions */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(video.id);
              }}
              className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                video.isFavorite
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'bg-stone-950/70 text-stone-300 hover:text-amber-400 hover:bg-stone-900/90'
              }`}
              title="Favorite video"
            >
              <Heart className={`w-3.5 h-3.5 ${video.isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}

          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(video);
              }}
              className="p-2 rounded-full bg-stone-950/70 hover:bg-amber-500 hover:text-stone-950 text-stone-300 backdrop-blur-md transition-colors"
              title="Edit video title & note"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(video.id);
              }}
              className="p-2 rounded-full bg-stone-950/70 hover:bg-rose-500/80 text-stone-300 hover:text-white backdrop-blur-md transition-colors"
              title="Delete video"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Duration badge if present */}
        {video.duration && (
          <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-stone-950/80 backdrop-blur-md text-[11px] font-mono text-stone-300 border border-stone-800">
            {video.duration}
          </div>
        )}
      </div>

      {/* Video Caption & Info (no dates per prompt) */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-stone-100 group-hover:text-amber-300 transition-colors line-clamp-1">
            {video.title}
          </h3>
          {video.caption && (
            <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">
              {video.caption}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
