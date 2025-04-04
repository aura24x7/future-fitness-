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
import { useSocial } from '../../context/SocialContext';
import { useTheme } from '../../theme/ThemeProvider';
import { IndividualProfileSection } from './IndividualProfileSection';
import { User } from '../../types/social';

type IndividualsNavigationProp = any;

export const IndividualsSection: React.FC = () => {
  const navigation = useNavigation<IndividualsNavigationProp>();
  const { colors, isDarkMode } = useTheme();
  const { state, fetchIndividuals, addIndividual } = useSocial();
  const [refreshing, setRefreshing] = useState(false);

  const { data: friends, loading, error } = state.individuals;

  const enhancedFriends = friends.map(friend => ({
    ...friend,
    status: friend.status || 'Active fitness enthusiast',
    goals: friend.goals || ['Weight Loss', 'Muscle Gain'],
  }));

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchIndividuals();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchIndividuals();
  }, [fetchIndividuals]);

  const handleAddFriend = () => {
    // In a real implementation, this would open a screen to search and add friends
    Alert.alert(
      'Add Friend',
      'Enter your friend\'s email or username',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Add',
          onPress: () => {
            // In a real implementation, this would search for a user and add them
            // For now, we'll just mock the addition of a new friend
            const mockUserId = Date.now().toString();
            addIndividual(mockUserId)
              .then(() => {
                Alert.alert('Success', 'Friend added successfully!');
              })
              .catch(error => {
                console.error('Error adding friend:', error);
                Alert.alert('Error', 'Failed to add friend. Please try again.');
              });
          },
        },
      ],
    );
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
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error}
        </Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => fetchIndividuals()}
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
        style={styles.addFriendButton}
        onPress={handleAddFriend}
      >
        <LinearGradient
          colors={[colors.primary, colors.primary + '80']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.addFriendGradient}
        >
          <Ionicons name="person-add-outline" size={24} color="#FFFFFF" />
          <Text style={styles.addFriendText}>
            Add Friend
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {enhancedFriends.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No friends found
          </Text>
          <Text style={[styles.emptySubText, { color: isDarkMode ? '#94A3B8' : '#6B7280' }]}>
            Add friends to connect and share your fitness journey
          </Text>
        </View>
      ) : (
        enhancedFriends.map((friend) => (
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
  addFriendButton: {
    marginVertical: 16,
  },
  addFriendGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  addFriendText: {
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