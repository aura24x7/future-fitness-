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
import { useGymBuddyAlerts } from '../contexts/GymBuddyAlertContext';
import { useTheme } from '../theme/ThemeProvider';
import { IndividualProfileSection } from '../components/ProfileGroups/IndividualProfileSection';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack, XStack, Button } from 'tamagui';
import { GroupsSection } from '../components/ProfileGroups/GroupsSection';
import { SharedPlansSection } from '../components/ProfileGroups/SharedPlansSection';

const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
}

type TabType = 'groups' | 'shared-plans';

const ProfileGroupsScreen: React.FC<Props> = ({ navigation }) => {
  const { state: { individuals }, fetchIndividuals } = useProfileGroups();
  const { sentAlerts, receivedAlerts } = useGymBuddyAlerts();
  const { colors, isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('groups');

  const fetchData = useCallback(async () => {
    await fetchIndividuals();
  }, [fetchIndividuals]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getSectionTitle = (title: string, items: any[]) => {
    const pendingAlertCount = receivedAlerts.filter(
      alert => 
        alert.status === 'pending' && 
        items.some(item => item.id === alert.senderId)
    ).length;

    return pendingAlertCount > 0 
      ? `${title} (${pendingAlertCount} new alerts)`
      : title;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <YStack flex={1}>
        <XStack padding="$4" space="$2">
          <Button
            flex={1}
            backgroundColor={activeTab === 'groups' ? colors.primary : 'transparent'}
            onPress={() => setActiveTab('groups')}
          >
            <Text
              style={{
                color: activeTab === 'groups' ? 'white' : colors.text,
                fontWeight: '600'
              }}
            >
              Groups
            </Text>
          </Button>
          <Button
            flex={1}
            backgroundColor={activeTab === 'shared-plans' ? colors.primary : 'transparent'}
            onPress={() => setActiveTab('shared-plans')}
          >
            <Text
              style={{
                color: activeTab === 'shared-plans' ? 'white' : colors.text,
                fontWeight: '600'
              }}
            >
              Shared Plans
            </Text>
          </Button>
        </XStack>

        {activeTab === 'groups' ? (
          <GroupsSection />
        ) : (
          <SharedPlansSection />
        )}
      </YStack>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
