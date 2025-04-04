import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { userService, UserData } from '../services/userService';
import { useTheme } from '../theme/ThemeProvider';

const FriendSearchScreen: React.FC = ({ navigation }: any) => {
  const { colors, isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserData[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch suggested users on component mount
  useEffect(() => {
    loadSuggestedUsers();
  }, []);
  
  const loadSuggestedUsers = async () => {
    try {
      setSuggestionsLoading(true);
      // In a real app, this would be an API call to get suggested users
      // For now, we're just simulating a delay
      setTimeout(() => {
        setSuggestedUsers([
          {
            id: 'suggestion1',
            name: 'Jane Smith',
            username: 'janesmith',
            status: 'Fitness enthusiast',
            goals: ['Weight Loss', 'Muscle Gain']
          },
          {
            id: 'suggestion2',
            name: 'Robert Johnson',
            username: 'rjohnson',
            status: 'Running coach',
            goals: ['Marathon Training']
          },
          {
            id: 'suggestion3',
            name: 'Maria Garcia',
            username: 'yogamaria',
            status: 'Yoga instructor',
            goals: ['Flexibility', 'Mindfulness']
          }
        ]);
        setSuggestionsLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error loading suggested users:', err);
      setSuggestionsLoading(false);
    }
  };
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const results = await userService.findUserByUsername(searchQuery.trim());
      if (results) {
        setSearchResults([results]);
      } else {
        setSearchResults([]);
        setError('No user found with that username');
      }
    } catch (err) {
      setError('Error searching for user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddFriend = async (userId: string) => {
    try {
      const currentUserId = userService.getCurrentUserId();
      
      // Instead of directly adding, we send a connection request
      await userService.sendConnectionRequest(currentUserId, userId);
      Alert.alert('Success', 'Friend request sent successfully!');
      
      // Update the UI to reflect the sent request
      setSearchResults(prevResults => 
        prevResults.map(user => 
          user.id === userId ? { ...user, requestSent: true } : user
        )
      );
      
      setSuggestedUsers(prevSuggestions => 
        prevSuggestions.map(user => 
          user.id === userId ? { ...user, requestSent: true } : user
        )
      );
    } catch (err) {
      let errorMessage = 'Failed to send connection request';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      Alert.alert('Error', errorMessage);
      console.error(err);
    }
  };

  const renderUserItem = ({ item }: { item: UserData & { requestSent?: boolean } }) => (
    <View style={[styles.resultCard, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
      <View style={styles.userInfo}>
        <View style={[styles.userInitial, { backgroundColor: colors.primary }]}>
          <Text style={styles.initialText}>{item.name?.charAt(0) || '?'}</Text>
        </View>
        <View>
          <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.userUsername, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
            @{item.username || 'username'}
          </Text>
          {item.status && <Text style={[styles.userStatus, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>{item.status}</Text>}
          {item.goals && item.goals.length > 0 && (
            <View style={styles.goalContainer}>
              {item.goals.map((goal, index) => (
                <View 
                  key={index} 
                  style={[styles.goalBadge, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}
                >
                  <Text style={[styles.goalText, { color: isDarkMode ? '#E5E7EB' : '#4B5563' }]}>
                    {goal}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
      {item.requestSent ? (
        <View style={[styles.requestSent, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}>
          <Text style={[styles.requestSentText, { color: isDarkMode ? '#E5E7EB' : '#4B5563' }]}>
            Request Sent
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => handleAddFriend(item.id)}
        >
          <Ionicons name="person-add" size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      )}
    </View>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? colors.background : '#F9FAFB' }]}>
      <View style={styles.searchSection}>
        <View style={[styles.searchContainer, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}>
          <Ionicons name="search" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by username"
            placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: colors.primary }]}
          onPress={handleSearch}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
      
      {/* Button to view connection requests */}
      <TouchableOpacity
        style={[styles.viewRequestsButton, { 
          backgroundColor: 'transparent',
          borderColor: colors.primary,
          borderWidth: 1
        }]}
        onPress={() => navigation.navigate('ConnectionRequests')}
      >
        <Ionicons name="people-outline" size={18} color={colors.primary} />
        <Text style={[styles.viewRequestsText, { color: colors.primary }]}>View Connection Requests</Text>
      </TouchableOpacity>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : searchQuery.length > 0 && error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.primary }]}>{error}</Text>
        </View>
      ) : searchQuery.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !loading && !error ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.text }]}>No results found</Text>
                <Text style={[styles.emptySubText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                  Try a different username
                </Text>
              </View>
            ) : null
          }
        />
      ) : (
        <View style={styles.suggestionsContainer}>
          <Text style={[styles.suggestionsTitle, { color: colors.text }]}>
            Suggested Users
          </Text>
          {suggestionsLoading ? (
            <ActivityIndicator size="small" color={colors.primary} style={styles.suggestionsLoading} />
          ) : (
            <FlatList
              data={suggestedUsers}
              keyExtractor={(item) => item.id}
              renderItem={renderUserItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: colors.text }]}>No suggestions available</Text>
                </View>
              }
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 44,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  searchButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  viewRequestsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  viewRequestsText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  listContent: {
    paddingTop: 8,
  },
  resultCard: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  userInitial: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  initialText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    marginBottom: 2,
  },
  userStatus: {
    fontSize: 14,
    marginBottom: 6,
  },
  goalContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  goalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  goalText: {
    fontSize: 12,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  requestSent: {
    padding: 8,
    borderRadius: 8,
  },
  requestSentText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
  },
  suggestionsContainer: {
    flex: 1,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  suggestionsLoading: {
    marginTop: 24,
  },
});

export default FriendSearchScreen; 