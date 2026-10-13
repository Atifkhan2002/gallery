import React, { useState, useEffect } from 'react';
import { X, Video, Check } from 'lucide-react';
import { MemoryVideo } from '../types/memory';

interface VideoEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: MemoryVideo | null;
  onSave: (updated: MemoryVideo) => void;
}

export const VideoEditorModal: React.FC<VideoEditorModalProps> = ({
  isOpen,
  onClose,
  video,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');

  useEffect(() => {
    if (video) {
      setTitle(video.title);
      setCaption(video.caption || '');
    }
  }, [video, isOpen]);

  if (!isOpen || !video) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      ...video,
      title: title.trim(),
      caption: caption.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-xl animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden p-6">
        <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-4">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-semibold text-stone-100">Edit Video Memory</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-100 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              Title <span className="text-amber-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500/70 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              Memory Note / Caption
            </label>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What made this video moment special..."
              className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500/70 text-sm resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-medium text-stone-400 hover:text-stone-200 bg-stone-950 rounded-xl border border-stone-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
