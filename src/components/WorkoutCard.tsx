import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Exercise } from '../types/workout';
import { Workout } from '../types/workout';
import Checkbox from './Checkbox';
import { DirectShareButton } from './sharing/DirectShareButton';
import { colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeProvider';

interface WorkoutCardProps {
  workout: Workout;
  onPress: () => void;
  onEdit: () => void;
  onExerciseToggle?: (exerciseId: string, completed: boolean) => void;
  showCheckboxes?: boolean;
  currentUserId: string;
  currentUserName: string;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ 
  workout, 
  onPress,
  onEdit, 
  onExerciseToggle,
  showCheckboxes = false,
  currentUserId,
  currentUserName
}) => {
  const { isDarkMode } = useTheme();
  const completedExercises = workout.exercises.filter(e => e.completed).length;
  const totalExercises = workout.exercises.length;
  const progress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        isDarkMode ? styles.containerDark : styles.containerLight
      ]} 
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons 
            name={workout.type === 'strength' ? 'barbell-outline' : 'fitness-outline'} 
            size={24} 
            color={isDarkMode ? colors.text.accent.dark : colors.text.accent.light} 
          />
          <Text style={[
            styles.title,
            isDarkMode ? styles.titleDark : styles.titleLight
          ]}>
            {workout.name}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={onEdit} style={styles.editButton}>
            <Ionicons 
              name="pencil" 
              size={20} 
              color={isDarkMode ? colors.text.accent.dark : colors.text.accent.light} 
            />
          </TouchableOpacity>
          <Text style={[
            styles.duration,
            isDarkMode ? styles.durationDark : styles.durationLight
          ]}>
            {workout.duration} min
          </Text>
        </View>
      </View>

      <View style={[
        styles.stats,
        isDarkMode ? styles.statsDark : styles.statsLight
      ]}>
        <View style={styles.stat}>
          <Text style={[
            styles.statValue,
            isDarkMode ? styles.statValueDark : styles.statValueLight
          ]}>
            {totalExercises}
          </Text>
          <Text style={[
            styles.statLabel,
            isDarkMode ? styles.statLabelDark : styles.statLabelLight
          ]}>
            Exercises
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={[
            styles.statValue,
            isDarkMode ? styles.statValueDark : styles.statValueLight
          ]}>
            {workout.caloriesBurned}
          </Text>
          <Text style={[
            styles.statLabel,
            isDarkMode ? styles.statLabelDark : styles.statLabelLight
          ]}>
            Calories
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={[
            styles.statValue,
            isDarkMode ? styles.statValueDark : styles.statValueLight
          ]}>
            {`${Math.round(progress)}%`}
          </Text>
          <Text style={[
            styles.statLabel,
            isDarkMode ? styles.statLabelDark : styles.statLabelLight
          ]}>
            Complete
          </Text>
        </View>
      </View>

      {showCheckboxes && (
        <View style={[
          styles.exerciseList,
          isDarkMode ? styles.exerciseListDark : styles.exerciseListLight
        ]}>
          {workout.exercises.map((exercise, index) => (
            <View key={exercise.id || index} style={styles.exerciseItem}>
              <Checkbox
                checked={exercise.completed || false}
                onToggle={(checked) => onExerciseToggle?.(exercise.id, checked)}
              />
              <Text style={[
                styles.exerciseName,
                isDarkMode ? styles.exerciseNameDark : styles.exerciseNameLight
              ]}>
                {exercise.name} - {exercise.sets}×{exercise.reps}
                {exercise.weight ? ` @ ${exercise.weight}lbs` : ''}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={[
          styles.date,
          isDarkMode ? styles.dateDark : styles.dateLight
        ]}>
          {new Date(workout.date).toLocaleDateString()}
        </Text>
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={isDarkMode ? colors.text.secondary.dark : colors.text.secondary.light} 
        />
      </View>

      <View style={styles.actionButtons}>
        <DirectShareButton
          workout={workout}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          style={styles.actionButton}
        />
      </View>

      <View style={[
        styles.progressBar,
        isDarkMode ? styles.progressBarDark : styles.progressBarLight
      ]}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${progress}%` },
            isDarkMode ? styles.progressFillDark : styles.progressFillLight
          ]} 
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  containerLight: {
    backgroundColor: colors.background.card.light,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  containerDark: {
    backgroundColor: colors.background.card.dark,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  titleLight: {
    color: colors.text.primary.light,
  },
  titleDark: {
    color: colors.text.primary.dark,
  },
  duration: {
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationLight: {
    color: colors.text.secondary.light,
    backgroundColor: colors.background.secondary.light,
  },
  durationDark: {
    color: colors.text.secondary.dark,
    backgroundColor: colors.background.secondary.dark,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editButton: {
    padding: 5,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  statsLight: {
    borderColor: colors.border.light,
  },
  statsDark: {
    borderColor: colors.border.dark,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statValueLight: {
    color: colors.text.accent.light,
  },
  statValueDark: {
    color: colors.text.accent.dark,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statLabelLight: {
    color: colors.text.secondary.light,
  },
  statLabelDark: {
    color: colors.text.secondary.dark,
  },
  exerciseList: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  exerciseListLight: {
    borderTopColor: colors.border.light,
  },
  exerciseListDark: {
    borderTopColor: colors.border.dark,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  exerciseName: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  exerciseNameLight: {
    color: colors.text.primary.light,
  },
  exerciseNameDark: {
    color: colors.text.primary.dark,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  date: {
    fontSize: 14,
  },
  dateLight: {
    color: colors.text.secondary.light,
  },
  dateDark: {
    color: colors.text.secondary.dark,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  actionButton: {
    padding: 10,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBarLight: {
    backgroundColor: colors.progress.background.light,
  },
  progressBarDark: {
    backgroundColor: colors.progress.background.dark,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressFillLight: {
    backgroundColor: colors.primary,
  },
  progressFillDark: {
    backgroundColor: colors.primaryLight,
  },
});

export default WorkoutCard;
