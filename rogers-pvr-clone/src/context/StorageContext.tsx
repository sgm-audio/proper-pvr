import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Channel, Program, Recording, RecordingSchedule, UserProfile, SourceProvider } from '../types';

interface StorageContextType {
  // Channels & Programs
  channels: Channel[];
  programs: Program[];
  sourceProviders: SourceProvider[];
  
  // Recordings
  recordings: Recording[];
  recordingSchedules: RecordingSchedule[];
  
  // User & Sync
  userProfile: UserProfile | null;
  viewingHistory: any[];
  
  // Actions
  addChannel: (channel: Channel) => void;
  addSourceProvider: (provider: SourceProvider) => void;
  scheduleRecording: (program: Program, repeatType?: RecordingSchedule['repeatType']) => void;
  cancelRecording: (recordingId: string) => void;
  deleteRecording: (recordingId: string) => void;
  markAsWatched: (recordingId: string, progress: number) => void;
  addToViewingHistory: (program: Program, progress: number, deviceId: string) => void;
  syncData: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

// Mock data for demonstration
const mockChannels: Channel[] = [
  { id: '1', name: 'CBC Toronto', number: '2', category: 'News', sourceType: 'cable' },
  { id: '2', name: 'CTV Toronto', number: '3', category: 'News', sourceType: 'cable' },
  { id: '3', name: 'Global TV', number: '4', category: 'Entertainment', sourceType: 'cable' },
  { id: '4', name: 'Citytv', number: '5', category: 'Entertainment', sourceType: 'cable' },
  { id: '5', name: 'TSN', number: '30', category: 'Sports', sourceType: 'cable' },
  { id: '6', name: 'Sportsnet', number: '31', category: 'Sports', sourceType: 'cable' },
  { id: '7', name: 'HBO Canada', number: '50', category: 'Movies', sourceType: 'cable' },
  { id: '8', name: 'Showcase', number: '51', category: 'Entertainment', sourceType: 'cable' },
  { id: '9', name: 'Food Network', number: '60', category: 'Lifestyle', sourceType: 'cable' },
  { id: '10', name: 'HGTV', number: '61', category: 'Lifestyle', sourceType: 'cable' },
  { id: '11', name: 'Cartoon Network', number: '70', category: 'Kids', sourceType: 'cable' },
  { id: '12', name: 'Disney Channel', number: '71', category: 'Kids', sourceType: 'cable' },
  { id: '13', name: 'CNN', number: '100', category: 'News', sourceType: 'iptv' },
  { id: '14', name: 'BBC World', number: '101', category: 'News', sourceType: 'iptv' },
  { id: '15', name: 'Discovery', number: '120', category: 'Documentary', sourceType: 'cable' },
];

const generateMockPrograms = (): Program[] => {
  const programs: Program[] = [];
  const now = new Date();
  const genres = ['News', 'Drama', 'Comedy', 'Sports', 'Movie', 'Documentary', 'Reality'];
  
  mockChannels.forEach((channel, channelIndex) => {
    for (let i = -2; i < 20; i++) {
      const startTime = new Date(now.getTime() + i * 3600000);
      const endTime = new Date(startTime.getTime() + 3600000);
      const genre = genres[Math.floor(Math.random() * genres.length)];
      
      programs.push({
        id: `prog-${channel.id}-${i}`,
        title: `${genre} Program ${Math.abs(i)} on ${channel.name}`,
        description: `This is a sample ${genre.toLowerCase()} program airing on ${channel.name}. Great entertainment for the whole family!`,
        channelId: channel.id,
        startTime,
        endTime,
        genre,
        rating: ['G', 'PG', '14+', '18+'][Math.floor(Math.random() * 4)],
        season: Math.floor(Math.random() * 10) + 1,
        episode: Math.floor(Math.random() * 20) + 1,
        isHD: Math.random() > 0.3,
        isLive: i === 0 || i === -1,
      });
    }
  });
  
  return programs;
};

export function StorageProvider({ children }: { children: ReactNode }) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [sourceProviders, setSourceProviders] = useState<SourceProvider[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [recordingSchedules, setRecordingSchedules] = useState<RecordingSchedule[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [viewingHistory, setViewingHistory] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Try to load from AsyncStorage
      const storedChannels = await AsyncStorage.getItem('channels');
      const storedPrograms = await AsyncStorage.getItem('programs');
      const storedProviders = await AsyncStorage.getItem('sourceProviders');
      const storedRecordings = await AsyncStorage.getItem('recordings');
      const storedSchedules = await AsyncStorage.getItem('recordingSchedules');
      const storedProfile = await AsyncStorage.getItem('userProfile');
      const storedHistory = await AsyncStorage.getItem('viewingHistory');

      if (storedChannels) {
        setChannels(JSON.parse(storedChannels));
      } else {
        setChannels(mockChannels);
        await AsyncStorage.setItem('channels', JSON.stringify(mockChannels));
      }

      if (storedPrograms) {
        setPrograms(JSON.parse(storedPrograms).map((p: any) => ({
          ...p,
          startTime: new Date(p.startTime),
          endTime: new Date(p.endTime),
        })));
      } else {
        const mockProgs = generateMockPrograms();
        setPrograms(mockProgs);
        await AsyncStorage.setItem('programs', JSON.stringify(mockProgs));
      }

      if (storedProviders) {
        setSourceProviders(JSON.parse(storedProviders));
      }

      if (storedRecordings) {
        setRecordings(JSON.parse(storedRecordings).map((r: any) => ({
          ...r,
          scheduledTime: new Date(r.scheduledTime),
          createdAt: new Date(r.createdAt),
        })));
      }

      if (storedSchedules) {
        setRecordingSchedules(JSON.parse(storedSchedules).map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
        })));
      }

      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
      } else {
        // Create default profile
        const defaultProfile: UserProfile = {
          id: 'user-1',
          name: 'Viewer',
          preferences: {
            theme: 'dark',
            language: 'en',
            parentalControls: { enabled: false, maxRating: '14+' },
            closedCaptions: false,
            audioDescription: false,
            defaultQuality: 'auto',
          },
          viewingHistory: [],
          syncedDevices: [],
        };
        setUserProfile(defaultProfile);
        await AsyncStorage.setItem('userProfile', JSON.stringify(defaultProfile));
      }

      if (storedHistory) {
        setViewingHistory(JSON.parse(storedHistory).map((h: any) => ({
          ...h,
          watchedAt: new Date(h.watchedAt),
        })));
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to mock data
      setChannels(mockChannels);
      setPrograms(generateMockPrograms());
      setIsInitialized(true);
    }
  };

  const saveData = async (key: string, data: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };

  const addChannel = (channel: Channel) => {
    const newChannels = [...channels, channel];
    setChannels(newChannels);
    saveData('channels', newChannels);
  };

  const addSourceProvider = (provider: SourceProvider) => {
    const newProviders = [...sourceProviders, provider];
    setSourceProviders(newProviders);
    saveData('sourceProviders', newProviders);
    
    // Add provider's channels
    provider.channels.forEach(channel => addChannel(channel));
  };

  const scheduleRecording = (program: Program, repeatType: RecordingSchedule['repeatType'] = 'once') => {
    const schedule: RecordingSchedule = {
      id: `schedule-${Date.now()}`,
      programId: program.id,
      program,
      repeatType,
      keepUntil: 'until-space-needed',
      isActive: true,
      createdAt: new Date(),
    };

    const newSchedules = [...recordingSchedules, schedule];
    setRecordingSchedules(newSchedules);
    saveData('recordingSchedules', newSchedules);

    // Create initial recording
    const recording: Recording = {
      id: `rec-${Date.now()}`,
      programId: program.id,
      program,
      status: 'scheduled',
      scheduledTime: program.startTime,
      duration: (program.endTime.getTime() - program.startTime.getTime()) / 60000,
      watchedProgress: 0,
      createdAt: new Date(),
    };

    const newRecordings = [...recordings, recording];
    setRecordings(newRecordings);
    saveData('recordings', newRecordings);
  };

  const cancelRecording = (recordingId: string) => {
    const newRecordings = recordings.filter(r => r.id !== recordingId);
    setRecordings(newRecordings);
    saveData('recordings', newRecordings);
  };

  const deleteRecording = (recordingId: string) => {
    const newRecordings = recordings.filter(r => r.id !== recordingId);
    setRecordings(newRecordings);
    saveData('recordings', newRecordings);
  };

  const markAsWatched = (recordingId: string, progress: number) => {
    const newRecordings = recordings.map(r => 
      r.id === recordingId 
        ? { ...r, watchedProgress: progress }
        : r
    );
    setRecordings(newRecordings);
    saveData('recordings', newRecordings);
  };

  const addToViewingHistory = (program: Program, progress: number, deviceId: string) => {
    const historyItem = {
      id: `history-${Date.now()}`,
      programId: program.id,
      program,
      watchedAt: new Date(),
      progress,
      deviceId,
      completed: progress >= 90,
    };

    const newHistory = [historyItem, ...viewingHistory].slice(0, 100); // Keep last 100 items
    setViewingHistory(newHistory);
    saveData('viewingHistory', newHistory);
  };

  const syncData = async () => {
    // Placeholder for multi-device sync
    // In production, this would sync with a cloud service
    console.log('Syncing data across devices...');
    // Simulate sync delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Sync complete!');
  };

  const clearAllData = async () => {
    try {
      await AsyncStorage.removeItem('channels');
      await AsyncStorage.removeItem('programs');
      await AsyncStorage.removeItem('sourceProviders');
      await AsyncStorage.removeItem('recordings');
      await AsyncStorage.removeItem('recordingSchedules');
      await AsyncStorage.removeItem('userProfile');
      await AsyncStorage.removeItem('viewingHistory');
      // Reload with defaults
      loadData();
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  return (
    <StorageContext.Provider value={{
      channels,
      programs,
      sourceProviders,
      recordings,
      recordingSchedules,
      userProfile,
      viewingHistory,
      addChannel,
      addSourceProvider,
      scheduleRecording,
      cancelRecording,
      deleteRecording,
      markAsWatched,
      addToViewingHistory,
      syncData,
      clearAllData,
    }}>
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (context === undefined) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
}
