import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import ChallengeTypeSelector from '../components/ChallengeTypeSelector';
import ChallengeDurationSelector from '../components/ChallengeDurationSelector';
import ChallengeGoalInput from '../components/ChallengeGoalInput';
import ChallengeRulesRewards from '../components/ChallengeRulesRewards';
import {
  CHALLENGE_DURATIONS,
  DEFAULT_CHALLENGE_RULES,
  SUGGESTED_REWARDS,
  validateChallenge,
} from '../utils/challengeUtils';

const CreateChallengeScreen: React.FC = ({ navigation }: any) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('duration');
  const [durationId, setDurationId] = useState('7days');
  const [goal, setGoal] = useState(0);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [rules, setRules] = useState(DEFAULT_CHALLENGE_RULES);
  const [rewards, setRewards] = useState([SUGGESTED_REWARDS[0]]);

  useEffect(() => {
    const duration = CHALLENGE_DURATIONS.find(d => d.id === durationId);
    if (duration && duration.days > 0) {
      const newEndDate = new Date(startDate);
      newEndDate.setDate(startDate.getDate() + duration.days);
      setEndDate(newEndDate);
    }
  }, [durationId, startDate]);

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const handleCreateChallenge = () => {
    const challenge = {
      title,
      description,
      type,
      goal,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      rules,
      rewards,
    };

    const errors = validateChallenge(challenge);
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }

    // TODO: Implement challenge creation logic
    console.log('Creating challenge:', challenge);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Challenge</Text>
          <Text style={styles.subtitle}>
            Set up a new challenge for your group
          </Text>
        </View>

        <View style={styles.section}>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Challenge Title"
            placeholderTextColor="#9CA3AF"
          />
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your challenge..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Challenge Type</Text>
          <ChallengeTypeSelector
            selectedType={type}
            onSelectType={setType}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Duration</Text>
          <ChallengeDurationSelector
            selectedDuration={durationId}
            onSelectDuration={setDurationId}
          />
        </View>

        <View style={styles.section}>
          <ChallengeGoalInput
            type={type}
            value={goal}
            onChange={setGoal}
            durationDays={
              CHALLENGE_DURATIONS.find(d => d.id === durationId)?.days || 7
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Challenge Period</Text>
          <View style={styles.dateContainer}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartPicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#6366F1" />
              <Text style={styles.dateButtonText}>
                {startDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            <Text style={styles.dateSeperator}>to</Text>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndPicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#6366F1" />
              <Text style={styles.dateButtonText}>
                {endDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ChallengeRulesRewards
          rules={rules}
          rewards={rewards}
          onUpdateRules={setRules}
          onUpdateRewards={setRewards}
        />

        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
            minimumDate={new Date()}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
            minimumDate={startDate}
          />
        )}
      </ScrollView>

      <LinearGradient
        colors={['rgba(255,255,255,0)', '#FFFFFF']}
        style={styles.bottomGradient}
      >
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateChallenge}
        >
          <Text style={styles.createButtonText}>Create Challenge</Text>
        </TouchableOpacity>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  titleInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  descriptionInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    height: 100,
    textAlignVertical: 'top',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1F2937',
  },
  dateSeperator: {
    fontSize: 16,
    color: '#6B7280',
  },
  bottomGradient: {
    padding: 16,
    paddingTop: 32,
  },
  createButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CreateChallengeScreen;
