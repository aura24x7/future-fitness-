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
    
    // Add Firebase configurations
    if (!config.modResults.contents.includes('configurations.all')) {
      const allProjectsEndIndex = config.modResults.contents.lastIndexOf('}');
      if (allProjectsEndIndex !== -1) {
        const configBlock = `

    // Force consistent versions of Firebase dependencies
    configurations.all {
        resolutionStrategy {
            // Force a specific version of Firebase Common
            force "com.google.firebase:firebase-common:20.3.3"
            force "com.google.firebase:firebase-annotations:16.2.0"
        }
    }`;
        
        config.modResults.contents = 
          config.modResults.contents.substring(0, allProjectsEndIndex) +
          configBlock +
          config.modResults.contents.substring(allProjectsEndIndex);
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

    // Add Firebase dependencies if they don't exist
    if (!config.modResults.contents.includes('firebase-bom')) {
      const dependenciesMatch = config.modResults.contents.match(/dependencies\s*\{/);
      if (dependenciesMatch) {
        const firebase = `
    // Firebase BoM (managed by Expo Config Plugin)
    implementation platform('com.google.firebase:firebase-bom:${firebaseBomVersion}')
    
    // Declare Firebase dependencies without version numbers
    implementation 'com.google.firebase:firebase-analytics'
    implementation 'com.google.firebase:firebase-auth'
    implementation 'com.google.firebase:firebase-firestore'
    implementation 'com.google.firebase:firebase-messaging'
    implementation 'com.google.firebase:firebase-storage'
`;
        const index = dependenciesMatch.index + dependenciesMatch[0].length;
        config.modResults.contents = 
          config.modResults.contents.substring(0, index) +
          firebase +
          config.modResults.contents.substring(index);
      }
    }

    // Add the Google Services plugin application if it doesn't exist
    if (!config.modResults.contents.includes("apply plugin: 'com.google.gms.google-services'")) {
      config.modResults.contents += "\napply plugin: 'com.google.gms.google-services'";
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