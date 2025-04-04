import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfileGroups } from '../contexts/ProfileGroupsContext';
import { useGymBuddyAlerts } from '../contexts/GymBuddyAlertContext';
import { useTheme } from '../theme/ThemeProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack } from 'tamagui';
import { GroupsSection } from '../components/ProfileGroups/GroupsSection';
import SharedPlansSection from '../components/ProfileGroups/SharedPlansSection';
import { NotificationBadge } from '../components/ProfileGroups/NotificationBadge';

const { width } = Dimensions.get('window');

type TabType = 'connections' | 'shared_plans';

interface Props {
  navigation: any;
}

const ProfileGroupsScreen: React.FC<Props> = ({ navigation }) => {
  const { fetchIndividuals } = useProfileGroups();
  const { colors, isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('connections');

  const fetchData = useCallback(async () => {
    await fetchIndividuals();
  }, [fetchIndividuals]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleNotificationsPress = () => {
    navigation.navigate('Notifications');
  };

  const handleConnectionRequestsPress = () => {
    navigation.navigate('ConnectionRequests');
  };

  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { backgroundColor: isDarkMode ? colors.background : '#F9FAFB' }
      ]} 
      edges={['top']}
    >
      <YStack flex={1}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Connections</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={[styles.headerButton, styles.connectionButton, { borderColor: colors.primary }]} 
              onPress={handleConnectionRequestsPress}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="people-outline" 
                size={24} 
                color={colors.primary} 
              />
              <NotificationBadge size={16} type="connections" />
              <Text style={[styles.buttonText, { color: colors.primary }]}>Requests</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={handleNotificationsPress}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="notifications-outline" 
                size={24} 
                color={colors.primary} 
              />
              <NotificationBadge size={16} type="notifications" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={[styles.tabContainer, {
          backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.6)' : 'rgba(229, 231, 235, 0.6)',
        }]}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'connections' && [
                styles.activeTab, 
                { backgroundColor: isDarkMode ? colors.cardBackground : '#FFFFFF' }
              ]
            ]}
            onPress={() => setActiveTab('connections')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'connections' ? colors.primary : colors.textSecondary }
              ]}
            >
              Friends
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'shared_plans' && [
                styles.activeTab, 
                { backgroundColor: isDarkMode ? colors.cardBackground : '#FFFFFF' }
              ]
            ]}
            onPress={() => setActiveTab('shared_plans')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'shared_plans' ? colors.primary : colors.textSecondary }
              ]}
            >
              Shared Plans
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }}>
          {activeTab === 'connections' ? (
            <GroupsSection />
          ) : (
            <SharedPlansSection />
          )}
        </View>
      </YStack>
      
      {/* Add Friends Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('FriendSearch')}
      >
        <Ionicons name="person-add" size={24} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add Friends</Text>
      </TouchableOpacity>
    </SafeAreaView>
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
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    position: 'relative',
    marginLeft: 8,
  },
  connectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 20,
  },
  buttonText: {
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 4,
    height: 48,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 28,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ProfileGroupsScreen;
