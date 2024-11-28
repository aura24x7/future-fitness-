Add Firebase to your Android project 

bookmark_border

Prerequisites
Install or update Android Studio to its latest version.

Make sure that your project meets these requirements (note that some products might have stricter requirements):

Targets API level 21 (Lollipop) or higher
Uses Android 5.0 or higher
Uses Jetpack (AndroidX), which includes meeting these version requirements:
com.android.tools.build:gradle v7.3.0 or later
compileSdkVersion 28 or later
Set up a physical device or use an emulator to run your app.
Note that Firebase SDKs with a dependency on Google Play services require the device or emulator to have Google Play services installed.

Sign into Firebase using your Google account.

If you don't already have an Android project and just want to try out a Firebase product, you can download one of our quickstart samples.


You can connect your Android app to Firebase using one of the following options:

Option 1: (recommended) Use the Firebase console setup workflow.
Option 2: Use the Android Studio Firebase Assistant (may require additional configuration).


Option 1: Add Firebase using the Firebase console
Adding Firebase to your app involves tasks both in the Firebase console and in your open Android project (for example, you download Firebase config files from the console, then move them into your Android project).

Step 1: Create a Firebase project
Before you can add Firebase to your Android app, you need to create a Firebase project to connect to your Android app. Visit Understand Firebase Projects to learn more about Firebase projects.

Create a Firebase project

Step 2: Register your app with Firebase
To use Firebase in your Android app, you need to register your app with your Firebase project. Registering your app is often called "adding" your app to your project.

Note: Check out our best practices for adding apps to a Firebase project, including how to handle multiple variants.
Go to the Firebase console.

In the center of the project overview page, click the Android icon (plat_android) or Add app to launch the setup workflow.

Enter your app's package name in the Android package name field.

What's a package name, and where do you find it?

Make sure to enter the package name that your app is actually using. The package name value is case-sensitive, and it cannot be changed for this Firebase Android app after it's registered with your Firebase project.
(Optional) Enter other app information: App nickname and Debug signing certificate SHA-1.

How are the App nickname and the Debug signing certificate SHA-1 used within Firebase?

Click Register app.

Step 3: Add a Firebase configuration file
Download and then add the Firebase Android configuration file (google-services.json) to your app:

Click Download google-services.json to obtain your Firebase Android config file.

Move your config file into the module (app-level) root directory of your app.

What do you need to know about this config file?

To make the values in your google-services.json config file accessible to Firebase SDKs, you need the Google services Gradle plugin (google-services).

In your root-level (project-level) Gradle file (<project>/build.gradle.kts or <project>/build.gradle), add the Google services plugin as a dependency:

Kotlin
Groovy
Are you still using the buildscript syntax? Learn how to add Firebase plugins using that syntax.

plugins {
  id("com.android.application") version "7.3.0" apply false
  // ...

  // Add the dependency for the Google services Gradle plugin
  id("com.google.gms.google-services") version "4.4.2" apply false
}
In your module (app-level) Gradle file (usually <project>/<app-module>/build.gradle.kts or <project>/<app-module>/build.gradle), add the Google services plugin:

Kotlin
Groovy

plugins {
  id("com.android.application")

  // Add the Google services Gradle plugin
  id("com.google.gms.google-services")
  // ...
}
Step 4: Add Firebase SDKs to your app
In your module (app-level) Gradle file (usually <project>/<app-module>/build.gradle.kts or <project>/<app-module>/build.gradle), add the dependencies for the Firebase products that you want to use in your app. We recommend using the Firebase Android BoM to control library versioning.

Analytics enabled
Analytics not enabled

dependencies {
  // ...

  // Import the Firebase BoM
  implementation(platform("com.google.firebase:firebase-bom:33.6.0"))

  // When using the BoM, you don't specify versions in Firebase library dependencies

  // Add the dependency for the Firebase SDK for Google Analytics
  implementation("com.google.firebase:firebase-analytics")

  // TODO: Add the dependencies for any other Firebase products you want to use
  // See https://firebase.google.com/docs/android/setup#available-libraries
  // For example, add the dependencies for Firebase Authentication and Cloud Firestore
  implementation("com.google.firebase:firebase-auth")
  implementation("com.google.firebase:firebase-firestore")
}
By using the Firebase Android BoM, your app will always use compatible versions of Firebase Android libraries.

Looking for a Kotlin-specific library module? Starting in October 2023 (Firebase BoM 32.5.0), both Kotlin and Java developers can depend on the main library module (for details, see the FAQ about this initiative).

After adding the dependencies for the products you want to use, sync your Android project with Gradle files.

 Are you getting a build failure about invoke-custom support and enabling desugaring? Here's how to fix it.

That's it! You can skip ahead to check out the recommended next steps.

If you're having trouble getting set up, though, visit the Android troubleshooting & FAQ.



Option 2: Add Firebase using the Firebase Assistant
The Firebase Assistant registers your app with a Firebase project and adds the necessary Firebase files, plugins, and dependencies to your Android project — all from within Android Studio!

Open your Android project in Android Studio, then make sure that you're using the latest versions of Android Studio and the Firebase Assistant:

Windows / Linux: Help > Check for updates
macOS: Android Studio > Check for updates
Open the Firebase Assistant: Tools > Firebase.

In the Assistant pane, choose a Firebase product to add to your app. Expand its section, then click the tutorial link (for example, Analytics > Log an Analytics event).

Click Connect to Firebase to connect your Android project with Firebase.

What does this workflow do?

Click the button to add a desired Firebase product (for example, Add Analytics to your app).

Sync your app to ensure that all dependencies have the necessary versions.

In the Assistant pane, follow the remaining setup instructions for your selected Firebase product.

Add as many other Firebase products as you'd like via the Firebase Assistant!

Do you want an easier way to manage library versions?
You can use the Firebase Android BoM to manage your Firebase library versions and ensure that your app is always using compatible library versions.

That's it! Make sure to check out the recommended next steps.

If you're having trouble getting set up, though, visit the Android troubleshooting & FAQ.



Available libraries
This section lists the Firebase products supported for Android and their Gradle dependencies. Learn more about these Firebase Android libraries:

Reference documentation (Kotlin+KTX | Java)

Firebase Android SDK GitHub repo

Note that when using the Firebase Android BoM, you don't specify individual library versions when you declare Firebase library dependencies in your Gradle build configuration file.

Important: Kotlin developers should now depend on the main modules instead of the KTX modules (when using Firebase BoM v32.5.0+ or main module versions listed in BoM v32.5.0+). For details, see the FAQ about this initiative.
The main section of the table below lists the dependencies for the main modules and their latest versions. If needed, though, you can still find a list of all KTX modules and their versions at the bottom of the table.

Service or Product	Gradle dependency	Latest
version	Add Analytics?
Firebase Android BoM
(Bill of Materials)	com.google.firebase:firebase-bom
The latest Firebase BoM version contains the latest versions of each Firebase Android library. To learn which library versions are mapped to a specific BoM version, review the release notes for that BoM version.

33.6.0	
AdMob	com.google.android.gms:play-services-ads	23.5.0	
Analytics	com.google.firebase:firebase-analytics	22.1.2	
App Check custom provider	com.google.firebase:firebase-appcheck	18.0.0	
App Check debug provider	com.google.firebase:firebase-appcheck-debug	18.0.0	
App Check Play Integrity provider	com.google.firebase:firebase-appcheck-playintegrity	18.0.0	
App Distribution	com.google.firebase:firebase-appdistribution	16.0.0-beta14	
App Distribution API	com.google.firebase:firebase-appdistribution-api	16.0.0-beta14	
App Distribution plugin	com.google.firebase:firebase-appdistribution-gradle	5.0.0	
Authentication	com.google.firebase:firebase-auth	23.1.0	
Cloud Firestore	com.google.firebase:firebase-firestore	25.1.1	
Cloud Functions for Firebase Client SDK	com.google.firebase:firebase-functions	21.1.0	
Cloud Messaging	com.google.firebase:firebase-messaging	24.1.0	
Cloud Storage	com.google.firebase:firebase-storage	21.0.1	
Crashlytics	com.google.firebase:firebase-crashlytics	19.2.1	
Crashlytics NDK	com.google.firebase:firebase-crashlytics-ndk	19.2.1	
Crashlytics plugin	com.google.firebase:firebase-crashlytics-gradle	3.0.2	
Dynamic feature module support	com.google.firebase:firebase-dynamic-module-support	16.0.0-beta03	
Dynamic Links	com.google.firebase:firebase-dynamic-links	22.1.0	
In-App Messaging	com.google.firebase:firebase-inappmessaging	21.0.1	
(required)
In-App Messaging Display	com.google.firebase:firebase-inappmessaging-display	21.0.1	
(required)
Firebase installations	com.google.firebase:firebase-installations	18.0.0	
Firebase ML Model Downloader API	com.google.firebase:firebase-ml-modeldownloader	25.0.1	
Performance Monitoring	com.google.firebase:firebase-perf	21.0.2	
Performance Monitoring plugin	com.google.firebase:perf-plugin	1.4.2	
Realtime Database	com.google.firebase:firebase-database	21.0.0	
Remote Config	com.google.firebase:firebase-config	22.0.1	
Vertex AI in Firebase	com.google.firebase:firebase-vertexai	16.0.2	
Google Play services plugin	com.google.gms:google-services	4.4.2	
DEPRECATED LIBRARIES
App Check SafetyNet provider	com.google.firebase:firebase-appcheck-safetynet	16.1.2	
App Indexing	com.google.firebase:firebase-appindexing	20.0.0	
Firebase KTX modules

Firebase ML Kit libraries



Next steps
Add Firebase services to your app:

Gain insights on user behavior with Analytics.

Set up a user authentication flow with Authentication.

Store data, like user information, with Cloud Firestore or Realtime Database.

Store files, like photos and videos, with Cloud Storage.

Trigger backend code that runs in a secure environment with Cloud Functions.

Send notifications with Cloud Messaging.

Find out when and why your app is crashing with Crashlytics.

Learn about Firebase:

Visit Understand Firebase Projects to learn more about Firebase projects and best practices for projects.

Visit Learn more about Android and Firebase if you have questions about concepts that are unfamiliar or specific to Firebase and Android development.

Explore sample Firebase apps.

Get hands-on experience with the Firebase Android Codelab.

Learn more with the Firebase in a Weekend course.

Prepare to launch your app:

Set up budget alerts for your project in the Google Cloud console.
Monitor the Usage and billing dashboard in the Firebase console to get an overall picture of your project's usage across multiple Firebase services.
Review the Firebase launch checklist.
Having trouble with Firebase and your Android project? Visit the Android troubleshooting & FAQ.Input is required, but 'npx expo' is in non-interactive mode.
Required input:
> Use port 8083 instead?
