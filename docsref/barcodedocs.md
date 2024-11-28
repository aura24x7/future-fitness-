Expo BarCodeScanner iconExpo BarCodeScanner


A library that allows scanning a variety of supported barcodes. It is available both as a standalone library and as an extension for Expo Camera.

Deprecated: This library will no longer be available from SDK 51. We recommend using expo-camera which has barcode scanning built-in instead.
expo-barcode-scanner provides a React component that renders a viewfinder for the device's camera (either front or back) and will scan bar codes that show up in the frame.

Platform Compatibility
Android Device	Android Emulator	iOS Device	iOS Simulator	Web
Limitations
Only one active BarCodeScanner preview is currently supported.
When using navigation, the best practice is to unmount any previously rendered BarCodeScanner component so the following screens can use their own BarCodeScanner without any issue.

Known issues 
The BarCodeScanner component has difficulty scanning barcodes with black backgrounds. This is a limitation due to the underlying ZXing library. It is also an issue discussed on a Stack Overflow thread. To work around this, your app should allow users to capture the barcode image and then invert the colors of the image before passing it to the BarCodeScanner.

Installation
Terminal

Copy

npx expo install expo-barcode-scanner
If you are installing this in an existing React Native app, start by installing expo in your project. Then, follow the additional instructions as mentioned by the library's README under "Installation in bare React Native projects" section.

Configuration in app.json/app.config.js
You can configure expo-barcode-scanner using its built-in config plugin if you use config plugins in your project (EAS Build or npx expo run:[android|ios]). The plugin allows you to configure various properties that cannot be set at runtime and require building a new app binary to take effect.

Example app.json with config plugin
app.json

Copy


{
  "expo": {
    "plugins": [
      [
        "expo-barcode-scanner",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access camera."
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

Supported formats
Bar code format	Android	iOS
aztec		
codabar		
code39		*
code93		
code128		
code39mod43		
datamatrix		
ean13		
ean8		
interleaved2of5	use itf14	
itf14		*
maxicode		
pdf417		*
rss14		
rssexpanded		
upc_a		
upc_e		
upc_ean		
qr		
Additional notes
When an ITF-14 barcode is recognized, it's type can sometimes be set to interleaved2of5.
Scanning for either PDF417 and/or Code39 formats can result in a noticeable increase in battery consumption on iOS. It is recommended to provide only the bar code formats you expect to scan to the barCodeTypes prop.
Usage
You must request permission to access the user's camera before attempting to get it. To do this, you will want to use the Permissions API. You can see this in practice in the following example.

Basic BarCodeScanner usage

Copy


Open in Snack


import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
});

Show More
API
import { BarCodeScanner } from 'expo-barcode-scanner';
Component
Deprecated BarCodeScanner has been deprecated and will be removed in a future SDK version. Use expo-camera instead. See How to migrate from expo-barcode-scanner to expo-camera for more details.

BarCodeScanner
Type: React.Component<BarCodeScannerProps>

BarCodeScannerProps

barCodeTypes
Optional • Type: string[]
An array of bar code types. Usage: BarCodeScanner.Constants.BarCodeType.<codeType> where codeType is one of these listed above. Defaults to all supported bar code types. It is recommended to provide only the bar code formats you expect to scan to minimize battery usage.

For example: barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}.

onBarCodeScanned
Optional • Type: BarCodeScannedCallback
A callback that is invoked when a bar code has been successfully scanned. The callback is provided with an BarCodeScannerResult.

Note: Passing undefined to the onBarCodeScanned prop will result in no scanning. This can be used to effectively "pause" the scanner so that it doesn't continually scan even after data has been retrieved.

type
Optional • Type: 'front' | 'back' | number • Default: Type.back
Camera facing. Use one of BarCodeScanner.Constants.Type. Use either Type.front or Type.back. Same as Camera.Constants.Type.

Inherited Props
ViewProps
Hooks
usePermissions(options)
Parameter	Type
options
(optional)	PermissionHookOptions<object>

Check or request permissions for the barcode scanner. This uses both requestPermissionAsync and getPermissionsAsync to interact with the permissions.

Returns:
[null | PermissionResponse, RequestPermissionMethod<PermissionResponse>, GetPermissionMethod<PermissionResponse>]

Example

const [permissionResponse, requestPermission] = BarCodeScanner.usePermissions();
Methods
BarCodeScanner.getPermissionsAsync()
Checks user's permissions for accessing the camera.

Returns:
Promise<PermissionResponse>

Return a promise that fulfills to an object of type PermissionResponse.

BarCodeScanner.requestPermissionsAsync()
Asks the user to grant permissions for accessing the camera.

On iOS this will require apps to specify the NSCameraUsageDescription entry in the Info.plist.

Returns:
Promise<PermissionResponse>

Return a promise that fulfills to an object of type PermissionResponse.

BarCodeScanner.scanFromURLAsync(url, barCodeTypes)
Parameter	Type	Description
url	string	
URL to get the image from.

barCodeTypes
(optional)	string[]	
An array of bar code types. Defaults to all supported bar code types on the platform.

Note: Only QR codes are supported on iOS.


Scan bar codes from the image given by the URL.

Returns:
Promise<BarCodeScannerResult[]>

A possibly empty array of objects of the BarCodeScannerResult shape, where the type refers to the bar code type that was scanned and the data is the information encoded in the bar code.

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
BarCodeBounds
Name	Type	Description
origin	BarCodePoint	
The origin point of the bounding box.

size	BarCodeSize	
The size of the bounding box.

BarCodeEvent
Type: BarCodeScannerResult extended by:


Name	Type	Description
target
(optional)	number	-
BarCodeEventCallbackArguments
Name	Type	Description
nativeEvent	BarCodeEvent	-
BarCodePoint
Those coordinates are represented in the coordinate space of the barcode source (e.g. when you are using the barcode scanner view, these values are adjusted to the dimensions of the view).

Name	Type	Description
x	number	
The x coordinate value.

y	number	
The y coordinate value.

BarCodeScannedCallback()
Parameter	Type
params	BarCodeEvent
Returns:
void

BarCodeScannerResult
Name	Type	Description
bounds	BarCodeBounds	
The BarCodeBounds object. bounds in some case will be representing an empty rectangle. Moreover, bounds doesn't have to bound the whole barcode. For some types, they will represent the area used by the scanner.

cornerPoints	BarCodePoint[]	
Corner points of the bounding box. cornerPoints is not always available and may be empty. On iOS, for code39 and pdf417 you don't get this value.

data	string	
The parsed information encoded in the bar code.

type	string	
The barcode type.

BarCodeSize
Name	Type	Description
height	number	
The height value.

width	number	
The width value.

PermissionHookOptions
Literal Type: multiple types

Acceptable values are: PermissionHookBehavior | Options

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
The following permissions are added automatically through this library's AndroidManifest.xml:

Android Permission	Description
CAMERA

Required to be able to access the camera device.

iOS
The following usage description keys are used by this library:

Info.plist Key	Description
NSCameraUsageDescription

A message that tells the user why the app is requesting access to the device’s camera.
NSMicrophoneUsageDescription

A message that tells the user why the app is requesting access to the device’s microphone.
Previous (Expo SDK)

BackgroundFetch

Next (Expo SDK)

Barometer