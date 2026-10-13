import React, { useState, useEffect } from 'react';
import { X, Sparkles, Image, Check } from 'lucide-react';
import { MemoryStory, MemoryImage } from '../types/memory';

interface StoryEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (story: MemoryStory) => void;
  initialStory?: MemoryStory | null;
  availableImages: MemoryImage[];
}

const MOODS = ['Peaceful', 'Nostalgia', 'Wonder', 'Gratitude', 'Love', 'Adventure', 'Reflection'];

export const StoryEditorModal: React.FC<StoryEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialStory,
  availableImages,
}) => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('Peaceful');
  const [coverImage, setCoverImage] = useState<string>('');

  useEffect(() => {
    if (initialStory) {
      setTitle(initialStory.title);
      setSummary(initialStory.summary);
      setContent(initialStory.content);
      setMood(initialStory.mood || 'Peaceful');
      setCoverImage(initialStory.coverImage || '');
    } else {
      setTitle('');
      setSummary('');
      setContent('');
      setMood('Peaceful');
      setCoverImage(availableImages.length > 0 ? availableImages[0].url : '');
    }
  }, [initialStory, isOpen, availableImages]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const storyToSave: MemoryStory = {
      id: initialStory ? initialStory.id : `story-${Date.now()}`,
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      mood,
      coverImage: coverImage || undefined,
      isFavorite: initialStory?.isFavorite || false,
      createdAt: initialStory?.createdAt || Date.now(),
    };

    onSave(storyToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-stone-950/90 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/40">
          <h2 className="text-base font-semibold text-stone-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            {initialStory ? 'Edit Personal Story' : 'Preserve a Personal Story'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">
              Story Title <span className="text-amber-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Quiet Morning on the Porch"
              className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm"
            />
          </div>

          {/* Theme / Mood */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-2">
              Emotional Tone
            </label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMood(m)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    mood === m
                      ? 'bg-amber-500 text-stone-950 shadow-sm'
                      : 'bg-stone-950 border border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Short Excerpt / Opening Thought */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">
              Opening Thought or Short Excerpt
            </label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="A brief sentence capturing the essence of this memory..."
              className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500/70 text-sm"
            />
          </div>

          {/* Full Content */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">
              The Full Story <span className="text-amber-500">*</span>
            </label>
            <textarea
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your personal memories, thoughts, feelings, and details here..."
              className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500/70 text-sm font-serif-display leading-relaxed"
            />
          </div>

          {/* Optional Cover Image Picker from Gallery */}
          {availableImages.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-2 flex items-center gap-1.5">
                <Image className="w-3.5 h-3.5 text-amber-400" />
                Featured Memory Photograph (Optional)
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                <button
                  type="button"
                  onClick={() => setCoverImage('')}
                  className={`aspect-video rounded-lg border flex items-center justify-center text-xs transition-all ${
                    !coverImage
                      ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-medium'
                      : 'border-stone-800 bg-stone-950 text-stone-500 hover:border-stone-700'
                  }`}
                >
                  None
                </button>
                {availableImages.map((img) => (
                  <button
                    type="button"
                    key={img.id}
                    onClick={() => setCoverImage(img.url)}
                    className={`relative aspect-video rounded-lg overflow-hidden border transition-all ${
                      coverImage === img.url
                        ? 'border-amber-500 ring-2 ring-amber-500/40'
                        : 'border-stone-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={img.title} className="w-full h-full object-contain bg-stone-950" />
                    {coverImage === img.url && (
                      <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-amber-300" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-stone-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-stone-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md hover:shadow-amber-500/20 active:scale-95"
            >
              {initialStory ? 'Save Changes' : 'Preserve Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
