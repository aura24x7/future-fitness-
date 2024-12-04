import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { groupService } from '../../services/groupService';
import { Group } from '../../types/group';
import { RootStackParamList } from '../../types/navigation';

type GroupsNavigationProp = NavigationProp<RootStackParamList>;

export const GroupsSection: React.FC = () => {
  const navigation = useNavigation<GroupsNavigationProp>();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadGroups = async () => {
    try {
      const fetchedGroups = await groupService.getAllGroups();
      setGroups(fetchedGroups);
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

  const handleGroupPress = (group: Group) => {
    navigation.navigate('GroupDetails', { groupId: group.id });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
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
          colors={['#6366f1', '#818cf8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.createGroupGradient}
        >
          <Ionicons name="add-circle-outline" size={24} color="white" />
          <Text style={styles.createGroupText}>Create New Group</Text>
        </LinearGradient>
      </TouchableOpacity>

      {groups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No groups found</Text>
          <Text style={styles.emptySubText}>
            Create a group to start collaborating with others
          </Text>
        </View>
      ) : (
        groups.map((group) => (
          <TouchableOpacity
            key={group.id}
            style={styles.groupCard}
            onPress={() => handleGroupPress(group)}
          >
            <View style={styles.groupHeader}>
              <Text style={styles.groupName}>{group.name}</Text>
              <Text style={styles.memberCount}>
                {group.memberCount} members
              </Text>
            </View>
            <Text style={styles.groupDescription} numberOfLines={2}>
              {group.description}
            </Text>
            <View style={styles.groupFooter}>
              <Text style={styles.lastActive}>
                Last active: {group.lastActive}
              </Text>
              <View style={styles.groupType}>
                <Text style={styles.groupTypeText}>{group.type}</Text>
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
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createGroupButton: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  createGroupGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  createGroupText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  groupCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    color: '#1F2937',
  },
  memberCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  groupDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastActive: {
    fontSize: 12,
    color: '#6B7280',
  },
  groupType: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  groupTypeText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
  },
});
