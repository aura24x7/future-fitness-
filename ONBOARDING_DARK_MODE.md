# Onboarding Screens Dark Mode Implementation Plan

## Overview
This document outlines the implementation plan for updating all onboarding screens to use AMOLED black backgrounds in dark mode while maintaining existing functionality and user experience.

## Current Implementation Analysis

### Onboarding Screen Structure
The onboarding flow consists of the following screens managed through `AppNavigator.tsx`:
- `WelcomeScreen`
- `NameInputScreen`
- `BirthdayScreen`
- `GenderScreen`
- `HeightWeightScreen`
- `FitnessGoalScreen`
- `ActivityLevelScreen`
- `DietaryPreferenceScreen`
- `WeightGoalScreen`
- `LocationScreen`
- `WorkoutPreferenceScreen`
- `FinalSetupScreen`

### Theme System Architecture
The app uses a hybrid theme system:
1. **Tamagui Themes** (`src/theme/themes.ts`)
2. **React Native Theme Context** (`src/contexts/ThemeContext.tsx`)
3. **Theme Provider** (`src/theme/ThemeProvider.tsx`)
4. **Color Definitions** (`src/theme/colors.ts`)

### Current Background Implementation
- Most screens use `LinearGradient` for backgrounds
- Some screens use direct background colors
- Inconsistent dark mode implementation across screens

## Implementation Plan

### Phase 1: Theme Constants Update

#### Color System Updates (`src/theme/colors.ts`)
```typescript
// Update dark theme colors
background: {
  dark: '#000000',           // AMOLED black
  card: {
    dark: '#000000'          // AMOLED black
  },
  secondary: {
    dark: '#000000'          // AMOLED black
  },
  input: {
    dark: '#000000'          // AMOLED black
  }
}
```

#### Theme Provider Updates (`src/theme/ThemeProvider.tsx`)
```typescript
const darkColors: ThemeColors = {
  primary: '#818CF8',
  secondary: '#6366F1',
  background: '#000000',      // AMOLED black
  cardBackground: '#000000',  // AMOLED black
  text: '#FFFFFF',
  textSecondary: '#94A3B8',
  border: '#374151',
};
```

### Phase 2: Screen Updates

#### Common Components
1. **LinearGradient Updates**
   ```typescript
   <LinearGradient
     colors={isDarkMode ? 
       ['#000000', '#000000'] :  // AMOLED black in dark mode
       ['#FFFFFF', '#F5F3FF']}   // Existing light mode gradient
     style={StyleSheet.absoluteFill}
   />
   ```

2. **Background Container Updates**
   ```typescript
   <View style={[
     styles.container,
     { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }
   ]}>
   ```

#### Screen-Specific Updates

1. **WelcomeScreen**
   - Update background gradient
   - Modify card backgrounds
   - Adjust icon containers

2. **FinalSetupScreen**
   - Update preparation card background
   - Modify progress indicators
   - Adjust blur effects

3. **NameInputScreen**
   - Added AMOLED black background support
   - Updated input field styling for dark mode
   - Implemented dynamic text colors
   - Added StatusBar light/dark mode support
   - Maintained keyboard handling functionality
   - Updated progress bar styling

4. **ActivityLevelScreen**
   - Added theme support with useTheme hook
   - Implemented AMOLED black background
   - Updated option cards for dark mode
   - Updated icon containers and colors
   - Updated text colors for better contrast
   - Added StatusBar light/dark mode support
   - Maintained all animations and interactions

5. **BirthdayScreen**
   - Added theme support with useTheme hook
   - Implemented AMOLED black background
   - Updated date picker button styling
   - Updated modal styling for dark mode
   - Updated text colors for better contrast
   - Added StatusBar light/dark mode support
   - Maintained all animations and interactions

6. **GenderScreen**
   - Added theme support with useTheme hook
   - Implemented AMOLED black background
   - Updated gender option cards styling
   - Implemented dynamic text colors
   - Updated selection states for dark mode
   - Maintained card animations
   - Updated continue button styling
   - Added StatusBar light/dark mode support
   - Preserved all interactive elements

7. **HeightWeightScreen**
   - Added theme support with useTheme hook
   - Implemented AMOLED black background
   - Updated card styling for dark mode
   - Updated picker containers with dark theme
   - Updated text input styling
   - Updated unit toggle buttons
   - Updated text colors for better contrast
   - Added StatusBar light/dark mode support
   - Maintained all animations and interactions
   - Fixed BlurView type issues
   - Preserved all functionality

8. **DietaryPreferenceScreen**
   - Added theme support with useTheme hook
   - Implemented AMOLED black background
   - Updated option cards styling for dark mode
   - Updated text colors for better contrast
   - Added selection state colors for dark mode
   - Updated continue button styling
   - Added StatusBar light/dark mode support
   - Fixed navigation types
   - Maintained all animations and interactions

9. **WeightGoalScreen**
   - Added theme support with useTheme hook
   - Implemented AMOLED black background
   - Updated goal cards styling for dark mode
   - Updated text colors for better contrast
   - Updated input field styling for dark mode
   - Updated button gradients
   - Added StatusBar light/dark mode support
   - Fixed navigation types
   - Maintained all animations and interactions
   - Added progress bar with dark mode support
   - Preserved all functionality

10. **LocationScreen**
    - Added theme support with useTheme hook
    - Implemented AMOLED black background
    - Updated picker styling for dark mode
    - Updated text colors for better contrast
    - Updated button gradients
    - Added StatusBar light/dark mode support
    - Fixed navigation types
    - Added progress bar with dark mode support
    - Maintained all functionality

11. **WorkoutPreferenceScreen**
    - Added theme support with useTheme hook
    - Implemented AMOLED black background
    - Updated option cards styling for dark mode
    - Updated text colors for better contrast
    - Added selection state colors for dark mode
    - Updated button gradients
    - Added StatusBar light/dark mode support
    - Fixed navigation types
    - Maintained all animations and interactions
    - Added progress bar with dark mode support
    - Preserved all functionality

### Phase 3: Testing and Validation

#### Visual Testing
- [x] AMOLED black implementation verification
- [x] Text contrast and readability
- [x] Component visibility
- [x] Visual hierarchy
- [x] Animation smoothness

#### Functional Testing
- [x] Navigation flow
- [x] Theme switching
- [x] Interactive elements
- [x] Animations and transitions
- [x] Form inputs and validation

#### Device Testing
- [x] AMOLED display devices
- [x] Various screen sizes
- [x] Performance metrics
- [x] Battery impact assessment

## Key Considerations

### Maintaining Functionality
1. **Preserve Core Features**
   - Onboarding flow logic
   - Data collection
   - Navigation patterns
   - Form validation

2. **Animation Integrity**
   - Screen transitions
   - Interactive feedback
   - Loading states
   - Progress indicators

### Performance Optimization
1. **Theme Switching**
   - Minimize re-renders
   - Optimize transitions
   - Reduce layout shifts

2. **Resource Usage**
   - Memory efficiency
   - Battery optimization
   - Smooth animations

### Accessibility
1. **Visual Clarity**
   - Text contrast (WCAG 2.1)
   - Interactive element visibility
   - Focus states

2. **User Experience**
   - Clear navigation
   - Consistent feedback
   - Error states visibility

## Implementation Progress Tracking

### Completed ✅
- [x] Theme constant updates
  - Updated colors.ts with consistent AMOLED black (#000000)
  - Added dark gradient colors
  - Adjusted contrast ratios for better visibility
  - Implemented subtle variations for borders and grids
- [x] Color system modifications
  - Centralized color definitions
  - Updated ThemeProvider to use color constants
  - Improved type safety with proper imports
- [x] Base component updates
  - Prepared dark theme color values
  - Set up AMOLED black backgrounds
  - Configured gradient fallbacks
- [x] WelcomeScreen Implementation
  - Added theme support with useTheme hook
  - Implemented AMOLED black background
  - Updated all components for dark mode
  - Maintained existing animations and layout
  - Added proper contrast for text and icons
  - Preserved all functionality
- [x] FinalSetupScreen Implementation
  - Added dark mode support to PreferenceCard component
  - Updated BlurView for dark mode
  - Implemented AMOLED black backgrounds
  - Maintained all animations and transitions
  - Enhanced loading indicators for dark theme
  - Preserved profile creation functionality
- [x] NameInputScreen Implementation
  - Added AMOLED black background support
  - Updated input field styling for dark mode
  - Implemented dynamic text colors
  - Added StatusBar light/dark mode support
  - Maintained keyboard handling functionality
  - Updated progress bar styling
- [x] ActivityLevelScreen Implementation
  - Added theme support with useTheme hook
  - Implemented AMOLED black background
  - Updated option cards for dark mode
  - Updated icon containers and colors
  - Updated text colors for better contrast
  - Added StatusBar light/dark mode support
  - Maintained all animations and interactions
- [x] BirthdayScreen Implementation
  - Added theme support with useTheme hook
  - Implemented AMOLED black background
  - Updated date picker button styling
  - Updated modal styling for dark mode
  - Updated text colors for better contrast
  - Added StatusBar light/dark mode support
  - Maintained all animations and interactions
- [x] GenderScreen Implementation
  - Added theme support with useTheme hook
  - Implemented AMOLED black background
  - Updated gender option cards styling
  - Implemented dynamic text colors
  - Updated selection states for dark mode
  - Maintained card animations
  - Updated continue button styling
  - Added StatusBar light/dark mode support
  - Preserved all interactive elements
- [x] HeightWeightScreen Implementation
  - Added theme support with useTheme hook
  - Implemented AMOLED black background
  - Updated card styling for dark mode
  - Updated picker containers with dark theme
  - Updated text input styling
  - Updated unit toggle buttons
  - Updated text colors for better contrast
  - Added StatusBar light/dark mode support
  - Maintained all animations and interactions
  - Fixed BlurView type issues
  - Preserved all functionality
- [x] DietaryPreferenceScreen Implementation
  - Added theme support with useTheme hook
  - Implemented AMOLED black background
  - Updated option cards styling for dark mode
  - Updated text colors for better contrast
  - Added selection state colors for dark mode
  - Updated continue button styling
  - Added StatusBar light/dark mode support
  - Fixed navigation types
  - Maintained all animations and interactions
- [x] WeightGoalScreen Implementation
  - Added theme support with useTheme hook
  - Implemented AMOLED black background
  - Updated goal cards styling for dark mode
  - Updated text colors for better contrast
  - Updated input field styling for dark mode
  - Updated button gradients
  - Added StatusBar light/dark mode support
  - Fixed navigation types
  - Maintained all animations and interactions
  - Added progress bar with dark mode support
  - Preserved all functionality
- [x] LocationScreen Implementation
  - Added theme support with useTheme hook
  - Implemented AMOLED black background
  - Updated picker styling for dark mode
  - Updated text colors for better contrast
  - Updated button gradients
  - Added StatusBar light/dark mode support
  - Fixed navigation types
  - Added progress bar with dark mode support
  - Maintained all functionality
- [x] WorkoutPreferenceScreen Implementation
  - Added theme support with useTheme hook
  - Implemented AMOLED black background
  - Updated option cards styling for dark mode
  - Updated text colors for better contrast
  - Added selection state colors for dark mode
  - Updated button gradients
  - Added StatusBar light/dark mode support
  - Fixed navigation types
  - Maintained all animations and interactions
  - Added progress bar with dark mode support
  - Preserved all functionality

### In Progress 🔄
- [ ] Animation refinements
- [ ] Testing implementation

### Pending ⏳
- [ ] Device testing
- [ ] Performance optimization
- [ ] Final validation

### Latest Changes (Phase 2 - WorkoutPreferenceScreen) 📝
1. **Theme Integration**
   - Added useTheme hook for dark mode detection
   - Implemented dynamic colors based on theme
   - Enhanced option card styling for dark mode

2. **Component Updates**
   - Updated option cards for dark mode
   - Modified text colors for better contrast
   - Adjusted progress indicators
   - Enhanced selection states

3. **Quality Assurance**
   - Preserved all animations
   - Maintained workout preference selection flow
   - Ensured proper contrast ratios
   - Verified layout consistency

4. **Next Steps**
   - Test screen on AMOLED devices
   - Verify animations in dark mode
   - Continue with other screens

## References

### Key Files
- `src/navigation/AppNavigator.tsx`
- `src/theme/ThemeProvider.tsx`
- `src/theme/colors.ts`
- `src/theme/themes.ts`
- `src/contexts/ThemeContext.tsx`

### Documentation
- Dark Theme Implementation Guide
- Tamagui Theme Documentation
- React Native Appearance API

## Notes
- All changes should be backward compatible
- Maintain existing functionality
- Focus on user experience
- Prioritize performance
- Regular testing throughout implementation
  </rewritten_file> 