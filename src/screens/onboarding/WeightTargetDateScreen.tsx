import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Text } from 'tamagui';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { RootStackParamList } from '../../types/navigation';
import { useTheme } from '../../theme/ThemeProvider';
import { addMonths, isBefore, addDays, format } from 'date-fns';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';

type WeightTargetDateScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WeightTargetDate'>;

const { width } = Dimensions.get('window');

export const WeightTargetDateScreen = () => {
  const navigation = useNavigation<WeightTargetDateScreenNavigationProp>();
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const { isDarkMode } = useTheme();
  
  // Set minimum date to tomorrow and maximum date to 2 years from now
  const minDate = addDays(new Date(), 1);
  const maxDate = addMonths(new Date(), 24);
  
  // Default to 6 months from now
  const [targetDate, setTargetDate] = useState<Date>(addMonths(new Date(), 6));
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');
  const [error, setError] = useState<string>('');

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      if (isBefore(selectedDate, minDate)) {
        setError('Please select a future date');
        return;
      }
      setTargetDate(selectedDate);
      setError('');
    }
  };

  const handleContinue = async () => {
    if (isBefore(targetDate, minDate)) {
      setError('Please select a future date');
      return;
    }

    try {
      await updateOnboardingData({
        weightTargetDate: targetDate
      });

      navigation.navigate('Location');
    } catch (error) {
      console.error('Error updating target date:', error);
      setError('Failed to save your target date. Please try again.');
    }
  };

  const showDatepicker = () => {
    setShowPicker(true);
  };

  const formatDisplayDate = (date: Date) => {
    return format(date, 'MMMM d, yyyy');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={isDarkMode ? 
          [colors.background.dark, colors.background.dark] : 
          [colors.background.light, '#F5F3FF']
        }
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.duration(1000).springify()}
          style={styles.content}
        >
          <View style={styles.header}>
            <Text
              style={[styles.title, { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }]}
              fontSize={32}
              fontWeight="700"
            >
              When do you want to reach your goal?
            </Text>
            
            <Text
              style={[styles.subtitle, { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }]}
              fontSize={16}
            >
              Set a realistic target date for achieving your weight goal. A healthy rate is about 0.5-1 kg per week.
            </Text>
          </View>

          <View style={styles.dateSection}>
            {Platform.OS === 'android' && (
              <TouchableOpacity
                onPress={showDatepicker}
                style={[
                  styles.dateButton,
                  {
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#ffffff',
                  }
                ]}
              >
                <Text
                  style={{ color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }}
                  fontSize={18}
                >
                  {formatDisplayDate(targetDate)}
                </Text>
              </TouchableOpacity>
            )}

            {showPicker && (
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={targetDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  minimumDate={minDate}
                  maximumDate={maxDate}
                  textColor={isDarkMode ? '#FFFFFF' : '#000000'}
                  themeVariant={isDarkMode ? 'dark' : 'light'}
                  style={[
                    styles.datePicker,
                    Platform.OS === 'android' && {
                      width: width - 48,
                      height: 200,
                      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#ffffff',
                    }
                  ]}
                />
                {Platform.OS === 'android' && (
                  <TouchableOpacity
                    onPress={() => setShowPicker(false)}
                    style={[
                      styles.doneButton,
                      {
                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#ffffff',
                      }
                    ]}
                  >
                    <Text style={{ color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }}>
                      Done
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {error ? (
            <Text color="$red10" fontSize={14} textAlign="center">
              {error}
            </Text>
          ) : null}

          <View style={styles.footer}>
            <TouchableOpacity onPress={handleContinue}>
              <LinearGradient
                colors={['#6366F1', '#4338CA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.continueButton}
              >
                <Text style={styles.buttonText} color="#FFFFFF" fontSize={17} fontWeight="600">
                  Continue
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={[
              styles.progressBar,
              { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
            ]}>
              <LinearGradient
                colors={['#6366F1', '#4338CA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progress, { width: '75%' }]}
              />
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  dateSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  dateButton: {
    width: width - 48,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  pickerContainer: {
    width: Platform.OS === 'ios' ? width - 48 : width - 48,
    backgroundColor: 'transparent',
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
  },
  datePicker: {
    width: Platform.OS === 'ios' ? width - 48 : width - 48,
    height: Platform.OS === 'ios' ? 200 : 200,
  },
  doneButton: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 'auto',
  },
  continueButton: {
    width: width - 48,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    letterSpacing: 0.5,
  },
  progressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
  },
  progress: {
    height: '100%',
    borderRadius: 2,
  },
});

export default WeightTargetDateScreen; 