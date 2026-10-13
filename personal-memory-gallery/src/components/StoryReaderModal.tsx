import React, { useState, useEffect } from 'react';
import { X, BookOpen, Edit3, Trash2, Heart, Type } from 'lucide-react';
import { MemoryStory } from '../types/memory';

interface StoryReaderModalProps {
  story: MemoryStory | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (story: MemoryStory) => void;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
}

export const StoryReaderModal: React.FC<StoryReaderModalProps> = ({
  story,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('normal');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !story) return null;

  const fontClass =
    fontSize === 'normal'
      ? 'text-lg leading-relaxed'
      : fontSize === 'large'
      ? 'text-xl leading-loose'
      : 'text-2xl leading-loose';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-stone-950/90 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800/80 bg-stone-950/40">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Personal Story</span>
            {story.mood && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-300 font-medium">{story.mood}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Font size toggle */}
            <div className="flex items-center bg-stone-800/80 rounded-lg p-0.5 border border-stone-700/60 mr-2">
              <button
                onClick={() => setFontSize('normal')}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  fontSize === 'normal' ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:text-white'
                }`}
                title="Standard font size"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
                  fontSize === 'large' ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:text-white'
                }`}
                title="Larger font size"
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('huge')}
                className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
                  fontSize === 'huge' ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:text-white'
                }`}
                title="Largest font size"
              >
                A++
              </button>
            </div>

            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(story);
                }}
                className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
                title="Edit story"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}

            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(story.id)}
                className={`p-2 rounded-lg transition-colors ${
                  story.isFavorite
                    ? 'text-amber-400 bg-amber-500/10'
                    : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800'
                }`}
                title="Favorite story"
              >
                <Heart className={`w-4 h-4 ${story.isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => {
                  onDelete(story.id);
                }}
                className="p-2 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition-colors"
                title="Delete story"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors ml-1"
              title="Close reader (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Story Content */}
        <div className="flex-1 overflow-y-auto px-8 md:px-14 py-10 space-y-8">
          {/* Optional Story Header Cover Image (Uncropped) */}
          {story.coverImage && (
            <div className="relative w-full rounded-2xl overflow-hidden border border-stone-800/80 shadow-lg bg-stone-950 flex items-center justify-center p-2">
              <img
                src={story.coverImage}
                alt={story.title}
                referrerPolicy="no-referrer"
                className="max-h-[50vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>
          )}

          {/* Title & Summary */}
          <div className="space-y-4">
            <h1 className="font-serif-display text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-stone-100 leading-tight">
              {story.title}
            </h1>
            {story.summary && (
              <p className="text-base md:text-lg text-amber-200/90 font-light italic leading-relaxed border-l-2 border-amber-500/50 pl-4 py-1">
                {story.summary}
              </p>
            )}
          </div>

          <div className="h-px bg-stone-800 w-full" />

          {/* Full Story Prose */}
          <div className={`font-serif-display text-stone-300 space-y-6 ${fontClass} whitespace-pre-line tracking-wide`}>
            {story.content}
          </div>

          <div className="pt-10 pb-6 flex items-center justify-center">
            <div className="w-12 h-0.5 bg-amber-500/40 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
