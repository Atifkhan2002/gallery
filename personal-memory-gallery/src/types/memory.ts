export interface MemoryImage {
  id: string;
  title: string;
  caption?: string;
  url: string;
  aspect?: 'landscape' | 'portrait' | 'square';
  isFavorite?: boolean;
  createdAt?: number;
}

export interface MemoryVideo {
  id: string;
  title: string;
  caption?: string;
  url: string;
  poster?: string;
  duration?: string;
  isFavorite?: boolean;
  createdAt?: number;
}

export interface MemoryStory {
  id: string;
  title: string;
  summary: string;
  content: string;
  coverImage?: string;
  mood?: string;
  isFavorite?: boolean;
  createdAt?: number;
}

export type GalleryTab = 'images' | 'videos' | 'stories';
