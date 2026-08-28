import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useStorage } from '../context/StorageContext';
import { Program, Recording } from '../types';
import { format } from 'date-fns';
import { Play, Clock, Trash2, CheckCircle } from 'lucide-react-native';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { channels, programs, recordings, scheduleRecording } = useStorage();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Get currently airing programs
  const now = new Date();
  const currentPrograms = programs.filter(p => 
    p.startTime <= now && p.endTime > now
  );

  // Get upcoming programs in the next hour
  const upcomingPrograms = programs.filter(p => 
    p.startTime > now && p.startTime <= new Date(now.getTime() + 3600000)
  ).slice(0, 10);

  // Get completed recordings
  const completedRecordings = recordings.filter(r => r.status === 'completed');

  // Group channels by category
  const categories = ['All', ...Array.from(new Set(channels.map(c => c.category)))];

  const filteredChannels = selectedCategory === 'All' 
    ? channels 
    : channels.filter(c => c.category === selectedCategory);

  const renderSectionHeader = (title: string) => (
    <Text style={[styles.sectionHeader, { color: colors.foreground }]}>
      {title}
    </Text>
  );

  const renderProgramCard = (program: Program) => {
    const channel = channels.find(c => c.id === program.channelId);
    
    return (
      <TouchableOpacity
        key={program.id}
        style={[styles.programCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => navigation.navigate('Player', { program })}
        activeOpacity={0.7}
      >
        <View style={styles.programCardContent}>
          <View style={styles.programInfo}>
            <Text style={[styles.programTitle, { color: colors.foreground }]} numberOfLines={2}>
              {program.title}
            </Text>
            <Text style={[styles.programChannel, { color: colors.mutedForeground }]}>
              {channel?.name || 'Unknown'} • {format(program.startTime, 'h:mm a')}
            </Text>
            <View style={styles.programMeta}>
              <Text style={[styles.programGenre, { color: colors.rogersRed }]}>
                {program.genre}
              </Text>
              {program.isHD && (
                <View style={[styles.hdBadge, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.hdText, { color: colors.mutedForeground }]}>HD</Text>
                </View>
              )}
              {program.isLive && (
                <View style={styles.liveBadge}>
                  <Text style={styles.liveBadgeText}>LIVE</Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.programActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Player', { program })}
            >
              <Play size={18} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.accent }]}
              onPress={() => scheduleRecording(program)}
            >
              <Clock size={18} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderRecordingCard = (recording: Recording) => (
    <TouchableOpacity
      key={recording.id}
      style={[styles.recordingCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => navigation.navigate('Player', { recording })}
      activeOpacity={0.7}
    >
      <View style={styles.recordingContent}>
        <View style={styles.recordingInfo}>
          <Text style={[styles.recordingTitle, { color: colors.foreground }]} numberOfLines={2}>
            {recording.program.title}
          </Text>
          <Text style={[styles.recordingDate, { color: colors.mutedForeground }]}>
            Recorded {format(recording.createdAt, 'MMM d')}
          </Text>
          {recording.watchedProgress > 0 && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${recording.watchedProgress}%`,
                      backgroundColor: colors.primary,
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
                {recording.watchedProgress}% watched
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.recordingActions}>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: colors.accent }]}
            onPress={() => navigation.navigate('Player', { recording })}
          >
            <Play size={18} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: colors.destructive + '20' }]}
            onPress={() => {}}
          >
            <Trash2 size={18} color={colors.destructive} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Rogers branding */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.logoText, { color: colors.rogersRed }]}>Rogers</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Digital Cable & PVR</Text>
      </View>

      {/* Category filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              { 
                backgroundColor: selectedCategory === category ? colors.primary : colors.accent,
              }
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text 
              style={[
                styles.categoryChipText,
                { color: selectedCategory === category ? '#ffffff' : colors.foreground }
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Currently Airing */}
      {currentPrograms.length > 0 && (
        <>
          {renderSectionHeader('Currently Airing')}
          <FlatList
            horizontal
            data={currentPrograms.slice(0, 10)}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => renderProgramCard(item)}
          />
        </>
      )}

      {/* Upcoming Programs */}
      {upcomingPrograms.length > 0 && (
        <>
          {renderSectionHeader('Coming Up Next')}
          <FlatList
            horizontal
            data={upcomingPrograms}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => renderProgramCard(item)}
          />
        </>
      )}

      {/* Recent Recordings */}
      {completedRecordings.length > 0 && (
        <>
          {renderSectionHeader('Recent Recordings')}
          <View style={styles.recordingsList}>
            {completedRecordings.slice(0, 5).map(renderRecordingCard)}
          </View>
        </>
      )}

      {/* Quick Channel Access */}
      {renderSectionHeader('Quick Channel Access')}
      <View style={styles.quickChannels}>
        {filteredChannels.slice(0, 12).map((channel) => (
          <TouchableOpacity
            key={channel.id}
            style={[styles.quickChannel, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              const channelPrograms = programs.filter(p => p.channelId === channel.id);
              const currentProgram = channelPrograms.find(p => p.startTime <= now && p.endTime > now);
              if (currentProgram) {
                navigation.navigate('Player', { program: currentProgram });
              }
            }}
          >
            <Text style={[styles.quickChannelNumber, { color: colors.rogersRed }]}>
              {channel.number}
            </Text>
            <Text style={[styles.quickChannelName, { color: colors.foreground }]} numberOfLines={2}>
              {channel.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  horizontalList: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  programCard: {
    width: 280,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  programCardContent: {
    padding: 12,
  },
  programInfo: {
    marginBottom: 12,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  programChannel: {
    fontSize: 13,
    marginBottom: 8,
  },
  programMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  programGenre: {
    fontSize: 12,
    fontWeight: '600',
  },
  hdBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hdText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  liveBadge: {
    backgroundColor: '#E31837',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  programActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingsList: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  recordingCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  recordingContent: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordingInfo: {
    flex: 1,
  },
  recordingTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  recordingDate: {
    fontSize: 13,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    width: 70,
  },
  recordingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickChannels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  quickChannel: {
    width: '30%',
    margin: '1.5%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickChannelNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  quickChannelName: {
    fontSize: 11,
    textAlign: 'center',
  },
});
