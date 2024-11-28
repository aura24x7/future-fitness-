import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import MemberListComponent from '../components/MemberListComponent';
import InviteListComponent from '../components/InviteListComponent';
import { Group, GroupMember, GroupInvite } from '../types/group';
import { hasPermission, canManageRole } from '../utils/rolePermissions';

const GroupDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>('member');
  const [invites, setInvites] = useState<GroupInvite[]>([]);

  const loadGroupDetails = async () => {
    try {
      // TODO: Replace with actual API call
      const mockGroup: Group = {
        id: '1',
        name: 'Fitness Enthusiasts',
        description: 'A group for fitness lovers',
        createdAt: new Date().toISOString(),
        createdBy: 'user1',
        members: [
          {
            id: 'user1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'admin',
            joinedAt: new Date().toISOString(),
          },
          {
            id: 'user2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'moderator',
            joinedAt: new Date().toISOString(),
          },
        ],
      };
      setGroup(mockGroup);
      
      // Set current user role (replace with actual user detection)
      const currentUser = mockGroup.members.find(m => m.id === 'user1');
      if (currentUser) {
        setCurrentUserRole(currentUser.role);
      }
    } catch (error) {
      console.error('Error loading group details:', error);
      Alert.alert('Error', 'Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  const loadInvites = async () => {
    try {
      // TODO: Replace with actual API call
      const mockInvites: GroupInvite[] = [];
      setInvites(mockInvites);
    } catch (error) {
      console.error('Error loading invites:', error);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    if (!group) return;

    const targetMember = group.members.find(m => m.id === memberId);
    if (!targetMember) {
      Alert.alert('Error', 'Member not found');
      return;
    }

    if (!canManageRole(currentUserRole as any, targetMember.role as any, newRole as any)) {
      Alert.alert('Error', 'You do not have permission to update this role');
      return;
    }

    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const updatedMembers = group.members.map(member => {
        if (member.id === memberId) {
          return { ...member, role: newRole };
        }
        return member;
      });
      setGroup({ ...group, members: updatedMembers });
      Alert.alert('Success', 'Member role updated successfully');
    } catch (error) {
      console.error('Error updating role:', error);
      Alert.alert('Error', 'Failed to update member role');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!group) return;

    const targetMember = group.members.find(m => m.id === memberId);
    if (!targetMember) {
      Alert.alert('Error', 'Member not found');
      return;
    }

    if (!hasPermission(currentUserRole as any, 'canRemoveMembers')) {
      Alert.alert('Error', 'You do not have permission to remove members');
      return;
    }

    if (targetMember.role === 'admin') {
      Alert.alert('Error', 'Cannot remove an admin');
      return;
    }

    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const updatedMembers = group.members.filter(m => m.id !== memberId);
      setGroup({ ...group, members: updatedMembers });
      Alert.alert('Success', 'Member removed successfully');
    } catch (error) {
      console.error('Error removing member:', error);
      Alert.alert('Error', 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadGroupDetails(), loadInvites()]);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadGroupDetails();
    loadInvites();
  }, []);

  if (loading && !group) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Group not found</Text>
      </View>
    );
  }

  const canInviteMembers = hasPermission(currentUserRole as any, 'canInviteMembers');
  const canManageInvites = hasPermission(currentUserRole as any, 'canManageContent');

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6366F1', '#4F46E5']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.groupName}>{group.name}</Text>
          {canInviteMembers && (
            <TouchableOpacity
              style={styles.inviteButton}
              onPress={() => navigation.navigate('InviteMembers' as never)}
            >
              <Ionicons name="person-add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <Text style={styles.description}>{group.description}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Members</Text>
          <MemberListComponent
            members={group.members}
            isLoading={loading}
            isAdmin={hasPermission(currentUserRole as any, 'canUpdateRoles')}
            onMemberPress={(member) => {
              // TODO: Implement member profile view
              console.log('Member pressed:', member);
            }}
            onRemoveMember={handleRemoveMember}
            onUpdateRole={handleUpdateRole}
          />
        </View>

        {canManageInvites && invites.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Invites</Text>
            <InviteListComponent
              invites={invites}
              isLoading={loading}
              onCancelInvite={async (inviteId) => {
                try {
                  // TODO: Replace with actual API call
                  setInvites(invites.filter(i => i.id !== inviteId));
                } catch (error) {
                  console.error('Error canceling invite:', error);
                  Alert.alert('Error', 'Failed to cancel invite');
                }
              }}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
  },
  header: {
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  groupName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  inviteButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
});

export default GroupDetailsScreen;
