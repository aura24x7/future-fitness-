React Native
warning
These docs are for the legacy versions of Victory Native. Victory Native XL is our rewrite of Victory Native designed specifically for React Native. Please see here for more information. If you would like to continue to use this version of Victory with React Native, follow the legacy guide below.

Getting Started
In this guide, we’ll show you how to get started with Victory Native and the React Native SVG dependency running in your React Native app for iOS and Android.

1. Adding Victory Native to your React Native app
Visit the guide on getting started with React Native if you’re just getting started with React Native.

Victory Native is compatible with React Native 0.50 or higher.

To add Victory Native to your React Native app install victory-native.

$ yarn add victory-native@legacy # or npm install --save victory-native@legacy

2. Add React Native SVG to your app
If you are building a project with native code, you will need to link the native dependencies of React Native SVG to the iOS and Android projects.

This step is not required if you are using Expo (SDK 23.0.0 or higher) as it is already included.

React Native 0.60 or newer:

$ yarn add react-native-svg  # or npm install --save react-native-svg
$ cd ios
$ pod install

React Native below 0.60:

$ react-native install react-native-svg

note: If you run the iOS app and see a linker error for -lRNSVG-tvOS you will need to remove libRNSVG-tvOS.a from the “Link Binary with Libraries” section within your iOS app’s target’s properties.

3. Using Victory Native in your React Native app
Victory Native behaves and functions the same way for React Native as it does for the web. Just import components from victory-native to get started. To learn more about how to use Victory visit the Getting Started Guide.

The example below shows how Victory Native easily integrates within your React Native app.

import React from "react";
import { StyleSheet, View } from "react-native";
import { VictoryBar, VictoryChart, VictoryTheme } from "victory-native";

const data = [
  { quarter: 1, earnings: 13000 },
  { quarter: 2, earnings: 16500 },
  { quarter: 3, earnings: 14250 },
  { quarter: 4, earnings: 19000 }
];

export default function App() {
  return (
    <View style={styles.container}>
      <VictoryChart width={350} theme={VictoryTheme.clean}>
        <VictoryBar data={data} x="quarter" y="earnings" />
      </VictoryChart>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5fcff"
  }
});

4. Ignoring require cycles
see https://github.com/FormidableLabs/victory/issues/2230
As of victory@36.4.0, React Native apps (on both iOS and Android) will warn about require cycles.

These warnings will not affect the functionality of victory-native or your app, and can be safely disabled.

To disable the warnings, modify your app's entry point (usually index.js) to include

LogBox.ignoreLogs([
  "Require cycle: node_modules/victory",
]);

as shown below

+import { AppRegistry, LogBox } from "react-native";
import App from "./App";
import { name as appName } from "./app.json";

+LogBox.ignoreLogs(['Require cycle: node_modules/victory']);

AppRegistry.registerComponent(appName, () => App);

5. Testing Components that use Victory Native
You can test your components that render Victory Native using Jest and React Test Renderer which is included out–of–the box with React Native. The jest configuration section in package.json will need to be modified to ensure dependencies are transformed otherwise you will see an error when tests are run.

"jest": {
  "preset": "react-native",
  "transformIgnorePatterns": [
    "node_modules/(?!victory|react-native-svg|react-native)"
  ],
  "transform": {
    "^.+\\.jsx?$": "babel-jest"
  }
}

To test the above App component you can simply do:

import "react-native";
import React from "react";
import App from "../App.js";
import renderer from "react-test-renderer";

it("renders correctly", () => {
  const tree = renderer.create(<App />);
  expect(tree).toMatchSnapshot();
});

note: renderer must be imported after react-native for tests to work.

Expo Web Apps
Whilst using victory-native in Expo apps that target iOS & Android is fully supported, we do not support building for the web with victory-native.

However as both victory-native and victory share the same public API, it's possible to configure your Expo project so that it automatically uses victory-native when building your native apps for iOS & Android, and victory when building your web app.

☣️ Please note that while you can follow the instructions below to configure your Expo project to make this work, Victory does not officially support Expo Web apps.

yarn add -D @expo/webpack-config

Then, create a webpack.config.js file in the root of your Expo project

const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // resolve victory-native as victory for the Web app
  config.resolve.alias['victory-native'] = 'victory';

  return config;
};



Introduction
Victory Native (XL) is a from-scratch rewrite of Victory Native that favors flexibility, ease of use, and performance.

Under the hood it's using:

React Native Reanimated (v3).
React Native Gesture Handler (v2).
React Native Skia.
With a sprinkle of D3.
Reanimated and Gesture Handler offer powerful, convenient, and performant ways to handle gestures and animate UI in React Native. React Native Skia ships the Skia rendering engine (the engine that powers Google Chrome's UI) with a friendly React Native wrapper, allowing developers to write incredibly sophisticated and performant graphics code.

This toolset offers a foundation to build high-end data visualizations that can animate at over 100 FPS even on low-end devices.

Why a rewrite?
Victory was originally built for the web, leveraging the power of D3 and SVG for rendering. It was later abstracted so that custom React elements could be used to render the various parts of the data visualizations, which allowed for Victory to use React Native SVG to render Victory charts in React Native.

This worked well in many scenarios, but fell short in a few key ways:

React Native SVG wasn't designed to have a large number of nodes being updated over the bridge dynamically.
Victory's animation/gesture code triggers a lot of React re-renders, which when coupled with the first point made for almost-useless charts in Android when needing to add user interactions with datasets of any significant size.
Native mobile and web are different targets and UX differs in non-trivial ways. We believe that users expect to interact with data visualizations on mobile apps in different ways than on a desktop browser, and mobile data visualization libraries should adapt accordingly.



Getting Started
Installation
Start by installing the peer dependencies of victory-native – React Native Reanimated, Gesture Handler, and Skia:

yarn add react-native-reanimated react-native-gesture-handler @shopify/react-native-skia

For Reanimated, you'll need to add "react-native-reanimated/plugin" to your plugins list in your babel.config.js config file.

Then install victory-native:

yarn add victory-native

Now you should be ready to go.

Your first chart
Let's create a basic line chart on a Cartesian grid. Let's mock out a little bit of mock data for "high temperature" for each day in a month:

const DATA = Array.from({ length: 31 }, (_, i) => ({
  day: i,
  highTmp: 40 + 30 * Math.random(),
}));

Instantiate a chart
Now, we'll use the CartesianChart component and pass in our data, specifying which property we'll be using for our x (independent variable) and y (dependent variable) keys.

import { View } from "react-native";
import { CartesianChart } from "victory-native";

// ...

function MyChart() {
  return (
    <View style={{ height: 300 }}>
      // 👇 start our chart
      <CartesianChart data={DATA} xKey="day" yKeys={["highTmp"]} />
    </View>
  );
}

At this point, we're you'll just see a blank view, since we aren't rendering anything useful to our charting canvas.

Add a line to the chart
The CartesianChart uses a render function for its children prop. To render content inside of the Cartesian chart, you return Skia elements from the children render function. We'll use the Line component from victory-native to render a line path using our temperature data.

import { View } from "react-native";
import { CartesianChart, Line } from "victory-native";

function MyChart() {
  return (
    <View style={{ height: 300 }}>
      <CartesianChart data={DATA} xKey="day" yKeys={["highTmp"]}>
        {/* 👇 render function exposes various data, such as points. */}
        {({ points }) => (
          // 👇 and we'll use the Line component to render a line path.
          <Line points={points.highTmp} color="red" strokeWidth={3} />
        )}
      </CartesianChart>
    </View>
  );
}

Now we've got a line path to represent our daily high temperature data!

Screenshot of the line chart generated from the code above

Add some axes
You might want some axes to make your line graph a bit easier to read and interpret. The CartesianChart offers out-of-the-box support for axes and grids to make it easy to get up and running with some axes. Let's add some now.

import { View } from "react-native";
import { CartesianChart, Line } from "victory-native";
// 👇 import a font file you'd like to use for tick labels
import inter from "../assets/inter-medium.ttf";

function MyChart() {
  const font = useFont(inter, 12);

  return (
    <View style={{ height: 300 }}>
      <CartesianChart
        data={DATA}
        xKey="day"
        yKeys={["highTmp"]}
        // 👇 pass the font, opting in to axes.
        axisOptions={{ font }}
      >
        {({ points }) => (
          <Line points={points.highTmp} color="red" strokeWidth={3} />
        )}
      </CartesianChart>
    </View>
  );
}

And now we've got some axes and grid lines!

Screenshot of the line chart generated from the code above

Adding a tooltip
You might also want to give your users a way to interact with the line chart you've created. Handling user gestures can be complex, especially in canvas-like drawing context. Victory Native helps streamline this for you. To build a basic tooltip, we'll do three things.

Create a ChartPressState instance using the useChartPressState hook from victory-native.
Pass our state variable into our <CartesianChart /> element.
Use the Reanimated shared values from the ChartPressState instance in a custom ToolTip component that we'll create to create our tooltip element.
We'll start by creating our ChartPressState instance and pass it to our chart element.

// ...
import { /*...*/ useChartPressState } from "victory-native";

function MyChart() {
  // ...
  // 👇 create our chart press state
  const { state, isActive } = useChartPressState({ x: 0, y: { highTmp: 0 } });

  return (
    // ...
    <CartesianChart
      // ...
      chartPressState={state} // 👈 and pass it to our chart.
    >
      {/* ... */}
    </CartesianChart>
    // ...
  );
}

// ...

Then we'll create a ToolTip component that uses some Reanimaed SharedValues from our state variable.

import type { SharedValue } from "react-native-reanimated";
// ...

function ToolTip({ x, y }: { x: SharedValue<number>; y: SharedValue<number> }) {
  return <Circle cx={x} cy={y} r={8} color="black" />;
}

And we'll conditionally show an instance of this component when the chart press is active:

// ...
import { /*...*/ useChartPressState } from "victory-native";

function MyChart() {
  // ...
  const { state, isActive } = useChartPressState({ x: 0, y: { highTmp: 0 } });

  return (
    // ...
    <CartesianChart
      // ...
      chartPressState={state}
    >
      {
        (/*...*/) => (
          <>
            {/* 👇 Conditionally show our tooltip and pass values. */}
            {isActive ? (
              <ToolTip x={state.x.position} y={state.y.highTmp.position} />
            ) : null}
          </>
        )
      }
    </CartesianChart>
    // ...
  );
}

// ...

With this in place, we have a rather simple tooltip UI:

Putting this all together, we have something like the following:

import * as React from "react";
import { View } from "react-native";
import { CartesianChart, Line, useChartPressState } from "victory-native";
import { Circle, useFont } from "@shopify/react-native-skia";
import type { SharedValue } from "react-native-reanimated";
import inter from "../../assets/inter-medium.ttf"; // Wherever your font actually lives

function MyChart() {
  const font = useFont(inter, 12);
  const { state, isActive } = useChartPressState({ x: 0, y: { highTmp: 0 } });

  return (
    <View style={{ height: 300 }}>
      <CartesianChart
        data={DATA}
        xKey="day"
        yKeys={["highTmp"]}
        axisOptions={{
          font,
        }}
        chartPressState={state}
      >
        {({ points }) => (
          <>
            <Line points={points.highTmp} color="red" strokeWidth={3} />
            {isActive && (
              <ToolTip x={state.x.position} y={state.y.highTmp.position} />
            )}
          </>
        )}
      </CartesianChart>
    </View>
  );
}

function ToolTip({ x, y }: { x: SharedValue<number>; y: SharedValue<number> }) {
  return <Circle cx={x} cy={y} r={8} color="black" />;
}

const DATA = Array.from({ length: 31 }, (_, i) => ({
  day: i,
  highTmp: 40 + 30 * Math.random(),
}));



Basic Bar Chart
This guide will show you how to create this bar chart with some customization like corners and gradients using the CartesianChart and Bar components.

Bar Chart Example

To get started, you'll want to import the required components from Victory Native and React Native. For this guide we will assume this is being created in a View that represents a page or screen.
import { Bar, CartesianChart } from "victory-native"

Create some mock data. Victory Native requires data to be an array of objects with properties that can map to an x key and a y key. Read more about the data and key props. In this example we want a bar graph to show the number of listens a song gets for each month.
const data = Array.from({ length: 6 }, (_, index) => ({
    // Starting at 1 for Jaunary
    month: index + 1,
    // Randomizing the listen count between 100 and 50
    listenCount: Math.floor(Math.random() * (100 - 50 + 1)) + 50,
}))

Connect the data and render the bar chart with default options:
<CartesianChart
  data={data}
  /**
   * 👇 the xKey should map to the property on data of you want on the x-axis
   */
  xKey="month"
  /**
   * 👇 the yKey is an array of strings that map to the data you want
   * on the y-axis. In this case we only want the listenCount, but you could
   * add additional if you wanted to show multiple song listen counts.
   */
  yKeys={["listenCount"]}>
  {({ points, chartBounds }) => (
    <Bar
      chartBounds={chartBounds}  // 👈 chartBounds is needed to know how to draw the bars
      points={points.listenCount} // 👈 points is an object with a property for each yKey
    />
  )}
</CartesianChart>

Once rendering, it should look like this:

Bar Chart Example

By default, the first and last bar will be cut off by the edge of the chart. This is because the Bar component is using the chartBounds to know where to draw the bars. The chartBounds are the bounds of the chart, not the bounds of the data. To fix this, we can add some domain padding to the chart.

Next we want to render axis labels with the month names. We will need a font object from React Native Skia. To get a font object, we use the useFont hook and pass it a ttf file and a size. We will also use the formatXLabel prop to format the month number from a number to a month name.
//👇 Import useFont from React Native Skia
import { useFont } from "@shopify/react-native-skia"
//👇 Also import a ttf file for the font you want to use.
import inter from "../fonts/inter-medium.ttf"

const MusicChart = () => {
  const font = useFont(inter, 12) //👈 Create a font object with the font file and size.

  return (
    <CartesianChart
      data={data}
      xKey="month"
      yKeys={["listenCount"]}
      // 👇 Add domain padding to the chart to prevent the first and last bar from being cut off.
      domainPadding={{ left: 50, right: 50, top: 30 }}
      axisOptions={{
        /**
         * 👇 Pass the font object to the axisOptions.
         * This will tell CartesianChart to render axis labels.
         */
        font,
        /**
         * 👇 We will also use the formatXLabel prop to format the month number
         * from a number to a month name.
         */
        formatXLabel: (value) => {
          const date = new Date(2023, value - 1);
          return date.toLocaleString("default", { month: "short" });
        },
      }}
    >
      {({ points, chartBounds }) => (
        <Bar
          chartBounds={chartBounds}
          points={points.listenCount}
          /**
           * 👇 We can round the top corners of our bars by passing a number
           * to the roundedCorners prop. This will round the top left and top right.
           */
          roundedCorners={{
            topLeft: 5,
            topRight: 5,
          }}
        />
      )}
    </CartesianChart>
  )
}


Finally, to add a Linear Gradient fill to our bars, we use the LinearGradient component we imported and pass it as a child to the Bar component.
//👇 Add LinearGradient and vec to our imports React Native Skia
import { LinearGradient, useFont, vec } from "@shopify/react-native-skia"

The LinearGradient component takes a start and end prop that are vectors that represent the direction of the gradient. It also takes a colors prop that is an array of strings that represent the colors of the gradient. The first color in the array will be the start color and the last color in the array will be the end color. You can also add additional colors to the array to create a gradient with more than two colors.

<Bar
 // same props as above
>
  {/* 👇 We add a gradient to the bars by passing a LinearGradient as a child. */}
  <LinearGradient
    start={vec(0, 0)} // 👈 The start and end are vectors that represent the direction of the gradient.
    end={vec(0, 400)}
    colors={[ // 👈 The colors are an array of strings that represent the colors of the gradient.
      "#a78bfa",
      "#a78bfa50" // 👈 The second color is the same as the first but with an alpha value of 50%.
    ]}
  />
</Bar>


The final result should look like this:
Bar Chart Example

Here is the complete code for this example:

import { View } from "react-native"
import { Bar, CartesianChart } from "victory-native"
import { LinearGradient, useFont, vec } from "@shopify/react-native-skia"
import inter from "../fonts/inter-medium.ttf"

const MusicChart = () => {
  const font = useFont(inter, 12)
  const data = Array.from({ length: 6 }, (_, index) => ({
    month: index + 1,
    listenCount: Math.floor(Math.random() * (100 - 50 + 1)) + 50,
  }))

  return (
    <CartesianChart
      data={data}
      xKey="month"
      yKeys={["listenCount"]}
      domainPadding={{ left: 50, right: 50, top: 30 }}
      axisOptions={{
        font,
        formatXLabel(value) {
          const date = new Date(2023, value - 1)
          return date.toLocaleString("default", { month: "short" })
        },
      }}
    >
      {({ points, chartBounds }) => (
        <Bar
          chartBounds={chartBounds}
          points={points.listenCount}
          roundedCorners={{
            topLeft: 5,
            topRight: 5,
          }}
        >
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, 400)}
            colors={["#a78bfa", "#a78bfa50"]}
          />
        </Bar>
      )}
    </CartesianChart>
  )
}


Line (Component)
The Line component takes a PointsArray prop, as well as some options for styling/animating, and returns a Skia Path element to draw the line chart.

Example
import { CartesianChart, Line } from "victory-native";
import DATA from "./my-data";

export function MyChart() {
  return (
    <CartesianChart data={DATA} xKey="x" yKeys={["y"]}>
      {({ points }) => (
        //👇 pass a PointsArray to the Line component, as well as options.
        <Line
          points={points.y}
          color="red"
          strokeWidth={3}
          animate={{ type: "timing", duration: 300 }}
        />
      )}
    </CartesianChart>
  );
}

Props
points
A PointsArray array that comes from a field of the points object exposed the children render function of CartesianChart, as illustrated in the example above.

animate
The animate prop takes a PathAnimationConfig object and will animate the path when the points changes.

curveType
A CurveType value that indicates the type of curve should be drawn (e.g. linear or natural).

connectMissingData
The connectMissingData: boolean value that indicates whether missing data should be interpolated for the resulting Path. If set to true, the output will be a single, connected line chart path (even if there are missing data values). If set to false, if there is missing data values – the path will consist of multiple disconnected "parts".

connectMissingData={false}

Interpolate missing data

connectMissingData={true}

Interpolate missing data

children
A children pass-thru that will be rendered inside of the Skia Path element, useful if you'd like to make e.g. a gradient path.

Paint properties
The Line component will also pass the following painting props down to the underlying Path component:

color
strokeWidth
strokeJoin
strokeCap
blendMode
strokeMiter
opacity
antiAlias

useLinePath
The useLinePath hook takes a PointsArray input, as well as some options, and returns a Skia SkPath path object that represents the path for that line chart.

Example
import { CartesianChart, useLinePath, type PointsArray } from "victory-native";
import { Path } from "@shopify/react-native-skia";
import DATA from "./my-data";

function MyCustomLine({ points }: { points: PointsArray }) {
  // 👇 use the hook to generate a path object.
  const { path } = useLinePath(points, { curveType: "natural" });
  return <Path path={path} style="stroke" strokeWidth={3} color="red" />;
}

export function MyChart() {
  return (
    <CartesianChart data={DATA} xKey="x" yKeys={["y"]}>
      {/* 👇 pass a PointsArray to our custom component */}
      {({ points }) => <MyCustomLine points={points.y} />}
    </CartesianChart>
  );
}

Arguments
useLinePath has a function signature as follows:

useLinePath(points: PointsArray, options?: { curveType?: CurveType }): { path: SkPath }

points
The points argument is a PointsArray array used to generate the line's path. Generally, this array comes from a field of the points object exposed the children render function of CartesianChart, as illustrated in the example above.

options
The options argument object has the following fields:

curveType: CurveType: the type of curve to use for the path, powered by d3-shape. The options are:
linear (default)
natural
bumpX
bumpY
cardinal
cardinal50
catmullRom
catmullRom0
catmullRom100
step
connectMissingData: boolean: whether or not to interpolate missing data for this path (default is false). If set to true, the output will be a single, connected path (even if there are missing data values).
Returns
path
The SkPath path object to be used as the path argument of a Skia <Path /> element.


Containers
Defaults
Victory containers have default width, height, and padding props defined in the default theme.

Victory renders components into responsive svg containers by default using VictoryContainer. VictoryContainer is a responsive container with a viewBox attribute set to viewBox={"0 0 width, height"} and styles width: "100%" height: "auto" in addition to any styles provided via props. Because Victory renders responsive containers, the width and height props do not determine the width and height of the chart in number of pixels, but instead define an aspect ratio for the chart. The exact number of pixels will depend on the size of the container the chart is rendered into.

Fixed Size Containers
Responsive containers are not appropriate for every application, so Victory provides a couple of options for rendering static containers. The easiest way to render a static container rather than a responsive one is by setting the responsive prop to false directly on the containerComponent instance.

Live View
Live Editor
<VictoryChart
  height={200}
  width={300}
  containerComponent={
    <VictoryContainer
      responsive={false}
    />
  }
  theme={VictoryTheme.clean}
>
  <VictoryLine
    y={(data) =>
      Math.sin(2 * Math.PI * data.x)
    }
  />
</VictoryChart>
Render Order
Victory renders svg elements, so there is no concept of z-index. Instead the render order of components determines which elements will appear above others. Changing the order of rendered components can significantly alter the appearance of a chart. Compare the following charts.

note
The difference is the order of the children in VictoryChart.

Live View
Live Editor
const sampleFn = (data) =>
  Math.sin(2 * Math.PI * data.x);

const scatterStyle = {
  data: { fill: "red" },
};

function App() {
  return (
    <>
      <VictoryChart
        theme={VictoryTheme.clean}
      >
        <VictoryScatter
          y={sampleFn}
          samples={25}
          size={5}
          style={scatterStyle}
        />
        <VictoryLine y={sampleFn} />
      </VictoryChart>

      <VictoryChart
        theme={VictoryTheme.clean}
      >
        <VictoryLine y={sampleFn} />
        <VictoryScatter
          y={sampleFn}
          samples={25}
          size={5}
          style={scatterStyle}
        />
      </VictoryChart>
    </>
  );
}

render(<App />);
Render on Top
Some components should always render above others. Use VictoryPortal to render components in a top level container so that they appear above all other elements. VictoryTooltip uses VictoryPortal, by default, but any component may be wrapped in VictoryPortal to alter its rendering.

warning
VictoryPortal only works with components that are rendered within a Victory Container component.

Live View
Live Editor
<VictoryChart
  domainPadding={40}
  theme={VictoryTheme.clean}
>
  <VictoryStack
    colorScale="warm"
    style={{
      data: { width: 30 },
      labels: { padding: -20 },
    }}
    labelComponent={
      <VictoryPortal>
        <VictoryLabel />
      </VictoryPortal>
    }
  >
    <VictoryBar
      data={[
        { x: 1, y: 3, label: "C" },
        { x: 2, y: 4, label: "C" },
        { x: 3, y: 2, label: "C" },
      ]}
    />
    <VictoryBar
      data={[
        { x: 1, y: 3, label: "B" },
        { x: 2, y: 4, label: "B" },
        { x: 3, y: 2, label: "B" },
      ]}
    />
    <VictoryBar
      data={[
        { x: 1, y: 3, label: "A" },
        { x: 2, y: 4, label: "A" },
        { x: 3, y: 2, label: "A" },
      ]}
    />
  </VictoryStack>
  <VictoryAxis />
</VictoryChart>
Basic Container Types
Victory renders charts into top-level container components. The most commonly used container is VictoryChart.

Containers are responsible for rendering children into a responsive svg, and providing a portal component for rendering tooltips, or any other elements that should be rendered above everything else.

VictoryContainer
VictoryContainer provides a top-level <svg> element for other Victory components to render within. Most containers extend VictoryContainer to add extra functionality.

See the full API here.

VictoryChart
VictoryChart is a container that renders a set of children on a set of Cartesian or polar axes. VictoryChart reconciles the domain for all its children, controls the layout of the chart, and coordinates animations and shared events. If no children are provided, VictoryChart will render a set of empty default axes.

See the full API here.

Advanced Container Types
VictorySelectionContainer
VictoryZoomContainer
VictoryVoronoiContainer
VictoryGroup
VictoryGroup is a container that renders a given set of children with shared props. This is useful for creating a group of components that share styles or data, or rendering multiple charts without axes.

See the full API here.

VictoryBrushContainer
VictoryBrushContainer adds the ability to highlight a region of a chart, and interact with highlighted regions, either by moving the region, expanding the region, or selecting a new region.

See the Brush Selection guide.

VictoryCursorContainer
VictoryCursorContainer adds a cursor to a chart to inspect coordinates. The cursor can either be a 2-dimensional crosshair, or a 1-dimensional line. The cursor moves with the mouse (or on touch on mobile devices) along the visible domain of the chart.

See the Cursor Tooltips guide.

VictorySelectionContainer
VictorySelectionContainer is used to enable selecting data points within a highlighted region. Clicking and dragging will select an x-y region, and add the active prop to any elements corresponding to data points within the region. Create a select-box control by tying the set of selected data points to other elements, such as a filtered table.

See the Data Selection guide.

VictoryZoomContainer
VictoryZoomContainer provides pan and zoom behavior for any Victory component that works with an x, y axis. Zoom events are controlled by scrolling, and panning events are controlled by dragging.

See the Pan and Zoom guide.

VictoryVoronoiContainer
VictoryVoronoiContainer adds the ability to associate a mouse position with the data point(s) closest to it. When this container is added to a chart, changes in mouse position will add the active prop to data and label components closest to the current mouse position.

See the Tooltips guide.

Multiple Containers
Victory includes a createContainer helper that is used to create hybrid containers. createContainer can be used to create a new container with behaviors from two existing Victory containers.

It allows you to effectively combine any two of the following containers: VictoryBrushContainer, VictoryCursorContainer, VictorySelectionContainer, VictoryVoronoiContainer, or VictoryZoomContainer.

const VictoryZoomVoronoiContainer = createContainer("zoom", "voronoi");

Arguments
The function takes two behavior arguments as strings:

createContainer(behaviorA, behaviorB)

Behavior
Each behavior must be one of the following strings: "brush", "cursor", "selection", "voronoi", and "zoom". The resulting container uses the events from both behaviors. For example, if both behaviors use the click event (like zoom and selection) the combined container will trigger both behaviors' events on each click.

Note: Order of the behaviors matters in a few cases. It is recommended to use "zoom" before any other behaviors: for example, createContainer("zoom", "voronoi") instead of createContainer("voronoi", "zoom").

Example
The following example creates a custom container that combines VictoryVoronoiContainer and VictoryZoomContainer. Hovering over the chart will use Voronoi to highlight data points, while scrolling and dragging will zoom and pan.

Live View
Live Editor
const VictoryZoomVoronoiContainer = createContainer("zoom", "voronoi");
const data = _.range(100).map((x) => ({x, y: 100 + x + _.random(10)}));

const App = () => (
  <VictoryChart
    containerComponent={
      <VictoryZoomVoronoiContainer
        labels={({ datum }) => `${datum.x}, ${datum.y}`}
      />
    }
    theme={VictoryTheme.clean}
  >
    <VictoryScatter data={data} />
  </VictoryChart>
);

render(<App/>);


Axis
When composing charts with VictoryChart, axes will be automatically added to your chart.

Optionally, you also can directly configure the axes using the VictoryAxis and VictoryPolarAxis components by following this guide.

VictoryAxis
Creates linear independent and dependent axes.

info
See the full API for VictoryAxis for more details.

Basic
The VictoryAxis component can be used to render a basic axis.

Live View
Live Editor
<VictoryChart
  theme={VictoryTheme.clean}
>
  <VictoryAxis crossAxis />
  <VictoryAxis dependentAxis />
  <VictoryLine
    data={[
      { x: 1, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 5 },
      { x: 4, y: 4 },
      { x: 5, y: 7 },
    ]}
  />
</VictoryChart>
Axis - Single
The crossAxis prop can be used to render a horizontal axis, and the dependentAxis prop can be used to render a vertical axis.

Live View
Live Editor
<VictoryChart
  theme={VictoryTheme.clean}
>
  <VictoryAxis crossAxis />
  <VictoryLine
    data={[
      { x: 1, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 5 },
      { x: 4, y: 4 },
      { x: 5, y: 7 },
    ]}
  />
</VictoryChart>
Axis - Gridlines
Gridlines can be shown by styling the axis component.

Live View
Live Editor
<VictoryChart
  theme={VictoryTheme.clean}
>
  <VictoryAxis
    crossAxis
    style={{
      grid: {
        stroke: "#CFD8DC",
        strokeDasharray: "10, 5",
      },
    }}
  />
  <VictoryAxis
    dependentAxis
    style={{
      grid: {
        stroke: ({ tick }) =>
          tick === 5
            ? "#2d7ff9"
            : "#CFD8DC",
        strokeDasharray: "10, 5",
      },
    }}
  />
  <VictoryLine
    data={[
      { x: 1, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 5 },
      { x: 4, y: 4 },
      { x: 5, y: 7 },
    ]}
  />
</VictoryChart>
Axis - Tick Values
You can specify the specific tick values you would like to display on the axis using the tickValues prop.

Live View
Live Editor
<VictoryChart
  theme={VictoryTheme.clean}
>
  <VictoryAxis
    crossAxis
    tickValues={[0, 2, 4, 6]}
  />
  <VictoryLine
    data={[
      { x: 1, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 5 },
      { x: 4, y: 4 },
      { x: 5, y: 7 },
    ]}
  />
</VictoryChart>
Axis - Tick Label Format
Use the tickFormat prop to customize axis labels. This prop can be given as an array of strings, or as a function that returns a string.

caution
VictoryChart automatically applies "smart" formatting to an axis for dates. When using a custom VictoryAxis or VictoryPolarAxis, you will need to format the tick values and labels manually as shown below.

Live View
Live Editor
<VictoryChart
  theme={VictoryTheme.clean}
>
  <VictoryAxis
    crossAxis
    tickFormat={(tick) =>
      `$${Math.round(tick)}M`
    }
  />
  <VictoryLine
    data={[
      { x: 1, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 5 },
      { x: 4, y: 4 },
      { x: 5, y: 7 },
    ]}
  />
</VictoryChart>
Multiline Label Support
You can also return an array of strings to create multiline labels.

Live View
Live Editor
<VictoryChart
  theme={VictoryTheme.clean}
>
  <VictoryAxis
    crossAxis
    tickFormat={(tick) => [
      `$${Math.round(tick)}`,
      "Million",
    ]}
  />
  <VictoryLine
    data={[
      { x: 1, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 5 },
      { x: 4, y: 4 },
      { x: 5, y: 7 },
    ]}
  />
</VictoryChart>
Time formats using d3-time
To replicate the behaviour of automatically formatting times in VictoryChart, you can use d3-scale to format the tick values and labels.

Live View
Live Editor
const data = [
  { x: new Date(2021, 5, 1), y: 8 },
  { x: new Date(2021, 5, 2), y: 10 },
  { x: new Date(2021, 5, 3), y: 7 },
  { x: new Date(2021, 5, 4), y: 4 },
  { x: new Date(2021, 5, 7), y: 6 },
  { x: new Date(2021, 5, 8), y: 3 },
  { x: new Date(2021, 5, 9), y: 7 },
  { x: new Date(2021, 5, 10), y: 9 },
  { x: new Date(2021, 5, 11), y: 6 },
];

const domain = {
  x: [
    Math.min(...data.map((d) => d.x)),
    Math.max(...data.map((d) => d.x)),
  ],
};

// ref: https://d3js.org/d3-scale/time
const timeScaledomain = d3Scale
  .scaleTime()
  .domain(domain.x);

// ref: https://d3js.org/d3-scale/time#time_ticks
const ticks = timeScaledomain.ticks(6);

// ref: https://d3js.org/d3-scale/time#time_tickFormat
const formatter =
  timeScaledomain.tickFormat();

function App() {
  return (
    <VictoryChart
      theme={VictoryTheme.clean}
    >
      <VictoryAxis
        crossAxis
        tickValues={ticks}
        tickFormat={formatter}
      />
      <VictoryLine data={data} />
    </VictoryChart>
  );
}

render(<App />);
Axis - Offset Position
You can offset the position of the axis using the offsetX and offsetY props.

Live View
Live Editor
<VictoryChart
  theme={VictoryTheme.clean}
>
  <VictoryAxis
    dependentAxis
    offsetX={225}
  />
  <VictoryLine
    data={[
      { x: 1, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 5 },
      { x: 4, y: 4 },
      { x: 5, y: 7 },
    ]}
  />
</VictoryChart>
Axis - Orientation
The axis orientation can be set to top, bottom, left, or right using the orientation prop.

Live View
Live Editor
<VictoryChart
  theme={VictoryTheme.clean}
>
  <VictoryAxis
    dependentAxis
    orientation="right"
  />
  <VictoryLine
    data={[
      { x: 1, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 5 },
      { x: 4, y: 4 },
      { x: 5, y: 7 },
    ]}
  />
</VictoryChart>
Axis - Labels
The axis supports labels using the label prop.

Live View
Live Editor
<VictoryChart
  theme={VictoryTheme.clean}
>
  <VictoryAxis
    dependentAxis
    label="Sample Values"
  />
  <VictoryAxis
    crossAxis
    label="Sample Input"
  />
  <VictoryLine
    data={[
      { x: 1, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 5 },
      { x: 4, y: 4 },
      { x: 5, y: 7 },
    ]}
  />
</VictoryChart>
Axis - Multiple
Multiple axes can be added to a chart by nesting VictoryAxis components within VictoryChart.

info
The domain is shared between all dependent axes, so you need to normalize the data to fit the domain of each axis.

Live View
Live Editor
const data = [
  { x: 1, amps: 4, temp: 44 },
  { x: 2, amps: 6, temp: 51 },
  { x: 3, amps: 11, temp: 65 },
  { x: 4, amps: 12, temp: 71 },
  { x: 5, amps: 10, temp: 71 },
  { x: 6, amps: 13, temp: 71 },
  { x: 7, amps: 11, temp: 71 },
];

const ampRange = [0, 20];
const ampAxisColor =
  VictoryTheme.clean.palette.blue[3];

const tempRange = [0, 100];
const tempAxisColor =
  VictoryTheme.clean.palette.red[3];

const ticks = 10;
const tickValues = _.range(ticks + 1);
const domain = { y: [0, ticks] };

const tickFormat = (range) => (t) =>
  (t * (range[1] - range[0])) / ticks;

const normalize =
  (range, props) => (datum) =>
    datum[props] /
    ((range[1] - range[0]) / ticks);

function App() {
  return (
    <VictoryChart
      theme={VictoryTheme.clean}
      domain={domain}
    >
      <VictoryAxis crossAxis />
      <VictoryAxis
        dependentAxis
        orientation="left"
        tickValues={tickValues}
        tickFormat={tickFormat(
          ampRange,
        )}
        style={{
          axis: {
            stroke: ampAxisColor,
          },
          ticks: {
            stroke: ampAxisColor,
          },
          tickLabels: {
            fill: ampAxisColor,
          },
        }}
      />
      <VictoryAxis
        dependentAxis
        orientation="right"
        tickValues={tickValues}
        tickFormat={tickFormat(
          tempRange,
        )}
        style={{
          axis: {
            stroke: tempAxisColor,
          },
          ticks: {
            stroke: tempAxisColor,
          },
          tickLabels: {
            fill: tempAxisColor,
          },
        }}
      />
      <VictoryLine
        data={data}
        y={normalize(ampRange, "amps")}
        style={{
          data: {
            stroke: ampAxisColor,
          },
        }}
      />
      <VictoryLine
        data={data}
        y={normalize(tempRange, "temp")}
        style={{
          data: {
            stroke: tempAxisColor,
          },
        }}
      />
    </VictoryChart>
  );
}

render(<App />);
Axis - Dependent
Dependent axes can be aligned to their corresponding data points by setting the axisValue prop.

Live View
Live Editor
<VictoryChart
  theme={VictoryTheme.clean}
>
  <VictoryBar
    data={[
      { x: "cat", y: 10 },
      { x: "dog", y: 25 },
      { x: "bird", y: 40 },
      { x: "frog", y: 50 },
      { x: "fish", y: 50 },
    ]}
  />
  <VictoryAxis />
  {[
    "cat",
    "dog",
    "bird",
    "dog",
    "frog",
    "fish",
  ].map((d, i) => {
    return (
      <VictoryAxis
        dependentAxis
        key={i}
        label={d}
        style={{
          tickLabels: { fill: "none" },
        }}
        axisValue={d}
      />
    );
  })}
</VictoryChart>
Axis - Small Values
When a dataset only has a single value, or when all values on an axis have the same value, the single-point domain for that axis will be converted to a two-point domain. Victory does this by offsetting the domain value by a very small number. To solve this, you will need to manually set sensible defaults on the domain of your chart.

Live View
Live Editor
<VictoryChart
  domain={{ x: [0, 2] }}
  theme={VictoryTheme.clean}
>
  <VictoryBar data={[{ x: 1, y: 1 }]} />
</VictoryChart>
Axis - Common Label Problems
Long axis labels can be problematic. There are several ways to address the issue. The best solution will depend on the specific requirements of your project. The following examples demonstrate:

info
Using padding properties can help to adjust the position of the axis labels.

Live View
Live Editor
<VictoryChart
  padding={{
    left: 90,
    top: 50,
    right: 10,
    bottom: 50,
  }}
  theme={VictoryTheme.clean}
>
  <VictoryAxis
    dependentAxis
    tickFormat={[
      "first label",
      "second label",
      "third label",
      "forth label",
      "fifth label",
    ]}
  />
  <VictoryAxis />
  <VictoryLine />
</VictoryChart>
info
Splitting the labels onto multiple lines can help to make the labels more readable.

Live View
Live Editor
<VictoryChart
  theme={VictoryTheme.clean}
>
  <VictoryAxis
    dependentAxis
    tickFormat={[
      `first\nlabel`,
      `second\nlabel`,
      `third\nlabel`,
      `forth\nlabel`,
      `fifth\nlabel`,
    ]}
  />
  <VictoryAxis />
  <VictoryLine />
</VictoryChart>
info
Using angled labels can help to make the labels more readable.

Live View
Live Editor
<VictoryChart
  theme={VictoryTheme.clean}
>
  <VictoryAxis
    dependentAxis
    style={{
      tickLabels: { angle: -60 },
    }}
    tickFormat={[
      "first label",
      "second label",
      "third label",
      "forth label",
      "fifth label",
    ]}
  />
  <VictoryAxis />
  <VictoryLine />
</VictoryChart>
info
Fixing axis label and tick label overlap using the style prop.

Live View
Live Editor
<VictoryChart
  theme={VictoryTheme.clean}
  padding={{
    left: 90,
    top: 50,
    right: 50,
    bottom: 50,
  }}
>
  <VictoryAxis
    dependentAxis
    style={{
      axisLabel: { padding: 60 },
    }}
    label="Axis Label"
    tickFormat={[
      "1000K",
      "2000k",
      "3000k",
      "4000k",
      "5000k",
    ]}
  />
  <VictoryAxis />
  <VictoryLine />
</VictoryChart>
Axis - Brush Lines
Brush lines can be added to the axis using the VictoryBrushLine component for selecting a range of the domain.

info
See the full API for VictoryBrushLine for more details.

Live View
Live Editor
<VictoryChart
  theme={VictoryTheme.clean}
>
  <VictoryBar
    data={[
      { x: "one", y: 4 },
      { x: "two", y: 5 },
      { x: "three", y: 6 },
    ]}
  />
  <VictoryAxis
    axisComponent={
      <VictoryBrushLine
        brushWidth={20}
      />
    }
  />
</VictoryChart>
VictoryPolarAxis
Creates a circular axis for a chart.

info
See the full API for VictoryPolarAxis for more details.

Basic
The VictoryPolarAxis component can be used to render a basic axis for polar charts.

Live View
Live Editor
<VictoryChart
  theme={VictoryTheme.clean}
  polar
>
  <VictoryPolarAxis crossAxis />
  <VictoryPolarAxis dependentAxis />
  <VictoryLine
    data={[
      { x: 1, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 5 },
      { x: 4, y: 4 },
      { x: 5, y: 7 },
    ]}
  />
</VictoryChart>
Axis - Angle
The dependent axis can be rendered at different angles.

Live View
Live Editor
<VictoryChart
  theme={VictoryTheme.clean}
  polar
>
  <VictoryPolarAxis crossAxis />
  <VictoryPolarAxis
    dependentAxis
    axisAngle={45}
  />
  <VictoryLine
    data={[
      { x: 1, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 5 },
      { x: 4, y: 4 },
      { x: 5, y: 7 },
    ]}
  />
</VictoryChart>
Axis - Labels
The label placement can be adjusted by using the labelPlacement prop.

Live View
Live Editor
<VictoryChart
  theme={VictoryTheme.clean}
  polar
>
  <VictoryPolarAxis
    crossAxis
    labelPlacement="vertical"
  />
  <VictoryLine
    data={[
      { x: 1, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 5 },
      { x: 4, y: 4 },
      { x: 5, y: 7 },
    ]}
  />
</VictoryChart>
Axis - Half Circle
The polar axis can also be rendered in a confined set of angles. When VictoryPolarAxis is a child of VictoryChart, the startAngle and endAngle props will be set by the domain data.

Live View
0
90
180
270
0
45
90
135
180
Live Editor
<div style={{ display: "flex" }}>
  <VictoryPolarAxis
    startAngle={90}
    endAngle={450}
    tickValues={[0, 90, 180, 270]}
    labelPlacement="vertical"
  />
  <VictoryPolarAxis
    startAngle={0}
    endAngle={180}
    tickValues={[0, 45, 90, 135, 180]}
  />
</div>


Themes & Styling
Themes
Try out the Victory themes and make your own. Check out the VictoryTheme API documentation more details on themes.

Live View
use grayscaleuse materialuse clean
A
B
C
D
E
0
1
0.2
0.4
0.6
0.8
1.0
1
2
3
2
4
6
8
10
A
B
C
2.0
4.0
6.0
Live Editor
const result = [...Array(10).keys()];

const scatterData = [
  ...Array(20).keys(),
].forEach((i) => ({
  x: (i - 10) / 3,
  y: i / 2 - 2 * Math.random() - 4,
}));

const toInteger = (number) =>
  parseInt(number).toString();

const DemoComponent = () => {
  const [theme, setTheme] =
    React.useState(
      VictoryTheme.grayscale,
    );

  const positions = [
    { transform: "translate(0, -15)" },
    {
      transform: "translate(180, -40)",
    },
    {
      transform: "translate(-10, 140)",
    },
    {
      transform: "translate(180, 140)",
    },
  ];
  return (
    <div>
      <div className="mb-8 p-4 mx-auto">
        <button
          className="bg-gray-600 border border-gray-800 text-white uppercase py-6 px-12"
          onClick={() =>
            setTheme(
              VictoryTheme.grayscale,
            )
          }
        >
          use grayscale
        </button>
        <button
          className="bg-orange-600 border border-blue-800 text-white uppercase py-6 px-12 ml-2"
          onClick={() =>
            setTheme(
              VictoryTheme.material,
            )
          }
        >
          use material
        </button>
        <button
          className="bg-blue-600 border border-blue-800 text-white uppercase py-6 px-12 ml-2"
          onClick={() =>
            setTheme(VictoryTheme.clean)
          }
        >
          use clean
        </button>
      </div>
      <svg
        viewBox="0 0 400 400"
        role="img"
        aria-labelledby="title desc"
        style={{
          height: "auto",
          width: "100%",
        }}
      >
        <g
          transform={
            positions[0].transform
          }
        >
          <VictoryPie
            theme={theme}
            standalone={false}
            style={{
              labels: { padding: 10 },
            }}
            height={200}
            width={200}
          />
        </g>
        <g
          transform={
            positions[1].transform
          }
        >
          <VictoryChart
            theme={theme}
            standalone={false}
            height={250}
            width={250}
          >
            <VictoryAxis
              tickCount={3}
              tickFormat={toInteger}
            />
            <VictoryAxis
              tickCount={4}
              dependentAxis
            />
            <VictoryScatter
              size={2}
              data={scatterData}
            />
          </VictoryChart>
        </g>

        <g
          transform={
            positions[2].transform
          }
        >
          <VictoryChart
            theme={theme}
            standalone={false}
            height={250}
            width={250}
          >
            <VictoryAxis
              tickCount={4}
              domain={[0, 3]}
              tickFormat={toInteger}
            />
            <VictoryAxis
              tickCount={4}
              dependentAxis
              domain={[0, 10]}
            />
            <VictoryLine
              y={(data) =>
                data.x * data.x
              }
            />
          </VictoryChart>
        </g>

        <g
          transform={
            positions[3].transform
          }
        >
          <VictoryChart
            standalone={false}
            theme={theme}
            height={250}
            width={250}
            domainPadding={{ x: 40 }}
          >
            <VictoryAxis
              tickFormat={[
                "A",
                "B",
                "C",
              ]}
            />
            <VictoryAxis
              tickCount={3}
              dependentAxis
            />
            <VictoryStack>
              <VictoryBar
                data={[
                  {
                    x: "A",
                    y: 1,
                  },
                  {
                    x: "B",
                    y: 3,
                  },
                  {
                    x: "C",
                    y: 3,
                  },
                ]}
              />
              <VictoryBar
                data={[
                  {
                    x: "A",
                    y: 2,
                  },
                  {
                    x: "B",
                    y: 1,
                  },
                  {
                    x: "C",
                    y: 3,
                  },
                ]}
              />
              <VictoryBar
                data={[
                  {
                    x: "A",
                    y: 3,
                  },
                  {
                    x: "B",
                    y: 1,
                  },
                  {
                    x: "C",
                    y: 1,
                  },
                ]}
              />
            </VictoryStack>
          </VictoryChart>
        </g>
      </svg>
    </div>
  );
};

render(<DemoComponent />);
Styles
How can I change the colors of lines and other elements in Victory?
Most components in Victory use a standard style prop with style namespaces for "data" and "labels". Any styles added to the "data" namespace will be applied to all the svg elements rendered for a given dataset.

Live View
Live Editor
<VictoryChart
  theme={VictoryTheme.clean}
  domain={{ x: [0, 4] }}
>
  <VictoryBar
    style={{ data: { fill: "red" } }}
    data={[
      { x: 1, y: 2 },
      { x: 2, y: 4 },
      { x: 3, y: 6 },
    ]}
  />
  <VictoryLine
    style={{
      data: {
        stroke: "blue",
        strokeWidth: 5,
      },
    }}
    y={(d) => d.x}
  />
</VictoryChart>
How can I change the color of an individual point or bar?
Individual elements in Victory can be styled by adding style attributes directly to your data object and using functional styles and props as in the example below. Functions are called with all the props that correspond to the element they render.

Live View
Live Editor
<VictoryChart>
  <VictoryBar
    style={{
      data: {
        fill: ({ datum }) => datum.fill,
      },
    }}
    data={[
      { x: 1, y: 2, fill: "red" },
      { x: 2, y: 4, fill: "orange" },
      { x: 3, y: 6, fill: "gold" },
    ]}
  />
  <VictoryScatter
    style={{
      data: {
        fill: ({ index }) =>
          +index % 2 === 0
            ? "blue"
            : "grey",
        stroke: ({ datum }) =>
          datum.y < 6 ? "red" : "black",
        strokeWidth: 2,
      },
    }}
    symbol={({ datum }) =>
      datum.x > 1 ? "plus" : "square"
    }
    size={({ datum }) => datum.y + 2}
    data={[
      { x: 0, y: 2 },
      { x: 1, y: 4 },
      { x: 2, y: 6 },
      { x: 3, y: 8 },
      { x: 4, y: 10 },
    ]}
  />
</VictoryChart>
Note that continuous data types such as VictoryLine and VictoryArea cannot be styled in this way, as they only render a single element for a given dataset.

Gradient Fills
Create a gradient def as usual and then reference it by id in your style object. Gradients can be used to give continuous charts (i.e. line or area charts) the appearance of discrete data elements and hover states.

Live View
Live Editor
<div>
  <svg style={{ height: 0 }}>
    <defs>
      <linearGradient id="myGradient">
        <stop
          offset="0%"
          stopColor="red"
        />
        <stop
          offset="25%"
          stopColor="orange"
        />
        <stop
          offset="50%"
          stopColor="gold"
        />
        <stop
          offset="75%"
          stopColor="yellow"
        />
        <stop
          offset="100%"
          stopColor="green"
        />
      </linearGradient>
    </defs>
  </svg>
  <VictoryChart
    theme={VictoryTheme.clean}
  >
    <VictoryArea
      style={{
        data: {
          fill: "url(#myGradient)",
        },
      }}
      data={[
        { x: 1, y: 2 },
        { x: 2, y: 3 },
        { x: 3, y: 7 },
        { x: 4, y: 4 },
        { x: 5, y: 5 },
      ]}
    />
  </VictoryChart>
</div>
Previous
Polar Charts
