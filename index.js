import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';
import App from './App';

// Ignore Victory require cycle warnings
LogBox.ignoreLogs(['Require cycle: node_modules/victory']);

// Register the app as the root component
registerRootComponent(App);
