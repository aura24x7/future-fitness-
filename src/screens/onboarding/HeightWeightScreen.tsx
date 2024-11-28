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
import EvaPlaceholder from '../../components/EvaPlaceholder';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
      tint: "light" as const,
      intensity: 50,
    } : {};

    if (heightUnit === 'cm') {
      return (
        <GlassContainer {...containerProps} style={styles.pickerContainer}>
          <Picker
            selectedValue={heightCm}
            style={styles.picker}
            itemStyle={styles.pickerItem}
            onValueChange={(itemValue: string) => setHeightCm(itemValue)}
          >
            {Array.from({ length: 171 }, (_, i) => i + 130).map((cm) => (
              <Picker.Item key={cm} label={`${cm} cm`} value={cm.toString()} />
            ))}
          </Picker>
        </GlassContainer>
      );
    } else {
      return (
        <View style={styles.feetInchesContainer}>
          <GlassContainer {...containerProps} style={[styles.pickerContainer, styles.feetPicker]}>
            <Picker
              selectedValue={heightFeet}
              style={styles.picker}
              itemStyle={styles.pickerItem}
              onValueChange={(itemValue: string) => setHeightFeet(itemValue)}
            >
              {Array.from({ length: 5 }, (_, i) => i + 4).map((feet) => (
                <Picker.Item key={feet} label={`${feet} ft`} value={feet.toString()} />
              ))}
            </Picker>
          </GlassContainer>
          <GlassContainer {...containerProps} style={[styles.pickerContainer, styles.inchesPicker]}>
            <Picker
              selectedValue={heightInches}
              style={styles.picker}
              itemStyle={styles.pickerItem}
              onValueChange={(itemValue: string) => setHeightInches(itemValue)}
            >
              {Array.from({ length: 12 }, (_, i) => i).map((inch) => (
                <Picker.Item key={inch} label={`${inch} in`} value={inch.toString()} />
              ))}
            </Picker>
          </GlassContainer>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.background} />
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
            <EvaPlaceholder size={100} />
            <Text style={styles.title}>What's your height and weight?</Text>
            <Text style={styles.subtitle}>
              This helps us personalize your fitness journey
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputsContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Height</Text>
                <View style={styles.heightContainer}>
                  {renderHeightPicker()}
                  <TouchableOpacity
                    style={styles.unitButton}
                    onPress={toggleHeightUnit}
                  >
                    <LinearGradient
                      colors={['#B794F6', '#9F7AEA']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[StyleSheet.absoluteFill, styles.unitButtonGradient]}
                    />
                    <Text style={styles.unitButtonText}>{heightUnit.toUpperCase()}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Weight</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={weight}
                    onChangeText={setWeight}
                    placeholder={`Enter your weight`}
                    placeholderTextColor="rgba(0,0,0,0.4)"
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    style={styles.unitButton}
                    onPress={toggleWeightUnit}
                  >
                    <LinearGradient
                      colors={['#B794F6', '#9F7AEA']}
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
                colors={['#B794F6', '#9F7AEA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[StyleSheet.absoluteFill, styles.buttonGradient]}
              />
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.progressBar}>
            <View style={[styles.progress, { width: '70%' }]} />
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
    backgroundColor: '#fff',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: '#fff',
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
    color: '#1a1a1a',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
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
    color: '#1a1a1a',
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
    backgroundColor: Platform.OS === 'ios' ? '#f5f5f5' : '#f5f5f5',
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
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1a1a1a',
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
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
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 2,
    marginTop: 40,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 2,
  },
});

export default HeightWeightScreen;
