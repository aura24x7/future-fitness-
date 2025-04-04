# Code Structure of future-fitness- Project

This document outlines the structure of the `future-fitness-` project codebase.

## Top-Level Directories

*   `.cursorrules`, `.env.development`, `.gitignore`, `app.json`, `babel.config.js`, `eas.json`, `google-services.json`, `index.js`, `LICENSE`, `metro.config.js`, `package-lock.json`, `package.json`, `README.md`, `tamagui.config.ts`, `tsconfig.json`, `yarn.lock`: Configuration files and project-level settings.
*   `android/`: Android-specific native code.
*   `assets/`, `assets_backup/`: Static assets (images, fonts, animations).
*   `docs/`, `docsref/`: Project documentation.
*   `scripts/`: Utility scripts.
*   `src/`: Main source code directory.
*   `tatus`, `windsurfrule.md`, `windsurfrules.md`, `assistant_snippet_gdm4EhDGyU.txt`, `calorie-tracking-fix.md`, `cleanup-checklist.md`, `dashboard-improvements.md`, `FIREBASE_IMPLEMENTATION_PLAN.md`, `FRONTEND_BACKEND_SEPARATION_PLAN.md`, `ONBOARDING_DARK_MODE.md`, `ONBOARDING_INVESTIGATION.md`, `simple_food_log.md`, `SPLASH_SCREEN_IMPLEMENTATION_PLAN.md`: Miscellaneous project files and notes.

## `src/` Directory Structure

The `src/` directory contains the main application logic.

*   `src/App.tsx`: Main entry point of the application.
*   `src/tamagui.config.ts`: Tamagui UI library configuration.
*   `src/__tests__/`: Unit tests.
*   `src/assets/`: Assets used within the `src` directory.
*   `src/components/`: Reusable UI components, organized by feature:
    *   `src/components/activity/`: Activity tracking components.
    *   `src/components/analytics/`: Analytics integration components.
    *   `src/components/calorie/`: Calorie tracking components.
    *   `src/components/charts/`: Chart components.
    *   `src/components/common/`: General-purpose components.
    *   `src/components/food/`: Food logging components.
    *   `src/components/GymBuddyAlert/`: Gym Buddy alert feature components.
    *   `src/components/monitoring/`: Monitoring components.
    *   `src/components/ProfileGroups/`: Profile groups components.
    *   `src/components/sharing/`: Sharing feature components.
    *   `src/components/sync/`: Data synchronization components.
    *   `src/components/themed/`: Themed components.
    *   `src/components/weight/`: Weight tracking components.
    *   Individual components (e.g., `AIWorkoutPlanComponent.tsx`, `BottomTaskbar.tsx`).
*   `src/config/`: Configuration files:
    *   `src/config/api.config.ts`: API endpoint configuration.
    *   `src/config/firebase.ts`: Firebase configuration.
    *   `src/config/gemini.ts`: Gemini API configuration.
    *   `src/config/keys.config.ts`: API keys and sensitive configuration.
    *   `src/config/ai/`: AI feature configuration.
*   `src/constants/`: Application-wide constants:
    *   `src/constants/storage.ts`: Local storage keys.
    *   `src/constants/theme.ts`: Theme variables.
*   `src/context/`, `src/contexts/`: React Context providers for state management (e.g., `AuthContext`, `MealContext`, `ThemeContext`).
*   `src/data/`: Data-related logic or mock data.
*   `src/dev-utils/`: Development utilities.
*   `src/hooks/`: Custom React Hooks.
*   `src/navigation/`: Navigation setup.
*   `src/reducers/`: State management reducers.
*   `src/screens/`: Application screens or views.
*   `src/services/`: Business logic and API interaction services.
*   `src/store/`: State management store configuration.
*   `src/tests/`: Integration tests.
*   `src/theme/`: Theme definitions and configurations.
*   `src/types/`: TypeScript type definitions.
*   `src/utils/`: Utility functions.
