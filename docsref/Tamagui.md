Introduction
Tamagui makes styling React easy and fast on web, Android, and iOS. It focuses on platform-native output, with an optional optimizing compiler that significantly improves your app or site performance.

Tamagui is three things:

@tamagui/core is a style library that expands on the React Native style API with many features from CSS - all without any external dependency except for React.
@tamagui/static is an optimizing compiler that significantly improves performance by hoisting objects and CSS at build-time, leaving behind flatter React trees.
tamagui is a large universal component kit in styled and unstyled forms.
Quick start
Choose from a few starters:

npm create tamagui@latest

Install
Set up an app.

Highlights
Core only has one dependency - React - but supports the full React Native View and Text API, a superset of the React Native Style API, styled(), powerful hooks, and the typed design system helpers in ~28Kb on web.

A smart, partial-evaluating compiler gives 0-runtime performance with the ergonomics of writing your code however you want - even inline, logic-filled code is optimized.

Every feature works at runtime and compile-time, so none of the usual limits of 0-runtime libraries, while optionally getting the same great performance.

useTheme and useMedia hooks with signal-like granularity and dirty tracking.

Unstyled and styled versions of all components.


Installation
We recommend using npm create to set up one or more of the example apps: npm create tamagui@latest. It gives you a variety of end-to-end examples, which is useful even if you plan to start from scratch or integrate into an existing app.

Install
The base Tamagui style library, @tamagui/core, has only one dependency: React. It's good for web-only, Native, or both:

npm install @tamagui/core

If you plan to use the full UI kit, you can avoid installing @tamagui/core altogether. Instead, use tamagui everywhere, as it's a strict superset of core. Anywhere in the docs where @tamagui/core is mentioned, you can replace it with tamagui:

npm install tamagui

We recommend yarn if you are using Tamagui in a monorepo to share code between apps, as it's proven reliable with React Native.

Add the optional TamaguiProvider to customize your design system and settings:

App.tsx

import { TamaguiProvider, View } from '@tamagui/core'
import config from './tamagui.config' // your configuration

export default function App() {
  return (
  <TamaguiProvider config={config}>
    <View width={200} height={200} backgroundColor="$background" />
  </TamaguiProvider>
  )
}

See the configuration documentation docs for a comprehensive overview of what can be in your config. If you'd like to get started more quickly with presets, we have @tamagui/config:

npm install @tamagui/config

You can use it like so:

App.tsx

import { TamaguiProvider, createTamagui } from '@tamagui/core'
import { config } from '@tamagui/config/v3'

// you usually export this from a tamagui.config.ts file
const tamaguiConfig = createTamagui(config)

// TypeScript types across all Tamagui APIs
type Conf = typeof tamaguiConfig
declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends Conf {}
}

export default () => {
  return (
    <TamaguiProvider config={tamaguiConfig}>
      {/* your app here */}
    </TamaguiProvider>
  )
}

You are ready to go.


import { Button } from 'tamagui'

export default function Demo() {
  return <Button theme="blue">Hello world</Button>
}

From here, we'd recommend spending some time understanding configuration. Tamagui works across 100% of it's features at runtime and compile-time. This means you can wait until you absolutely need more performance to set up the compiler.



Stacks
An optional base for creating flex-based layouts.

npm install @tamagui/stacks
or
npm install tamagui
yarn
npm
bun
pnpm


import React from 'react'
import { XStack, YStack, ZStack } from 'tamagui'

export function StacksDemo() {
  return (
    <XStack maxWidth={250} padding="$2" alignSelf="center" gap="$2">
      <YStack
        flex={1}
        borderWidth={2}
        borderColor="$color"
        borderRadius="$4"
        gap="$2"
        padding="$2"
      >
        <YStack backgroundColor="$color" borderRadius="$3" padding="$2" />
        <YStack backgroundColor="$color" borderRadius="$3" padding="$2" />
        <YStack backgroundColor="$color" borderRadius="$3" padding="$2" />
      </YStack>

      <XStack
        flex={1}
        borderWidth={2}
        borderColor="$color"
        borderRadius="$4"
        gap="$2"
        padding="$2"
      >
        <YStack backgroundColor="$color" borderRadius="$3" padding="$2" />
        <YStack backgroundColor="$color" borderRadius="$3" padding="$2" />
        <YStack backgroundColor="$color" borderRadius="$3" padding="$2" />
      </XStack>

      <ZStack maxWidth={50} maxHeight={85} width={100} flex={1}>
        <YStack
          fullscreen
          borderRadius="$4"
          padding="$2"
          borderColor="$color"
          borderWidth={2}
        />
        <YStack
          borderColor="$color"
          fullscreen
          y={10}
          x={10}
          borderWidth={2}
          borderRadius="$4"
          padding="$2"
        />
        <YStack
          borderColor="$color"
          fullscreen
          y={20}
          x={20}
          borderWidth={2}
          borderRadius="$4"
          padding="$2"
        />
      </ZStack>
    </XStack>
  )
}

Features
X, Y, and Z stacks for easy flex layouts.

Gap property to add space between elements.

Handle press, focus, and layout events easily.

Component Reference Links
View source
View on npm
Report an issue
Tamagui UI includes optional stack views - XStack, YStack and ZStack. They extend directly off the View from @tamagui/core.

Stack props accept every prop from react-native-web  View, as well as all the style properties Tamagui supports.

In this example you'd show three YStack elements spaced out.

import { XStack, YStack } from 'tamagui'

export default () => (
  <XStack gap="$2">
    <YStack />
    <YStack />
    <YStack />
  </XStack>
)

To see all the style properties supported, see the Props documentation.

Fuller example
An example using a wide variety of style properties:

import { Text, XStack, YStack } from 'tamagui'

export default () => (
  <XStack
    flex={1}
    flexWrap="wrap"
    backgroundColor="#fff"
    hoverStyle={{
      backgroundColor: 'red',
    }}
    // media query
    $gtSm={{
      flexDirection: 'column',
      flexWrap: 'nowrap',
    }}
  >
    <YStack gap="$3">
      <Text>Hello</Text>
      <Text>World</Text>
    </YStack>
  </XStack>
)

API Reference
XStack, YStack, ZStack
Beyond the Tamagui Props, the stacks add just two variants:

Props
fullscreen
boolean

Sets position: absolute, top: 0, left: 0, right: 0, bottom: 0.

elevation
number | tokens.size

Sets a natural looking shadow that expands out and away as the size gets bigger.