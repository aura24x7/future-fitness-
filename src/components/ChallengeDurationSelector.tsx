import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { CHALLENGE_DURATIONS } from '../utils/challengeUtils';

interface ChallengeDurationSelectorProps {
  selectedDuration: string;
  onSelectDuration: (durationId: string) => void;
}

const ChallengeDurationSelector: React.FC<ChallengeDurationSelectorProps> = ({
  selectedDuration,
  onSelectDuration,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CHALLENGE_DURATIONS.map((duration) => (
        <TouchableOpacity
          key={duration.id}
          style={[
            styles.durationCard,
            selectedDuration === duration.id && styles.selectedDurationCard,
          ]}
          onPress={() => onSelectDuration(duration.id)}
        >
          <Text
            style={[
              styles.durationName,
              selectedDuration === duration.id && styles.selectedDurationName,
            ]}
          >
            {duration.name}
          </Text>
          {duration.id !== 'custom' && (
            <Text
              style={[
                styles.durationDays,
                selectedDuration === duration.id && styles.selectedDurationDays,
              ]}
            >
              {duration.days} days
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  durationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedDurationCard: {
    backgroundColor: '#6366F1',
  },
  durationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  selectedDurationName: {
    color: '#FFFFFF',
  },
  durationDays: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedDurationDays: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default ChallengeDurationSelector;
