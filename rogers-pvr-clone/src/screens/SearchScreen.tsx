import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useStorage } from '../context/StorageContext';
import { Program, Channel } from '../types';
import { Search, Mic, Filter, X } from 'lucide-react-native';
import * as Speech from 'expo-speech';

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { programs, channels } = useStorage();
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [searchResults, setSearchResults] = useState<Program[]>([]);

  const filters = ['All', 'Movies', 'Sports', 'News', 'Entertainment', 'Kids', 'Documentary', 'Lifestyle'];

  // Perform search
  React.useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = programs.filter(p => 
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.genre.toLowerCase().includes(query)
    );

    if (selectedFilter !== 'All') {
      const filtered = results.filter(p => 
        p.genre.toLowerCase().includes(selectedFilter.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults(results);
    }
  }, [searchQuery, selectedFilter, programs]);

  // Voice search
  const handleVoiceSearch = async () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    
    try {
      // In production, you would use a proper speech-to-text service
      // For now, we'll simulate with expo-speech speaking a prompt
      await Speech.speak('What would you like to watch?', { language: 'en' });
      
      // Simulate voice input (in production, this would be actual speech recognition)
      setTimeout(() => {
        setSearchQuery('news');
        setIsListening(false);
      }, 2000);
    } catch (error) {
      console.error('Voice search error:', error);
      setIsListening(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const renderResultItem = ({ item }: { item: Program }) => {
    const channel = channels.find(c => c.id === item.channelId);
    
    return (
      <TouchableOpacity
        style={[styles.resultItem, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => navigation.navigate('Player', { program: item })}
        activeOpacity={0.7}
      >
        <View style={styles.resultContent}>
          <View style={styles.resultInfo}>
            <Text style={[styles.resultTitle, { color: colors.foreground }]} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={[styles.resultChannel, { color: colors.mutedForeground }]}>
              {channel?.name} • {item.genre}
            </Text>
            <View style={styles.resultMeta}>
              {item.rating && (
                <View style={[styles.ratingBadge, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.ratingText, { color: colors.mutedForeground }]}>
                    {item.rating}
                  </Text>
                </View>
              )}
              {item.isHD && (
                <View style={[styles.hdBadge, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.hdText, { color: colors.mutedForeground }]}>HD</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderQuickChannel = (channel: Channel) => (
    <TouchableOpacity
      key={channel.id}
      style={[styles.quickChannel, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => {
        const channelPrograms = programs.filter(p => p.channelId === channel.id);
        const currentProgram = channelPrograms.find(
          p => p.startTime <= new Date() && p.endTime > new Date()
        );
        if (currentProgram) {
          navigation.navigate('Player', { program: currentProgram });
        }
      }}
    >
      <Text style={[styles.quickChannelNumber, { color: colors.rogersRed }]}>
        {channel.number}
      </Text>
      <Text style={[styles.quickChannelName, { color: colors.foreground }]} numberOfLines={1}>
        {channel.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search header */}
      <View style={[styles.searchHeader, { backgroundColor: colors.card }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.accent, borderColor: colors.border }]}>
          <Search size={20} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search channels, shows, movies..."
            placeholderTextColor={colors.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={[styles.voiceButton, { 
            backgroundColor: isListening ? colors.rogersRed : colors.accent,
            borderColor: isListening ? colors.rogersRed : colors.border,
          }]}
          onPress={handleVoiceSearch}
        >
          <Mic size={20} color={isListening ? '#ffffff' : colors.rogersRed} />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <FlatList
        horizontal
        data={filters}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              { 
                backgroundColor: selectedFilter === item ? colors.primary : colors.accent,
                borderColor: colors.border,
              }
            ]}
            onPress={() => setSelectedFilter(item)}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: selectedFilter === item ? '#ffffff' : colors.foreground }
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Search results or quick access */}
      {searchResults.length > 0 ? (
        <>
          <View style={styles.resultsHeader}>
            <Text style={[styles.resultsCount, { color: colors.mutedForeground }]}>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
            </Text>
          </View>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.resultsList}
            renderItem={renderResultItem}
          />
        </>
      ) : searchQuery.length === 0 ? (
        <>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Quick Channel Access
            </Text>
          </View>
          <View style={styles.quickChannelsGrid}>
            {channels.slice(0, 9).map(renderQuickChannel)}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Popular Searches
            </Text>
          </View>
          <View style={styles.popularTags}>
            {['Sports', 'Movies', 'News', 'Kids', 'HBO', 'TSN', 'Discovery'].map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[styles.popularTag, { backgroundColor: colors.accent, borderColor: colors.border }]}
                onPress={() => setSearchQuery(tag.toLowerCase())}
              >
                <Text style={[styles.popularTagText, { color: colors.foreground }]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Search size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            No results found for "{searchQuery}"
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.mutedForeground }]}>
            Try different keywords or filters
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  voiceButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 14,
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  resultItem: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  resultContent: {
    padding: 12,
  },
  resultInfo: {
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultChannel: {
    fontSize: 13,
    marginBottom: 8,
  },
  resultMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 11,
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
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quickChannelsGrid: {
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
  popularTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  popularTag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  popularTagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
