import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useWorkout } from '../contexts/WorkoutContext';
import WeekCalendar from '../components/workout/WeekCalendar';
import ExerciseDetail from '../components/workout/ExerciseDetail';
import { format, isSameDay } from 'date-fns';

type WorkoutsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Workouts'>;
};

const Workouts: React.FC<WorkoutsScreenProps> = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todayPlans, setTodayPlans] = useState<any[]>([]);
  const [loadingTodayPlans, setLoadingTodayPlans] = useState(false);
  const { 
    workoutPlans, 
    sharedPlans, 
    isLoading, 
    fetchWorkoutPlans,
    getWorkoutPlansForDay
  } = useWorkout();

  // Get days with workouts for the calendar
  const workoutDays = React.useMemo(() => {
    console.log(`Calculating workout days from ${workoutPlans.length} plans`);
    
    if (!workoutPlans || workoutPlans.length === 0) {
      return [];
    }
    
    const days = workoutPlans.flatMap(plan => {
      if (!plan.days || !Array.isArray(plan.days)) {
        return [];
      }
      
      return plan.days
        .filter(day => !day.isRestDay && day.exercises && day.exercises.length > 0)
        .map(day => {
          // Get the day name
          const dayName = day.dayName;
          if (!dayName) return null;
          
          // Map day names to day numbers
          const dayMapping: Record<string, number> = {
            'sunday': 0, 
            'monday': 1, 
            'tuesday': 2, 
            'wednesday': 3, 
            'thursday': 4, 
            'friday': 5, 
            'saturday': 6
          };
          
          const dayIndex = dayMapping[dayName.toLowerCase()];
          if (dayIndex === undefined) {
            console.log(`Unknown day name: ${dayName}`);
            return null;
          }
          
          // Create a date object for this day in the current week
          const now = new Date();
          const currentDayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
          const date = new Date(now);
          
          // Adjust date to get to the right day of the week
          const diff = dayIndex - currentDayOfWeek;
          date.setDate(date.getDate() + diff);
          
          console.log(`Mapped ${dayName} to ${format(date, 'EEEE, MMMM d')}`);
          return date;
        })
        .filter(date => date !== null) as Date[];
    });
    
    console.log(`Found ${days.length} workout days`);
    return days;
  }, [workoutPlans]);

  // Load workout plans when the component mounts
  useEffect(() => {
    fetchWorkoutPlans();
  }, [fetchWorkoutPlans]);

  // Load workouts for the selected day
  useEffect(() => {
    const fetchTodayPlans = async () => {
      try {
        setLoadingTodayPlans(true);
        const selectedDayName = format(selectedDate, 'EEEE');
        console.log(`Fetching workout plans for: ${selectedDayName}`);
        
        let plans: any[] = [];
        try {
          plans = await getWorkoutPlansForDay(selectedDayName);
          console.log(`Found ${plans.length} plans for ${selectedDayName}`);
        } catch (error) {
          console.error('Error fetching workout plans:', error);
          // If there's an error, use an empty array
          plans = [];
        }
        
        setTodayPlans(plans || []);
      } catch (error) {
        console.error('Error in fetchTodayPlans:', error);
        setTodayPlans([]);
      } finally {
        setLoadingTodayPlans(false);
      }
    };

    fetchTodayPlans();
  }, [selectedDate, getWorkoutPlansForDay]);

  // Create a new workout plan
  const handleCreateWorkoutPlan = () => {
    navigation.navigate('WorkoutPlan', { planId: 'new' });
  };

  // Handle adding a workout for a specific day
  const handleAddWorkoutForDay = () => {
    // Navigate to create workout plan but pass the selected day
    const selectedDayName = format(selectedDate, 'EEEE');
    navigation.navigate('WorkoutPlan', { 
      planId: 'new',
      dayName: selectedDayName
    });
  };

  // Navigate to a specific workout plan
  const handleViewWorkoutPlan = (planId: string) => {
    navigation.navigate('WorkoutPlan', { planId });
  };

  // Get today's workout
  const getTodayWorkout = () => {
    if (!todayPlans || todayPlans.length === 0) {
      console.log('No plans found for selected day');
      return null;
    }

    try {
      // Get the first plan with exercises for today
      const plan = todayPlans[0];
      if (!plan || !plan.days) {
        console.log('Invalid plan structure:', JSON.stringify(plan));
        return null;
      }
      
      console.log('Plan structure:', JSON.stringify(plan));
      console.log('Plan days:', JSON.stringify(plan.days));
      
      const selectedDayName = format(selectedDate, 'EEEE');
      console.log('Looking for day:', selectedDayName);
      
      // Log all days and their names for debugging
      plan.days.forEach((day: any, index: number) => {
        console.log(`Day ${index}: ${day?.dayName}, isRestDay: ${day?.isRestDay}, exercises: ${day?.exercises?.length || 0}`);
      });
      
      // Make day name comparison case-insensitive for more reliable matching
      const dayPlan = plan.days.find((day: any) => 
        day?.dayName && day.dayName.toLowerCase() === selectedDayName.toLowerCase()
      );
      
      if (!dayPlan) {
        console.log(`No day plan found for ${selectedDayName} in plan: ${plan.name}`);
        return null;
      }
      
      if (dayPlan.isRestDay || !dayPlan.exercises || dayPlan.exercises.length === 0) {
        console.log(`Day ${selectedDayName} is a rest day or has no exercises in plan: ${plan.name}`);
        return null;
      }
      
      console.log(`Found workout for ${selectedDayName} in plan: ${plan.name} with ${dayPlan.exercises.length} exercises`);
      return { plan, dayPlan };
    } catch (error) {
      console.error('Error in getTodayWorkout:', error);
      return null;
    }
  };

  const todayWorkout = getTodayWorkout();

  // Helper function to get the name of the user who shared the plan
  const getSharedByName = (plan: any): string => {
    // This is a workaround since the TypeScript type doesn't include sharedBy
    // In a real app, you'd want to update your types to properly include this property
    if (plan.sharedBy && plan.sharedBy.name) {
      return plan.sharedBy.name;
    }
    return 'Unknown';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Workouts</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {format(selectedDate, 'MMMM yyyy')}
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={handleCreateWorkoutPlan}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Week calendar */}
      <WeekCalendar
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        workoutDays={workoutDays}
        numWeeks={2}
      />

      {/* Content */}
      <ScrollView style={styles.content}>
        {isLoading || loadingTodayPlans ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <View>
            {/* Today's workout section */}
            <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {format(selectedDate, "EEEE's")} Workout
              </Text>
              
              {todayWorkout ? (
                <View>
                  <Text style={[styles.workoutPlanName, { color: colors.text }]}>
                    {todayWorkout.plan.name}
                  </Text>
                  
                  {todayWorkout.dayPlan?.exercises.map((exercise: any, index: number) => (
                    <View key={index} style={styles.exerciseItem}>
                      <ExerciseDetail
                        exercise={exercise}
                        showActions={false}
                      />
                    </View>
                  ))}
                  
                  <TouchableOpacity 
                    style={[styles.startWorkoutButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      // Find the day index in the plan
                      const dayIndex = todayWorkout.plan.days.findIndex((day: any) => 
                        day.dayName === format(selectedDate, 'EEEE')
                      );
                      if (dayIndex !== -1) {
                        navigation.navigate('WorkoutTracking', {
                          planId: todayWorkout.plan.id,
                          dayIndex: dayIndex
                        });
                      }
                    }}
                  >
                    <Text style={styles.startWorkoutButtonText}>Start Workout</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Ionicons 
                    name="barbell-outline" 
                    size={48} 
                    color={colors.textSecondary} 
                  />
                  <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                    No workout planned for this day
                  </Text>
                  <TouchableOpacity 
                    style={[styles.addWorkoutButton, { backgroundColor: colors.primary }]}
                    onPress={handleAddWorkoutForDay}
                  >
                    <Text style={styles.addWorkoutButtonText}>Add Workout</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* My workout plans section */}
            <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                My Workout Plans
              </Text>
              
              {workoutPlans.length > 0 ? (
                workoutPlans.map((plan) => (
                  <TouchableOpacity
                    key={plan.id}
                    style={[styles.planItem, { borderColor: colors.border }]}
                    onPress={() => handleViewWorkoutPlan(plan.id)}
                  >
                    <View style={styles.planItemHeader}>
                      <Text style={[styles.planItemTitle, { color: colors.text }]}>
                        {plan.name}
                      </Text>
                      <Text style={[styles.planItemSubtitle, { color: colors.textSecondary }]}>
                        {plan.days.filter(day => !day.isRestDay).length} workout days
                      </Text>
                    </View>
                    <Ionicons 
                      name="chevron-forward" 
                      size={24} 
                      color={colors.textSecondary} 
                    />
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                    You haven't created any workout plans yet
                  </Text>
                  <TouchableOpacity 
                    style={[styles.addWorkoutButton, { backgroundColor: colors.primary }]}
                    onPress={handleCreateWorkoutPlan}
                  >
                    <Text style={styles.addWorkoutButtonText}>Create Plan</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Shared plans section */}
            <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Shared With Me
              </Text>
              
              {sharedPlans.length > 0 ? (
                sharedPlans.map((plan) => (
                  <TouchableOpacity
                    key={plan.id}
                    style={[styles.planItem, { borderColor: colors.border }]}
                    onPress={() => handleViewWorkoutPlan(plan.id)}
                  >
                    <View style={styles.planItemHeader}>
                      <Text style={[styles.planItemTitle, { color: colors.text }]}>
                        {plan.name}
                      </Text>
                      <Text style={[styles.planItemSubtitle, { color: colors.textSecondary }]}>
                        Shared by {getSharedByName(plan)}
                      </Text>
                    </View>
                    <Ionicons 
                      name="chevron-forward" 
                      size={24} 
                      color={colors.textSecondary} 
                    />
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                    No workout plans have been shared with you
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  workoutPlanName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  exerciseItem: {
    marginBottom: 12,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyStateText: {
    marginVertical: 12,
    textAlign: 'center',
  },
  addWorkoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  addWorkoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  planItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  planItemHeader: {
    flex: 1,
  },
  planItemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  planItemSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  startWorkoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  startWorkoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Workouts; 