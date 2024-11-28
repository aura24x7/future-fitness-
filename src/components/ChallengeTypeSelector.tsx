import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CHALLENGE_TYPES } from '../utils/challengeUtils';

interface ChallengeTypeSelectorProps {
  selectedType: string;
  onSelectType: (type: string) => void;
}

const ChallengeTypeSelector: React.FC<ChallengeTypeSelectorProps> = ({
  selectedType,
  onSelectType,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CHALLENGE_TYPES.map((type) => (
        <TouchableOpacity
          key={type.id}
          style={[
            styles.typeCard,
            selectedType === type.id && styles.selectedTypeCard,
          ]}
          onPress={() => onSelectType(type.id)}
        >
          <View
            style={[
              styles.iconContainer,
              selectedType === type.id && styles.selectedIconContainer,
            ]}
          >
            <Ionicons
              name={type.icon as any}
              size={24}
              color={selectedType === type.id ? '#FFFFFF' : '#6366F1'}
            />
          </View>
          <Text
            style={[
              styles.typeName,
              selectedType === type.id && styles.selectedTypeName,
            ]}
          >
            {type.name}
          </Text>
          <Text
            style={[
              styles.typeDescription,
              selectedType === type.id && styles.selectedTypeDescription,
            ]}
            numberOfLines={2}
          >
            {type.description}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  typeCard: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedTypeCard: {
    backgroundColor: '#6366F1',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  typeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  selectedTypeName: {
    color: '#FFFFFF',
  },
  typeDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  selectedTypeDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default ChallengeTypeSelector;
