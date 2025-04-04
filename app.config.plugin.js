const { withAndroidManifest, createRunOncePlugin } = require('@expo/config-plugins');

const withFixedFirebaseManifest = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;

    // Get the <application> element
    const application = androidManifest.manifest.application[0];

    // Add tools namespace to the manifest root element
    androidManifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';

    // Make sure meta-data array exists
    if (!application['meta-data']) {
      application['meta-data'] = [];
    }

    // Find and remove any conflicting Firebase notification metadata
    const notificationChannelIndex = application['meta-data'].findIndex(
      meta => meta.$['android:name'] === 'com.google.firebase.messaging.default_notification_channel_id'
    );

    if (notificationChannelIndex !== -1) {
      application['meta-data'].splice(notificationChannelIndex, 1);
    }

    // Add the Firebase notification channel metadata with tools:replace
    application['meta-data'].push({
      $: {
        'android:name': 'com.google.firebase.messaging.default_notification_channel_id',
        'android:value': 'default',
        'tools:replace': 'android:value'
      }
    });

    // Find and remove any conflicting Firebase notification color
    const notificationColorIndex = application['meta-data'].findIndex(
      meta => meta.$['android:name'] === 'com.google.firebase.messaging.default_notification_color'
    );

    if (notificationColorIndex !== -1) {
      application['meta-data'].splice(notificationColorIndex, 1);
    }

    // Add the Firebase notification color metadata with tools:replace
    application['meta-data'].push({
      $: {
        'android:name': 'com.google.firebase.messaging.default_notification_color',
        'android:resource': '@color/notification_icon_color',
        'tools:replace': 'android:resource'
      }
    });

    return config;
  });
};

module.exports = createRunOncePlugin(
  withFixedFirebaseManifest,
  'fixed-firebase-manifest',
  '1.0.0'
); 