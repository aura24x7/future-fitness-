Expo Camera


A React component that renders a preview for the device's front or back camera.



expo-camera provides a React component that renders a preview of the device's front or back camera. The camera's parameters such as zoom, torch, and flash mode are adjustable. Using CameraView, you can take photos and record videos that are saved to the app's cache. The component is also capable of detecting bar codes appearing in the preview. Run the example on your device to see all these features working together.

Installation
Terminal

Copy

npx expo install expo-camera
If you are installing this in an existing React Native app, start by installing expo in your project. Then, follow the additional instructions as mentioned by the library's README under "Installation in bare React Native projects" section.

Configuration in app.json/app.config.js
You can configure expo-camera using its built-in config plugin if you use config plugins in your project (EAS Build or npx expo run:[android|ios]). The plugin allows you to configure various properties that cannot be set at runtime and require building a new app binary to take effect.

Example app.json with config plugin
app.json

Copy


{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera",
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone",
          "recordAudioAndroid": true
        }
      ]
    ]
  }
}
Configurable properties
Name	Default	Description
cameraPermission	"Allow $(PRODUCT_NAME) to access your camera"	
Only for: 

A string to set the NSCameraUsageDescription permission message.

microphonePermission	"Allow $(PRODUCT_NAME) to access your microphone"	
Only for: 

A string to set the NSMicrophoneUsageDescription permission message.

recordAudioAndroid	true	
Only for: 

A boolean that determines whether to enable the RECORD_AUDIO permission on Android.

Usage
Only one Camera preview can be active at any given time. If you have multiple screens in your app, you should unmount Camera components whenever a screen is unfocused.
Basic Camera Usage

Copy


Open in Snack


import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});

Show More
Web support
Most browsers support a version of web camera functionality, you can check out the web camera browser support here. Image URIs are always returned as base64 strings because local file system paths are unavailable in the browser.

Chrome iframe usage
When using Chrome versions 64+, if you try to use a web camera in a cross-origin iframe nothing will render. To add support for cameras in your iframe simply add the attribute allow="microphone; camera;" to the iframe element:

<iframe src="..." allow="microphone; camera;">
  <!-- <CameraView /> -->
</iframe>
API
import { CameraView } from 'expo-camera';
Component
CameraView
Type: React.Component<CameraViewProps>

CameraViewProps

active
Optional • Type: boolean • Default: true
A boolean that determines whether the camera should be active. Useful in situations where the camera may not have unmounted but you still want to stop the camera session.

animateShutter
Optional • Type: boolean • Default: true
A boolean that determines whether the camera shutter animation should be enabled.

autofocus
Optional • Type: FocusMode • Default: off
Indicates the focus mode to use.

barcodeScannerSettings
Optional • Type: BarcodeSettings
Example

<CameraView
  barcodeScannerSettings={{
    barcodeTypes: ["qr"],
  }}
/>
enableTorch
Optional • Type: boolean • Default: false
A boolean to enable or disable the torch.

facing
Optional • Type: CameraType • Default: 'back'
Camera facing. Use one of CameraType. When front, use the front-facing camera. When back, use the back-facing camera.

flash
Optional • Type: FlashMode • Default: 'off'
Camera flash mode. Use one of FlashMode values. When on, the flash on your device will turn on when taking a picture. When off, it won't. Setting it to auto will fire flash if required.

mirror
Optional • Type: boolean • Default: false
A boolean that determines whether the camera should mirror the image when using the front camera.

mode
Optional • Type: CameraMode • Default: 'picture'
Used to select image or video output.

mute
Optional • Type: boolean • Default: false
If present, video will be recorded with no sound.

onBarcodeScanned
Optional • Type: (scanningResult: BarcodeScanningResult) => void
Callback that is invoked when a barcode has been successfully scanned. The callback is provided with an object of the BarcodeScanningResult shape, where the type refers to the barcode type that was scanned, and the data is the information encoded in the barcode (in this case of QR codes, this is often a URL). See BarcodeType for supported values.

onCameraReady
Optional • Type: () => void
Callback invoked when camera preview has been set.

onMountError
Optional • Type: (event: CameraMountError) => void
Callback invoked when camera preview could not start.

onResponsiveOrientationChanged
Optional • Type: (event: ResponsiveOrientationChanged) => void
Callback invoked when responsive orientation changes. Only applicable if responsiveOrientationWhenOrientationLocked is true.

pictureSize
Optional • Type: string
A string representing the size of pictures takePictureAsync will take. Available sizes can be fetched with getAvailablePictureSizesAsync. Setting this prop will cause the ratio prop to be ignored as the aspect ratio is determined by the selected size.

poster
Optional • Type: string
A URL for an image to be shown while the camera is loading.

ratio
Optional • Type: CameraRatio
A string representing the aspect ratio of the preview. For example, 4:3 and 16:9. Note: Setting the aspect ratio here will change the scaleType of the camera preview from FILL to FIT. Also, when using 1:1, devices only support certain sizes. If you specify an unsupported size, the closest supported ratio will be used.

responsiveOrientationWhenOrientationLocked
Optional • Type: boolean
Whether to allow responsive orientation of the camera when the screen orientation is locked (that is, when set to true, landscape photos will be taken if the device is turned that way, even if the app or device orientation is locked to portrait).

videoBitrate
Optional • Type: number
The bitrate of the video recording in bits per second. Note: On iOS, you must specify the video codec when calling recordAsync to use this option.

Example

videoQuality
Optional • Type: VideoQuality
Specify the quality of the recorded video. Use one of VideoQuality possible values: for 16:9 resolution 2160p, 1080p, 720p, 480p : Android only and for 4:3 4:3 (the size is 640x480). If the chosen quality is not available for a device, the highest available is chosen.

videoStabilizationMode
Optional • Type: VideoStabilization
The video stabilization mode used for a video recording. Use one of VideoStabilization.<value>. You can read more about each stabilization type in Apple Documentation.

zoom
Optional • Type: number • Default: 0
A value between 0 and 1 being a percentage of device's max zoom, where 0 means not zoomed and 1 means maximum zoom.

Inherited Props
ViewProps
Static Methods
dismissScanner()
Dismiss the scanner presented by launchScanner.

Returns:
Promise<void>

getAvailableVideoCodecsAsync()
Queries the device for the available video codecs that can be used in video recording.

Returns:
Promise<VideoCodec[]>

A promise that resolves to a list of strings that represents available codecs.

isAvailableAsync()
Check whether the current device has a camera. This is useful for web and simulators cases. This isn't influenced by the Permissions API (all platforms), or HTTP usage (in the browser). You will still need to check if the native permission has been accepted.

Returns:
Promise<boolean>

launchScanner(options)
Parameter	Type
options
(optional)	ScanningOptions

Presents a modal view controller that uses the DataScannerViewController available on iOS 16+.

Returns:
Promise<void>

onModernBarcodeScanned(listener)
Parameter	Type	Description
listener	(event: ScanningResult) => void	
Invoked with the ScanningResult when a bar code has been successfully scanned.


Invokes the listener function when a bar code has been successfully scanned. The callback is provided with an object of the ScanningResult shape, where the type refers to the bar code type that was scanned and the data is the information encoded in the bar code (in this case of QR codes, this is often a URL). See BarcodeType for supported values.

Returns:
EventSubscription

Component Methods
getAvailablePictureSizesAsync()
Get picture sizes that are supported by the device.

Returns:
Promise<string[]>

Returns a Promise that resolves to an array of strings representing picture sizes that can be passed to pictureSize prop. The list varies across Android devices but is the same for every iOS.

pausePreview()
Pauses the camera preview. It is not recommended to use takePictureAsync when preview is paused.

Returns:
Promise<void>

recordAsync(options)
Parameter	Type	Description
options
(optional)	CameraRecordingOptions	
A map of CameraRecordingOptions type.


Starts recording a video that will be saved to cache directory. Videos are rotated to match device's orientation. Flipping camera during a recording results in stopping it.

Returns:
Promise<undefined | { uri: string }>

Returns a Promise that resolves to an object containing video file uri property and a codec property on iOS. The Promise is returned if stopRecording was invoked, one of maxDuration and maxFileSize is reached or camera preview is stopped.

resumePreview()
Resumes the camera preview.

Returns:
Promise<void>

stopRecording()
Stops recording if any is in progress.

Returns:
void

takePictureAsync(options)
Parameter	Type	Description
options
(optional)	CameraPictureOptions	
An object in form of CameraPictureOptions type.


Takes a picture and saves it to app's cache directory. Photos are rotated to match device's orientation (if options.skipProcessing flag is not enabled) and scaled to match the preview.

Note: Make sure to wait for the onCameraReady callback before calling this method.

Returns:
Promise<undefined | CameraCapturedPicture>

Returns a Promise that resolves to CameraCapturedPicture object, where uri is a URI to the local image file on Android, iOS, and a base64 string on web (usable as the source for an Image element). The width and height properties specify the dimensions of the image.

base64 is included if the base64 option was truthy, and is a string containing the JPEG data of the image in Base64. Prepend it with 'data:image/jpg;base64,' to get a data URI, which you can use as the source for an Image element for example.

exif is included if the exif option was truthy, and is an object containing EXIF data for the image. The names of its properties are EXIF tags and their values are the values for those tags.

On native platforms, the local image URI is temporary. Use FileSystem.copyAsync to make a permanent copy of the image.

Note: Avoid calling this method while the preview is paused. On Android, this will throw an error. On iOS, this will take a picture of the last frame that is currently on screen.

Hooks
useCameraPermissions(options)
Parameter	Type
options
(optional)	PermissionHookOptions<object>

Returns:
[null | PermissionResponse, RequestPermissionMethod<PermissionResponse>, GetPermissionMethod<PermissionResponse>]

useMicrophonePermissions(options)
Parameter	Type
options
(optional)	PermissionHookOptions<object>

Returns:
[null | PermissionResponse, RequestPermissionMethod<PermissionResponse>, GetPermissionMethod<PermissionResponse>]

Methods
Camera.scanFromURLAsync(url, barcodeTypes)
Parameter	Type	Description
url	string	
URL to get the image from.

barcodeTypes
(optional)	BarcodeType[]	
An array of bar code types. Defaults to all supported bar code types on the platform.

Note: Only QR codes are supported on iOS. On android, the barcode should take up the majority of the image for best results.


Scan bar codes from the image at the given URL.

Returns:
Promise<BarcodeScanningResult[]>

A possibly empty array of objects of the BarcodeScanningResult shape, where the type refers to the barcode type that was scanned and the data is the information encoded in the barcode.

Interfaces
PermissionResponse
An object obtained by permissions get and request functions.

PermissionResponse Properties

Name	Type	Description
canAskAgain	boolean	
Indicates if user can be asked again for specific permission. If not, one should be directed to the Settings app in order to enable/disable the permission.

expires	PermissionExpiration	
Determines time when the permission expires.

granted	boolean	
A convenience boolean that indicates if the permission is granted.

status	PermissionStatus	
Determines the status of the permission.


Types
BarcodeBounds
Name	Type	Description
origin	BarcodePoint	
The origin point of the bounding box.

size	BarcodeSize	
The size of the bounding box.

BarcodePoint
Type: Point

These coordinates are represented in the coordinate space of the camera source (e.g. when you are using the camera view, these values are adjusted to the dimensions of the view).

BarcodeScanningResult
Name	Type	Description
bounds	BarcodeBounds	
The BarcodeBounds object. bounds in some case will be representing an empty rectangle. Moreover, bounds doesn't have to bound the whole barcode. For some types, they will represent the area used by the scanner.

cornerPoints	BarcodePoint[]	
Corner points of the bounding box. cornerPoints is not always available and may be empty. On iOS, for code39 and pdf417 you don't get this value.

data	string	
The parsed information encoded in the barcode.

type	string	
The barcode type.

BarcodeSettings
Name	Type	Description
barcodeTypes	BarcodeType[]	-
BarcodeSize
Name	Type	Description
height	number	
The height value.

width	number	
The width value.

BarcodeType
Literal Type: string

The available barcode types that can be scanned.

Acceptable values are: 'aztec' | 'ean13' | 'ean8' | 'qr' | 'pdf417' | 'upc_e' | 'datamatrix' | 'code39' | 'code93' | 'itf14' | 'codabar' | 'code128' | 'upc_a'

CameraCapturedPicture
Name	Type	Description
base64
(optional)	string	
A Base64 representation of the image.

exif
(optional)	Partial<MediaTrackSettings> | any	
On Android and iOS this object may include various fields based on the device and operating system. On web, it is a partial representation of the MediaTrackSettings dictionary.

height	number	
Captured image height.

uri	string	
On web, the value of uri is the same as base64 because file system URLs are not supported in the browser.

width	number	
Captured image width.

CameraMode
Literal Type: string

Acceptable values are: 'picture' | 'video'

CameraMountError
Name	Type	Description
message	string	-
CameraOrientation
Literal Type: string

Acceptable values are: 'portrait' | 'portraitUpsideDown' | 'landscapeLeft' | 'landscapeRight'

CameraPictureOptions
Name	Type	Description
additionalExif
(optional)	Record<string, any>	
Only for: 

Additional EXIF data to be included for the image. Only useful when exif option is set to true.

base64
(optional)	boolean	
Whether to also include the image data in Base64 format.

exif
(optional)	boolean	
Whether to also include the EXIF data for the image.

imageType
(optional)	ImageType	-
isImageMirror
(optional)	boolean	-
mirror
(optional)	boolean	
Deprecated Use mirror prop on CameraView instead.

When set to true, the output image will be flipped along the vertical axis when using the front camera.

Default:
false
onPictureSaved
(optional)	(picture: CameraCapturedPicture) => void	
A callback invoked when picture is saved. If set, the promise of this method will resolve immediately with no data after picture is captured. The data that it should contain will be passed to this callback. If displaying or processing a captured photo right after taking it is not your case, this callback lets you skip waiting for it to be saved.

quality
(optional)	number	
Specify the compression quality from 0 to 1. 0 means compress for small size, and 1 means compress for maximum quality.

scale
(optional)	number	-
shutterSound
(optional)	boolean	
To programmatically disable the camera shutter sound

Default:
true
skipProcessing
(optional)	boolean	
If set to true, camera skips orientation adjustment and returns an image straight from the device's camera. If enabled, quality option is discarded (processing pipeline is skipped as a whole). Although enabling this option reduces image delivery time significantly, it may cause the image to appear in a wrong orientation in the Image component (at the time of writing, it does not respect EXIF orientation of the images).

Note: Enabling skipProcessing would cause orientation uncertainty. Image component does not respect EXIF stored orientation information, that means obtained image would be displayed wrongly (rotated by 90°, 180° or 270°). Different devices provide different orientations. For example some Sony Xperia or Samsung devices don't provide correctly oriented images by default. To always obtain correctly oriented image disable skipProcessing option.

CameraRatio
Literal Type: string

Acceptable values are: '4:3' | '16:9' | '1:1'

CameraRecordingOptions
Name	Type	Description
codec
(optional)	VideoCodec	
Only for: 

This option specifies what codec to use when recording the video. See VideoCodec for the possible values.

maxDuration
(optional)	number	
Maximum video duration in seconds.

maxFileSize
(optional)	number	
Maximum video file size in bytes.

mirror
(optional)	boolean	
Deprecated Use mirror prop on CameraView instead.

If true, the recorded video will be flipped along the vertical axis. iOS flips videos recorded with the front camera by default, but you can reverse that back by setting this to true. On Android, this is handled in the user's device settings.

CameraType
Literal Type: string

Acceptable values are: 'front' | 'back'

FlashMode
Literal Type: string

Acceptable values are: 'off' | 'on' | 'auto'

FocusMode
Literal Type: string

This option specifies the mode of focus on the device.

on - Indicates that the device should autofocus once and then lock the focus.
off - Indicates that the device should automatically focus when needed.
Acceptable values are: 'on' | 'off'

ImageType
Literal Type: string

Acceptable values are: 'png' | 'jpg'

PermissionExpiration
Literal Type: multiple types

Permission expiration time. Currently, all permissions are granted permanently.

Acceptable values are: 'never' | number

PermissionHookOptions
Literal Type: multiple types

Acceptable values are: PermissionHookBehavior | Options

Point
Name	Type	Description
x	number	-
y	number	-
ResponsiveOrientationChanged
Name	Type	Description
orientation	CameraOrientation	-
ScanningOptions
Name	Type	Description
barcodeTypes	BarcodeType[]	
The type of codes to scan for.

isGuidanceEnabled
(optional)	boolean	
Guidance text, such as “Slow Down,” appears over the live video.

Default:
true
isHighlightingEnabled
(optional)	boolean	
Indicates whether the scanner displays highlights around recognized items.

Default:
false
isPinchToZoomEnabled
(optional)	boolean	
Indicates whether people can use a two-finger pinch-to-zoom gesture.

Default:
true
ScanningResult
Type: Omit<BarcodeScanningResult, 'bounds'>

Subscription
A subscription object that allows to conveniently remove an event listener from the emitter.

Name	Type	Description
remove	() => void	
Removes an event listener for which the subscription has been created. After calling this function, the listener will no longer receive any events from the emitter.

VideoCodec
Literal Type: string

This option specifies what codec to use when recording a video.

Acceptable values are: 'avc1' | 'hvc1' | 'jpeg' | 'apcn' | 'ap4h'

VideoQuality
Literal Type: string

Acceptable values are: '2160p' | '1080p' | '720p' | '480p' | '4:3'

VideoStabilization
Literal Type: string

This option specifies the stabilization mode to use when recording a video.

Acceptable values are: 'off' | 'standard' | 'cinematic' | 'auto'

Enums
PermissionStatus
PermissionStatus Values

DENIED
PermissionStatus.DENIED ＝ "denied"
User has denied the permission.

GRANTED
PermissionStatus.GRANTED ＝ "granted"
User has granted the permission.

UNDETERMINED
PermissionStatus.UNDETERMINED ＝ "undetermined"
User hasn't granted or denied the permission yet.

Permissions
Android
This package automatically adds the CAMERA permission to your app. If you want to record videos with audio, you have to include the RECORD_AUDIO in your app.json inside the expo.android.permissions array.

Android Permission	Description
CAMERA

Required to be able to access the camera device.

RECORD_AUDIO

Allows an application to record audio.

iOS
The following usage description keys are used by this library:

Info.plist Key	Description
NSCameraUsageDescription

A message that tells the user why the app is requesting access to the device’s camera.
NSMicrophoneUsageDescription

A message that tells the user why the app is requesting access to the device’s microphone.