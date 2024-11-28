import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import EvaPlaceholder from '../../components/EvaPlaceholder';

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <EvaPlaceholder size={100} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to AI Fit</Text>
          <Text style={styles.subtitle}>
            Meet Eva, your personal AI fitness companion. Together, we'll create your perfect fitness journey.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('NameInput')}
        >
          <LinearGradient
            colors={['#B794F6', '#9F7AEA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: '14%' }]} />
        </View>
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  imageContainer: {
    width: width * 0.8,
    height: height * 0.25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 32,
    shadowColor: '#9F7AEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#F2F2F2',
    borderRadius: 2,
    marginTop: 48,
  },
  progress: {
    height: '100%',
    backgroundColor: '#9F7AEA',
    borderRadius: 2,
  },
});

export default WelcomeScreen;
