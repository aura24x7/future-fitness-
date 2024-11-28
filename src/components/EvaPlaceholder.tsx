import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface EvaPlaceholderProps {
  size?: number;
  showLabel?: boolean;
}

const EvaPlaceholder: React.FC<EvaPlaceholderProps> = ({ 
  size = 100,
  showLabel = true 
}) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6c8fff', '#4c669f']}
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2
          }
        ]}
      >
        <Text style={styles.initial}>E</Text>
      </LinearGradient>
      {showLabel && <Text style={styles.label}>Eva</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  initial: {
    fontSize: 40,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  label: {
    marginTop: 8,
    fontSize: 16,
    color: '#4c669f',
    fontWeight: '600',
  },
});

export default EvaPlaceholder;
