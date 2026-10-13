import React, { useState, useRef } from 'react';
import { X, UploadCloud, Image as ImageIcon, Video as VideoIcon, CheckCircle2, Link, AlertCircle } from 'lucide-react';
import { MemoryImage, MemoryVideo } from '../types/memory';

interface UploadMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType: 'image' | 'video';
  onSaveImage: (image: MemoryImage) => void;
  onSaveVideo: (video: MemoryVideo) => void;
}

export const UploadMediaModal: React.FC<UploadMediaModalProps> = ({
  isOpen,
  onClose,
  defaultType,
  onSaveImage,
  onSaveVideo,
}) => {
  const [mediaType, setMediaType] = useState<'image' | 'video'>(defaultType);
  const [sourceMode, setSourceMode] = useState<'upload' | 'url'>('upload');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [sizeWarning, setSizeWarning] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setMediaType(defaultType);
    setTitle('');
    setCaption('');
    setPreviewUrl(null);
    setUrlInput('');
    setFileName('');
    setFileSize('');
    setSizeWarning(null);
    setSourceMode('upload');
  }, [defaultType, isOpen]);

  if (!isOpen) return null;

  // Safe image optimization: preserves 100% original aspect ratio and guarantees fitting inside Firestore document
  const optimizeImageFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          let maxDim = 1600;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            let quality = 0.82;
            let result = canvas.toDataURL('image/jpeg', quality);
            // If base64 exceeds safe threshold for 1MB Firestore document, progressively reduce
            if (result.length > 800000) {
              quality = 0.7;
              result = canvas.toDataURL('image/jpeg', quality);
            }
            if (result.length > 800000) {
              canvas.width = Math.round(width * 0.75);
              canvas.height = Math.round(height * 0.75);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              result = canvas.toDataURL('image/jpeg', 0.65);
            }
            resolve(result);
          } else {
            resolve(dataUrl);
          }
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFile = async (file: File) => {
    if (!file) return;
    setSizeWarning(null);

    const isVid = file.type.startsWith('video/');
    const isImg = file.type.startsWith('image/');

    if (isVid) setMediaType('video');
    else if (isImg) setMediaType('image');

    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    setFileName(file.name);
    const sizeInMB = file.size / (1024 * 1024);
    setFileSize(sizeInMB < 1 ? `${Math.round(file.size / 1024)} KB` : `${sizeInMB.toFixed(1)} MB`);

    setIsProcessing(true);
    if (isImg) {
      const optimizedUrl = await optimizeImageFile(file);
      setPreviewUrl(optimizedUrl);
      setIsProcessing(false);
    } else {
      if (file.size > 800 * 1024) {
        setSizeWarning('Video file is larger than 800KB. For guaranteed cross-browser database synchronization, please use a direct Video URL or a shorter clip.');
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrlInput(val);
    setPreviewUrl(val.trim() || null);
    setFileName(val.split('/').pop() || 'Web Link');
    setFileSize('Online URL');
    setSizeWarning(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = sourceMode === 'url' ? urlInput.trim() : previewUrl;
    if (!finalUrl || !title.trim()) return;

    if (mediaType === 'image') {
      const newImg: MemoryImage = {
        id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: title.trim(),
        caption: caption.trim() || undefined,
        url: finalUrl,
        aspect: 'landscape',
        createdAt: Date.now(),
      };
      onSaveImage(newImg);
    } else {
      const newVid: MemoryVideo = {
        id: `vid-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: title.trim(),
        caption: caption.trim() || undefined,
        url: finalUrl,
        poster: finalUrl,
        createdAt: Date.now(),
      };
      onSaveVideo(newVid);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-stone-950/90 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg flex flex-col bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-900/95 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-semibold text-stone-100">Preserve Memory</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Selector Tabs (Image vs Video) */}
        <div className="px-6 pt-4 pb-2 space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setMediaType('image');
                setSizeWarning(null);
              }}
              className={`flex-1 py-2 px-3 text-xs font-medium rounded-xl flex items-center justify-center gap-2 border transition-colors ${
                mediaType === 'image'
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Photograph</span>
            </button>
            <button
              type="button"
              onClick={() => setMediaType('video')}
              className={`flex-1 py-2 px-3 text-xs font-medium rounded-xl flex items-center justify-center gap-2 border transition-colors ${
                mediaType === 'video'
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              <VideoIcon className="w-4 h-4" />
              <span>Video Recording</span>
            </button>
          </div>

          {/* Source Mode Toggle: Upload File vs Web URL */}
          <div className="flex items-center justify-center gap-4 text-xs pt-1">
            <button
              type="button"
              onClick={() => setSourceMode('upload')}
              className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
                sourceMode === 'upload'
                  ? 'border-amber-400 text-amber-300 font-medium'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Local File</span>
            </button>
            <button
              type="button"
              onClick={() => setSourceMode('url')}
              className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
                sourceMode === 'url'
                  ? 'border-amber-400 text-amber-300 font-medium'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <Link className="w-3.5 h-3.5" />
              <span>Paste Direct Link / URL</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {sourceMode === 'upload' ? (
            /* Dropzone */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-amber-400 bg-amber-500/10'
                  : previewUrl
                  ? 'border-stone-700 bg-stone-950/60'
                  : 'border-stone-800 hover:border-stone-600 bg-stone-950/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={mediaType === 'image' ? 'image/*' : 'video/*'}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />

              {previewUrl ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-stone-950">
                  {mediaType === 'image' ? (
                    <img
                      src={previewUrl}
                      alt="Upload Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <video
                      src={previewUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  )}
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-stone-900/90 rounded-md text-[11px] text-stone-300 flex items-center gap-1.5 backdrop-blur-md">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="truncate max-w-[200px]">{fileName}</span>
                    <span className="text-stone-500">· {fileSize}</span>
                  </div>
                </div>
              ) : (
                <div className="py-4 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-stone-800/80 flex items-center justify-center text-stone-300 mb-3">
                    <UploadCloud className="w-6 h-6 text-amber-400" />
                  </div>
                  <p className="text-sm font-medium text-stone-200">
                    Click or drag your {mediaType === 'image' ? 'photo' : 'video'} here
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    {mediaType === 'image'
                      ? 'Supports JPG, PNG, WebP · 100% original aspect ratio preserved'
                      : 'Supports MP4, WebM clips'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Direct URL input */
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Direct {mediaType === 'image' ? 'Image' : 'Video'} Web URL <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={urlInput}
                    onChange={handleUrlChange}
                    placeholder={
                      mediaType === 'image'
                        ? 'https://example.com/photos/sunset.jpg'
                        : 'https://example.com/videos/vacation.mp4'
                    }
                    className="w-full pl-9 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500/70 text-sm"
                  />
                  <Link className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Syncs across any device or browser with zero size limits.
                </p>
              </div>

              {previewUrl && (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-stone-950 border border-stone-800">
                  {mediaType === 'image' ? (
                    <img
                      src={previewUrl}
                      alt="URL Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <video
                      src={previewUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {sizeWarning && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2 text-xs text-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{sizeWarning}</span>
            </div>
          )}

          {/* Memory Title */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              Memory Title <span className="text-amber-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sunset on the Pier"
              className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500/70 text-sm"
            />
          </div>

          {/* Memory Caption / Note */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              Memory Note / Reflection (Optional)
            </label>
            <textarea
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="A few words about what this moment felt like..."
              className="w-full px-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500/70 text-sm resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-stone-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={(!previewUrl && !urlInput.trim()) || !title.trim() || isProcessing}
              className="px-5 py-2.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md active:scale-95"
            >
              Preserve Memory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
