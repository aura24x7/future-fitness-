import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { groupService } from '../../services/groupService';
import { Group } from '../../types/group';
import { useTheme } from '../../theme/ThemeProvider';

interface ExtendedGroup extends Group {
  lastActive: string;
  type: string;
  memberCount: number;
}

type GroupsNavigationProp = any;

export const GroupsSection: React.FC = () => {
  const navigation = useNavigation<GroupsNavigationProp>();
  const { colors, isDarkMode: isDark } = useTheme();
  const [groups, setGroups] = useState<ExtendedGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadGroups = async () => {
    try {
      const fetchedGroups = await groupService.getAllGroups();
      const extendedGroups: ExtendedGroup[] = fetchedGroups.map(group => ({
        ...group,
        lastActive: new Date().toLocaleDateString(),
        type: 'Fitness',
        memberCount: group.members?.length || 0,
      }));
      setGroups(extendedGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGroups();
    setRefreshing(false);
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleCreateGroup = () => {
    navigation.navigate('CreateGroup');
  };

  const handleGroupPress = (group: ExtendedGroup) => {
    navigation.navigate('GroupDetails', { groupId: group.id });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <TouchableOpacity
        style={styles.createGroupButton}
        onPress={handleCreateGroup}
      >
        <LinearGradient
          colors={[colors.primary, colors.primary + '80']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.createGroupGradient}
        >
          <Ionicons name="add-circle-outline" size={24} color={colors.card} />
          <Text style={[styles.createGroupText, { color: colors.card }]}>
            Create New Group
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {groups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No groups found
          </Text>
          <Text style={[styles.emptySubText, { color: colors.text + '80' }]}>
            Create a group to start collaborating with others
          </Text>
        </View>
      ) : (
        groups.map((group) => (
          <TouchableOpacity
            key={group.id}
            style={[styles.groupCard, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
            }]}
            onPress={() => handleGroupPress(group)}
          >
            <View style={styles.groupHeader}>
              <Text style={[styles.groupName, { color: colors.text }]}>
                {group.name}
              </Text>
              <Text style={[styles.memberCount, { color: colors.text + '80' }]}>
                {group.memberCount} members
              </Text>
            </View>
            <Text style={[styles.groupDescription, { color: colors.text + '80' }]} numberOfLines={2}>
              {group.description}
            </Text>
            <View style={styles.groupFooter}>
              <Text style={[styles.lastActive, { color: colors.text + '80' }]}>
                Last active: {group.lastActive}
              </Text>
              <View style={[styles.groupType, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.groupTypeText, { color: colors.primary }]}>
                  {group.type}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
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
  groupCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
  },
  memberCount: {
    fontSize: 14,
  },
  groupDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastActive: {
    fontSize: 12,
  },
  groupType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  groupTypeText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
