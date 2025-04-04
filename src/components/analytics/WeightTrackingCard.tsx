import React, { useEffect, useState, useMemo } from 'react';
import { TouchableOpacity, Dimensions, ScrollView, Modal, View } from 'react-native';
import { YStack, XStack, Text, Card, View as TamaguiView } from 'tamagui';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import useWeightTracking from '../../hooks/useWeightTracking';
import { useTheme } from '../../theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { WeeklyTrackingData } from '../../hooks/useWeightTracking';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const AnimatedCard = Animated.createAnimatedComponent(Card);

export const WeightTrackingCard: React.FC<{ recommendedDailyCalories?: number, targetWeightLoss?: number }> = ({
  recommendedDailyCalories = 2000,
  targetWeightLoss = 10
}) => {
  const { weeklyData, loading, error } = useWeightTracking(recommendedDailyCalories);
  const { colors } = useTheme();
  const screenWidth = Dimensions.get('window').width;

  const [modalVisible, setModalVisible] = useState(false);

  const progressAnimation = useSharedValue(0);

  // Ensure we always have valid data by using fallback values when needed
  const validData = !loading && !error && weeklyData && weeklyData.length > 0;
  
  // Safely calculate the cumulative weight change
  const cumulativeWeightChange = useMemo(() => {
    if (!validData) return 0;
    
    try {
      return weeklyData.reduce((acc, week) => {
        // Guard against invalid estimatedWeightChange values
        const change = typeof week.estimatedWeightChange === 'number' 
          && !isNaN(week.estimatedWeightChange) 
          && isFinite(week.estimatedWeightChange)
          ? week.estimatedWeightChange 
          : 0;
        return acc + change;
      }, 0);
    } catch (e) {
      console.error('Error calculating cumulative weight change:', e);
      return 0;
    }
  }, [validData, weeklyData]);
  
  // Calculate weight loss (negative change means weight loss)
  const weightLoss = validData && cumulativeWeightChange < 0 ? -cumulativeWeightChange : 0;
  
  // Calculate progress percentage (ensure it's between 0-100%)
  const progressPercentage = validData 
    ? Math.min(Math.max((weightLoss / Math.max(targetWeightLoss, 0.1)) * 100, 0), 100) 
    : 0;
  
  // Calculate remaining weight to lose
  const weightRemaining = validData && weightLoss < targetWeightLoss 
    ? Math.max(targetWeightLoss - weightLoss, 0) 
    : 0;

  // Calculate average weekly loss based on the data we have
  const averageWeeklyLoss = useMemo(() => {
    if (!validData || weeklyData.length === 0) return 0;
    
    try {
      // Filter out weeks with invalid weight changes
      const validWeekChanges = weeklyData
        .map(week => -week.estimatedWeightChange) // Negate so positive = loss
        .filter(val => typeof val === 'number' && !isNaN(val) && isFinite(val));
      
      if (validWeekChanges.length === 0) return 0;
      
      // Calculate average of valid weeks
      const sum = validWeekChanges.reduce((acc, val) => acc + val, 0);
      return sum / validWeekChanges.length;
    } catch (e) {
      console.error('Error calculating average weekly loss:', e);
      return 0;
    }
  }, [validData, weeklyData]);

  // Calculate remaining time to reach goal
  const weeksRemaining = useMemo(() => {
    if (!validData || averageWeeklyLoss <= 0) return 260; // Default to 5 years
    
    try {
      // Use a minimum average loss rate to avoid division by very small numbers
      const safeAverageWeeklyLoss = Math.max(averageWeeklyLoss, 0.01);
      
      // Limit to 5 years (260 weeks) maximum
      return Math.min(weightRemaining / safeAverageWeeklyLoss, 260);
    } catch (e) {
      console.error('Error calculating weeks remaining:', e);
      return 260;
    }
  }, [validData, averageWeeklyLoss, weightRemaining]);
  
  // Calculate estimated completion date
  const formattedCompletionDate = useMemo(() => {
    if (!validData || weeksRemaining >= 260) return 'Not available';
    
    try {
      const today = new Date();
      const daysToAdd = Math.round(weeksRemaining * 7);
      
      const estimatedCompletionDate = new Date(today.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
      
      if (isNaN(estimatedCompletionDate.getTime())) return 'Not available';
      
      return estimatedCompletionDate.toLocaleDateString();
    } catch (error) {
      console.error('Error calculating estimated completion date:', error);
      return 'Not available';
    }
  }, [validData, weeksRemaining]);

  const getBestWeekLoss = () => {
    try {
      if (!validData || !weeklyData || weeklyData.length === 0) return 0;
      
      const validWeightChanges = weeklyData
        .map(w => -w.estimatedWeightChange)
        .filter(val => !isNaN(val) && isFinite(val) && val > 0); // Only include actual weight loss
      
      if (validWeightChanges.length === 0) return 0;
      return Math.max(...validWeightChanges);
    } catch (error) {
      console.error('Error calculating best week loss:', error);
      return 0;
    }
  };
  
  const getAverageWeeklyCalories = () => {
    try {
      if (!validData || !weeklyData || weeklyData.length === 0) return 0;
      
      const validCalories = weeklyData
        .map(w => w.totalCalories)
        .filter(val => !isNaN(val) && isFinite(val) && val >= 0);
      
      if (validCalories.length === 0) return 0;
      return validCalories.reduce((acc, val) => acc + val, 0) / validCalories.length;
    } catch (error) {
      console.error('Error calculating average weekly calories:', error);
      return 0;
    }
  };

  useEffect(() => {
    progressAnimation.value = withSpring(progressPercentage, {
      damping: 15,
      stiffness: 90
    });
  }, [progressPercentage]);

  if (loading) {
    return (
      <AnimatedCard
        entering={FadeIn.duration(500)}
        elevate
        size="$4"
        bordered
        style={{
          width: '100%',
          backgroundColor: colors.cardBackground,
          borderRadius: 24,
          overflow: 'hidden',
          marginVertical: 8,
        }}
      >
        <YStack padding="$4" space="$4" alignItems="center">
          <Text color={colors.text} fontSize={18} fontWeight="600">
            Loading Weight Data...
          </Text>
        </YStack>
      </AnimatedCard>
    );
  }

  if (error) {
    return (
      <AnimatedCard
        entering={FadeIn.duration(500)}
        elevate
        size="$4"
        bordered
        style={{
          width: '100%',
          backgroundColor: colors.cardBackground,
          borderRadius: 24,
          overflow: 'hidden',
          marginVertical: 8,
        }}
      >
        <YStack padding="$4" space="$4" alignItems="center">
          <Text color={colors.text} fontSize={18} fontWeight="600">
            Unable to Load Weight Data
          </Text>
          <Text color={colors.text} fontSize={14} opacity={0.7} textAlign="center">
            {error}
          </Text>
        </YStack>
      </AnimatedCard>
    );
  }

  return (
    <>
      <AnimatedCard
        entering={FadeIn.duration(500)}
        elevate
        size="$4"
        bordered
        style={{
          width: '100%',
          backgroundColor: colors.cardBackground,
          borderRadius: 24,
          overflow: 'hidden',
          marginVertical: 8,
        }}
      >
        {/* Header with Gradient */}
        <AnimatedLinearGradient
          colors={['#4361EE', '#7209B7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            padding: 16,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
        >
          <Text
            color="white"
            fontSize={22}
            fontWeight="700"
            marginBottom={2}
          >
            Weight Journey
          </Text>
          <Text
            color="rgba(255, 255, 255, 0.8)"
            fontSize={14}
          >
            Your progress towards optimal health
          </Text>
        </AnimatedLinearGradient>

        <YStack padding="$3" space="$3">
          {/* Weight Progress Cards - More Compact */}
          <XStack space="$3">
            <Card
              flex={1}
              backgroundColor={`${colors.text}08`}
              padding="$2.5"
              borderRadius={16}
            >
              <Text fontSize={24} fontWeight="700" color="#4ADE80">
                {weightLoss.toFixed(1)} kg
              </Text>
              <Text fontSize={13} color={colors.text} opacity={0.7}>Lost</Text>
            </Card>

            <Card
              flex={1}
              backgroundColor={`${colors.text}08`}
              padding="$2.5"
              borderRadius={16}
            >
              <Text fontSize={24} fontWeight="700" color={colors.text}>
                {weightRemaining.toFixed(1)} kg
              </Text>
              <Text fontSize={13} color={colors.text} opacity={0.7}>Remaining</Text>
            </Card>
          </XStack>

          {/* Stats Grid - More Compact */}
          <XStack space="$3">
            <Card
              flex={1}
              backgroundColor={`${colors.text}08`}
              padding="$2.5"
              borderRadius={16}
            >
              <XStack alignItems="center" space="$1.5">
                <Ionicons name="trending-down" size={18} color={colors.text} />
                <Text fontSize={16} fontWeight="600" color={colors.text}>
                  {averageWeeklyLoss.toFixed(2)} kg
                </Text>
              </XStack>
              <Text fontSize={13} color={colors.text} opacity={0.7}>Avg. Weekly Loss</Text>
            </Card>

            <Card
              flex={1}
              backgroundColor={`${colors.text}08`}
              padding="$2.5"
              borderRadius={16}
            >
              <XStack alignItems="center" space="$1.5">
                <Ionicons name="calendar" size={18} color={colors.text} />
                <Text fontSize={16} fontWeight="600" color={colors.text}>
                  {formattedCompletionDate}
                </Text>
              </XStack>
              <Text fontSize={13} color={colors.text} opacity={0.7}>Est. Completion</Text>
            </Card>
          </XStack>

          {/* Overall Progress */}
          <Card
            backgroundColor={`${colors.text}08`}
            padding="$2.5"
            borderRadius={16}
          >
            <XStack justifyContent="space-between" alignItems="center" marginBottom="$1.5">
              <Text color={colors.text} fontSize={15} fontWeight="600">
                Overall Progress
              </Text>
              <Text color={colors.text} fontSize={15} fontWeight="600">
                {`${progressPercentage.toFixed(0)}%`}
              </Text>
            </XStack>
            <TamaguiView
              backgroundColor={`${colors.text}15`}
              height={6}
              borderRadius={3}
              overflow="hidden"
            >
              <Animated.View
                style={{
                  width: `${progressPercentage}%`,
                  height: '100%',
                  backgroundColor: '#4361EE',
                  borderRadius: 3,
                }}
              />
            </TamaguiView>
            <XStack justifyContent="space-between" marginTop="$1.5">
              <Text fontSize={13} color={colors.text} opacity={0.7}>
                Current: {weightLoss.toFixed(1)} kg lost
              </Text>
              <Text fontSize={13} color={colors.text} opacity={0.7}>
                Goal: {targetWeightLoss.toFixed(1)} kg
              </Text>
            </XStack>
          </Card>

          {/* Weekly Summary */}
          <Card
            backgroundColor={`${colors.text}08`}
            padding="$2.5"
            borderRadius={16}
          >
            <XStack justifyContent="space-between" alignItems="center" marginBottom="$1.5">
              <Text color={colors.text} fontSize={15} fontWeight="600">
                Weekly Summary
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <XStack space="$1" alignItems="center">
                  <Text color={colors.text} fontSize={13} opacity={0.7}>
                    View Details
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.text} />
                </XStack>
              </TouchableOpacity>
            </XStack>
            <YStack space="$2">
              <XStack justifyContent="space-between">
                <Text fontSize={13} color={colors.text} opacity={0.7}>
                  Total Weeks Tracked
                </Text>
                <Text fontSize={13} color={colors.text}>
                  {weeklyData.length}
                </Text>
              </XStack>
              <XStack justifyContent="space-between">
                <Text fontSize={13} color={colors.text} opacity={0.7}>
                  Best Week Loss
                </Text>
                <Text fontSize={13} color={colors.text}>
                  {getBestWeekLoss().toFixed(1)} kg
                </Text>
              </XStack>
              <XStack justifyContent="space-between">
                <Text fontSize={13} color={colors.text} opacity={0.7}>
                  Average Weekly Calories
                </Text>
                <Text fontSize={13} color={colors.text}>
                  {getAverageWeeklyCalories().toFixed(0)}
                </Text>
              </XStack>
            </YStack>
          </Card>
        </YStack>
      </AnimatedCard>

      {/* Modal for Weekly Breakdown */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View 
          style={{ 
            flex: 1, 
            backgroundColor: 'rgba(0,0,0,0.9)',  // Almost black background
            justifyContent: 'center',
            padding: 16
          }}
        >
          <TouchableOpacity 
            style={{ 
              flex: 1,
              justifyContent: 'center',
            }} 
            onPress={() => setModalVisible(false)} 
            activeOpacity={1}
          >
            <YStack 
              style={{ 
                backgroundColor: colors.cardBackground,
                borderRadius: 16,
                padding: 20,
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 4
                },
                shadowOpacity: 0.5,
                shadowRadius: 8,
                elevation: 10,
                borderWidth: 1,
                borderColor: `${colors.text}15`,
              }}
            >
              <XStack 
                justifyContent="space-between" 
                alignItems="center" 
                marginBottom={16}
                borderBottomWidth={1}
                borderBottomColor={`${colors.text}15`}
                paddingBottom={16}
              >
                <Text fontSize={20} fontWeight="700" color={colors.text}>
                  Weekly Breakdown
                </Text>
                <TouchableOpacity 
                  onPress={() => setModalVisible(false)}
                  style={{
                    padding: 4,
                    backgroundColor: `${colors.text}10`,
                    borderRadius: 20,
                  }}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </XStack>
              <ScrollView style={{ maxHeight: 400 }}>
                {weeklyData.map((week, index) => {
                  // Safe calculation of weekProgress with bounds checking
                  const weekProgress = (() => {
                    try {
                      if (!week || !week.totalCalories || !week.recommendedTotal || week.recommendedTotal <= 0) {
                        return 0;
                      }
                      // Ensure progress is between 0-100%
                      return Math.min(Math.max((week.totalCalories / week.recommendedTotal) * 100, 0), 100);
                    } catch (error) {
                      console.error('Error calculating week progress:', error);
                      return 0;
                    }
                  })();

                  // Safe formatting of week dates
                  const formatDateRange = () => {
                    try {
                      if (!week.weekDates || !Array.isArray(week.weekDates) || week.weekDates.length === 0) {
                        return "Date range unavailable";
                      }
                      
                      const firstDate = week.weekDates[0] || "Unknown";
                      const lastDate = week.weekDates[week.weekDates.length - 1] || "Unknown";
                      
                      return `${firstDate} to ${lastDate}`;
                    } catch (error) {
                      console.error('Error formatting date range:', error);
                      return "Date range unavailable";
                    }
                  };
                  
                  // Safe weight change calculation
                  const getWeightChange = () => {
                    try {
                      if (!week || typeof week.estimatedWeightChange !== 'number' || 
                          !isFinite(week.estimatedWeightChange) || isNaN(week.estimatedWeightChange)) {
                        return 0;
                      }
                      return -week.estimatedWeightChange;
                    } catch (error) {
                      console.error('Error calculating weight change:', error);
                      return 0;
                    }
                  };
                  
                  const weightChange = getWeightChange();
                  
                  return (
                    <Card
                      key={index}
                      marginBottom="$2"
                      padding="$3"
                      backgroundColor={`${colors.text}10`}
                      borderRadius={12}
                      bordered
                      borderColor={`${colors.text}15`}
                    >
                      <YStack space="$2">
                        <XStack justifyContent="space-between" alignItems="center">
                          <Text fontSize={16} fontWeight="700" color={colors.text}>
                            Week {week.weekIndex}
                          </Text>
                          <Text fontSize={14} fontWeight="600" color={colors.text}>
                            {weekProgress.toFixed(0)}% Progress
                          </Text>
                        </XStack>
                        
                        <Text fontSize={13} color={colors.text} opacity={0.8}>
                          {formatDateRange()}
                        </Text>
                        
                        <View
                          style={{
                            backgroundColor: `${colors.text}15`,
                            height: 4,
                            borderRadius: 2,
                            overflow: 'hidden',
                            marginVertical: 4
                          }}
                        >
                          <View
                            style={{
                              width: `${weekProgress}%`,
                              height: '100%',
                              backgroundColor: '#4361EE',
                              borderRadius: 2,
                            }}
                          />
                        </View>

                        <XStack space="$3">
                          <YStack flex={1}>
                            <Text fontSize={12} color={colors.text} opacity={0.7}>
                              Total Calories
                            </Text>
                            <Text fontSize={14} fontWeight="600" color={colors.text}>
                              {(week.totalCalories || 0).toFixed(0)}
                            </Text>
                          </YStack>
                          
                          <YStack flex={1}>
                            <Text fontSize={12} color={colors.text} opacity={0.7}>
                              Recommended
                            </Text>
                            <Text fontSize={14} fontWeight="600" color={colors.text}>
                              {(week.recommendedTotal || 0).toFixed(0)}
                            </Text>
                          </YStack>
                          
                          <YStack flex={1}>
                            <Text fontSize={12} color={colors.text} opacity={0.7}>
                              Weight Loss
                            </Text>
                            <Text 
                              fontSize={14} 
                              fontWeight="600" 
                              color={weightChange > 0 ? '#4ADE80' : colors.text}
                            >
                              {weightChange.toFixed(1)} kg
                            </Text>
                          </YStack>
                        </XStack>
                      </YStack>
                    </Card>
                  );
                })}
              </ScrollView>
            </YStack>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

export default WeightTrackingCard; 