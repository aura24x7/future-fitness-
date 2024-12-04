import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface GroupMember {
  id: string;
  name: string;
  image?: string;
}

interface Group {
  id: string;
  name: string;
  image?: string;
  members: GroupMember[];
}

interface GroupSelectionListProps {
  groups: Group[];
  selectedGroups: string[];
  onSelectGroup: (groupId: string) => void;
  loading?: boolean;
  searchQuery?: string;
}

export const GroupSelectionList: React.FC<GroupSelectionListProps> = ({
  groups,
  selectedGroups,
  onSelectGroup,
  loading = false,
  searchQuery = '',
}) => {
  const renderMemberAvatars = (members: GroupMember[]) => {
    const maxDisplay = 3;
    const displayMembers = members.slice(0, maxDisplay);
    const remaining = members.length - maxDisplay;

    return (
      <View style={styles.memberAvatars}>
        {displayMembers.map((member, index) => (
          <View
            key={member.id}
            style={[
              styles.memberAvatar,
              { marginLeft: index > 0 ? -12 : 0 },
              { zIndex: maxDisplay - index },
            ]}
          >
            {member.image ? (
              <Image source={{ uri: member.image }} style={styles.memberImage} />
            ) : (
              <LinearGradient
                colors={['#6366F1', '#818CF8']}
                style={styles.memberImagePlaceholder}
              >
                <Text style={styles.memberInitial}>
                  {member.name.charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            )}
          </View>
        ))}
        {remaining > 0 && (
          <View style={[styles.memberAvatar, styles.remainingCount]}>
            <Text style={styles.remainingText}>+{remaining}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderGroupItem = ({ item: group }: { item: Group }) => {
    const isSelected = selectedGroups.includes(group.id);

    return (
      <TouchableOpacity
        style={[styles.groupItem, isSelected && styles.selectedItem]}
        onPress={() => onSelectGroup(group.id)}
      >
        <View style={styles.groupInfo}>
          <View style={styles.avatarContainer}>
            {group.image ? (
              <Image source={{ uri: group.image }} style={styles.avatar} />
            ) : (
              <LinearGradient
                colors={['#6366F1', '#818CF8']}
                style={styles.avatarPlaceholder}
              >
                <Text style={styles.avatarText}>
                  {group.name.charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            )}
          </View>
          <View style={styles.groupDetails}>
            <Text style={styles.groupName}>{group.name}</Text>
            <Text style={styles.memberCount}>
              {group.members.length} member{group.members.length !== 1 ? 's' : ''}
            </Text>
            {renderMemberAvatars(group.members)}
          </View>
        </View>

        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-circle-outline" size={48} color="#94A3B8" />
      <Text style={styles.emptyStateText}>
        {searchQuery
          ? 'No groups found'
          : 'No groups available'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <FlatList
      data={groups}
      renderItem={renderGroupItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={renderEmptyState}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  selectedItem: {
    backgroundColor: '#F0F9FF',
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  groupDetails: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  memberAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  memberImage: {
    width: '100%',
    height: '100%',
  },
  memberImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInitial: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  remainingCount: {
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  remainingText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '600',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
  },
});
