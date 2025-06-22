import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { FileItem } from '@/components/file-grid/file-card';

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'auto';
  customTheme?: Theme;
  sidebarWidth: number;
  gridSize: 'small' | 'medium' | 'large';
  autoPlay: boolean;
  showThumbnails: boolean;
  enableAnimations: boolean;
  keyboardShortcuts: boolean;
  defaultView: 'grid' | 'list';
  autoSave: boolean;
  backupEnabled: boolean;
  thumbnailQuality: 'low' | 'medium' | 'high';
  gridColumns: number;
  showFileExtensions: boolean;
  showFileSizes: boolean;
  enableHoverPreview: boolean;
  videoAutoPlay: boolean;
  videoVolume: number;
  imageTransitions: boolean;
  enableGestures: boolean;
  doubleClickAction: 'open' | 'preview' | 'select';
}

export interface VideoClip {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  tags: string[];
  fileId: string;
  fileName: string;
  thumbnail?: string;
  createdAt: Date;
  description?: string;
  rating?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  children?: Category[];
  isExpanded?: boolean;
  color?: string;
  description?: string;
  rules?: string[];
}

export interface SearchFilter {
  type: 'text' | 'date' | 'size' | 'tag' | 'category';
  field: string;
  operator: 'contains' | 'equals' | 'greater' | 'less' | 'between';
  value: any;
}

export interface AppState {
  // Files and Media
  files: FileItem[];
  selectedFiles: Set<string>;
  favoriteClips: VideoClip[];
  
  // Categories and Organization
  categories: Category[];
  tags: string[];
  
  // Search and Filtering
  searchQuery: string;
  searchFilters: SearchFilter[];
  searchHistory: string[];
  
  // UI State
  selectedCategoryId: string;
  viewMode: 'grid' | 'list';
  sortBy: 'name' | 'date' | 'size' | 'type' | 'rating';
  sortOrder: 'asc' | 'desc';
  
  // User Preferences
  preferences: UserPreferences;
  
  // Performance and Analytics
  analytics: {
    totalFiles: number;
    totalSize: number;
    mostUsedTags: string[];
    recentActivity: any[];
  };
  
  // Actions
  setFiles: (files: FileItem[]) => void;
  addFiles: (files: FileItem[]) => void;
  updateFile: (id: string, updates: Partial<FileItem>) => void;
  deleteFiles: (ids: string[]) => void;
  
  toggleFileSelection: (id: string) => void;
  selectAllFiles: () => void;
  clearSelection: () => void;
  
  toggleFavorite: (id: string) => void;
  addFavoriteClip: (clip: Omit<VideoClip, 'id' | 'createdAt'>) => void;
  updateFavoriteClip: (id: string, updates: Partial<VideoClip>) => void;
  deleteFavoriteClip: (id: string) => void;
  
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  autoCategorizeBySingers: () => void;
  autoCategorizeByContent: () => void;
  
  setSearchQuery: (query: string) => void;
  addSearchFilter: (filter: SearchFilter) => void;
  removeSearchFilter: (index: number) => void;
  clearSearchFilters: () => void;
  
  setSelectedCategoryId: (id: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setSortBy: (sortBy: 'name' | 'date' | 'size' | 'type' | 'rating') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  
  // Batch Operations
  batchUpdateFiles: (ids: string[], updates: Partial<FileItem>) => void;
  batchDeleteFiles: (ids: string[]) => void;
  batchAddTags: (ids: string[], tags: string[]) => void;
  batchRemoveTags: (ids: string[], tags: string[]) => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'dark',
  sidebarWidth: 280,
  gridSize: 'medium',
  autoPlay: false,
  showThumbnails: true,
  enableAnimations: true,
  keyboardShortcuts: true,
  defaultView: 'grid',
  autoSave: true,
  backupEnabled: true,
  thumbnailQuality: 'medium',
  gridColumns: 4,
  showFileExtensions: true,
  showFileSizes: true,
  enableHoverPreview: true,
  videoAutoPlay: false,
  videoVolume: 0.8,
  imageTransitions: true,
  enableGestures: true,
  doubleClickAction: 'open',
};

// Sample data with proper thumbnails and video files
const sampleFiles: FileItem[] = [
  {
    id: '1',
    name: 'Arijit Singh - Tum Hi Ho.mp4',
    type: 'video',
    size: 45678912,
    duration: 240,
    thumbnail: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
    createdAt: new Date('2024-01-15'),
    modifiedAt: new Date('2024-01-15'),
    isFavorite: true,
    tags: ['music', 'bollywood', 'arijit singh'],
    metadata: {
      width: 1920,
      height: 1080,
      resolution: '1080p',
      codec: 'H.264',
      bitrate: '2.5 Mbps'
    }
  },
  {
    id: '2',
    name: 'Nature Documentary 4K.mp4',
    type: 'video',
    size: 1234567890,
    duration: 3600,
    thumbnail: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
    createdAt: new Date('2024-01-10'),
    modifiedAt: new Date('2024-01-12'),
    isFavorite: false,
    tags: ['nature', 'documentary', '4k'],
    metadata: {
      width: 3840,
      height: 2160,
      resolution: '4K',
      codec: 'H.265',
      bitrate: '15 Mbps'
    }
  },
  {
    id: '3',
    name: 'Sunset Landscape.jpg',
    type: 'image',
    size: 5432109,
    thumbnail: 'https://images.pexels.com/photos/358482/pexels-photo-358482.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
    createdAt: new Date('2024-01-08'),
    modifiedAt: new Date('2024-01-08'),
    isFavorite: true,
    tags: ['landscape', 'sunset', 'photography'],
    metadata: {
      width: 4000,
      height: 3000,
      resolution: '4000x3000'
    }
  },
  {
    id: '4',
    name: 'Mountain View.jpg',
    type: 'image',
    size: 3456789,
    thumbnail: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
    createdAt: new Date('2024-01-07'),
    modifiedAt: new Date('2024-01-07'),
    isFavorite: false,
    tags: ['mountain', 'landscape', 'nature'],
    metadata: {
      width: 3000,
      height: 2000,
      resolution: '3000x2000'
    }
  },
  {
    id: '5',
    name: 'Ocean Waves.jpg',
    type: 'image',
    size: 4567890,
    thumbnail: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
    createdAt: new Date('2024-01-06'),
    modifiedAt: new Date('2024-01-06'),
    isFavorite: true,
    tags: ['ocean', 'waves', 'nature'],
    metadata: {
      width: 3500,
      height: 2500,
      resolution: '3500x2500'
    }
  },
  {
    id: '6',
    name: 'City Lights.jpg',
    type: 'image',
    size: 2345678,
    thumbnail: 'https://images.pexels.com/photos/1519088/pexels-photo-1519088.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
    createdAt: new Date('2024-01-05'),
    modifiedAt: new Date('2024-01-05'),
    isFavorite: false,
    tags: ['city', 'lights', 'urban'],
    metadata: {
      width: 2800,
      height: 1800,
      resolution: '2800x1800'
    }
  },
  {
    id: '7',
    name: 'Arijit Singh - Agar Tum Saath Ho.mp3',
    type: 'audio',
    size: 8765432,
    duration: 280,
    thumbnail: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
    createdAt: new Date('2024-01-05'),
    modifiedAt: new Date('2024-01-05'),
    isFavorite: false,
    tags: ['music', 'bollywood', 'arijit singh', 'audio'],
    metadata: {
      bitrate: '320 kbps'
    }
  },
  {
    id: '8',
    name: 'Project Report.pdf',
    type: 'document',
    size: 2345678,
    thumbnail: 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpg?auto=compress&cs=tinysrgb&w=400&h=300',
    createdAt: new Date('2024-01-03'),
    modifiedAt: new Date('2024-01-03'),
    isFavorite: false,
    tags: ['document', 'report', 'work']
  },
  {
    id: '9',
    name: 'Shreya Ghoshal - Deewani Mastani.mp4',
    type: 'video',
    size: 67890123,
    duration: 320,
    thumbnail: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
    createdAt: new Date('2024-01-20'),
    modifiedAt: new Date('2024-01-20'),
    isFavorite: true,
    tags: ['music', 'bollywood', 'shreya ghoshal'],
    metadata: {
      width: 1920,
      height: 1080,
      resolution: '1080p',
      codec: 'H.264',
      bitrate: '3.0 Mbps'
    }
  },
  {
    id: '10',
    name: 'Rahat Fateh Ali Khan - Zaroori Tha.mp4',
    type: 'video',
    size: 89012345,
    duration: 290,
    thumbnail: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
    createdAt: new Date('2024-01-18'),
    modifiedAt: new Date('2024-01-18'),
    isFavorite: false,
    tags: ['music', 'sufi', 'rahat fateh ali khan'],
    metadata: {
      width: 1920,
      height: 1080,
      resolution: '1080p',
      codec: 'H.264',
      bitrate: '2.8 Mbps'
    }
  }
];

export const useAppStore = create<AppState>()(
  immer((set, get) => ({
    // Initial State with sample data
    files: sampleFiles,
    selectedFiles: new Set(),
    favoriteClips: [],
    categories: [],
    tags: ['music', 'bollywood', 'nature', 'documentary', '4k', 'landscape', 'photography', 'audio', 'document', 'work', 'mountain', 'ocean', 'waves', 'city', 'lights', 'urban', 'arijit singh', 'shreya ghoshal', 'rahat fateh ali khan', 'sufi'],
    searchQuery: '',
    searchFilters: [],
    searchHistory: [],
    selectedCategoryId: 'all',
    viewMode: 'grid',
    sortBy: 'name',
    sortOrder: 'asc',
    preferences: defaultPreferences,
    analytics: {
      totalFiles: sampleFiles.length,
      totalSize: sampleFiles.reduce((sum, file) => sum + file.size, 0),
      mostUsedTags: ['music', 'bollywood', 'nature'],
      recentActivity: [],
    },

    // File Actions
    setFiles: (files) => set((state) => {
      state.files = files;
      state.analytics.totalFiles = files.length;
      state.analytics.totalSize = files.reduce((sum, file) => sum + file.size, 0);
    }),

    addFiles: (files) => set((state) => {
      state.files.push(...files);
      state.analytics.totalFiles = state.files.length;
      state.analytics.totalSize = state.files.reduce((sum, file) => sum + file.size, 0);
    }),

    updateFile: (id, updates) => set((state) => {
      const index = state.files.findIndex(f => f.id === id);
      if (index !== -1) {
        Object.assign(state.files[index], updates);
      }
    }),

    deleteFiles: (ids) => set((state) => {
      state.files = state.files.filter(f => !ids.includes(f.id));
      state.selectedFiles = new Set([...state.selectedFiles].filter(id => !ids.includes(id)));
      state.analytics.totalFiles = state.files.length;
      state.analytics.totalSize = state.files.reduce((sum, file) => sum + file.size, 0);
    }),

    // Selection Actions
    toggleFileSelection: (id) => set((state) => {
      if (state.selectedFiles.has(id)) {
        state.selectedFiles.delete(id);
      } else {
        state.selectedFiles.add(id);
      }
    }),

    selectAllFiles: () => set((state) => {
      state.selectedFiles = new Set(state.files.map(f => f.id));
    }),

    clearSelection: () => set((state) => {
      state.selectedFiles.clear();
    }),

    // Favorite Actions
    toggleFavorite: (id) => set((state) => {
      const file = state.files.find(f => f.id === id);
      if (file) {
        file.isFavorite = !file.isFavorite;
      }
    }),

    addFavoriteClip: (clip) => set((state) => {
      const newClip: VideoClip = {
        ...clip,
        id: Date.now().toString(),
        createdAt: new Date()
      };
      state.favoriteClips.push(newClip);
    }),

    updateFavoriteClip: (id, updates) => set((state) => {
      const index = state.favoriteClips.findIndex(c => c.id === id);
      if (index !== -1) {
        Object.assign(state.favoriteClips[index], updates);
      }
    }),

    deleteFavoriteClip: (id) => set((state) => {
      state.favoriteClips = state.favoriteClips.filter(c => c.id !== id);
    }),

    // Category Actions
    addCategory: (category) => set((state) => {
      const newCategory: Category = {
        ...category,
        id: Date.now().toString()
      };
      state.categories.push(newCategory);
    }),

    updateCategory: (id, updates) => set((state) => {
      const index = state.categories.findIndex(c => c.id === id);
      if (index !== -1) {
        Object.assign(state.categories[index], updates);
      }
    }),

    deleteCategory: (id) => set((state) => {
      state.categories = state.categories.filter(c => c.id !== id);
    }),

    autoCategorizeBySingers: () => set((state) => {
      const singers = new Set<string>();
      
      state.files.forEach(file => {
        const name = file.name.toLowerCase();
        const commonSingers = [
          'arijit singh',
          'shreya ghoshal',
          'rahat fateh ali khan',
          'atif aslam',
          'kishore kumar',
          'lata mangeshkar',
          'mohd rafi',
          'sonu nigam'
        ];

        commonSingers.forEach(singer => {
          if (name.includes(singer)) {
            singers.add(singer);
          }
        });
      });

      singers.forEach(singer => {
        const matchingFiles = state.files.filter(file =>
          file.name.toLowerCase().includes(singer) ||
          file.tags.some(tag => tag.toLowerCase().includes(singer))
        );

        const categoryName = singer.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');

        const newCategory: Category = {
          id: Date.now().toString() + singer,
          name: categoryName,
          icon: 'music',
          count: matchingFiles.length,
          color: '#3b82f6',
          rules: [singer]
        };

        state.categories.push(newCategory);
      });
    }),

    autoCategorizeByContent: () => set((state) => {
      const contentTypes = new Map<string, FileItem[]>();
      
      state.files.forEach(file => {
        const type = file.type;
        if (!contentTypes.has(type)) {
          contentTypes.set(type, []);
        }
        contentTypes.get(type)!.push(file);
      });

      contentTypes.forEach((files, type) => {
        const categoryName = type.charAt(0).toUpperCase() + type.slice(1) + 's';
        const newCategory: Category = {
          id: Date.now().toString() + type,
          name: categoryName,
          icon: type,
          count: files.length,
          color: type === 'video' ? '#ef4444' : type === 'image' ? '#10b981' : type === 'audio' ? '#f59e0b' : '#6366f1',
          rules: [type]
        };

        state.categories.push(newCategory);
      });
    }),

    // Search Actions
    setSearchQuery: (query) => set((state) => {
      state.searchQuery = query;
      if (query && !state.searchHistory.includes(query)) {
        state.searchHistory.unshift(query);
        state.searchHistory = state.searchHistory.slice(0, 10);
      }
    }),

    addSearchFilter: (filter) => set((state) => {
      state.searchFilters.push(filter);
    }),

    removeSearchFilter: (index) => set((state) => {
      state.searchFilters.splice(index, 1);
    }),

    clearSearchFilters: () => set((state) => {
      state.searchFilters = [];
    }),

    // UI Actions
    setSelectedCategoryId: (id) => set((state) => {
      state.selectedCategoryId = id;
    }),

    setViewMode: (mode) => set((state) => {
      state.viewMode = mode;
    }),

    setSortBy: (sortBy) => set((state) => {
      state.sortBy = sortBy;
    }),

    setSortOrder: (order) => set((state) => {
      state.sortOrder = order;
    }),

    updatePreferences: (preferences) => set((state) => {
      Object.assign(state.preferences, preferences);
    }),

    // Batch Operations
    batchUpdateFiles: (ids, updates) => set((state) => {
      ids.forEach(id => {
        const index = state.files.findIndex(f => f.id === id);
        if (index !== -1) {
          Object.assign(state.files[index], updates);
        }
      });
    }),

    batchDeleteFiles: (ids) => set((state) => {
      state.files = state.files.filter(f => !ids.includes(f.id));
      state.selectedFiles = new Set([...state.selectedFiles].filter(id => !ids.includes(id)));
    }),

    batchAddTags: (ids, tags) => set((state) => {
      ids.forEach(id => {
        const file = state.files.find(f => f.id === id);
        if (file) {
          file.tags = [...new Set([...file.tags, ...tags])];
        }
      });
      
      // Update global tags
      state.tags = [...new Set([...state.tags, ...tags])];
    }),

    batchRemoveTags: (ids, tags) => set((state) => {
      ids.forEach(id => {
        const file = state.files.find(f => f.id === id);
        if (file) {
          file.tags = file.tags.filter(tag => !tags.includes(tag));
        }
      });
    }),
  }))
);