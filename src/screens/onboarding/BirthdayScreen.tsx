import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  Modal,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboarding } from '../../context/OnboardingContext';
import CustomDatePicker from '../../components/CustomDatePicker';
import { useTheme } from '../../theme/ThemeProvider';
import { colors } from '../../theme/colors';
import { StatusBar } from 'expo-status-bar';

const BirthdayScreen = ({ navigation, route }) => {
  const [date, setDate] = useState(new Date(2000, 0, 1));
  const [showPicker, setShowPicker] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const { updateOnboardingData } = useOnboarding();
  const { name } = route.params;
  const { height } = Dimensions.get('window');
  const { isDarkMode } = useTheme();

  const handleDateChange = (selectedDate: Date) => {
    setDate(selectedDate);
  };

  const handleContinue = () => {
    updateOnboardingData({ birthday: date });
    navigation.navigate('Gender');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const showDatePicker = () => {
    setShowPicker(true);
    Animated.spring(animation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const hideDatePicker = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowPicker(false));
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDarkMode ? colors.background.dark : colors.background.light }
    ]}>
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
          ]}>When's your birthday?</Text>
          <Text style={[
            styles.subtitle,
            { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }
          ]}>
            Hi {name}, this helps me personalize your fitness journey
          </Text>
        </View>

        <View style={styles.dateContainer}>
          <TouchableOpacity
            style={[
              styles.dateButton,
              {
                backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F5F5',
                shadowColor: isDarkMode ? '#000000' : '#000000',
              }
            ]}
            onPress={showDatePicker}
            activeOpacity={0.8}
          >
            <View>
              <Text style={[
                styles.dateLabel,
                { color: isDarkMode ? colors.text.secondary.dark : '#666666' }
              ]}>Selected Date</Text>
              <Text style={[
                styles.dateButtonText,
                { color: isDarkMode ? colors.text.primary.dark : '#1A1A1A' }
              ]}>{formatDate(date)}</Text>
              <Text style={[
                styles.ageText,
                { color: isDarkMode ? colors.text.secondary.dark : '#666666' }
              ]}>Age: {calculateAge(date)} years</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleContinue}>
            <LinearGradient
              colors={isDarkMode ? 
                [colors.primaryLight, colors.primary] :
                [colors.primaryLight, colors.primary]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={[
          styles.progressBar,
          { backgroundColor: isDarkMode ? '#1A1A1A' : '#F2F2F2' }
        ]}>
          <View style={[
            styles.progress,
            { 
              width: '40%',
              backgroundColor: isDarkMode ? colors.primaryLight : colors.primary 
            }
          ]} />
        </View>
      </View>

      <Modal
        visible={showPicker}
        transparent
        animationType="none"
      >
        <View style={[
          styles.modalOverlay,
          { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.4)' }
        ]}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
                transform: [
                  {
                    translateY: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [height, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <CustomDatePicker
              value={date}
              onChange={handleDateChange}
              onClose={hideDatePicker}
              minimumDate={new Date(1900, 0, 1)}
              maximumDate={new Date()}
            />
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  dateContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  dateButton: {
    padding: 20,
    borderRadius: 16,
    width: width - 48,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  dateButtonText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  ageText: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 4,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: width - 48,
    paddingVertical: 16,
    borderRadius: 16,
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
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  progressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    marginTop: 48,
  },
  progress: {
    height: '100%',
    borderRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default BirthdayScreen;
