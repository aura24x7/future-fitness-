Create a development build

Learn how to create development builds for a project.

If you are looking to create a development build locally, rather than remotely on EAS, you can create local builds with npx expo run:[android|ios] or with eas build --local.

Development builds can be created with EAS Build or locally on your computer if you have Android Studio and Xcode installed.

In this guide, you'll find information on creating a development build with EAS and installing it on an emulator/simulator or a physical device to continue developing your app.

Prerequisites
You will need a React Native Android and/or iOS project that is configured to build with EAS Build. If you haven't configured your project yet, see Create your first build.

Instructions
The following instructions cover both Android and iOS and physical devices and emulators. You can use whichever instructions are relevant to your project. If you would prefer a video over text, skip to Video walkthroughs.

1

Install expo-dev-client
Terminal

Copy

npx expo install expo-dev-client
2

Verify your eas.json configuration
The first time you run the eas build command, it creates an eas.json file at the root of your project directory. The eas.json includes three default build profiles — development, preview, and production. If you have removed the development profile since you first initialized eas.json, you should add it back now. A minimal configuration is shown below:

eas.json

Copy


{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
The development profile sets the following options:

developmentClient to true to create a Debug build. It also generates a build artifact you can install on an Android device or emulator, or an iOS device with internal distribution.
Building for an iOS device requires an Apple Developer Program membership. If you don't have one, you can only build for an iOS Simulator. See the next step for more information.
iOS builds where developmentClient is set to true on the build profile should always be distributed as internal. If you are distributing for TestFlight, you have to set the distribution to store.

3

Create a build for emulator/simulator
Follow the steps below to create and install the development build on an Android Emulator or an iOS Simulator.

This is only required if you want to develop a project on an emulator/simulator. Otherwise, skip these steps if you are using a device.

Each platform has specific instructions you'll have to follow:


For Android Emulator


For iOS Simulator

To create and install the development build on an Android Emulator, you will need a .apk. To create it, run the following command:

Terminal

Copy

eas build --profile development --platform android
After the build is complete, the CLI will prompt you to automatically download and install it on the Android Emulator. When prompted, press Y to directly install it on the emulator.

See Build APKs for Android Emulators and devices for more information.

4

Create a build for the device
Follow the steps below to create and install the development build on an Android or an iOS device. Each platform has specific instructions you'll have to follow:


For Android device


For iOS device

If you have created a development build for Android Emulator, you do not need to create it separately for the device. You can skip this step since the same .apk will work in both scenarios.

To create and install the development build on an Android device, you will need a .apk. To create it, run the following command:

Terminal

Copy

eas build --profile development --platform android
After the build is complete, copy the URL to the .apk from the build details page or the link provided when eas build has finished. Then, send that URL to your device and open it on your device to download and install the .apk.