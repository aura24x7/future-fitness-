import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CalorieStats, CalorieGoal, MealLog } from '../../types/calorie';
import CalorieRing from './CalorieRing';
import MacroChart from './MacroChart';

interface Props {
  stats: CalorieStats;
  goal: CalorieGoal;
  recentMeals: MealLog[];
  onAddMeal: () => void;
  onMealPress: (meal: MealLog) => void;
}

const CalorieTracker: React.FC<Props> = ({
  stats,
  goal,
  recentMeals,
  onAddMeal,
  onMealPress,
}) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Calorie Ring Section */}
      <View style={styles.ringContainer}>
        <CalorieRing
          consumed={stats.consumed}
          goal={goal.daily}
          size={200}
        />
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        {/* Consumed Card */}
        <View style={[styles.statCard, { backgroundColor: 'rgba(255, 64, 129, 0.08)' }]}>
          <View style={styles.statContent}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 64, 129, 0.15)' }]}>
              <Ionicons name="flame-outline" size={20} color="#FF4081" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Consumed</Text>
              <Text style={[styles.statValue, { color: '#FF4081' }]}>{stats.consumed}</Text>
            </View>
          </View>
        </View>

        {/* Burned Card */}
        <View style={[styles.statCard, { backgroundColor: 'rgba(41, 98, 255, 0.08)' }]}>
          <View style={styles.statContent}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(41, 98, 255, 0.15)' }]}>
              <Ionicons name="fitness-outline" size={20} color="#2962FF" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Burned</Text>
              <Text style={[styles.statValue, { color: '#2962FF' }]}>{stats.burned}</Text>
            </View>
          </View>
        </View>

        {/* Remaining Card */}
        <View style={[styles.statCard, { backgroundColor: 'rgba(0, 230, 118, 0.08)' }]}>
          <View style={styles.statContent}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(0, 230, 118, 0.15)' }]}>
              <Ionicons name="timer-outline" size={20} color="#00E676" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Remaining</Text>
              <Text style={[styles.statValue, { color: '#00E676' }]}>{stats.remaining}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Macros Section */}
      <View style={styles.macrosSection}>
        <Text style={styles.sectionTitle}>Macros</Text>
        <MacroChart macros={stats.macros} goals={goal.macros} />
      </View>

      {/* Recent Meals Section */}
      <View style={styles.mealsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Meals</Text>
          <TouchableOpacity style={styles.addButton} onPress={onAddMeal}>
            <Ionicons name="add" size={24} color="#FFF" />
            <Text style={styles.buttonText}>Add Meal</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mealsList}>
          {recentMeals.map((meal, index) => (
            <TouchableOpacity
              key={index}
              style={styles.mealItem}
              onPress={() => onMealPress(meal)}
            >
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealCalories}>{meal.calories} calories</Text>
              </View>
              <Text style={styles.mealTime}>{meal.time}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  ringContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    width: '31%',
    borderRadius: 12,
    padding: 12,
  },
  statContent: {
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statInfo: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  macrosSection: {
    padding: 16,
    backgroundColor: 'rgba(41, 98, 255, 0.04)',
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  mealsSection: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2962FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  mealsList: {
    marginTop: 8,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(41, 98, 255, 0.04)',
    borderRadius: 12,
    marginBottom: 12,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  mealCalories: {
    fontSize: 14,
    color: '#2962FF',
  },
  mealTime: {
    fontSize: 13,
    color: '#666666',
    marginLeft: 16,
  },
});

export default CalorieTracker;
