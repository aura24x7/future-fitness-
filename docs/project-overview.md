# Phase 1: Project Overview and Technology Stack

## Project Overview
Future Fitness is a modern fitness and wellness application built with React Native and Expo. The application is designed to provide a comprehensive fitness and wellness experience through a mobile platform.

## Core Technology Stack

### Frontend Framework
- **React Native (0.76.5)**: Core framework for mobile app development
- **Expo (SDK 52)**: Development platform and toolchain
- **TypeScript**: Programming language for type-safe development

### UI/UX Framework
- **Tamagui (1.120.1)**: Primary UI framework with following components:
  - Animations support (react-native and reanimated)
  - Custom themes and configurations
  - Font system (Inter font family)
  - Media drivers for responsive design
- **React Navigation 7.0**: Navigation system
  - Bottom tabs navigation
  - Native stack navigation
  - Deep linking support
  - Screen transition animations
- **Various UI Components**:
  - Bottom sheets (@gorhom/bottom-sheet)
  - Vector icons (Expo and React Native)
  - Calendar integration
  - Charts (react-native-gifted-charts)
  - Camera integration (expo-camera, vision-camera)
  - Custom alert system
  - Loading indicators
  - Error boundaries

### State Management and Data Persistence
- **Context API**: Primary state management solution
  - Hierarchical context structure
  - Feature-specific contexts
  - Global state management
- **AsyncStorage**: Local data persistence
  - Authentication caching
  - Offline data support
  - State persistence
- **Firebase Integration**:
  - Authentication (@react-native-firebase/auth)
  - Cloud services (Firebase core)
  - Real-time data synchronization
  - User profile management

### API and Network
- **Axios**: HTTP client for API requests
- **NetInfo**: Network connectivity management
- **Expo File System**: File management
- **Expo Notifications**: Push notifications
- **Firebase API**: Backend services integration

### Development and Build Tools
- **Babel**: JavaScript compiler with plugins:
  - Class properties
  - Decorators
  - Flow strip types
  - Runtime transformation
- **Metro**: JavaScript bundler
- **TypeScript**: Static type checking
- **Environment Configuration**: 
  - dotenv for environment variables
  - Development/Production configurations
  - Firebase configuration management

## Key Features and Integration Points

### AI Integration
- Google's Generative AI integration (@google/generative-ai)

### Media and UI Features
- Camera functionality
- Media library integration
- QR code generation
- Charts and data visualization
- Gesture handling
- Blur effects
- Linear gradients
- Splash screen
- Status bar customization
- Custom navigation components
- Error boundary system

### Data Management
- Date handling (date-fns)
- LRU caching mechanism
- File system operations
- Share functionality
- Offline data persistence
- State synchronization
- Real-time updates

## Development Environment

### Build Configuration
- Expo configuration
- Metro bundler setup
- Babel configuration
- TypeScript configuration
- Environment-specific settings

### Platform Support
- iOS
- Android
- Web (experimental)

## Critical Considerations for Frontend-Backend Separation

### Current Integration Points
1. Firebase Services:
   - Authentication flow
   - Data storage and retrieval
   - Real-time updates and listeners
   - User profile management
   - State synchronization

2. Local Storage:
   - AsyncStorage for offline data
   - File system operations
   - Credential management
   - State persistence

3. API Communications:
   - Axios for HTTP requests
   - Network state management
   - Real-time data synchronization
   - Error handling and recovery

### Preservation Requirements
1. **UI/UX Integrity**:
   - All existing UI components must maintain current behavior
   - Animation systems must remain unchanged
   - Navigation flows must be preserved
   - Error boundaries must function correctly
   - Loading states must be handled properly

2. **Feature Consistency**:
   - All current functionalities must work without degradation
   - Real-time updates must maintain current performance
   - Offline capabilities must be preserved
   - Authentication flow must remain seamless
   - State management must be consistent

3. **Data Flow**:
   - State management must remain consistent
   - Data synchronization patterns must be maintained
   - Cache mechanisms must continue functioning
   - Error recovery must be robust
   - Real-time updates must be reliable

## Next Steps
1. Document the core application structure (Phase 2) ✓
2. Map out all Firebase integration points
3. Identify all API endpoints currently in use
4. Create a detailed state management flow diagram
5. Document error handling and recovery mechanisms

This documentation will be continuously updated as we proceed through subsequent phases to ensure a complete understanding of the system before separation. 

Core Application Structure

## Application Entry Points

### Root Component (App.tsx)
- Implements provider pattern for global state management
- Hierarchical context providers:
  1. SafeAreaProvider (Layout)
  2. GestureHandlerRootView (Gestures)
  3. ThemeProvider (Styling)
  4. ErrorBoundary (Error Handling)
  5. AuthProvider (Authentication)
  6. LoadingProvider (Loading States)
  7. Multiple Feature-specific Providers

### Context Providers Hierarchy
```
SafeAreaProvider
└── GestureHandlerRootView
    └── ThemeProvider
        └── ErrorBoundary
            └── AuthProvider
                └── LoadingProvider
                    └── NavigationContainer
                        └── Feature Providers
                            - ProfileProvider
                            - OnboardingProvider
                            - TabBarProvider
                            - MealProvider
                            - SimpleFoodLogProvider
                            - ProfileGroupsProvider
                            - GymBuddyAlertProvider
```

## Navigation System

### Navigation Structure
1. **Root Navigation (AppNavigator)**
   - Handles authentication flow
   - Manages onboarding flow
   - Routes to main application

2. **Authentication Flow**
   - Login Screen
   - Register Screen

3. **Onboarding Flow**
   - Welcome Screen
   - Name Input Screen
   - Birthday Screen
   - Gender Screen
   - Height/Weight Screen
   - Activity Level Screen
   - Dietary Preference Screen
   - Weight Goal Screen
   - Location Screen
   - Workout Preference Screen
   - Final Setup Screen

4. **Main Application Flow (MainNavigator)**
   - Dashboard Screen (Home)
   - Food-related Screens:
     - Food Scanner
     - Food Text Input
     - Scanned Food Details
   - Group-related Screens:
     - Profile Groups
     - Group Details
     - Create Group
     - Invite Members
     - Manage Invites
     - Add Individual
   - Profile & Settings:
     - Profile Screen
     - Settings Screen

## State Management

### Authentication State
- Managed by AuthContext
- Features:
  - User authentication state
  - Login/Register functionality
  - Password reset
  - Profile updates
  - Persistent authentication
  - Auto-login capability

### Global State Management
1. **User-related State**
   - Profile information
   - Authentication status
   - Onboarding progress

2. **Feature-specific State**
   - Meal tracking
   - Food logging
   - Profile groups
   - Gym buddy alerts
   - Loading states
   - Tab bar state

### Data Persistence
1. **Firebase Integration**
   - User authentication
   - Profile data
   - Real-time updates

2. **Local Storage**
   - Authentication persistence
   - Credentials caching
   - Offline data support

## Theme and Styling System

### Tamagui Configuration
- Custom theme configuration
- Responsive design support
- Animation configurations
- Font system setup

### UI Components
1. **Navigation Components**
   - Custom bottom taskbar
   - Navigation headers
   - Screen transitions

2. **Common Components**
   - Alert notifications
   - Loading indicators
   - Error boundaries
   - Splash screen

## Critical Integration Points

### Firebase Services
- Authentication service
- Firestore database
- Real-time listeners
- Profile management

### Local Storage
- AsyncStorage implementation
- Credential management
- State persistence

### Navigation Integration
- Screen routing
- Deep linking
- Navigation state management
- Screen transitions

## Error Handling and Recovery

### Error Boundary Implementation
- Global error catching
- Graceful degradation
- Error reporting

### State Recovery
- Authentication state recovery
- Session management
- Data synchronization

## Next Steps
1. Document the frontend components hierarchy (Phase 3)
2. Map all state management flows
3. Create component dependency diagrams
4. Document all Firebase integration points
5. Create error handling documentation 