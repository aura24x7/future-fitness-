import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeProvider';
import { userService } from '../../services/userService';
import { friendNotificationService } from '../../services/friendNotificationService';

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

export function IndividualProfileSection({ 
  profile, 
  navigation,
  onSelect,
}: IndividualProfileSectionProps) {
  const { colors } = useTheme();
  const [isSending, setIsSending] = useState(false);

  const handleSendNotification = () => {
    Alert.alert(
      'Send Notification',
      `Send a notification to ${profile.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Test Notification',
          onPress: async () => {
            try {
              setIsSending(true);
              const currentUserId = userService.getCurrentUserId();
              
              await friendNotificationService.sendNotification(
                currentUserId, 
                profile.id, 
                'other',
                `This is a test notification from ${currentUserId}`
              );
              
              Alert.alert('Success', `Test notification sent to ${profile.name}!`);
            } catch (error) {
              let errorMessage = 'Failed to send notification';
              if (error instanceof Error) {
                errorMessage = error.message;
              }
              Alert.alert('Error', errorMessage);
              console.error(error);
            } finally {
              setIsSending(false);
            }
          },
        },
        {
          text: 'Send Workout Invite',
          onPress: () => {
            // Show prompt for gym name and time
            Alert.prompt(
              'Workout Invitation',
              'Enter gym name (optional):',
              [
                {
                  text: 'Cancel',
                  style: 'cancel'
                },
                {
                  text: 'Next',
                  onPress: (gymName = '') => {
                    // Now prompt for time
                    Alert.prompt(
                      'Workout Time',
                      'Enter workout time (optional):',
                      [
                        {
                          text: 'Cancel',
                          style: 'cancel'
                        },
                        {
                          text: 'Send Invite',
                          onPress: async (time = '') => {
                            try {
                              setIsSending(true);
                              const currentUserId = userService.getCurrentUserId();
                              
                              await friendNotificationService.sendWorkoutInvite(
                                currentUserId,
                                profile.id,
                                gymName || undefined,
                                time || undefined
                              );
                              
                              Alert.alert('Success', `Workout invitation sent to ${profile.name}!`);
                            } catch (error) {
                              let errorMessage = 'Failed to send workout invitation';
                              if (error instanceof Error) {
                                errorMessage = error.message;
                              }
                              Alert.alert('Error', errorMessage);
                              console.error(error);
                            } finally {
                              setIsSending(false);
                            }
                          }
                        }
                      ]
                    );
                  }
                }
              ]
            );
          },
        },
        {
          text: 'Send Workout Reminder',
          onPress: async () => {
            try {
              setIsSending(true);
              const currentUserId = userService.getCurrentUserId();
              
              await friendNotificationService.sendNotification(
                currentUserId, 
                profile.id, 
                'workout',
                `It's time for your workout!`
              );
              
              Alert.alert('Success', `Workout reminder sent to ${profile.name}!`);
            } catch (error) {
              let errorMessage = 'Failed to send notification';
              if (error instanceof Error) {
                errorMessage = error.message;
              }
              Alert.alert('Error', errorMessage);
              console.error(error);
            } finally {
              setIsSending(false);
            }
          },
        },
        {
          text: 'Send Meal Reminder',
          onPress: async () => {
            try {
              setIsSending(true);
              const currentUserId = userService.getCurrentUserId();
              
              await friendNotificationService.sendNotification(
                currentUserId, 
                profile.id, 
                'meal',
                `Time to log your meal!`
              );
              
              Alert.alert('Success', `Meal reminder sent to ${profile.name}!`);
            } catch (error) {
              let errorMessage = 'Failed to send notification';
              if (error instanceof Error) {
                errorMessage = error.message;
              }
              Alert.alert('Error', errorMessage);
              console.error(error);
            } finally {
              setIsSending(false);
            }
          },
        },
      ],
    );
  };

  return (
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
                  colors={[colors.primary, colors.primary + '80']}
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
        style={styles.notificationButton}
        onPress={handleSendNotification}
        disabled={isSending}
      >
        {isSending ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons
            name="notifications-outline"
            size={24}
            color={colors.primary}
          />
        )}
      </TouchableOpacity>
    </View>
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
  notificationButton: {
    padding: 8,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
