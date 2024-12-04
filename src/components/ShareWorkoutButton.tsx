import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

interface ShareWorkoutButtonProps {
  receiverId: string;
  receiverName: string;
  style?: any;
}

export const ShareWorkoutButton: React.FC<ShareWorkoutButtonProps> = ({
  receiverId,
  receiverName,
  style,
}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('ShareWorkout', {
      receiverId,
      receiverName,
      currentUserId: 'current-user-id', // TODO: Get from auth context
      currentUserName: 'Current User', // TODO: Get from auth context
    });
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handlePress}
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
