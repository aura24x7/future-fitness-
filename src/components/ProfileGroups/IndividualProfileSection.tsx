import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute } from '@react-navigation/native';
import { useGymBuddyAlert } from '../../contexts/GymBuddyAlertContext';
import { useTheme } from '../../theme/ThemeProvider';

interface GymBuddyAlert {
  id: string;
  senderId: string;
  recipientId: string;
  type: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

interface IndividualProfileSectionProps {
  profile: {
    id: string;
    name: string;
    image?: string;
    status?: string;
    goals?: string[];
  };
  navigation: any;
  onSelect?: (userId: string) => void;
}

interface RouteParams {
  mode?: 'share';
}

export function IndividualProfileSection({ 
  profile, 
  navigation,
  onSelect,
}: IndividualProfileSectionProps) {
  const route = useRoute();
  const { colors, isDarkMode: isDark } = useTheme();
  const params = route.params as RouteParams;
  const isShareMode = params?.mode === 'share';
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
    } else if (pendingAlerts.length > 0 && pendingAlerts[0]) {
      const alert: GymBuddyAlert = {
        ...pendingAlerts[0],
        type: pendingAlerts[0].type || 'default',
        createdAt: pendingAlerts[0].createdAt || new Date().toISOString(),
      };
      setSelectedAlert(alert);
    } else {
      setSendModalVisible(true);
    }
  };

  const handleCloseSendModal = () => {
    setSendModalVisible(false);
  };

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.profileSection}>
          {profile.image ? (
            <Image source={{ uri: profile.image }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={[styles.profileImageText, { color: colors.cardBackground }]}>
                {profile.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: colors.text }]}>{profile.name}</Text>
            {profile.status && (
              <Text style={[styles.status, { color: colors.textSecondary }]}>
                {profile.status}
              </Text>
            )}
            {profile.goals && profile.goals.length > 0 && (
              <View style={styles.goalsContainer}>
                {profile.goals.map((goal, index) => (
                  <LinearGradient
                    key={index}
                    colors={[colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.goalBadge}
                  >
                    <Text style={[styles.goalText, { color: colors.cardBackground }]}>{goal}</Text>
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
            color={pendingAlerts.length > 0 ? colors.primary : colors.textSecondary}
          />
          {pendingAlerts.length > 0 && (
            <View style={[styles.alertBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.alertBadgeText, { color: colors.cardBackground }]}>
                {pendingAlerts.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {selectedAlert && (
        <View>
          {/* Alert modal placeholder - implement actual modal component */}
          <TouchableOpacity onPress={() => setSelectedAlert(null)}>
            <Text style={{ color: colors.text }}>Close Alert</Text>
          </TouchableOpacity>
        </View>
      )}

      {isSendModalVisible && (
        <View>
          {/* Send modal placeholder - implement actual modal component */}
          <TouchableOpacity onPress={handleCloseSendModal}>
            <Text style={{ color: colors.text }}>Close Send Modal</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 20,
    fontWeight: '600',
  },
  profileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    marginBottom: 8,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goalText: {
    fontSize: 12,
    fontWeight: '500',
  },
  alertButton: {
    padding: 8,
    position: 'relative',
  },
  alertBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  alertBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
