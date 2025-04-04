say "master" Every time before giving response

# Future Fitness Code Editor Rules
Every time you choose to apply a rule(s), explicitly state the rule(s) in the output. You can abbreviate the rule description to a single word or phrase. 
## Project Context

Future Fitness is a React Native mobile application focused on fitness tracking, meal planning, and workout management. The app helps users track their fitness journey, monitor calorie intake, and achieve their health goals.

## Project Structure

```
/
├── src/            # Main application source code
│   ├── assets/     # Images, fonts, and other static files
│   ├── components/ # Reusable UI components
│   ├── config/     # Configuration files
│   ├── constants/  # Constants and enums
│   ├── context/    # React Context providers
│   ├── hooks/      # Custom React hooks
│   ├── navigation/ # Navigation configuration
│   ├── screens/    # Screen components
│   ├── services/   # API and business logic services
│   ├── theme/      # Theme configuration
│   ├── types/      # TypeScript type definitions
│   └── utils/      # Utility functions
├── assets/         # Root level static assets
├── docs/           # Project documentation
├── scripts/        # Build and utility scripts
├── .env           # Production environment variables
├── .env.development # Development environment variables
├── app.json       # Expo configuration
├── babel.config.js # Babel configuration
├── eas.json       # EAS Build configuration
├── metro.config.js # Metro bundler configuration
├── package.json    # Dependencies and scripts
└── tamagui.config.ts # Tamagui UI configuration
```

## Tech Stack

- React Native with Expo
- TypeScript
- Tamagui UI Framework
- React Navigation
- React Context for State Management
- Async Storage for Local Data
- React Native Reanimated for Animations
- EAS Build for deployment
- Jest for testing
- ESLint + Prettier for code formatting

## Environment Configuration

The application uses different environment files for development and production:

- `.env` - Production environment variables
- `.env.development` - Development environment variables

Environment variables should follow these rules:
- Keep sensitive information in environment variables
- Never commit actual values of sensitive environment variables
- Include a `.env.example` file with placeholder values
- Document all required environment variables

## Documentation Standards

- All new features should have corresponding documentation in the `docs/` directory
- Implementation plans should be documented in markdown files (e.g., `FIREBASE_IMPLEMENTATION_PLAN.md`)
- Each major feature should include:
  - Overview and purpose
  - Technical implementation details
  - Dependencies and requirements
  - Testing strategy
  - Deployment considerations

## Code Style Rules

### General

- Use TypeScript strict mode for all new files
- Implement functional components with hooks
- Follow SOLID principles
- Keep files under 300 lines
- Use meaningful names that reflect fitness/health domain

### Naming Conventions

- **Files:**
  - Screen components: `[Name]Screen.tsx` (e.g., `DashboardScreen.tsx`)
  - Feature components: `[Name]Card.tsx`, `[Name]Form.tsx`
  - Context files: `[Name]Context.tsx`
  - Service files: `[name]Service.ts`
  - Hook files: `use[Name].ts`

- **Components:**
  ```typescript
  export interface WorkoutCardProps {
    workout: Workout;
    onPress: () => void;
    isActive?: boolean;
  }

  export const WorkoutCard: React.FC<WorkoutCardProps> = ({
    workout,
    onPress,
    isActive = false,
  }) => {
    // Implementation
  };
  ```

### Type Definitions

```typescript
// User Profile Types
interface UserProfile {
  id: string;
  name: string;
  height: number;
  weight: number;
  goals: FitnessGoals;
  dietaryPreferences: DietaryPreference[];
}

// Workout Types
interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
  duration: number;
  caloriesBurned: number;
}

// Nutrition Types
interface MealEntry {
  id: string;
  name: string;
  calories: number;
  nutrients: NutrientInfo;
  timestamp: Date;
}
```

### Context Structure

```typescript
interface ProfileContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateWeight: (weight: number) => Promise<void>;
  updateGoals: (goals: FitnessGoals) => Promise<void>;
}

export const ProfileContext = createContext<ProfileContextType>(defaultValue);

export const ProfileProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // Implementation
};
```

### Screen Structure

```typescript
export const WorkoutScreen: React.FC = () => {
  // 1. Hooks and Context
  const { profile } = useProfile();
  const navigation = useNavigation();

  // 2. State Management
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 3. Effects
  useEffect(() => {
    loadWorkouts();
  }, []);

  // 4. Handlers
  const handleWorkoutPress = useCallback((workout: Workout) => {
    navigation.navigate('WorkoutDetails', { workoutId: workout.id });
  }, []);

  // 5. Render Methods
  const renderWorkoutCard = useCallback((workout: Workout) => (
    <WorkoutCard
      key={workout.id}
      workout={workout}
      onPress={() => handleWorkoutPress(workout)}
    />
  ), [handleWorkoutPress]);

  // 6. Main Render
  return (
    <Screen>
      <Header title="Workouts" />
      <WorkoutList
        data={workouts}
        renderItem={renderWorkoutCard}
        isLoading={isLoading}
      />
    </Screen>
  );
};
```

### API Service Pattern

```typescript
export const userProfileService = {
  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await api.put('/profile', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};
```

### Styling Guidelines

- Use Tamagui's theme tokens for consistency:
```typescript
import { styled } from 'tamagui';

export const StyledCard = styled(Stack, {
  backgroundColor: '$background',
  borderRadius: '$medium',
  padding: '$medium',
  variants: {
    type: {
      workout: { backgroundColor: '$blue2' },
      nutrition: { backgroundColor: '$green2' },
    },
  },
});
```

### Error Handling

```typescript
export const ErrorBoundary: React.FC<PropsWithChildren> = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <ErrorView
        message="Something went wrong"
        onRetry={() => setHasError(false)}
      />
    );
  }

  return children;
};
```

### Performance Optimization

- Use `useMemo` for expensive calculations:
```typescript
const calorieStats = useMemo(() => {
  return calculateCalorieStats(mealEntries);
}, [mealEntries]);
```

- Use `useCallback` for event handlers:
```typescript
const handleSave = useCallback(async () => {
  await saveUserProfile(profile);
}, [profile]);
```

### Testing

```typescript
describe('CalorieTrackerCard', () => {
  it('displays correct calorie information', () => {
    const calories = {
      consumed: 1200,
      target: 2000,
      remaining: 800,
    };
    
    render(<CalorieTrackerCard calories={calories} />);
    
    expect(screen.getByText('1200')).toBeInTheDocument();
    expect(screen.getByText('800')).toBeInTheDocument();
  });
});
```

## VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "javascript.preferences.importModuleSpecifier": "non-relative"
}
```

## Required Extensions

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tamagui
- React Native Tools
- GitLens
- Error Lens
- Import Cost

## Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "tsc --noEmit"
    ]
  }
}
```

## Git Commit Message Format

```
type(scope): subject

body
```

Types:
- feat: New feature
- fix: Bug fix
- perf: Performance improvement
- refactor: Code change that neither fixes a bug nor adds a feature
- style: Changes that do not affect the meaning of the code
- test: Adding missing tests
- docs: Documentation only changes
- chore: Changes to the build process or auxiliary tools

Example:
```
feat(workout): add calorie tracking to workout sessions

- Added real-time calorie calculation
- Integrated with heart rate monitor
- Updated workout summary screen
```

Remember to follow these guidelines to maintain consistency across the Future Fitness codebase and improve development efficiency. 