import React from 'react';
import { Plus, Image as ImageIcon, Video as VideoIcon, BookOpen, Lock, Unlock } from 'lucide-react';
import { GalleryTab } from '../types/memory';

interface HeaderProps {
  activeTab: GalleryTab;
  isUnlocked: boolean;
  onSelectTab: (tab: GalleryTab) => void;
  onOpenUpload: () => void;
  onOpenWriteStory: () => void;
  onToggleLock: () => void;
  onReplayGreetings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  isUnlocked,
  onSelectTab,
  onOpenUpload,
  onOpenWriteStory,
  onToggleLock,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-stone-950/85 backdrop-blur-md border-b border-stone-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title wordmark (clean, single text element, no pills) */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-serif-display text-xl sm:text-2xl font-normal tracking-tight text-stone-100 whitespace-nowrap">
            Personal Memory Gallery
          </span>
        </div>

        {/* Zone 2: Exactly 3 tabs: Images, Videos, Personal Stories */}
        <nav className="flex items-center gap-1 sm:gap-2 p-1 bg-stone-900/90 rounded-2xl border border-stone-800/80">
          <button
            onClick={() => onSelectTab('images')}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'images'
                ? 'bg-amber-400 text-stone-950 shadow-md font-semibold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Images</span>
          </button>

          <button
            onClick={() => onSelectTab('videos')}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'videos'
                ? 'bg-amber-400 text-stone-950 shadow-md font-semibold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <VideoIcon className="w-4 h-4" />
            <span>Videos</span>
          </button>

          <button
            onClick={() => onSelectTab('stories')}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'stories'
                ? 'bg-amber-400 text-stone-950 shadow-md font-semibold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Personal Stories</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & Vault Security Status */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

          {/* Discreet Lock Toggle Button */}
          <button
            onClick={onToggleLock}
            className={`p-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
              isUnlocked
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:text-stone-200 hover:border-stone-700'
            }`}
            title={isUnlocked ? 'Vault Unlocked. Click to lock gallery permissions.' : 'Vault Locked. Password required to upload or write.'}
          >
            {isUnlocked ? <Unlock className="w-4 h-4 text-amber-400" /> : <Lock className="w-4 h-4 text-stone-400" />}
            <span className="hidden md:inline text-[11px]">
              {isUnlocked ? 'Unlocked' : 'Protected'}
            </span>
          </button>

          {/* Upload / Write Action */}
          {activeTab === 'stories' ? (
            <button
              onClick={onOpenWriteStory}
              className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-stone-950 bg-stone-100 hover:bg-amber-300 rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Write Story</span>
            </button>
          ) : (
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-stone-950 bg-stone-100 hover:bg-amber-300 rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{activeTab === 'videos' ? 'Upload Video' : 'Upload Photo'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
