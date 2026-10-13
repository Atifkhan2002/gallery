import React from 'react';
import { BookOpen, Trash2, Heart, ArrowUpRight, Edit3 } from 'lucide-react';
import { MemoryStory } from '../types/memory';

interface StoryCardProps {
  story: MemoryStory;
  onClick: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (story: MemoryStory) => void;
  onToggleFavorite?: (id: string) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  onClick,
  onDelete,
  onEdit,
  onToggleFavorite,
}) => {
  return (
    <div
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden bg-stone-900 border border-stone-800/80 hover:border-amber-500/40 transition-all duration-300 shadow-md hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer flex flex-col justify-between p-6"
    >
      <div>
        {/* Optional Cover Image Banner */}
        {story.coverImage && (
          <div className="relative aspect-[16/10] -mx-6 -mt-6 mb-5 overflow-hidden bg-stone-950 border-b border-stone-800/60 flex items-center justify-center">
            <img
              src={story.coverImage}
              alt={story.title}
              referrerPolicy="no-referrer"
              className="max-w-full max-h-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
            />
          </div>
        )}

        {/* Top unboxed metadata (zero-pill discipline) */}
        <div className="flex items-center justify-between text-xs text-stone-400 mb-3">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Story</span>
            {story.mood && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-300/90 font-medium">{story.mood}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1">
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(story.id);
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  story.isFavorite ? 'text-amber-400' : 'text-stone-500 hover:text-stone-300'
                }`}
                title="Favorite story"
              >
                <Heart className={`w-3.5 h-3.5 ${story.isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}

            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(story);
                }}
                className="p-1.5 text-stone-500 hover:text-amber-300 rounded-lg transition-colors"
                title="Edit story"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}

            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(story.id);
                }}
                className="p-1.5 text-stone-500 hover:text-rose-400 rounded-lg transition-colors"
                title="Delete story"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Story Title */}
        <h3 className="font-serif-display text-xl font-medium text-stone-100 group-hover:text-amber-200 transition-colors line-clamp-2 leading-snug">
          {story.title}
        </h3>

        {/* Story Excerpt */}
        <p className="text-xs text-stone-400 mt-2.5 line-clamp-3 leading-relaxed">
          {story.summary || story.content}
        </p>
      </div>

      {/* Card Footer: Read Action */}
      <div className="pt-5 mt-4 border-t border-stone-800/80 flex items-center justify-between text-xs font-medium text-amber-400/90 group-hover:text-amber-300 transition-colors">
        <span>Read full story</span>
        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </div>
  );
};
