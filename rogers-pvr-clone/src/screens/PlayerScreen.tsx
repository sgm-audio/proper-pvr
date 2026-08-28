import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useStorage } from '../context/StorageContext';
import { Program, Recording } from '../types';
import { format } from 'date-fns';
import { Play, Pause, SkipForward, SkipBack, Volume2, Maximize, Clock, Download, Share2, Info, X } from 'lucide-react-native';
import { Video, ResizeMode } from 'expo-av';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PlayerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors } = useTheme();
  const { markAsWatched, addToViewingHistory } = useStorage();
  
  const videoRef = useRef<Video>(null);
  const lastHistoryUpdateRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showInfo, setShowInfo] = useState(false);

  const { program, recording } = route.params || {};
  const content = recording?.program || program;

  if (!content) {
    return (
      <View style={[styles.container, { backgroundColor: '#000' }]}>
        <Text style={{ color: '#fff' }}>No content selected</Text>
      </View>
    );
  }

  const handlePlayPause = async () => {
    if (!videoRef.current) return;
    
    try {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Play/pause error:', error);
    }
  };

  const handleSeek = async (position: number) => {
    if (!videoRef.current) return;
    
    try {
      await videoRef.current.setPositionAsync(position * 1000);
    } catch (error) {
      console.error('Seek error:', error);
    }
  };

  const handleSkipForward = async () => {
    await handleSeek(progress + 30);
  };

  const handleSkipBack = async () => {
    await handleSeek(Math.max(0, progress - 10));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Mock video source - in production this would be the actual stream URL
  const videoSource = content.streamUrl || 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4';

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      {/* Video player */}
      <Video
        ref={videoRef}
        style={styles.video}
        source={{ uri: videoSource }}
        useNativeControls={false}
        resizeMode={ResizeMode.COVER}
        isLooping={false}
        onPlaybackStatusUpdate={(status) => {
          if ('isLoaded' in status && status.isLoaded) {
            setIsLoading(false);
            setProgress(status.positionMillis / 1000);
            const durationMillis = status.durationMillis || 1;
            setDuration(durationMillis / 1000);
            
            // Update viewing history (throttled to once every 10 seconds)
            if (status.positionMillis > 0) {
              const now = Date.now();
              if (now - lastHistoryUpdateRef.current >= 10000) {
                lastHistoryUpdateRef.current = now;
                const progressPercent = (status.positionMillis / durationMillis) * 100;
                if (recording) {
                  markAsWatched(recording.id, progressPercent);
                }
                addToViewingHistory(content, progressPercent, 'mobile-1');
              }
            }
          }
          
          if ('isPlaying' in status) {
            setIsPlaying(status.isPlaying);
          }
        }}
        onError={(error) => {
          console.error('Video error:', error);
          setIsLoading(false);
        }}
      />

      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.rogersRed} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {/* Controls overlay */}
      {!isLoading && showControls && (
        <>
          {/* Top bar */}
          <View style={styles.topBar}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => navigation.goBack()}
            >
              <X size={24} color="#ffffff" />
            </TouchableOpacity>
            
            <View style={styles.titleContainer}>
              <Text style={styles.titleText} numberOfLines={1}>
                {content.title}
              </Text>
              {content.genre && (
                <Text style={styles.subtitleText} numberOfLines={1}>
                  {content.genre} • {format(content.startTime, 'yyyy')}
                </Text>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => setShowInfo(!showInfo)}
            >
              <Info size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Center play button */}
          <TouchableOpacity 
            style={styles.centerPlayButton}
            onPress={handlePlayPause}
            activeOpacity={0.7}
          >
            {isPlaying ? (
              <Pause size={48} color="#ffffff" />
            ) : (
              <Play size={48} color="#ffffff" fill="#ffffff" />
            )}
          </TouchableOpacity>

          {/* Bottom controls */}
          <View style={styles.bottomControls}>
            {/* Progress bar */}
            <TouchableOpacity 
              style={styles.progressBar}
              onPress={(e) => {
                const { locationX } = e.nativeEvent;
                const seekPosition = (locationX / SCREEN_WIDTH) * duration;
                handleSeek(seekPosition);
              }}
            >
              <View style={[styles.progressTrack, { backgroundColor: '#ffffff30' }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${(progress / duration) * 100}%`,
                      backgroundColor: colors.rogersRed,
                    }
                  ]} 
                />
              </View>
            </TouchableOpacity>

            {/* Time display */}
            <View style={styles.timeDisplay}>
              <Text style={styles.timeText}>{formatTime(progress)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>

            {/* Playback controls */}
            <View style={styles.playbackControls}>
              <TouchableOpacity onPress={handleSkipBack} style={styles.controlButton}>
                <SkipBack size={28} color="#ffffff" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handlePlayPause} 
                style={[styles.playButton, { backgroundColor: colors.rogersRed }]}
              >
                {isPlaying ? (
                  <Pause size={32} color="#ffffff" />
                ) : (
                  <Play size={32} color="#ffffff" fill="#ffffff" />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleSkipForward} style={styles.controlButton}>
                <SkipForward size={28} color="#ffffff" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.controlButton}>
                <Volume2 size={24} color="#ffffff" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.controlButton}>
                <Maximize size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {/* Info panel */}
      {showInfo && (
        <View style={[styles.infoPanel, { backgroundColor: colors.card }]}>
          <View style={styles.infoHeader}>
            <Text style={[styles.infoTitle, { color: colors.foreground }]}>
              {content.title}
            </Text>
            <TouchableOpacity onPress={() => setShowInfo(false)}>
              <X size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.infoDescription, { color: colors.mutedForeground }]}>
            {content.description}
          </Text>
          
          <View style={styles.infoMeta}>
            <View style={styles.infoBadge}>
              <Clock size={16} color={colors.rogersRed} />
              <Text style={[styles.infoBadgeText, { color: colors.foreground }]}>
                {format(content.startTime, 'h:mm a')} - {format(content.endTime, 'h:mm a')}
              </Text>
            </View>
            
            {content.rating && (
              <View style={[styles.ratingBadge, { backgroundColor: colors.muted }]}>
                <Text style={[styles.ratingText, { color: colors.mutedForeground }]}>
                  {content.rating}
                </Text>
              </View>
            )}
            
            {content.isHD && (
              <View style={[styles.hdBadge, { backgroundColor: colors.muted }]}>
                <Text style={[styles.hdText, { color: colors.mutedForeground }]}>HD</Text>
              </View>
            )}
          </View>
          
          <View style={styles.infoActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => {}}
            >
              <Download size={20} color="#ffffff" />
              <Text style={styles.actionButtonText}>Download</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.accent }]}
              onPress={() => {}}
            >
              <Share2 size={20} color={colors.foreground} />
              <Text style={[styles.actionButtonText, { color: colors.foreground }]}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Tap to show/hide controls */}
      {!isLoading && (
        <TouchableOpacity 
          style={styles.touchOverlay}
          activeOpacity={1}
          onPress={() => setShowControls(!showControls)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'absolute',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000080',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 12,
    fontSize: 16,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#00000060',
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  titleText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitleText: {
    color: '#ffffff80',
    fontSize: 14,
    marginTop: 2,
  },
  centerPlayButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 50,
    backgroundColor: '#00000060',
  },
  progressBar: {
    height: 20,
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  timeDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeText: {
    color: '#ffffff',
    fontSize: 13,
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  infoPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 50,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  infoDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  infoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoBadgeText: {
    fontSize: 14,
  },
  ratingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  hdBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  hdText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
