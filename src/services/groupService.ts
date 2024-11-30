import AsyncStorage from '@react-native-async-storage/async-storage';
import { Group, GroupMember, SharedWorkout, LeaderboardEntry, GroupInvite } from '../types/group';
import { generateUUID } from '../utils/uuid';

const GROUPS_STORAGE_KEY = '@groups';
const GROUP_MEMBERS_KEY = '@group_members';
const SHARED_WORKOUTS_KEY = '@shared_workouts';
const GROUP_INVITES_KEY = '@group_invites';

class GroupService {
  private static instance: GroupService;
  
  private constructor() {}

  public static getInstance(): GroupService {
    if (!GroupService.instance) {
      GroupService.instance = new GroupService();
    }
    return GroupService.instance;
  }

  // Group Management
  async createGroup(name: string, adminId: string, description?: string): Promise<Group> {
    try {
      const groups = await this.getAllGroups();
      
      const newGroup: Group = {
        id: generateUUID(),
        name,
        adminId,
        description,
        createdAt: new Date(),
        updatedAt: new Date(),
        memberCount: 1,
      };

      // Add group
      await AsyncStorage.setItem(
        GROUPS_STORAGE_KEY,
        JSON.stringify([...groups, newGroup])
      );

      // Add admin as first member
      const member: GroupMember = {
        id: generateUUID(),
        groupId: newGroup.id,
        userId: adminId,
        role: 'admin',
        joinedAt: new Date(),
        displayName: 'Admin', // This should come from user profile
      };
      await this.addGroupMember(member);

      return newGroup;
    } catch (error) {
      console.error('Error creating group:', error);
      throw new Error('Failed to create group');
    }
  }

  async getAllGroups(): Promise<Group[]> {
    try {
      const groupsJson = await AsyncStorage.getItem(GROUPS_STORAGE_KEY);
      return groupsJson ? JSON.parse(groupsJson) : [];
    } catch (error) {
      console.error('Error getting groups:', error);
      throw new Error('Failed to get groups');
    }
  }

  async getGroupById(groupId: string): Promise<Group | null> {
    try {
      const groups = await this.getAllGroups();
      return groups.find(g => g.id === groupId) || null;
    } catch (error) {
      console.error('Error getting group:', error);
      throw new Error('Failed to get group');
    }
  }

  async updateGroup(groupId: string, updates: Partial<Group>): Promise<Group> {
    try {
      const groups = await this.getAllGroups();
      const index = groups.findIndex(g => g.id === groupId);
      
      if (index === -1) {
        throw new Error('Group not found');
      }

      const updatedGroup = {
        ...groups[index],
        ...updates,
        updatedAt: new Date()
      };

      groups[index] = updatedGroup;
      await AsyncStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));

      return updatedGroup;
    } catch (error) {
      console.error('Error updating group:', error);
      throw new Error('Failed to update group');
    }
  }

  async deleteGroup(groupId: string): Promise<void> {
    try {
      const groups = await this.getAllGroups();
      const filteredGroups = groups.filter(g => g.id !== groupId);
      await AsyncStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(filteredGroups));

      // Clean up related data
      await this.deleteGroupMembers(groupId);
      await this.deleteGroupWorkouts(groupId);
      await this.deleteGroupInvites(groupId);
    } catch (error) {
      console.error('Error deleting group:', error);
      throw new Error('Failed to delete group');
    }
  }

  // Member Management
  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    try {
      const membersJson = await AsyncStorage.getItem(GROUP_MEMBERS_KEY);
      const members: GroupMember[] = membersJson ? JSON.parse(membersJson) : [];
      return members.filter(m => m.groupId === groupId);
    } catch (error) {
      console.error('Error getting group members:', error);
      throw new Error('Failed to get group members');
    }
  }

  async addGroupMember(member: GroupMember): Promise<void> {
    try {
      const members = await this.getAllGroupMembers();
      await AsyncStorage.setItem(
        GROUP_MEMBERS_KEY,
        JSON.stringify([...members, member])
      );

      // Update group member count
      const group = await this.getGroupById(member.groupId);
      if (group) {
        await this.updateGroup(member.groupId, {
          memberCount: group.memberCount + 1
        });
      }
    } catch (error) {
      console.error('Error adding group member:', error);
      throw new Error('Failed to add group member');
    }
  }

  private async getAllGroupMembers(): Promise<GroupMember[]> {
    try {
      const membersJson = await AsyncStorage.getItem(GROUP_MEMBERS_KEY);
      return membersJson ? JSON.parse(membersJson) : [];
    } catch (error) {
      console.error('Error getting all members:', error);
      throw new Error('Failed to get all members');
    }
  }

  private async deleteGroupMembers(groupId: string): Promise<void> {
    try {
      const members = await this.getAllGroupMembers();
      const filteredMembers = members.filter(m => m.groupId !== groupId);
      await AsyncStorage.setItem(GROUP_MEMBERS_KEY, JSON.stringify(filteredMembers));
    } catch (error) {
      console.error('Error deleting group members:', error);
      throw new Error('Failed to delete group members');
    }
  }

  // Get groups for a specific user
  async getUserGroups(userId: string): Promise<Group[]> {
    try {
      // Get all members to find the user's group memberships
      const members = await this.getAllGroupMembers();
      const userGroupIds = members
        .filter(member => member.userId === userId)
        .map(member => member.groupId);
      
      // Get all groups and filter to only include user's groups
      const allGroups = await this.getAllGroups();
      return allGroups.filter(group => userGroupIds.includes(group.id));
    } catch (error) {
      console.error('Error getting user groups:', error);
      throw new Error('Failed to get user groups');
    }
  }

  // Workout Sharing
  async shareWorkout(workout: SharedWorkout): Promise<void> {
    try {
      const workouts = await this.getSharedWorkouts(workout.groupId);
      await AsyncStorage.setItem(
        `${SHARED_WORKOUTS_KEY}_${workout.groupId}`,
        JSON.stringify([...workouts, workout])
      );
    } catch (error) {
      console.error('Error sharing workout:', error);
      throw new Error('Failed to share workout');
    }
  }

  async getSharedWorkouts(groupId: string): Promise<SharedWorkout[]> {
    try {
      const workoutsJson = await AsyncStorage.getItem(`${SHARED_WORKOUTS_KEY}_${groupId}`);
      return workoutsJson ? JSON.parse(workoutsJson) : [];
    } catch (error) {
      console.error('Error getting shared workouts:', error);
      throw new Error('Failed to get shared workouts');
    }
  }

  private async deleteGroupWorkouts(groupId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${SHARED_WORKOUTS_KEY}_${groupId}`);
    } catch (error) {
      console.error('Error deleting group workouts:', error);
      throw new Error('Failed to delete group workouts');
    }
  }

  // Group Invites
  async createInvite(invite: GroupInvite): Promise<void> {
    try {
      const invites = await this.getGroupInvites(invite.groupId);
      await AsyncStorage.setItem(
        `${GROUP_INVITES_KEY}_${invite.groupId}`,
        JSON.stringify([...invites, invite])
      );
    } catch (error) {
      console.error('Error creating invite:', error);
      throw new Error('Failed to create invite');
    }
  }

  async getGroupInvites(groupId: string): Promise<GroupInvite[]> {
    try {
      const invitesJson = await AsyncStorage.getItem(`${GROUP_INVITES_KEY}_${groupId}`);
      return invitesJson ? JSON.parse(invitesJson) : [];
    } catch (error) {
      console.error('Error getting invites:', error);
      throw new Error('Failed to get invites');
    }
  }

  private async deleteGroupInvites(groupId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${GROUP_INVITES_KEY}_${groupId}`);
    } catch (error) {
      console.error('Error deleting group invites:', error);
      throw new Error('Failed to delete group invites');
    }
  }

  // For testing - add mock data
  async addMockData() {
    try {
      // Create mock groups
      const mockGroups: Group[] = [
        {
          id: 'group1',
          name: 'Fitness Buddies',
          adminId: 'current-user',
          description: 'A group for workout enthusiasts',
          createdAt: new Date(),
          updatedAt: new Date(),
          memberCount: 5
        },
        {
          id: 'group2',
          name: 'Weight Loss Support',
          adminId: 'current-user',
          description: 'Support group for weight loss journey',
          createdAt: new Date(),
          updatedAt: new Date(),
          memberCount: 4
        }
      ];

      // Create mock members
      const mockMembers: GroupMember[] = [
        {
          id: 'member1',
          groupId: 'group1',
          userId: 'current-user',
          role: 'admin',
          joinedAt: new Date(),
          displayName: 'Current User'
        },
        {
          id: 'member2',
          groupId: 'group1',
          userId: 'user2',
          role: 'member',
          joinedAt: new Date(),
          displayName: 'John Doe'
        },
        {
          id: 'member3',
          groupId: 'group1',
          userId: 'user3',
          role: 'member',
          joinedAt: new Date(),
          displayName: 'Jane Smith'
        },
        {
          id: 'member4',
          groupId: 'group1',
          userId: 'user4',
          role: 'member',
          joinedAt: new Date(),
          displayName: 'Mike Wilson'
        },
        {
          id: 'member5',
          groupId: 'group1',
          userId: 'user5',
          role: 'member',
          joinedAt: new Date(),
          displayName: 'Sarah Brown'
        },
        {
          id: 'member6',
          groupId: 'group2',
          userId: 'current-user',
          role: 'admin',
          joinedAt: new Date(),
          displayName: 'Current User'
        },
        {
          id: 'member7',
          groupId: 'group2',
          userId: 'user6',
          role: 'member',
          joinedAt: new Date(),
          displayName: 'David Lee'
        },
        {
          id: 'member8',
          groupId: 'group2',
          userId: 'user7',
          role: 'member',
          joinedAt: new Date(),
          displayName: 'Emma Davis'
        },
        {
          id: 'member9',
          groupId: 'group2',
          userId: 'user8',
          role: 'member',
          joinedAt: new Date(),
          displayName: 'Tom Harris'
        }
      ];

      // Store mock data
      await AsyncStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(mockGroups));
      await AsyncStorage.setItem(GROUP_MEMBERS_KEY, JSON.stringify(mockMembers));

      console.log('Mock data added successfully');
      return true;
    } catch (error) {
      console.error('Error adding mock data:', error);
      return false;
    }
  }
}

export const groupService = GroupService.getInstance();
