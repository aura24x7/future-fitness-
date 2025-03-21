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
import { useOnboarding } from '../../contexts/OnboardingContext';
import { colors } from '../../theme/colors';
import { COUNTRIES, STATES } from '../../data/locationData';
import { useTheme } from '../../theme/ThemeProvider';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type LocationScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Location'>;
};

const LocationScreen: React.FC<LocationScreenProps> = ({ navigation }) => {
  const { updateOnboardingData } = useOnboarding();
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const { isDarkMode } = useTheme();

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

  // Platform-specific picker styles for better contrast
  const pickerProps = Platform.select({
    ios: {
      itemStyle: { 
        color: isDarkMode ? colors.text.primary.dark : '#1F2937',
        backgroundColor: isDarkMode ? '#1A1A1A' : '#F3F4F6',
      }
    },
    android: {
      style: [
        styles.picker,
        { 
          color: isDarkMode ? '#FFFFFF' : '#1F2937',
          backgroundColor: isDarkMode ? '#1A1A1A' : '#F3F4F6',
        }
      ],
      dropdownIconColor: isDarkMode ? '#FFFFFF' : '#1F2937',
      mode: 'dialog' as const
    }
  });

  const getPickerItemColor = () => {
    if (Platform.OS === 'android') {
      return isDarkMode ? '#FFFFFF' : '#1F2937';
    }
    return isDarkMode ? colors.text.primary.dark : '#1F2937';
  };

  return (
    <ScrollView 
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? colors.background.dark : colors.background.light }
      ]} 
      bounces={false}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <LinearGradient
        colors={isDarkMode ? 
          [colors.background.dark, colors.background.dark] : 
          [colors.background.light, '#F5F3FF']
        }
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[
            styles.title,
            { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
          ]}>Where are you from?</Text>
          <Text style={[
            styles.subtitle,
            { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }
          ]}>
            This helps us provide personalized workout plans and dietary recommendations based on your location
          </Text>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={[
            styles.label,
            { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
          ]}>Country</Text>
          <View style={[
            styles.pickerWrapper,
            {
              backgroundColor: isDarkMode ? '#1A1A1A' : '#F3F4F6',
              borderColor: selectedCountry ? 
                (isDarkMode ? colors.primaryLight : colors.primary) : 
                (isDarkMode ? '#2A2A2A' : '#E5E7EB'),
            },
            selectedCountry && {
              backgroundColor: isDarkMode ? '#2A2A2A' : '#F9FAFB',
            }
          ]}>
            <Picker
              selectedValue={selectedCountry}
              onValueChange={(value) => {
                setSelectedCountry(value);
                setSelectedState('');
              }}
              {...pickerProps}
            >
              <Picker.Item 
                label="Select your country" 
                value="" 
                color={isDarkMode ? 'rgba(255,255,255,0.5)' : '#6B7280'} 
                enabled={false}
              />
              {COUNTRIES.map((country) => (
                <Picker.Item
                  key={country.code}
                  label={country.name}
                  value={country.code}
                  color={getPickerItemColor()}
                  style={Platform.select({
                    android: {
                      backgroundColor: isDarkMode ? '#1A1A1A' : '#F3F4F6',
                    }
                  })}
                />
              ))}
            </Picker>
          </View>

          {selectedCountry && (
            <>
              <Text style={[
                styles.label,
                { 
                  marginTop: 20,
                  color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light 
                }
              ]}>State/Region</Text>
              <View style={[
                styles.pickerWrapper,
                {
                  backgroundColor: isDarkMode ? '#1A1A1A' : '#F3F4F6',
                  borderColor: selectedState ? 
                    (isDarkMode ? colors.primaryLight : colors.primary) : 
                    (isDarkMode ? '#2A2A2A' : '#E5E7EB'),
                },
                selectedState && {
                  backgroundColor: isDarkMode ? '#2A2A2A' : '#F9FAFB',
                }
              ]}>
                <Picker
                  selectedValue={selectedState}
                  onValueChange={setSelectedState}
                  enabled={availableStates.length > 0}
                  {...pickerProps}
                >
                  <Picker.Item 
                    label="Select your state" 
                    value="" 
                    color={isDarkMode ? 'rgba(255,255,255,0.5)' : '#6B7280'} 
                    enabled={false}
                  />
                  {availableStates.map((state) => (
                    <Picker.Item
                      key={state.code}
                      label={state.name}
                      value={state.code}
                      color={getPickerItemColor()}
                      style={Platform.select({
                        android: {
                          backgroundColor: isDarkMode ? '#1A1A1A' : '#F3F4F6',
                        }
                      })}
                    />
                  ))}
                </Picker>
              </View>
            </>
          )}
        </View>

        <View style={styles.progressContainer}>
          <View style={[
            styles.progressBar,
            { backgroundColor: isDarkMode ? '#1A1A1A' : 'rgba(139, 92, 246, 0.2)' }
          ]}>
            <View style={[
              styles.progress,
              { backgroundColor: isDarkMode ? colors.primaryLight : colors.primary }
            ]} />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleNext}
          disabled={!selectedCountry || !selectedState}
          style={[
            styles.button,
            (!selectedCountry || !selectedState) && styles.buttonDisabled
          ]}
        >
          <LinearGradient
            colors={isDarkMode ? 
              [colors.primaryLight, colors.primary] :
              ['#B794F6', '#9F7AEA']
            }
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
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
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
    marginBottom: 8,
  },
  pickerWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
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
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 40,
  },
  progressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
  },
  progress: {
    width: '90%',
    height: '100%',
    borderRadius: 3,
  },
});

export default LocationScreen;
