Line Chartsprops table
Minimal Line Chart
The simplest Bar chart can be made with just-
import { LineChart } from "react-native-gifted-charts";
        
const App = () => {
    const data = [{value: 15}, {value: 30}, {value: 26}, {value: 40}];
    return <LineChart data={data}/>;
};
Output-

Styling the Chart
In the above code snippet, at line number 5, add the prop color={'#177AD5'}
This will result in-


Adding the color prop changes the color of the line, similary adding the thickness changes the thickness of the line, and adding the dataPointsColor changes the color of the line

The new code after adding the color, thickness and the dataPointsColor props-

import { LineChart } from "react-native-gifted-charts";
        
const App = () => {
    const data = [{value: 15}, {value: 30}, {value: 26}, {value: 40}];
    return (
        <LineChart
        data={lineData}
        color={'#177AD5'}
        thickness={3}
        dataPointsColor={'red'}
      />
    );
};
Output-


Now that we know styling the chart, let's try making the below line chart-


import { LineChart } from "react-native-gifted-charts"
const App = () => {
  const lineData = [{value: 0},{value: 20},{value: 18},{value: 40},{value: 36},{value: 60},{value: 54},{value: 85}]
  return (
      <View style={{backgroundColor: '#1A3461'}}>
          <LineChart
              initialSpacing={0}
              data={lineData}
              spacing={30}
              hideDataPoints
              thickness={5}
              hideRules
              hideYAxisText
              yAxisColor="#0BA5A4"
              showVerticalLines
              verticalLinesColor="rgba(14,164,164,0.5)"
              xAxisColor="#0BA5A4"
              color="#0BA5A4"
          />
      </View>
  );
};
Prefix and Suffix
Sometimes, the y-axis has values like- $10, $20, $30... or $10k, $20k, $30k...
The data for the above cases would have been [10, 20, 30...].

We can use the prop yAxisLabelPrefix to add the prefix- `$` (or any other prefix) before each label on the y-axis.
Similary, we can use the yAxisLabelSuffix prop to add a suffix after each label on the y-axis.

Pro tip All properties related to the axes and axes labels are common across Bar, Line and Area charts. Visit theBar charts pageto see all the axes related properties.

Curved Line Chart
Adding the prop curved turns the line into a curve. The above chart after adding the curved prop-


curveType and curvature
Currently, we support 2 types of curves-

Cubic bezier curve
Quadratic bezier curve
The default curveType is cubiz bezier curve. To change it to quadratic, pass the prop curveType={CurveType.QUADRATIC}
The curvature takes a value between 0 and 1. The default curvature value is 0.2
curvature works only for cubic bezier curves. When curvature value is 0, the curve becomes straight line.

Labelled Line Chart
Adding the property dataPointText in the data array displays labels beside the data points.


import { LineChart } from "react-native-gifted-charts"
const App = () => {
  const lineData = [
      {value: 0, dataPointText: '0'},
      {value: 20, dataPointText: '20'},
      {value: 18, dataPointText: '18'},
      {value: 40, dataPointText: '40'},
      {value: 36, dataPointText: '36'},
      {value: 60, dataPointText: '60'},
      {value: 54, dataPointText: '54'},
      {value: 85, dataPointText: '85'}
  ];
  return (
      <View style={{backgroundColor: '#1A3461'}}>
          <LineChart
              initialSpacing={0}
              data={lineData}
              spacing={30}
              textColor1="yellow"
              textShiftY={-8}
              textShiftX={-10}
              textFontSize={13}
              thickness={5}
              hideRules
              hideYAxisText
              yAxisColor="#0BA5A4"
              showVerticalLines
              verticalLinesColor="rgba(14,164,164,0.5)"
              xAxisColor="#0BA5A4"
              color="#0BA5A4"
          />
      </View>
  );
};
showValuesAsDataPointsText
In the above example, we can see that the dataPointText is same as value of the data point. In such a case we can simply pass the prop showValuesAsDataPointsText and then we will not have to add the dataPointText property to each data item.


Animated Line Chart
Adding the prop isAnimated to the <LineChart/> component renders the chart with an animation effect.



Multiple Lines
Line charts are often used to compare 2 or more data sets. Below is an example -


For such type of charts, we pass 2 data sets named data and data2
Here is the code for the above chart -

import { LineChart } from "react-native-gifted-charts"
const App = () => {
  const lineData = [
      {value: 0, dataPointText: '0'},
      {value: 10, dataPointText: '10'},
      {value: 8, dataPointText: '8'},
      {value: 58, dataPointText: '58'},
      {value: 56, dataPointText: '56'},
      {value: 78, dataPointText: '78'},
      {value: 74, dataPointText: '74'},
      {value: 98, dataPointText: '98'},
    ];
  
    const lineData2 = [
      {value: 0, dataPointText: '0'},
      {value: 20, dataPointText: '20'},
      {value: 18, dataPointText: '18'},
      {value: 40, dataPointText: '40'},
      {value: 36, dataPointText: '36'},
      {value: 60, dataPointText: '60'},
      {value: 54, dataPointText: '54'},
      {value: 85, dataPointText: '85'},
    ];
  return (
      <View>
          <LineChart
          data={lineData}
          data2={lineData2}
          height={250}
          showVerticalLines
          spacing={44}
          initialSpacing={0}
          color1="skyblue"
          color2="orange"
          textColor1="green"
          dataPointsHeight={6}
          dataPointsWidth={6}
          dataPointsColor1="blue"
          dataPointsColor2="red"
          textShiftY={-2}
          textShiftX={-5}
          textFontSize={13}
      />
      </View>
  );
};

Negative values
Some charts have negative data values too. For example-


The code for the above chart is-

import { LineChart } from "react-native-gifted-charts";

const App = () => {
  const data = [
    {value: 15, label: 'Mon'},
    {value: 30, label: 'Tue'},
    {value: -23, label: 'Wed'},
    {value: 40, label: 'Thu'},
    {value: -16, label: 'Fri'},
    {value: 40, label: 'Sat'},
  ];
  
  return <LineChart data={data} />
}
While using negative values, you may need to pass these props-

maxValue
mostNegativeValue
stepValue
stepHeight
height
noOfSections
noOfSectionsBelowXAxis
mostNegativeValue here represents the most negative value to be seen on the Y-Axis.
noOfSections means the number of horizontal sections (strips) above the X-Axis in the chart.
noOfSectionsBelowXAxis means the number of horizontal sections (strips) below the X-Axis in the chart.
height represents the height of the chart above the X-Axis (excluding the part below the X-Axis).

All negative values
In case there are only negative values in your data set, and no positive values, your entire chart will appear below the X axis - in the fourth quadrant.
But you may want them to appear above the X axis - in the first quadrant (since all of them are negative).
For this, you can set the data values as positive (their absolute values), and add the prefix "-" with the help of the yAxisLabelPrefix prop.


LineChartBicolor
Sometimes you may need a chart with 2 different set of colors- one for the positive values and the other for the negative values.
For example the below chart has everything below 0 is styled in a red area and everything above in green.


To render such charts, we can use the <LineChartBicolor> component.
For example-

<LineChartBicolor
  data={data}
  areaChart
  color="green"
  colorNegative="red"
  startFillColor="green"
  startFillColorNegative="red"
/>
Curved lines are not yet supported in such charts. Also, we can only render a single data set (multiple lines not yet supported). However, props like areaChart, isAnimated etc are supported.
This chart supports most of the props from the <LineChart> component. (excluding those which might request for unsupported features, like - curved, data2, data3, color2, color3 etc).

The props like-
color
startFillColor
endFillColor
startOpacity
endOpacity
represent the properties of the chart portion lying above the X axis.

The respective properties of the chart portion lying below the X axis are obtained by appending the suffix Negative to the prop names.
Hence the prop name for the portion below the X axis become -
colorNegative
startFillColorNegative
endFillColorNegative
startOpacityNegative
endOpacityNegative

For more details, please see the LineChartBicolor props


Multicolor line chart
Sometimes you may need a line chart whose line is a blend of 2 or more colors in form of gradient.
Here's an example-


Before we try to draw a chart like above, let's first render a minimal multicolor line chart like this-


The code for the above chart is-

<LineChart
  data={lineData}
  spacing={10}
  hideDataPoints
  lineGradient
/>
Notice that the line gets a gradient of lightgreen and orange color by default. These can be customised using the lineGradientStartColor and lineGradientEndColor props respectively.
We can use our own gradient component via the lineGradientComponent prop. Note that lineGradient prop is mandatory when using custom gradient component.

Here's an example of custom lineGradientComponent-

<LineChart
data={lineData}
spacing={10}
hideDataPoints
lineGradient
lineGradientId="ggrd" // same as the id passed in <LinearGradient> below
lineGradientComponent={() => {
  return (
    <LinearGradient id="ggrd" x1="0" y1="0" x2="0" y2="1">
      <Stop offset="0" stopColor={'blue'} />
      <Stop offset="0.5" stopColor={'orange'} />
      <Stop offset="1" stopColor={'green'} />
    </LinearGradient>
  );
}}
/>
LinearGradient and Stop are imported from react-native-svg

The output of the above code is-


props used to render multicolor line charts are-

lineGradient?: boolean;
lineGradientComponent?: () => any;
lineGradientId?: string;
lineGradientDirection?: string;
lineGradientStartColor?: string;
lineGradientEndColor?: string;
See related issue

Line Segments
Sometimes, we may want our line to have multiple colors but not in a gradient manner.
Or we may want our line to have gaps or dots for a given range or segment.
For such use cases, we can use the lineSegments prop.

Here's an example-


The code for the above chart is-

<LineChart
  data={[{value: 5}, {value: 8}, {value: 7}, {value: 4}, {value: 6}]}
  lineSegments={[
    {startIndex: 0, endIndex: 1, color: 'red'},
    {startIndex: 1, endIndex: 2, color: 'green', strokeDashArray: [4, 1]},
    {startIndex: 2, endIndex: 3, color: 'orange'},
  ]}
/>
The lineSegments prop is an array whose objects have the below properties-

startIndex
endIndex
color
thickness
strokeDashArray
See this issue on Github

Line with breaks in between
The lineSegments prop can also be used to create breaks in the Line by making a segment of the line invisible.
A segment can be made invisible either by setting its color to transparent or by giving a zero width

Here's an example-


The code for the above chart is

import { LineChart } from "react-native-gifted-charts"
const MultiSegmented = () => {
  const data = [
    {value: 5},
    {value: 8},
    {value: 7}, // break in line from previous to this point
    {value: 4},
    {value: 6},
    {value: 0, hideDataPoint: true}, // invisible, here's a break in the line
    {value: 0, hideDataPoint: true}, // break continued
    {value: 6},
    {value: 9},
  ];
  return (
    <LineChart
      spacing={35}
      data={data}
      lineSegments={[
        {startIndex: 0, endIndex: 1, color: 'green'},             // 1st segmant from 0th to 1st index
        {startIndex: 1, endIndex: 2, color: 'transparent'},       // break (transparent = invisible)
        {startIndex: 2, endIndex: 4, color: 'red'},               // 2nd segment from 2nd to 4th index
        {startIndex: 4, endIndex: 7, color: 'transparent'},       // 2nd break from 4th to 7th index
        // remaining of the data points, from 7th to 8th index make the last segment
      ]}
    />
  );
};
See this issue on Github

Highlighted Range
We may need a line chart to be of a particular color or style if it lies within a given range.
Here's an example-


In the above chart, the part of the line that lies between the values 5 and 12 is colored green, and rest is colored red.

This can be achieved with the help of the highlightedRange prop.
The code for the above chart is-

import React from 'react';
import {LineChart} from 'react-native-gifted-charts';

const App = () => {
    const data = [
        {value: 6},
        {value: 6},
        {value: 8},
        {value: 5},
        {value: 5},
        {value: 8},
        {value: 0},
        {value: 8},
        {value: 10},
        {value: 10},
        {value: 12},
        {value: 15},
        {value: 20},
        {value: 22},
        {value: 20}
      ];
    
      return (
        <LineChart
          data={data}
          spacing={22}
          thickness={5}
          color='red'
          hideRules
          hideDataPoints
          xAxisThickness={0}
          yAxisThickness={0}
          highlightedRange={{
            from: 5,
            to: 12,
            color: 'green',
          }}
        />
      );
};

export default App;
The highlightedRange prop is an object which has the below properties-

from
to
color
thickness
strokeDashArray
See this question on Stack overflow


Custom Data Points and Vertical strip
Normally, the data points can be circular (default) or rectangular in shape. Their size and color can be controlled through props.
Adding the customDataPoint prop allows you to use your own components as the data points.
Similarly, adding the dataPointLabelComponent prop allows you to use your own components as the data point labels.


Detailed explanation for this is given in the Area Chart section.


The Arrow
Some Line charts have an arrow at the end of the line. Here's an example-


To display the arrrow at the end of the line, just pass the showArrows or showArrow{n}. prop. The properties of the arrow can controlled with the arrowConfig prop.

Understanding the arrow-

The arrowConfig has the properties allowed by the arrowType-

prop	type	default
length	number	10
width	number	10
strokeWidth	number	thickness1
strokeColor	string	color1
fillColor	string	'none'
showArrowBase	boolean	true
showArrowBase
The arrow base can be understood with the pic below-


The default value of showArrowBase is true. To fill the arrow with fillColor, it is mandatory to have showArrowBase true. The arrow can't be filled if it's baseless.


scrollRef, scrollToEnd and scrollToIndex
scrollRef You can create a ref using React.useRef() and pass it into the scrollRef prop. Now the ref can be used to scroll to a given position.
scrollToEnd scrolls to the last data point
scrollToIndex scrolls to the given data point

Here is the code for the above chart using using scrollRef to control the scroll of the chart from an external component.

Enabling focus, and focusing the respective data point
Many Line charts, specially those in trading apps, allow users to press on any part of the chart, and highlight the respective data point.


This can be achieved using the focusEnabled, showStripOnFocus and showTextOnFocus props.


In addition to just highlighting the pressed data point, you can pass any callback function to the press event using the onFocus prop.

The properties of the focused data point can be configured using these props-
focusedDataPointShape
focusedDataPointWidth
focusedDataPointHeight
focusedDataPointColor
focusedDataPointRadius
focusedCustomDataPoint

Advanced focus related props -

focusTogether
focusProximity
showDataPointOnFocus
showDataPointLabelOnFocus
showTextOnFocus
See the entire list of Focus related props here.

Note: Some props have been renamed in version 1.3.2
Here is the list of prop names changed in version 1.3.2-

Prop name prior to version 1.3.2	Prop name in and after 1.3.2
pressEnabled	focusEnabled
onPress	onFocus (onPress also exists but has diffferent functionality)
showDataPointOnPress	showDataPointOnFocus
showStripOnPress	showStripOnFocus
showTextOnPress	showTextOnFocus
Read more about Focus.



Y axis on both sides
We can render the Y axis on the right side of the chart using yAxisSide={yAxisSides.RIGHT}
But, if we need Y axis on both left and right sides, we can use the secondaryYAxis prop.

secondaryYAxis is an object of type of secondaryYAxisType. You can control the properties of secodary Y axis by passing an object of properties. Following is the type definition of the secondaryYAxisType object
secondaryYAxisType = {
    noOfSections?: number,
    maxValue?: number,
    mostNegativeValue?: number,
    stepValue?: number,
    stepHeight?: number,
    showFractionalValues?: boolean,
    roundToDigits?: number,
  
    showYAxisIndices?: boolean,
    yAxisIndicesHeight?: number,
    yAxisIndicesWidth?: number,
    yAxisIndicesColor?: ColorValue,
  
    yAxisSide?: yAxisSides,
    yAxisOffset?: number,
    yAxisThickness?: number,
    yAxisColor?: ColorValue,
    yAxisLabelContainerStyle?: any,
    yAxisLabelTexts: Array<string> | undefined,
    yAxisTextStyle?: any,
    yAxisTextNumberOfLines?: number,
    yAxisLabelWidth?: number,
    hideYAxisText?: boolean,
    yAxisLabelPrefix?: string,
    yAxisLabelSuffix?: string,
    hideOrigin?: boolean,
  }
Note: secondaryYAxis can also be passed a boolean value. When passed true, it just renders a secondary Y axis on the right side identical to the one on the left.
secondaryData and secondaryLineConfig
Although we can render the second line using the data2 prop, but the values of the second line rendered using data2 will be referenced from the same Y axis.

Sometimes we may need our second line to correspond to the Y axis on the right side. Then we should use the secondaryData and secondaryYAxisType props.
The properties of the secondary line are control using the secondaryLineConfig prop.

Here is an example of a Line chart using 2 Y axes and a 2 lines-


The code for the above chart is-

import { LineChart } from "react-native-gifted-charts"
const App = () => {
const d1 = [
  {value: 110},
  {value: 90},
  {value: 100},
  {value: 120},
  {value: 100, label: '2005', showXAxisIndex: true},
  {value: 80},
  {value: 90},
  {value: 110},
  {value: 120},
  {value: 100, label: '2010', showXAxisIndex: true},
  {value: 90},
  {value: 100},
  {value: 88},
  {value: 80},
  {value: 120, label: '2015', showXAxisIndex: true},
  {value: 76},
  {value: 104},
  {value: 112},
];
const d2 = [
  0.055, 0.02, 0.1, 0.01, 0.05, 0.06, 0.08, 0.1, 0.08, 0.07, 0.06, 0.025,
  0.04, 0.06, 0.045, 0.09, 0.06, 0.04,
];

return (
  <View style={{marginTop: 100}}>
    <LineChart
      data={d1}
      maxValue={140}
      noOfSections={7}
      spacing={16}
      hideDataPoints
      hideRules
      color="orange"
      yAxisColor={'orange'}
      showYAxisIndices
      yAxisIndicesColor={'orange'}
      yAxisIndicesWidth={10}
      secondaryData={d2.map(v => ({value: v}))}
      secondaryLineConfig={{color: 'blue'}}
      secondaryYAxis={{
        maxValue: 0.2,
        noOfSections: 4,
        showFractionalValues: true,
        roundToDigits: 3,
        yAxisColor: 'blue',
        yAxisIndicesColor: 'blue',
      }}
      xAxisLabelTextStyle={{width: 80, marginLeft: -36}}
      xAxisIndicesHeight={10}
      xAxisIndicesWidth={2}
    />
  </View>
);

Animate on data change
To make your data representation outstanding, you can consider adding smooth transitions to your chart on data change.

Here's an example-


Surprisingly, this huge feat can be achieved just by adding a prop called animateOnDataChange. And the duration of the transition animation can be controlled using the onDataChangeAnimationDurationprop.


Note: Currently, this transition animation is not supported for curved Line or Area charts. Also, in case of multiple data lines, the transition animation will only be applicable to the first data line.

import { LineChart } from "react-native-gifted-charts"
const App = () => {
const [currentData, setCurrentData] = useState(latestData);
const latestData = [
    {
      value: 100,
      labelComponent: () => lcomp('22 Nov'),
      customDataPoint: dPoint,
    },
    {
      value: 120,
      hideDataPoint: true,
    },
    {
      value: 210,
      customDataPoint: dPoint,
    },
    {
      value: 250,
      hideDataPoint: true,
    },
    {
      value: 320,
      labelComponent: () => lcomp('24 Nov'),
      customDataPoint: dPoint,
    },
    {
      value: 310,
      hideDataPoint: true,
    },
    {
      value: 270,
      customDataPoint: dPoint,
    },
    {
      value: 240,
      hideDataPoint: true,
    },
    {
      value: 130,
      labelComponent: () => lcomp('26 Nov'),
      customDataPoint: dPoint,
    },
    {
      value: 120,
      hideDataPoint: true,
    },
    {
      value: 100,
      customDataPoint: dPoint,
    },
    {
      value: 210,
      hideDataPoint: true,
    },
    {
      value: 270,
      labelComponent: () => lcomp('28 Nov'),
      customDataPoint: dPoint,
    },
    {
      value: 240,
      hideDataPoint: true,
    },
    {
      value: 120,
      hideDataPoint: true,
    },
    {
      value: 100,
      customDataPoint: dPoint,
    },
    {
      value: 210,
      labelComponent: () => lcomp('28 Nov'),
      customDataPoint: dPoint,
    },
    {
      value: 20,
      hideDataPoint: true,
    },
    {
      value: 100,
      customDataPoint: dPoint,
    },
  ];
  const dPoint = () => {
    return (
      <View
        style={{
          width: 14,
          height: 14,
          backgroundColor: 'white',
          borderWidth: 3,
          borderRadius: 7,
          borderColor: '#07BAD1',
        }}
      />
    );
  };
return (
    <View>
      <View
        style={{
          marginVertical: 100,
          paddingVertical: 50,
          backgroundColor: '#414141',
        }}>
        <LineChart
          isAnimated
          thickness={3}
          color="#07BAD1"
          maxValue={600}
          noOfSections={3}
          animateOnDataChange
          animationDuration={1000}
          onDataChangeAnimationDuration={300}
          areaChart
          yAxisTextStyle={{color: 'lightgray'}}
          data={currentData}
          hideDataPoints
          startFillColor={'rgb(84,219,234)'}
          endFillColor={'rgb(84,219,234)'}
          startOpacity={0.4}
          endOpacity={0.1}
          spacing={22}
          backgroundColor="#414141"
          rulesColor="gray"
          rulesType="solid"
          initialSpacing={10}
          yAxisColor="lightgray"
          xAxisColor="lightgray"
        />
      </View>
    </View>
    );
};
Now, whenever the values in the data (currentData) change, you can see it transition smoothly.

To test it, you can change the values in the data on some event, like on press of a button.

yAxisOffset
Look at the chart below.


It has no use for values under 100, it's making the chart unreadable so it's better to limit the range on the Y Axis.

The data for the above chart is-

const data = [
  {value: 110},
  {value: 130},
  {value: 120},
  {value: 160},
  {value: 190},
];
Now, you want the values to start from 100, and they range between 100 to 200.

We can use the prop yAxisOffset to achieve this.

const data = [
  {value: 110},
  {value: 130},
  {value: 120},
  {value: 160},
  {value: 190},
];

return (
<LineChart
  data = {data}
  yAxisOffset={100}
/>
Now the chart looks like this-

