import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import { IndividualProfileSection } from '../components/ProfileGroups/IndividualProfileSection';
import { GroupsSection } from '../components/ProfileGroups/GroupsSection';
import { useProfileGroups } from '../contexts/ProfileGroupsContext';
import { useGymBuddyAlert } from '../contexts/GymBuddyAlertContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../theme/ThemeProvider';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileGroups'>;

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
      <View style={[styles.header, { 
        backgroundColor: colors.cardBackground,
        borderBottomColor: colors.border 
      }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Social</Text>
        <View style={styles.tabContainer}>
          <Animated.View
            style={[
              styles.tabIndicator,
              {
                transform: [{ translateX }],
                backgroundColor: colors.primary,
              },
            ]}
          />
          <TouchableOpacity
            style={[styles.tab, activeTab === 0 && styles.activeTab]}
            onPress={() => handleTabPress(0)}
          >
            <Text
              style={[
                styles.tabText, 
                { color: activeTab === 0 ? colors.primary : colors.textSecondary },
                activeTab === 0 && styles.activeTabText
              ]}
            >
              {getSectionTitle('Individuals', individuals.data || [])}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 1 && styles.activeTab]}
            onPress={() => handleTabPress(1)}
          >
            <Text
              style={[
                styles.tabText, 
                { color: activeTab === 1 ? colors.primary : colors.textSecondary },
                activeTab === 1 && styles.activeTabText
              ]}
            >
              {getSectionTitle('Groups', groups.data || [])}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

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
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    position: 'relative',
    height: 44,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '50%',
    height: 2,
    borderRadius: 2,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  activeTab: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
});

export default ProfileGroupsScreen;
