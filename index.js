// Import Firebase initialization FIRST - before anything else
// This ensures Firebase is initialized synchronously before any component tries to use it
import './src/firebase/firebaseInit';

import { registerRootComponent } from 'expo';

// Remove the old Firebase imports that were causing issues
// import './src/firebase/firebaseApp';
// import './src/utils/firebaseCompatibility';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
