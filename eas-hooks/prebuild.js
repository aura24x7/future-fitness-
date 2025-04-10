#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Running prebuild hook...');

try {
  // Run expo prebuild
  console.log('Running expo prebuild...');
  execSync('npx expo prebuild --clean', { stdio: 'inherit' });

  // Ensure gradlew has executable permission
  const androidDir = path.join(process.cwd(), 'android');
  const gradlewPath = path.join(androidDir, 'gradlew');
  
  if (fs.existsSync(gradlewPath)) {
    console.log('Making gradlew executable...');
    try {
      fs.chmodSync(gradlewPath, '755');
      console.log('Made gradlew executable.');
    } catch (error) {
      console.warn('Failed to make gradlew executable:', error);
    }
  } else {
    console.warn('Warning: gradlew does not exist at', gradlewPath);
  }

  console.log('Prebuild hook completed successfully.');
} catch (error) {
  console.error('Error in prebuild hook:', error);
  process.exit(1);
} 