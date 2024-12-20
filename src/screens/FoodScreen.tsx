import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import TextInputModal from '../components/food/TextInputModal';
import { naturalLanguageFoodService } from '../services/ai/naturalLanguageFood/naturalLanguageFoodService';
import { RootStackParamList } from '../types/navigation';

interface Meal {
  id: string;
  name: string;
  time: string;
  calories: number;
  items: string[];
}

interface MealCardProps {
  meal: Meal;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const FoodScreen = () => {
  const { colors, isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [textModalVisible, setTextModalVisible] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  const meals: Meal[] = [
    {
      id: '1',
      name: 'Breakfast',
      time: '8:00 AM',
      calories: 450,
      items: ['Oatmeal', 'Banana', 'Greek Yogurt'],
    },
    {
      id: '2',
      name: 'Lunch',
      time: '12:30 PM',
      calories: 650,
      items: ['Grilled Chicken Salad', 'Quinoa', 'Avocado'],
    },
    {
      id: '3',
      name: 'Dinner',
      time: '7:00 PM',
      calories: 550,
      items: ['Salmon', 'Brown Rice', 'Steamed Vegetables'],
    },
  ];

  const nutritionSummary = {
    calories: 1650,
    protein: 120,
    carbs: 180,
    fat: 55,
  };

  const handleTextSubmit = async (description: string) => {
    try {
      const result = await naturalLanguageFoodService.analyzeFoodText(description);
      navigation.navigate('ScannedFoodDetails', {
        result,
        source: 'text'
      });
    } catch (error) {
      console.error('Error analyzing food text:', error);
      // Error will be handled by the modal
      throw error;
    }
  };

  const MealCard: React.FC<MealCardProps> = ({ meal }) => (
    <TouchableOpacity
      style={[
        styles.mealCard,
        { backgroundColor: colors.cardBackground }
      ]}
    >
      <View style={styles.mealHeader}>
        <View>
          <Text style={[styles.mealName, { color: colors.text }]}>
            {meal.name}
          </Text>
          <Text style={[styles.mealTime, { color: colors.secondary }]}>
            {meal.time}
          </Text>
        </View>
        <View style={styles.caloriesBadge}>
          <Ionicons name="flame-outline" size={16} color={colors.primary} />
          <Text style={[styles.caloriesText, { color: colors.text }]}>
            {meal.calories} cal
          </Text>
        </View>
      </View>

      <View style={styles.mealItems}>
        {meal.items.map((item, index) => (
          <View key={index} style={styles.mealItem}>
            <Ionicons
              name="restaurant-outline"
              size={16}
              color={colors.secondary}
            />
            <Text style={[styles.itemText, { color: colors.text }]}>
              {item}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.searchContainer}>
        <View style={[
          styles.searchBar,
          { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]}>
          <Ionicons name="search" size={20} color={colors.secondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search foods..."
            placeholderTextColor={colors.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setTextModalVisible(true)}
          >
            <Ionicons name="text" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('FoodScanner')}
          >
            <Ionicons name="camera" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.summaryContainer}>
          <LinearGradient
            colors={isDarkMode ? 
              [colors.primary, '#2d3748'] :
              [colors.primary, '#818cf8']
            }
            style={styles.summaryCard}
          >
            <Text style={styles.summaryTitle}>Today's Nutrition</Text>
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>
                  {nutritionSummary.calories}
                </Text>
                <Text style={styles.nutritionLabel}>Calories</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>
                  {nutritionSummary.protein}g
                </Text>
                <Text style={styles.nutritionLabel}>Protein</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>
                  {nutritionSummary.carbs}g
                </Text>
                <Text style={styles.nutritionLabel}>Carbs</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>
                  {nutritionSummary.fat}g
                </Text>
                <Text style={styles.nutritionLabel}>Fat</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.mealsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Today's Meals
          </Text>
          {meals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <TextInputModal
        isVisible={textModalVisible}
        onClose={() => setTextModalVisible(false)}
        onSubmit={handleTextSubmit}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 12,
    borderRadius: 12,
  },
  summaryContainer: {
    padding: 16,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  mealsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  mealCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealName: {
    fontSize: 18,
    fontWeight: '600',
  },
  mealTime: {
    fontSize: 14,
    marginTop: 2,
  },
  caloriesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  caloriesText: {
    fontSize: 14,
    fontWeight: '500',
  },
  mealItems: {
    gap: 8,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemText: {
    fontSize: 14,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
});
