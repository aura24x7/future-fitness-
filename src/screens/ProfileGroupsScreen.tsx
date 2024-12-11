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
import { GroupsSection } from '../components/ProfileGroups/GroupsSection';

const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
}

const ProfileGroupsScreen: React.FC<Props> = ({ navigation }) => {
  const { state: { individuals, groups }, fetchIndividuals, fetchGroups } = useProfileGroups();
  const { state: alertState } = useGymBuddyAlert();
  const { colors, isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [scrollX] = useState(new Animated.Value(0));

  const fetchData = useCallback(async () => {
    await Promise.all([fetchIndividuals(), fetchGroups()]);
  }, [fetchIndividuals, fetchGroups]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabPress = (index: number) => {
    setActiveTab(index);
    scrollX.setValue(index * width);
  };

  const translateX = scrollX.interpolate({
    inputRange: [0, width],
    outputRange: [0, width / 2],
  });

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
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => handleTabPress(0)}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 0 ? colors.primary : colors.textSecondary },
            ]}
          >
            {getSectionTitle('Individuals', individuals.data)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => handleTabPress(1)}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 1 ? colors.primary : colors.textSecondary },
            ]}
          >
            {getSectionTitle('Groups', groups.data)}
          </Text>
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.tabIndicator,
            {
              backgroundColor: colors.primary,
              transform: [{ translateX }],
            },
          ]}
        />
      </View>

      {/* Add User Button */}
      {activeTab === 0 && (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('AddIndividual')}
        >
          <Ionicons name="person-add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Individual</Text>
        </TouchableOpacity>
      )}

      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        style={[styles.scrollView, { backgroundColor: colors.background }]}
      >
        <View style={[styles.page, { width }]}>
          <ScrollView>
            {individuals.data?.map((profile) => (
              <IndividualProfileSection 
                key={profile.id} 
                profile={profile}
                navigation={navigation}
              />
            ))}
          </ScrollView>
        </View>
        <View style={[styles.page, { width }]}>
          <GroupsSection />
        </View>
      </Animated.ScrollView>
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
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    position: 'relative',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  tabButton: {
    flex: 1,
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
    width: '50%',
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
});

export default ProfileGroupsScreen;
