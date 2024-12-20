import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Animated,
  Easing,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation, CommonActions } from '@react-navigation/native';
import { analyzeFoodImage, FoodAnalysisResult } from '../services/foodRecognitionService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSimpleFoodLog } from '../contexts/SimpleFoodLogContext';
import { useTheme } from '../theme/ThemeProvider';

type ScannedFoodDetailsParams = {
  imageUri?: string;
  imageBase64?: string;
  result?: FoodAnalysisResult;
  source?: 'image' | 'text';
};

type RouteParams = {
  ScannedFoodDetails: ScannedFoodDetailsParams;
};

const ScannedFoodDetailsScreen = () => {
  const route = useRoute<RouteProp<RouteParams, 'ScannedFoodDetails'>>();
  const navigation = useNavigation();
  const { imageUri, imageBase64, result: initialResult, source } = route.params;
  const [isAnalyzing, setIsAnalyzing] = useState(!initialResult);
  const [foodData, setFoodData] = useState<FoodAnalysisResult | null>(initialResult || null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { addFoodItem } = useSimpleFoodLog();
  const { colors, isDarkMode } = useTheme();
  const scoreAnimation = useRef(new Animated.Value(0)).current;
  const progressAnimations = useRef<{ [key: string]: Animated.Value }>({}).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const healthScoreRef = useRef(null);
  const hasAnimated = useRef(false);
  const scrollViewRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const analyzeFoodData = async () => {
      if (initialResult) {
        setFoodData(initialResult);
        setIsAnalyzing(false);
        return;
      }

      if (!imageBase64 && source === 'image') {
        setError('No image data available');
        setIsAnalyzing(false);
        return;
      }

      try {
        console.log('Starting food analysis...');
        const result = await analyzeFoodImage(imageBase64!);
        console.log('Analysis complete:', result);
        setFoodData(result);
      } catch (err) {
        console.error('Error analyzing food:', err);
        setError('Failed to analyze food. Please try again.');
        Alert.alert('Error', 'Failed to analyze food. Please try again.');
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeFoodData();
  }, [imageBase64, initialResult, source]);

  const startAnimations = () => {
    if (hasAnimated.current || isAnimating || !foodData?.healthScore) return;
    
    setIsAnimating(true);

    try {
      // Reset animation values
      fadeAnim.setValue(0);
      scoreAnimation.setValue(0);
      Object.keys(progressAnimations).forEach(key => {
        if (progressAnimations[key]) {
          progressAnimations[key].setValue(0);
        }
      });

      // Sequence the animations
      Animated.sequence([
        // First fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        
        // Then animate score and progress bars
        Animated.parallel([
          Animated.timing(scoreAnimation, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          ...Object.entries(foodData.healthScore.breakdown).map(([key, value]) => {
            if (!progressAnimations[key]) {
              progressAnimations[key] = new Animated.Value(0);
            }
            return Animated.timing(progressAnimations[key], {
              toValue: value,
              duration: 800,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: false,
            });
          })
        ])
      ]).start(({ finished }) => {
        if (finished) {
          hasAnimated.current = true;
          setIsAnimating(false);
        }
      });
    } catch (error) {
      console.error('Animation error:', error);
      setIsAnimating(false);
      // Ensure UI is visible even if animation fails
      fadeAnim.setValue(1);
      scoreAnimation.setValue(1);
      Object.entries(foodData.healthScore.breakdown).forEach(([key, value]) => {
        if (progressAnimations[key]) {
          progressAnimations[key].setValue(value);
        }
      });
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    checkVisibility(contentOffset.y, layoutMeasurement.height, contentSize.height);
  };

  const checkVisibility = (yOffset: number, layoutHeight: number, contentHeight: number) => {
    if (!hasAnimated.current && !isAnimating && healthScoreRef.current) {
      const scrollPosition = yOffset + layoutHeight;
      const healthScorePosition = contentHeight * 0.3;

      if (scrollPosition > healthScorePosition) {
        if (animationTimeout.current) {
          clearTimeout(animationTimeout.current);
        }
        animationTimeout.current = setTimeout(startAnimations, 50);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    if (foodData && !isAnalyzing) {
      // Reset animation states
      hasAnimated.current = false;
      setIsAnimating(false);
      
      // Clear any existing timeout
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
      }

      // Start animations if health score section is already visible
      animationTimeout.current = setTimeout(() => {
        if (scrollViewRef.current && healthScoreRef.current) {
          startAnimations();
        }
      }, 100);
    }
  }, [foodData, isAnalyzing]);

  const navigateToDashboard = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          { name: 'Dashboard' }
        ],
      })
    );
  };

  const handleSaveToLog = async () => {
    if (!foodData) return;

    setIsSaving(true);
    try {
      const calories = foodData.nutritionInfo.calories || 0;
      const protein = foodData.nutritionInfo.protein || 0;
      const carbs = foodData.nutritionInfo.carbs || 0;
      const fat = foodData.nutritionInfo.fat || 0;

      const newFoodItem = {
        name: foodData.foodName || 'Unknown Food',
        calories,
        protein,
        carbs,
        fat,
      };

      await addFoodItem(newFoodItem);

      Alert.alert(
        'Food Added Successfully',
        `Added ${newFoodItem.name} to your log:\n` +
        `• ${calories} calories\n` +
        `• ${protein}g protein\n` +
        `• ${carbs}g carbs\n` +
        `• ${fat}g fat`,
        [
          {
            text: 'View Dashboard',
            onPress: navigateToDashboard,
            style: 'default',
          },
          {
            text: 'Scan Another',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err) {
      console.error('Error saving food:', err);
      Alert.alert('Error', 'Failed to save food to log. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isAnalyzing) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Analyzing your food...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={64} color="#FF3B30" />
          <Text style={styles.errorTitle}>Analysis Failed</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        ref={scrollViewRef}
        bounces={true}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        alwaysBounceVertical={true}
        overScrollMode="always"
      >
        {source === 'image' && imageUri && (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: imageUri }} 
              style={styles.image}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.imageGradient}
            />
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {!imageUri && (
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Food Analysis
            </Text>
            <View style={styles.headerRight} />
          </View>
        )}
        
        {foodData && (
          <Animated.View style={[styles.detailsContainer, { 
            backgroundColor: colors.background,
            opacity: fadeAnim,
            transform: [{ 
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              })
            }]
          }]}>
            <Text style={[styles.foodName, { color: colors.text }]}>
              {foodData.foodName || 'Unable to identify'}
            </Text>
            
            <View style={styles.descriptionContainer}>
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                {foodData.description || 'No description available'}
              </Text>
            </View>

            {foodData.itemBreakdown && foodData.itemBreakdown.totalItems > 1 && (
              <View style={styles.itemBreakdownContainer}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Item Breakdown
                </Text>
                {foodData.itemBreakdown.itemList.map((item, index) => (
                  <View key={index} style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                      <Text style={[styles.itemName, { color: colors.text }]}>
                        {item.name} {item.quantity > 1 ? `(${item.quantity}x)` : ''}
                      </Text>
                      <Text style={[styles.itemCalories, { color: colors.textSecondary }]}>
                        {item.individualNutrition.calories} cal
                      </Text>
                    </View>
                    <Text style={[styles.itemDescription, { color: colors.textSecondary }]}>
                      {item.description}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {foodData.healthScore && (
              <View 
                ref={healthScoreRef}
                style={styles.healthScoreContainer}
              >
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Health Score
                </Text>
                <View style={styles.healthScoreCard}>
                  <View style={styles.scoreHeader}>
                    <View style={styles.scoreCircleContainer}>
                      <Animated.View style={[styles.scoreCircle, { 
                        borderColor: getHealthScoreColor(foodData.healthScore.overall / 10),
                        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                        transform: [
                          { scale: scoreAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1],
                          })},
                        ]
                      }]}>
                        <Text style={[styles.scoreValue, { 
                          color: getHealthScoreColor(foodData.healthScore.overall / 10)
                        }]}>
                          {(foodData.healthScore.overall / 10).toFixed(1)}
                        </Text>
                        <Text style={[styles.scoreOutOf, { 
                          color: getHealthScoreColor(foodData.healthScore.overall / 10)
                        }]}>
                          /10
                        </Text>
                      </Animated.View>
                      <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>
                        {getHealthScoreLabel(foodData.healthScore.overall / 10)}
                      </Text>
                    </View>
                    <View style={styles.scoreBreakdown}>
                      {Object.entries(foodData.healthScore.breakdown).map(([key, value]) => (
                        <View key={key} style={styles.breakdownItem}>
                          <View style={styles.breakdownHeader}>
                            <Text style={[styles.breakdownLabel, { color: colors.text }]}>
                              {formatBreakdownLabel(key)}
                            </Text>
                            <Text style={[styles.breakdownValue, { 
                              color: getHealthScoreColor(value / 10)
                            }]}>
                              {(value / 10).toFixed(1)}/10
                            </Text>
                          </View>
                          <View style={styles.progressBarContainer}>
                            <View style={styles.progressBar}>
                              <Animated.View 
                                style={[styles.progressFill, { 
                                  width: progressAnimations[key]?.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: ['0%', '100%'],
                                  }) || '0%',
                                  backgroundColor: getHealthScoreColor(value / 10)
                                }]} 
                              />
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                  {foodData.healthScore.recommendations?.length > 0 && (
                    <View style={styles.recommendationsContainer}>
                      <Text style={[styles.recommendationsTitle, { color: colors.text }]}>
                        Recommendations
                      </Text>
                      {foodData.healthScore.recommendations.map((rec, index) => (
                        <View key={index} style={styles.recommendationItem}>
                          <View style={[styles.recommendationBullet, { 
                            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                          }]} />
                          <Text style={[styles.recommendation, { color: colors.textSecondary }]}>
                            {rec}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )}

            <View style={styles.nutritionContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Nutrition Information
              </Text>
              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionItem}>
                  <View style={[styles.nutritionCard, { 
                    backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.1)' : '#F5F7FA'
                  }]}>
                    <View style={[styles.macroIcon, { 
                      backgroundColor: 'rgba(99, 102, 241, 0.15)'
                    }]}>
                      <Ionicons name="flame-outline" size={20} color="#6366F1" />
                    </View>
                    <View style={styles.nutritionContent}>
                      <Text style={[styles.nutritionValue, { color: '#6366F1' }]}>
                        {foodData.nutritionInfo.calories || '0'}
                      </Text>
                      <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>
                        Calories
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.nutritionItem}>
                  <View style={[styles.nutritionCard, { 
                    backgroundColor: isDarkMode ? 'rgba(34, 197, 94, 0.1)' : '#F5F7FA'
                  }]}>
                    <View style={[styles.macroIcon, { 
                      backgroundColor: 'rgba(34, 197, 94, 0.15)'
                    }]}>
                      <Ionicons name="fitness-outline" size={20} color="#22C55E" />
                    </View>
                    <View style={styles.nutritionContent}>
                      <Text style={[styles.nutritionValue, { color: '#22C55E' }]}>
                        {foodData.nutritionInfo.protein || '0'}g
                      </Text>
                      <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>
                        Protein
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.nutritionItem}>
                  <View style={[styles.nutritionCard, { 
                    backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : '#F5F7FA'
                  }]}>
                    <View style={[styles.macroIcon, { 
                      backgroundColor: 'rgba(59, 130, 246, 0.15)'
                    }]}>
                      <Ionicons name="leaf-outline" size={20} color="#3B82F6" />
                    </View>
                    <View style={styles.nutritionContent}>
                      <Text style={[styles.nutritionValue, { color: '#3B82F6' }]}>
                        {foodData.nutritionInfo.carbs || '0'}g
                      </Text>
                      <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>
                        Carbs
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.nutritionItem}>
                  <View style={[styles.nutritionCard, { 
                    backgroundColor: isDarkMode ? 'rgba(249, 115, 22, 0.1)' : '#F5F7FA'
                  }]}>
                    <View style={[styles.macroIcon, { 
                      backgroundColor: 'rgba(249, 115, 22, 0.15)'
                    }]}>
                      <Ionicons name="water-outline" size={20} color="#F97316" />
                    </View>
                    <View style={styles.nutritionContent}>
                      <Text style={[styles.nutritionValue, { color: '#F97316' }]}>
                        {foodData.nutritionInfo.fat || '0'}g
                      </Text>
                      <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>
                        Fat
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={handleSaveToLog}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Add to Food Log</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const getHealthScoreColor = (score: number) => {
  if (score >= 8.5) return '#22C55E';       // Vibrant Green
  if (score >= 7.0) return '#3B82F6';       // Bright Blue
  if (score >= 5.5) return '#8B5CF6';       // Vibrant Purple
  if (score >= 4.0) return '#F59E0B';       // Warm Amber
  return '#EF4444';                         // Bright Red
};

const getHealthScoreLabel = (score: number) => {
  if (score >= 8.5) return 'Excellent';
  if (score >= 7.0) return 'Very Good';
  if (score >= 5.5) return 'Good';
  if (score >= 4.0) return 'Fair';
  return 'Needs Improvement';
};

const formatBreakdownLabel = (key: string) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 16,
    left: 16,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  imageContainer: {
    height: 250,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  detailsContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  foodName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 24,
  },
  nutritionContainer: {
    marginBottom: 24,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  nutritionItem: {
    width: '48%',
    marginBottom: 10,
  },
  nutritionCard: {
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  macroIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  nutritionContent: {
    flex: 1,
    justifyContent: 'center',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  nutritionLabel: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.7,
    letterSpacing: 0.2,
  },
  actionButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF3B30',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  itemBreakdownContainer: {
    marginBottom: 24,
  },
  itemCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemCalories: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  healthScoreContainer: {
    marginBottom: 24,
  },
  healthScoreCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  scoreCircleContainer: {
    alignItems: 'center',
    marginRight: 20,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 32,
    textAlign: 'center',
  },
  scoreOutOf: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
    opacity: 0.9,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  scoreBreakdown: {
    flex: 1,
  },
  breakdownItem: {
    marginBottom: 12,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  progressBar: {
    flex: 1,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  recommendationsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
  },
  recommendation: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ScannedFoodDetailsScreen;
