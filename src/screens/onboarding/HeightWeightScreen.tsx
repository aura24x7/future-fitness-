import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ScrollView,
  Platform,
  Animated,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useOnboarding } from '../../context/OnboardingContext';
import { BlurView, BlurTint } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeProvider';
import { colors } from '../../theme/colors';
import { StatusBar } from 'expo-status-bar';

type RootStackParamList = {
  Welcome: undefined;
  NameInput: undefined;
  Birthday: undefined;
  Gender: undefined;
  HeightWeight: undefined;
  FitnessGoal: undefined;
  ActivityLevel: undefined;
  DietaryPreference: undefined;
  WorkoutPreference: undefined;
  FinalSetup: undefined;
};

type HeightWeightScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'HeightWeight'>;
};

const HeightWeightScreen: React.FC<HeightWeightScreenProps> = ({ navigation }) => {
  const { updateOnboardingData } = useOnboarding();
  const { isDarkMode } = useTheme();
  const [heightFeet, setHeightFeet] = useState('5');
  const [heightInches, setHeightInches] = useState('0');
  const [heightCm, setHeightCm] = useState('170');
  const [weight, setWeight] = useState('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [scaleAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleContinue = () => {
    if ((heightUnit === 'cm' ? heightCm : heightFeet) && weight) {
      let heightValue: number;
      if (heightUnit === 'cm') {
        heightValue = parseInt(heightCm);
      } else {
        heightValue = (parseInt(heightFeet) * 30.48) + (parseInt(heightInches) * 2.54);
      }

      updateOnboardingData({
        height: {
          value: heightValue,
          unit: 'cm', // Always store in cm internally
        },
        weight: {
          value: parseFloat(weight),
          unit: weightUnit,
        },
      });
      navigation.navigate('DietaryPreference');
    }
  };

  const toggleHeightUnit = () => {
    if (heightUnit === 'cm') {
      const totalInches = parseInt(heightCm) / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      setHeightFeet(feet.toString());
      setHeightInches(inches.toString());
      setHeightUnit('ft');
    } else {
      const cm = Math.round((parseInt(heightFeet) * 30.48) + (parseInt(heightInches) * 2.54));
      setHeightCm(cm.toString());
      setHeightUnit('cm');
    }
  };

  const toggleWeightUnit = () => {
    if (weight) {
      const value = parseFloat(weight);
      if (weightUnit === 'kg') {
        setWeight((value * 2.20462).toFixed(1));
        setWeightUnit('lbs');
      } else {
        setWeight((value / 2.20462).toFixed(1));
        setWeightUnit('kg');
      }
    }
    setWeightUnit(prev => prev === 'kg' ? 'lbs' : 'kg');
  };

  const renderHeightPicker = () => {
    const GlassContainer = Platform.OS === 'ios' ? BlurView : View;
    const containerProps = Platform.OS === 'ios' ? {
      tint: (isDarkMode ? "dark" : "light") as BlurTint,
      intensity: isDarkMode ? 80 : 50,
    } : {};

    if (heightUnit === 'cm') {
      return (
        <GlassContainer {...containerProps} style={[
          styles.pickerContainer,
          { 
            backgroundColor: isDarkMode ? '#1A1A1A' : '#f5f5f5',
            borderColor: isDarkMode ? '#2A2A2A' : '#E5E7EB',
            borderWidth: 1,
          }
        ]}>
          <Picker
            selectedValue={heightCm}
            style={[
              styles.picker,
              { backgroundColor: isDarkMode ? '#1A1A1A' : '#f5f5f5' }
            ]}
            itemStyle={[
              styles.pickerItem,
              { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
            ]}
            dropdownIconColor={isDarkMode ? colors.text.primary.dark : colors.text.primary.light}
            onValueChange={(itemValue: string) => setHeightCm(itemValue)}
          >
            {Array.from({ length: 171 }, (_, i) => i + 130).map((cm) => (
              <Picker.Item 
                key={cm} 
                label={`${cm} cm`} 
                value={cm.toString()}
                color={isDarkMode ? colors.text.primary.dark : colors.text.primary.light}
                style={{ backgroundColor: isDarkMode ? '#1A1A1A' : '#f5f5f5' }}
              />
            ))}
          </Picker>
        </GlassContainer>
      );
    } else {
      return (
        <View style={styles.feetInchesContainer}>
          <GlassContainer {...containerProps} style={[
            styles.pickerContainer,
            styles.feetPicker,
            { 
              backgroundColor: isDarkMode ? '#1A1A1A' : '#f5f5f5',
              borderColor: isDarkMode ? '#2A2A2A' : '#E5E7EB',
              borderWidth: 1,
            }
          ]}>
            <Picker
              selectedValue={heightFeet}
              style={[
                styles.picker,
                { backgroundColor: isDarkMode ? '#1A1A1A' : '#f5f5f5' }
              ]}
              itemStyle={[
                styles.pickerItem,
                { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
              ]}
              dropdownIconColor={isDarkMode ? colors.text.primary.dark : colors.text.primary.light}
              onValueChange={(itemValue: string) => setHeightFeet(itemValue)}
            >
              {Array.from({ length: 5 }, (_, i) => i + 4).map((feet) => (
                <Picker.Item 
                  key={feet} 
                  label={`${feet} ft`} 
                  value={feet.toString()}
                  color={isDarkMode ? colors.text.primary.dark : colors.text.primary.light}
                  style={{ backgroundColor: isDarkMode ? '#1A1A1A' : '#f5f5f5' }}
                />
              ))}
            </Picker>
          </GlassContainer>
          <GlassContainer {...containerProps} style={[
            styles.pickerContainer,
            styles.inchesPicker,
            { 
              backgroundColor: isDarkMode ? '#1A1A1A' : '#f5f5f5',
              borderColor: isDarkMode ? '#2A2A2A' : '#E5E7EB',
              borderWidth: 1,
            }
          ]}>
            <Picker
              selectedValue={heightInches}
              style={[
                styles.picker,
                { backgroundColor: isDarkMode ? '#1A1A1A' : '#f5f5f5' }
              ]}
              itemStyle={[
                styles.pickerItem,
                { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
              ]}
              dropdownIconColor={isDarkMode ? colors.text.primary.dark : colors.text.primary.light}
              onValueChange={(itemValue: string) => setHeightInches(itemValue)}
            >
              {Array.from({ length: 12 }, (_, i) => i).map((inch) => (
                <Picker.Item 
                  key={inch} 
                  label={`${inch} in`} 
                  value={inch.toString()}
                  color={isDarkMode ? colors.text.primary.dark : colors.text.primary.light}
                  style={{ backgroundColor: isDarkMode ? '#1A1A1A' : '#f5f5f5' }}
                />
              ))}
            </Picker>
          </GlassContainer>
        </View>
      );
    }
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
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View 
          style={[
            styles.content,
            {
              transform: [
                {
                  scale: scaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
              opacity: scaleAnim,
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[
              styles.title,
              { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
            ]}>What's your height and weight?</Text>
            <Text style={[
              styles.subtitle,
              { color: isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light }
            ]}>
              This helps me calculate your fitness metrics accurately
            </Text>
          </View>

          <View style={[
            styles.card,
            {
              backgroundColor: isDarkMode ? '#1A1A1A' : '#fff',
              shadowColor: isDarkMode ? '#000' : '#000',
              shadowOpacity: isDarkMode ? 0.3 : 0.1,
              borderColor: isDarkMode ? '#2A2A2A' : 'transparent',
              borderWidth: 1,
            }
          ]}>
            <View style={styles.inputsContainer}>
              <View style={styles.inputGroup}>
                <Text style={[
                  styles.label,
                  { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
                ]}>Height</Text>
                <View style={styles.heightContainer}>
                  {renderHeightPicker()}
                  <TouchableOpacity
                    style={styles.unitButton}
                    onPress={toggleHeightUnit}
                  >
                    <LinearGradient
                      colors={isDarkMode ? 
                        [colors.primaryLight, colors.primary] :
                        ['#B794F6', '#9F7AEA']
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[StyleSheet.absoluteFill, styles.unitButtonGradient]}
                    />
                    <Text style={styles.unitButtonText}>{heightUnit.toUpperCase()}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[
                  styles.label,
                  { color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light }
                ]}>Weight</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDarkMode ? '#2A2A2A' : '#f5f5f5',
                        color: isDarkMode ? colors.text.primary.dark : colors.text.primary.light,
                      }
                    ]}
                    value={weight}
                    onChangeText={setWeight}
                    placeholder={`Enter your weight`}
                    placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    style={styles.unitButton}
                    onPress={toggleWeightUnit}
                  >
                    <LinearGradient
                      colors={isDarkMode ? 
                        [colors.primaryLight, colors.primary] :
                        ['#B794F6', '#9F7AEA']
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[StyleSheet.absoluteFill, styles.unitButtonGradient]}
                    />
                    <Text style={styles.unitButtonText}>{weightUnit.toUpperCase()}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.button,
                (!weight || (heightUnit === 'cm' ? !heightCm : !heightFeet)) && styles.buttonDisabled
              ]}
              onPress={handleContinue}
              disabled={!weight || (heightUnit === 'cm' ? !heightCm : !heightFeet)}
            >
              <LinearGradient
                colors={isDarkMode ? 
                  [colors.primaryLight, colors.primary] :
                  ['#B794F6', '#9F7AEA']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[StyleSheet.absoluteFill, styles.buttonGradient]}
              />
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>

          <View style={[
            styles.progressBar,
            { backgroundColor: isDarkMode ? '#1A1A1A' : 'rgba(99, 102, 241, 0.2)' }
          ]}>
            <View style={[
              styles.progress,
              { backgroundColor: isDarkMode ? colors.primaryLight : '#6366f1' }
            ]} />
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    width: '100%',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputsContainer: {
    width: '100%',
    gap: 20,
  },
  inputGroup: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  heightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pickerContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerItem: {
    fontSize: 16,
  },
  feetInchesContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  feetPicker: {
    flex: 1,
  },
  inchesPicker: {
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  unitButton: {
    paddingHorizontal: 16,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    minWidth: 60,
    overflow: 'hidden',
  },
  unitButtonGradient: {
    borderRadius: 12,
  },
  unitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    width: '100%',
    marginTop: 30,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonGradient: {
    borderRadius: 28,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    marginTop: 40,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 2,
  },
});

export default HeightWeightScreen;
