#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Running postinstall hook...');

try {
  const androidDir = path.join(process.cwd(), 'android');
  if (!fs.existsSync(androidDir)) {
    console.log('Android directory does not exist. Running prebuild...');
    execSync('npx expo prebuild --clean', { stdio: 'inherit' });
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

  console.log('Postinstall hook completed successfully.');
} catch (error) {
  console.error('Error in postinstall hook:', error);
  process.exit(1);
} 