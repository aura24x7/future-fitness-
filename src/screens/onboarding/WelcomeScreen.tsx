import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { TargetIcon, AIIcon, ProgressIcon } from '../../assets/icons/icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBackground}>
            <AIIcon size={48} />
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.title}>AI Powered Fitness</Text>
          <Text style={styles.subtitle}>
            Your journey to a healthier lifestyle begins with personalized, AI-driven guidance
          </Text>
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <View style={styles.iconContainer}>
              <TargetIcon size={24} />
            </View>
            <Text style={styles.summaryTitle}>Set Your Goals</Text>
            <Text style={styles.summaryText}>Personalized fitness targets</Text>
          </View>

          <View style={styles.summaryItem}>
            <View style={styles.iconContainer}>
              <AIIcon size={24} />
            </View>
            <Text style={styles.summaryTitle}>AI Guidance</Text>
            <Text style={styles.summaryText}>Smart workout planning</Text>
          </View>

          <View style={styles.summaryItem}>
            <View style={styles.iconContainer}>
              <ProgressIcon size={24} />
            </View>
            <Text style={styles.summaryTitle}>Track Progress</Text>
            <Text style={styles.summaryText}>Monitor your journey</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('NameInput')}
          style={styles.buttonContainer}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#A78BFA', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progress, { width: '14%' }]} />
          </View>
          <Text style={styles.progressText}>Step 1 of 7</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  logoContainer: {
    marginTop: 20,
    marginBottom: 32,
    alignItems: 'center',
  },
  logoBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  welcomeText: {
    fontSize: 20,
    color: '#6D28D9',
    fontWeight: '500',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: -0.2,
    paddingHorizontal: 20,
    maxWidth: 320,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 48,
    paddingHorizontal: 8,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 1,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  button: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default WelcomeScreen;
