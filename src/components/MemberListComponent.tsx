import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroupMember } from '../types/group';
import RoleManagementModal from './RoleManagementModal';

interface MemberListComponentProps {
  members: GroupMember[];
  isLoading?: boolean;
  isAdmin?: boolean;
  onMemberPress?: (member: GroupMember) => void;
  onRemoveMember?: (memberId: string) => void;
  onUpdateRole?: (memberId: string, newRole: string) => Promise<void>;
}

const MemberListComponent: React.FC<MemberListComponentProps> = ({
  members,
  isLoading = false,
  isAdmin = false,
  onMemberPress,
  onRemoveMember,
  onUpdateRole,
}) => {
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return '#EF4444'; // Red
      case 'moderator':
        return '#F59E0B'; // Orange
      default:
        return '#6B7280'; // Gray
    }
  };

  const handleMemberLongPress = (member: GroupMember) => {
    if (isAdmin && member.role !== 'admin') {
      setSelectedMember(member);
      setShowRoleModal(true);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {members.map((member) => (
        <TouchableOpacity
          key={member.id}
          style={styles.memberCard}
          onPress={() => onMemberPress?.(member)}
          onLongPress={() => handleMemberLongPress(member)}
          activeOpacity={0.7}
        >
          <View style={styles.memberInfo}>
            {member.profileImage ? (
              <Image
                source={{ uri: member.profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.initialsContainer}>
                <Text style={styles.initialsText}>
                  {getInitials(member.name)}
                </Text>
              </View>
            )}
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>{member.name}</Text>
              <Text style={[styles.roleText, { color: getRoleColor(member.role) }]}>
                {member.role}
              </Text>
            </View>
          </View>

          {isAdmin && member.role !== 'admin' && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => onRemoveMember?.(member.id)}
            >
              <Ionicons name="close-circle-outline" size={24} color="#EF4444" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      ))}

      {selectedMember && (
        <RoleManagementModal
          visible={showRoleModal}
          member={selectedMember}
          onClose={() => {
            setShowRoleModal(false);
            setSelectedMember(null);
          }}
          onUpdateRole={onUpdateRole || (async () => {})}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  initialsContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  roleText: {
    fontSize: 14,
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
});

export default MemberListComponent;
