import { useThemeTest } from '../utils/themeTestUtils';

// In your component:
const { verifyThemeConsistency } = useThemeTest();

// During development/testing:
if (__DEV__) {
  const { isValid, issues } = verifyThemeConsistency();
  if (!isValid) {
    console.warn('Theme consistency issues:', issues);
  }
} 