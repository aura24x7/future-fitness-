# Macro Breakdown Chart Implementation Plan

## Overview
Enhance the analytics chart to display macro breakdown (protein, carbs, fats) within daily calorie bars while maintaining existing functionality and UI/UX.

## Current Structure
```
AnalyticsScreen
└── AnalyticsDashboard
    └── TrendChart (uses LineChart from react-native-chart-kit)
```

## Data Flow
```
simpleFoodLogService (raw data)
└── analyticsService (calculations)
    └── AnalyticsDashboard (data processing)
        └── TrendChart (visualization)
```

## Implementation Phases

### Phase 1: Data Structure Enhancement ✅
**Focus**: Update types and ensure data flow
- Tasks:
  - [x] Update CalorieTrend interface in types/analytics.ts
  - [x] Add macro breakdown properties
  - [x] Ensure backward compatibility (made macros optional)
  - [x] Verify type integration

**Files Involved**:
- src/types/analytics.ts ✅
- src/services/analyticsService.ts ✅
- src/services/calorieService.ts

### Phase 2: Service Layer Updates ✅
**Focus**: Enhance analytics calculations
- Tasks:
  - [x] Modify calculateDailyAnalytics()
  - [x] Update calculateWeeklyAnalytics()
  - [x] Maintain caching mechanism
  - [x] Add data validation

**Files Involved**:
- src/services/analyticsService.ts ✅
- src/services/simpleFoodLogService.ts

### Phase 3: Component Preparation ✅
**Focus**: Set up chart infrastructure
- Tasks:
  - [x] Create new chart configuration
  - [x] Set up macro color mapping
  - [x] Maintain current layout
  - [x] Implement theme integration

**Files Involved**:
- src/components/analytics/TrendChart.tsx ✅
- src/theme/ThemeProvider.tsx ✅

### Phase 4: Chart Implementation ⬜
**Focus**: Implement stacked bar visualization
- Tasks:
  - [ ] Implement stacked bar configuration
  - [ ] Set up data transformation
  - [ ] Maintain styling
  - [ ] Add responsiveness

**Files Involved**:
- src/components/analytics/TrendChart.tsx

### Phase 5: Integration & Testing ⬜
**Focus**: Ensure smooth integration
- Tasks:
  - [ ] Test data flow
  - [ ] Verify theme compatibility
  - [ ] Test responsive behavior
  - [ ] Validate error handling

**Files Involved**:
- src/components/analytics/AnalyticsDashboard.tsx
- src/screens/AnalyticsScreen.tsx

## Safety Measures
1. **Backward Compatibility**
   - Maintain existing functionality
   - Handle missing macro data gracefully
   - Preserve current UI/UX

2. **Error Prevention**
   - Data validation at service layer
   - Type checking throughout
   - Fallback mechanisms

3. **Performance**
   - Maintain current caching
   - Optimize data transformations
   - Monitor render performance

## Color Scheme
- Protein: ${colors.macros.protein}
- Carbs: ${colors.macros.carbs}
- Fats: ${colors.macros.fats}

## Progress Tracking
- ⬜ Not Started
- 🟡 In Progress
- ✅ Completed
- ❌ Blocked

## Notes
- Each phase must be tested independently
- UI/UX must remain consistent
- Existing features must continue to work
- Dark/light theme support must be maintained 