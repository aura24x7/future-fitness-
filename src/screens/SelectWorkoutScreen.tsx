import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';

interface SelectWorkoutScreenProps {
  route: {
    params: {
      groupId: string;
    };
  };
}

interface Workout {
  id: string;
  name: string;
  exercises: {
    name: string;
    sets: number;
    reps: number;
    weight?: number;
  }[];
  duration: number;
  calories: number;
  lastPerformed?: string;
}

const SelectWorkoutScreen: React.FC<SelectWorkoutScreenProps> = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId } = route.params as SelectWorkoutScreenProps['route']['params'];

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadWorkouts = async () => {
    try {
      // TODO: Replace with actual API call
      const mockWorkouts: Workout[] = [
        {
          id: '1',
          name: 'Full Body Workout',
          exercises: [
            { name: 'Push-ups', sets: 3, reps: 12 },
            { name: 'Squats', sets: 3, reps: 15 },
            { name: 'Pull-ups', sets: 3, reps: 8 },
          ],
          duration: 45,
          calories: 350,
          lastPerformed: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          name: 'Upper Body Strength',
          exercises: [
            { name: 'Bench Press', sets: 4, reps: 10, weight: 135 },
            { name: 'Rows', sets: 4, reps: 12, weight: 100 },
            { name: 'Shoulder Press', sets: 3, reps: 12, weight: 65 },
          ],
          duration: 50,
          calories: 400,
          lastPerformed: '2024-01-14T15:30:00Z',
        },
      ];
      setWorkouts(mockWorkouts);
      setFilteredWorkouts(mockWorkouts);
    } catch (error) {
      console.error('Error loading workouts:', error);
      Alert.alert('Error', 'Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = workouts.filter((workout) =>
      workout.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredWorkouts(filtered);
  };

  const handleSelectWorkout = (workout: Workout) => {
    navigation.navigate('ShareWorkout' as never, {
      groupId,
      workout,
    } as never);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  const renderWorkoutCard = ({ item }: { item: Workout }) => (
    <TouchableOpacity
      style={styles.workoutCard}
      onPress={() => handleSelectWorkout(item)}
    >
      <View style={styles.workoutHeader}>
        <Text style={styles.workoutName}>{item.name}</Text>
        <Text style={styles.lastPerformed}>
          Last: {formatDate(item.lastPerformed)}
        </Text>
      </View>

      <View style={styles.workoutStats}>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Text style={styles.statText}>{item.duration} min</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="flame-outline" size={16} color="#6B7280" />
          <Text style={styles.statText}>{item.calories} cal</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="barbell-outline" size={16} color="#6B7280" />
          <Text style={styles.statText}>
            {item.exercises.length} exercises
          </Text>
        </View>
      </View>

      <View style={styles.exercisesList}>
        {item.exercises.slice(0, 3).map((exercise, index) => (
          <Text key={index} style={styles.exerciseItem}>
            {exercise.name} • {exercise.sets}×{exercise.reps}
            {exercise.weight ? ` • ${exercise.weight}lbs` : ''}
          </Text>
        ))}
        {item.exercises.length > 3 && (
          <Text style={styles.moreExercises}>
            +{item.exercises.length - 3} more exercises
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6366F1', '#4F46E5']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Workout</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search workouts..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        <FlatList
          data={filteredWorkouts}
          keyExtractor={(item) => item.id}
          renderItem={renderWorkoutCard}
          contentContainerStyle={styles.workoutsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No workouts found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutsList: {
    padding: 16,
  },
  workoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  lastPerformed: {
    fontSize: 12,
    color: '#6B7280',
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#6B7280',
  },
  exercisesList: {
    gap: 4,
  },
  exerciseItem: {
    fontSize: 14,
    color: '#4B5563',
  },
  moreExercises: {
    fontSize: 14,
    color: '#6366F1',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
});

export default SelectWorkoutScreen;
