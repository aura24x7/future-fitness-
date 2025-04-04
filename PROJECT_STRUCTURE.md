# Future Fitness App Structure

## Project Overview
A React Native Expo application for fitness tracking and health management.

```typescript
future-fitness/
├── src/                          # Application source code
│   ├── components/               # React Native components
│   │   ├── analytics/           # Data visualization components
│   │   │   ├── MacroBarChart.tsx
│   │   │   └── MacroTooltip.tsx
│   │   ├── activity/            # Workout & activity tracking
│   │   ├── calorie/             # Calorie tracking & food logging
│   │   ├── charts/              # Chart components
│   │   ├── common/              # Shared UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Card.tsx
│   │   ├── food/                # Food tracking components
│   │   │   ├── FoodLogItem.tsx
│   │   │   └── MealTypeSelector.tsx
│   │   ├── monitoring/          # Progress tracking
│   │   ├── ProfileGroups/       # Social & group features
│   │   ├── sharing/             # Content sharing
│   │   ├── sync/                # Data synchronization
│   │   ├── themed/              # Theme-aware components
│   │   └── weight/              # Weight tracking
│   │
│   ├── screens/                 # Application screens
│   │   ├── onboarding/         # User onboarding flow
│   │   │   ├── WeightGoalScreen.tsx
│   │   │   ├── WeightTargetDateScreen.tsx
│   │   │   ├── BirthdayScreen.tsx
│   │   │   └── NameInputScreen.tsx
│   │   ├── auth/               # Authentication screens
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   ├── main/               # Core app screens
│   │   │   ├── DashboardScreen.tsx
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── AnalyticsScreen.tsx
│   │   │   └── SettingsScreen.tsx
│   │   └── features/           # Feature-specific screens
│   │       ├── FoodScreen.tsx
│   │       └── ActivityScreen.tsx
│   │
│   ├── context/                # Application contexts
│   │   ├── LoadingContext.tsx  # Loading state management
│   │   ├── SimpleFoodLogContext.tsx # Food logging state
│   │   ├── GymBuddyAlertContext.tsx # Workout notifications
│   │   ├── ProfileGroupsContext.tsx # Group management
│   │   └── MealContext.tsx     # Meal planning state
│   │
│   ├── services/               # Backend services
│   │   └── userProfileService.ts # User data management
│   │
│   ├── utils/                  # Utility functions
│   │   └── transforms/         # Data transformations
│   │       ├── victoryChartTransforms.ts
│   │       └── giftedChartTransforms.ts
│   │
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript definitions
│   ├── constants/              # Application constants
│   ├── store/                  # State management
│   ├── reducers/              # State reducers
│   ├── theme/                 # UI theming
│   ├── config/                # App configuration
│   ├── backup/                # Backup utilities
│   └── dev-utils/             # Development tools
│
├── assets/                     # Static resources
│   ├── images/                # Image assets
│   └── fonts/                 # Custom fonts
│
├── docs/                      # Documentation
│   ├── implementation_plans/  # Feature specifications
│   │   ├── FIREBASE_IMPLEMENTATION_PLAN.md
│   │   ├── SPLASH_SCREEN_IMPLEMENTATION_PLAN.md
│   │   └── weight_progress_implementation_plan.md
│   └── technical/            # Technical documentation
│       ├── expo_datepicker.md
│       └── gifted_charts_doc.md
│
├── scripts/                   # Build & maintenance scripts
│
├── config/                    # Project configuration
│   ├── babel.config.js       # Babel configuration
│   └── metro.config.js       # Metro bundler config
│
└── [Configuration Files]      # Root configuration files
    ├── app.json              # Expo configuration
    ├── package.json          # Dependencies & scripts
    ├── tsconfig.json         # TypeScript configuration
    ├── tamagui.config.ts     # UI framework config
    ├── .env                  # Environment variables
    └── .env.development      # Development environment
```

## Architecture Overview

### State Management
The application uses a hybrid state management approach:
- **Context API**: For feature-specific state (food logging, workouts, etc.)
- **Reducers**: For complex state logic
- **Store**: For global application state

### Component Organization
Components are organized by feature and responsibility:
- **Feature Components**: Located in feature-specific directories
- **Common Components**: Shared UI elements in `components/common`
- **Analytics Components**: Data visualization in `components/analytics`

### Navigation Structure
- **Authentication Flow**: Login, registration, password recovery
- **Onboarding Flow**: User setup and initial data collection
- **Main App Flow**: Dashboard, profile, analytics
- **Feature Flows**: Food tracking, activity monitoring

### Development Tools
- **TypeScript**: For type safety and better developer experience
- **Expo**: For cross-platform development
- **Tamagui**: For UI component styling
- **Jest**: For unit testing

## Best Practices
1. Feature-first organization
2. Separation of concerns
3. Reusable component architecture
4. Type-safe development
5. Documented implementation plans

## Ongoing Improvements
1. Consolidation of duplicate context directories
2. Standardization of state management patterns
3. Enhancement of component documentation
4. Optimization of build configuration 