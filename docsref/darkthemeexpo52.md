Color themes

Learn how to support light and dark modes in your app.

It's common for apps to support light and dark color schemes. Here is an example of how supporting both modes looks in an Expo project:

Configuration
For Android and iOS projects, additional configuration is required to support switching between light and dark mode. For web, no additional configuration is required.
To configure supported appearance styles, you can use the userInterfaceStyle property in your project's app config. By default, this property is set to automatic when you create a new project with the default template.

Here is an example configuration:

app.json

Copy


{
  "expo": {
    "userInterfaceStyle": "automatic"
  }
}
You can also configure userInterfaceStyle property for a specific platforms by setting either android.userInterfaceStyle or ios.userInterfaceStyle to the preferred value.

The app will default to the light style if this property is absent.
When you are creating a development build, you have to install expo-system-ui to support the appearance styles for Android. Otherwise, the userInterfaceStyle property is ignored.

Terminal

Copy

npx expo install expo-system-ui
If the project is misconfigured and doesn't have expo-system-ui installed, the following warning will be shown in the terminal:

Terminal

Copy

» android: userInterfaceStyle: Install expo-system-ui in your project to enable this feature.
You can also use the following command to check if the project is misconfigured:

Terminal

Copy

npx expo config --type introspect
Supported appearance styles
The userInterfaceStyle property supports the following values:

automatic: Follow system appearance settings and notify about any change the user makes.
light: Restrict the app to support light theme only.
dark: Restrict the app to support dark theme only.
Detect the color scheme
To detect the color scheme in your project, use Appearance or useColorScheme from react-native:

app/index.tsx

Copy


import { Appearance, useColorScheme } from 'react-native';
Then, you can use useColorScheme() hook as shown below:

app/index.tsx

Copy


function MyComponent() {
  let colorScheme = useColorScheme();

  if (colorScheme === 'dark') {
    // render some dark thing
  } else {
    // render some light thing
  }
}
In some cases, you will find it helpful to get the current color scheme imperatively with Appearance.getColorScheme() or listen to changes with Appearance.addChangeListener().

Additional information
Minimal example
useColorScheme example

Copy


Open in Snack


import { Text, StyleSheet, View, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const colorScheme = useColorScheme();

  const themeTextStyle = colorScheme === 'light' ? styles.lightThemeText : styles.darkThemeText;
  const themeContainerStyle =
    colorScheme === 'light' ? styles.lightContainer : styles.darkContainer;

  return (
    <View style={[styles.container, themeContainerStyle]}>
      <Text style={[styles.text, themeTextStyle]}>Color scheme: {colorScheme}</Text>
      <StatusBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
  },
  lightContainer: {
    backgroundColor: '#d0d0c0',
  },
  darkContainer: {
    backgroundColor: '#242c40',
  },
  lightThemeText: {
    color: '#242c40',
  },
  darkThemeText: {
    color: '#d0d0c0',
  },
});
Tips
While you are developing your project, you can change your simulator's or device's appearance by using the following shortcuts:

If using an Android Emulator, you can run adb shell "cmd uimode night yes" to enable dark mode, and adb shell "cmd uimode night no" to disable dark mode.
If using a physical Android device or an Android Emulator, you can toggle the system dark mode setting in the device's settings.
If working with an iOS emulator locally, you can use the Cmd ⌘ + Shift + a shortcut to toggle between light and dark modes.