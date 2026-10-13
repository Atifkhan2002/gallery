import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemType: 'Photograph' | 'Video' | 'Story';
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemType,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-xl animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-100 rounded-lg hover:bg-stone-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-base font-semibold text-stone-100">
          Delete {itemType}?
        </h3>
        <p className="text-xs text-stone-400 mt-1.5 line-clamp-2 px-2">
          Are you sure you want to remove <span className="text-stone-200 font-medium">"{title}"</span>? This cannot be undone.
        </p>

        <div className="flex gap-2.5 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-medium text-stone-300 hover:text-white bg-stone-800/80 hover:bg-stone-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
