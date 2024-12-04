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
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { workoutSharingService } from '../services/workoutSharingService';
import { groupService } from '../services/groupService';
import { GroupMember, Group } from '../types/group';

interface ShareWorkoutModalProps {
  visible: boolean;
  onClose: () => void;
  workout: any; // Using any temporarily for quick implementation
  currentUserId: string;
  currentUserName: string;
}

const { height } = Dimensions.get('window');

export const ShareWorkoutModal: React.FC<ShareWorkoutModalProps> = ({
  visible,
  onClose,
  workout,
  currentUserId,
  currentUserName,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [activeTab, setActiveTab] = useState<'individuals' | 'groups'>('individuals');
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedItems, setSelectedItems] = useState<{
    individuals: string[];
    groups: string[];
  }>({
    individuals: [],
    groups: [],
  });

  useEffect(() => {
    if (visible) {
      loadData();
    } else {
      // Reset selections when modal closes
      setSelectedItems({ individuals: [], groups: [] });
      setSearchQuery('');
    }
  }, [visible]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allMembers, allGroups] = await Promise.all([
        groupService.getAllGroupMembers(),
        groupService.getAllGroups()
      ]);
      setMembers(allMembers.filter(member => member.id !== currentUserId));
      setGroups(allGroups);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load contacts and groups');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (id: string) => {
    const type = activeTab === 'individuals' ? 'individuals' : 'groups';
    setSelectedItems(prev => ({
      ...prev,
      [type]: prev[type].includes(id)
        ? prev[type].filter(item => item !== id)
        : [...prev[type], id]
    }));
  };

  const handleShare = async () => {
    const totalSelected = selectedItems.individuals.length + selectedItems.groups.length;
    if (totalSelected === 0) {
      Alert.alert('Error', 'Please select at least one recipient');
      return;
    }

    try {
      setSharing(true);
      await workoutSharingService.shareWorkout({
        workoutPlan: workout,
        sharedBy: {
          id: currentUserId,
          name: currentUserName,
        },
        recipients: {
          individuals: selectedItems.individuals,
          groups: selectedItems.groups,
        },
        message: 'Check out this workout plan!'
      });

      Alert.alert('Success', 'Workout plan shared successfully!');
      onClose();
    } catch (error) {
      console.error('Error sharing workout:', error);
      Alert.alert('Error', 'Failed to share workout');
    } finally {
      setSharing(false);
    }
  };

  const renderItem = ({ item }: { item: GroupMember | Group }) => {
    const isGroup = 'memberCount' in item;
    const id = item.id;
    const isSelected = selectedItems[isGroup ? 'groups' : 'individuals'].includes(id);

    return (
      <TouchableOpacity
        style={[styles.item, isSelected && styles.selectedItem]}
        onPress={() => handleSelect(id)}
      >
        <View style={styles.itemInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.itemName}>{item.name}</Text>
            {isGroup && (
              <Text style={styles.itemSubtext}>
                {(item as Group).memberCount} members
              </Text>
            )}
          </View>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
        </View>
      </TouchableOpacity>
    );
  };

  const filteredData = activeTab === 'individuals'
    ? members.filter(member => 
        member.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : groups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Share Workout Plan</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#1E293B" />
            </TouchableOpacity>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'individuals' && styles.activeTab]}
              onPress={() => setActiveTab('individuals')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'individuals' && styles.activeTabText
              ]}>
                Individuals
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'groups' && styles.activeTab]}
              onPress={() => setActiveTab('groups')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'groups' && styles.activeTabText
              ]}>
                Groups
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94A3B8"
            />
          </View>

          {loading ? (
            <ActivityIndicator style={styles.loader} size="large" color="#3B82F6" />
          ) : (
            <FlatList
              data={filteredData}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              style={styles.list}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    {searchQuery ? 'No results found' : `No ${activeTab} available`}
                  </Text>
                </View>
              )}
            />
          )}

          <TouchableOpacity
            style={[
              styles.shareButton,
              (selectedItems.individuals.length + selectedItems.groups.length === 0 || sharing) && 
              styles.shareButtonDisabled
            ]}
            onPress={handleShare}
            disabled={selectedItems.individuals.length + selectedItems.groups.length === 0 || sharing}
          >
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              style={styles.shareButtonGradient}
            >
              {sharing ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.shareButtonText}>
                  Share Plan ({selectedItems.individuals.length + selectedItems.groups.length})
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
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
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '90%',
    maxHeight: height * 0.7,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  closeButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#EFF6FF',
  },
  tabText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    marginHorizontal: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    color: '#1E293B',
    fontSize: 14,
  },
  list: {
    maxHeight: height * 0.4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedItem: {
    backgroundColor: '#F0F9FF',
    borderColor: '#3B82F6',
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemName: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  itemSubtext: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  shareButton: {
    margin: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  shareButtonDisabled: {
    opacity: 0.7,
  },
  shareButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loader: {
    padding: 20,
  },
});
