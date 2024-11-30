import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { groupService } from '../services/groupService';
import { workoutSharingService } from '../services/workoutSharingService';
import { GroupMember } from '../types/group';
import { AIWorkoutPlan } from '../types/workout';

interface ShareWorkoutModalProps {
  visible: boolean;
  onClose: () => void;
  workoutPlan: AIWorkoutPlan | null;
  currentUserId: string;
  currentUserName: string;
}

export const ShareWorkoutModal: React.FC<ShareWorkoutModalProps> = ({
  visible,
  onClose,
  workoutPlan,
  currentUserId,
  currentUserName,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);

  useEffect(() => {
    if (visible) {
      loadGroupMembers();
    }
  }, [visible]);

  const loadGroupMembers = async () => {
    try {
      setLoading(true);
      console.log('Loading group members for user:', currentUserId);
      
      // Get all groups the current user is in
      const groups = await groupService.getUserGroups(currentUserId);
      console.log('User groups:', groups);
      
      const allMembers: GroupMember[] = [];
      
      // Get members from each group
      for (const group of groups) {
        console.log('Getting members for group:', group.id);
        const groupMembers = await groupService.getGroupMembers(group.id);
        console.log('Members in group', group.id, ':', groupMembers);
        
        // Filter out current user and duplicates
        const filteredMembers = groupMembers.filter(
          member => member.userId !== currentUserId &&
          !allMembers.some(m => m.userId === member.userId)
        );
        console.log('Filtered members:', filteredMembers);
        allMembers.push(...filteredMembers);
      }
      
      console.log('Final members list:', allMembers);
      setMembers(allMembers);
    } catch (error) {
      console.error('Error loading group members:', error);
      Alert.alert('Error', 'Failed to load group members');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!selectedMember || !workoutPlan) {
      Alert.alert('Error', 'Please select a recipient and ensure workout plan is available');
      return;
    }

    try {
      setLoading(true);
      await workoutSharingService.shareWorkout(
        workoutPlan,
        selectedMember.userId,
        currentUserName,
        message
      );
      Alert.alert('Success', 'Workout plan shared successfully');
      onClose();
    } catch (error) {
      console.error('Error sharing workout:', error);
      Alert.alert('Error', 'Failed to share workout plan');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member =>
    member.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Share Workout Plan</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {!workoutPlan ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>No workout plan available to share</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TextInput
                style={styles.searchInput}
                placeholder="Search members..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />

              {loading ? (
                <ActivityIndicator style={styles.loader} size="large" color="#4CAF50" />
              ) : (
                <FlatList
                  data={filteredMembers}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.memberItem,
                        selectedMember?.userId === item.userId && styles.selectedMember,
                      ]}
                      onPress={() => setSelectedMember(item)}
                    >
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{item.displayName}</Text>
                        <Text style={styles.memberRole}>{item.role}</Text>
                      </View>
                      {selectedMember?.userId === item.userId && (
                        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                      )}
                    </TouchableOpacity>
                  )}
                  keyExtractor={item => item.userId}
                  style={styles.memberList}
                />
              )}

              <TextInput
                style={styles.messageInput}
                placeholder="Add a message (optional)"
                value={message}
                onChangeText={setMessage}
                multiline
              />

              <TouchableOpacity
                style={[styles.shareButton, !selectedMember && styles.disabledButton]}
                onPress={handleShare}
                disabled={!selectedMember || loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.shareButtonText}>Share Workout Plan</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  memberList: {
    marginTop: 15,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  selectedMember: {
    backgroundColor: '#E8F5E9',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
  },
  memberRole: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  messageInput: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  shareButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  shareButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    marginTop: 20,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
});
