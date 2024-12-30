import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfileGroups } from '../contexts/ProfileGroupsContext';
import { useGymBuddyAlert } from '../contexts/GymBuddyAlertContext';
import { useTheme } from '../theme/ThemeProvider';
import { IndividualProfileSection } from '../components/ProfileGroups/IndividualProfileSection';

const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
}

const ProfileGroupsScreen: React.FC<Props> = ({ navigation }) => {
  const { state: { individuals }, fetchIndividuals } = useProfileGroups();
  const { state: alertState } = useGymBuddyAlert();
  const { colors, isDarkMode } = useTheme();

  const fetchData = useCallback(async () => {
    await fetchIndividuals();
  }, [fetchIndividuals]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getSectionTitle = (title: string, items: any[]) => {
    const pendingAlertCount = alertState.receivedAlerts.filter(
      alert => 
        alert.status === 'pending' && 
        items.some(item => item.id === alert.senderId)
    ).length;

    return pendingAlertCount > 0 
      ? `${title} (${pendingAlertCount} new alerts)`
      : title;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Social</Text>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => navigation.navigate('AddIndividual')}
        >
          <Ionicons name="search-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <View style={styles.tabButton}>
          <Text style={[styles.tabText, { color: colors.primary }]}>
            {getSectionTitle('Individuals', individuals.data)}
          </Text>
        </View>
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              backgroundColor: colors.primary,
              width: '100%',
            },
          ]}
        />
      </View>

      {/* Add User Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddIndividual')}
      >
        <Ionicons name="person-add" size={20} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add Individual</Text>
      </TouchableOpacity>

      <ScrollView style={[styles.scrollView, { backgroundColor: colors.background }]}>
        <View style={[styles.page, { width }]}>
          {individuals.data?.map((profile) => (
            <IndividualProfileSection 
              key={profile.id} 
              profile={profile}
              navigation={navigation}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  tabContainer: {
    position: 'relative',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  tabButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
  },
  scrollView: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  searchButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
});

export default ProfileGroupsScreen;
