import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useStorage } from '../context/StorageContext';
import { Moon, Sun, Monitor, Wifi, HardDrive, User, Bell, Lock, Globe, Volume2, Tv } from 'lucide-react-native';

export default function SettingsScreen() {
  const { isDark, theme, setTheme, colors } = useTheme();
  const { userProfile, syncData, clearAllData } = useStorage();
  const [closedCaptions, setClosedCaptions] = useState(false);
  const [audioDescription, setAudioDescription] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [parentalControls, setParentalControls] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  const handleSync = async () => {
    Alert.alert(
      'Sync Devices',
      'This will sync your viewing history and preferences across all devices.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sync Now', onPress: syncData },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all recordings, schedules, and preferences. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: clearAllData
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement 
  }: { 
    icon: React.ReactNode; 
    title: string; 
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.settingIcon, { backgroundColor: colors.accent }]}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.foreground }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: colors.mutedForeground }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement || (onPress && (
        <View style={styles.settingChevron}>
          <Text style={{ color: colors.mutedForeground, fontSize: 18 }}>›</Text>
        </View>
      ))}
    </TouchableOpacity>
  );

  const ToggleSetting = ({
    icon,
    title,
    subtitle,
    value,
    onValueChange,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.settingIcon, { backgroundColor: colors.accent }]}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.foreground }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: colors.mutedForeground }]}>
            {subtitle}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.muted, true: colors.rogersRed }}
        thumbColor="#ffffff"
      />
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
          <User size={24} color="#ffffff" />
        </View>
        <Text style={[styles.userName, { color: colors.foreground }]}>
          {userProfile?.name || 'Viewer'}
        </Text>
        <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>
          Digital Cable & PVR
        </Text>
      </View>

      {/* Appearance */}
      <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>APPEARANCE</Text>
      
      <SettingItem
        icon={<Moon size={20} color={colors.foreground} />}
        title="Dark Mode"
        subtitle={theme === 'dark' ? 'Enabled' : theme === 'light' ? 'Disabled' : 'Auto'}
        onPress={() => {
          const themes: Array<'light' | 'dark' | 'auto'> = ['dark', 'light', 'auto'];
          const currentIndex = themes.indexOf(theme);
          setTheme(themes[(currentIndex + 1) % themes.length]);
        }}
      />

      {/* Playback */}
      <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>PLAYBACK</Text>
      
      <ToggleSetting
        icon={<Volume2 size={20} color={colors.foreground} />}
        title="Closed Captions"
        subtitle="Show subtitles when available"
        value={closedCaptions}
        onValueChange={setClosedCaptions}
      />
      
      <ToggleSetting
        icon={<Volume2 size={20} color={colors.foreground} />}
        title="Audio Description"
        subtitle="Narration for visually impaired"
        value={audioDescription}
        onValueChange={setAudioDescription}
      />

      <SettingItem
        icon={<Tv size={20} color={colors.foreground} />}
        title="Video Quality"
        subtitle="Auto (Recommended)"
        onPress={() => {}}
      />

      {/* Notifications */}
      <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>NOTIFICATIONS</Text>
      
      <ToggleSetting
        icon={<Bell size={20} color={colors.foreground} />}
        title="Push Notifications"
        subtitle="Get notified about new episodes and recordings"
        value={notifications}
        onValueChange={setNotifications}
      />

      {/* Parental Controls */}
      <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>PARENTAL CONTROLS</Text>
      
      <ToggleSetting
        icon={<Lock size={20} color={colors.foreground} />}
        title="Parental Controls"
        subtitle="Restrict content by rating"
        value={parentalControls}
        onValueChange={setParentalControls}
      />
      
      {parentalControls && (
        <SettingItem
          icon={<Lock size={20} color={colors.foreground} />}
          title="Maximum Rating"
          subtitle="14+"
          onPress={() => {}}
        />
      )}

      {/* Sync & Storage */}
      <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>SYNC & STORAGE</Text>
      
      <SettingItem
        icon={<Wifi size={20} color={colors.foreground} />}
        title="Sync Devices"
        subtitle="Sync viewing history across devices"
        onPress={handleSync}
      />
      
      <ToggleSetting
        icon={<Wifi size={20} color={colors.foreground} />}
        title="Auto-Sync"
        subtitle="Automatically sync when on Wi-Fi"
        value={autoSync}
        onValueChange={setAutoSync}
      />
      
      <SettingItem
        icon={<HardDrive size={20} color={colors.foreground} />}
        title="Storage"
        subtitle="2.5 GB used of 500 GB"
        onPress={() => {}}
      />

      {/* About */}
      <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>ABOUT</Text>
      
      <SettingItem
        icon={<Monitor size={20} color={colors.foreground} />}
        title="App Version"
        subtitle="1.0.0"
      />
      
      <SettingItem
        icon={<Globe size={20} color={colors.foreground} />}
        title="Language"
        subtitle="English"
        onPress={() => {}}
      />

      {/* Danger Zone */}
      <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>DATA MANAGEMENT</Text>
      
      <TouchableOpacity
        style={[styles.dangerButton, { backgroundColor: colors.destructive + '20', borderColor: colors.destructive }]}
        onPress={handleClearData}
      >
        <Text style={[styles.dangerButtonText, { color: colors.destructive }]}>
          Clear All Data
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
  },
  settingChevron: {
    paddingLeft: 12,
  },
  dangerButton: {
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
