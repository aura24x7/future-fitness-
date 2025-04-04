Running 'gradlew :app:assembleDebug' in /home/expo/workingdir/build/android
Welcome to Gradle 8.10.2!
Here are the highlights of this release:
- Support for Java 23
 - Faster configuration cache
 - Better configuration cache reports
For more details see https://docs.gradle.org/8.10.2/release-notes.html
To honour the JVM settings for this build a single-use Daemon process will be forked. For more on this, please refer to https://docs.gradle.org/8.10.2/userguide/gradle_daemon.html#sec:disabling_the_daemon in the Gradle documentation.
Daemon will be stopped at the end of the build
> Task :gradle-plugin:shared:checkKotlinGradlePluginConfigurationErrors
> Task :gradle-plugin:settings-plugin:checkKotlinGradlePluginConfigurationErrors
> Task :gradle-plugin:settings-plugin:pluginDescriptors
> Task :gradle-plugin:settings-plugin:processResources
> Task :gradle-plugin:shared:processResources NO-SOURCE
> Task :gradle-plugin:shared:compileKotlin
> Task :gradle-plugin:shared:compileJava NO-SOURCE
> Task :gradle-plugin:shared:classes UP-TO-DATE
> Task :gradle-plugin:shared:jar
> Task :gradle-plugin:settings-plugin:compileKotlin
> Task :gradle-plugin:settings-plugin:compileJava
NO-SOURCE
> Task :gradle-plugin:settings-plugin:classes
> Task :gradle-plugin:settings-plugin:jar
> Task :gradle-plugin:react-native-gradle-plugin:checkKotlinGradlePluginConfigurationErrors
> Task :expo-dev-launcher-gradle-plugin:checkKotlinGradlePluginConfigurationErrors
> Task :expo-dev-launcher-gradle-plugin:pluginDescriptors
> Task :expo-dev-launcher-gradle-plugin:processResources
> Task :gradle-plugin:react-native-gradle-plugin:pluginDescriptors
> Task :gradle-plugin:react-native-gradle-plugin:processResources
> Task :gradle-plugin:react-native-gradle-plugin:compileKotlin
> Task :gradle-plugin:react-native-gradle-plugin:compileJava NO-SOURCE
> Task :gradle-plugin:react-native-gradle-plugin:classes
> Task :gradle-plugin:react-native-gradle-plugin:jar
> Task :expo-dev-launcher-gradle-plugin:compileKotlin
> Task :expo-dev-launcher-gradle-plugin:compileJava NO-SOURCE
> Task :expo-dev-launcher-gradle-plugin:classes
> Task :expo-dev-launcher-gradle-plugin:jar
> Configure project :app
ℹ️  [33mApplying gradle plugin[0m '[32mexpo-dev-launcher-gradle-plugin[0m' (expo-dev-launcher@5.0.30)
> Configure project :expo
Using expo modules
  - [32mexpo-application[0m (6.0.2)
  - [32mexpo-asset[0m (11.0.4)
  - [32mexpo-background-fetch[0m (13.0.5)
  - [32mexpo-blur[0m (14.0.3)
  - [32mexpo-camera[0m (16.0.18)
  - [32mexpo-constants[0m (17.0.8)
  - [32mexpo-dev-client[0m (5.0.14)
  - [32mexpo-dev-launcher[0m (5.0.30)
  - [32mexpo-dev-menu[0m (6.0.21)
  - [32mexpo-file-system[0m (18.0.11)
  - [32mexpo-font[0m (13.0.4)
  - [32mexpo-json-utils[0m (0.14.0)
  - [32mexpo-keep-awake[0m (14.0.3)
  - [32mexpo-linear-gradient[0m (14.0.2)
  - [32mexpo-linking[0m (7.0.5)
- [32mexpo-manifests[0m (0.15.7)
  - [32mexpo-media-library[0m (17.0.6)
  - [32mexpo-modules-core[0m (2.2.3)
- [32mexpo-notifications[0m (0.29.14)
- [32mexpo-sharing[0m (13.0.1)
  - [32mexpo-splash-screen[0m (0.29.22)
- [32mexpo-system-ui[0m (4.0.8)
  - [32mexpo-task-manager[0m (12.0.5)
  - [32munimodules-app-loader[0m (5.0.1)
> Configure project :notifee_react-native
:notifee_react-native @notifee/react-native found at /home/expo/workingdir/build/node_modules/@notifee/react-native
:notifee_react-native package.json found at /home/expo/workingdir/build/node_modules/@notifee/react-native/package.json
:notifee_react-native:version set from package.json: 9.1.8 (9,1,8 - 9001008)
:notifee_react-native:android.compileSdk using custom value: 35
:notifee_react-native:android.targetSdk using custom value: 34
:notifee_react-native:android.minSdk using custom value: 24
:notifee_react-native:reactNativeAndroidDir /home/expo/workingdir/build/node_modules/react-native/android
> Configure project :react-native-firebase_app
:react-native-firebase_app package.json found at /home/expo/workingdir/build/node_modules/@react-native-firebase/app/package.json
:react-native-firebase_app:firebase.bom using default value: 32.6.0
:react-native-firebase_app:play.play-services-auth using default value: 20.7.0
:react-native-firebase_app package.json found at /home/expo/workingdir/build/node_modules/@react-native-firebase/app/package.json
:react-native-firebase_app:version set from package.json: 18.7.2 (18,7,2 - 18007002)
:react-native-firebase_app:android.compileSdk using custom value: 35
:react-native-firebase_app:android.targetSdk using custom value: 34
:react-native-firebase_app:android.minSdk using custom value: 24
:react-native-firebase_app:reactNativeAndroidDir /home/expo/workingdir/build/node_modules/react-native/android
> Configure project :react-native-firebase_auth
:react-native-firebase_auth package.json found at /home/expo/workingdir/build/node_modules/@react-native-firebase/auth/package.json
:react-native-firebase_app package.json found at /home/expo/workingdir/build/node_modules/@react-native-firebase/app/package.json
:react-native-firebase_auth:firebase.bom using default value: 32.6.0
:react-native-firebase_auth package.json found at /home/expo/workingdir/build/node_modules/@react-native-firebase/auth/package.json
:react-native-firebase_auth:version set from package.json: 18.7.2 (18,7,2 - 18007002)
:react-native-firebase_auth:android.compileSdk using custom value: 35
:react-native-firebase_auth:android.targetSdk using custom value: 34
:react-native-firebase_auth:android.minSdk using custom value: 24
:react-native-firebase_auth:reactNativeAndroidDir /home/expo/workingdir/build/node_modules/react-native/android
> Configure project :react-native-firebase_firestore
:react-native-firebase_firestore package.json found at /home/expo/workingdir/build/node_modules/@react-native-firebase/firestore/package.json
:react-native-firebase_app package.json found at /home/expo/workingdir/build/node_modules/@react-native-firebase/app/package.json
:react-native-firebase_firestore:firebase.bom using default value: 32.6.0
:react-native-firebase_firestore package.json found at /home/expo/workingdir/build/node_modules/@react-native-firebase/firestore/package.json
:react-native-firebase_firestore:version set from package.json: 18.7.2 (18,7,2 - 18007002)
:react-native-firebase_firestore:android.compileSdk using custom value: 35
:react-native-firebase_firestore:android.targetSdk using custom value: 34
:react-native-firebase_firestore:android.minSdk using custom value: 24
:react-native-firebase_firestore:reactNativeAndroidDir /home/expo/workingdir/build/node_modules/react-native/android
> Configure project :react-native-firebase_messaging
:react-native-firebase_messaging package.json found at /home/expo/workingdir/build/node_modules/@react-native-firebase/messaging/package.json
:react-native-firebase_app package.json found at /home/expo/workingdir/build/node_modules/@react-native-firebase/app/package.json
:react-native-firebase_messaging:firebase.bom using default value: 32.6.0
:react-native-firebase_messaging package.json found at /home/expo/workingdir/build/node_modules/@react-native-firebase/messaging/package.json
:react-native-firebase_messaging:version set from package.json: 18.7.2 (18,7,2 - 18007002)
:react-native-firebase_messaging:android.compileSdk using custom value: 35
:react-native-firebase_messaging:android.targetSdk using custom value: 34
:react-native-firebase_messaging:android.minSdk using custom value: 24
:react-native-firebase_messaging:reactNativeAndroidDir /home/expo/workingdir/build/node_modules/react-native/android
> Configure project :react-native-firebase_storage
:react-native-firebase_storage package.json found at /home/expo/workingdir/build/node_modules/@react-native-firebase/storage/package.json
:react-native-firebase_app package.json found at /home/expo/workingdir/build/node_modules/@react-native-firebase/app/package.json
:react-native-firebase_storage:firebase.bom using default value: 32.6.0
:react-native-firebase_storage package.json found at /home/expo/workingdir/build/node_modules/@react-native-firebase/storage/package.json
:react-native-firebase_storage:version set from package.json: 18.7.2 (18,7,2 - 18007002)
:react-native-firebase_storage:android.compileSdk using custom value: 35
:react-native-firebase_storage:android.targetSdk using custom value: 34
:react-native-firebase_storage:android.minSdk using custom value: 24
:react-native-firebase_storage:reactNativeAndroidDir /home/expo/workingdir/build/node_modules/react-native/android
> Configure project :react-native-reanimated
Android gradle plugin: 8.6.0
Gradle: 8.10.2
> Configure project :react-native-vision-camera
[VisionCamera] Thank you for using VisionCamera ❤️
[VisionCamera] If you enjoy using VisionCamera, please consider sponsoring this project: https://github.com/sponsors/mrousavy
[VisionCamera] node_modules found at /home/expo/workingdir/build/node_modules
[VisionCamera] VisionCamera_enableFrameProcessors is set to true!
[VisionCamera] react-native-worklets-core not found, Frame Processors are disabled!
[VisionCamera] VisionCamera_enableCodeScanner is set to false!
> Configure project :shopify_react-native-skia
react-native-skia: node_modules/ found at: /home/expo/workingdir/build/node_modules
react-native-skia: RN Version: 76 / 0.76.7
react-native-skia: isSourceBuild: false
react-native-skia: PrebuiltDir: /home/expo/workingdir/build/node_modules/@shopify/react-native-skia/android/build/react-native-0*/jni
react-native-skia: buildType: debug
react-native-skia: buildDir: /home/expo/workingdir/build/node_modules/@shopify/react-native-skia/android/build
react-native-skia: node_modules: /home/expo/workingdir/build/node_modules
react-native-skia: Enable Prefab: true
react-native-skia: aar state post 70, do nothing
Errors during XML parse:
Additionally, the fallback loader failed to parse the XML.
Checking the license for package Android SDK Platform 33 in /home/expo/Android/Sdk/licenses
License for package Android SDK Platform 33 accepted.
Preparing "Install Android SDK Platform 33 (revision 3)".
"Install Android SDK Platform 33 (revision 3)" ready.
Installing Android SDK Platform 33 in /home/expo/Android/Sdk/platforms/android-33
"Install Android SDK Platform 33 (revision 3)" complete.
"Install Android SDK Platform 33 (revision 3)" finished.
> Task :expo-asset:preBuild UP-TO-DATE
> Task :expo-application:preBuild UP-TO-DATE
> Task :expo-asset:preDebugBuild UP-TO-DATE
> Task :expo-application:preDebugBuild UP-TO-DATE
> Task :expo-application:writeDebugAarMetadata
> Task :expo-background-fetch:preBuild UP-TO-DATE
> Task :expo-asset:writeDebugAarMetadata
> Task :expo-blur:preBuild UP-TO-DATE
> Task :expo-blur:preDebugBuild UP-TO-DATE
> Task :expo-background-fetch:preDebugBuild UP-TO-DATE
> Task :expo-blur:writeDebugAarMetadata
> Task :expo-camera:preBuild UP-TO-DATE
> Task :expo-camera:preDebugBuild UP-TO-DATE
> Task :expo-background-fetch:writeDebugAarMetadata
> Task :expo-camera:writeDebugAarMetadata
> Task :expo-dev-client:preBuild UP-TO-DATE
> Task :expo-dev-client:preDebugBuild UP-TO-DATE
> Task :expo-dev-client:writeDebugAarMetadata
> Task :expo-dev-launcher:preBuild
UP-TO-DATE
> Task :expo-dev-launcher:preDebugBuild UP-TO-DATE
> Task :expo-dev-launcher:writeDebugAarMetadata
> Task :expo-dev-menu:preBuild UP-TO-DATE
> Task :expo-dev-menu:preDebugBuild UP-TO-DATE
> Task :expo-dev-menu:writeDebugAarMetadata
> Task :expo-dev-menu-interface:preBuild UP-TO-DATE
> Task :expo-dev-menu-interface:preDebugBuild UP-TO-DATE
> Task :expo-dev-menu-interface:writeDebugAarMetadata
> Task :expo-file-system:preBuild UP-TO-DATE
> Task :expo-file-system:preDebugBuild UP-TO-DATE
> Task :expo-file-system:writeDebugAarMetadata
> Task :expo-font:preBuild UP-TO-DATE
> Task :expo-font:preDebugBuild UP-TO-DATE
> Task :expo-font:writeDebugAarMetadata
> Task :expo-json-utils:preBuild UP-TO-DATE
> Task :expo-json-utils:preDebugBuild UP-TO-DATE
> Task :expo-json-utils:writeDebugAarMetadata
> Task :expo-keep-awake:preBuild UP-TO-DATE
> Task :expo-keep-awake:preDebugBuild UP-TO-DATE
> Task :expo-keep-awake:writeDebugAarMetadata
> Task :expo-linear-gradient:preBuild UP-TO-DATE
> Task :expo-linear-gradient:preDebugBuild UP-TO-DATE
> Task :expo-linear-gradient:writeDebugAarMetadata
> Task :expo-linking:preBuild UP-TO-DATE
> Task :expo-linking:preDebugBuild UP-TO-DATE
> Task :expo-linking:writeDebugAarMetadata
> Task :expo-manifests:preBuild UP-TO-DATE
> Task :expo-manifests:preDebugBuild UP-TO-DATE
> Task :expo-manifests:writeDebugAarMetadata
> Task :expo-media-library:preBuild UP-TO-DATE
> Task :expo-media-library:preDebugBuild UP-TO-DATE
> Task :expo-media-library:writeDebugAarMetadata
> Task :expo-modules-core:preBuild UP-TO-DATE
> Task :expo-modules-core:preDebugBuild UP-TO-DATE
> Task :expo-modules-core:writeDebugAarMetadata
> Task :expo-notifications:preBuild UP-TO-DATE
> Task :expo-notifications:preDebugBuild UP-TO-DATE
> Task :expo-notifications:writeDebugAarMetadata
> Task :expo-sharing:preBuild UP-TO-DATE
> Task :expo-sharing:preDebugBuild UP-TO-DATE
> Task :expo-sharing:writeDebugAarMetadata
> Task :expo-splash-screen:preBuild UP-TO-DATE
> Task :expo-splash-screen:preDebugBuild UP-TO-DATE
> Task :expo-splash-screen:writeDebugAarMetadata
> Task :expo-system-ui:preBuild UP-TO-DATE
> Task :expo-system-ui:preDebugBuild UP-TO-DATE
> Task :expo-system-ui:writeDebugAarMetadata
> Task :expo-task-manager:preBuild UP-TO-DATE
> Task :expo-task-manager:preDebugBuild UP-TO-DATE
> Task :expo-task-manager:writeDebugAarMetadata
> Task :expo-updates-interface:preBuild UP-TO-DATE
> Task :expo-updates-interface:preDebugBuild UP-TO-DATE
> Task :expo-updates-interface:writeDebugAarMetadata
> Task :lottie-react-native:preBuild UP-TO-DATE
> Task :lottie-react-native:preDebugBuild UP-TO-DATE
> Task :lottie-react-native:writeDebugAarMetadata
> Task :notifee_react-native:preBuild UP-TO-DATE
> Task :notifee_react-native:preDebugBuild UP-TO-DATE
> Task :notifee_react-native:writeDebugAarMetadata
> Task :react-native-async-storage_async-storage:preBuild UP-TO-DATE
> Task :react-native-async-storage_async-storage:preDebugBuild UP-TO-DATE
> Task :react-native-async-storage_async-storage:writeDebugAarMetadata
> Task :react-native-community_datetimepicker:preBuild UP-TO-DATE
> Task :react-native-community_datetimepicker:preDebugBuild UP-TO-DATE
> Task :react-native-community_datetimepicker:writeDebugAarMetadata
> Task :react-native-community_netinfo:preBuild UP-TO-DATE
> Task :react-native-community_netinfo:preDebugBuild UP-TO-DATE
> Task :react-native-community_netinfo:writeDebugAarMetadata
> Task :react-native-community_slider:preBuild UP-TO-DATE
> Task :react-native-community_slider:preDebugBuild UP-TO-DATE
> Task :react-native-community_slider:writeDebugAarMetadata
> Task :react-native-firebase_app:preBuild UP-TO-DATE
> Task :react-native-firebase_app:preDebugBuild UP-TO-DATE
> Task :react-native-firebase_app:writeDebugAarMetadata
> Task :react-native-firebase_auth:preBuild UP-TO-DATE
> Task :react-native-firebase_auth:preDebugBuild UP-TO-DATE
> Task :react-native-firebase_auth:writeDebugAarMetadata
> Task :react-native-firebase_firestore:preBuild UP-TO-DATE
> Task :react-native-firebase_firestore:preDebugBuild UP-TO-DATE
> Task :react-native-firebase_firestore:writeDebugAarMetadata
> Task :react-native-firebase_messaging:preBuild UP-TO-DATE
> Task :react-native-firebase_messaging:preDebugBuild UP-TO-DATE
> Task :react-native-firebase_messaging:writeDebugAarMetadata
> Task :react-native-firebase_storage:preBuild UP-TO-DATE
> Task :react-native-firebase_storage:preDebugBuild UP-TO-DATE
> Task :expo-constants:createExpoConfig
> Task :expo-constants:preBuild
> Task :expo-constants:preDebugBuild
> Task :react-native-firebase_storage:writeDebugAarMetadata
> Task :react-native-gesture-handler:preBuild UP-TO-DATE
The NODE_ENV environment variable is required but was not specified. Ensure the project is bundled with Expo CLI or NODE_ENV is set.
Proceeding without mode-specific .env
> Task :react-native-gesture-handler:preDebugBuild UP-TO-DATE
> Task :expo-constants:writeDebugAarMetadata
> Task :react-native-picker_picker:preBuild UP-TO-DATE
> Task :react-native-picker_picker:preDebugBuild UP-TO-DATE
> Task :react-native-gesture-handler:writeDebugAarMetadata
> Task :react-native-reanimated:assertLatestReactNativeWithNewArchitectureTask SKIPPED
> Task :react-native-reanimated:assertMinimalReactNativeVersionTask SKIPPED
> Task :react-native-picker_picker:writeDebugAarMetadata
> Task :react-native-safe-area-context:preBuild UP-TO-DATE
> Task :react-native-safe-area-context:preDebugBuild UP-TO-DATE
> Task :react-native-safe-area-context:writeDebugAarMetadata
> Task :react-native-screens:preBuild UP-TO-DATE
> Task :react-native-screens:preDebugBuild UP-TO-DATE
> Task :react-native-reanimated:prepareReanimatedHeadersForPrefabs
> Task :react-native-screens:writeDebugAarMetadata
> Task :react-native-svg:preBuild UP-TO-DATE
> Task :react-native-svg:preDebugBuild UP-TO-DATE
> Task :react-native-svg:writeDebugAarMetadata
> Task :react-native-vector-icons:preBuild UP-TO-DATE
> Task :react-native-reanimated:prepareWorkletsHeadersForPrefabs
> Task :react-native-vector-icons:preDebugBuild UP-TO-DATE
> Task :react-native-reanimated:preBuild
> Task :react-native-reanimated:preDebugBuild
> Task :react-native-reanimated:writeDebugAarMetadata
> Task :react-native-vector-icons:writeDebugAarMetadata
> Task :react-native-wheel-pick:preBuild UP-TO-DATE
> Task :react-native-wheel-pick:preDebugBuild UP-TO-DATE
> Task :react-native-wheel-pick:writeDebugAarMetadata
> Task :react-native-vision-camera:prepareHeaders
> Task :react-native-vision-camera:preBuild
> Task :react-native-vision-camera:preDebugBuild
> Task :react-native-vision-camera:writeDebugAarMetadata
> Task :unimodules-app-loader:preBuild UP-TO-DATE
> Task :unimodules-app-loader:preDebugBuild UP-TO-DATE
> Task :expo:generateExpoModulesPackageListTask
> Task :expo:preBuild
> Task :expo:preDebugBuild
> Task :expo:writeDebugAarMetadata
> Task :expo:generateDebugResValues
> Task :expo:generateDebugResources
> Task :expo:packageDebugResources
> Task :expo-application:generateDebugResValues
> Task :expo-application:generateDebugResources
> Task :expo-application:packageDebugResources
> Task :expo-asset:generateDebugResValues
> Task :expo-asset:generateDebugResources
> Task :expo-asset:packageDebugResources
> Task :expo-background-fetch:generateDebugResValues
> Task :expo-background-fetch:generateDebugResources
> Task :expo-background-fetch:packageDebugResources
> Task :expo-blur:generateDebugResValues
> Task :expo-blur:generateDebugResources
> Task :expo-blur:packageDebugResources
> Task :expo-camera:generateDebugResValues
> Task :expo-camera:generateDebugResources
> Task :expo-camera:packageDebugResources
> Task :expo-constants:generateDebugResValues
> Task :expo-constants:generateDebugResources
> Task :shopify_react-native-skia:prepareHeaders
> Task :shopify_react-native-skia:preBuild
> Task :shopify_react-native-skia:preDebugBuild
> Task :expo-constants:packageDebugResources
> Task :expo-dev-client:generateDebugResValues
> Task :expo-dev-client:generateDebugResources
> Task :expo-dev-client:packageDebugResources
> Task :expo-dev-launcher:generateDebugResValues
> Task :expo-dev-launcher:generateDebugResources
> Task :unimodules-app-loader:writeDebugAarMetadata
> Task :expo-dev-menu:generateDebugResValues
> Task :expo-dev-menu:generateDebugResources
> Task :expo-dev-menu:packageDebugResources
> Task :expo-dev-menu-interface:generateDebugResValues
> Task :expo-dev-menu-interface:generateDebugResources
> Task :expo-dev-menu-interface:packageDebugResources
> Task :expo-file-system:generateDebugResValues
> Task :expo-file-system:generateDebugResources
> Task :expo-file-system:packageDebugResources
> Task :expo-font:generateDebugResValues
> Task :expo-font:generateDebugResources
> Task :expo-font:packageDebugResources
> Task :expo-json-utils:generateDebugResValues
> Task :expo-json-utils:generateDebugResources
> Task :expo-json-utils:packageDebugResources
> Task :expo-keep-awake:generateDebugResValues
> Task :expo-keep-awake:generateDebugResources
> Task :expo-keep-awake:packageDebugResources
> Task :expo-linear-gradient:generateDebugResValues
> Task :expo-linear-gradient:generateDebugResources
> Task :expo-linear-gradient:packageDebugResources
> Task :expo-linking:generateDebugResValues
> Task :expo-linking:generateDebugResources
> Task :expo-linking:packageDebugResources
> Task :expo-manifests:generateDebugResValues
> Task :expo-manifests:generateDebugResources
> Task :expo-manifests:packageDebugResources
> Task :expo-media-library:generateDebugResValues
> Task :expo-media-library:generateDebugResources
> Task :expo-media-library:packageDebugResources
> Task :expo-dev-launcher:packageDebugResources
> Task :expo-notifications:generateDebugResValues
> Task :expo-modules-core:generateDebugResValues
> Task :expo-notifications:generateDebugResources
> Task :expo-modules-core:generateDebugResources
> Task :expo-notifications:packageDebugResources
> Task :expo-modules-core:packageDebugResources
> Task :expo-sharing:generateDebugResValues
> Task :expo-splash-screen:generateDebugResValues
> Task :expo-sharing:generateDebugResources
> Task :expo-splash-screen:generateDebugResources
> Task :expo-sharing:packageDebugResources
> Task :expo-system-ui:generateDebugResValues
> Task :expo-splash-screen:packageDebugResources
> Task :expo-system-ui:generateDebugResources
> Task :expo-task-manager:generateDebugResValues
> Task :expo-task-manager:generateDebugResources
> Task :expo-system-ui:packageDebugResources
> Task :expo-updates-interface:generateDebugResValues
> Task :expo-task-manager:packageDebugResources
> Task :lottie-react-native:generateDebugResValues
> Task :expo-updates-interface:generateDebugResources
> Task :lottie-react-native:generateDebugResources
> Task :expo-updates-interface:packageDebugResources
> Task :lottie-react-native:packageDebugResources
> Task :react-native-async-storage_async-storage:generateDebugResValues
> Task :notifee_react-native:generateDebugResValues
> Task :react-native-async-storage_async-storage:generateDebugResources
> Task :notifee_react-native:generateDebugResources
> Task :notifee_react-native:packageDebugResources
> Task :react-native-async-storage_async-storage:packageDebugResources
> Task :react-native-community_datetimepicker:generateDebugResValues
> Task :react-native-community_netinfo:generateDebugResValues
> Task :react-native-community_datetimepicker:generateDebugResources
> Task :shopify_react-native-skia:writeDebugAarMetadata
> Task :react-native-community_datetimepicker:packageDebugResources
> Task :react-native-community_netinfo:generateDebugResources
> Task :react-native-community_netinfo:packageDebugResources
> Task :react-native-community_slider:generateDebugResValues
> Task :react-native-community_slider:generateDebugResources
> Task :react-native-community_slider:packageDebugResources
> Task :react-native-firebase_app:generateDebugResValues
> Task :react-native-firebase_app:generateDebugResources
> Task :react-native-firebase_app:packageDebugResources
> Task :react-native-firebase_auth:generateDebugResValues
> Task :react-native-firebase_auth:generateDebugResources
> Task :react-native-firebase_auth:packageDebugResources
> Task :react-native-firebase_firestore:generateDebugResValues
> Task :react-native-firebase_firestore:generateDebugResources
> Task :react-native-firebase_firestore:packageDebugResources
> Task :react-native-firebase_messaging:generateDebugResValues
> Task :react-native-firebase_messaging:generateDebugResources
> Task :react-native-firebase_messaging:packageDebugResources
> Task :react-native-firebase_storage:generateDebugResValues
> Task :react-native-gesture-handler:generateDebugResValues
> Task :react-native-firebase_storage:generateDebugResources
> Task :react-native-picker_picker:generateDebugResValues
> Task :react-native-gesture-handler:generateDebugResources
> Task :react-native-gesture-handler:packageDebugResources
> Task :react-native-picker_picker:generateDebugResources
> Task :react-native-reanimated:generateDebugResValues
> Task :react-native-firebase_storage:packageDebugResources
> Task :react-native-reanimated:generateDebugResources
> Task :react-native-picker_picker:packageDebugResources
> Task :react-native-safe-area-context:generateDebugResValues
> Task :react-native-reanimated:packageDebugResources
> Task :react-native-safe-area-context:generateDebugResources
> Task :react-native-screens:generateDebugResValues
> Task :react-native-svg:generateDebugResValues
> Task :react-native-svg:generateDebugResources
> Task :react-native-screens:generateDebugResources
> Task :react-native-safe-area-context:packageDebugResources
> Task :react-native-svg:packageDebugResources
> Task :react-native-vector-icons:generateDebugResValues
> Task :react-native-vision-camera:generateDebugResValues
> Task :react-native-vision-camera:generateDebugResources
> Task :react-native-vector-icons:generateDebugResources
> Task :react-native-vision-camera:packageDebugResources
> Task :react-native-wheel-pick:generateDebugResValues
> Task :react-native-wheel-pick:generateDebugResources
> Task :react-native-screens:packageDebugResources
> Task :react-native-vector-icons:packageDebugResources
> Task :shopify_react-native-skia:generateDebugResValues
> Task :unimodules-app-loader:generateDebugResValues
> Task :shopify_react-native-skia:generateDebugResources
> Task :unimodules-app-loader:generateDebugResources
> Task :react-native-wheel-pick:packageDebugResources
> Task :shopify_react-native-skia:packageDebugResources
> Task :unimodules-app-loader:packageDebugResources
> Task :expo:extractDeepLinksDebug
> Task :expo-application:extractDeepLinksDebug
> Task :expo-asset:extractDeepLinksDebug
> Task :expo-asset:processDebugManifest
> Task :expo-application:processDebugManifest
> Task :expo:processDebugManifest
> Task :expo-blur:extractDeepLinksDebug
> Task :expo-camera:extractDeepLinksDebug
> Task :expo-background-fetch:extractDeepLinksDebug
> Task :expo-background-fetch:processDebugManifest
> Task :expo-blur:processDebugManifest
> Task :expo-camera:processDebugManifest
> Task :expo-constants:extractDeepLinksDebug
> Task :expo-dev-client:extractDeepLinksDebug
> Task :expo-dev-launcher:extractDeepLinksDebug
> Task :expo-dev-client:processDebugManifest
> Task :expo-constants:processDebugManifest
> Task :expo-dev-menu-interface:extractDeepLinksDebug
> Task :expo-dev-menu:extractDeepLinksDebug
> Task :expo-dev-launcher:processDebugManifest
> Task :expo-dev-menu:processDebugManifest
> Task :expo-file-system:extractDeepLinksDebug
> Task :expo-dev-menu-interface:processDebugManifest
> Task :expo-json-utils:extractDeepLinksDebug
> Task :expo-font:extractDeepLinksDebug
> Task :expo-font:processDebugManifest
> Task :expo-json-utils:processDebugManifest
> Task :expo-file-system:processDebugManifest
/home/expo/workingdir/build/node_modules/expo-file-system/android/src/main/AndroidManifest.xml:6:9-8:20 Warning:
provider#expo.modules.filesystem.FileSystemFileProvider@android:authorities was tagged at AndroidManifest.xml:6 to replace other declarations but no other declaration present
> Task :expo-keep-awake:extractDeepLinksDebug
> Task :expo-linear-gradient:extractDeepLinksDebug
> Task :expo-linking:extractDeepLinksDebug
> Task :expo-keep-awake:processDebugManifest
> Task :expo-linear-gradient:processDebugManifest
> Task :expo-manifests:extractDeepLinksDebug
> Task :expo-linking:processDebugManifest
> Task :expo-manifests:processDebugManifest
> Task :expo-media-library:extractDeepLinksDebug
> Task :expo-modules-core:extractDeepLinksDebug
> Task :expo-notifications:extractDeepLinksDebug
> Task :expo-media-library:processDebugManifest
> Task :expo-sharing:extractDeepLinksDebug
> Task :expo-modules-core:processDebugManifest
/home/expo/workingdir/build/node_modules/expo-modules-core/android/src/main/AndroidManifest.xml:8:9-11:45 Warning:
	meta-data#com.facebook.soloader.enabled@android:value was tagged at AndroidManifest.xml:8 to replace other declarations but no other declaration present
> Task :expo-splash-screen:extractDeepLinksDebug
> Task :expo-splash-screen:processDebugManifest
> Task :expo-notifications:processDebugManifest
> Task :expo-sharing:processDebugManifest
> Task :expo-system-ui:extractDeepLinksDebug
> Task :expo-task-manager:extractDeepLinksDebug
> Task :expo-updates-interface:extractDeepLinksDebug
> Task :expo-system-ui:processDebugManifest
> Task :lottie-react-native:extractDeepLinksDebug
> Task :expo-updates-interface:processDebugManifest
> Task :expo-task-manager:processDebugManifest
> Task :lottie-react-native:processDebugManifest
> Task :react-native-async-storage_async-storage:extractDeepLinksDebug
> Task :notifee_react-native:extractDeepLinksDebug
> Task :react-native-community_datetimepicker:extractDeepLinksDebug
> Task :react-native-community_datetimepicker:processDebugManifest
> Task :react-native-async-storage_async-storage:processDebugManifest
package="com.reactnativecommunity.asyncstorage" found in source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-async-storage/async-storage/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="com.reactnativecommunity.asyncstorage" from the source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-async-storage/async-storage/android/src/main/AndroidManifest.xml.
> Task :react-native-community_netinfo:extractDeepLinksDebug
> Task :react-native-community_slider:extractDeepLinksDebug
> Task :notifee_react-native:processDebugManifest
package="io.invertase.notifee" found in source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@notifee/react-native/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="io.invertase.notifee" from the source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@notifee/react-native/android/src/main/AndroidManifest.xml.
> Task :react-native-firebase_app:extractDeepLinksDebug
> Task :react-native-community_slider:processDebugManifest
package="com.reactnativecommunity.slider" found in source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-community/slider/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="com.reactnativecommunity.slider" from the source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-community/slider/android/src/main/AndroidManifest.xml.
> Task :react-native-firebase_auth:extractDeepLinksDebug
> Task :react-native-community_netinfo:processDebugManifest
package="com.reactnativecommunity.netinfo" found in source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-community/netinfo/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="com.reactnativecommunity.netinfo" from the source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-community/netinfo/android/src/main/AndroidManifest.xml.
> Task :react-native-firebase_app:processDebugManifest
package="io.invertase.firebase" found in source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-firebase/app/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="io.invertase.firebase" from the source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-firebase/app/android/src/main/AndroidManifest.xml.
> Task :react-native-firebase_firestore:extractDeepLinksDebug
> Task :react-native-firebase_messaging:extractDeepLinksDebug
> Task :react-native-firebase_auth:processDebugManifest
package="io.invertase.firebase.auth" found in source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-firebase/auth/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="io.invertase.firebase.auth" from the source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-firebase/auth/android/src/main/AndroidManifest.xml.
> Task :react-native-firebase_firestore:processDebugManifest
package="io.invertase.firebase.firestore" found in source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-firebase/firestore/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="io.invertase.firebase.firestore" from the source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-firebase/firestore/android/src/main/AndroidManifest.xml.
> Task :react-native-firebase_storage:extractDeepLinksDebug
> Task :react-native-firebase_messaging:processDebugManifest
package="io.invertase.firebase.messaging" found in source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-firebase/messaging/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="io.invertase.firebase.messaging" from the source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-firebase/messaging/android/src/main/AndroidManifest.xml.
> Task :react-native-picker_picker:extractDeepLinksDebug
> Task :react-native-firebase_storage:processDebugManifest
package="io.invertase.firebase.storage" found in source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-firebase/storage/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="io.invertase.firebase.storage" from the source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-firebase/storage/android/src/main/AndroidManifest.xml.
> Task :app:generateAutolinkingPackageList
> Task :react-native-gesture-handler:extractDeepLinksDebug
> Task :app:generateCodegenSchemaFromJavaScript SKIPPED
> Task :app:generateCodegenArtifactsFromSchema SKIPPED
> Task :app:preBuild
> Task :app:preDebugBuild
> Task :app:mergeDebugNativeDebugMetadata NO-SOURCE
> Task :app:checkKotlinGradlePluginConfigurationErrors
> Task :react-native-gesture-handler:processDebugManifest
> Task :react-native-reanimated:extractDeepLinksDebug
> Task :react-native-safe-area-context:extractDeepLinksDebug
> Task :react-native-picker_picker:processDebugManifest
package="com.reactnativecommunity.picker" found in source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-picker/picker/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="com.reactnativecommunity.picker" from the source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-picker/picker/android/src/main/AndroidManifest.xml.
> Task :app:generateDebugBuildConfig
> Task :react-native-screens:extractDeepLinksDebug
> Task :react-native-reanimated:processDebugManifest
> Task :react-native-svg:extractDeepLinksDebug
> Task :react-native-safe-area-context:processDebugManifest
package="com.th3rdwave.safeareacontext" found in source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/react-native-safe-area-context/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="com.th3rdwave.safeareacontext" from the source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/react-native-safe-area-context/android/src/main/AndroidManifest.xml.
> Task :react-native-vector-icons:extractDeepLinksDebug
> Task :react-native-svg:processDebugManifest
package="com.horcrux.svg" found in source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/react-native-svg/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="com.horcrux.svg" from the source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/react-native-svg/android/src/main/AndroidManifest.xml.
> Task :react-native-vision-camera:extractDeepLinksDebug
> Task :react-native-vector-icons:processDebugManifest
package="com.oblador.vectoricons" found in source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/react-native-vector-icons/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="com.oblador.vectoricons" from the source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/react-native-vector-icons/android/src/main/AndroidManifest.xml.
> Task :react-native-wheel-pick:extractDeepLinksDebug
> Task :react-native-screens:processDebugManifest
package="com.swmansion.rnscreens" found in source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="com.swmansion.rnscreens" from the source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/AndroidManifest.xml.
> Task :shopify_react-native-skia:extractDeepLinksDebug
> Task :react-native-vision-camera:processDebugManifest
> Task :unimodules-app-loader:extractDeepLinksDebug
> Task :unimodules-app-loader:processDebugManifest
> Task :shopify_react-native-skia:processDebugManifest
package="com.shopify.reactnative.skia" found in source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@shopify/react-native-skia/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="com.shopify.reactnative.skia" from the source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@shopify/react-native-skia/android/src/main/AndroidManifest.xml.
> Task :react-native-wheel-pick:processDebugManifest
> Task :expo:compileDebugLibraryResources
> Task :expo-application:compileDebugLibraryResources
> Task :expo:parseDebugLocalResources
> Task :expo-application:parseDebugLocalResources
> Task :expo:generateDebugRFile
> Task :expo-asset:compileDebugLibraryResources
> Task :expo-application:generateDebugRFile
> Task :expo-background-fetch:compileDebugLibraryResources
> Task :expo-asset:parseDebugLocalResources
> Task :expo-background-fetch:parseDebugLocalResources
> Task :expo-blur:compileDebugLibraryResources
> Task :expo-background-fetch:generateDebugRFile
> Task :expo-asset:generateDebugRFile
> Task :expo-blur:parseDebugLocalResources
> Task :expo-camera:parseDebugLocalResources
> Task :expo-camera:generateDebugRFile
> Task :expo-blur:generateDebugRFile
> Task :expo-camera:compileDebugLibraryResources
> Task :expo-dev-client:compileDebugLibraryResources
> Task :expo-constants:parseDebugLocalResources
> Task :expo-constants:generateDebugRFile
> Task :expo-dev-client:parseDebugLocalResources
> Task :expo-dev-client:generateDebugRFile
> Task :expo-dev-launcher:parseDebugLocalResources
> Task :expo-constants:compileDebugLibraryResources
> Task :expo-dev-launcher:generateDebugRFile
> Task :expo-dev-menu:compileDebugLibraryResources
> Task :expo-dev-launcher:compileDebugLibraryResources
> Task :expo-dev-menu-interface:compileDebugLibraryResources
> Task :expo-dev-menu-interface:parseDebugLocalResources
> Task :expo-dev-menu:parseDebugLocalResources
> Task :expo-dev-menu-interface:generateDebugRFile
> Task :expo-dev-menu:generateDebugRFile
> Task :expo-file-system:compileDebugLibraryResources
> Task :expo-font:parseDebugLocalResources
> Task :expo-font:generateDebugRFile
> Task :expo-font:compileDebugLibraryResources
> Task :expo-file-system:parseDebugLocalResources
> Task :expo-json-utils:compileDebugLibraryResources
> Task :expo-json-utils:parseDebugLocalResources
> Task :expo-json-utils:generateDebugRFile
> Task :expo-keep-awake:compileDebugLibraryResources
> Task :expo-keep-awake:parseDebugLocalResources
> Task :expo-linear-gradient:compileDebugLibraryResources
> Task :expo-linear-gradient:parseDebugLocalResources
> Task :expo-file-system:generateDebugRFile
> Task :expo-linking:compileDebugLibraryResources
> Task :expo-linear-gradient:generateDebugRFile
> Task :expo-linking:parseDebugLocalResources
> Task :expo-keep-awake:generateDebugRFile
> Task :expo-manifests:compileDebugLibraryResources
> Task :expo-linking:generateDebugRFile
> Task :expo-manifests:parseDebugLocalResources
> Task :expo-media-library:parseDebugLocalResources
> Task :expo-media-library:compileDebugLibraryResources
> Task :expo-manifests:generateDebugRFile
> Task :expo-media-library:generateDebugRFile
> Task :expo-notifications:compileDebugLibraryResources
> Task :expo-modules-core:compileDebugLibraryResources
> Task :expo-modules-core:parseDebugLocalResources
> Task :expo-notifications:parseDebugLocalResources
> Task :expo-modules-core:generateDebugRFile
> Task :expo-sharing:compileDebugLibraryResources
> Task :expo-sharing:parseDebugLocalResources
> Task :expo-notifications:generateDebugRFile
> Task :expo-sharing:generateDebugRFile
> Task :expo-splash-screen:compileDebugLibraryResources
> Task :expo-splash-screen:parseDebugLocalResources
> Task :expo-system-ui:compileDebugLibraryResources
> Task :expo-system-ui:parseDebugLocalResources
> Task :expo-splash-screen:generateDebugRFile
> Task :expo-task-manager:parseDebugLocalResources
> Task :expo-task-manager:compileDebugLibraryResources
> Task :expo-system-ui:generateDebugRFile
> Task :expo-task-manager:generateDebugRFile
> Task :expo-updates-interface:parseDebugLocalResources
> Task :expo-updates-interface:compileDebugLibraryResources
> Task :expo-updates-interface:generateDebugRFile
> Task :notifee_react-native:compileDebugLibraryResources
> Task :lottie-react-native:parseDebugLocalResources
> Task :lottie-react-native:compileDebugLibraryResources
> Task :notifee_react-native:parseDebugLocalResources
> Task :lottie-react-native:generateDebugRFile
> Task :react-native-async-storage_async-storage:parseDebugLocalResources
> Task :react-native-async-storage_async-storage:compileDebugLibraryResources
> Task :react-native-community_datetimepicker:compileDebugLibraryResources
> Task :notifee_react-native:generateDebugRFile
> Task :react-native-community_datetimepicker:parseDebugLocalResources
> Task :react-native-community_netinfo:compileDebugLibraryResources
> Task :react-native-async-storage_async-storage:generateDebugRFile
> Task :react-native-community_slider:compileDebugLibraryResources
> Task :react-native-community_datetimepicker:generateDebugRFile
> Task :react-native-community_slider:parseDebugLocalResources
> Task :react-native-firebase_app:compileDebugLibraryResources
> Task :react-native-community_slider:generateDebugRFile
> Task :react-native-firebase_app:parseDebugLocalResources
> Task :react-native-firebase_app:generateDebugRFile
> Task :react-native-firebase_auth:compileDebugLibraryResources
> Task :react-native-community_netinfo:parseDebugLocalResources
> Task :react-native-firebase_auth:parseDebugLocalResources
> Task :react-native-firebase_firestore:compileDebugLibraryResources
> Task :react-native-community_netinfo:generateDebugRFile
> Task :react-native-firebase_messaging:compileDebugLibraryResources
> Task :react-native-firebase_firestore:parseDebugLocalResources
> Task :react-native-firebase_messaging:parseDebugLocalResources
> Task :react-native-firebase_firestore:generateDebugRFile
> Task :react-native-firebase_storage:compileDebugLibraryResources
> Task :react-native-firebase_messaging:generateDebugRFile
> Task :react-native-firebase_auth:generateDebugRFile
> Task :react-native-firebase_storage:parseDebugLocalResources
> Task :react-native-gesture-handler:compileDebugLibraryResources
> Task :react-native-gesture-handler:parseDebugLocalResources
> Task :react-native-gesture-handler:generateDebugRFile
> Task :react-native-picker_picker:parseDebugLocalResources
> Task :react-native-firebase_storage:generateDebugRFile
> Task :react-native-picker_picker:generateDebugRFile
> Task :react-native-reanimated:compileDebugLibraryResources
> Task :react-native-picker_picker:compileDebugLibraryResources
> Task :react-native-reanimated:parseDebugLocalResources
> Task :react-native-safe-area-context:compileDebugLibraryResources
> Task :react-native-reanimated:generateDebugRFile
> Task :react-native-screens:parseDebugLocalResources
> Task :react-native-safe-area-context:parseDebugLocalResources
> Task :react-native-screens:compileDebugLibraryResources
> Task :react-native-safe-area-context:generateDebugRFile
> Task :react-native-screens:generateDebugRFile
> Task :react-native-vector-icons:compileDebugLibraryResources
> Task :react-native-svg:parseDebugLocalResources
> Task :react-native-svg:compileDebugLibraryResources
> Task :react-native-vector-icons:parseDebugLocalResources
> Task :react-native-svg:generateDebugRFile
> Task :react-native-vision-camera:compileDebugLibraryResources
> Task :react-native-wheel-pick:compileDebugLibraryResources
> Task :react-native-vision-camera:parseDebugLocalResources
> Task :react-native-vector-icons:generateDebugRFile
> Task :shopify_react-native-skia:compileDebugLibraryResources
> Task :shopify_react-native-skia:parseDebugLocalResources
> Task :react-native-wheel-pick:parseDebugLocalResources
> Task :shopify_react-native-skia:generateDebugRFile
> Task :unimodules-app-loader:compileDebugLibraryResources
> Task :react-native-wheel-pick:generateDebugRFile
> Task :expo:checkKotlinGradlePluginConfigurationErrors
> Task :expo:generateDebugBuildConfig
> Task :expo-application:checkKotlinGradlePluginConfigurationErrors
> Task :expo-application:generateDebugBuildConfig
> Task :expo-modules-core:checkKotlinGradlePluginConfigurationErrors
> Task :expo-modules-core:generateDebugBuildConfig
> Task :react-native-vision-camera:generateDebugRFile
> Task :unimodules-app-loader:parseDebugLocalResources
> Task :expo-application:javaPreCompileDebug
> Task :expo-asset:checkKotlinGradlePluginConfigurationErrors
> Task :expo-asset:generateDebugBuildConfig
> Task :unimodules-app-loader:generateDebugRFile
> Task :expo-background-fetch:checkKotlinGradlePluginConfigurationErrors
> Task :expo-background-fetch:generateDebugBuildConfig
> Task :expo-background-fetch:javaPreCompileDebug
> Task :expo-blur:checkKotlinGradlePluginConfigurationErrors
> Task :expo-blur:generateDebugBuildConfig
> Task :expo-asset:javaPreCompileDebug
> Task :expo-camera:checkKotlinGradlePluginConfigurationErrors
> Task :expo-camera:generateDebugBuildConfig
> Task :expo-blur:javaPreCompileDebug
> Task :expo-constants:checkKotlinGradlePluginConfigurationErrors
> Task :expo-constants:generateDebugBuildConfig
> Task :expo-camera:javaPreCompileDebug
> Task :expo-dev-client:checkKotlinGradlePluginConfigurationErrors
> Task :expo-constants:javaPreCompileDebug
> Task :expo-dev-launcher:checkKotlinGradlePluginConfigurationErrors
> Task :app:checkDebugAarMetadata
> Task :app:generateDebugResValues
> Task :app:processDebugGoogleServices
> Task :expo-dev-client:dataBindingMergeDependencyArtifactsDebug
> Task :app:mapDebugSourceSetPaths
> Task :app:generateDebugResources
> Task :expo-dev-launcher:dataBindingMergeDependencyArtifactsDebug
> Task :expo-dev-client:dataBindingGenBaseClassesDebug
> Task :expo-modules-core:javaPreCompileDebug
> Task :expo-dev-client:generateDebugBuildConfig
> Task :expo-dev-client:javaPreCompileDebug
> Task :expo-dev-menu:checkKotlinGradlePluginConfigurationErrors
> Task :expo-dev-menu:generateDebugBuildConfig
> Task :expo-dev-menu-interface:checkKotlinGradlePluginConfigurationErrors
> Task :expo-dev-menu-interface:generateDebugBuildConfig
> Task :expo-dev-menu-interface:javaPreCompileDebug
> Task :expo-json-utils:checkKotlinGradlePluginConfigurationErrors
> Task :expo-json-utils:generateDebugBuildConfig
> Task :expo-json-utils:javaPreCompileDebug
> Task :expo-manifests:checkKotlinGradlePluginConfigurationErrors
> Task :expo-manifests:generateDebugBuildConfig
> Task :expo-manifests:javaPreCompileDebug
> Task :expo-dev-menu:javaPreCompileDebug
> Task :expo-updates-interface:checkKotlinGradlePluginConfigurationErrors
> Task :expo-updates-interface:generateDebugBuildConfig
> Task :expo-updates-interface:javaPreCompileDebug
> Task :expo-file-system:checkKotlinGradlePluginConfigurationErrors
> Task :expo-file-system:generateDebugBuildConfig
> Task :expo-file-system:javaPreCompileDebug
> Task :expo-font:checkKotlinGradlePluginConfigurationErrors
> Task :expo-dev-launcher:dataBindingGenBaseClassesDebug
> Task :expo-dev-launcher:generateDebugBuildConfig
> Task :expo-font:generateDebugBuildConfig
> Task :expo-dev-launcher:javaPreCompileDebug
> Task :expo-keep-awake:checkKotlinGradlePluginConfigurationErrors
> Task :expo-keep-awake:generateDebugBuildConfig
> Task :expo-font:javaPreCompileDebug
> Task :expo-linear-gradient:checkKotlinGradlePluginConfigurationErrors
> Task :expo-keep-awake:javaPreCompileDebug
> Task :expo-linking:checkKotlinGradlePluginConfigurationErrors
> Task :expo-linear-gradient:generateDebugBuildConfig
> Task :expo-linking:generateDebugBuildConfig
> Task :expo-linear-gradient:javaPreCompileDebug
> Task :expo-media-library:checkKotlinGradlePluginConfigurationErrors
> Task :expo-linking:javaPreCompileDebug
> Task :expo-notifications:checkKotlinGradlePluginConfigurationErrors
> Task :expo-media-library:generateDebugBuildConfig
> Task :expo-notifications:generateDebugBuildConfig
> Task :expo-media-library:javaPreCompileDebug
> Task :expo-sharing:checkKotlinGradlePluginConfigurationErrors
> Task :expo-notifications:javaPreCompileDebug
> Task :expo-splash-screen:checkKotlinGradlePluginConfigurationErrors
> Task :expo-sharing:generateDebugBuildConfig
> Task :expo-sharing:javaPreCompileDebug
> Task :expo-system-ui:checkKotlinGradlePluginConfigurationErrors
> Task :expo-splash-screen:generateDebugBuildConfig
> Task :expo-splash-screen:javaPreCompileDebug
> Task :expo-task-manager:checkKotlinGradlePluginConfigurationErrors
> Task :expo-system-ui:generateDebugBuildConfig
> Task :expo-task-manager:generateDebugBuildConfig
> Task :unimodules-app-loader:checkKotlinGradlePluginConfigurationErrors
> Task :unimodules-app-loader:generateDebugBuildConfig
> Task :unimodules-app-loader:javaPreCompileDebug
> Task :expo-system-ui:javaPreCompileDebug
> Task :expo-task-manager:javaPreCompileDebug
> Task :lottie-react-native:checkKotlinGradlePluginConfigurationErrors
> Task :expo:javaPreCompileDebug
> Task :lottie-react-native:generateDebugBuildConfig
> Task :notifee_react-native:generateDebugBuildConfig
> Task :notifee_react-native:javaPreCompileDebug
> Task :app:mergeDebugResources
> Task :app:packageDebugResources
> Task :app:parseDebugLocalResources
> Task :app:createDebugCompatibleScreenManifests
> Task :app:extractDeepLinksDebug
> Task :app:processDebugMainManifest FAILED
See https://developer.android.com/r/studio-ui/build/manifest-merger for more information about the manifest merger.
/home/expo/workingdir/build/android/app/src/debug/AndroidManifest.xml:19:93-116 Error:
	Attribute meta-data#com.google.firebase.messaging.default_notification_channel_id@value value=(default) from AndroidManifest.xml:19:93-116
	is also present at [:react-native-firebase_messaging] AndroidManifest.xml:37:13-29 value=().
	Suggestion: add 'tools:replace="android:value"' to <meta-data> element at AndroidManifest.xml to override.
/home/expo/workingdir/build/android/app/src/debug/AndroidManifest.xml:20:88-137 Error:
	Attribute meta-data#com.google.firebase.messaging.default_notification_color@resource value=(@color/notification_icon_color) from AndroidManifest.xml:20:88-137
	is also present at [:react-native-firebase_messaging] AndroidManifest.xml:40:13-44 value=(@color/white).
	Suggestion: add 'tools:replace="android:resource"' to <meta-data> element at AndroidManifest.xml to override.
> Task :lottie-react-native:compileDebugKotlin
w: file:///home/expo/workingdir/build/node_modules/lottie-react-native/android/src/main/java/com/airbnb/android/react/lottie/LottieAnimationViewManagerImpl.kt:12:34 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/lottie-react-native/android/src/main/java/com/airbnb/android/react/lottie/LottieAnimationViewManagerImpl.kt:21:17 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/lottie-react-native/android/src/main/java/com/airbnb/android/react/lottie/LottieAnimationViewManagerImpl.kt:72:16 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/lottie-react-native/android/src/main/java/com/airbnb/android/react/lottie/LottieAnimationViewManagerImpl.kt:74:13 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/lottie-react-native/android/src/main/java/com/airbnb/android/react/lottie/LottieAnimationViewManagerImpl.kt:76:13 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/lottie-react-native/android/src/main/java/com/airbnb/android/react/lottie/LottieAnimationViewManagerImpl.kt:78:13 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/lottie-react-native/android/src/main/java/com/airbnb/android/react/lottie/LottieAnimationViewPropertyManager.kt:20:38 'ReactFontManager' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/lottie-react-native/android/src/main/java/com/airbnb/android/react/lottie/LottieAnimationViewPropertyManager.kt:72:24 'ReactFontManager' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/lottie-react-native/android/src/main/java/com/airbnb/android/react/lottie/LottieAnimationViewPropertyManager.kt:86:24 'ReactFontManager' is deprecated. Deprecated in Java
> Task :notifee_react-native:compileDebugJavaWithJavac
/home/expo/workingdir/build/node_modules/@notifee/react-native/android/src/main/java/io/invertase/notifee/NotifeeApiModule.java:42: warning: [removal] onCatalystInstanceDestroy() in NativeModule has been deprecated and marked for removal
  public void onCatalystInstanceDestroy() {
              ^
Note: /home/expo/workingdir/build/node_modules/@notifee/react-native/android/src/main/java/io/invertase/notifee/NotifeeReactUtils.java uses or overrides a deprecated API.
Note: Recompile with -Xlint:deprecation for details.
1 warning
> Task :expo-modules-core:compileDebugKotlin
FAILURE: Build failed with an exception.
* What went wrong:
Execution failed for task ':app:processDebugMainManifest'.
> Manifest merger failed with multiple errors, see logs
* Try:
> Run with --stacktrace option to get the stack trace.
> Run with --info or --debug option to get more log output.
> Run with --scan to get full insights.
> Get more help at https://help.gradle.org.
BUILD FAILED in 3m 5s
Deprecated Gradle features were used in this build, making it incompatible with Gradle 9.0.
You can use '--warning-mode all' to show the individual deprecation warnings and determine if they come from your own scripts or plugins.
For more on this, please refer to https://docs.gradle.org/8.10.2/userguide/command_line_interface.html#sec:command_line_warnings in the Gradle documentation.
562 actionable tasks: 562 executed
Error: Gradle build failed with unknown error. See logs for the "Run gradlew" phase for more information.