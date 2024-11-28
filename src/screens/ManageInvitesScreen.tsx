import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity } from 'react-native';
import { GroupInvite } from '../types/group';
import { groupService } from '../services/groupService';
import InviteListComponent from '../components/InviteListComponent';

interface ManageInvitesScreenProps {
  navigation: any;
}

const ManageInvitesScreen: React.FC<ManageInvitesScreenProps> = ({ navigation }) => {
  const [invites, setInvites] = useState<GroupInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadInvites = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual user ID from auth context
      const userId = 'temp-user-id';
      const userInvites = await groupService.getInvitesByUserId(userId);
      setInvites(userInvites);
    } catch (error) {
      console.error('Error loading invites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async (invite: GroupInvite) => {
    try {
      await groupService.acceptInvite(invite.id);
      // Navigate to the group details
      navigation.navigate('GroupDetails', { groupId: invite.groupId });
      // Refresh invites list
      loadInvites();
    } catch (error) {
      console.error('Error accepting invite:', error);
      Alert.alert('Error', 'Failed to accept invite. Please try again.');
    }
  };

  const handleRejectInvite = async (invite: GroupInvite) => {
    try {
      await groupService.rejectInvite(invite.id);
      // Refresh invites list
      loadInvites();
    } catch (error) {
      console.error('Error rejecting invite:', error);
      Alert.alert('Error', 'Failed to reject invite. Please try again.');
    }
  };

  useEffect(() => {
    loadInvites();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInvites();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6366f1', '#818cf8', '#a5b4fc', '#e0e7ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.6 }}
        style={styles.backgroundGradient}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Invites</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.invitesContainer}>
          <InviteListComponent
            invites={invites}
            isLoading={loading}
            onAcceptInvite={handleAcceptInvite}
            onRejectInvite={handleRejectInvite}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  invitesContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },
});

export default ManageInvitesScreen;
