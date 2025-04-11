import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLiveKit } from '../contexts/LiveKitContext';
import { useNavigation } from '@react-navigation/native';

interface LiveKitFallbackProps {
  featureName?: string;
  alternateScreen?: string;
}

const LiveKitFallback: React.FC<LiveKitFallbackProps> = ({ 
  featureName = "this feature", 
  alternateScreen 
}) => {
  const { isExpoGo } = useLiveKit();
  const navigation = useNavigation();

  const handleNavigate = () => {
    if (alternateScreen) {
      navigation.navigate(alternateScreen as never);
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Feature Not Available</Text>
      
      <Text style={styles.message}>
        {isExpoGo 
          ? `${featureName} requires native functionality that isn't available in Expo Go.`
          : `${featureName} is currently unavailable on your device.`
        }
      </Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          {isExpoGo 
            ? "To use this feature, you'll need to create a development build using 'expo prebuild'."
            : "Please check your device permissions and try again."
          }
        </Text>
      </View>
      
      {alternateScreen && (
        <TouchableOpacity style={styles.button} onPress={handleNavigate}>
          <Text style={styles.buttonText}>
            Continue with Standard Flow
          </Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity 
        style={[styles.button, styles.secondaryButton]} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.secondaryButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  infoBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 32,
    width: '90%',
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
  },
  button: {
    backgroundColor: '#4c669f',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4c669f',
  },
  secondaryButtonText: {
    color: '#4c669f',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default LiveKitFallback; 