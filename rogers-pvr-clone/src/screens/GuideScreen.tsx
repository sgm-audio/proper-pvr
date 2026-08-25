import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useStorage } from '../context/StorageContext';
import { Program, Channel } from '../types';
import { format } from 'date-fns';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HOURS_TO_DISPLAY = 6;
const HOUR_WIDTH = 120;
const CHANNEL_HEIGHT = 60;

interface GuideGridProps {
  onProgramSelect?: (program: Program) => void;
}

export default function GuideScreen({ onProgramSelect }: GuideGridProps) {
  const { colors } = useTheme();
  const { channels, programs } = useStorage();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  // Update current time every minute
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Generate time slots
  const timeSlots: Date[] = [];
  const now = new Date();
  now.setMinutes(0, 0, 0);
  
  for (let i = 0; i < HOURS_TO_DISPLAY; i++) {
    const slotTime = new Date(now.getTime() + i * 3600000);
    timeSlots.push(slotTime);
  }

  // Get programs for a channel
  const getProgramsForChannel = (channelId: string) => {
    return programs.filter(p => 
      p.channelId === channelId &&
      p.startTime >= timeSlots[0] &&
      p.endTime <= timeSlots[timeSlots.length - 1]
    );
  };

  // Check if program is currently airing
  const isNowAiring = (program: Program) => {
    return currentTime >= program.startTime && currentTime < program.endTime;
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return format(date, 'h:mm a');
  };

  const renderTimeHeader = () => (
    <View style={[styles.timeHeader, { backgroundColor: colors.guideHeader }]}>
      <View style={[styles.channelColumnHeader, { backgroundColor: colors.guideHeader }]} />
      <FlatList
        horizontal
        data={timeSlots}
        keyExtractor={(item) => item.toISOString()}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.timeSlotHeader, { backgroundColor: colors.guideHeader, width: HOUR_WIDTH }]}>
            <Text style={[styles.timeSlotText, { color: colors.mutedForeground }]}>
              {formatTime(item)}
            </Text>
          </View>
        )}
      />
    </View>
  );

  const renderChannelRow = ({ item: channel }: { item: Channel }) => {
    const channelPrograms = getProgramsForChannel(channel.id);
    const isSelected = selectedChannel === channel.id;

    return (
      <TouchableOpacity
        style={[styles.channelRow, { 
          backgroundColor: isSelected ? colors.accent : colors.background,
          borderColor: colors.border,
          height: CHANNEL_HEIGHT,
        }]}
        onPress={() => setSelectedChannel(channel.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.channelInfo, { width: 100, borderRightColor: colors.border }]}>
          <Text style={[styles.channelNumber, { color: colors.rogersRed }]}>{channel.number}</Text>
          <Text style={[styles.channelName, { color: colors.foreground }]} numberOfLines={2}>
            {channel.name}
          </Text>
        </View>
        
        <View style={styles.programsContainer}>
          {channelPrograms.map((program) => {
            const isNow = isNowAiring(program);
            const duration = (program.endTime.getTime() - program.startTime.getTime()) / 3600000;
            const width = duration * HOUR_WIDTH;
            
            return (
              <TouchableOpacity
                key={program.id}
                style={[
                  styles.programBlock,
                  {
                    width: width - 1,
                    backgroundColor: isNow ? colors.programNow : colors.programNext,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => {
                  setSelectedProgram(program);
                  onProgramSelect?.(program);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.programTitle, { color: '#ffffff' }]} numberOfLines={1}>
                  {program.title}
                </Text>
                <Text style={[styles.programTime, { color: '#ffffff80' }]}>
                  {formatTime(program.startTime)} - {formatTime(program.endTime)}
                </Text>
                {isNow && (
                  <View style={styles.liveBadge}>
                    <Text style={styles.liveBadgeText}>LIVE</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Current time indicator */}
      <View style={[styles.currentTimeBar, { backgroundColor: colors.rogersRed }]}>
        <Text style={styles.currentTimeText}>
          {format(currentTime, 'EEEE, MMMM d, yyyy • h:mm a')}
        </Text>
      </View>

      {/* Time header */}
      {renderTimeHeader()}

      {/* Channel grid */}
      <FlatList
        data={channels}
        keyExtractor={(item) => item.id}
        renderItem={renderChannelRow}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Selected program info */}
      {selectedProgram && (
        <View style={[styles.programInfo, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <Text style={[styles.programInfoTitle, { color: colors.foreground }]}>
            {selectedProgram.title}
          </Text>
          <Text style={[styles.programInfoDescription, { color: colors.mutedForeground }]}>
            {selectedProgram.description}
          </Text>
          <View style={styles.programInfoMeta}>
            <Text style={[styles.programInfoGenre, { color: colors.rogersRed }]}>
              {selectedProgram.genre}
            </Text>
            {selectedProgram.rating && (
              <View style={[styles.ratingBadge, { backgroundColor: colors.muted }]}>
                <Text style={[styles.ratingText, { color: colors.mutedForeground }]}>
                  {selectedProgram.rating}
                </Text>
              </View>
            )}
            {selectedProgram.isHD && (
              <View style={[styles.hdBadge, { backgroundColor: colors.muted }]}>
                <Text style={[styles.hdText, { color: colors.mutedForeground }]}>HD</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  currentTimeBar: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  currentTimeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  timeHeader: {
    flexDirection: 'row',
    paddingTop: 10,
  },
  channelColumnHeader: {
    width: 100,
    padding: 10,
  },
  timeSlotHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  timeSlotText: {
    fontSize: 12,
    fontWeight: '500',
  },
  channelRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  channelInfo: {
    padding: 10,
    justifyContent: 'center',
    borderRightWidth: 1,
  },
  channelNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  channelName: {
    fontSize: 12,
    marginTop: 4,
  },
  programsContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  programBlock: {
    padding: 8,
    borderWidth: 1,
    justifyContent: 'center',
    marginRight: 1,
  },
  programTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  programTime: {
    fontSize: 11,
    marginTop: 2,
  },
  liveBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ffffff30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  programInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  programInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  programInfoDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  programInfoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  programInfoGenre: {
    fontSize: 13,
    fontWeight: '600',
  },
  ratingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
  },
  hdBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hdText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
