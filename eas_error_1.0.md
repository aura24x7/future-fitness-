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
> Task :gradle-plugin:settings-plugin:compileJava NO-SOURCE
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
> Task :expo-application:preBuild UP-TO-DATE
> Task :expo-application:preDebugBuild UP-TO-DATE
> Task :expo-asset:preBuild UP-TO-DATE
> Task :expo-asset:preDebugBuild UP-TO-DATE
> Task :expo-application:writeDebugAarMetadata
> Task :expo-asset:writeDebugAarMetadata
> Task :expo-blur:preBuild UP-TO-DATE
> Task :expo-blur:preDebugBuild UP-TO-DATE
> Task :expo-background-fetch:preBuild UP-TO-DATE
> Task :expo-background-fetch:preDebugBuild UP-TO-DATE
> Task :expo-background-fetch:writeDebugAarMetadata
> Task :expo-blur:writeDebugAarMetadata
> Task :expo-camera:preBuild UP-TO-DATE
> Task :expo-camera:preDebugBuild UP-TO-DATE
> Task :expo-camera:writeDebugAarMetadata
> Task :expo-dev-client:preBuild UP-TO-DATE
> Task :expo-dev-client:preDebugBuild UP-TO-DATE
> Task :expo-dev-client:writeDebugAarMetadata
> Task :expo-dev-launcher:preBuild UP-TO-DATE
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
> Task :react-native-firebase_storage:writeDebugAarMetadata
> Task :react-native-gesture-handler:preBuild UP-TO-DATE
> Task :react-native-gesture-handler:preDebugBuild UP-TO-DATE
> Task :react-native-gesture-handler:writeDebugAarMetadata
> Task :react-native-picker_picker:preBuild UP-TO-DATE
> Task :react-native-picker_picker:preDebugBuild UP-TO-DATE
> Task :react-native-picker_picker:writeDebugAarMetadata
> Task :react-native-reanimated:assertLatestReactNativeWithNewArchitectureTask SKIPPED
> Task :react-native-reanimated:assertMinimalReactNativeVersionTask SKIPPED
> Task :react-native-reanimated:prepareReanimatedHeadersForPrefabs
> Task :react-native-reanimated:prepareWorkletsHeadersForPrefabs
> Task :react-native-reanimated:preBuild
> Task :react-native-reanimated:preDebugBuild
> Task :expo-constants:createExpoConfig
The NODE_ENV environment variable is required but was not specified. Ensure the project is bundled with Expo CLI or NODE_ENV is set.
Proceeding without mode-specific .env
> Task :expo-constants:preBuild
> Task :expo-constants:preDebugBuild
> Task :react-native-reanimated:writeDebugAarMetadata
> Task :react-native-safe-area-context:preBuild UP-TO-DATE
> Task :expo-constants:writeDebugAarMetadata
> Task :react-native-safe-area-context:preDebugBuild UP-TO-DATE
> Task :react-native-screens:preBuild UP-TO-DATE
> Task :react-native-screens:preDebugBuild UP-TO-DATE
> Task :react-native-screens:writeDebugAarMetadata
> Task :react-native-safe-area-context:writeDebugAarMetadata
> Task :react-native-svg:preBuild UP-TO-DATE
> Task :react-native-svg:preDebugBuild UP-TO-DATE
> Task :react-native-vector-icons:preBuild UP-TO-DATE
> Task :react-native-vector-icons:preDebugBuild UP-TO-DATE
> Task :react-native-vector-icons:writeDebugAarMetadata
> Task :react-native-svg:writeDebugAarMetadata
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
> Task :unimodules-app-loader:writeDebugAarMetadata
> Task :expo-application:generateDebugResValues
> Task :expo-application:generateDebugResources
> Task :expo-application:packageDebugResources
> Task :expo:packageDebugResources
> Task :expo-asset:generateDebugResValues
> Task :expo-background-fetch:generateDebugResValues
> Task :expo-asset:generateDebugResources
> Task :expo-background-fetch:generateDebugResources
> Task :expo-asset:packageDebugResources
> Task :expo-background-fetch:packageDebugResources
> Task :expo-blur:generateDebugResValues
> Task :expo-blur:generateDebugResources
> Task :expo-camera:generateDebugResValues
> Task :expo-camera:generateDebugResources
> Task :expo-blur:packageDebugResources
> Task :expo-camera:packageDebugResources
> Task :expo-dev-client:generateDebugResValues
> Task :expo-constants:generateDebugResValues
> Task :expo-constants:generateDebugResources
> Task :expo-dev-client:generateDebugResources
> Task :expo-constants:packageDebugResources
> Task :expo-dev-launcher:generateDebugResValues
> Task :expo-dev-client:packageDebugResources
> Task :expo-dev-menu:generateDebugResValues
> Task :expo-dev-launcher:generateDebugResources
> Task :expo-dev-menu:generateDebugResources
> Task :shopify_react-native-skia:prepareHeaders
> Task :shopify_react-native-skia:preBuild
> Task :shopify_react-native-skia:preDebugBuild
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
> Task :expo-dev-launcher:packageDebugResources
> Task :expo-linking:generateDebugResources
> Task :expo-manifests:generateDebugResValues
> Task :expo-manifests:generateDebugResources
> Task :expo-linking:packageDebugResources
> Task :expo-media-library:generateDebugResValues
> Task :expo-media-library:generateDebugResources
> Task :expo-manifests:packageDebugResources
> Task :expo-modules-core:generateDebugResValues
> Task :expo-media-library:packageDebugResources
> Task :expo-modules-core:generateDebugResources
> Task :expo-notifications:generateDebugResValues
> Task :expo-modules-core:packageDebugResources
> Task :expo-sharing:generateDebugResValues
> Task :expo-notifications:generateDebugResources
> Task :expo-sharing:generateDebugResources
> Task :expo-sharing:packageDebugResources
> Task :expo-splash-screen:generateDebugResValues
> Task :expo-notifications:packageDebugResources
> Task :expo-system-ui:generateDebugResValues
> Task :expo-splash-screen:generateDebugResources
> Task :expo-system-ui:generateDebugResources
> Task :expo-splash-screen:packageDebugResources
> Task :expo-system-ui:packageDebugResources
> Task :expo-task-manager:generateDebugResValues
> Task :expo-updates-interface:generateDebugResValues
> Task :expo-task-manager:generateDebugResources
> Task :expo-updates-interface:generateDebugResources
> Task :expo-task-manager:packageDebugResources
> Task :lottie-react-native:generateDebugResValues
> Task :expo-updates-interface:packageDebugResources
> Task :notifee_react-native:generateDebugResValues
> Task :lottie-react-native:generateDebugResources
> Task :notifee_react-native:generateDebugResources
> Task :notifee_react-native:packageDebugResources
> Task :react-native-async-storage_async-storage:generateDebugResValues
> Task :react-native-async-storage_async-storage:generateDebugResources
> Task :lottie-react-native:packageDebugResources
> Task :react-native-community_datetimepicker:generateDebugResValues
> Task :react-native-community_datetimepicker:generateDebugResources
> Task :react-native-async-storage_async-storage:packageDebugResources
> Task :react-native-community_netinfo:generateDebugResValues
> Task :react-native-community_netinfo:generateDebugResources
> Task :react-native-community_netinfo:packageDebugResources
> Task :react-native-community_datetimepicker:packageDebugResources
> Task :react-native-community_slider:generateDebugResValues
> Task :react-native-community_slider:generateDebugResources
> Task :react-native-firebase_app:generateDebugResValues
> Task :react-native-community_slider:packageDebugResources
> Task :react-native-firebase_app:generateDebugResources
> Task :react-native-firebase_auth:generateDebugResValues
> Task :react-native-firebase_app:packageDebugResources
> Task :react-native-firebase_auth:generateDebugResources
> Task :react-native-firebase_firestore:generateDebugResValues
> Task :react-native-firebase_auth:packageDebugResources
> Task :react-native-firebase_firestore:generateDebugResources
> Task :react-native-firebase_messaging:generateDebugResValues
> Task :react-native-firebase_messaging:generateDebugResources
> Task :react-native-firebase_firestore:packageDebugResources
> Task :react-native-firebase_storage:generateDebugResValues
> Task :react-native-firebase_messaging:packageDebugResources
> Task :react-native-gesture-handler:generateDebugResValues
> Task :react-native-firebase_storage:generateDebugResources
> Task :react-native-gesture-handler:generateDebugResources
> Task :react-native-gesture-handler:packageDebugResources
> Task :react-native-firebase_storage:packageDebugResources
> Task :react-native-picker_picker:generateDebugResValues
> Task :react-native-reanimated:generateDebugResValues
> Task :react-native-picker_picker:generateDebugResources
> Task :react-native-reanimated:generateDebugResources
> Task :react-native-picker_picker:packageDebugResources
> Task :react-native-reanimated:packageDebugResources
> Task :react-native-safe-area-context:generateDebugResValues
> Task :react-native-screens:generateDebugResValues
> Task :react-native-safe-area-context:generateDebugResources
> Task :react-native-screens:generateDebugResources
> Task :react-native-safe-area-context:packageDebugResources
> Task :shopify_react-native-skia:writeDebugAarMetadata
> Task :react-native-svg:generateDebugResValues
> Task :react-native-svg:generateDebugResources
> Task :react-native-screens:packageDebugResources
> Task :react-native-vector-icons:generateDebugResValues
> Task :react-native-svg:packageDebugResources
> Task :react-native-vector-icons:generateDebugResources
> Task :react-native-vision-camera:generateDebugResValues
> Task :react-native-vision-camera:generateDebugResources
> Task :react-native-vector-icons:packageDebugResources
> Task :react-native-wheel-pick:generateDebugResValues
> Task :react-native-wheel-pick:generateDebugResources
> Task :react-native-vision-camera:packageDebugResources
> Task :shopify_react-native-skia:generateDebugResValues
> Task :react-native-wheel-pick:packageDebugResources
> Task :shopify_react-native-skia:generateDebugResources
> Task :unimodules-app-loader:generateDebugResValues
> Task :unimodules-app-loader:generateDebugResources
> Task :unimodules-app-loader:packageDebugResources
> Task :shopify_react-native-skia:packageDebugResources
> Task :expo:extractDeepLinksDebug
> Task :expo-application:extractDeepLinksDebug
> Task :expo-application:processDebugManifest
> Task :expo:processDebugManifest
> Task :expo-asset:extractDeepLinksDebug
> Task :expo-background-fetch:extractDeepLinksDebug
> Task :expo-asset:processDebugManifest
> Task :expo-blur:extractDeepLinksDebug
> Task :expo-background-fetch:processDebugManifest
> Task :expo-camera:extractDeepLinksDebug
> Task :expo-blur:processDebugManifest
> Task :expo-camera:processDebugManifest
> Task :expo-dev-client:extractDeepLinksDebug
> Task :expo-constants:extractDeepLinksDebug
> Task :expo-dev-client:processDebugManifest
> Task :expo-constants:processDebugManifest
> Task :expo-dev-menu:extractDeepLinksDebug
> Task :expo-dev-launcher:extractDeepLinksDebug
> Task :expo-dev-launcher:processDebugManifest
> Task :expo-dev-menu:processDebugManifest
> Task :expo-dev-menu-interface:extractDeepLinksDebug
> Task :expo-file-system:extractDeepLinksDebug
> Task :expo-dev-menu-interface:processDebugManifest
> Task :expo-font:extractDeepLinksDebug
> Task :expo-font:processDebugManifest
> Task :expo-file-system:processDebugManifest
/home/expo/workingdir/build/node_modules/expo-file-system/android/src/main/AndroidManifest.xml:6:9-8:20 Warning:
	provider#expo.modules.filesystem.FileSystemFileProvider@android:authorities was tagged at AndroidManifest.xml:6 to replace other declarations but no other declaration present
> Task :expo-json-utils:extractDeepLinksDebug
> Task :expo-keep-awake:extractDeepLinksDebug
> Task :expo-keep-awake:processDebugManifest
> Task :expo-json-utils:processDebugManifest
> Task :expo-linear-gradient:extractDeepLinksDebug
> Task :expo-linking:extractDeepLinksDebug
> Task :expo-linear-gradient:processDebugManifest
> Task :expo-manifests:extractDeepLinksDebug
> Task :expo-linking:processDebugManifest
> Task :expo-media-library:extractDeepLinksDebug
> Task :expo-manifests:processDebugManifest
> Task :expo-media-library:processDebugManifest
> Task :expo-modules-core:extractDeepLinksDebug
> Task :expo-notifications:extractDeepLinksDebug
> Task :expo-modules-core:processDebugManifest
/home/expo/workingdir/build/node_modules/expo-modules-core/android/src/main/AndroidManifest.xml:8:9-11:45 Warning:
	meta-data#com.facebook.soloader.enabled@android:value was tagged at AndroidManifest.xml:8 to replace other declarations but no other declaration present
> Task :expo-notifications:processDebugManifest
> Task :expo-sharing:extractDeepLinksDebug
> Task :expo-splash-screen:extractDeepLinksDebug
> Task :expo-splash-screen:processDebugManifest
> Task :expo-sharing:processDebugManifest
> Task :expo-system-ui:extractDeepLinksDebug
> Task :expo-task-manager:extractDeepLinksDebug
> Task :expo-system-ui:processDebugManifest
> Task :expo-task-manager:processDebugManifest
> Task :expo-updates-interface:extractDeepLinksDebug
> Task :lottie-react-native:extractDeepLinksDebug
> Task :expo-updates-interface:processDebugManifest
> Task :lottie-react-native:processDebugManifest
> Task :notifee_react-native:extractDeepLinksDebug
> Task :react-native-async-storage_async-storage:extractDeepLinksDebug
> Task :notifee_react-native:processDebugManifest
package="io.invertase.notifee" found in source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@notifee/react-native/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="io.invertase.notifee" from the source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@notifee/react-native/android/src/main/AndroidManifest.xml.
> Task :react-native-community_datetimepicker:extractDeepLinksDebug
> Task :react-native-async-storage_async-storage:processDebugManifest
package="com.reactnativecommunity.asyncstorage" found in source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-async-storage/async-storage/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="com.reactnativecommunity.asyncstorage" from the source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-async-storage/async-storage/android/src/main/AndroidManifest.xml.
> Task :react-native-community_netinfo:extractDeepLinksDebug
> Task :react-native-community_datetimepicker:processDebugManifest
> Task :react-native-community_slider:extractDeepLinksDebug
> Task :react-native-community_netinfo:processDebugManifest
package="com.reactnativecommunity.netinfo" found in source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-community/netinfo/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="com.reactnativecommunity.netinfo" from the source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-community/netinfo/android/src/main/AndroidManifest.xml.
> Task :react-native-community_slider:processDebugManifest
package="com.reactnativecommunity.slider" found in source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-community/slider/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="com.reactnativecommunity.slider" from the source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-community/slider/android/src/main/AndroidManifest.xml.
> Task :react-native-firebase_app:extractDeepLinksDebug
> Task :react-native-firebase_auth:extractDeepLinksDebug
> Task :react-native-firebase_auth:processDebugManifest
package="io.invertase.firebase.auth" found in source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-firebase/auth/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="io.invertase.firebase.auth" from the source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-firebase/auth/android/src/main/AndroidManifest.xml.
> Task :react-native-firebase_app:processDebugManifest
package="io.invertase.firebase" found in source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-firebase/app/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="io.invertase.firebase" from the source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-firebase/app/android/src/main/AndroidManifest.xml.
> Task :react-native-firebase_messaging:extractDeepLinksDebug
> Task :react-native-firebase_firestore:extractDeepLinksDebug
> Task :react-native-firebase_firestore:processDebugManifest
package="io.invertase.firebase.firestore" found in source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-firebase/firestore/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="io.invertase.firebase.firestore" from the source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-firebase/firestore/android/src/main/AndroidManifest.xml.
> Task :react-native-firebase_storage:extractDeepLinksDebug
> Task :react-native-firebase_messaging:processDebugManifest
package="io.invertase.firebase.messaging" found in source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-firebase/messaging/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="io.invertase.firebase.messaging" from the source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-firebase/messaging/android/src/main/AndroidManifest.xml.
> Task :react-native-gesture-handler:extractDeepLinksDebug
> Task :react-native-gesture-handler:processDebugManifest
> Task :react-native-firebase_storage:processDebugManifest
package="io.invertase.firebase.storage" found in source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-firebase/storage/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="io.invertase.firebase.storage" from the source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-firebase/storage/android/src/main/AndroidManifest.xml.
> Task :react-native-picker_picker:extractDeepLinksDebug
> Task :react-native-reanimated:extractDeepLinksDebug
> Task :react-native-picker_picker:processDebugManifest
package="com.reactnativecommunity.picker" found in source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-picker/picker/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="com.reactnativecommunity.picker" from the source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@react-native-picker/picker/android/src/main/AndroidManifest.xml.
> Task :react-native-safe-area-context:extractDeepLinksDebug
> Task :react-native-reanimated:processDebugManifest
> Task :react-native-screens:extractDeepLinksDebug
> Task :react-native-safe-area-context:processDebugManifest
package="com.th3rdwave.safeareacontext" found in source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/react-native-safe-area-context/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="com.th3rdwave.safeareacontext" from the source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/react-native-safe-area-context/android/src/main/AndroidManifest.xml.
> Task :react-native-svg:extractDeepLinksDebug
> Task :react-native-screens:processDebugManifest
package="com.swmansion.rnscreens" found in source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="com.swmansion.rnscreens" from the source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/AndroidManifest.xml.
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
> Task :react-native-vision-camera:processDebugManifest
> Task :react-native-wheel-pick:extractDeepLinksDebug
> Task :shopify_react-native-skia:extractDeepLinksDebug
> Task :react-native-wheel-pick:processDebugManifest
> Task :unimodules-app-loader:extractDeepLinksDebug
> Task :unimodules-app-loader:processDebugManifest
> Task :shopify_react-native-skia:processDebugManifest
package="com.shopify.reactnative.skia" found in source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@shopify/react-native-skia/android/src/main/AndroidManifest.xml.
Setting the namespace via the package attribute in the source AndroidManifest.xml is no longer supported, and the value is ignored.
Recommendation: remove package="com.shopify.reactnative.skia" from the source AndroidManifest.xml: /home/expo/workingdir/build/node_modules/@shopify/react-native-skia/android/src/main/AndroidManifest.xml.
> Task :expo-application:compileDebugLibraryResources
> Task :expo:compileDebugLibraryResources
> Task :expo-application:parseDebugLocalResources
> Task :expo:parseDebugLocalResources
> Task :expo-application:generateDebugRFile
> Task :expo:generateDebugRFile
> Task :expo-background-fetch:compileDebugLibraryResources
> Task :expo-asset:compileDebugLibraryResources
> Task :expo-background-fetch:parseDebugLocalResources
> Task :expo-asset:parseDebugLocalResources
> Task :expo-background-fetch:generateDebugRFile
> Task :expo-asset:generateDebugRFile
> Task :expo-camera:compileDebugLibraryResources
> Task :expo-blur:compileDebugLibraryResources
> Task :expo-camera:parseDebugLocalResources
> Task :expo-blur:parseDebugLocalResources
> Task :expo-blur:generateDebugRFile
> Task :expo-camera:generateDebugRFile
> Task :expo-dev-client:compileDebugLibraryResources
> Task :expo-constants:compileDebugLibraryResources
> Task :expo-constants:parseDebugLocalResources
> Task :expo-dev-client:parseDebugLocalResources
> Task :expo-dev-client:generateDebugRFile
> Task :expo-constants:generateDebugRFile
> Task :expo-dev-menu:compileDebugLibraryResources
> Task :expo-dev-launcher:compileDebugLibraryResources
> Task :expo-dev-menu:parseDebugLocalResources
> Task :expo-dev-launcher:parseDebugLocalResources
> Task :expo-dev-launcher:generateDebugRFile
> Task :expo-dev-menu:generateDebugRFile
> Task :expo-dev-menu-interface:compileDebugLibraryResources
> Task :expo-file-system:compileDebugLibraryResources
> Task :expo-dev-menu-interface:parseDebugLocalResources
> Task :expo-file-system:parseDebugLocalResources
> Task :expo-dev-menu-interface:generateDebugRFile
> Task :expo-file-system:generateDebugRFile
> Task :expo-font:compileDebugLibraryResources
> Task :expo-json-utils:compileDebugLibraryResources
> Task :expo-font:parseDebugLocalResources
> Task :expo-json-utils:parseDebugLocalResources
> Task :expo-font:generateDebugRFile
> Task :expo-json-utils:generateDebugRFile
> Task :expo-keep-awake:compileDebugLibraryResources
> Task :expo-linear-gradient:compileDebugLibraryResources
> Task :expo-keep-awake:parseDebugLocalResources
> Task :expo-linear-gradient:parseDebugLocalResources
> Task :expo-keep-awake:generateDebugRFile
> Task :expo-linking:compileDebugLibraryResources
> Task :expo-linear-gradient:generateDebugRFile
> Task :expo-linking:parseDebugLocalResources
> Task :expo-manifests:compileDebugLibraryResources
> Task :expo-linking:generateDebugRFile
> Task :expo-manifests:parseDebugLocalResources
> Task :expo-media-library:compileDebugLibraryResources
> Task :expo-manifests:generateDebugRFile
> Task :expo-media-library:parseDebugLocalResources
> Task :expo-modules-core:compileDebugLibraryResources
> Task :expo-media-library:generateDebugRFile
> Task :expo-modules-core:parseDebugLocalResources
> Task :expo-notifications:compileDebugLibraryResources
> Task :expo-notifications:parseDebugLocalResources
> Task :expo-modules-core:generateDebugRFile
> Task :expo-notifications:generateDebugRFile
> Task :expo-sharing:compileDebugLibraryResources
> Task :expo-splash-screen:compileDebugLibraryResources
> Task :expo-sharing:parseDebugLocalResources
> Task :expo-splash-screen:parseDebugLocalResources
> Task :expo-sharing:generateDebugRFile
> Task :expo-system-ui:compileDebugLibraryResources
> Task :expo-splash-screen:generateDebugRFile
> Task :expo-task-manager:compileDebugLibraryResources
> Task :expo-task-manager:parseDebugLocalResources
> Task :expo-system-ui:parseDebugLocalResources
> Task :expo-task-manager:generateDebugRFile
> Task :expo-system-ui:generateDebugRFile
> Task :expo-updates-interface:compileDebugLibraryResources
> Task :lottie-react-native:compileDebugLibraryResources
> Task :expo-updates-interface:parseDebugLocalResources
> Task :lottie-react-native:parseDebugLocalResources
> Task :expo-updates-interface:generateDebugRFile
> Task :lottie-react-native:generateDebugRFile
> Task :notifee_react-native:compileDebugLibraryResources
> Task :react-native-async-storage_async-storage:compileDebugLibraryResources
> Task :react-native-async-storage_async-storage:parseDebugLocalResources
> Task :notifee_react-native:parseDebugLocalResources
> Task :notifee_react-native:generateDebugRFile
> Task :react-native-async-storage_async-storage:generateDebugRFile
> Task :react-native-community_netinfo:compileDebugLibraryResources
> Task :react-native-community_datetimepicker:compileDebugLibraryResources
> Task :react-native-community_netinfo:parseDebugLocalResources
> Task :react-native-community_datetimepicker:parseDebugLocalResources
> Task :react-native-community_netinfo:generateDebugRFile
> Task :react-native-community_datetimepicker:generateDebugRFile
> Task :react-native-community_slider:compileDebugLibraryResources
> Task :react-native-firebase_app:compileDebugLibraryResources
> Task :react-native-community_slider:parseDebugLocalResources
> Task :react-native-firebase_app:parseDebugLocalResources
> Task :react-native-community_slider:generateDebugRFile
> Task :react-native-firebase_app:generateDebugRFile
> Task :react-native-firebase_firestore:compileDebugLibraryResources
> Task :react-native-firebase_auth:compileDebugLibraryResources
> Task :react-native-firebase_firestore:parseDebugLocalResources
> Task :react-native-firebase_auth:parseDebugLocalResources
> Task :react-native-firebase_firestore:generateDebugRFile
> Task :react-native-firebase_auth:generateDebugRFile
> Task :react-native-firebase_storage:compileDebugLibraryResources
> Task :react-native-firebase_messaging:compileDebugLibraryResources
> Task :react-native-firebase_storage:parseDebugLocalResources
> Task :react-native-firebase_messaging:parseDebugLocalResources
> Task :react-native-firebase_storage:generateDebugRFile
> Task :react-native-gesture-handler:compileDebugLibraryResources
> Task :react-native-gesture-handler:parseDebugLocalResources
> Task :react-native-firebase_messaging:generateDebugRFile
> Task :react-native-gesture-handler:generateDebugRFile
> Task :react-native-picker_picker:compileDebugLibraryResources
> Task :react-native-picker_picker:parseDebugLocalResources
> Task :react-native-reanimated:compileDebugLibraryResources
> Task :react-native-reanimated:parseDebugLocalResources
> Task :react-native-picker_picker:generateDebugRFile
> Task :react-native-safe-area-context:compileDebugLibraryResources
> Task :react-native-reanimated:generateDebugRFile
> Task :react-native-safe-area-context:parseDebugLocalResources
> Task :react-native-safe-area-context:generateDebugRFile
> Task :react-native-screens:parseDebugLocalResources
> Task :react-native-screens:compileDebugLibraryResources
> Task :react-native-svg:compileDebugLibraryResources
> Task :react-native-screens:generateDebugRFile
> Task :react-native-svg:parseDebugLocalResources
> Task :react-native-vector-icons:compileDebugLibraryResources
> Task :react-native-svg:generateDebugRFile
> Task :react-native-vision-camera:compileDebugLibraryResources
> Task :react-native-vector-icons:parseDebugLocalResources
> Task :react-native-vision-camera:parseDebugLocalResources
> Task :react-native-vision-camera:generateDebugRFile
> Task :react-native-vector-icons:generateDebugRFile
> Task :react-native-wheel-pick:compileDebugLibraryResources
> Task :shopify_react-native-skia:compileDebugLibraryResources
> Task :shopify_react-native-skia:parseDebugLocalResources
> Task :shopify_react-native-skia:generateDebugRFile
> Task :unimodules-app-loader:compileDebugLibraryResources
> Task :unimodules-app-loader:parseDebugLocalResources
> Task :unimodules-app-loader:generateDebugRFile
> Task :expo:checkKotlinGradlePluginConfigurationErrors
> Task :expo:generateDebugBuildConfig
> Task :expo-application:checkKotlinGradlePluginConfigurationErrors
> Task :expo-application:generateDebugBuildConfig
> Task :expo-modules-core:checkKotlinGradlePluginConfigurationErrors
> Task :expo-modules-core:generateDebugBuildConfig
> Task :react-native-wheel-pick:parseDebugLocalResources
> Task :react-native-wheel-pick:generateDebugRFile
> Task :expo-application:javaPreCompileDebug
> Task :expo-asset:checkKotlinGradlePluginConfigurationErrors
> Task :expo-asset:generateDebugBuildConfig
> Task :expo-asset:javaPreCompileDebug
> Task :expo-background-fetch:checkKotlinGradlePluginConfigurationErrors
> Task :expo-background-fetch:generateDebugBuildConfig
> Task :expo-background-fetch:javaPreCompileDebug
> Task :expo-blur:checkKotlinGradlePluginConfigurationErrors
> Task :expo-blur:generateDebugBuildConfig
> Task :expo-blur:javaPreCompileDebug
> Task :expo-camera:checkKotlinGradlePluginConfigurationErrors
> Task :expo-camera:generateDebugBuildConfig
> Task :expo-camera:javaPreCompileDebug
> Task :expo-constants:checkKotlinGradlePluginConfigurationErrors
> Task :expo-constants:generateDebugBuildConfig
> Task :expo-constants:javaPreCompileDebug
> Task :expo-dev-client:checkKotlinGradlePluginConfigurationErrors
> Task :expo-modules-core:javaPreCompileDebug
> Task :expo-dev-launcher:checkKotlinGradlePluginConfigurationErrors
> Task :app:generateAutolinkingPackageList
> Task :app:generateCodegenSchemaFromJavaScript SKIPPED
> Task :app:generateCodegenArtifactsFromSchema SKIPPED
> Task :app:preBuild
> Task :app:preDebugBuild
> Task :app:mergeDebugNativeDebugMetadata NO-SOURCE
> Task :app:checkKotlinGradlePluginConfigurationErrors
> Task :app:generateDebugBuildConfig
> Task :expo-dev-client:dataBindingMergeDependencyArtifactsDebug
> Task :expo-dev-client:dataBindingGenBaseClassesDebug
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
> Task :expo-dev-launcher:dataBindingMergeDependencyArtifactsDebug
> Task :expo-updates-interface:checkKotlinGradlePluginConfigurationErrors
> Task :expo-dev-launcher:generateDebugBuildConfig
> Task :expo-updates-interface:generateDebugBuildConfig
> Task :app:generateDebugResValues
> Task :app:checkDebugAarMetadata
> Task :app:processDebugGoogleServices
> Task :expo-updates-interface:javaPreCompileDebug
> Task :expo-file-system:checkKotlinGradlePluginConfigurationErrors
> Task :expo-file-system:generateDebugBuildConfig
> Task :expo-file-system:javaPreCompileDebug
> Task :expo-font:checkKotlinGradlePluginConfigurationErrors
> Task :expo-font:generateDebugBuildConfig
> Task :expo-font:javaPreCompileDebug
> Task :expo-keep-awake:checkKotlinGradlePluginConfigurationErrors
> Task :expo-keep-awake:generateDebugBuildConfig
> Task :expo-keep-awake:javaPreCompileDebug
> Task :expo-linear-gradient:checkKotlinGradlePluginConfigurationErrors
> Task :app:mapDebugSourceSetPaths
> Task :expo-linear-gradient:generateDebugBuildConfig
> Task :app:generateDebugResources
> Task :expo-linear-gradient:javaPreCompileDebug
> Task :expo-linking:checkKotlinGradlePluginConfigurationErrors
> Task :expo-linking:generateDebugBuildConfig
> Task :expo-linking:javaPreCompileDebug
> Task :expo-media-library:checkKotlinGradlePluginConfigurationErrors
> Task :expo-media-library:generateDebugBuildConfig
> Task :expo-media-library:javaPreCompileDebug
> Task :expo-notifications:checkKotlinGradlePluginConfigurationErrors
> Task :expo-notifications:generateDebugBuildConfig
> Task :expo-notifications:javaPreCompileDebug
> Task :expo-sharing:checkKotlinGradlePluginConfigurationErrors
> Task :expo-sharing:generateDebugBuildConfig
> Task :expo-sharing:javaPreCompileDebug
> Task :expo-splash-screen:checkKotlinGradlePluginConfigurationErrors
> Task :expo-splash-screen:generateDebugBuildConfig
> Task :expo-splash-screen:javaPreCompileDebug
> Task :expo-system-ui:checkKotlinGradlePluginConfigurationErrors
> Task :expo-system-ui:generateDebugBuildConfig
> Task :expo-dev-launcher:dataBindingGenBaseClassesDebug
> Task :expo-system-ui:javaPreCompileDebug
> Task :expo-task-manager:checkKotlinGradlePluginConfigurationErrors
> Task :expo-dev-launcher:javaPreCompileDebug
> Task :unimodules-app-loader:checkKotlinGradlePluginConfigurationErrors
> Task :expo-task-manager:generateDebugBuildConfig
> Task :unimodules-app-loader:generateDebugBuildConfig
> Task :expo-task-manager:javaPreCompileDebug
> Task :unimodules-app-loader:javaPreCompileDebug
> Task :lottie-react-native:checkKotlinGradlePluginConfigurationErrors
> Task :expo:javaPreCompileDebug
> Task :notifee_react-native:generateDebugBuildConfig
> Task :lottie-react-native:generateDebugBuildConfig
> Task :notifee_react-native:javaPreCompileDebug
> Task :app:mergeDebugResources
> Task :app:packageDebugResources
> Task :app:parseDebugLocalResources
> Task :app:createDebugCompatibleScreenManifests
> Task :app:extractDeepLinksDebug
> Task :app:processDebugMainManifest
/home/expo/workingdir/build/android/app/src/debug/AndroidManifest.xml:6:5-162 Warning:
application@android:usesCleartextTraffic was tagged at AndroidManifest.xml:6 to replace other declarations but no other declaration present
/home/expo/workingdir/build/android/app/src/debug/AndroidManifest.xml Warning:
	provider#expo.modules.filesystem.FileSystemFileProvider@android:authorities was tagged at AndroidManifest.xml:0 to replace other declarations but no other declaration present
> Task :app:processDebugManifest
> Task :app:processDebugManifestForPackage
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
> Task :lottie-react-native:javaPreCompileDebug
> Task :notifee_react-native:compileDebugJavaWithJavac
/home/expo/workingdir/build/node_modules/@notifee/react-native/android/src/main/java/io/invertase/notifee/NotifeeApiModule.java:42: warning: [removal] onCatalystInstanceDestroy() in NativeModule has been deprecated and marked for removal
  public void onCatalystInstanceDestroy() {
              ^
Note: /home/expo/workingdir/build/node_modules/@notifee/react-native/android/src/main/java/io/invertase/notifee/NotifeeReactUtils.java uses or overrides a deprecated API.
Note: Recompile with -Xlint:deprecation for details.
1 warning
> Task :app:processDebugResources
> Task :react-native-async-storage_async-storage:generateDebugBuildConfig
> Task :expo-modules-core:compileDebugKotlin
> Task :react-native-async-storage_async-storage:javaPreCompileDebug
> Task :lottie-react-native:compileDebugJavaWithJavac
> Task :notifee_react-native:bundleLibCompileToJarDebug
> Task :react-native-community_datetimepicker:generateDebugBuildConfig
> Task :lottie-react-native:bundleLibCompileToJarDebug
> Task :react-native-community_netinfo:generateDebugBuildConfig
> Task :react-native-community_datetimepicker:javaPreCompileDebug
> Task :react-native-community_netinfo:javaPreCompileDebug
> Task :react-native-async-storage_async-storage:compileDebugJavaWithJavac
> Task :react-native-async-storage_async-storage:bundleLibCompileToJarDebug
> Task :react-native-community_slider:generateDebugBuildConfig
> Task :react-native-community_slider:javaPreCompileDebug
/home/expo/workingdir/build/node_modules/@react-native-async-storage/async-storage/android/src/main/java/com/reactnativecommunity/asyncstorage/AsyncStorageModule.java:84: warning: [removal] onCatalystInstanceDestroy() in NativeModule has been deprecated and marked for removal
  public void onCatalystInstanceDestroy() {
              ^
Note: Some input files use or override a deprecated API.
Note: Recompile with -Xlint:deprecation for details.
Note: /home/expo/workingdir/build/node_modules/@react-native-async-storage/async-storage/android/src/javaPackage/java/com/reactnativecommunity/asyncstorage/AsyncStoragePackage.java uses unchecked or unsafe operations.
Note: Recompile with -Xlint:unchecked for details.
1 warning
> Task :react-native-community_netinfo:compileDebugJavaWithJavac
> Task :react-native-community_netinfo:bundleLibCompileToJarDebug
/home/expo/workingdir/build/node_modules/@react-native-community/netinfo/android/src/main/java/com/reactnativecommunity/netinfo/NetInfoModule.java:47: warning: [removal] onCatalystInstanceDestroy() in NativeModule has been deprecated and marked for removal
    public void onCatalystInstanceDestroy() {
                ^
Note: Some input files use or override a deprecated API.
Note: Recompile with -Xlint:deprecation for details.
1 warning
> Task :react-native-firebase_app:generateDebugBuildConfig
> Task :react-native-firebase_app:javaPreCompileDebug
> Task :react-native-community_datetimepicker:compileDebugJavaWithJavac
> Task :react-native-community_datetimepicker:bundleLibCompileToJarDebug
> Task :react-native-community_slider:compileDebugJavaWithJavac
> Task :react-native-firebase_auth:generateDebugBuildConfig
> Task :react-native-community_slider:bundleLibCompileToJarDebug
> Task :react-native-firebase_auth:javaPreCompileDebug
> Task :react-native-firebase_firestore:generateDebugBuildConfig
> Task :react-native-firebase_messaging:generateDebugBuildConfig
> Task :react-native-firebase_firestore:javaPreCompileDebug
> Task :react-native-firebase_messaging:javaPreCompileDebug
> Task :react-native-gesture-handler:checkKotlinGradlePluginConfigurationErrors
> Task :react-native-firebase_storage:generateDebugBuildConfig
> Task :react-native-gesture-handler:generateDebugBuildConfig
Note: Some input files use or override a deprecated API.
Note: Recompile with -Xlint:deprecation for details.
Note: Some input files use or override a deprecated API.
Note: Recompile with -Xlint:deprecation for details.
Note: /home/expo/workingdir/build/node_modules/@react-native-community/slider/android/src/oldarch/java/com/reactnativecommunity/slider/ReactSliderManager.java uses unchecked or unsafe operations.
Note: Recompile with -Xlint:unchecked for details.
> Task :react-native-reanimated:generateDebugBuildConfig
> Task :react-native-firebase_storage:javaPreCompileDebug
> Task :react-native-reanimated:packageNdkLibs NO-SOURCE
> Task :react-native-gesture-handler:javaPreCompileDebug
> Task :react-native-reanimated:javaPreCompileDebug
> Task :react-native-picker_picker:generateDebugBuildConfig
> Task :react-native-picker_picker:javaPreCompileDebug
> Task :react-native-picker_picker:compileDebugJavaWithJavac
> Task :react-native-picker_picker:bundleLibCompileToJarDebug
> Task :react-native-safe-area-context:checkKotlinGradlePluginConfigurationErrors
> Task :react-native-safe-area-context:generateDebugBuildConfig
Note: Some input files use or override a deprecated API.
Note: Recompile with -Xlint:deprecation for details.
> Task :react-native-firebase_app:compileDebugJavaWithJavac
/home/expo/workingdir/build/node_modules/@react-native-firebase/app/android/src/reactnative/java/io/invertase/firebase/common/ReactNativeFirebaseModule.java:97: warning: [removal] onCatalystInstanceDestroy() in NativeModule has been deprecated and marked for removal
  public void onCatalystInstanceDestroy() {
              ^
Note: Some input files use or override a deprecated API.
Note: Recompile with -Xlint:deprecation for details.
1 warning
> Task :react-native-firebase_app:bundleLibCompileToJarDebug
> Task :react-native-reanimated:compileDebugJavaWithJavac
Note: Some input files use or override a deprecated API.
Note: Recompile with -Xlint:deprecation for details.
Note: Some input files use unchecked or unsafe operations.
Note: Recompile with -Xlint:unchecked for details.
> Task :react-native-firebase_auth:compileDebugJavaWithJavac
Note: /home/expo/workingdir/build/node_modules/@react-native-firebase/auth/android/src/main/java/io/invertase/firebase/auth/ReactNativeFirebaseAuthModule.java uses or overrides a deprecated API.
Note: Recompile with -Xlint:deprecation for details.
Note: /home/expo/workingdir/build/node_modules/@react-native-firebase/auth/android/src/main/java/io/invertase/firebase/auth/ReactNativeFirebaseAuthModule.java uses unchecked or unsafe operations.
Note: Recompile with -Xlint:unchecked for details.
> Task :react-native-firebase_auth:bundleLibCompileToJarDebug
> Task :react-native-firebase_firestore:compileDebugJavaWithJavac
Note: Some input files use or override a deprecated API.
Note: Recompile with -Xlint:deprecation for details.
Note: Some input files use unchecked or unsafe operations.
Note: Recompile with -Xlint:unchecked for details.
> Task :react-native-firebase_firestore:bundleLibCompileToJarDebug
> Task :react-native-safe-area-context:compileDebugKotlin
w: file:///home/expo/workingdir/build/node_modules/react-native-safe-area-context/android/src/main/java/com/th3rdwave/safeareacontext/SafeAreaContextPackage.kt:27:11 'constructor ReactModuleInfo(String, String, Boolean, Boolean, Boolean, Boolean, Boolean)' is deprecated. use ReactModuleInfo(String, String, boolean, boolean, boolean, boolean)]
w: file:///home/expo/workingdir/build/node_modules/react-native-safe-area-context/android/src/main/java/com/th3rdwave/safeareacontext/SafeAreaContextPackage.kt:33:27 'getter for hasConstants: Boolean' is deprecated. This property is unused and it's planning to be removed in a future version of
        React Native. Please refrain from using it.
w: file:///home/expo/workingdir/build/node_modules/react-native-safe-area-context/android/src/main/java/com/th3rdwave/safeareacontext/SafeAreaView.kt:59:23 'getter for uiImplementation: UIImplementation!' is deprecated. Deprecated in Java
> Task :react-native-reanimated:bundleLibCompileToJarDebug
> Task :react-native-firebase_storage:compileDebugJavaWithJavac
> Task :react-native-firebase_storage:bundleLibCompileToJarDebug
> Task :react-native-firebase_messaging:compileDebugJavaWithJavac
> Task :react-native-safe-area-context:javaPreCompileDebug
> Task :react-native-firebase_messaging:bundleLibCompileToJarDebug
> Task :react-native-screens:checkKotlinGradlePluginConfigurationErrors
> Task :react-native-screens:generateDebugBuildConfig
Note: Some input files use or override a deprecated API.
Note: Recompile with -Xlint:deprecation for details.
> Task :react-native-safe-area-context:compileDebugJavaWithJavac
> Task :react-native-safe-area-context:bundleLibCompileToJarDebug
> Task :react-native-svg:generateDebugBuildConfig
Note: /home/expo/workingdir/build/node_modules/react-native-safe-area-context/android/src/paper/java/com/th3rdwave/safeareacontext/NativeSafeAreaContextSpec.java uses or overrides a deprecated API.
Note: Recompile with -Xlint:deprecation for details.
> Task :react-native-svg:javaPreCompileDebug
> Task :react-native-svg:compileDebugJavaWithJavac
/home/expo/workingdir/build/node_modules/react-native-svg/android/src/main/java/com/horcrux/svg/RenderableViewManager.java:388: warning: [removal] processTransform(ReadableArray,double[]) in TransformHelper has been deprecated and marked for removal
    TransformHelper.processTransform(transforms, sTransformDecompositionArray);
                   ^
Note: Some input files use or override a deprecated API.
Note: Recompile with -Xlint:deprecation for details.
Note: Some input files use unchecked or unsafe operations.
Note: Recompile with -Xlint:unchecked for details.
1 warning
> Task :react-native-screens:javaPreCompileDebug
> Task :react-native-svg:bundleLibCompileToJarDebug
> Task :react-native-vector-icons:generateDebugBuildConfig
> Task :react-native-vector-icons:javaPreCompileDebug
> Task :react-native-vector-icons:compileDebugJavaWithJavac
Note: Some input files use or override a deprecated API.
Note: Recompile with -Xlint:deprecation for details.
> Task :react-native-vector-icons:bundleLibCompileToJarDebug
> Task :react-native-vision-camera:checkKotlinGradlePluginConfigurationErrors
> Task :react-native-vision-camera:generateDebugBuildConfig
> Task :expo-modules-core:compileDebugJavaWithJavac
> Task :expo-modules-core:bundleLibCompileToJarDebug
> Task :react-native-gesture-handler:compileDebugKotlin
w: file:///home/expo/workingdir/build/node_modules/react-native-gesture-handler/android/src/main/java/com/swmansion/gesturehandler/RNGestureHandlerPackage.kt:69:42 'constructor ReactModuleInfo(String, String, Boolean, Boolean, Boolean, Boolean, Boolean)' is deprecated. use ReactModuleInfo(String, String, boolean, boolean, boolean, boolean)]
w: file:///home/expo/workingdir/build/node_modules/react-native-gesture-handler/android/src/main/java/com/swmansion/gesturehandler/core/FlingGestureHandler.kt:25:26 Parameter 'event' is never used
w: file:///home/expo/workingdir/build/node_modules/react-native-gesture-handler/android/src/main/java/com/swmansion/gesturehandler/react/RNGestureHandlerButtonViewManager.kt:72:62 The corresponding parameter in the supertype 'ViewGroupManager' is named 'borderRadius'. This may cause problems when calling this function with named arguments.
w: file:///home/expo/workingdir/build/node_modules/react-native-gesture-handler/android/src/main/java/com/swmansion/gesturehandler/react/RNGestureHandlerButtonViewManager.kt:77:63 The corresponding parameter in the supertype 'ViewGroupManager' is named 'borderRadius'. This may cause problems when calling this function with named arguments.
w: file:///home/expo/workingdir/build/node_modules/react-native-gesture-handler/android/src/main/java/com/swmansion/gesturehandler/react/RNGestureHandlerButtonViewManager.kt:82:65 The corresponding parameter in the supertype 'ViewGroupManager' is named 'borderRadius'. This may cause problems when calling this function with named arguments.
w: file:///home/expo/workingdir/build/node_modules/react-native-gesture-handler/android/src/main/java/com/swmansion/gesturehandler/react/RNGestureHandlerButtonViewManager.kt:87:66 The corresponding parameter in the supertype 'ViewGroupManager' is named 'borderRadius'. This may cause problems when calling this function with named arguments.
> Task :expo-application:compileDebugKotlin
> Task :expo-application:compileDebugJavaWithJavac
> Task :expo-application:bundleLibCompileToJarDebug
> Task :expo-asset:compileDebugKotlin
> Task :expo-asset:compileDebugJavaWithJavac
> Task :expo-asset:bundleLibCompileToJarDebug
> Task :expo-background-fetch:compileDebugKotlin
> Task :expo-background-fetch:compileDebugJavaWithJavac
> Task :expo-background-fetch:bundleLibCompileToJarDebug
> Task :expo-blur:compileDebugKotlin
> Task :expo-blur:compileDebugJavaWithJavac
> Task :expo-blur:bundleLibCompileToJarDebug
> Task :react-native-screens:compileDebugKotlin
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/CustomToolbar.kt:19:53 'FrameCallback' is deprecated. Use Choreographer.FrameCallback instead
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/CustomToolbar.kt:20:38 'FrameCallback' is deprecated. Use Choreographer.FrameCallback instead
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/RNScreensPackage.kt:64:17 'constructor ReactModuleInfo(String, String, Boolean, Boolean, Boolean, Boolean, Boolean)' is deprecated. use ReactModuleInfo(String, String, boolean, boolean, boolean, boolean)]
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/Screen.kt:45:77 Unchecked cast: CoordinatorLayout.Behavior<(raw) View!>? to BottomSheetBehavior<Screen>
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenContainer.kt:33:53 'FrameCallback' is deprecated. Use Choreographer.FrameCallback instead
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenContainer.kt:34:38 'FrameCallback' is deprecated. Use Choreographer.FrameCallback instead
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenFooter.kt:252:9 Parameter 'changed' is never used
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenFooter.kt:253:9 Parameter 'left' is never used
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenFooter.kt:254:9 Parameter 'top' is never used
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenFooter.kt:255:9 Parameter 'right' is never used
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenFooter.kt:256:9 Parameter 'bottom' is never used
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenStackFragment.kt:257:31 'setter for targetElevation: Float' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenStackFragment.kt:260:13 'setHasOptionsMenu(Boolean): Unit' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenStackFragment.kt:496:22 'onPrepareOptionsMenu(Menu): Unit' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenStackFragment.kt:504:22 'onCreateOptionsMenu(Menu, MenuInflater): Unit' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenStackHeaderConfig.kt:100:38 'getter for systemWindowInsetTop: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenStackHeaderConfigViewManager.kt:7:34 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenStackHeaderConfigViewManager.kt:209:9 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenStackHeaderConfigViewManager.kt:211:13 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenStackHeaderConfigViewManager.kt:213:13 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenViewManager.kt:7:34 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenViewManager.kt:375:48 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenViewManager.kt:376:49 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenViewManager.kt:377:45 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenViewManager.kt:378:52 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenViewManager.kt:379:48 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenViewManager.kt:380:51 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenViewManager.kt:381:56 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenViewManager.kt:382:57 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenViewManager.kt:383:51 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenWindowTraits.kt:55:42 'replaceSystemWindowInsets(Int, Int, Int, Int): WindowInsetsCompat' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenWindowTraits.kt:56:39 'getter for systemWindowInsetLeft: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenWindowTraits.kt:58:39 'getter for systemWindowInsetRight: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenWindowTraits.kt:59:39 'getter for systemWindowInsetBottom: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenWindowTraits.kt:98:53 'getter for statusBarColor: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenWindowTraits.kt:109:48 'getter for statusBarColor: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenWindowTraits.kt:112:32 'setter for statusBarColor: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenWindowTraits.kt:208:72 'getter for navigationBarColor: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/ScreenWindowTraits.kt:214:16 'setter for navigationBarColor: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/SearchBarManager.kt:5:34 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/SearchBarManager.kt:138:66 Elvis operator (?:) always returns the left operand of non-nullable type Boolean
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/SearchBarManager.kt:142:9 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/SearchBarManager.kt:144:13 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/SearchBarManager.kt:146:13 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/SearchBarManager.kt:148:13 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/SearchBarManager.kt:150:13 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/SearchBarManager.kt:152:13 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/SearchBarManager.kt:154:13 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/SearchBarView.kt:153:43 Parameter 'flag' is never used
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/bottomsheet/BottomSheetDialogRootView.kt:7:34 'ReactFeatureFlags' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens/bottomsheet/BottomSheetDialogRootView.kt:25:13 'ReactFeatureFlags' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/paper/java/com/swmansion/rnscreens/FabricEnabledHeaderConfigViewGroup.kt:17:25 Parameter 'wrapper' is never used
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/paper/java/com/swmansion/rnscreens/FabricEnabledViewGroup.kt:10:25 Parameter 'wrapper' is never used
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/paper/java/com/swmansion/rnscreens/FabricEnabledViewGroup.kt:13:9 Parameter 'width' is never used
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/paper/java/com/swmansion/rnscreens/FabricEnabledViewGroup.kt:14:9 Parameter 'height' is never used
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/paper/java/com/swmansion/rnscreens/FabricEnabledViewGroup.kt:15:9 Parameter 'headerHeight' is never used
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/paper/java/com/swmansion/rnscreens/NativeProxy.kt:7:36 Parameter 'fabricUIManager' is never used
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/paper/java/com/swmansion/rnscreens/NativeProxy.kt:11:13 Parameter 'tag' is never used
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/paper/java/com/swmansion/rnscreens/NativeProxy.kt:12:13 Parameter 'view' is never used
w: file:///home/expo/workingdir/build/node_modules/react-native-screens/android/src/paper/java/com/swmansion/rnscreens/NativeProxy.kt:15:33 Parameter 'tag' is never used
> Task :expo-dev-client:compileDebugKotlin
NO-SOURCE
> Task :expo-dev-client:compileDebugJavaWithJavac
> Task :expo-dev-client:bundleLibCompileToJarDebug
> Task :expo-constants:compileDebugKotlin
> Task :expo-constants:compileDebugJavaWithJavac
> Task :expo-constants:bundleLibCompileToJarDebug
> Task :expo-dev-menu-interface:compileDebugKotlin
> Task :expo-dev-menu-interface:compileDebugJavaWithJavac
> Task :expo-dev-menu-interface:bundleLibCompileToJarDebug
> Task :expo-json-utils:compileDebugKotlin
> Task :expo-json-utils:compileDebugJavaWithJavac
> Task :expo-json-utils:bundleLibCompileToJarDebug
> Task :expo-updates-interface:compileDebugKotlin
> Task :expo-updates-interface:compileDebugJavaWithJavac
> Task :expo-updates-interface:bundleLibCompileToJarDebug
> Task :react-native-vision-camera:compileDebugKotlin
w: file:///home/expo/workingdir/build/node_modules/react-native-vision-camera/android/src/main/java/com/mrousavy/camera/core/MetadataProvider.kt:44:25 'requestSingleUpdate(String, LocationListener, Looper?): Unit' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-vision-camera/android/src/main/java/com/mrousavy/camera/core/utils/CamcorderProfileUtils.kt:71:42 'get(Int, Int): CamcorderProfile!' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-vision-camera/android/src/main/java/com/mrousavy/camera/core/utils/CamcorderProfileUtils.kt:96:42 'get(Int, Int): CamcorderProfile!' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-vision-camera/android/src/main/java/com/mrousavy/camera/core/utils/CamcorderProfileUtils.kt:121:42 'get(Int, Int): CamcorderProfile!' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-vision-camera/android/src/main/java/com/mrousavy/camera/frameprocessors/VisionCameraProxy.kt:33:56 'getter for jsCallInvokerHolder: CallInvokerHolder' is deprecated. Use ReactContext.getJSCallInvokerHolder instead
w: file:///home/expo/workingdir/build/node_modules/react-native-vision-camera/android/src/main/java/com/mrousavy/camera/react/CameraViewManager.kt:4:34 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-vision-camera/android/src/main/java/com/mrousavy/camera/react/CameraViewManager.kt:31:5 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-vision-camera/android/src/main/java/com/mrousavy/camera/react/CameraViewManager.kt:32:45 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-vision-camera/android/src/main/java/com/mrousavy/camera/react/CameraViewManager.kt:33:47 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-vision-camera/android/src/main/java/com/mrousavy/camera/react/CameraViewManager.kt:34:43 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-vision-camera/android/src/main/java/com/mrousavy/camera/react/CameraViewManager.kt:35:43 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-vision-camera/android/src/main/java/com/mrousavy/camera/react/CameraViewManager.kt:36:43 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-vision-camera/android/src/main/java/com/mrousavy/camera/react/CameraViewManager.kt:37:41 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-vision-camera/android/src/main/java/com/mrousavy/camera/react/CameraViewManager.kt:38:47 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-vision-camera/android/src/main/java/com/mrousavy/camera/react/CameraViewManager.kt:39:50 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-vision-camera/android/src/main/java/com/mrousavy/camera/react/CameraViewManager.kt:40:50 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-vision-camera/android/src/main/java/com/mrousavy/camera/react/CameraViewManager.kt:41:60 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-vision-camera/android/src/main/java/com/mrousavy/camera/react/CameraViewManager.kt:42:61 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/react-native-vision-camera/android/src/main/java/com/mrousavy/camera/react/CameraViewManager.kt:43:47 'MapBuilder' is deprecated. Deprecated in Java
> Task :expo-manifests:compileDebugKotlin
w: file:///home/expo/workingdir/build/node_modules/expo-manifests/android/src/main/java/expo/modules/manifests/core/EmbeddedManifest.kt:19:16 This declaration overrides deprecated member but not marked as deprecated itself. Please add @Deprecated annotation or suppress. See https://youtrack.jetbrains.com/issue/KT-47902 for details
w: file:///home/expo/workingdir/build/node_modules/expo-manifests/android/src/main/java/expo/modules/manifests/core/EmbeddedManifest.kt:19:86 'getLegacyID(): String' is deprecated. Prefer scopeKey or projectId depending on use case
w: file:///home/expo/workingdir/build/node_modules/expo-manifests/android/src/main/java/expo/modules/manifests/core/ExpoUpdatesManifest.kt:16:16 This declaration overrides deprecated member but not marked as deprecated itself. Please add @Deprecated annotation or suppress. See https://youtrack.jetbrains.com/issue/KT-47902 for details
w: file:///home/expo/workingdir/build/node_modules/expo-manifests/android/src/main/java/expo/modules/manifests/core/Manifest.kt:15:12 'getRawJson(): JSONObject' is deprecated. Prefer to use specific field getters
> Task :expo-manifests:compileDebugJavaWithJavac
> Task :expo-manifests:bundleLibCompileToJarDebug
> Task :expo-font:compileDebugKotlin
> Task :expo-font:compileDebugJavaWithJavac
> Task :expo-font:bundleLibCompileToJarDebug
> Task :expo-keep-awake:compileDebugKotlin
> Task :expo-keep-awake:compileDebugJavaWithJavac
> Task :expo-keep-awake:bundleLibCompileToJarDebug
> Task :expo-camera:compileDebugKotlin
w: file:///home/expo/workingdir/build/node_modules/expo-camera/android/src/main/java/expo/modules/camera/ExpoCameraView.kt:605:73 'getter for defaultDisplay: Display!' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-camera/android/src/main/java/expo/modules/camera/tasks/ResolveTakenPicture.kt:146:32 Type mismatch: inferred type is String? but String was expected
w: file:///home/expo/workingdir/build/node_modules/expo-camera/android/src/main/java/expo/modules/camera/utils/ExifTags.kt:71:32 'TAG_ISO_SPEED_RATINGS: String' is deprecated. Deprecated in Java
> Task :expo-linear-gradient:compileDebugKotlin
> Task :expo-linear-gradient:compileDebugJavaWithJavac
> Task :expo-linear-gradient:bundleLibCompileToJarDebug
> Task :expo-camera:compileDebugJavaWithJavac
> Task :expo-camera:bundleLibCompileToJarDebug
> Task :expo-linking:compileDebugKotlin
> Task :expo-linking:compileDebugJavaWithJavac
> Task :expo-linking:bundleLibCompileToJarDebug
> Task :expo-file-system:compileDebugKotlin
> Task :expo-file-system:compileDebugJavaWithJavac
> Task :expo-file-system:bundleLibCompileToJarDebug
> Task :expo-sharing:compileDebugKotlin
> Task :expo-sharing:compileDebugJavaWithJavac
> Task :expo-sharing:bundleLibCompileToJarDebug
> Task :expo-splash-screen:compileDebugKotlin
> Task :expo-splash-screen:compileDebugJavaWithJavac
> Task :expo-splash-screen:bundleLibCompileToJarDebug
> Task :expo-dev-menu:compileDebugKotlin
w: file:///home/expo/workingdir/build/node_modules/expo-dev-menu/android/src/debug/java/expo/modules/devmenu/DevMenuManager.kt:18:38 'ReactFontManager' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-menu/android/src/debug/java/expo/modules/devmenu/DevMenuManager.kt:205:7 'ReactFontManager' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-menu/android/src/debug/java/expo/modules/devmenu/DevMenuManager.kt:429:43 The corresponding parameter in the supertype 'DevMenuManagerInterface' is named 'shouldAutoLaunch'. This may cause problems when calling this function with named arguments.
w: file:///home/expo/workingdir/build/node_modules/expo-dev-menu/android/src/main/java/com/facebook/react/devsupport/DevMenuSettingsBase.kt:6:27 'PreferenceManager' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-menu/android/src/main/java/com/facebook/react/devsupport/DevMenuSettingsBase.kt:18:51 'PreferenceManager' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-menu/android/src/main/java/com/facebook/react/devsupport/DevMenuSettingsBase.kt:18:69 'getDefaultSharedPreferences(Context!): SharedPreferences!' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-menu/android/src/main/java/com/facebook/react/devsupport/DevMenuSettingsBase.kt:56:16 This declaration overrides deprecated member but not marked as deprecated itself. Please add @Deprecated annotation or suppress. See https://youtrack.jetbrains.com/issue/KT-47902 for details
w: file:///home/expo/workingdir/build/node_modules/expo-dev-menu/android/src/main/java/expo/modules/devmenu/fab/MovableFloatingActionButton.kt:173:17 'computeBounds(RectF, Boolean): Unit' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-menu/android/src/main/java/expo/modules/devmenu/helpers/DevMenuOkHttpExtension.kt:58:19 'create(MediaType?, String): RequestBody' is deprecated. Moved to extension function. Put the 'content' argument first to fix Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-menu/android/src/main/java/expo/modules/devmenu/modules/DevMenuModule.kt:33:44 Elvis operator (?:) always returns the left operand of non-nullable type ReadableMap
w: file:///home/expo/workingdir/build/node_modules/expo-dev-menu/android/src/react-native-74/main/expo/modules/devmenu/react/DevMenuPackagerConnectionSettings.kt:16:9 Parameter 'host' is never used
w: file:///home/expo/workingdir/build/node_modules/expo-dev-menu/vendored/react-native-safe-area-context/android/devmenu/com/th3rdwave/safeareacontext/SafeAreaProviderManager.kt:5:34 'MapBuilder' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-menu/vendored/react-native-safe-area-context/android/devmenu/com/th3rdwave/safeareacontext/SafeAreaProviderManager.kt:29:14 'MapBuilder' is deprecated. Deprecated in Java
> Task :expo-system-ui:compileDebugKotlin
> Task :expo-system-ui:compileDebugJavaWithJavac
> Task :expo-system-ui:bundleLibCompileToJarDebug
> Task :unimodules-app-loader:compileDebugKotlin NO-SOURCE
> Task :expo-media-library:compileDebugKotlin
w: file:///home/expo/workingdir/build/node_modules/expo-media-library/android/src/main/java/expo/modules/medialibrary/MediaLibraryConstants.kt:96:32 'TAG_ISO_SPEED_RATINGS: String' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-media-library/android/src/main/java/expo/modules/medialibrary/albums/CreateAlbum.kt:27:38 'getEnvDirectoryForAssetType(String?, Boolean): File' is deprecated. It uses deprecated Android method under the hood. See implementation for details.
w: file:///home/expo/workingdir/build/node_modules/expo-media-library/android/src/main/java/expo/modules/medialibrary/assets/AssetUtils.kt:286:32 'MEDIA_TYPE_PLAYLIST: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-media-library/android/src/main/java/expo/modules/medialibrary/assets/CreateAsset.kt:116:37 'getEnvDirectoryForAssetType(String?, Boolean): File' is deprecated. It uses deprecated Android method under the hood. See implementation for details.
> Task :unimodules-app-loader:compileDebugJavaWithJavac
> Task :unimodules-app-loader:bundleLibCompileToJarDebug
> Task :expo-dev-menu:compileDebugJavaWithJavac
Note: Some input files use or override a deprecated API.
Note: Recompile with -Xlint:deprecation for details.
> Task :expo-media-library:compileDebugJavaWithJavac
> Task :expo-media-library:bundleLibCompileToJarDebug
> Task :expo-dev-menu:bundleLibCompileToJarDebug
> Task :react-native-gesture-handler:compileDebugJavaWithJavac
Note: /home/expo/workingdir/build/node_modules/react-native-gesture-handler/android/paper/src/main/java/com/swmansion/gesturehandler/NativeRNGestureHandlerModuleSpec.java uses or overrides a deprecated API.
Note: Recompile with -Xlint:deprecation for details.
> Task :react-native-gesture-handler:bundleLibCompileToJarDebug
> Task :expo-task-manager:compileDebugKotlin
> Task :expo-task-manager:compileDebugJavaWithJavac
Note: /home/expo/workingdir/build/node_modules/expo-task-manager/android/src/main/java/expo/modules/taskManager/TaskService.java uses or overrides a deprecated API.
Note: Recompile with -Xlint:deprecation for details.
Note: Some input files use unchecked or unsafe operations.
Note: Recompile with -Xlint:unchecked for details.
> Task :expo-task-manager:bundleLibCompileToJarDebug
> Task :react-native-vision-camera:javaPreCompileDebug
> Task :react-native-screens:compileDebugJavaWithJavac
Note: /home/expo/workingdir/build/node_modules/react-native-screens/android/src/paper/java/com/swmansion/rnscreens/NativeScreensModuleSpec.java uses or overrides a deprecated API.
Note: Recompile with -Xlint:deprecation for details.
> Task :react-native-screens:bundleLibCompileToJarDebug
> Task :react-native-wheel-pick:generateDebugBuildConfig
> Task :react-native-wheel-pick:javaPreCompileDebug
> Task :react-native-vision-camera:compileDebugJavaWithJavac
> Task :react-native-vision-camera:bundleLibCompileToJarDebug
> Task :shopify_react-native-skia:generateDebugBuildConfig
> Task :shopify_react-native-skia:javaPreCompileDebug
> Task :shopify_react-native-skia:compileDebugJavaWithJavac
> Task :shopify_react-native-skia:bundleLibCompileToJarDebug
> Task :app:javaPreCompileDebug
Note: Some input files use or override a deprecated API.
Note: Recompile with -Xlint:deprecation for details.
Note: Some input files use unchecked or unsafe operations.
Note: Recompile with -Xlint:unchecked for details.
> Task :app:mergeDebugShaders
> Task :app:compileDebugShaders NO-SOURCE
> Task :app:generateDebugAssets UP-TO-DATE
> Task :expo:mergeDebugShaders
> Task :expo:compileDebugShaders NO-SOURCE
> Task :expo:generateDebugAssets UP-TO-DATE
> Task :expo:packageDebugAssets
> Task :expo-application:mergeDebugShaders
> Task :expo-application:compileDebugShaders NO-SOURCE
> Task :expo-application:generateDebugAssets UP-TO-DATE
> Task :expo-application:packageDebugAssets
> Task :expo-asset:mergeDebugShaders
> Task :expo-asset:compileDebugShaders NO-SOURCE
> Task :expo-asset:generateDebugAssets UP-TO-DATE
> Task :expo-asset:packageDebugAssets
> Task :expo-background-fetch:mergeDebugShaders
> Task :expo-background-fetch:compileDebugShaders NO-SOURCE
> Task :expo-background-fetch:generateDebugAssets UP-TO-DATE
> Task :expo-background-fetch:packageDebugAssets
> Task :expo-blur:mergeDebugShaders
> Task :expo-blur:compileDebugShaders NO-SOURCE
> Task :expo-blur:generateDebugAssets UP-TO-DATE
> Task :expo-blur:packageDebugAssets
> Task :expo-camera:mergeDebugShaders
> Task :expo-camera:compileDebugShaders NO-SOURCE
> Task :expo-camera:generateDebugAssets UP-TO-DATE
> Task :expo-camera:packageDebugAssets
> Task :expo-constants:mergeDebugShaders
> Task :expo-constants:compileDebugShaders NO-SOURCE
> Task :expo-constants:generateDebugAssets UP-TO-DATE
> Task :expo-constants:packageDebugAssets
> Task :expo-dev-client:mergeDebugShaders
> Task :expo-dev-client:compileDebugShaders NO-SOURCE
> Task :expo-dev-client:generateDebugAssets UP-TO-DATE
> Task :expo-dev-client:packageDebugAssets
> Task :expo-dev-launcher:mergeDebugShaders
> Task :expo-dev-launcher:compileDebugShaders NO-SOURCE
> Task :expo-dev-launcher:generateDebugAssets UP-TO-DATE
> Task :expo-dev-launcher:packageDebugAssets
> Task :expo-dev-menu:mergeDebugShaders
> Task :expo-dev-menu:compileDebugShaders NO-SOURCE
> Task :expo-dev-menu:clenupAssets UP-TO-DATE
> Task :expo-dev-menu:copyAssets
> Task :expo-dev-menu:generateDebugAssets UP-TO-DATE
> Task :expo-dev-menu:packageDebugAssets
> Task :expo-dev-menu-interface:mergeDebugShaders
> Task :expo-dev-menu-interface:compileDebugShaders NO-SOURCE
> Task :expo-dev-menu-interface:generateDebugAssets UP-TO-DATE
> Task :expo-dev-menu-interface:packageDebugAssets
> Task :expo-file-system:mergeDebugShaders
> Task :expo-file-system:compileDebugShaders NO-SOURCE
> Task :expo-file-system:generateDebugAssets UP-TO-DATE
> Task :expo-file-system:packageDebugAssets
> Task :expo-font:mergeDebugShaders
> Task :expo-font:compileDebugShaders NO-SOURCE
> Task :expo-font:generateDebugAssets UP-TO-DATE
> Task :expo-font:packageDebugAssets
> Task :expo-json-utils:mergeDebugShaders
> Task :expo-json-utils:compileDebugShaders NO-SOURCE
> Task :expo-json-utils:generateDebugAssets UP-TO-DATE
> Task :expo-json-utils:packageDebugAssets
> Task :expo-keep-awake:mergeDebugShaders
> Task :expo-keep-awake:compileDebugShaders NO-SOURCE
> Task :expo-keep-awake:generateDebugAssets UP-TO-DATE
> Task :expo-keep-awake:packageDebugAssets
> Task :expo-linear-gradient:mergeDebugShaders
> Task :expo-linear-gradient:compileDebugShaders NO-SOURCE
> Task :expo-linear-gradient:generateDebugAssets UP-TO-DATE
> Task :expo-linear-gradient:packageDebugAssets
> Task :expo-linking:mergeDebugShaders
> Task :expo-linking:compileDebugShaders NO-SOURCE
> Task :expo-linking:generateDebugAssets UP-TO-DATE
> Task :expo-linking:packageDebugAssets
> Task :expo-manifests:mergeDebugShaders
> Task :expo-manifests:compileDebugShaders NO-SOURCE
> Task :expo-manifests:generateDebugAssets UP-TO-DATE
> Task :expo-manifests:packageDebugAssets
> Task :expo-media-library:mergeDebugShaders
> Task :expo-media-library:compileDebugShaders NO-SOURCE
> Task :expo-media-library:generateDebugAssets UP-TO-DATE
> Task :expo-media-library:packageDebugAssets
> Task :expo-modules-core:mergeDebugShaders
> Task :expo-modules-core:compileDebugShaders NO-SOURCE
> Task :expo-modules-core:generateDebugAssets UP-TO-DATE
> Task :expo-modules-core:packageDebugAssets
> Task :expo-notifications:mergeDebugShaders
> Task :expo-notifications:compileDebugShaders NO-SOURCE
> Task :expo-notifications:generateDebugAssets UP-TO-DATE
> Task :expo-notifications:packageDebugAssets
> Task :expo-sharing:mergeDebugShaders
> Task :expo-sharing:compileDebugShaders NO-SOURCE
> Task :expo-sharing:generateDebugAssets UP-TO-DATE
> Task :expo-sharing:packageDebugAssets
> Task :expo-splash-screen:mergeDebugShaders
> Task :expo-splash-screen:compileDebugShaders NO-SOURCE
> Task :expo-splash-screen:generateDebugAssets UP-TO-DATE
> Task :expo-splash-screen:packageDebugAssets
> Task :expo-system-ui:mergeDebugShaders
> Task :expo-system-ui:compileDebugShaders NO-SOURCE
> Task :expo-system-ui:generateDebugAssets UP-TO-DATE
> Task :expo-system-ui:packageDebugAssets
> Task :expo-task-manager:mergeDebugShaders
> Task :expo-task-manager:compileDebugShaders NO-SOURCE
> Task :expo-task-manager:generateDebugAssets UP-TO-DATE
> Task :expo-task-manager:packageDebugAssets
> Task :expo-updates-interface:mergeDebugShaders
> Task :expo-updates-interface:compileDebugShaders NO-SOURCE
> Task :expo-updates-interface:generateDebugAssets UP-TO-DATE
> Task :expo-updates-interface:packageDebugAssets
> Task :lottie-react-native:mergeDebugShaders
> Task :lottie-react-native:compileDebugShaders NO-SOURCE
> Task :lottie-react-native:generateDebugAssets UP-TO-DATE
> Task :lottie-react-native:packageDebugAssets
> Task :notifee_react-native:mergeDebugShaders
> Task :notifee_react-native:compileDebugShaders NO-SOURCE
> Task :notifee_react-native:generateDebugAssets UP-TO-DATE
> Task :notifee_react-native:packageDebugAssets
> Task :react-native-async-storage_async-storage:mergeDebugShaders
> Task :react-native-async-storage_async-storage:compileDebugShaders NO-SOURCE
> Task :react-native-async-storage_async-storage:generateDebugAssets UP-TO-DATE
> Task :react-native-async-storage_async-storage:packageDebugAssets
> Task :react-native-community_datetimepicker:mergeDebugShaders
> Task :react-native-community_datetimepicker:compileDebugShaders NO-SOURCE
> Task :react-native-community_datetimepicker:generateDebugAssets UP-TO-DATE
> Task :react-native-community_datetimepicker:packageDebugAssets
> Task :react-native-community_netinfo:mergeDebugShaders
> Task :react-native-community_netinfo:compileDebugShaders NO-SOURCE
> Task :react-native-community_netinfo:generateDebugAssets UP-TO-DATE
> Task :react-native-community_netinfo:packageDebugAssets
> Task :react-native-community_slider:mergeDebugShaders
> Task :react-native-community_slider:compileDebugShaders NO-SOURCE
> Task :react-native-community_slider:generateDebugAssets UP-TO-DATE
> Task :react-native-community_slider:packageDebugAssets
> Task :react-native-firebase_app:mergeDebugShaders
> Task :react-native-firebase_app:compileDebugShaders NO-SOURCE
> Task :react-native-firebase_app:generateDebugAssets UP-TO-DATE
> Task :react-native-firebase_app:packageDebugAssets
> Task :react-native-firebase_auth:mergeDebugShaders
> Task :react-native-firebase_auth:compileDebugShaders NO-SOURCE
> Task :react-native-firebase_auth:generateDebugAssets UP-TO-DATE
> Task :react-native-firebase_auth:packageDebugAssets
> Task :react-native-firebase_firestore:mergeDebugShaders
> Task :react-native-firebase_firestore:compileDebugShaders NO-SOURCE
> Task :react-native-firebase_firestore:generateDebugAssets UP-TO-DATE
> Task :react-native-firebase_firestore:packageDebugAssets
> Task :react-native-firebase_messaging:mergeDebugShaders
> Task :react-native-firebase_messaging:compileDebugShaders NO-SOURCE
> Task :react-native-firebase_messaging:generateDebugAssets UP-TO-DATE
> Task :react-native-firebase_messaging:packageDebugAssets
> Task :react-native-firebase_storage:mergeDebugShaders
> Task :react-native-firebase_storage:compileDebugShaders NO-SOURCE
> Task :react-native-firebase_storage:generateDebugAssets UP-TO-DATE
> Task :expo-notifications:compileDebugKotlin
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/Utils.kt:41:21 'get(String!): Any?' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/notifications/categories/ExpoNotificationCategoriesModule.kt:69:40 'getParcelableArrayList(String?): ArrayList<T!>?' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/notifications/categories/ExpoNotificationCategoriesModule.kt:122:36 'getParcelable(String?): T?' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/notifications/debug/DebugLogging.kt:30:23 'get(String!): Any?' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/notifications/model/RemoteNotificationContent.kt:21:45 'readParcelable(ClassLoader?): T?' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/notifications/model/triggers/FirebaseNotificationTrigger.kt:19:12 'readParcelable(ClassLoader?): T?' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/notifications/presentation/ExpoNotificationPresentationModule.kt:46:33 'getSerializable(String?): Serializable?' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/notifications/presentation/ExpoNotificationPresentationModule.kt:57:43 'getParcelableArrayList(String?): ArrayList<T!>?' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/notifications/presentation/ExpoNotificationPresentationModule.kt:61:33 'getSerializable(String?): Serializable?' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/notifications/presentation/ExpoNotificationPresentationModule.kt:81:31 'getSerializable(String?): Serializable?' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/notifications/presentation/ExpoNotificationPresentationModule.kt:95:31 'getSerializable(String?): Serializable?' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/notifications/presentation/builders/BaseNotificationBuilder.kt:35:100 'constructor Builder(Context)' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/notifications/scheduling/NotificationScheduler.kt:51:40 'getParcelableArrayList(String?): ArrayList<T!>?' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/notifications/scheduling/NotificationScheduler.kt:58:33 'getSerializable(String?): Serializable?' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/notifications/scheduling/NotificationScheduler.kt:81:35 'getSerializable(String?): Serializable?' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/notifications/scheduling/NotificationScheduler.kt:128:31 'getSerializable(String?): Serializable?' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/notifications/scheduling/NotificationScheduler.kt:142:31 'getSerializable(String?): Serializable?' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/service/NotificationsService.kt:480:34 'getParcelable(String?): T?' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/service/NotificationsService.kt:481:28 'getParcelable(String?): T?' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/service/NotificationsService.kt:505:33 'getParcelableExtra(String!): T?' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/service/NotificationsService.kt:506:27 'getParcelableExtra(String!): T?' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/service/NotificationsService.kt:609:54 'get(String!): Any?' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/service/NotificationsService.kt:676:22 'getParcelable(String?): T?' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/service/NotificationsService.kt:677:22 'getParcelable(String?): T?' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/service/NotificationsService.kt:704:14 'getParcelableExtra(String!): T?' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/service/NotificationsService.kt:734:18 'getParcelableExtra(String!): T?' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/service/NotificationsService.kt:774:22 'getParcelable(String?): T?' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/service/delegates/Base64Serialization.kt:26:45 Returning type parameter has been inferred to Nothing implicitly because Nothing is more specific than specified expected type. Please specify type arguments explicitly in accordance with expected type to hide this warning. Nothing can produce an exception at runtime. See KT-36776 for more details.
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/service/delegates/ExpoHandlingDelegate.kt:63:85 Parameter 'notificationResponse' is never used
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/service/delegates/ExpoPresentationDelegate.kt:194:70 'priority: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/service/delegates/ExpoPresentationDelegate.kt:195:41 'vibrate: LongArray!' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/service/delegates/ExpoPresentationDelegate.kt:196:30 'sound: Uri!' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/service/delegates/ExpoPresentationDelegate.kt:207:41 'get(String!): Any?' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/service/delegates/ExpoPresentationDelegate.kt:210:124 'get(String!): Any?' is deprecated. Deprecated in Java
> Task :react-native-firebase_storage:packageDebugAssets
> Task :react-native-gesture-handler:mergeDebugShaders
> Task :react-native-gesture-handler:compileDebugShaders NO-SOURCE
> Task :react-native-gesture-handler:generateDebugAssets UP-TO-DATE
> Task :react-native-gesture-handler:packageDebugAssets
> Task :react-native-picker_picker:mergeDebugShaders
> Task :react-native-picker_picker:compileDebugShaders NO-SOURCE
> Task :react-native-picker_picker:generateDebugAssets UP-TO-DATE
> Task :react-native-picker_picker:packageDebugAssets
> Task :react-native-reanimated:mergeDebugShaders
> Task :react-native-reanimated:compileDebugShaders NO-SOURCE
> Task :react-native-reanimated:generateDebugAssets UP-TO-DATE
> Task :react-native-reanimated:packageDebugAssets
> Task :react-native-safe-area-context:mergeDebugShaders
> Task :react-native-safe-area-context:compileDebugShaders NO-SOURCE
> Task :react-native-safe-area-context:generateDebugAssets UP-TO-DATE
> Task :react-native-safe-area-context:packageDebugAssets
> Task :react-native-screens:mergeDebugShaders
> Task :react-native-screens:compileDebugShaders NO-SOURCE
> Task :react-native-screens:generateDebugAssets UP-TO-DATE
> Task :react-native-screens:packageDebugAssets
> Task :react-native-svg:mergeDebugShaders
> Task :react-native-svg:compileDebugShaders NO-SOURCE
> Task :react-native-svg:generateDebugAssets UP-TO-DATE
> Task :react-native-svg:packageDebugAssets
> Task :react-native-vector-icons:mergeDebugShaders
> Task :react-native-vector-icons:compileDebugShaders NO-SOURCE
> Task :react-native-vector-icons:generateDebugAssets UP-TO-DATE
> Task :react-native-vector-icons:packageDebugAssets
> Task :react-native-vision-camera:mergeDebugShaders
> Task :react-native-vision-camera:compileDebugShaders NO-SOURCE
> Task :react-native-vision-camera:generateDebugAssets UP-TO-DATE
> Task :react-native-vision-camera:packageDebugAssets
> Task :shopify_react-native-skia:mergeDebugShaders
> Task :shopify_react-native-skia:compileDebugShaders NO-SOURCE
> Task :shopify_react-native-skia:generateDebugAssets UP-TO-DATE
> Task :shopify_react-native-skia:packageDebugAssets
> Task :unimodules-app-loader:mergeDebugShaders
> Task :unimodules-app-loader:compileDebugShaders NO-SOURCE
> Task :unimodules-app-loader:generateDebugAssets UP-TO-DATE
> Task :unimodules-app-loader:packageDebugAssets
> Task :expo-application:bundleLibRuntimeToJarDebug
> Task :expo-asset:bundleLibRuntimeToJarDebug
> Task :expo-background-fetch:bundleLibRuntimeToJarDebug
> Task :expo-blur:bundleLibRuntimeToJarDebug
> Task :expo-camera:bundleLibRuntimeToJarDebug
> Task :expo-constants:bundleLibRuntimeToJarDebug
> Task :expo-dev-client:bundleLibRuntimeToJarDebug
> Task :expo-dev-menu:bundleLibRuntimeToJarDebug
> Task :expo-dev-menu-interface:bundleLibRuntimeToJarDebug
> Task :expo-file-system:bundleLibRuntimeToJarDebug
> Task :expo-font:bundleLibRuntimeToJarDebug
> Task :expo-json-utils:bundleLibRuntimeToJarDebug
> Task :expo-keep-awake:bundleLibRuntimeToJarDebug
> Task :expo-linear-gradient:bundleLibRuntimeToJarDebug
> Task :expo-linking:bundleLibRuntimeToJarDebug
> Task :expo-manifests:bundleLibRuntimeToJarDebug
> Task :expo-media-library:bundleLibRuntimeToJarDebug
> Task :expo-modules-core:bundleLibRuntimeToJarDebug
> Task :expo-notifications:compileDebugJavaWithJavac
Note: Some input files use or override a deprecated API.
Note: Recompile with -Xlint:deprecation for details.
Note: /home/expo/workingdir/build/node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/notifications/model/NotificationCategory.java uses unchecked or unsafe operations.
Note: Recompile with -Xlint:unchecked for details.
> Task :expo-notifications:bundleLibCompileToJarDebug
> Task :expo-sharing:bundleLibRuntimeToJarDebug
> Task :expo-splash-screen:bundleLibRuntimeToJarDebug
> Task :expo-system-ui:bundleLibRuntimeToJarDebug
> Task :expo-task-manager:bundleLibRuntimeToJarDebug
> Task :expo-notifications:bundleLibRuntimeToJarDebug
> Task :expo-updates-interface:bundleLibRuntimeToJarDebug
> Task :unimodules-app-loader:bundleLibRuntimeToJarDebug
> Task :react-native-wheel-pick:compileDebugJavaWithJavac
Note: Some input files use or override a deprecated API.
Note: Recompile with -Xlint:deprecation for details.
Note: /home/expo/workingdir/build/node_modules/react-native-wheel-pick/android/src/main/java/com/tron/ReactWheelCurvedPickerManager.java uses unchecked or unsafe operations.
Note: Recompile with -Xlint:unchecked for details.
> Task :lottie-react-native:bundleLibRuntimeToJarDebug
> Task :react-native-gesture-handler:bundleLibRuntimeToJarDebug
> Task :react-native-reanimated:bundleLibRuntimeToJarDebug
> Task :expo-dev-launcher:compileDebugKotlin
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/debug/java/expo/modules/devlauncher/DevLauncherPackageDelegate.kt:31:43 Parameter 'context' is never used
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/debug/java/expo/modules/devlauncher/DevLauncherPackageDelegate.kt:53:35 Parameter 'activityContext' is never used
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/debug/java/expo/modules/devlauncher/helpers/DevLauncherReactUtils.kt:246:11 'newInstance(): T!' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/debug/java/expo/modules/devlauncher/launcher/DevLauncherActivity.kt:31:25 'constructor Handler()' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/debug/java/expo/modules/devlauncher/launcher/DevLauncherActivity.kt:49:5 'overridePendingTransition(Int, Int): Unit' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/debug/java/expo/modules/devlauncher/launcher/DevLauncherActivity.kt:73:5 'overridePendingTransition(Int, Int): Unit' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/debug/java/expo/modules/devlauncher/modules/DevLauncherModule.kt:16:29 'getRawJson(): JSONObject' is deprecated. Prefer to use specific field getters
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/helpers/DevLauncherUpdatesHelper.kt:16:3 Parameter 'context' is never used
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/DevLauncherRecentlyOpenedAppsRegistry.kt:32:47 Unchecked cast: MutableMap<Any?, Any?> to MutableMap<String, Any>
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/DevLauncherRecentlyOpenedAppsRegistry.kt:50:27 'getRawJson(): JSONObject' is deprecated. Prefer to use specific field getters
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:37:23 'constructor TaskDescription(String!, Bitmap!, Int)' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:63:61 'FLAG_TRANSLUCENT_STATUS: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:90:33 Variable 'appliedStatusBarStyle' initializer is redundant
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:92:45 'getter for systemUiVisibility: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:95:68 'SYSTEM_UI_FLAG_LIGHT_STATUS_BAR: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:99:67 'SYSTEM_UI_FLAG_LIGHT_STATUS_BAR: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:103:67 'SYSTEM_UI_FLAG_LIGHT_STATUS_BAR: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:107:15 'setter for systemUiVisibility: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:115:59 'FLAG_FULLSCREEN: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:116:61 'FLAG_FORCE_NOT_FULLSCREEN: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:118:59 'FLAG_FORCE_NOT_FULLSCREEN: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:119:61 'FLAG_FULLSCREEN: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:131:23 'replaceSystemWindowInsets(Int, Int, Int, Int): WindowInsets' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:132:25 'getter for systemWindowInsetLeft: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:134:25 'getter for systemWindowInsetRight: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:135:25 'getter for systemWindowInsetBottom: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:150:15 'setter for statusBarColor: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:160:63 'FLAG_TRANSLUCENT_NAVIGATION: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:161:25 'setter for navigationBarColor: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:171:63 'FLAG_TRANSLUCENT_NAVIGATION: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:175:33 'getter for systemUiVisibility: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:176:33 'SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:177:21 'setter for systemUiVisibility: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:190:29 'getter for systemUiVisibility: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:191:62 'SYSTEM_UI_FLAG_HIDE_NAVIGATION: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:191:101 'SYSTEM_UI_FLAG_FULLSCREEN: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:192:63 'SYSTEM_UI_FLAG_HIDE_NAVIGATION: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:192:102 'SYSTEM_UI_FLAG_FULLSCREEN: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:192:136 'SYSTEM_UI_FLAG_IMMERSIVE: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:193:70 'SYSTEM_UI_FLAG_HIDE_NAVIGATION: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:193:109 'SYSTEM_UI_FLAG_FULLSCREEN: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:193:143 'SYSTEM_UI_FLAG_IMMERSIVE_STICKY: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/launcher/configurators/DevLauncherExpoActivityConfigurator.kt:196:17 'setter for systemUiVisibility: Int' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/main/java/expo/modules/devlauncher/react/DevLauncherPackagerConnectionSettings.kt:12:9 Parameter 'value' is never used
> Task :react-native-wheel-pick:bundleLibCompileToJarDebug
> Task :react-native-wheel-pick:mergeDebugShaders
> Task :react-native-wheel-pick:compileDebugShaders NO-SOURCE
> Task :react-native-wheel-pick:generateDebugAssets UP-TO-DATE
> Task :react-native-wheel-pick:packageDebugAssets
> Task :app:mergeDebugAssets
> Task :expo-dev-launcher:compileDebugJavaWithJavac
> Task :expo-dev-launcher:bundleLibCompileToJarDebug
> Task :app:compressDebugAssets
Note: /home/expo/workingdir/build/node_modules/expo-dev-launcher/android/src/rn74/main/com/facebook/react/devsupport/NonFinalBridgeDevSupportManager.java uses or overrides a deprecated API.
Note: Recompile with -Xlint:deprecation for details.
> Task :expo-dev-launcher:bundleLibRuntimeToJarDebug
> Task :react-native-safe-area-context:bundleLibRuntimeToJarDebug
> Task :react-native-screens:bundleLibRuntimeToJarDebug
> Task :react-native-vision-camera:bundleLibRuntimeToJarDebug
> Task :expo:compileDebugKotlin
w: file:///home/expo/workingdir/build/node_modules/expo/android/src/main/java/expo/modules/ReactActivityDelegateWrapper.kt:163:34 'constructor ReactDelegate(Activity!, ReactNativeHost!, String?, Bundle?)' is deprecated. Deprecated in Java
w: file:///home/expo/workingdir/build/node_modules/expo/android/src/main/java/expo/modules/fetch/NativeResponse.kt:40:16 This declaration overrides deprecated member but not marked as deprecated itself. Please add @Deprecated annotation or suppress. See https://youtrack.jetbrains.com/issue/KT-47902 for details
w: file:///home/expo/workingdir/build/node_modules/expo/android/src/main/java/expo/modules/fetch/NativeResponse.kt:42:11 'deallocate(): Unit' is deprecated. Use sharedObjectDidRelease() instead.
> Task :expo:compileDebugJavaWithJavac
> Task :expo:bundleLibCompileToJarDebug
> Task :expo:bundleLibRuntimeToJarDebug
> Task :notifee_react-native:bundleLibRuntimeToJarDebug
> Task :react-native-async-storage_async-storage:bundleLibRuntimeToJarDebug
> Task :react-native-community_datetimepicker:bundleLibRuntimeToJarDebug
> Task :react-native-community_netinfo:bundleLibRuntimeToJarDebug
> Task :react-native-community_slider:bundleLibRuntimeToJarDebug
> Task :react-native-firebase_auth:bundleLibRuntimeToJarDebug
> Task :react-native-firebase_app:bundleLibRuntimeToJarDebug
> Task :app:compileDebugKotlin
> Task :react-native-firebase_firestore:bundleLibRuntimeToJarDebug
> Task :react-native-firebase_messaging:bundleLibRuntimeToJarDebug
> Task :react-native-firebase_storage:bundleLibRuntimeToJarDebug
> Task :react-native-picker_picker:bundleLibRuntimeToJarDebug
> Task :app:compileDebugJavaWithJavac
> Task :shopify_react-native-skia:bundleLibRuntimeToJarDebug
> Task :react-native-svg:bundleLibRuntimeToJarDebug
> Task :react-native-vector-icons:bundleLibRuntimeToJarDebug
> Task :react-native-wheel-pick:bundleLibRuntimeToJarDebug
> Task :app:desugarDebugFileDependencies
> Task :app:transformDebugClassesWithAsm
> Task :expo:processDebugJavaRes
> Task :expo-application:processDebugJavaRes
> Task :expo-asset:processDebugJavaRes
> Task :expo-background-fetch:processDebugJavaRes
> Task :expo-blur:processDebugJavaRes
> Task :expo-constants:processDebugJavaRes
> Task :expo-camera:processDebugJavaRes
> Task :expo-dev-client:processDebugJavaRes NO-SOURCE
> Task :expo-dev-menu:processDebugJavaRes
> Task :expo-dev-launcher:processDebugJavaRes
> Task :expo-dev-menu-interface:processDebugJavaRes
> Task :expo-file-system:processDebugJavaRes
> Task :expo-font:processDebugJavaRes
> Task :expo-json-utils:processDebugJavaRes
> Task :expo-keep-awake:processDebugJavaRes
> Task :expo-linear-gradient:processDebugJavaRes
> Task :expo-linking:processDebugJavaRes
> Task :expo-manifests:processDebugJavaRes
> Task :expo-media-library:processDebugJavaRes
> Task :expo-notifications:processDebugJavaRes
> Task :expo-sharing:processDebugJavaRes
> Task :expo-modules-core:processDebugJavaRes
> Task :expo-splash-screen:processDebugJavaRes
> Task :expo-system-ui:processDebugJavaRes
> Task :expo-task-manager:processDebugJavaRes
> Task :expo-updates-interface:processDebugJavaRes
> Task :notifee_react-native:processDebugJavaRes NO-SOURCE
> Task :lottie-react-native:processDebugJavaRes
> Task :react-native-community_datetimepicker:processDebugJavaRes NO-SOURCE
> Task :react-native-async-storage_async-storage:processDebugJavaRes NO-SOURCE
> Task :react-native-community_netinfo:processDebugJavaRes NO-SOURCE
> Task :react-native-community_slider:processDebugJavaRes NO-SOURCE
> Task :react-native-firebase_auth:processDebugJavaRes NO-SOURCE
> Task :react-native-firebase_app:processDebugJavaRes NO-SOURCE
> Task :react-native-firebase_messaging:processDebugJavaRes NO-SOURCE
> Task :react-native-firebase_firestore:processDebugJavaRes NO-SOURCE
> Task :react-native-firebase_storage:processDebugJavaRes NO-SOURCE
> Task :react-native-picker_picker:processDebugJavaRes NO-SOURCE
> Task :react-native-reanimated:processDebugJavaRes NO-SOURCE
> Task :react-native-gesture-handler:processDebugJavaRes
> Task :react-native-safe-area-context:processDebugJavaRes
> Task :react-native-svg:processDebugJavaRes NO-SOURCE
> Task :react-native-vector-icons:processDebugJavaRes NO-SOURCE
> Task :react-native-screens:processDebugJavaRes
> Task :react-native-wheel-pick:processDebugJavaRes NO-SOURCE
> Task :shopify_react-native-skia:processDebugJavaRes NO-SOURCE
> Task :unimodules-app-loader:processDebugJavaRes NO-SOURCE
> Task :react-native-vision-camera:processDebugJavaRes
> Task :expo-application:mergeDebugJniLibFolders
> Task :expo-application:mergeDebugNativeLibs NO-SOURCE
> Task :expo:mergeDebugJniLibFolders
> Task :expo:mergeDebugNativeLibs NO-SOURCE
> Task :expo:copyDebugJniLibsProjectOnly
> Task :expo-application:copyDebugJniLibsProjectOnly
> Task :expo-asset:mergeDebugJniLibFolders
> Task :expo-asset:mergeDebugNativeLibs NO-SOURCE
> Task :expo-background-fetch:mergeDebugJniLibFolders
> Task :expo-background-fetch:mergeDebugNativeLibs NO-SOURCE
> Task :expo-background-fetch:copyDebugJniLibsProjectOnly
> Task :expo-asset:copyDebugJniLibsProjectOnly
> Task :expo-blur:mergeDebugJniLibFolders
> Task :expo-blur:mergeDebugNativeLibs NO-SOURCE
> Task :expo-camera:mergeDebugJniLibFolders
> Task :expo-camera:mergeDebugNativeLibs NO-SOURCE
> Task :expo-blur:copyDebugJniLibsProjectOnly
> Task :expo-camera:copyDebugJniLibsProjectOnly
> Task :expo-constants:mergeDebugJniLibFolders
> Task :expo-dev-client:mergeDebugJniLibFolders
> Task :expo-constants:mergeDebugNativeLibs NO-SOURCE
> Task :expo-dev-client:mergeDebugNativeLibs NO-SOURCE
> Task :expo-dev-client:copyDebugJniLibsProjectOnly
> Task :expo-constants:copyDebugJniLibsProjectOnly
> Task :expo-dev-menu:mergeDebugJniLibFolders
> Task :expo-dev-launcher:mergeDebugJniLibFolders
> Task :expo-dev-launcher:mergeDebugNativeLibs NO-SOURCE
> Task :expo-dev-menu:mergeDebugNativeLibs NO-SOURCE
> Task :expo-dev-launcher:copyDebugJniLibsProjectOnly
> Task :expo-dev-menu:copyDebugJniLibsProjectOnly
> Task :expo-file-system:mergeDebugJniLibFolders
> Task :expo-file-system:mergeDebugNativeLibs NO-SOURCE
> Task :expo-dev-menu-interface:mergeDebugJniLibFolders
> Task :expo-dev-menu-interface:mergeDebugNativeLibs NO-SOURCE
> Task :expo-file-system:copyDebugJniLibsProjectOnly
> Task :expo-dev-menu-interface:copyDebugJniLibsProjectOnly
> Task :expo-font:mergeDebugJniLibFolders
> Task :expo-font:mergeDebugNativeLibs NO-SOURCE
> Task :expo-json-utils:mergeDebugJniLibFolders
> Task :expo-json-utils:mergeDebugNativeLibs NO-SOURCE
> Task :expo-font:copyDebugJniLibsProjectOnly
> Task :expo-json-utils:copyDebugJniLibsProjectOnly
> Task :expo-keep-awake:mergeDebugJniLibFolders
> Task :expo-keep-awake:mergeDebugNativeLibs NO-SOURCE
> Task :expo-linear-gradient:mergeDebugJniLibFolders
> Task :expo-linear-gradient:mergeDebugNativeLibs NO-SOURCE
> Task :expo-keep-awake:copyDebugJniLibsProjectOnly
> Task :expo-linking:mergeDebugJniLibFolders
> Task :expo-linear-gradient:copyDebugJniLibsProjectOnly
> Task :expo-linking:mergeDebugNativeLibs NO-SOURCE
> Task :expo-linking:copyDebugJniLibsProjectOnly
> Task :expo-manifests:mergeDebugJniLibFolders
> Task :expo-manifests:mergeDebugNativeLibs NO-SOURCE
> Task :expo-media-library:mergeDebugJniLibFolders
> Task :expo-media-library:mergeDebugNativeLibs NO-SOURCE
> Task :expo-manifests:copyDebugJniLibsProjectOnly
> Task :expo-media-library:copyDebugJniLibsProjectOnly
> Task :expo-notifications:mergeDebugJniLibFolders
> Task :expo-notifications:mergeDebugNativeLibs NO-SOURCE
> Task :expo-notifications:copyDebugJniLibsProjectOnly
> Task :expo-sharing:mergeDebugJniLibFolders
> Task :expo-sharing:mergeDebugNativeLibs NO-SOURCE
> Task :expo-sharing:copyDebugJniLibsProjectOnly
> Task :expo-splash-screen:mergeDebugJniLibFolders
> Task :expo-splash-screen:mergeDebugNativeLibs NO-SOURCE
> Task :expo-splash-screen:copyDebugJniLibsProjectOnly
> Task :expo-system-ui:mergeDebugJniLibFolders
> Task :expo-system-ui:mergeDebugNativeLibs NO-SOURCE
> Task :expo-system-ui:copyDebugJniLibsProjectOnly
> Task :expo-task-manager:mergeDebugJniLibFolders
> Task :expo-task-manager:mergeDebugNativeLibs NO-SOURCE
> Task :expo-task-manager:copyDebugJniLibsProjectOnly
> Task :expo-updates-interface:mergeDebugJniLibFolders
> Task :expo-updates-interface:mergeDebugNativeLibs NO-SOURCE
> Task :expo-updates-interface:copyDebugJniLibsProjectOnly
> Task :lottie-react-native:mergeDebugJniLibFolders
> Task :lottie-react-native:mergeDebugNativeLibs NO-SOURCE
> Task :lottie-react-native:copyDebugJniLibsProjectOnly
> Task :notifee_react-native:mergeDebugJniLibFolders
> Task :notifee_react-native:mergeDebugNativeLibs NO-SOURCE
> Task :notifee_react-native:copyDebugJniLibsProjectOnly
> Task :react-native-async-storage_async-storage:mergeDebugJniLibFolders
> Task :react-native-async-storage_async-storage:mergeDebugNativeLibs NO-SOURCE
> Task :react-native-async-storage_async-storage:copyDebugJniLibsProjectOnly
> Task :react-native-community_datetimepicker:mergeDebugJniLibFolders
> Task :react-native-community_datetimepicker:mergeDebugNativeLibs NO-SOURCE
> Task :react-native-community_datetimepicker:copyDebugJniLibsProjectOnly
> Task :react-native-community_netinfo:mergeDebugJniLibFolders
> Task :react-native-community_netinfo:mergeDebugNativeLibs NO-SOURCE
> Task :react-native-community_netinfo:copyDebugJniLibsProjectOnly
> Task :react-native-community_slider:mergeDebugJniLibFolders
> Task :react-native-community_slider:mergeDebugNativeLibs NO-SOURCE
> Task :react-native-community_slider:copyDebugJniLibsProjectOnly
> Task :react-native-firebase_app:mergeDebugJniLibFolders
> Task :react-native-firebase_app:mergeDebugNativeLibs NO-SOURCE
> Task :react-native-firebase_app:copyDebugJniLibsProjectOnly
> Task :react-native-firebase_auth:mergeDebugJniLibFolders
> Task :react-native-firebase_auth:mergeDebugNativeLibs NO-SOURCE
> Task :react-native-firebase_auth:copyDebugJniLibsProjectOnly
> Task :react-native-firebase_firestore:mergeDebugJniLibFolders
> Task :react-native-firebase_firestore:mergeDebugNativeLibs NO-SOURCE
> Task :react-native-firebase_firestore:copyDebugJniLibsProjectOnly
> Task :react-native-firebase_messaging:mergeDebugJniLibFolders
> Task :react-native-firebase_messaging:mergeDebugNativeLibs NO-SOURCE
> Task :react-native-firebase_messaging:copyDebugJniLibsProjectOnly
> Task :react-native-firebase_storage:mergeDebugJniLibFolders
> Task :react-native-firebase_storage:mergeDebugNativeLibs NO-SOURCE
> Task :react-native-firebase_storage:copyDebugJniLibsProjectOnly
> Task :react-native-gesture-handler:mergeDebugJniLibFolders
> Task :react-native-gesture-handler:mergeDebugNativeLibs NO-SOURCE
> Task :react-native-gesture-handler:copyDebugJniLibsProjectOnly
> Task :react-native-picker_picker:mergeDebugJniLibFolders
> Task :react-native-picker_picker:mergeDebugNativeLibs NO-SOURCE
> Task :react-native-picker_picker:copyDebugJniLibsProjectOnly
> Task :app:dexBuilderDebug
> Task :app:processDebugJavaRes
> Task :expo-modules-core:configureCMakeDebug[arm64-v8a]
Checking the license for package CMake 3.22.1 in /home/expo/Android/Sdk/licenses
License for package CMake 3.22.1 accepted.
Preparing "Install CMake 3.22.1 v.3.22.1".
"Install CMake 3.22.1 v.3.22.1" ready.
Installing CMake 3.22.1 in /home/expo/Android/Sdk/cmake/3.22.1
"Install CMake 3.22.1 v.3.22.1" complete.
"Install CMake 3.22.1 v.3.22.1" finished.
> Task :app:mergeDebugJavaResource
> Task :react-native-reanimated:configureCMakeDebug[arm64-v8a]
> Task :react-native-safe-area-context:mergeDebugJniLibFolders
> Task :react-native-safe-area-context:mergeDebugNativeLibs NO-SOURCE
> Task :react-native-safe-area-context:copyDebugJniLibsProjectOnly
> Task :app:checkDebugDuplicateClasses FAILED
> Task :react-native-screens:configureCMakeDebug[arm64-v8a]
> Task :react-native-reanimated:buildCMakeDebug[arm64-v8a]
> Task :expo-modules-core:buildCMakeDebug[arm64-v8a]
FAILURE: Build failed with an exception.
* What went wrong:
Execution failed for task ':app:checkDebugDuplicateClasses'.
> A failure occurred while executing com.android.build.gradle.internal.tasks.CheckDuplicatesRunnable
   > Duplicate class com.google.firebase.Timestamp found in modules firebase-common-21.0.0.aar -> firebase-common-21.0.0-runtime (com.google.firebase:firebase-common:21.0.0) and firebase-firestore-24.9.1.aar -> firebase-firestore-24.9.1-runtime (com.google.firebase:firebase-firestore:24.9.1)
     
     Go to the documentation to learn how to <a href="d.android.com/r/tools/classpath-sync-errors">Fix dependency resolution errors</a>.
* Try:
> Run with --stacktrace option to get the stack trace.
> Run with --info or --debug option to get more log output.
> Run with --scan to get full insights.
> Get more help at https://help.gradle.org.
BUILD FAILED in 4m 25s
Deprecated Gradle features were used in this build, making it incompatible with Gradle 9.0.
You can use '--warning-mode all' to show the individual deprecation warnings and determine if they come from your own scripts or plugins.
For more on this, please refer to https://docs.gradle.org/8.10.2/userguide/command_line_interface.html#sec:command_line_warnings in the Gradle documentation.
1002 actionable tasks: 1001 executed, 1 up-to-date
Error: Gradle build failed with unknown error. See logs for the "Run gradlew" phase for more information.