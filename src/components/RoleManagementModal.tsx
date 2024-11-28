import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GroupMember } from '../types/group';

interface RoleManagementModalProps {
  visible: boolean;
  member: GroupMember;
  onClose: () => void;
  onUpdateRole: (memberId: string, newRole: string) => Promise<void>;
}

const RoleManagementModal: React.FC<RoleManagementModalProps> = ({
  visible,
  member,
  onClose,
  onUpdateRole,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(member.role);

  const roles = [
    {
      value: 'member',
      label: 'Member',
      description: 'Can view and participate in group activities',
      icon: 'person',
    },
    {
      value: 'moderator',
      label: 'Moderator',
      description: 'Can manage members and content',
      icon: 'shield-checkmark',
    },
    {
      value: 'admin',
      label: 'Admin',
      description: 'Full control over group settings and members',
      icon: 'shield',
    },
  ];

  const handleRoleChange = async (role: string) => {
    if (role === member.role) {
      return;
    }

    if (role === 'admin') {
      Alert.alert(
        'Make Admin?',
        'This will give the member full control over the group. Are you sure?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Confirm',
            style: 'destructive',
            onPress: () => updateRole(role),
          },
        ]
      );
    } else {
      updateRole(role);
    }
  };

  const updateRole = async (role: string) => {
    setLoading(true);
    try {
      await onUpdateRole(member.id, role);
      setSelectedRole(role);
      onClose();
    } catch (error) {
      console.error('Error updating role:', error);
      Alert.alert('Error', 'Failed to update role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <LinearGradient
                colors={['#F8FAFC', '#EEF2FF']}
                style={styles.modalContent}
              >
                <View style={styles.header}>
                  <Text style={styles.title}>Manage Role</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                    disabled={loading}
                  >
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <View style={styles.memberInfo}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                      {member.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.memberName}>{member.name}</Text>
                </View>

                <View style={styles.rolesList}>
                  {roles.map((role) => (
                    <TouchableOpacity
                      key={role.value}
                      style={[
                        styles.roleOption,
                        selectedRole === role.value && styles.roleOptionSelected,
                      ]}
                      onPress={() => handleRoleChange(role.value)}
                      disabled={loading}
                    >
                      <View style={styles.roleHeader}>
                        <View style={styles.roleIconContainer}>
                          <Ionicons
                            name={role.icon as any}
                            size={20}
                            color={
                              selectedRole === role.value ? '#6366F1' : '#6B7280'
                            }
                          />
                        </View>
                        <Text
                          style={[
                            styles.roleLabel,
                            selectedRole === role.value && styles.roleLabelSelected,
                          ]}
                        >
                          {role.label}
                        </Text>
                      </View>
                      <Text style={styles.roleDescription}>
                        {role.description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </LinearGradient>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  memberInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6366F1',
  },
  memberName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1F2937',
  },
  rolesList: {
    gap: 12,
  },
  roleOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  roleOptionSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563',
  },
  roleLabelSelected: {
    color: '#6366F1',
  },
  roleDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 44,
  },
});

export default RoleManagementModal;
