export interface Channel {
  id: string;
  name: string;
  number: string;
  logo?: string;
  category: string;
  sourceType: 'cable' | 'iptv' | 'local' | 'streaming';
  streamUrl?: string;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  channelId: string;
  startTime: Date;
  endTime: Date;
  genre: string;
  rating?: string;
  season?: number;
  episode?: number;
  thumbnail?: string;
  isHD?: boolean;
  isLive?: boolean;
}

export interface Recording {
  id: string;
  programId: string;
  program: Program;
  status: 'scheduled' | 'recording' | 'completed' | 'failed' | 'expired';
  scheduledTime: Date;
  duration: number; // in minutes
  filePath?: string;
  watchedProgress: number; // 0-100 percentage
  expiresAt?: Date;
  createdAt: Date;
}

export interface RecordingSchedule {
  id: string;
  programId: string;
  program: Program;
  repeatType: 'once' | 'daily' | 'weekly' | 'weekdays' | 'new-only';
  keepUntil: 'until-space-needed' | 'one-month' | 'two-months' | 'forever';
  isActive: boolean;
  createdAt: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  preferences: UserPreferences;
  viewingHistory: ViewingHistoryItem[];
  syncedDevices: SyncedDevice[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  parentalControls: {
    enabled: boolean;
    maxRating: string;
    pin?: string;
  };
  closedCaptions: boolean;
  audioDescription: boolean;
  defaultQuality: 'auto' | '720p' | '1080p' | '4K';
}

export interface ViewingHistoryItem {
  id: string;
  programId: string;
  program: Program;
  watchedAt: Date;
  progress: number; // 0-100 percentage
  deviceId: string;
  completed: boolean;
}

export interface SyncedDevice {
  id: string;
  name: string;
  type: 'mobile' | 'tablet' | 'tv' | 'web';
  lastSyncedAt: Date;
  isActive: boolean;
}

export interface SearchQuery {
  query: string;
  filters?: {
    genre?: string;
    rating?: string;
    isHD?: boolean;
    isLive?: boolean;
    sourceType?: Channel['sourceType'][];
  };
  sortBy?: 'relevance' | 'title' | 'date' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface GuideTimeSlot {
  startTime: Date;
  endTime: Date;
  programs: Program[];
}

export interface RemoteControlAction {
  type: 'up' | 'down' | 'left' | 'right' | 'select' | 'back' | 'home' | 'menu' | 'play' | 'pause' | 'record' | 'guide' | 'info';
  timestamp: Date;
}

export type SourceProvider = {
  id: string;
  name: string;
  type: 'cable' | 'iptv' | 'plex' | 'emby' | 'jellyfin' | 'custom';
  config: Record<string, any>;
  isActive: boolean;
  channels: Channel[];
};
