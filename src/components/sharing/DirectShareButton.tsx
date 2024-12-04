import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ShareWorkoutModal } from '../ShareWorkoutModal';
import { AIWorkoutPlan } from '../../types/workout';
import { ManualWorkout } from '../../types/workoutSharing';

interface DirectShareButtonProps {
  workout: ManualWorkout | AIWorkoutPlan;
  currentUserId: string;
  currentUserName: string;
  style?: any;
}

export const DirectShareButton: React.FC<DirectShareButtonProps> = ({
  workout,
  currentUserId,
  currentUserName,
  style
}) => {
  const [showShareModal, setShowShareModal] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={[styles.button, style]}
        onPress={() => setShowShareModal(true)}
      >
        <LinearGradient
          colors={['#6366F1', '#818CF8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Ionicons name="share-social" size={20} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      <ShareWorkoutModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        workout={workout}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
      />
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
});
