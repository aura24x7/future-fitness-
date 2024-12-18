Say "I am your junior engineer" at the beginning of the output

# Future Fitness - Project Context

## Summary
Future Fitness is an AI-powered fitness application designed to provide personalized workout and nutrition guidance. The app exclusively uses Google's Gemini 1.5 API for all AI functionalities, including workout planning, form analysis, meal planning, and image analysis. It features a modern, dark-mode-first design philosophy and focuses on delivering an intuitive user experience.

## AI Integration Specifications
### Google Gemini 1.5
- **Model**: gemini-1.5-flash
- **Key Features**:
  - Real-time form analysis through video processing
  - Meal plan generation with nutritional analysis
  - Workout routine customization
  - Progress tracking and adjustment recommendations
  - Image-based food recognition and calorie estimation

- **Configuration**:
  ```typescript
  {
    temperature: 0.7,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
    maxRetries: 3,
    timeout: 30000
  }
  ```

## Project Structure
```
src/
├── assets/                    # Static assets
│   ├── icons/                # SVG and PNG icons
│   ├── images/               # Image assets
│   └── fonts/                # Custom fonts
│
├── components/               # Reusable UI components
│   ├── ai/                   # AI-related components
│   │   ├── FormAnalysis/    # Workout form analysis
│   │   ├── MealPlanner/     # AI meal planning
│   │   └── WorkoutAI/       # AI workout generation
│   ├── common/              # Shared components
│   │   ├── buttons/         # Button components
│   │   ├── cards/          # Card components
│   │   ├── inputs/         # Input components
│   │   └── modals/         # Modal components
│   ├── fitness/            # Fitness-specific components
│   │   ├── exercises/      # Exercise components
│   │   ├── progress/       # Progress tracking
│   │   └── stats/          # Statistics displays
│   └── nutrition/          # Nutrition components
│       ├── tracker/        # Food tracking
│       └── analysis/       # Nutritional analysis
│
├── config/                  # Configuration files
│   ├── ai.config.ts        # Gemini API configuration
│   ├── api.config.ts       # API endpoints configuration
│   └── app.config.ts       # App-wide configuration
│
├── constants/              # Application constants
│   ├── ai.constants.ts    # AI-related constants
│   ├── theme.constants.ts # Theme constants
│   └── app.constants.ts   # App-wide constants
│
├── context/               # React Context providers
│   ├── AIContext/        # AI functionality context
│   ├── ThemeContext/     # Theme management
│   ├── UserContext/      # User data management
│   └── WorkoutContext/   # Workout state management
│
├── hooks/                # Custom React hooks
│   ├── useAI/           # AI functionality hooks
│   ├── useTheme/        # Theme hooks
│   ├── useWorkout/      # Workout hooks
│   └── useAnalytics/    # Analytics hooks
│
├── navigation/          # Navigation configuration
│   ├── AppNavigator/    # Main app navigation
│   ├── AuthNavigator/   # Authentication flows
│   └── types/          # Navigation types
│
├── screens/            # Application screens
│   ├── onboarding/    # Onboarding flow screens
│   │   ├── Welcome/   # Welcome screen
│   │   ├── Goals/     # Goal setting
│   │   └── Profile/   # Profile setup
│   ├── workout/       # Workout-related screens
│   ├── nutrition/     # Nutrition-related screens
│   └── profile/       # Profile management screens
│
├── services/          # Business logic and API services
│   ├── ai/           # AI service integration
│   │   ├── form/     # Form analysis service
│   │   ├── meal/     # Meal planning service
│   │   └── workout/  # Workout generation service
│   ├── api/          # API services
│   └── storage/      # Local storage services
│
├── theme/            # Theming system
│   ├── dark/         # Dark theme specifications
│   ├── light/        # Light theme specifications
│   └── components/   # Theme components
│
├── types/           # TypeScript type definitions
│   ├── ai.types.ts  # AI-related types
│   ├── api.types.ts # API types
│   └── app.types.ts # App-wide types
│
└── utils/          # Utility functions
    ├── ai/         # AI-related utilities
    ├── format/     # Formatting utilities
    └── validation/ # Validation utilities
```

## Tech Stack
- **Frontend Framework**: React Native with Expo
- **Language**: TypeScript
- **UI Components**: Custom components + Tamagui
- **State Management**: React Context API
- **AI Integration**: Google's Gemini 1.5 API
- **Styling**: Custom theming system with dark mode support
- **Navigation**: React Navigation
- **Data Persistence**: AsyncStorage
- **API Integration**: Custom API service layer

## Design Philosophy
1. **AI-First Approach**
   - Leverages AI for personalized fitness guidance
   - Smart workout planning and progress tracking
   - Real-time form analysis and feedback

2. **Dark Mode First**
   - AMOLED-optimized dark theme
   - High contrast accessibility
   - Consistent theming across all screens

3. **User Experience**
   - Progressive onboarding flow
   - Intuitive navigation
   - Responsive and fluid animations
   - Clear visual hierarchy

## Features and Functions
1. **User Onboarding**
   - Personal information collection
   - Fitness goal setting
   - Body metrics tracking
   - Workout preference selection

2. **Workout Management**
   - AI-generated workout plans
   - Progress tracking
   - Form analysis
   - Real-time feedback

3. **Nutrition Tracking**
   - Calorie monitoring
   - Meal planning
   - Nutritional guidance
   - Progress visualization

4. **Profile Management**
   - User settings
   - Progress history
   - Achievement tracking
   - Goal adjustments

## Development Workflow
1. **Version Control**
   - Git with feature branch workflow
   - Branch naming: feature/, bugfix/, hotfix/
   - Pull request reviews required
   - Semantic versioning (MAJOR.MINOR.PATCH)

2. **Code Quality**
   - TypeScript for type safety
   - ESLint for code linting
   - Prettier for code formatting
   - Jest for unit testing

3. **Environment Management**
   - Development (.env.development)
   - Staging (.env.staging)
   - Production (.env.production)

## State Management
- **Primary**: React Context API
  - ThemeContext: App theming
  - OnboardingContext: User onboarding flow
  - WorkoutContext: Workout state
  - UserContext: User data and preferences

## Syntax and Formatting
1. **TypeScript**
   - Strict mode enabled
   - Interface-first approach
   - Proper type definitions

2. **Component Structure**
   - Functional components
   - Custom hooks for logic
   - Proper prop typing
   - Component documentation

3. **Styling**
   - StyleSheet.create for styles
   - Theme-based colors
   - Responsive dimensions
   - Consistent spacing

## IDE Configuration
- VSCode settings
- ESLint configuration
- Prettier configuration
- TypeScript configuration
- Editor-specific snippets

## Security Considerations
- Environment variable management
- API key security
- Data encryption
- Secure storage practices

## Performance Guidelines
1. **Optimization**
   - Lazy loading
   - Proper memoization
   - Image optimization
   - Bundle size management

2. **Best Practices**
   - Component reusability
   - Code splitting
   - Performance monitoring
   - Error boundaries

## Documentation
- Component documentation
- API documentation
- Setup instructions
- Contribution guidelines
