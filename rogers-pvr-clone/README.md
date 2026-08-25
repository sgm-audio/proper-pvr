# Rogers PVR Clone - Digital Cable & PVR Interface

A React Native mobile application that replicates the Rogers Cable (formerly Shaw Cable) PVR interface for digital cable channels. Built with Expo for cross-platform iOS and Android support.

## Features

### 📺 Core Functionality
- **Interactive TV Guide Grid** - Browse channels and programs with a familiar cable-style guide
- **Live TV Playback** - Stream live content with full playback controls
- **PVR Recording System** - Schedule one-time or recurring recordings
- **Recording Management** - View, play, and manage recorded content
- **Offline Playback** - Watch downloaded recordings without internet

### 🔍 Search & Discovery
- **Voice Search** - Hands-free program search using speech recognition
- **Text Search** - Search by title, genre, channel, or description
- **Category Filtering** - Filter content by genre (Sports, Movies, News, Kids, etc.)
- **Quick Channel Access** - Fast access to favorite channels

### 🎨 User Experience
- **Dark Mode Interface** - Easy on the eyes with Rogers-inspired dark theme
- **Responsive Design** - Optimized for both phones and tablets
- **Remote Control Navigation** - Designed for seamless remote control integration
- **Smooth Animations** - Hardware-accelerated transitions

### 👤 Personalization
- **Multi-Device Sync** - Sync viewing history across all devices
- **User Profiles** - Support for multiple user profiles
- **Parental Controls** - Content restrictions by rating
- **Viewing History** - Track watched programs and resume playback

### 🔌 Extensible Architecture
- **Multiple Source Providers** - Integrate IPTV, Plex, Emby, Jellyfin, or custom sources
- **Plugin System** - Easy to add new streaming sources
- **API Ready** - Structured for backend integration

## Project Structure

```
rogers-pvr-clone/
├── App.tsx                 # Main app entry with navigation
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx      # Dashboard with featured content
│   │   ├── GuideScreen.tsx     # TV guide grid
│   │   ├── SearchScreen.tsx    # Search with voice input
│   │   ├── RecordingsScreen.tsx # Recording management
│   │   ├── SettingsScreen.tsx  # App settings
│   │   └── PlayerScreen.tsx    # Video player
│   ├── components/
│   │   └── TabBarIcon.tsx      # Navigation icons
│   ├── context/
│   │   ├── ThemeContext.tsx    # Dark/light mode
│   │   └── StorageContext.tsx  # Data persistence
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   ├── services/               # API integrations (future)
│   ├── hooks/                  # Custom React hooks (future)
│   └── utils/                  # Helper functions (future)
└── package.json
```

## Tech Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and build tools
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Screen navigation
- **AsyncStorage** - Local data persistence
- **Expo AV** - Video playback
- **Expo Speech** - Voice search
- **date-fns** - Date/time formatting
- **Lucide Icons** - Modern icon library

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
# Navigate to project directory
cd rogers-pvr-clone

# Install dependencies
npm install

# Start development server
npx expo start

# Run on specific platform
npx expo run:ios    # iOS simulator
npx expo run:android # Android emulator
```

### Building for Production

```bash
# Build iOS
eas build --platform ios

# Build Android
eas build --platform android
```

## Configuration

### Adding Custom Streaming Sources

The app is designed to integrate with various content providers. To add a new source:

1. Define the provider in `src/types/index.ts`
2. Implement the provider service in `src/services/`
3. Add channels through the StorageContext

Example provider configuration:
```typescript
const myProvider: SourceProvider = {
  id: 'my-iptv',
  name: 'My IPTV Service',
  type: 'iptv',
  config: {
    url: 'https://my-iptv-service.com',
    apiKey: 'your-api-key',
  },
  isActive: true,
  channels: [...],
};
```

### Integrating with Backend Services

The app uses mock data by default. To integrate with real services:

1. Replace mock data in `StorageContext.tsx` with API calls
2. Implement authentication in a new AuthContext
3. Add real stream URLs to Program objects

## Key Features Implementation

### TV Guide Grid
- Horizontal time slots (6 hours visible)
- Vertical channel list
- Current program highlighting
- Program details on selection

### Recording System
- One-time recordings
- Recurring schedules (daily, weekly, weekdays, new episodes)
- Retention policies (until space needed, 1 month, 2 months, forever)
- Recording status tracking (scheduled, recording, completed, expired)

### Video Player
- Play/pause controls
- Seek bar with time display
- Skip forward/backward (30s/10s)
- Volume control
- Fullscreen toggle
- Closed captions support
- Audio description support

### Multi-Device Sync
- Viewing history synchronization
- Preferences sync
- Recording schedule sync
- Conflict resolution

## Future Enhancements

- [ ] Real backend API integration
- [ ] Live pause and rewind (DVR functionality)
- [ ] Cloud DVR storage
- [ ] Advanced parental controls with PIN
- [ ] Picture-in-picture playback
- [ ] Chromecast/AirPlay support
- [ ] Downloaded content DRM protection
- [ ] Social features (watch parties, recommendations)
- [ ] Analytics and viewing insights
- [ ] Push notifications for upcoming programs

## License

This is a demonstration project for educational purposes. Rogers and related trademarks are property of Rogers Communications.

## Contributing

This project demonstrates PVR interface patterns and can be extended with real streaming integrations. Feel free to fork and customize for your needs.
