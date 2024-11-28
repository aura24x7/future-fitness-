import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SharedWorkoutPlan, WorkoutPlanVisibility } from '../types/workoutSharing';
import { workoutPlanSharingService } from '../services/workoutPlanSharingService';
import QRCode from 'react-native-qrcode-svg';
import { qrCodeService } from '../services/qrCodeService';
import { realTimeUpdatesService } from '../services/realTimeUpdatesService';

interface ShareWorkoutPlanScreenProps {
  route: {
    params: {
      plan: SharedWorkoutPlan;
    };
  };
}

const ShareWorkoutPlanScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const plan = route.params?.plan;

  const [message, setMessage] = useState('');
  const [visibility, setVisibility] = useState<WorkoutPlanVisibility>('private');
  const [allowModification, setAllowModification] = useState(true);
  const [loading, setLoading] = useState(false);
  const [qrCodeValue, setQRCodeValue] = useState<string>('');

  useEffect(() => {
    if (plan) {
      generateQRCode();

      // Subscribe to real-time updates
      const unsubscribe = realTimeUpdatesService.subscribeToWorkoutPlan(
        plan.id,
        (updatedPlan) => {
          // Update local plan state if needed
          console.log('Plan updated:', updatedPlan);
        },
        (error) => {
          console.error('Error in plan subscription:', error);
        }
      );

      return () => unsubscribe();
    }
  }, [plan]);

  const generateQRCode = async () => {
    if (!plan) return;

    try {
      const qrCode = await qrCodeService.generateWorkoutPlanQR(plan);
      setQRCodeValue(qrCode);
    } catch (error) {
      console.error('Error generating QR code:', error);
      Alert.alert('Error', 'Failed to generate QR code');
    }
  };

  const handleShare = async () => {
    if (!plan) {
      Alert.alert('Error', 'No workout plan to share');
      return;
    }

    try {
      setLoading(true);

      // Navigate to user selection
      navigation.navigate('SelectRecipients', {
        onSelect: async (recipientIds: string[]) => {
          try {
            // Share with each selected recipient
            const sharePromises = recipientIds.map(recipientId =>
              workoutPlanSharingService.sharePlan(plan.id, recipientId, message)
            );
            await Promise.all(sharePromises);

            Alert.alert(
              'Success',
              'Workout plan shared successfully!',
              [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
          } catch (error) {
            console.error('Error sharing plan:', error);
            Alert.alert('Error', 'Failed to share workout plan');
          }
        },
      });
    } catch (error) {
      console.error('Error preparing share:', error);
      Alert.alert('Error', 'Failed to prepare workout plan for sharing');
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No workout plan available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Plan Preview */}
        <View style={styles.previewCard}>
          <Text style={styles.title}>{plan.title}</Text>
          <Text style={styles.description}>{plan.description || 'No description'}</Text>
          
          <View style={styles.metadataContainer}>
            <View style={styles.metadataItem}>
              <Ionicons name="calendar" size={20} color="#6366F1" />
              <Text style={styles.metadataText}>
                {Object.keys(plan.schedule).length} workouts
              </Text>
            </View>
            <View style={styles.metadataItem}>
              <Ionicons name="time" size={20} color="#6366F1" />
              <Text style={styles.metadataText}>
                ~{plan.metadata.estimatedTimePerSession} min/session
              </Text>
            </View>
            <View style={styles.metadataItem}>
              <Ionicons name="barbell" size={20} color="#6366F1" />
              <Text style={styles.metadataText}>
                {plan.metadata.difficulty}
              </Text>
            </View>
          </View>
        </View>

        {/* QR Code Section */}
        {qrCodeValue && (
          <View style={styles.qrCodeContainer}>
            <Text style={styles.sectionTitle}>QR Code</Text>
            <View style={styles.qrCodeWrapper}>
              <QRCode
                value={qrCodeValue}
                size={200}
                backgroundColor="white"
                color="black"
              />
            </View>
            <Text style={styles.qrCodeHelp}>
              Scan this QR code to share the workout plan directly
            </Text>
          </View>
        )}

        {/* Share Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share Options</Text>
          
          {/* Visibility Selection */}
          <View style={styles.optionContainer}>
            <Text style={styles.optionLabel}>Visibility</Text>
            <View style={styles.visibilityOptions}>
              {(['private', 'friends', 'public'] as WorkoutPlanVisibility[]).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.visibilityOption,
                    visibility === option && styles.visibilityOptionSelected,
                  ]}
                  onPress={() => setVisibility(option)}
                >
                  <Text
                    style={[
                      styles.visibilityOptionText,
                      visibility === option && styles.visibilityOptionTextSelected,
                    ]}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Allow Modifications */}
          <TouchableOpacity
            style={styles.optionContainer}
            onPress={() => setAllowModification(!allowModification)}
          >
            <Text style={styles.optionLabel}>Allow Modifications</Text>
            <View style={[styles.checkbox, allowModification && styles.checkboxSelected]}>
              {allowModification && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
            </View>
          </TouchableOpacity>

          {/* Message Input */}
          <View style={styles.messageContainer}>
            <Text style={styles.optionLabel}>Add a Message (Optional)</Text>
            <TextInput
              style={styles.messageInput}
              multiline
              placeholder="Write a message to recipients..."
              value={message}
              onChangeText={setMessage}
              maxLength={200}
            />
          </View>
        </View>

        {/* Share Button */}
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="share-outline" size={24} color="#FFFFFF" />
              <Text style={styles.shareButtonText}>Share Workout Plan</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1F2937',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  metadataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    marginLeft: 4,
    color: '#4B5563',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1F2937',
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionLabel: {
    fontSize: 16,
    color: '#4B5563',
  },
  visibilityOptions: {
    flexDirection: 'row',
  },
  visibilityOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginLeft: 8,
  },
  visibilityOptionSelected: {
    backgroundColor: '#6366F1',
  },
  visibilityOptionText: {
    color: '#4B5563',
  },
  visibilityOptionTextSelected: {
    color: '#FFFFFF',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  messageContainer: {
    marginTop: 8,
  },
  messageInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    marginTop: 8,
  },
  shareButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 16,
  },
  qrCodeContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  qrCodeWrapper: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginVertical: 16,
  },
  qrCodeHelp: {
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ShareWorkoutPlanScreen;
