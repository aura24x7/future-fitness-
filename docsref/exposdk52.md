 Expo SDK 52
Nov 13, 2024 by

Avatar of Brent Vatne
Brent Vatne

Today we're announcing the release of Expo SDK 52. SDK 52 includes React Native 0.76. Thank you to everyone who helped with beta testing.

SDK 52
The New Architecture rollout is happening now!
After a year of working on a number of varied initiatives at Expo and across the React Native ecosystem, in close collaboration with Meta, Software Mansion, and many other developers in the community, we are excited to be rolling out the New Architecture by default for all newly created projects from SDK 52 onward.

New Architecture Livestream
Not familiar with React Native's "New Architecture"? Read "New Architecture is here" on the React Native blog, and/or watch the recording of our livestream with Nicola Corti and Riccardo Cipolleschi from Meta on October 29th, 2024.

What the rollout will look like
The New Architecture is now enabled by default for all new projects. Starting with SDK 52, when you create a new project with npx create-expo-app, you will see that newArchEnabled is set to true in your app.json.
Projects that are upgrading from a previous SDK release can opt in to the New Architecture; it's not required, and it will not be automatically enabled for existing projects in SDK 52. We recommend enabling it after upgrading successfully using the old architecture. In SDK 53, we will likely enable the New Architecture by default and you will have to opt out. In a future release in 2025, we may remove the ability to use the old architecture.
Expo Go for SDK 52 and higher will only support the New Architecture. All Expo SDK packages support the New Architecture, and any of the third-party libraries that we include in Expo Go are also supported. This should not impact your experience of using Expo Go. If it does, you can still opt out of using the New Architecture in your project by explicitly disabling it by setting newArchEnabled to false in your app.json and creating a development build.
Testing your app with the New Architecture
Ensure that you use the latest version of all third-party native libraries.
Run npx expo-doctor@latest in your SDK 52 project to find any library incompatibilities that may cause issues when migrating. Doctor will validate your dependencies against React Native Directory and let you know if any libraries are known to be incompatible with the New Architecture, or if their compatibility status is unknown. In some cases you will want to migrate to alternative libraries that are compatible with the New Architecture. If a library doesn't support the New Architecture yet, there is a good chance that it is not actively maintained.
Read about the known issues to get an idea of what to expect.
Learn more about enabling the New Architecture in your app.
Highlights
iOS deployment target bumped (minimum supported version) from 13.4 to iOS 15.1. This mirrors the minimum version of iOS that is required by React Native 0.76.
Android minSdkVersion and compileSdkVersion bumped from 23 to 24 and 34 to 35 respectively. This mirrors changes from React Native.
Stable release of new expo-video library. We released the beta for expo-video in SDK 51 and received a lot of great feedback. We spent the last SDK cycle incorporating that feedback and making other improvements to the library, and now we're ready to call it stable! We recommend migrating to it from expo-av now. It is more reliable, easier to use, more performant, and more powerful than the Video component from expo-av. We've also added a utility to expo-video for generating video thumbnails, which may replace expo-video-thumbnails in the future. Learn more about expo-video.
Examples of lock screen controls and Picture-in-Picture in action
expo-video now includes lock screen controls and support for Picture-in-Picture on both Android and iOS, among many other features. Learn more.

Beta release of new expo-audio library. Similar to our rewrites over other libraries, like expo-video and expo-camera, we are focused on providing a modern, stable, and easy to use API that works great for the vast majority of apps. It may not handle certain niche use cases that requires more control, since this often requires trading off stability and ease of use even in common cases. The expo-audio library is now in beta, and we're excited to get your feedback! We think it's easier than ever now to add audio to your apps. This library is not yet included in Expo Go. Learn more about expo-audio.

Beta release of expo-file-system/next. We rebuilt the expo-file-system library with a new API designed for ease of use and developer experience, based on Expo Modules. This enables synchronous read/write operations, using SharedObjects to represent files and directories and advanced features like stateful file handles. The expo-file-system/next library is now in beta (fully backwards compatible if you decide to partially adopt it), with plenty more of improvements and integrations planned! This library is not yet included in Expo Go. Learn more about expo-file-system/next.

Many improvements to expo-camera. After promoting it out of the expo-camera/next namespace in SDK 51, we've followed up with a bunch of fixes and improvements based on feedback from the community. It's now more robust for a wider range of use cases. We've also switched over to using Swift Concurrency, which improves the camera configuration setup reliability compared to using dispatch queues. Refer to the expo-camera changelog for more information.

New expo-live-photo library. This library is currently iOS-only, and it allows you to play back iOS Live Photos. We've also added support to expo-image-picker for picking live photos from the photo library. Learn more.

Improvements in affordances for edge-to-edge layouts on Android. We worked with @zoontek to help ship react-native-edge-to-edge, a library that 'effortlessly enables edge-to-edge display in React Native, allowing your Android app content to flow seamlessly beneath the system bars.' Learn more.

expo-image v2 introduces a powerful new API for loading images: the useImage hook lets you preload the image into memory, providing its size and metadata before the image is rendered. The result of this hook is a shared reference to a native image instance (Drawable on Android and UIImage on iOS) that can be passed as a source to render the image immediately, without any additional network requests and I/O operations. We've also added onDisplay event that is called once the image is displayed on the screen.

import { useImage, Image } from 'expo-image';
import { Text } from 'react-native';

export default function MyImage() {
  const image = useImage('https://picsum.photos/1000/800', {
    maxWidth: 800,
    onError(error, retry) {
      console.error('Loading failed:', error.message);
    },
  });

  if (!image) {
    return <Text>Image is loading...</Text>;
  }

  return <Image source={image} style={{ width: image.width / 2, height: image.height / 2 }} />;
}
expo-image-manipulator now offers a new object-oriented, contextual API that is more performant, more flexible, and provides better developer experience. Images returned from this API can be efficiently passed as a source to the Image component from expo-image v2. See a usage example.

New expo-sqlite/kv-store API provides convenient key/value storage, built on top of expo-sqlite. It implements the same API as @react-native-async-storage/async-storage and it is a drop-in replacement for it, but it also adds synchronous APIs (for example, you can call getItemSync instead of getItem to make it synchronous). Learn more about expo-sqlite/kv-store.

expo-sqlite now supports SQLCipher. You can enable it with the expo-sqlite config plugin. While building support for this, we also resolved an issue that would occasionally make expo-updates incompatible with other libraries that use SQLite.

expo-sqlite now supports saving SQLite databases to shared containers on iOS, and any other available directory. This allows an app extension (eg: widget, share extension) to share a database with the main application, or across other app extensions. Thanks to @IgorKhramtsov for a great PR implementing this.

Expo DevTools Plugins now support binary payloads, such as Uint8Array. This was built in order to support advanced use cases for an upcoming state management library, which we will talk about in our upcoming Launch Party starting November 18th.

expo-notifications improvements: over the SDK 51 cycle, we've rolled out many bug fixes and improvements to the library, including but not limited to better support for FCMv1. In SDK 52, we're also improving support for background tasks which now run even when app is terminated (PR). You can expect a lot of improvements to expo-notifications as we continue investing in it.

Support for iOS 18 tinted icons. With the introduction of the controversial iOS 18 tinted icons, it's now possible to provide a version of your icon that works well when tinted by iOS, rather than letting iOS attempt to tint your standard icon. Thank you to @fobos531 for the excellent pull request. Learn how to configure a tinted icon in your app config.

Fixed an issue with environment variables and embedded expoConfig: expo-constants now properly sources @expo/env to ensure your .env files are loaded when generating the embedded Constants.expoConfig data. This was also backported to SDK 51. Thanks to ChromeQ for working with us to narrow down the issue.

Calendar form sheets now launchable from expo-calendar. Shout out to the guy at App.js Conf who asked me about this. Be sure to attend App.js 2025 and tell Brent what you'd like to see in the Expo SDK!

expo/fetch is a drop-in replacement, WinterCG-compliant Fetch API. It supports download streaming, which is useful for integrating modern AI APIs that require efficient handling of data streams. Learn more.

React Navigation v7 is now available. If you use Expo Router, the upgrade will be automatic and many of the changes will be handled for you, but not all (see Expo Router and Notable breaking changes below for more information). If you use React Navigation directly, check out the announcement blog post to learn more and decide whether you would like to upgrade — you can continue using v6 for now if you prefer.

React Native DevTools replaces the JavaScript debugger introduced in SDK 47. It's very similar, so you don't have to worry about learning a new tool (they were both built on on Chrome DevTools and the Chrome DevTools Protocol). Learn more about React Native DevTools.

React Native 0.76 is a big release, we've mentioned some of its features here but you can learn more about it in the React Native 0.76 release notes.

Big improvements to expo-splash-screen
We've migrated to the SplashScreen API introduced in Android 12, which resolves some long-standing issues on Android 12+, and helps to prevent layout jumps when transitioning from the splash screen. Splash screens for Android cannot be fullscreen with this API (and this did not work particularly well before either), so you may need to update your splash screen. Learn more in the Android Splash screen docs and the expo-splash-screen docs.
Android splash screen dimensions
Android's splash screen is a small, centered image that must fit within specified constraints.
Learn more in the Android Splash screen docs and the expo-splash-screen docs.

It's now easier to add a simple fade transition to your splash screen: SplashScreen.setOptions({ fade: true, duration: 1000 }).
Dark mode splash screens are now officially supported through the expo-splash-screen config plugin. This was always possible by modifying your native projects either directly or with a config plugin, but it wasn't officially supported by the expo-splash-screen library until now. This closes a popular feature request. It pairs well with the newly introduced iOS 18 dark and tinted icons.
Intent to deprecate the splash field in favor of the config plugin: developers using Continuous Native Generation should migrate away from using the splash field in app.json, and instead use the expo-splash-screen plugin. The splash key will be deprecated in favor of the config plugin in a future release. For now, expo-splash-screen will attempt to map your splash config to the equivalent configuration for the config plugin automatically. For now, you won't need to make any changes to your existing splash configuration on iOS. However, on Android you will need to migrate away from using a full screen splash image if you are currently using one, and instead use a smaller image such as your app icon.
Known limitations of splash screen implementation
Properties from the config plugin do not apply to the splash-screen-like view that you see when your app is launching in Expo Go or development builds, and so testing changes to configuration will be a bit more difficult — you will need to re-build the app to see changes. We will look into improving this in the future, but it would require rebuilding the native splash screen perfectly in order to ensure that it is useful (often, being even slightly incorrect is worse than not trying to emulate something at all). In Expo Go, we now display the app icon on the loading screen, rather than the splash screen.
Debug builds on Android 13+ do behave correctly with preventAutoHideAsync(). The result of this is that you will see a black screen between your splash screen and app UI. This does not impact release builds, and it appears to be an issue in Android itself (AOSP issue reports: [1] [2]). A workaround that other library authors use is to re-implement the splash screen UI in their own native view, and present that immediately. We have decided not to do that for now, due to the additional maintenance cost and because it does not impact production apps. We may reconsider this in the future.
DOM Components
DOM Components make it easier than ever to incrementally migrate from web to native. They also provide a useful escape hatch that makes it easy to integrate any web library into your native app, even if it's just for a single view.

To use DOM Components, create a React DOM component file (using <div>, <span>, even <marquee> if you want) and then add the "use dom" directive to the top of the file. You will now be able to import that DOM component from a React Native component. The DOM component will be rendered inside a webview, but you can mostly use it like a normal component via props (with a slightly different pattern required for non-serializable props, in particular functions).

You can use any web library that you like within your DOM components. Thor used DOM components for custom Protomaps tiles. Raphaël used DOM components to quickly add a spherical photo viewer. And of course, Evan Bacon has shared a lot of examples. In each case, you may want to migrate to a native equivalent eventually for the best experience, but DOM components are a great starting point - in particular if you already have a web app that you want to migrate to native, or you already have a library that does what you want but is not yet available for native Android or iOS.

New Architecture Livestream
Check out Evan Bacon's recent "Introducing DOM components" talk, and get started by reading the DOM Components guide.

Expo CLI
Experimental universal Tree Shaking support. Automatically remove unused ESM imports and exports from your app to improve OTA and web performance. Learn more.
Experimental support for React Compiler: enable it with "experiments": { "reactCompiler": true } in your app config. Learn more.
Fast resolving by default across all platforms. Up to 15x faster resolution. This was merged into Metro, so it's now enabled for all React Native projects as of React Native 0.76.
New flag to pass app to launch to iOS run command: npx expo run:ios --binary /path/to/bin.
New flag to improve debugging of missing modules: EXPO_USE_METRO_REQUIRE=1.
Support for resolver.requireCycleIgnorePatterns in Metro server bundles.
EXPO_USE_METRO_WORKSPACE_ROOT is now enabled by default. The monorepo root is considered to "contain all content", the workspace root adds something called "server root" besides the "project root". This fixes a couple of things related to: resolution to workspaces in the monorepo, splitting the Metro cache for near-identical apps in the same monorepo, using the correct entry point resolution in various cases.
Metro will now be automatically configured to support pnpm monorepos. Learn more.
CSS modules can now import other CSS modules. So you can put CSS modules in your CSS modules while you write CSS modules (remember 2008?).
Web assets now use strings / ImageSource for easier interop with web ecosystem.
Added ios.appleTeamId field to app config, which sets the DEVELOPMENT_TEAM in all PBX projects when defined. This improves affordances for multi-target iOS apps.
Reduced size of Expo CLI by removing the dependency on RNC CLI. Expo projects use expo-modules-autolinking to discover both Expo Modules and modules built with the React Native module API (such as Turbo Modules). You can opt in to @react-native-community/cli autolinking by setting the environment variable EXPO_USE_COMMUNITY_AUTOLINKING=1 and running pod install again.
Eager builds with Android/iOS run commands: with npx expo run --eager, Expo CLI will bundle your app with Metro before compiling it. This is helpful when you are creating a release build and want to ensure that your JavaScript bundles correctly before proceeding to the relatively more time consuming native build step.
Expo Modules API
Better support for sharing SharedRef between packages. During the conversion process, the inner reference type is now validated to ensure the conversion is possible. Additionally, developers can check the type of SharedRef in the JavaScript.
Enhanced support for SharedObject, introducing new memory pressure handling for more effective garbage collection of native objects with significant data.
CMTime (iOS) and Duration (Android) are now supported as convertible types, making it easier to handle time-based media in native modules.
Added customizeRootView to ExpoAppDelegateSubscriberProtocol. This enables developers to customize the root view in their applications through AppDelegate subscribers, providing more control over the app's initial layout and setup.
Added OnUserLeavesActivity event to Android lifecycle listeners. This is triggered when the user leaves the app, e.g., pressing the Home button.
New event APIs useEvent and useEventListener provide simpler event management and reduce the need for you to write boilerplate event code yourself in each module.
Migrated EventEmitter to C++ implementation. The new EventEmitter in C++ replaces the legacy JS version. This migration paves the way for potential improvements in performance and reliability in event handling within Expo modules.
Extended Expo Module config to simplify wrapping third-party AARs. Use android.gradleAarProjects in your expo-module.config.json to wrap third-party AARs. Learn more.
Exposed a new way to define type-safe web modules with events: registerWebModule.
Expo Router
Early preview of Server Components and Server Actions. As demonstrated at React Conf 2024, we've been working on support for React Server Components. We're incredibly excited about the potential this offers for new patterns in app development. This preview is meant to help libraries (such as react-native) adopt React Server Components support, and not intended for production yet. A dedicated blog post is coming soon, for now you can learn more in the docs.
Now uses React Navigation v7. This may require some changes to your usage of the underlying React Navigation APIs, learn more.
New expo-router/ui API for tabs. The new "headless" <Tabs /> component provides Radix-like API for un-styled <Tab /> layouts, which makes it easier to build these layouts for web. Learn more.
New expo-router/link export. Better alignment for upcoming package.json exports support and server components support.
Added legacy_subscribe for broader compatibility. This API was added to +native-intent as a fallback for projects using services like Branch, which support React Navigation via Linking.subscribe but do not have native support Expo Router yet. Learn more.
Added sitemap Config Plugin option to disable the built-in route. You can now disable the default /_sitemap route by passing sitemap: false to the expo-router Config Plugin.
Expo Application Services (EAS)
EAS are cloud services for CI/CD with Expo and React Native apps — you don't need to use them to build apps with Expo or React Native, but we think they are incredibly useful! There are several updates to EAS that are relevant to SDK 52:

EAS Build default worker image for iOS builds updated to macOS 14.6 and Xcode 16.1. Learn more.
New "Bundle JavaScript" build step on EAS Build. Similar to npx expo run --eager mentioned in the Expo CLI section above, starting with SDK 52 we call npx expo export:embed --eager in a new build step. The bundler cache will be re-used when the bundling step is run at the end of the native build, so there is minimal extra overhead. In this small project, the "Bundle JavaScript" step took 13 seconds compared to 5 minutes and 50 seconds for the "Run fastlane" step on a recent iOS build — so if I were to push code with a JavaScript error, I'd see that error almost 6 minutes faster than before. You can disable this step by setting EAS_BUILD_DISABLE_BUNDLE_JAVASCRIPT_STEP=1 on your build. If you don't use EAS Build, you can add the same functionality to a step in your own CI/CD pipeline by calling npx expo export:embed --eager --platform [platform].
Improved dashboards for EAS Update. There's a lot of bookkeeping that EAS Update does for you between channels, branches, runtime versions, and deployments, and it's now much easier to navigate between them because we have added links to related entities on any page where it may be useful. We've also added stats on update groups pages to show number of installs and failed installs over the previous 7 days, and a dedicated section of the website for runtime versions. You can expect to see more of this sort of data arriving on the dashboards in the future.
Deprecations
Push notifications (remote notifications) will no longer be supported in Expo Go in SDK 53. In SDK 52, you will be warned when using push notifications-related features from expo-notifications in Expo Go. The reason for this change is that we (1) want to make transition from Expo Go to development builds smoother, and (2) make push notifications and their setup more transparent. Push notifications are deeply integrated with the native app which they are delivered to. Expo Go made some necessary integration steps in order to support push notifications - but the integration was somewhat opaque and would become invalid once users transitioned from Expo Go to development build. With this change, we instead ask developers to create a development build when they would like to use push notifications and configure them right away. Learn how to set up push notifications: docs, video.
Google Maps will no longer be supported in Expo Go for Android in SDK 53. In SDK 52, you will be warned when using react-native-maps in Expo Go for Android. On iOS, Expo Go only supports Apple Maps. You can use Google Maps in development builds. Similar to the remote notifications change, this ensures that the setup of Google Maps is transparent and it is clear to developers that they will need to configure it before they are able to use the API in production.
CRSQLite support in expo-sqlite has been deprecated. This was a fun experiment for us, but CRSQLite library is not currently under active development and so we've decided to remove it for now.
expo-av Video API is deprecated, use expo-video instead.
Notable breaking changes
Expo Go now uses the New Architecture for all apps. Because of this change, JSC is no longer supported in Expo Go, you will need to use Hermes. If you are still using JSC, reach out to us and let us know why!
Expo Go for Android no longer supports Pedometer. This was required to ensure that the Expo Go app was not misclassified as a health app on the Google Play Store. Create a development build for Android to use Pedometer.
expo-camera/legacy has been removed: migrate to expo-camera from expo-camera/legacy.
expo-sqlite/legacy has been removed: migrate to expo-sqlite from expo-sqlite/legacy.
expo-barcode-scanner has been removed: it was deprecated in SDK 50 and slated for removal in SDK 51. The barcode scanning functionality provided by expo-camera is a better alternative (and it also supports the iOS 16+ DataScannerViewController). Learn more.
Unused privacy field from app.json has been removed. This field was previously used when the Expo website had optional public-facing pages for projects, which we no longer provide.
create-react-native-app is no longer supported. Use npx create-expo-app instead, it's pretty much the same thing! We're consolidating CLIs for clarity in the ecosystem.
expo-notifications trigger types changed: we simplified calendar trigger input types in response to feedback that the old approach was difficult to use and error prone. Learn more.
expo-router type changes: removed generic from Href type and navigation hooks/APIs, eg: Href<T> -> Href / router.push<T>() -> router.push(). The purpose is to simplify passing Href as a props, avoiding the need to creating generic typed components, and preserving typing with forwardRef.
expo-router Typed Routes no longer generate types for partial group Hrefs. Previously /(hello)/(world)/page could be typed as /(world)/page. This will now show a TypeScript error. The href is still valid, if you have this edge case, you will need to cast to href. You can revert to the old behavior by setting partialRouteTypes in the Expo Router config plugin.
expo-router navigate method behavior changes: refer to the React Navigation v7 upgrade guide for more information.
When using the New Architecture, React state set functions will no longer execute synchronously (due to automatic batching). If you have any code that assumes state setters execute synchronously, you may encounter subtle issues.
Full screen splash images are no longer supported on Android in expo-splash-screen. Now that the library has been migrated to the Android 12 SplashScreen API, it no longer supports full screen splash images. Learn more about configuring your splash screen and supported splash image dimensions.
Known issues
Developer preview of React Server Components are not meant for production use yet.
When viewing the "Sources" tab in React Native DevTools, you may see a warning that says "The script is on the debugger's ignore list", and sourcemaps won't be loaded correctly. If you see this, press "Remove from ignore list" and reload your app. You will be able to explore your app source and set breakpoints and so on as expected now.
Border width and color are not applied to the Image component from expo-image (issue). We are working on a fix. This was resolved in expo/expo#33026 and related PRs.
Yarn v1 is known to crash or hang when upgrading dependencies in some projects, in particular during the @react-native/babel-preset installation step (you may see "JavaScript heap out of memory"). If you encounter this when running npx expo install expo@^52.0.0, you can manually update the expo package version to ^52.0.0 in your package.json and run yarn, and then run yarn expo install --fix afterwards. If the issue persists, you may need to clear your node_modules or delete your yarn.lock. It may be time for the ecosystem to finally move on from Yarn v1.
Known regressions
Found an issue? Report a regression.
➡️ Upgrading your app
Here's how to upgrade your app to Expo SDK 52 from 51:

Update to the latest version of EAS CLI (if you use it):

Copy

npm i -g eas-cli
Upgrade all dependencies to match SDK 52:

Copy

npx expo install expo@^52.0.0 --fix
If you have any resolutions/overrides in your package.json, verify that they are still needed. For example, you should remove metro and metro-resolver overrides if you added them for expo-router in a previous SDK release. Additionally, if you previously configured your metro.config.js to work well in a monorepo, we recommend reading the updated Work with monorepos guide to see if you need to make any changes.
Check for any possible known issues:

Copy

npx expo-doctor@latest
Refer to the "Deprecations, renamings, and removals" section above for breaking changes that are most likely to impact your app.
Make sure to check the changelog for all other breaking changes!
Upgrade Xcode if needed: Xcode 16 is needed to compile the native iOS project. We recommend Xcode 16.1 for SDK 52. For EAS Build, projects without any specified image will default to Xcode 16.1.
If you use Continuous Native Generation:
Delete the android and ios directories if you generated them for a previous SDK version in your local project directory. They'll be re-generated next time you run a build, either with npx expo run:ios, npx expo prebuild, or with EAS Build.
If you don't use Continuous Native Generation:
Run npx pod-install if you have an ios directory.
Apply any relevant changes from the Native project upgrade helper.
Alternatively, you could consider adopting prebuild for easier upgrades in the future.
If you use development builds with expo-dev-client: Create a new development build after upgrading.
If you use Expo Go: Consider migrating to a development builds. Expo Go is not recommended as a development environment for production apps.
Having trouble? Refer to the Troubleshooting your SDK upgrade guide.
Questions? Join our weekly office hours on Wednesdays at 12:00PM Pacific on Discord.