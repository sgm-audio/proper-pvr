import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useStorage } from '../context/StorageContext';
import { Recording } from '../types';
import { format } from 'date-fns';
import { Play, Trash2, Clock, Calendar, HardDrive, CheckCircle } from 'lucide-react-native';

export default function RecordingsScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { recordings, recordingSchedules, deleteRecording, cancelRecording } = useStorage();
  const [activeTab, setActiveTab] = useState<'recordings' | 'scheduled'>('recordings');

  const completedRecordings = recordings.filter(r => r.status === 'completed');
  const scheduledRecordings = recordings.filter(r => r.status === 'scheduled');
  const activeSchedules = recordingSchedules.filter(s => s.isActive);

  const handleDeleteRecording = (recording: Recording) => {
    Alert.alert(
      'Delete Recording',
      `Are you sure you want to delete "${recording.program.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteRecording(recording.id)
        },
      ]
    );
  };

  const handleCancelSchedule = (scheduleId: string) => {
    Alert.alert(
      'Cancel Recording Schedule',
      'Are you sure you want to cancel this scheduled recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Cancel Schedule', 
          style: 'destructive',
          onPress: () => cancelRecording(scheduleId)
        },
      ]
    );
  };

  const renderRecordingItem = ({ item }: { item: Recording }) => (
    <TouchableOpacity
      style={[styles.recordingCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => navigation.navigate('Player', { recording: item })}
      activeOpacity={0.7}
    >
      <View style={styles.recordingContent}>
        <View style={styles.recordingInfo}>
          <Text style={[styles.recordingTitle, { color: colors.foreground }]} numberOfLines={2}>
            {item.program.title}
          </Text>
          <Text style={[styles.recordingChannel, { color: colors.mutedForeground }]}>
            {item.program.genre} • {format(item.scheduledTime, 'MMM d, yyyy')}
          </Text>
          
          {/* Progress bar */}
          {item.watchedProgress > 0 && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${item.watchedProgress}%`,
                      backgroundColor: colors.primary,
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
                {item.watchedProgress}% watched
              </Text>
            </View>
          )}

          {/* Expiration info */}
          {item.expiresAt && (
            <View style={styles.expirationInfo}>
              <Calendar size={14} color={colors.mutedForeground} />
              <Text style={[styles.expirationText, { color: colors.mutedForeground }]}>
                Expires {format(item.expiresAt, 'MMM d')}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.recordingActions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Player', { recording: item })}
          >
            <Play size={18} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.destructive + '20' }]}
            onPress={() => handleDeleteRecording(item)}
          >
            <Trash2 size={18} color={colors.destructive} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderScheduledItem = ({ item }: { item: Recording }) => (
    <TouchableOpacity
      style={[styles.scheduledCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.7}
    >
      <View style={styles.scheduledContent}>
        <View style={styles.scheduledInfo}>
          <Text style={[styles.scheduledTitle, { color: colors.foreground }]} numberOfLines={2}>
            {item.program.title}
          </Text>
          <Text style={[styles.scheduledTime, { color: colors.mutedForeground }]}>
            {format(item.scheduledTime, 'EEEE, MMM d • h:mm a')}
          </Text>
          <View style={styles.scheduleBadge}>
            <Clock size={14} color={colors.rogersRed} />
            <Text style={[styles.scheduledStatus, { color: colors.rogersRed }]}>
              Scheduled
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.cancelButton, { backgroundColor: colors.accent }]}
          onPress={() => handleCancelSchedule(item.id)}
        >
          <Text style={[styles.cancelButtonText, { color: colors.foreground }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderScheduleItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.scheduleCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.7}
    >
      <View style={styles.scheduleContent}>
        <View style={styles.scheduleInfo}>
          <Text style={[styles.scheduleTitle, { color: colors.foreground }]} numberOfLines={2}>
            {item.program.title}
          </Text>
          <View style={styles.scheduleMeta}>
            <View style={styles.scheduleBadge}>
              <Calendar size={14} color={colors.mutedForeground} />
              <Text style={[styles.scheduleRepeat, { color: colors.mutedForeground }]}>
                {item.repeatType === 'once' ? 'One time' : 
                 item.repeatType === 'daily' ? 'Daily' :
                 item.repeatType === 'weekly' ? 'Weekly' :
                 item.repeatType === 'weekdays' ? 'Weekdays' : 'New episodes only'}
              </Text>
            </View>
            <View style={styles.scheduleBadge}>
              <HardDrive size={14} color={colors.mutedForeground} />
              <Text style={[styles.scheduleKeep, { color: colors.mutedForeground }]}>
                Keep: {item.keepUntil.replace(/-/g, ' ')}
              </Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.cancelButton, { backgroundColor: colors.accent }]}
          onPress={() => handleCancelSchedule(item.id)}
        >
          <Text style={[styles.cancelButtonText, { color: colors.foreground }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Tab selector */}
      <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            { borderBottomColor: activeTab === 'recordings' ? colors.rogersRed : 'transparent' }
          ]}
          onPress={() => setActiveTab('recordings')}
        >
          <Text 
            style={[
              styles.tabText,
              { 
                color: activeTab === 'recordings' ? colors.rogersRed : colors.mutedForeground 
              }
            ]}
          >
            Recordings ({completedRecordings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            { borderBottomColor: activeTab === 'scheduled' ? colors.rogersRed : 'transparent' }
          ]}
          onPress={() => setActiveTab('scheduled')}
        >
          <Text 
            style={[
              styles.tabText,
              { 
                color: activeTab === 'scheduled' ? colors.rogersRed : colors.mutedForeground 
              }
            ]}
          >
            Scheduled ({scheduledRecordings.length + activeSchedules.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'recordings' ? (
        completedRecordings.length > 0 ? (
          <FlatList
            data={completedRecordings}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.listContent}
            renderItem={renderRecordingItem}
          />
        ) : (
          <View style={styles.emptyState}>
            <HardDrive size={64} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No Recordings Yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Recordings will appear here once they're complete.
              Go to the TV Guide to schedule recordings.
            </Text>
          </View>
        )
      ) : (
        <>
          {scheduledRecordings.length > 0 && (
            <>
              <Text style={[styles.sectionHeader, { color: colors.foreground }]}>
                Upcoming Recordings
              </Text>
              <FlatList
                data={scheduledRecordings}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={styles.listContent}
                renderItem={renderScheduledItem}
              />
            </>
          )}
          
          {activeSchedules.length > 0 && (
            <>
              <Text style={[styles.sectionHeader, { color: colors.foreground }]}>
                Recording Schedules
              </Text>
              <FlatList
                data={activeSchedules}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.listContent}
                renderItem={renderScheduleItem}
              />
            </>
          )}

          {scheduledRecordings.length === 0 && activeSchedules.length === 0 && (
            <View style={styles.emptyState}>
              <Calendar size={64} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                No Scheduled Recordings
              </Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Schedule recordings from the TV Guide or program details.
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
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
  recordingChannel: {
    fontSize: 13,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
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
  expirationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expirationText: {
    fontSize: 12,
  },
  recordingActions: {
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
  scheduledCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  scheduledContent: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scheduledInfo: {
    flex: 1,
  },
  scheduledTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  scheduledTime: {
    fontSize: 13,
    marginBottom: 8,
  },
  scheduleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scheduledStatus: {
    fontSize: 13,
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scheduleCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  scheduleContent: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  scheduleMeta: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  scheduleRepeat: {
    fontSize: 12,
  },
  scheduleKeep: {
    fontSize: 12,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});
