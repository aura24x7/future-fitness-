const { withAppBuildGradle, withProjectBuildGradle, createRunOncePlugin } = require('@expo/config-plugins');

/**
 * Plugin to fix Firebase dependency versioning issues
 */
const withFirebaseDependencyFix = (config) => {
  // First modify the project level build.gradle to ensure proper repositories
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.contents.includes('mavenCentral()')) {
      // Add the Google repo if it doesn't exist
      if (!config.modResults.contents.includes('google()')) {
        const mavenCentralMatch = config.modResults.contents.match(/mavenCentral\(\)/);
        if (mavenCentralMatch) {
          const index = mavenCentralMatch.index + mavenCentralMatch[0].length;
          config.modResults.contents = 
            config.modResults.contents.substring(0, index) + 
            '\n        google()' + 
            config.modResults.contents.substring(index);
        }
      }
    }
    return config;
  });

  // Then modify the app level build.gradle to enforce Firebase BoM
  config = withAppBuildGradle(config, (config) => {
    const firebaseBomVersion = '33.9.0';

    // Add the repositories section if it doesn't exist
    if (!config.modResults.contents.includes('repositories {')) {
      const androidBlock = config.modResults.contents.indexOf('android {');
      if (androidBlock !== -1) {
        const repoBlock = `
// Add Google Maven repository
repositories {
    google()
    mavenCentral()
}

`;
        config.modResults.contents = 
          config.modResults.contents.substring(0, androidBlock) +
          repoBlock +
          config.modResults.contents.substring(androidBlock);
      }
    }

    // Find and modify the dependencies block
    if (config.modResults.contents.includes('dependencies {')) {
      // Define our Firebase BoM implementation
      const bomImplementation = `
    // Firebase BoM (managed by Expo Config Plugin)
    implementation platform('com.google.firebase:firebase-bom:${firebaseBomVersion}')
    
    // Declare Firebase dependencies without version numbers
    implementation 'com.google.firebase:firebase-analytics'
      `;

      // Add it to the dependencies block
      const dependenciesMatch = config.modResults.contents.match(/dependencies\s*\{/);
      if (dependenciesMatch) {
        const index = dependenciesMatch.index + dependenciesMatch[0].length;
        config.modResults.contents = 
          config.modResults.contents.substring(0, index) +
          bomImplementation +
          config.modResults.contents.substring(index);
      }
    }

    return config;
  });

  return config;
};

module.exports = createRunOncePlugin(
  withFirebaseDependencyFix,
  'firebase-dependency-fix',
  '1.0.0'
); 