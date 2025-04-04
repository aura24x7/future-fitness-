import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { userService } from '../../services/userService';
import { useTheme } from '../../theme/ThemeProvider';
import { IndividualProfileSection } from './IndividualProfileSection';

interface User {
  id: string;
  name: string;
  email?: string;
  image?: string;
  status?: string;
  goals?: string[];
  last_active?: string;
}

type GroupsNavigationProp = any;

export const GroupsSection: React.FC = () => {
  const navigation = useNavigation<GroupsNavigationProp>();
  const { colors, isDarkMode } = useTheme();
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFriends = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const currentUserId = userService.getCurrentUserId();
      if (!currentUserId) {
        setError('You must be logged in to view connections');
        setLoading(false);
        return;
      }
      
      const connections = await userService.getConnections();
      
      // Add a default status and goals for any connections that don't have them
      const enhancedConnections = connections.map((user: any) => ({
        ...user,
        status: user.status || 'Active fitness enthusiast',
        goals: user.goals || ['Weight Loss', 'Muscle Gain'],
        last_active: user.last_active || new Date().toISOString(),
      }));
      
      setFriends(enhancedConnections);
    } catch (err) {
      console.error('Error loading friends:', err);
      setError('Failed to load connections. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFriends();
    setRefreshing(false);
  };

  useEffect(() => {
    loadFriends();
  }, []);

  const handleAddFriend = () => {
    navigation.navigate('FriendSearch');
  };

  if (loading && friends.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: colors.primary }]}>
          {error}
        </Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => loadFriends()}
        >
          <Text style={[styles.retryText, { color: colors.primary }]}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDarkMode ? colors.background : '#F9FAFB' }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <TouchableOpacity
        style={styles.createGroupButton}
        onPress={handleAddFriend}
      >
        <LinearGradient
          colors={[colors.primary, colors.primary + '80']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.createGroupGradient}
        >
          <Ionicons name="person-add-outline" size={24} color="#FFFFFF" />
          <Text style={styles.createGroupText}>
            Add Friend
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {friends.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No friends found
          </Text>
          <Text style={[styles.emptySubText, { color: isDarkMode ? '#94A3B8' : '#6B7280' }]}>
            Add friends to connect and share your fitness journey
          </Text>
        </View>
      ) : (
        friends.map((friend) => (
          <IndividualProfileSection
            key={friend.id}
            profile={{
              id: friend.id,
              name: friend.name,
              image: friend.image,
              status: friend.status,
              goals: friend.goals,
            }}
            navigation={navigation}
          />
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    padding: 10,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  createGroupButton: {
    marginVertical: 16,
  },
  createGroupGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  createGroupText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
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
});
