import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { useOnboarding } from '../../context/OnboardingContext';
import { colors, spacing, borderRadius } from '../../theme/colors';
import { COUNTRIES, STATES } from '../../data/locationData';

const LocationScreen = ({ navigation }) => {
  const { updateOnboardingData } = useOnboarding();
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');

  const handleNext = () => {
    if (selectedCountry && selectedState) {
      updateOnboardingData({
        country: selectedCountry,
        state: selectedState,
      });
      navigation.navigate('WorkoutPreference');
    }
  };

  const availableStates = selectedCountry ? STATES[selectedCountry] || [] : [];

  return (
    <ScrollView style={styles.container} bounces={false}>
      <LinearGradient
        colors={['#FFFFFF', '#FFFFFF']}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Where are you from?</Text>
          <Text style={styles.subtitle}>
            This helps us provide personalized workout plans and dietary recommendations based on your location
          </Text>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Country</Text>
          <View style={[styles.pickerWrapper, selectedCountry && styles.pickerWrapperActive]}>
            <Picker
              selectedValue={selectedCountry}
              onValueChange={(value) => {
                setSelectedCountry(value);
                setSelectedState('');
              }}
              style={styles.picker}
            >
              <Picker.Item label="Select your country" value="" color="#6B7280" />
              {COUNTRIES.map((country) => (
                <Picker.Item
                  key={country.code}
                  label={country.name}
                  value={country.code}
                  color="#1F2937"
                />
              ))}
            </Picker>
          </View>

          {selectedCountry && (
            <>
              <Text style={[styles.label, { marginTop: 20 }]}>State/Region</Text>
              <View style={[styles.pickerWrapper, selectedState && styles.pickerWrapperActive]}>
                <Picker
                  selectedValue={selectedState}
                  onValueChange={setSelectedState}
                  style={styles.picker}
                  enabled={availableStates.length > 0}
                >
                  <Picker.Item label="Select your state" value="" color="#6B7280" />
                  {availableStates.map((state) => (
                    <Picker.Item
                      key={state.code}
                      label={state.name}
                      value={state.code}
                      color="#1F2937"
                    />
                  ))}
                </Picker>
              </View>
            </>
          )}
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progress, { width: '50%' }]} />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleNext}
          disabled={!selectedCountry || !selectedState}
          style={[styles.button, (!selectedCountry || !selectedState) && styles.buttonDisabled]}
        >
          <LinearGradient
            colors={['#B794F6', '#9F7AEA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  pickerContainer: {
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  pickerWrapper: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pickerWrapperActive: {
    borderColor: '#9F7AEA',
    backgroundColor: '#F9FAFB',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  button: {
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#9F7AEA',
    borderRadius: 2,
  },
});

export default LocationScreen;
