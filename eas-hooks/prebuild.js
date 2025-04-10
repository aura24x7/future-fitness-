#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Running prebuild hook...');

try {
  // Run expo prebuild
  console.log('Running expo prebuild...');
  execSync('npx expo prebuild --clean', { stdio: 'inherit' });

  // Ensure android directory exists
  const androidDir = path.join(process.cwd(), 'android');
  if (!fs.existsSync(androidDir)) {
    console.error('Android directory does not exist after prebuild. Something went wrong.');
    process.exit(1);
  }

  // Ensure gradlew has executable permission
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

  // Log the contents of the android directory
  console.log('Contents of android directory:');
  execSync('ls -la android', { stdio: 'inherit' });

  console.log('Prebuild hook completed successfully.');
} catch (error) {
  console.error('Error in prebuild hook:', error);
  process.exit(1);
} 