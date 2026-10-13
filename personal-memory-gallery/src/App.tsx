import React, { useState, useEffect } from 'react';
import { 
  getImages, 
  saveImage, 
  removeImage, 
  getVideos, 
  saveVideo, 
  removeVideo, 
  getStories, 
  saveStory, 
  removeStory, 
  initStorage,
  subscribeToImages,
  subscribeToVideos,
  subscribeToStories
} from './services/storage';
import { vaultService } from './services/vault';
import { MemoryImage, MemoryVideo, MemoryStory, GalleryTab } from './types/memory';
import { Header } from './components/Header';
import { AmazonMagnifierCard } from './components/AmazonMagnifierCard';
import { AmazonMagnifierModal } from './components/AmazonMagnifierModal';
import { VideoCard } from './components/VideoCard';
import { VideoLightbox } from './components/VideoLightbox';
import { StoryCard } from './components/StoryCard';
import { StoryReaderModal } from './components/StoryReaderModal';
import { StoryEditorModal } from './components/StoryEditorModal';
import { VideoEditorModal } from './components/VideoEditorModal';
import { ImageEditorModal } from './components/ImageEditorModal';
import { UploadMediaModal } from './components/UploadMediaModal';
import { PasswordModal } from './components/PasswordModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { GreetingIntro } from './components/GreetingIntro';
import { Plus, Image as ImageIcon, Video as VideoIcon, BookOpen, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<GalleryTab>('images');
  const [showIntro, setShowIntro] = useState<boolean>(true);
  
  // Storage state
  const [images, setImages] = useState<MemoryImage[]>([]);
  const [videos, setVideos] = useState<MemoryVideo[]>([]);
  const [stories, setStories] = useState<MemoryStory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Vault / Password state
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => vaultService.isUnlocked());
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [passwordActionTitle, setPasswordActionTitle] = useState<string>('Upload or write memories');

  // Modal states
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);
  const [readingStory, setReadingStory] = useState<MemoryStory | null>(null);
  const [editingStory, setEditingStory] = useState<MemoryStory | null>(null);
  const [editingVideo, setEditingVideo] = useState<MemoryVideo | null>(null);
  const [editingImage, setEditingImage] = useState<MemoryImage | null>(null);
  const [isWriteStoryOpen, setIsWriteStoryOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // In-app Delete Confirmation state
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    title: string;
    type: 'Photograph' | 'Video' | 'Story';
  } | null>(null);

  // Initialize and subscribe to real-time cloud data
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    async function loadData() {
      try {
        await initStorage();

        // Real-time Firestore sync across all open browsers/devices
        const unsubImgs = subscribeToImages((items) => {
          if (items.length > 0) setImages(items);
          setIsLoading(false);
        });
        const unsubVids = subscribeToVideos((items) => {
          if (items.length > 0) setVideos(items);
          setIsLoading(false);
        });
        const unsubStrs = subscribeToStories((items) => {
          if (items.length > 0) setStories(items);
          setIsLoading(false);
        });
        unsubs = [unsubImgs, unsubVids, unsubStrs];

        // Also fetch initial data
        const [imgs, vids, strs] = await Promise.all([
          getImages(),
          getVideos(),
          getStories(),
        ]);
        if (imgs.length > 0) setImages(imgs);
        if (vids.length > 0) setVideos(vids);
        if (strs.length > 0) setStories(strs);
      } catch (err) {
        console.warn('Initial storage load notice:', err);
        try {
          const [imgs, vids, strs] = await Promise.all([
            getImages(),
            getVideos(),
            getStories(),
          ]);
          setImages(imgs);
          setVideos(vids);
          setStories(strs);
        } catch {}
      } finally {
        setIsLoading(false);
      }
    }

    loadData();

    return () => {
      unsubs.forEach((u) => u());
    };
  }, []);

  // Protected action helper
  const requireAuth = (actionTitle: string, action: () => void) => {
    if (vaultService.isUnlocked()) {
      action();
    } else {
      setPasswordActionTitle(actionTitle);
      setPendingAction(() => action);
      setIsPasswordModalOpen(true);
    }
  };

  const handlePasswordSuccess = () => {
    setIsUnlocked(true);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleToggleLock = () => {
    if (isUnlocked) {
      vaultService.lock();
      setIsUnlocked(false);
    } else {
      setPasswordActionTitle('Unlock Gallery');
      setPendingAction(null);
      setIsPasswordModalOpen(true);
    }
  };

  // Delete execution
  const executeDelete = async () => {
    if (!itemToDelete) return;
    const { id, type } = itemToDelete;

    if (type === 'Photograph') {
      await removeImage(id);
      const updated = await getImages();
      setImages(updated);
      if (selectedImageIndex !== null) setSelectedImageIndex(null);
    } else if (type === 'Video') {
      await removeVideo(id);
      const updated = await getVideos();
      setVideos(updated);
      if (selectedVideoIndex !== null) setSelectedVideoIndex(null);
    } else if (type === 'Story') {
      await removeStory(id);
      const updated = await getStories();
      setStories(updated);
      if (readingStory?.id === id) setReadingStory(null);
    }

    setItemToDelete(null);
  };

  // Handlers for Images
  const handleOpenUpload = () => {
    requireAuth(activeTab === 'videos' ? 'Upload Video' : 'Upload Photograph', () => {
      setIsUploadModalOpen(true);
    });
  };

  const handleSaveImage = async (newImage: MemoryImage) => {
    await saveImage(newImage);
    const updated = await getImages();
    setImages(updated);
  };

  const handleEditImage = (image: MemoryImage) => {
    requireAuth('Edit Photo Details', () => {
      setEditingImage(image);
    });
  };

  const handleSaveUpdatedImage = async (updated: MemoryImage) => {
    await saveImage(updated);
    const all = await getImages();
    setImages(all);
  };

  const handleDeleteImage = (id: string) => {
    const img = images.find((i) => i.id === id);
    const title = img ? img.title : 'this photo';
    requireAuth('Delete Photograph', () => {
      setItemToDelete({ id, title, type: 'Photograph' });
    });
  };

  const handleToggleFavoriteImage = async (id: string) => {
    const target = images.find((i) => i.id === id);
    if (!target) return;
    const updated = { ...target, isFavorite: !target.isFavorite };
    await saveImage(updated);
    setImages(images.map((i) => (i.id === id ? updated : i)));
  };

  // Handlers for Videos
  const handleSaveVideo = async (newVideo: MemoryVideo) => {
    await saveVideo(newVideo);
    const updated = await getVideos();
    setVideos(updated);
  };

  const handleEditVideo = (video: MemoryVideo) => {
    requireAuth('Edit Video Details', () => {
      setEditingVideo(video);
    });
  };

  const handleSaveUpdatedVideo = async (updated: MemoryVideo) => {
    await saveVideo(updated);
    const all = await getVideos();
    setVideos(all);
  };

  const handleDeleteVideo = (id: string) => {
    const vid = videos.find((v) => v.id === id);
    const title = vid ? vid.title : 'this video';
    requireAuth('Delete Video Recording', () => {
      setItemToDelete({ id, title, type: 'Video' });
    });
  };

  const handleToggleFavoriteVideo = async (id: string) => {
    const target = videos.find((v) => v.id === id);
    if (!target) return;
    const updated = { ...target, isFavorite: !target.isFavorite };
    await saveVideo(updated);
    setVideos(videos.map((v) => (v.id === id ? updated : v)));
  };

  // Handlers for Stories
  const handleOpenWriteStory = () => {
    requireAuth('Write Personal Story', () => {
      setEditingStory(null);
      setIsWriteStoryOpen(true);
    });
  };

  const handleEditStory = (story: MemoryStory) => {
    requireAuth('Edit Personal Story', () => {
      setEditingStory(story);
      setIsWriteStoryOpen(true);
    });
  };

  const handleSaveStory = async (story: MemoryStory) => {
    await saveStory(story);
    const updated = await getStories();
    setStories(updated);
    if (readingStory && readingStory.id === story.id) {
      setReadingStory(story);
    }
  };

  const handleDeleteStory = (id: string) => {
    const story = stories.find((s) => s.id === id);
    const title = story ? story.title : 'this story';
    requireAuth('Delete Personal Story', () => {
      setItemToDelete({ id, title, type: 'Story' });
    });
  };

  const handleToggleFavoriteStory = async (id: string) => {
    const target = stories.find((s) => s.id === id);
    if (!target) return;
    const updated = { ...target, isFavorite: !target.isFavorite };
    await saveStory(updated);
    setStories(stories.map((s) => (s.id === id ? updated : s)));
    if (readingStory?.id === id) setReadingStory(updated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-950 text-stone-100 selection:bg-amber-500/20 selection:text-amber-200">
      {/* Animated Opening Greetings Curtain */}
      <GreetingIntro
        isOpen={showIntro}
        onComplete={() => setShowIntro(false)}
      />

      {/* Strict 3-zone Header with 3 Tabs */}
      <Header
        activeTab={activeTab}
        isUnlocked={isUnlocked}
        onSelectTab={setActiveTab}
        onOpenUpload={handleOpenUpload}
        onOpenWriteStory={handleOpenWriteStory}
        onToggleLock={handleToggleLock}
      />

      {/* Main Content Sanctuary */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Intro Banner */}
        <div className="mb-10 text-center max-w-2xl mx-auto space-y-3">
          <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cherished Moments Sanctuary</span>
            {!isUnlocked && (
              <span className="text-[11px] font-normal text-stone-500 ml-1 flex items-center gap-1 lowercase">
                (protected)
              </span>
            )}
          </p>
          <h1 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-stone-100">
            {activeTab === 'images' && 'Every Captured Instant'}
            {activeTab === 'videos' && 'Motion & Living Sounds'}
            {activeTab === 'stories' && 'Written Heartfelt Chronicles'}
          </h1>
          <p className="leading-relaxed flex flex-col items-center gap-2 pt-1 text-center">
            <span className="font-serif-display text-sm sm:text-base text-amber-200/90 tracking-wide font-normal animate-subtle-float-1">
              Nature lover | Rain enthusiast | Greenery, silence &amp; peaceful vibes
            </span>
            <span className="font-serif-display text-sm sm:text-base text-amber-200/90 tracking-wide font-normal animate-subtle-float-2">
              Quiet by nature, but talkative when comfortable.
            </span>
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-stone-500 space-y-3">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs tracking-wide">Opening your memory archive...</p>
          </div>
        )}

        {/* Tab 1: Images */}
        {!isLoading && activeTab === 'images' && (
          <div>
            {images.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-center rounded-3xl border border-dashed border-stone-800 bg-stone-900/30 p-8">
                <div className="w-16 h-16 rounded-2xl bg-stone-800/60 flex items-center justify-center text-amber-400 mb-4">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-stone-200">No photos preserved yet</h3>
                <p className="text-xs text-stone-400 mt-1 max-w-sm">
                  Upload your personal photographs to view with Amazon-style magnifying glass lens inspection.
                </p>
                <button
                  onClick={handleOpenUpload}
                  className="mt-6 flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload Photograph</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
                {images.map((image, index) => (
                  <AmazonMagnifierCard
                    key={image.id}
                    image={image}
                    onClick={() => setSelectedImageIndex(index)}
                    onDelete={handleDeleteImage}
                    onEdit={handleEditImage}
                    onToggleFavorite={handleToggleFavoriteImage}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Videos */}
        {!isLoading && activeTab === 'videos' && (
          <div>
            {videos.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-center rounded-3xl border border-dashed border-stone-800 bg-stone-900/30 p-8">
                <div className="w-16 h-16 rounded-2xl bg-stone-800/60 flex items-center justify-center text-amber-400 mb-4">
                  <VideoIcon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-stone-200">No video memories added</h3>
                <p className="text-xs text-stone-400 mt-1 max-w-sm">
                  Upload cherished video clips from trips, gatherings, and quiet days to play and experience anytime.
                </p>
                <button
                  onClick={handleOpenUpload}
                  className="mt-6 flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload Video</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video, index) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onClick={() => setSelectedVideoIndex(index)}
                    onDelete={handleDeleteVideo}
                    onEdit={handleEditVideo}
                    onToggleFavorite={handleToggleFavoriteVideo}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Personal Stories */}
        {!isLoading && activeTab === 'stories' && (
          <div>
            {stories.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-center rounded-3xl border border-dashed border-stone-800 bg-stone-900/30 p-8">
                <div className="w-16 h-16 rounded-2xl bg-stone-800/60 flex items-center justify-center text-amber-400 mb-4">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-stone-200">No personal stories written yet</h3>
                <p className="text-xs text-stone-400 mt-1 max-w-sm">
                  Write down personal stories, funny anecdotes, or meaningful reflections to preserve forever.
                </p>
                <button
                  onClick={handleOpenWriteStory}
                  className="mt-6 flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Write First Story</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stories.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    onClick={() => setReadingStory(story)}
                    onDelete={handleDeleteStory}
                    onEdit={handleEditStory}
                    onToggleFavorite={handleToggleFavoriteStory}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="w-full py-8 border-t border-stone-900 text-center text-xs text-stone-500">
        <p>Uncropped visual preservation · Password protected</p>
      </footer>

      {/* Modals */}
      {/* 1. Amazon Magnifier Modal for Images */}
      {selectedImageIndex !== null && (
        <AmazonMagnifierModal
          images={images}
          currentIndex={selectedImageIndex}
          isOpen={selectedImageIndex !== null}
          onClose={() => setSelectedImageIndex(null)}
          onSelectIndex={(newIdx) => setSelectedImageIndex(newIdx)}
          onDelete={handleDeleteImage}
          onEdit={handleEditImage}
          onToggleFavorite={handleToggleFavoriteImage}
        />
      )}

      {/* 2. Video Theater Lightbox */}
      {selectedVideoIndex !== null && (
        <VideoLightbox
          videos={videos}
          currentIndex={selectedVideoIndex}
          isOpen={selectedVideoIndex !== null}
          onClose={() => setSelectedVideoIndex(null)}
          onSelectIndex={(newIdx) => setSelectedVideoIndex(newIdx)}
          onDelete={handleDeleteVideo}
          onEdit={handleEditVideo}
          onToggleFavorite={handleToggleFavoriteVideo}
        />
      )}

      {/* 3. Story Reader Modal */}
      <StoryReaderModal
        story={readingStory}
        isOpen={readingStory !== null}
        onClose={() => setReadingStory(null)}
        onEdit={handleEditStory}
        onDelete={handleDeleteStory}
        onToggleFavorite={handleToggleFavoriteStory}
      />

      {/* 4. Story Editor / Creator Modal */}
      <StoryEditorModal
        isOpen={isWriteStoryOpen}
        onClose={() => {
          setIsWriteStoryOpen(false);
          setEditingStory(null);
        }}
        onSave={handleSaveStory}
        initialStory={editingStory}
        availableImages={images}
      />

      {/* 5. Video Editor Modal */}
      <VideoEditorModal
        isOpen={editingVideo !== null}
        onClose={() => setEditingVideo(null)}
        video={editingVideo}
        onSave={handleSaveUpdatedVideo}
      />

      {/* 6. Photo Editor Modal */}
      <ImageEditorModal
        isOpen={editingImage !== null}
        onClose={() => setEditingImage(null)}
        image={editingImage}
        onSave={handleSaveUpdatedImage}
      />

      {/* 7. Upload Media Modal (Photo or Video) */}
      <UploadMediaModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        defaultType={activeTab === 'videos' ? 'video' : 'image'}
        onSaveImage={handleSaveImage}
        onSaveVideo={handleSaveVideo}
      />

      {/* 8. Password Security Authorization Modal */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setPendingAction(null);
        }}
        onSuccess={handlePasswordSuccess}
        actionTitle={passwordActionTitle}
      />

      {/* 9. In-App Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={executeDelete}
        title={itemToDelete?.title || ''}
        itemType={itemToDelete?.type || 'Story'}
      />
    </div>
  );
}
