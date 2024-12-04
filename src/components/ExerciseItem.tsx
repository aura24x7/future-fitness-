import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import WorkoutCard from '../components/WorkoutCard';
import ExerciseItem from '../components/ExerciseItem';
import { useWorkoutTracking } from '../hooks/useWorkoutTracking';

const { width } = Dimensions.get('window');

const WorkoutScreen = ({ navigation }) => {
  const { workouts, updateWorkout } = useWorkoutTracking();
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const handleWorkoutPress = (workout) => {
    setSelectedWorkout(workout);
    setModalVisible(true);
  };

  const handleExerciseToggle = (workoutId, exerciseIndex) => {
    if (!selectedWorkout) return;

    const updatedWorkout = {
      ...selectedWorkout,
      exercises: selectedWorkout.exercises.map((exercise, index) => {
        if (index === exerciseIndex) {
          return { ...exercise, completed: !exercise.completed };
        }
        return exercise;
      }),
    };

    updateWorkout(workoutId, updatedWorkout);
    setSelectedWorkout(updatedWorkout);
  };

  const handleCreateWorkout = () => {
    Alert.alert(
      'Create Workout',
      'Choose workout type:',
      [
        {
          text: 'Strength Training',
          onPress: () => navigation.navigate('CreateWorkout', { type: 'strength' }),
        },
        {
          text: 'Cardio',
          onPress: () => navigation.navigate('CreateWorkout', { type: 'cardio' }),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const filteredWorkouts = useCallback(() => {
    if (filterType === 'all') return workouts;
    return workouts?.filter(w => w.type === filterType) || [];
  }, [workouts, filterType]);

  const calculateStats = useCallback(() => {
    const filtered = filteredWorkouts();
    return {
      count: filtered?.length || 0,
      calories: filtered?.reduce((total, w) => total + (w.caloriesBurned || 0), 0) || 0,
      duration: Math.round((filtered?.reduce((total, w) => total + (w.duration || 0), 0) || 0) / 60),
      completed: filtered?.reduce((total, w) => 
        total + w.exercises.filter(e => e.completed).length, 0) || 0,
    };
  }, [filteredWorkouts]);

  const renderWorkoutModal = () => {
    if (!selectedWorkout) return null;

    const progress = selectedWorkout.exercises.filter(e => e.completed).length / 
                    selectedWorkout.exercises.length * 100;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#4c669f', '#3b5998', '#192f6a']}
              style={styles.modalHeader}
            >
              <View style={styles.modalHeaderContent}>
                <View>
                  <Text style={styles.modalTitle}>{selectedWorkout.name}</Text>
                  <Text style={styles.modalSubtitle}>
                    {selectedWorkout.type.charAt(0).toUpperCase() + selectedWorkout.type.slice(1)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
            </LinearGradient>

            <FlatList
              data={selectedWorkout.exercises}
              renderItem={({ item, index }) => (
                <ExerciseItem
                  exercise={item}
                  onToggleComplete={() => handleExerciseToggle(selectedWorkout.id, index)}
                />
              )}
              keyExtractor={(item, index) => index.toString()}
              style={styles.exerciseList}
              contentContainerStyle={styles.exerciseListContent}
            />
          </View>
        </View>
      </Modal>
    );
  };

  const stats = calculateStats();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Workouts</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleCreateWorkout}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.count}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.calories}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.duration}h</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterType('all')}
          >
            <Ionicons 
              name="apps-outline" 
              size={18} 
              color={filterType === 'all' ? '#fff' : '#666'} 
            />
            <Text style={[
              styles.filterText,
              filterType === 'all' && styles.filterTextActive
            ]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'strength' && styles.filterButtonActive]}
            onPress={() => setFilterType('strength')}
          >
            <Ionicons 
              name="barbell-outline" 
              size={18} 
              color={filterType === 'strength' ? '#fff' : '#666'} 
            />
            <Text style={[
              styles.filterText,
              filterType === 'strength' && styles.filterTextActive
            ]}>Strength</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'cardio' && styles.filterButtonActive]}
            onPress={() => setFilterType('cardio')}
          >
            <Ionicons 
              name="fitness-outline" 
              size={18} 
              color={filterType === 'cardio' ? '#fff' : '#666'} 
            />
            <Text style={[
              styles.filterText,
              filterType === 'cardio' && styles.filterTextActive
            ]}>Cardio</Text>
          </TouchableOpacity>
        </ScrollView>

        <FlatList
          data={filteredWorkouts()}
          renderItem={({ item }) => (
            <WorkoutCard workout={item} onPress={() => handleWorkoutPress(item)} />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.workoutList}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {renderWorkoutModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 20,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: (width - 80) / 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#4c669f',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  workoutList: {
    padding: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
  },
  modalHeader: {
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginTop: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  progressText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
  },
  exerciseList: {
    flex: 1,
  },
  exerciseListContent: {
    padding: 16,
  },
});

export default WorkoutScreen;
