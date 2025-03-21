import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Text, YStack, XStack } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeProvider';
import { SharedWorkoutPlanView } from '../../types/workout';
import { workoutPlanService } from '../../services/workoutPlanService';

export const SharedPlansSection: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDarkMode } = useTheme();
  const [sharedPlans, setSharedPlans] = useState<SharedWorkoutPlanView[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSharedPlans = async () => {
    try {
      const plans = await workoutPlanService.getSharedWorkoutPlans();
      setSharedPlans(plans);
    } catch (error) {
      console.error('Error loading shared plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSharedPlans();
    setRefreshing(false);
  };

  useEffect(() => {
    loadSharedPlans();
  }, []);

  const handlePlanPress = (plan: SharedWorkoutPlanView) => {
    navigation.navigate('WorkoutPlan', { planId: plan.id });
  };

  const handleAcceptShare = async (planId: string) => {
    try {
      await workoutPlanService.acceptSharedPlan(planId);
      await loadSharedPlans();
    } catch (error) {
      console.error('Error accepting shared plan:', error);
    }
  };

  const handleRejectShare = async (planId: string) => {
    try {
      await workoutPlanService.rejectSharedPlan(planId);
      await loadSharedPlans();
    } catch (error) {
      console.error('Error rejecting shared plan:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {sharedPlans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text color={colors.text} fontSize={18} fontWeight="600" marginBottom={8}>
            No shared workout plans
          </Text>
          <Text color={colors.textSecondary} fontSize={14} textAlign="center">
            When someone shares a workout plan with you, it will appear here
          </Text>
        </View>
      ) : (
        <YStack space="$4" padding="$4">
          {sharedPlans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              onPress={() => handlePlanPress(plan)}
              style={[
                styles.planCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <YStack space="$2">
                <XStack justifyContent="space-between" alignItems="center">
                  <Text color={colors.text} fontSize={18} fontWeight="600">
                    {plan.name || 'Workout Plan'}
                  </Text>
                  <Text color={colors.textSecondary} fontSize={14}>
                    {new Date(plan.sharedAt).toLocaleDateString()}
                  </Text>
                </XStack>

                <Text color={colors.textSecondary} fontSize={14}>
                  Shared by: {plan.sharedBy.name}
                </Text>

                {plan.description && (
                  <Text color={colors.text} fontSize={14} numberOfLines={2}>
                    {plan.description}
                  </Text>
                )}

                {plan.status === 'pending' && (
                  <XStack space="$2" marginTop="$2">
                    <TouchableOpacity
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={() => handleAcceptShare(plan.id)}
                    >
                      <Text color="white">Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleRejectShare(plan.id)}
                    >
                      <Text color="white">Reject</Text>
                    </TouchableOpacity>
                  </XStack>
                )}

                <XStack space="$2" alignItems="center">
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text color={colors.textSecondary} fontSize={14}>
                    {plan.days.length} days
                  </Text>
                  <Text color={colors.textSecondary} fontSize={14}>
                    •
                  </Text>
                  <Text
                    color={colors.textSecondary}
                    fontSize={14}
                    textTransform="capitalize"
                  >
                    Status: {plan.status}
                  </Text>
                </XStack>
              </YStack>
            </TouchableOpacity>
          ))}
        </YStack>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  planCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  actionButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
}); 