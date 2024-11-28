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

  // Invite Management
  async createInvite(invite: Omit<GroupInvite, 'id' | 'status' | 'createdAt'>): Promise<GroupInvite> {
    try {
      const invites = await this.getAllInvites();
      const newInvite: GroupInvite = {
        ...invite,
        id: generateUUID(),
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiry
      };

      await AsyncStorage.setItem(
        GROUP_INVITES_KEY,
        JSON.stringify([...invites, newInvite])
      );

      return newInvite;
    } catch (error) {
      console.error('Error creating invite:', error);
      throw new Error('Failed to create invite');
    }
  }

  async getInvitesByUserId(userId: string): Promise<GroupInvite[]> {
    try {
      const invites = await this.getAllInvites();
      return invites.filter(invite => invite.invitedBy === userId);
    } catch (error) {
      console.error('Error getting invites:', error);
      throw new Error('Failed to get invites');
    }
  }

  async getInvitesByGroupId(groupId: string): Promise<GroupInvite[]> {
    try {
      const invites = await this.getAllInvites();
      return invites.filter(invite => invite.groupId === groupId);
    } catch (error) {
      console.error('Error getting group invites:', error);
      throw new Error('Failed to get group invites');
    }
  }

  async updateInviteStatus(inviteId: string, status: GroupInvite['status']): Promise<GroupInvite> {
    try {
      const invites = await this.getAllInvites();
      const index = invites.findIndex(invite => invite.id === inviteId);
      
      if (index === -1) {
        throw new Error('Invite not found');
      }

      const updatedInvite = {
        ...invites[index],
        status,
      };

      invites[index] = updatedInvite;
      await AsyncStorage.setItem(GROUP_INVITES_KEY, JSON.stringify(invites));

      return updatedInvite;
    } catch (error) {
      console.error('Error updating invite:', error);
      throw new Error('Failed to update invite');
    }
  }

  private async getAllInvites(): Promise<GroupInvite[]> {
    try {
      const invitesJson = await AsyncStorage.getItem(GROUP_INVITES_KEY);
      return invitesJson ? JSON.parse(invitesJson) : [];
    } catch (error) {
      console.error('Error getting all invites:', error);
      throw new Error('Failed to get all invites');
    }
  }

  private async deleteGroupInvites(groupId: string): Promise<void> {
    try {
      const invites = await this.getAllInvites();
      const filteredInvites = invites.filter(invite => invite.groupId !== groupId);
      await AsyncStorage.setItem(GROUP_INVITES_KEY, JSON.stringify(filteredInvites));
    } catch (error) {
      console.error('Error deleting group invites:', error);
      throw new Error('Failed to delete group invites');
    }
  }
}

export const groupService = GroupService.getInstance();
