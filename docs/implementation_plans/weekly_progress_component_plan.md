# Weekly Progress Component Implementation Plan

## Overview
This document outlines the implementation plan for a new component that displays progress based on weekly data, showing metrics like total weight lost, progress percentage, weekly average, and time remaining.

## Key Requirements
- Display weekly progress metrics
- Handle missing calorie data (average if ≤2 days missing, hide if >2 days missing)
- Reuse existing types and services
- Ensure proper data validation
- Maintain existing functionality

## Phase 1: Data Layer Enhancements

### New Types (src/types/weight.ts)
```typescript
export interface WeeklyProgress {
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
  progressPercentage: number;
  weeklyChange: number;
  weeksCompleted: number;
  totalWeeks: number;
  caloriesDeficit: number;
  isDataValid: boolean;
}
```

## Phase 2: Weight Service Modifications

### New Service Methods (weightService.ts)
```typescript
async calculateWeeklyProgress(): Promise<WeeklyProgress> {
  const logs = await this.getWeightLogs();
  const goal = await this.getWeightGoal();
  const calorieData = await this.getWeeklyCalorieData();
  
  const validDays = calorieData.filter(c => c !== undefined).length;
  if (validDays < 5) {
    return {
      ...goal,
      isDataValid: false,
      currentWeight: 0,
      progressPercentage: 0,
      weeklyChange: 0,
      weeksCompleted: 0,
      caloriesDeficit: 0
    };
  }

  const avgCalories = validDays === 7 ? 
    calorieData.reduce((a,b) => a + b, 0) / 7 :
    (calorieData.filter(c => c).reduce((a,b) => a + b, 0) / validDays) * 7;

  const weeklyLoss = this.calculateAdjustedWeeklyLoss(
    goal.startWeight,
    goal.targetWeight,
    goal.totalWeeks,
    avgCalories,
    userProfile.tdee
  );

  return {
    ...goal,
    currentWeight: this.calculateCurrentWeight(logs),
    progressPercentage: this.calculateProgress(logs, goal),
    weeklyChange: weeklyLoss,
    weeksCompleted: this.getWeeksCompleted(logs),
    caloriesDeficit: (userProfile.tdee - avgCalories) * 7,
    isDataValid: true
  };
}
```

### Validation Logic
```typescript
// Valid week calculation
const hasValidWeek = (calorieData: number[]) => {
  const validEntries = calorieData.filter(c => c !== undefined);
  return validEntries.length >= 5;
};

// Current weight calculation
private calculateCurrentWeight(logs: WeightLog[]): number {
  const sortedLogs = [...logs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  return sortedLogs[0]?.weight || 0;
}
```

## Phase 3: UI Component Implementation

### New Component (src/components/analytics/WeightProgressSimple.tsx)
```typescript
export const WeightProgressSimple = () => {
  const { data, isLoading } = useWeightService();
  const { weightSettings } = useWeight();

  const renderContent = () => {
    if (!data?.isDataValid) {
      return (
        <Text padding="$4">
          Data available after completing a week with at least 5 days of calorie entries
        </Text>
      );
    }

    return (
      <YStack padding="$4" space="$3">
        <ProgressCard
          title="Current Progress"
          current={data.currentWeight}
          start={data.startWeight}
          target={data.targetWeight}
          unit={weightSettings.unit}
        />
        
        <XStack space="$4">
          <MetricCard
            title="Weekly Change"
            value={data.weeklyChange}
            unit={weightSettings.unit}
          />
          <MetricCard
            title="Time Remaining"
            value={`${data.weeksCompleted}/${data.totalWeeks} weeks`}
          />
        </XStack>
        
        <CalorieDeficitCard
          deficit={data.caloriesDeficit}
          target={7700 * Math.abs(data.weeklyChange)}
        />
      </YStack>
    );
  };

  return (
    <Card elevate size="$4" bordered>
      <Text fontSize={18} fontWeight="600" padding="$4">
        Weight Progress
      </Text>
      {isLoading ? <Spinner /> : renderContent()}
    </Card>
  );
};
```

## Phase 4: Integration

### Tasks
1. Replace existing chart in WeightProgressSection with new component
2. Verify data flow and state management
3. Test edge cases:
   - Less than a week of data
   - Missing calorie entries
   - Unit conversion
   - Progress calculation accuracy

### Integration Points
- Maintain existing state management
- Keep current weight unit settings
- Preserve weight logging functionality
- Reuse existing data fetching logic

## Testing Considerations
1. Data Validation
   - Verify minimum data requirements
   - Test missing calorie data handling
   - Validate weekly aggregation
   - Test with mock data:
     * 7 days of weight logs with realistic variations
     * Daily calorie values between 1500-2200
     * Proper date formatting and timestamps
     * Valid user IDs and metadata

2. UI Testing
   - Check responsive layout
   - Verify unit conversions
   - Test loading states
   - Validate error messages
   - Test view mode switching
   - Verify card layouts and spacing

3. Integration Testing
   - Verify data flow
   - Test state updates
   - Check existing feature compatibility
   - Test Firebase query performance
   - Validate mock data generation

4. Mock Data Configuration
   - Weight logs:
     * 7 days of data
     * Starting weight: 85kg
     * Daily variation: ±0.3kg
     * Progressive weight loss: 0.2kg/day
   - Calorie logs:
     * 7 days of data
     * Range: 1500-2200 calories
     * Realistic daily variations
     * Proper timestamp alignment

## Implementation Checklist
- [x] Phase 1: Add new types
- [x] Phase 2: Implement service methods
- [x] Phase 3: Create UI component
- [x] Phase 4: Integration
- [ ] Testing
  - [x] Add mock data generation
  - [x] Configure Firebase indexes
  - [ ] Complete test scenarios
- [ ] Documentation update
- [ ] Code review
- [ ] Final testing
- [ ] Deployment

## Dependencies
- Existing weight service
- Weight goal data from onboarding
- Calorie tracking infrastructure
- Unit conversion utilities

## Notes
- Maintain TypeScript type safety
- Follow existing code style
- Use functional components
- Implement proper error handling
- Keep performance in mind 