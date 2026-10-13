import { MemoryImage, MemoryVideo, MemoryStory } from '../types/memory';
import { db, handleFirestoreError, OperationType, testFirestoreConnection } from '../lib/firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore';

import mountainSunrise from '../assets/images/memory_mountain_sunrise_1791777553364.jpg';
import coastalWalk from '../assets/images/memory_coastal_walk_1791777565895.jpg';
import familyCoffee from '../assets/images/memory_family_coffee_1791777578346.jpg';
import starlitNight from '../assets/images/memory_starlit_night_1791777590351.jpg';

const DB_NAME = 'PersonalMemoryGalleryDB';
const DB_VERSION = 1;

const STORES = {
  IMAGES: 'images',
  VIDEOS: 'videos',
  STORIES: 'stories',
};

export const DEFAULT_IMAGES: MemoryImage[] = [
  {
    id: 'default-img-1',
    title: 'Sunrise Reflections at Emerald Basin',
    caption: 'Waking up before dawn to witness golden morning light spill through the mist over mirror-calm mountain waters.',
    url: mountainSunrise,
    aspect: 'landscape',
    createdAt: 4000,
  },
  {
    id: 'default-img-2',
    title: 'The Wooden Boardwalk to the Pacific',
    caption: 'The smell of coastal salt air and wild dune blossoms on the walk down to an endless open horizon.',
    url: coastalWalk,
    aspect: 'landscape',
    createdAt: 3000,
  },
  {
    id: 'default-img-3',
    title: 'Morning Solitude & Steaming Coffee',
    caption: 'Quiet hours spent journaling with fresh garden herbs and lavender drying beside the open sunlit window.',
    url: familyCoffee,
    aspect: 'landscape',
    createdAt: 2000,
  },
  {
    id: 'default-img-4',
    title: 'Night Sky Over the Pine Valley Cabin',
    caption: 'Far from city lights, sitting by the quiet porch looking up into the luminous arc of the Milky Way.',
    url: starlitNight,
    aspect: 'landscape',
    createdAt: 1000,
  },
];

export const DEFAULT_VIDEOS: MemoryVideo[] = [
  {
    id: 'default-vid-1',
    title: 'Golden Hour Waves & Coastline Rhythm',
    caption: 'Watching the rolling swells catch evening warmth along the secluded western shoreline.',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    poster: coastalWalk,
    duration: '0:15',
    createdAt: 3000,
  },
  {
    id: 'default-vid-2',
    title: 'Alpine Breeze Through Mountain Pines',
    caption: 'Gentle wind rustling high-altitude evergreens on a warm summer afternoon hike.',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: mountainSunrise,
    duration: '0:15',
    createdAt: 2000,
  },
  {
    id: 'default-vid-3',
    title: 'Starlight Time-lapse & Campfire Glow',
    caption: 'A quiet evening around embers as constellations drift silently above the timberline.',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    poster: starlitNight,
    duration: '0:15',
    createdAt: 1000,
  },
];

export const DEFAULT_STORIES: MemoryStory[] = [
  {
    id: 'default-story-1',
    title: 'The Unplanned Turn on the Old Highway',
    summary: 'How getting lost on a rainy detour led us to the most peaceful hidden apple orchard and a life lesson about serendipity.',
    mood: 'Nostalgia',
    coverImage: coastalWalk,
    createdAt: 3000,
    content: `We were never supposed to take Highway 17. The navigation insisted on the bypass, but a sudden flash of headlights and rain had forced us off the exit. With little phone reception and twilight falling fast, we followed a narrow gravel road flanked by mossy cedar fences.

Just around the bend, the rain eased into a luminous mist. Tucked behind a row of towering cypress trees was an old wooden farmstand lit with vintage incandescent bulbs. An elderly couple was still tending wooden crates of honeycrisp apples and warm spiced cider.

We sat on the bench beneath the cedar awning for almost an hour, sharing stories about long road trips and listening to the raindrops drip from the eaves. It reminded me that the most unforgettable memories are rarely the ones you carefully plan—they are the gentle accidents you welcome with an open heart.`,
  },
  {
    id: 'default-story-2',
    title: 'Coffee in the Silent Hours',
    summary: 'A tribute to the sacred silence of dawn before the household stirs, and the gratitude found in simple rituals.',
    mood: 'Peaceful',
    coverImage: familyCoffee,
    createdAt: 2000,
    content: `There is a particular kind of silence that only exists between 5:30 and 6:30 in the morning. The world hasn't quite decided to begin its hurried routine, and the birds are just testing out their first tentative calls.

I boil water in the copper kettle, grind dark beans by hand, and watch steam curl up against the cool glass windowpane. In this room, there are no unread notifications, no deadlines clamoring for attention—only the warmth of the ceramic mug in both palms.

Years from now, when I look back at my life, I know it won't just be the monumental milestones I hold dear. It will be these quiet, unglamorous mornings of peace, where I felt entirely at home with myself and the universe.`,
  },
  {
    id: 'default-story-3',
    title: 'The Valley Under Countless Stars',
    summary: 'Looking up at the Milky Way from a wooden porch in the Rockies, realizing how small and yet how deeply connected we all are.',
    mood: 'Wonder',
    coverImage: starlitNight,
    createdAt: 1000,
    content: `We turned off every lantern in the cabin. Within five minutes, our eyes adjusted, and what seemed like an empty black ceiling blossomed into an overwhelming cathedral of light.

The dust clouds of the Milky Way spanned from horizon to horizon, mirrored softly in the still surface of the glacial tarn below. You could hear the faint whisper of a mountain stream a half-mile away and the crack of pine bark cooling down in the brisk night air.

Standing there in thick woolen socks and a worn flannel shirt, shivering slightly from the cold mountain draft, all worries felt insignificant. In the grand cosmic theater, we are tiny observers granted a brief, glorious glimpse of eternity.`,
  },
];

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(STORES.IMAGES)) {
        dbInstance.createObjectStore(STORES.IMAGES, { keyPath: 'id' });
      }
      if (!dbInstance.objectStoreNames.contains(STORES.VIDEOS)) {
        dbInstance.createObjectStore(STORES.VIDEOS, { keyPath: 'id' });
      }
      if (!dbInstance.objectStoreNames.contains(STORES.STORIES)) {
        dbInstance.createObjectStore(STORES.STORIES, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAllFromStore<T>(dbInstance: IDBDatabase, storeName: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const transaction = dbInstance.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

function putIntoStore<T>(dbInstance: IDBDatabase, storeName: string, item: T): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = dbInstance.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function deleteFromStore(dbInstance: IDBDatabase, storeName: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = dbInstance.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function initStorage(): Promise<void> {
  await testFirestoreConnection();

  try {
    // Check if Firestore already has images
    const snap = await getDocs(collection(db, 'images'));
    if (snap.empty) {
      // Seed initial defaults to Firestore on first launch
      for (const img of DEFAULT_IMAGES) {
        await setDoc(doc(db, 'images', img.id), img);
      }
      for (const vid of DEFAULT_VIDEOS) {
        await setDoc(doc(db, 'videos', vid.id), vid);
      }
      for (const story of DEFAULT_STORIES) {
        await setDoc(doc(db, 'stories', story.id), story);
      }
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'initStorage');
  }
}

// Public API with Cloud Firestore Sync & Offline Cache Fallback
export async function getImages(): Promise<MemoryImage[]> {
  try {
    const q = query(collection(db, 'images'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const items: MemoryImage[] = [];
      snap.forEach((d) => items.push(d.data() as MemoryImage));
      return items;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'images');
  }

  // Fallback to local storage if offline
  try {
    const idb = await openDB();
    const items = await getAllFromStore<MemoryImage>(idb, STORES.IMAGES);
    return items.length > 0 ? items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)) : DEFAULT_IMAGES;
  } catch {
    return DEFAULT_IMAGES;
  }
}

export async function saveImage(image: MemoryImage): Promise<void> {
  const toSave: MemoryImage = {
    ...image,
    createdAt: image.createdAt || Date.now(),
  };

  try {
    await setDoc(doc(db, 'images', toSave.id), toSave);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `images/${toSave.id}`);
  }

  try {
    const idb = await openDB();
    await putIntoStore(idb, STORES.IMAGES, toSave);
  } catch {}
}

export async function removeImage(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'images', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `images/${id}`);
  }

  try {
    const idb = await openDB();
    await deleteFromStore(idb, STORES.IMAGES, id);
  } catch {}
}

export async function getVideos(): Promise<MemoryVideo[]> {
  try {
    const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const items: MemoryVideo[] = [];
      snap.forEach((d) => items.push(d.data() as MemoryVideo));
      return items;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'videos');
  }

  try {
    const idb = await openDB();
    const items = await getAllFromStore<MemoryVideo>(idb, STORES.VIDEOS);
    return items.length > 0 ? items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)) : DEFAULT_VIDEOS;
  } catch {
    return DEFAULT_VIDEOS;
  }
}

export async function saveVideo(video: MemoryVideo): Promise<void> {
  const toSave: MemoryVideo = {
    ...video,
    createdAt: video.createdAt || Date.now(),
  };

  try {
    await setDoc(doc(db, 'videos', toSave.id), toSave);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `videos/${toSave.id}`);
  }

  try {
    const idb = await openDB();
    await putIntoStore(idb, STORES.VIDEOS, toSave);
  } catch {}
}

export async function removeVideo(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'videos', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `videos/${id}`);
  }

  try {
    const idb = await openDB();
    await deleteFromStore(idb, STORES.VIDEOS, id);
  } catch {}
}

export async function getStories(): Promise<MemoryStory[]> {
  try {
    const q = query(collection(db, 'stories'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const items: MemoryStory[] = [];
      snap.forEach((d) => items.push(d.data() as MemoryStory));
      return items;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'stories');
  }

  try {
    const idb = await openDB();
    const items = await getAllFromStore<MemoryStory>(idb, STORES.STORIES);
    return items.length > 0 ? items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)) : DEFAULT_STORIES;
  } catch {
    return DEFAULT_STORIES;
  }
}

export async function saveStory(story: MemoryStory): Promise<void> {
  const toSave: MemoryStory = {
    ...story,
    createdAt: story.createdAt || Date.now(),
  };

  try {
    await setDoc(doc(db, 'stories', toSave.id), toSave);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `stories/${toSave.id}`);
  }

  try {
    const idb = await openDB();
    await putIntoStore(idb, STORES.STORIES, toSave);
  } catch {}
}

export async function removeStory(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'stories', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `stories/${id}`);
  }

  try {
    const idb = await openDB();
    await deleteFromStore(idb, STORES.STORIES, id);
  } catch {}
}

export function subscribeToImages(onUpdate: (images: MemoryImage[]) => void): () => void {
  const q = query(collection(db, 'images'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const items: MemoryImage[] = [];
      snap.forEach((d) => items.push(d.data() as MemoryImage));
      onUpdate(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'images');
    }
  );
}

export function subscribeToVideos(onUpdate: (videos: MemoryVideo[]) => void): () => void {
  const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const items: MemoryVideo[] = [];
      snap.forEach((d) => items.push(d.data() as MemoryVideo));
      onUpdate(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'videos');
    }
  );
}

export function subscribeToStories(onUpdate: (stories: MemoryStory[]) => void): () => void {
  const q = query(collection(db, 'stories'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const items: MemoryStory[] = [];
      snap.forEach((d) => items.push(d.data() as MemoryStory));
      onUpdate(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'stories');
    }
  );
}
