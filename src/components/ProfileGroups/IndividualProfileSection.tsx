import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useGymBuddyAlert } from '../../contexts/GymBuddyAlertContext';
import { SendAlertModal } from '../GymBuddyAlert/SendAlertModal';
import { ReceiveAlertModal } from '../GymBuddyAlert/ReceiveAlertModal';
import { GymBuddyAlert } from '../../types/gymBuddyAlert';
import { useRoute } from '@react-navigation/native';

interface IndividualProfileSectionProps {
  profile: {
    id: string;
    name: string;
    image?: string;
    status?: string;
    lastActive?: string;
    goals?: string[];
  };
  navigation: any;
  onSelect?: (profileId: string) => void;
}

export function IndividualProfileSection({ 
  profile, 
  navigation,
  onSelect,
}: IndividualProfileSectionProps) {
  const route = useRoute();
  const isShareMode = route.params?.mode === 'share';
  const { state } = useGymBuddyAlert();
  const [isSendModalVisible, setSendModalVisible] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<GymBuddyAlert | null>(null);

  // Find pending alerts for this profile
  const pendingAlerts = state.receivedAlerts.filter(
    alert => alert.senderId === profile.id && alert.status === 'pending'
  );

  const handlePress = () => {
    if (isShareMode && onSelect) {
      onSelect(profile.id);
    } else if (pendingAlerts.length > 0) {
      setSelectedAlert(pendingAlerts[0]);
    } else {
      setSendModalVisible(true);
    }
  };

  const handleCloseSendModal = () => {
    setSendModalVisible(false);
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.profileSection}>
          {profile.image ? (
            <Image source={{ uri: profile.image }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImageText}>
                {profile.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.profileInfo}>
            <Text style={styles.name}>{profile.name}</Text>
            {profile.status && (
              <Text style={styles.status}>
                {profile.status}
              </Text>
            )}
            {profile.goals && profile.goals.length > 0 && (
              <View style={styles.goalsContainer}>
                {profile.goals.map((goal, index) => (
                  <LinearGradient
                    key={index}
                    colors={['#6366F1', '#818CF8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.goalBadge}
                  >
                    <Text style={styles.goalText}>{goal}</Text>
                  </LinearGradient>
                ))}
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.alertButton}
          onPress={handlePress}
        >
          <Ionicons
            name={pendingAlerts.length > 0 ? "notifications" : "notifications-outline"}
            size={24}
            color={pendingAlerts.length > 0 ? "#6366F1" : "#64748B"}
          />
          {pendingAlerts.length > 0 && (
            <View style={styles.alertBadge}>
              <Text style={styles.alertBadgeText}>{pendingAlerts.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {selectedAlert && (
        <ReceiveAlertModal
          alert={selectedAlert}
          visible={!!selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}

      <SendAlertModal
        visible={isSendModalVisible}
        onClose={handleCloseSendModal}
        recipientId={profile.id}
        recipientName={profile.name}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileSection: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  profileImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
  },
  profileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  status: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  goalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  goalText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  alertButton: {
    padding: 8,
    position: 'relative',
  },
  alertBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  alertBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
});
