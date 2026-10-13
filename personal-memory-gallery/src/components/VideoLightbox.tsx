import React, { useRef, useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  ChevronLeft, 
  ChevronRight, 
  Download,
  Heart,
  Edit3,
  Trash2
} from 'lucide-react';
import { MemoryVideo } from '../types/memory';

interface VideoLightboxProps {
  videos: MemoryVideo[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
  onEdit?: (video: MemoryVideo) => void;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
}

export const VideoLightbox: React.FC<VideoLightboxProps> = ({
  videos,
  currentIndex,
  isOpen,
  onClose,
  onSelectIndex,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const currentVideo = videos[currentIndex];
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === 'ArrowLeft') onSelectIndex((currentIndex - 1 + videos.length) % videos.length);
      if (e.key === 'ArrowRight') onSelectIndex((currentIndex + 1) % videos.length);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, videos.length, isPlaying]);

  useEffect(() => {
    setIsPlaying(true);
    setProgress(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentIndex]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration || 1;
    setCurrentTime(current);
    setDuration(total);
    setProgress((current / total) * 100);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const seekPercentage = parseFloat(e.target.value);
    const newTime = (seekPercentage / 100) * (videoRef.current.duration || 1);
    videoRef.current.currentTime = newTime;
    setProgress(seekPercentage);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!isOpen || !currentVideo) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-950/95 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800/80 bg-stone-900/60">
        <div>
          <h2 className="text-base font-semibold text-stone-100 tracking-tight">
            {currentVideo.title}
          </h2>
          {currentVideo.caption && (
            <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{currentVideo.caption}</p>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(currentVideo.id)}
              className={`p-2 rounded-lg transition-colors ${
                currentVideo.isFavorite
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800'
              }`}
              title="Favorite video"
            >
              <Heart className={`w-4 h-4 ${currentVideo.isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}

          {onEdit && (
            <button
              onClick={() => onEdit(currentVideo)}
              className="p-2 text-stone-400 hover:text-amber-300 hover:bg-stone-800 rounded-lg transition-colors"
              title="Edit video title & note"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(currentVideo.id)}
              className="p-2 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition-colors"
              title="Delete video"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <a
            href={currentVideo.url}
            download={`${currentVideo.title.replace(/\s+/g, '_')}.mp4`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
            title="Download video"
          >
            <Download className="w-4 h-4" />
          </a>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors ml-1"
            title="Close video (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="relative flex-1 flex items-center justify-center p-6 overflow-hidden">
        {/* Navigation Arrows */}
        {videos.length > 1 && (
          <>
            <button
              onClick={() => onSelectIndex((currentIndex - 1 + videos.length) % videos.length)}
              className="absolute left-6 z-30 p-3 bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white rounded-full border border-stone-800 transition-all hover:scale-105 shadow-xl"
              title="Previous video"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => onSelectIndex((currentIndex + 1) % videos.length)}
              className="absolute right-6 z-30 p-3 bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white rounded-full border border-stone-800 transition-all hover:scale-105 shadow-xl"
              title="Next video"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        <div className="relative max-w-5xl w-full max-h-[75vh] rounded-2xl overflow-hidden bg-black shadow-2xl border border-stone-800 group">
          <video
            ref={videoRef}
            src={currentVideo.url}
            poster={currentVideo.poster}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            onClick={togglePlay}
            autoPlay
            playsInline
            className="w-full h-full max-h-[75vh] object-contain cursor-pointer"
          />

          {/* Floating Big Play Button when paused */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/90 text-stone-950 flex items-center justify-center shadow-2xl transition-transform hover:scale-110">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
            </button>
          )}

          {/* Video Control Bar */}
          <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-2">
            {/* Scrubber slider */}
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progress}
              onChange={handleSeek}
              className="w-full h-1.5 accent-amber-500 bg-stone-700/60 rounded-lg cursor-pointer hover:h-2 transition-all"
            />

            <div className="flex items-center justify-between text-xs text-stone-300 mt-1">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="p-1.5 hover:text-amber-300 transition-colors"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <button
                  onClick={toggleMute}
                  className="p-1.5 hover:text-amber-300 transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className="font-mono text-stone-400">
                  {formatSeconds(currentTime)} / {formatSeconds(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 hover:text-amber-300 transition-colors"
                  title="Fullscreen"
                >
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
