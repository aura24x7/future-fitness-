import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute } from '@react-navigation/native';
import { useGymBuddyAlert } from '../../contexts/GymBuddyAlertContext';
import { useTheme } from '../../theme/ThemeProvider';
import { ReceiveAlertModal } from '../../components/GymBuddyAlert/ReceiveAlertModal';
import { GymBuddyAlert } from '../../types/gymBuddyAlert';
import { auth } from '../../config/firebase';

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
  const { state, sendGymInvite } = useGymBuddyAlert();
  const [selectedAlert, setSelectedAlert] = useState<GymBuddyAlert | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);

  // For testing: Use current user's ID
  const currentUser = auth.currentUser;
  const testRecipientId = currentUser?.uid || profile.id;

  // Find pending alerts for this profile
  const pendingAlerts = state.receivedAlerts.filter(
    alert => alert.senderId === profile.id && alert.status === 'pending'
  );

  const showAlert = useCallback((title: string, message: string) => {
    Alert.alert(
      title,
      message,
      [{ text: 'OK' }],
      { 
        cancelable: true,
        onDismiss: () => {},
      }
    );
  }, []);

  const handlePress = useCallback(async () => {
    // Prevent double clicks
    const now = Date.now();
    if (now - lastClickTime < 500) { // 500ms debounce
      return;
    }
    setLastClickTime(now);

    console.log('Button pressed', { profile, currentUser });
    
    if (isShareMode && onSelect) {
      try {
        onSelect(profile.id);
      } catch (error) {
        console.error('Error in onSelect:', error);
        showAlert('Error', 'Failed to select profile. Please try again.');
      }
      return;
    }

    if (!currentUser) {
      showAlert('Error', 'You must be logged in to use this feature');
      return;
    }

    if (pendingAlerts.length > 0 && pendingAlerts[0]) {
      console.log('Opening existing alert', pendingAlerts[0]);
      const alert: GymBuddyAlert = {
        id: pendingAlerts[0].id,
        senderId: pendingAlerts[0].senderId,
        receiverId: pendingAlerts[0].receiverId,
        message: pendingAlerts[0].message,
        status: pendingAlerts[0].status,
        createdAt: pendingAlerts[0].createdAt,
        senderName: pendingAlerts[0].senderName || profile.name,
        receiverName: pendingAlerts[0].receiverName,
        type: pendingAlerts[0].type || 'CUSTOM_MESSAGE'
      };
      setSelectedAlert(alert);
    } else {
      if (isSending) {
        console.log('Already sending, ignoring click');
        return;
      }

      try {
        setIsSending(true);
        console.log('Sending gym invite to:', testRecipientId);
        
        const result = await sendGymInvite(testRecipientId);
        console.log('Gym invite sent successfully:', result);
        
        // Show alert for 3 seconds
        setTimeout(() => {
          showAlert(
            'Success',
            'Gym invite sent successfully!'
          );
        }, 500); // Small delay to ensure loading indicator is visible
      } catch (error) {
        console.error('Failed to send gym invite:', error);
        showAlert(
          'Error',
          'Failed to send gym invite. Please try again.'
        );
      } finally {
        // Keep loading indicator visible for at least 1 second
        setTimeout(() => {
          setIsSending(false);
        }, 1000);
      }
    }
  }, [
    profile,
    currentUser,
    isShareMode,
    onSelect,
    pendingAlerts,
    isSending,
    testRecipientId,
    sendGymInvite,
    showAlert,
    lastClickTime,
  ]);

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
            <Text style={[styles.name, { color: colors.text }]}>
              {profile.name}
              {currentUser && profile.id === currentUser.uid && ' (You)'}
            </Text>
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
          style={[
            styles.alertButton,
            isSending && styles.disabledButton,
            Platform.select({
              android: styles.androidButton,
              ios: styles.iosButton
            })
          ]}
          onPress={handlePress}
          disabled={isSending}
          activeOpacity={0.7}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          pressRetentionOffset={{ top: 20, bottom: 20, left: 20, right: 20 }}
          delayPressIn={0}
          delayPressOut={0}
        >
          {isSending ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <View style={styles.buttonContent}>
              <Ionicons
                name={pendingAlerts.length > 0 ? "notifications" : "barbell-outline"}
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
            </View>
          )}
        </TouchableOpacity>
      </View>

      {selectedAlert && (
        <ReceiveAlertModal
          isVisible={!!selectedAlert}
          onClose={() => setSelectedAlert(null)}
          alert={selectedAlert}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profileImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 16,
    fontWeight: '600',
  },
  profileInfo: {
    marginLeft: 10,
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  status: {
    fontSize: 13,
    marginBottom: 4,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  goalBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  goalText: {
    fontSize: 11,
    fontWeight: '500',
  },
  alertButton: {
    padding: 8,
    borderRadius: 20,
  },
  androidButton: {
    elevation: 0,
  },
  iosButton: {
    shadowColor: 'transparent',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonContent: {
    position: 'relative',
  },
  alertBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  alertBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
