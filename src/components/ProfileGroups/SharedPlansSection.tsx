import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, RefreshControl, FlatList, Alert } from 'react-native';
import { Text } from 'tamagui';
import { useTheme } from '../../theme/ThemeProvider';
import { workoutPlanService } from '../../services/workoutPlanService';
import { SharedWorkoutPlanView } from '../../types/workout';
import { ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { formatDistance } from 'date-fns';
import { RootStackParamList } from '../../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Remove the explicit Firebase app import since we're now ensuring it's initialized in the service
// import { firebaseApp } from '../../firebase/firebaseInit';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'WorkoutPlan'>;

const SharedPlansSection: React.FC = () => {
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  
  const [sharedPlans, setSharedPlans] = useState<SharedWorkoutPlanView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const loadSharedPlans = useCallback(async () => {
    try {
      // We've moved the Firebase initialization check to the service
      const plans = await workoutPlanService.getSharedWorkoutPlans();
      setSharedPlans(plans);
      setHasError(false);
    } catch (error) {
      console.error('Error loading shared plans:', error);
      setErrorMessage('Failed to load shared workout plans');
      setHasError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);
  
  useEffect(() => {
    loadSharedPlans();
  }, [loadSharedPlans]);
  
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setHasError(false);
    loadSharedPlans();
  }, [loadSharedPlans]);
  
  const handleAcceptPlan = useCallback(async (planId: string) => {
    try {
      await workoutPlanService.acceptSharedPlan(planId);
      Alert.alert('Success', 'Plan accepted successfully');
      loadSharedPlans();
    } catch (error) {
      console.error('Error accepting plan:', error);
      Alert.alert('Error', 'Failed to accept workout plan');
    }
  }, [loadSharedPlans]);
  
  const handleRejectPlan = useCallback(async (planId: string) => {
    try {
      await workoutPlanService.rejectSharedPlan(planId);
      Alert.alert('Success', 'Plan rejected successfully');
      loadSharedPlans();
    } catch (error) {
      console.error('Error rejecting plan:', error);
      Alert.alert('Error', 'Failed to reject workout plan');
    }
  }, [loadSharedPlans]);
  
  const handleViewPlan = useCallback((planId: string) => {
    navigation.navigate('WorkoutPlan', { planId });
  }, [navigation]);
  
  const renderSharedPlan = ({ item }: { item: SharedWorkoutPlanView }) => {
    const timeAgo = formatDistance(new Date(item.sharedAt), new Date(), { addSuffix: true });
    
    return (
      <View style={[styles.planCard, { backgroundColor: isDarkMode ? colors.cardBackground : '#FFFFFF' }]}>
        <View style={styles.planHeader}>
          <Text style={[styles.planName, { color: colors.text }]} fontSize={18} fontWeight="700">{item.name}</Text>
          <Text style={[styles.timeAgo, { color: colors.textSecondary }]} fontSize={12}>{timeAgo}</Text>
        </View>
        
        <Text style={[styles.description, { color: colors.textSecondary }]} fontSize={14}>
          Shared by: {item.sharedBy.name}
        </Text>
        
        {item.description && (
          <Text 
            style={[styles.description, { color: colors.textSecondary }]}
            numberOfLines={2}
            fontSize={14}
          >
            {item.description}
          </Text>
        )}
        
        <View style={styles.actionRow}>
          {item.status === 'pending' ? (
            <>
              <TouchableOpacity 
                style={[styles.actionButton, styles.acceptButton, { backgroundColor: '#10B981' }]} 
                onPress={() => handleAcceptPlan(item.id)}
              >
                <Text style={styles.actionButtonText} color="white" fontWeight="600">Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.rejectButton, { backgroundColor: '#EF4444' }]} 
                onPress={() => handleRejectPlan(item.id)}
              >
                <Text style={styles.actionButtonText} color="white" fontWeight="600">Reject</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.primary }]} 
              onPress={() => handleViewPlan(item.id)}
            >
              <Text style={styles.actionButtonText} color="white" fontWeight="600">View Plan</Text>
              <FontAwesome5 name="chevron-right" size={12} color="#fff" style={styles.actionIcon} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };
  
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  if (hasError) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={[styles.emptyText, { color: colors.text }]} fontSize={18} fontWeight="600">
          {errorMessage || 'Something went wrong'}
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={[styles.refreshButtonText, { color: colors.primary }]} fontSize={16} fontWeight="600">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (sharedPlans.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={[styles.emptyText, { color: colors.text }]} fontSize={18} fontWeight="600">
          No shared workout plans yet
        </Text>
        <Text style={[styles.emptySubText, { color: colors.textSecondary }]} fontSize={14}>
          Plans shared with you will appear here
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={[styles.refreshButtonText, { color: colors.primary }]} fontSize={16} fontWeight="600">Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <FlatList
        data={sharedPlans}
        renderItem={renderSharedPlan}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginBottom: 8,
  },
  emptySubText: {
    marginBottom: 20,
    textAlign: 'center',
  },
  refreshButton: {
    padding: 12,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  planCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    flex: 1,
  },
  timeAgo: {
    marginLeft: 8,
  },
  description: {
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  acceptButton: {
    minWidth: 100,
  },
  rejectButton: {
    minWidth: 100,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  actionIcon: {
    marginLeft: 4,
  },
});

export default SharedPlansSection; 