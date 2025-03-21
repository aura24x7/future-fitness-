Bar Chartsprops table
Minimal Bar Chart
The simplest Bar chart can be made with just-
import { BarChart } from "react-native-gifted-charts";
        
const App = () => {
    const barData = [{value: 15}, {value: 30}, {value: 26}, {value: 40}];
    return <BarChart data={barData}/>;
};
Output-

Styling the Chart
In the above code snippet, at line number 5, add the prop frontColor={'#177AD5'}
This will result in-


Adding the frontColor prop changes the color of the bars, similary adding the barWidth changes the width of the bars

The new code after adding the frontColor and the barWidth props-

import { BarChart } from "react-native-gifted-charts";
        
const App = () => {
    const barData = [{value: 15}, {value: 30}, {value: 26}, {value: 40}];
    return (
        <BarChart
        frontColor={'#177AD5'}
        barWidth={22}
        data={barData}
        />
    );
};
Output-

Similary there are various props available to customize the bars, like-

roundedTop
roundedBottom
barBorderRadius and others
So now we know styling the bars. But did you observe that the styles we supply through props are applied to all the bars?
What if we want some styles to be applied to only specific bars?

That's so simple. Just put the style props in the data array, instead of directly putting it with the BarChart component.

So, let's try to draw the following BarChart-


The first challenge we have here is to color the specific bars. This can achieved by putting the frontColor prop in the data array.
Also, we add the corresponding labels- M, T, W, T, F, S and S in the data array.
Next, we set the values of the bars, i.e 250, 500, 745, 320, 600, 256, 300.
Next, we set the prop noOfSections=3. noOfSections is the number of parts in which the y axis is divided.
Did you notice that, there are lines for the x axis and the y axis in the above chart? For this we set yAxisThickness=0 and xAxisThickness=0.
So, the final code for the above chart will be-

import { BarChart } from "react-native-gifted-charts";
        
const App = () => {
    const barData = [
        {value: 250, label: 'M'},
        {value: 500, label: 'T', frontColor: '#177AD5'},
        {value: 745, label: 'W', frontColor: '#177AD5'},
        {value: 320, label: 'T'},
        {value: 600, label: 'F', frontColor: '#177AD5'},
        {value: 256, label: 'S'},
        {value: 300, label: 'S'},
    ];
    return (
        <View>
            <BarChart
                barWidth={22}
                noOfSections={3}
                barBorderRadius={4}
                frontColor="lightgray"
                data={barData}
                yAxisThickness={0}
                xAxisThickness={0}
            />
        </View>
    );
};
The label, labelComponent, and topLabelComponent properties
In the above chart we have used the label property with each data object, due to which we can see the labels- M, T, W... below each bar We can pass text values to the label property and customise its style using the labelTextStyle prop.
But sometimes, we may want the label to be a custom component like an icon, image or a some UI component of our own choice. In such a case we can use the labelComponent property.

But what if we need to show the values at the top of the bars. Something like this-


Notice the text 50 above the tallest bar. This is done using the topLabelComponent property.
Here's the code for this chart-

import React from 'react';
import {View, Text} from 'react-native';
import {BarChart} from 'react-native-gifted-charts';

const App = () => {
  const data = [
    {value: 20, label: 'M'},
    {value: 30, label: 'T'},
    {
      value: 50,
      label: 'W',
      topLabelComponent: () => (
        <Text style={{color: 'blue', fontSize: 18, marginBottom: 6}}>50</Text>
      ),
    },
    {value: 40, label: 'T'},
    {value: 30, label: 'F'},
  ];
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <BarChart width={300} data={data} frontColor="#177AD5" />
    </View>
  );
};

export default App;
      
Understanding various controls/props
Gifted Chart allows you to make almost any kind of chart you can imagine- or at least most of them.

With such great customizability, there are chances, you may miss some features, if we don't showcase them in the documents properly.
The chart below demonstartes what some major props represent-


Note: We have received complains that - Setting height, maxValue, stepValue, stepHeight, or noOfSections breaks the chart
Here are some precautions-

Please make sure to follow the relation-
maxValue = noOfSections * stepValue;
Whenever you change the props like height, maxValue, stepValue, stepHeight, or noOfSections, please reload the app after that. These changes work properly only after reloading.

Have a look at issue #511

Consider going through the props table
Update: Starting from version 1.4.2, the relation- maxValue = noOfSections * stepValue; is now handled internally by the library. The above issue should no loger exist.


Understanding the data arary
data is an array of objects, each object representing a bar in the bar chart.
Each object can have the following keys, defining the properties of the bar it represents-
value
Value of the item representing height of the bar
barWidth
Width of the bar
onPress
Function called on pressing the bar
disablePress
To disable the press action, defaults to false
frontColor
Color of the bar
label
Label text appearing below the bar (under the X axis)
labelTextStyle
Style object for the label text appearing below the bar
labelComponent
Custom label component appearing below the bar. A normal text as label may not fit your needs, you can give your own label component.
topLabelComponent
Custom component appearing above the bar
barBorderRadius
barBorderTopLeftRadius
barBorderTopRightRadius
barBorderBottomLeftRadius
barBorderBottomRightRadius
spacing
Space towards the right of the Bar
Pro tip All of the above properties of the data item, except value, can be used directly as a prop. When used directly as a prop, it applies to all the bars. When used as a property in the data object, it applies to that particular data item.

Gradient
Gradients can make your chart outstanding. You just need to add the showGradient prop.
Currently we are supporting Linear gradient only.
Gradient colors can be supplied using gradientColor and frontColor props.
The gradient is applied from bottom to top of a bar. The gradientColor takes the bottom position and frontColor takes the top position in the bar.
The default value for gradientColor is white and the default value for frontColor is black.

Now let's try making the below chart-


Note: By default, the y axis labels will be rounded to whole number. To show fractional numbers on the y axis, use the showFractionalValues prop.

So, the final code for the above chart will be-

import { BarChart } from "react-native-gifted-charts";
        
const App = () => {
    const barData = [
        {value: 0.7, label: '1'},
        {value: 0.8, label: '2'},
        {value: 0.6, label: '3'},
        {value: 0.4, label: '4'},
        {value: 0.9, label: '5'},
        {value: 0.7, label: '6'},
    ];
    return (
        <View>
        <BarChart
            showFractionalValues
            showYAxisIndices
            showXAxisIndices
            hideRules
            noOfSections={5}
            data={barData}
            showGradient
            frontColor={'#1B6BB0'}
            gradientColor={'#FFEEFE'}
            backgroundColor={'#FECF9E'}
        />
        </View>
    );
};
Did you notice the showYAxisIndices and the showXAxisIndices props?
Using these props adds dots (or small lines) on the axes at each label, thus making it graduated like this-


Othe props related to the axes indices are-

yAxisIndicesHeight
yAxisIndicesWidth
yAxisIndicesColor
xAxisIndicesHeight
xAxisIndicesWidth
xAxisIndicesColor
Prefix and Suffix
Sometimes, the y-axis has values like- $10, $20, $30... or $10k, $20k, $30k...
The data for the above cases would have been [10, 20, 30...].

We can use the prop yAxisLabelPrefix to add the prefix- `$` (or any other prefix) before each label on the y-axis.
Similary, we can use the yAxisLabelSuffix prop to add a suffix after each label on the y-axis.

yAxisLabelTexts and formatYLabel
Adding prefix or suffix may not always be enough. We might need more customisations for the Y-axis lables.
We can pass our own array of strings that will be rendered as Y axis labels using the yAxisLabelTexts prop. We need to make sure that the length of the yAxisLabelTexts array is same as the number of sections noOfSections in the Y-axis

Sometimes we don't have a predefined array of strings to render as labels along the Y-axis. We want the library to generate the Y-axis labels but also want to modify/customise it.
For example- we have values in multiples of 1000s but we want the lables to be displayed as 1k, 2k, 3k etc.
In such a case, we can use the formatYLabel prop. formatYLabel is a callback function that takes the label generated by the library and modifies it. The modified label returned by the callback function will be finally rendered along the Y-axis.

The prototype of the formatYLabel callback function is-
(label: string) => string;

Customizing the X-axis labels
X-axis labels appear just under the X axis. We can customize the X axis labels using the xAxisLabelTextStyle prop.
Use the rotateLabel prop to rotate the X axis labels.
Use the xAxisTextNumberOfLines prop to render X axis labels in more than 1 line.
The height of X axis labels container is computed automatically. Sometimes you may need to explicitly provide the height of X-axis labels container. An example case is when the font size of label texts is large. Use the xAxisLabelsHeight prop if the labels appear cropped from bottom.

Note: Using the xAxisLabelsHeight prop may shift the X axis labels up or down, making the label text overlap with the chart content. In such a case you can use the xAxisLabelsVerticalShift prop to adjust the vertical position of X axis labels.
Have a look at this issue

xAxisLabelsVerticalShift and labelsDistanceFromXaxis
Both xAxisLabelsVerticalShift and labelsDistanceFromXaxis are used to shift the X-axis labels upwards or downwards.
In fact, in most cases both will do the same thing. The difference arises when we have a combination of +ve and -ve values and autoShiftLabels is set to true.

If we both +ve and -ve values and autoShiftLabels is true, then-
xAxisLabelsVerticalShift moves all the labels upwards or downwards
labelsDistanceFromXaxis moves the labels of positive bars downwards and moves the labels of negative bars upwards, as shown below-

Touchable, onPress and disableScroll
The bars are by default touchable, that means in each of the above charts, the user can press a bar. There are 2 ways to handle the press event-
onPress prop: You can directly pass onPress as a prop and it will accept 2 parameters- item and index
Here's an example-
<BarChart
data = {data}
onPress = {(item,index)=>console.log('item',item)}/>
onPress property in data object: If you pass a function to the onPress key in a particular bar object in the data array, it will be called when the user presses that bar.
To disable touch events, pass the disablePress prop.

Similarly, the charts are by default scrollable, that means in each of the above charts, the user can scroll it horizontally.
To disable scroll, pass the disableScroll prop.

By default, the scroll indicator is set to invisible. To show the scroll indicator on scroll, pass the showScrollIndicator prop.

scrollRef, scrollToEnd and scrollToIndex
scrollRef You can create a ref using React.useRef() and pass it into the scrollRef prop. Now the ref can be used to scroll to a given position.
scrollToEnd scrolls to the last bar
scrollToIndex scrolls to the given index bar
Three dimensional Bars
To render 3D bar chart just pass the prop isThreeD
The simplest 3D Bar chart can be made with just-
import { BarChart } from "react-native-gifted-charts";

const App = () => {
    const barData = [{value: 20}, {value: 18}, {value: 40}, {value: 60}];
    return (
        <View>
            <BarChart data={barData} isThreeD />
        </View>
    );
}

Output-

In 3D bars, we can divide a bar into 3 parts-
front
side
top
So, we have the following props-
frontColor
sideColor
topColor
sideWidth (defaults to half of the bar width)
side ('left' or 'right', defaults to 'left' as in the above chart)
All the above props can be passed directly into the BarChart, as well as through the data array.
Note: whenever we have the same prop passed both directly and through data array, the data array value will be considered

Now let's try making this beautiful 3D Bar chart-


import { BarChart } from "react-native-gifted-charts";

const App = () => {
    const barData = [
        {
          value: 230,
          label: 'Jan',
          frontColor: '#4ABFF4',
          sideColor: '#23A7F3',
          topColor: '#92e6f6',
        },
        {
          value: 180,
          label: 'Feb',
          frontColor: '#79C3DB',
          sideColor: '#68BCD7',
          topColor: '#9FD4E5',
        },
        {
          value: 195,
          label: 'Mar',
          frontColor: '#28B2B3',
          sideColor: '#0FAAAB',
          topColor: '#66C9C9',
        },
        {
          value: 250,
          label: 'Apr',
          frontColor: '#4ADDBA',
          sideColor: '#36D9B2',
          topColor: '#7DE7CE',
        },
        {
          value: 320,
          label: 'May',
          frontColor: '#91E3E3',
          sideColor: '#85E0E0',
          topColor: '#B0EAEB',
        },
    return (
        <View>
            <BarChart
            showFractionalValue
            showYAxisIndices
            hideRules
            noOfSections={4}
            maxValue={400}
            data={barData}
            barWidth={40}
            sideWidth={15}
            isThreeD 
            side="right"
            />
        </View>
    );
}
Animated charts
Aha! now comes the most striiking feature - Animation. No doubt, it brings life to your data.
Animation not only appears when the chart is mounted but also whenever there is any change in the data!
Just pass the prop isAnimated to any of you charts and that's it. You chart appears with animation.

Let's try making a simple animated chart like -


import { BarChart } from "react-native-gifted-charts";

const App = () => {
    const barData = [
    {value: 230,label: 'Jan',frontColor: '#4ABFF4'},
    {value: 180,label: 'Feb',frontColor: '#79C3DB'},
    {value: 195,label: 'Mar',frontColor: '#28B2B3'},
    {value: 250,label: 'Apr',frontColor: '#4ADDBA'},
    {value: 320,label: 'May',frontColor: '#91E3E3'},
    ];
    return (
        <View>
            <BarChart
            showFractionalValue
            showYAxisIndices
            noOfSections={4}
            maxValue={400}
            data={barData}
            isAnimated
            />
        </View>

    );
}
The animations provided with this package are smooth and performant. Almost all the animations are implemented using LayoutAnimation provided by react-native.

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
Capped Bars
Yet another trending bar chart design pattern is- putting caps at the top of the bars.
So we have a prop called cappedBars
The props related to capped Bar chart are-

capThickness
capColor
capRadius
Let's try making the below capped Bar chart-


import { BarChart } from "react-native-gifted-charts";
const CappedBars = () => {
    const barData = [
    {value: 15, label: 'Jan'},
    {value: 40, label: 'Feb'},
    {value: 10, label: 'Mar'},
    {value: 30, label: 'Apr'},
    ];
    return (
    <View>
        <BarChart
        data={barData}
        barWidth={35}
        cappedBars
        capColor={'rgba(78, 0, 142)'}
        capThickness={4}
        showGradient
        gradientColor={'rgba(200, 100, 244,0.8)'}
        frontColor={'rgba(219, 182, 249,0.2)'}
        />
    </View>
    );
};
Customised Chart
Sometimes we need to compare two items as shown below -


Notice that this chart can be achieved by adjusting the spacing between 2 consecutive bars, and providing blue and red color to alternate bars.

Also, we provide the label text to alternating bars. And we manually adjust the label width.

The props used for this chart are-

spacing
labelWidth
labelTextStyle
roundedTop
roundedBottom
import React from 'react';
import {View, Text} from 'react-native';
import {BarChart} from 'react-native-gifted-charts';

const GroupedBars = () => {
    const barData = [
        {
          value: 40,
          label: 'Jan',
          spacing: 2,
          labelWidth: 30,
          labelTextStyle: {color: 'gray'},
          frontColor: '#177AD5',
        },
        {value: 20, frontColor: '#ED6665'},
        {
          value: 50,
          label: 'Feb',
          spacing: 2,
          labelWidth: 30,
          labelTextStyle: {color: 'gray'},
          frontColor: '#177AD5',
        },
        {value: 40, frontColor: '#ED6665'},
        {
          value: 75,
          label: 'Mar',
          spacing: 2,
          labelWidth: 30,
          labelTextStyle: {color: 'gray'},
          frontColor: '#177AD5',
        },
        {value: 25, frontColor: '#ED6665'},
        {
          value: 30,
          label: 'Apr',
          spacing: 2,
          labelWidth: 30,
          labelTextStyle: {color: 'gray'},
          frontColor: '#177AD5',
        },
        {value: 20, frontColor: '#ED6665'},
        {
          value: 60,
          label: 'May',
          spacing: 2,
          labelWidth: 30,
          labelTextStyle: {color: 'gray'},
          frontColor: '#177AD5',
        },
        {value: 40, frontColor: '#ED6665'},
        {
          value: 65,
          label: 'Jun',
          spacing: 2,
          labelWidth: 30,
          labelTextStyle: {color: 'gray'},
          frontColor: '#177AD5',
        },
        {value: 30, frontColor: '#ED6665'},
      ];

      const renderTitle = () => {
          return(
            <View style={{marginVertical: 30}}>
            <Text
              style={{
                color: 'white',
                fontSize: 20,
                fontWeight: 'bold',
                textAlign: 'center',
              }}>
              Chart title goes here
            </Text>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                marginTop: 24,
                backgroundColor: 'yellow',
              }}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View
                  style={{
                    height: 12,
                    width: 12,
                    borderRadius: 6,
                    backgroundColor: '#177AD5',
                    marginRight: 8,
                  }}
                />
                <Text
                  style={{
                    width: 60,
                    height: 16,
                    color: 'lightgray',
                  }}>
                  Point 01
                </Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View
                  style={{
                    height: 12,
                    width: 12,
                    borderRadius: 6,
                    backgroundColor: '#ED6665',
                    marginRight: 8,
                  }}
                />
                <Text
                  style={{
                    width: 60,
                    height: 16,
                    color: 'lightgray',
                  }}>
                  Point 02
                </Text>
              </View>
            </View>
          </View>
          )
      }

    return (
        <View
        style={{
          backgroundColor: '#333340',
          paddingBottom: 40,
          borderRadius: 10,
        }}>
        {renderTitle()}
        <BarChart
          data={barData}
          barWidth={8}
          spacing={24}
          roundedTop
          roundedBottom
          hideRules
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={{color: 'gray'}}
          noOfSections={3}
          maxValue={75}
        />
      </View>
    );
};
Background pattern (tile) for bars
Here's a chart with a background pattrern background on bars -


This can be achieved using the props barBackgroundPattern and patternId.
The barBackgroundPattern should be a Svg Pattern element.

Here's the pattern element used for above chart-

const MyPattern = () => {
return (
  <Pattern
    id="DiagonalLines"
    patternUnits="userSpaceOnUse"
    x="0"
    y="0"
    width={60}
    height={14}
    viewBox="0 0 40 20">
    <Path
      d="M 1220 38 L 465 0"
      stroke={'white'}
      strokeWidth={1.5}
      transform={{rotation: '-16'}}
    />
  </Pattern>
);
};
Note: The id of the Pattern element must be passed as patternId as a prop for the Bar chart.
Notice the Path element in the MyPattern component. The prop d is handcrafted to render a diagonal line, and is rotated by a precise angle with the transform prop.

The complete code for the above chart is-

import {BarChart} from 'react-native-gifted-charts';
import {Path, Pattern} from 'react-native-svg';

const App = () => {
  const MyPattern = () => {
      return (
        <Pattern
          id="DiagonalLines"
          patternUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={60}
          height={14}
          viewBox="0 0 40 20">
          <Path
            d="M 1220 38 L 465 0"
            stroke={'white'}
            strokeWidth={1.5}
            transform={{rotation: '-16'}}
          />
        </Pattern>
      );
    };
    
    const data=[
    {
      value: 110,
      frontColor: '#4444dd',
      spacing: 8,
    },
    {value: 130},
    {
      value: 120,
      frontColor: '#4444dd',
      spacing: 8,
    },
    {value: 160},
    {
      value: 190,
      frontColor: '#4444dd',
      spacing: 8,
    }]
    
    return <BarChart
    data={data}
    barWidth={40}
    spacing={30}
    barBackgroundPattern={MyPattern}
    patternId='DiagonalLines'  />
  }
Pattern in Specific Bars
Patterns can be set in certain specific bars by passing the barBackgroundPattern and the patternId as object properties in the data array.
Here's an example-


The data array for the above chart is-

const data = [
  {
    value: 110,
    barBackgroundPattern: MyPattern,
    patternId: 'DiagonalLines',
    frontColor: '#4444dd',
    spacing: 8,
  },
  {value: 130},
  {
    value: 120,
    barBackgroundPattern: MyPattern,
    patternId: 'DiagonalLines',
    frontColor: '#4444dd',
    spacing: 8,
  },
  {value: 160},
  {
    value: 190,
    barBackgroundPattern: MyPattern,
    patternId: 'DiagonalLines',
    frontColor: '#4444dd',
    spacing: 8,
  },
]
Note that we can pass any Svg pattern (not just lines). Let's say we want this pattern -


The pattern component for the above chart will be-

const MyPattern = () => {
  return (
    <Pattern
      id="DiagonalLines"
      patternUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="20"
      height="20"
      viewBox="0 0 10 10">
      <Path
        d="M 0 0 L 7 0 L 3.5 7 z"
        fill="red"
        stroke="blue" />
    </Pattern>
  );
};
Negative values
Some charts have negative data values too. For example-


The code for the above chart is-

import { BarChart } from "react-native-gifted-charts";

const App = () => {
  const data = [
    {value: 15, label: 'Mon'},
    {value: 30, label: 'Tue'},
    {value: -23, label: 'Wed'},
    {value: 40, label: 'Thu'},
    {value: -16, label: 'Fri'},
    {value: 40, label: 'Sat'},
  ];
  
  return <BarChart data={data} />
}
Everything seems fine except the x axis labels (Wed and Fri) are getting hidden behind the bars for negative values.
One way to overcome this issue is to display the labels above the x axis for the negative values. As it is shown in the chart below-


To achieve this we just have to pass the prop autoShiftLabels. So the new code will be-

return <BarChart data={barData} autoShiftLabels />
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
In case there are only negative values in your data set, and no positive values, all the bars will appear below the X axis - in the fourth quadrant.
But you may want them to appear above the X axis - in the first quadrant (since all of them are negative).
For this, you can set the data values as positive (their absolute values), and add the prefix "-" with the help of the yAxisLabelPrefix prop.

y axis on right side
We can add the prop yAxisSide={yAxisSides.RIGHT} to render the y axis labels on the right side.
While setting yAxisSide to 'right', make sure to specify the width of the chart, using the width prop.
The default value of the yAxisSide prop is yAxisSides.LEFT.

Reference line (horizontal)
Some charts have one or more horizontal line(s) across the chart. They can be called as "reference lines".
Here's an example with one reference line-


To render reference lines we can use the props- showReferenceLine1, showReferenceLine2 and showReferenceLine3.
Currently only 3 reference lines are supported.

The position of the reference line can be set using the referenceLine1Position or in general, referenceLine{n}Position prop.
Other properties like type, color, thickness, dashWidth, dashGap can be provided in the referenceLine1Config prop or in general, referenceLine{n}Config prop.

The code for the above chart is-

import { BarChart } from "react-native-gifted-charts";
        
const App = () => {
  const barData = [
    {value: 250, label: 'M'},
    {value: 500, label: 'T', frontColor: '#177AD5'},
    {value: 745, label: 'W', frontColor: '#177AD5'},
    {value: 320, label: 'T'},
    {value: 600, label: 'F', frontColor: '#177AD5'},
    {value: 256, label: 'S'},
    {value: 300, label: 'S'},
  ];
  return (
    <View>
      <BarChart
        barWidth={22}
        noOfSections={3}
        barBorderRadius={4}
        frontColor="lightgray"
        data={barData}
        yAxisThickness={0}
        xAxisThickness={0}
        hideRules
        showReferenceLine1
        referenceLine1Position={420}
        referenceLine1Config={{
          color: 'gray',
          dashWidth: 2,
          dashGap: 3,
        }}
      />
    </View>
  );
};
barMarginBottom - bars lifted above X axis
Some charts have a margin between the bottom of the bars and the x axis. For example-


To render a chart like this, we just need to pass the barMarginBottom prop.
The code for the above chart is-

import { BarChart } from "react-native-gifted-charts";
        
const App = () => {
  const barData = [
    {value: 70},
    {value: 36},
    {value: 50},
    {value: 40},
    {value: 18},
    {value: 38},
  ];

  return <BarChart data={llData} barMarginBottom={20} />;
};
We can also have different values of marginBottom for different bars in the same chart.
In such a case, we can add the barMarginBottom property separately to the data objects.
Here's an example-


The code for the above chart is-

import { BarChart } from "react-native-gifted-charts";
        
const App = () => {
  const llData = [
    {value: 70},
    {value: 36, barMarginBottom: 30},
    {value: 50},
    {value: 40, barMarginBottom: 0},
    {value: 18, barMarginBottom: 0},
    {value: 38},
  ];

  return <BarChart data={llData} barMarginBottom={10} />;
};
Custom Bar styles
Most of the properties of the Bars are controlled directly via props like frontColor, barWidth, showGradient, gradientColor etc. However, styles like border, shadow, elevation and many others can be provided via the barStyle object.

Here's an example-


The code for the above chart is-

import { BarChart } from "react-native-gifted-charts";

const App = () => {
  return (
    <View
      style={{
        paddingVertical: 100,
        backgroundColor: '#3F107A',
        flex: 1,
      }}>
      <Image
        source={{
          uri: 'https://github.com/Abhinandan-Kushwaha/chart-images/blob/main/images/walls.png?raw=true',
        }}
        style={{
          position: 'absolute',
          opacity: 0.6,
          top: 32,
          height: 300,
          width: 400,
          resizeMode: 'contain',
        }}
      />
      <View style={{marginLeft: 50}}>
        <BarChart
          data={[
            {value: 20},
            {value: 40},
            {value: 30},
            {value: 50},
            {value: 40},
          ]}
          isThreeD
          initialSpacing={20}
          barMarginBottom={10}
          showGradient
          gradientColor={'#fc84ff'}
          hideYAxisText
          yAxisThickness={0}
          xAxisThickness={6}
          xAxisColor={'#c919ff'}
          frontColor={'transparent'}
          sideColor={'#ff00d0'}
          topColor={'#ff66f4'}
          barStyle={{
            borderWidth: 4,
            borderColor: '#fc84ff',
            shadowColor: '#fc84ff',
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 1,
            shadowRadius: 8,
            elevation: 10,
          }}
          hideRules
          height={120}
          barWidth={20}
        />
      </View>
    </View>
  );
}
Tooltip
Some charts show a tooltip when user taps on a Bar. Tolltip provides extra information about the bar.
To add tooltip to your bar chart, just add the renderTooltip prop to your BarChart component.
It is a function that returns the custom tooltip component. It takes item and index as parameters.

For an example, let's try to add the renderTooltip prop to the above chart.
So the new code will be-

import { BarChart } from "react-native-gifted-charts";

const App = () => {
  return (
    <View
      style={{
        paddingVertical: 100,
        backgroundColor: '#3F107A',
        flex: 1,
      }}>
      <Image
        source={{
          uri: 'https://github.com/Abhinandan-Kushwaha/chart-images/blob/main/images/walls.png?raw=true',
        }}
        style={{
          position: 'absolute',
          opacity: 0.6,
          top: 32,
          height: 300,
          width: 400,
          resizeMode: 'contain',
        }}
      />
      <View style={{marginLeft: 50}}>
        <BarChart
          data={[
            {value: 20},
            {value: 40},
            {value: 30},
            {value: 50},
            {value: 40},
          ]}
          isThreeD
          initialSpacing={20}
          barMarginBottom={10}
          showGradient
          gradientColor={'#fc84ff'}
          hideYAxisText
          yAxisThickness={0}
          xAxisThickness={6}
          xAxisColor={'#c919ff'}
          frontColor={'transparent'}
          sideColor={'#ff00d0'}
          topColor={'#ff66f4'}
          barStyle={{
            borderWidth: 4,
            borderColor: '#fc84ff',
            shadowColor: '#fc84ff',
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 1,
            shadowRadius: 8,
            elevation: 10,
          }}
          hideRules
          height={120}
          barWidth={20}
          isAnimated
          renderTooltip={(item, index) => {
            return (
              <View
                style={{
                  marginBottom: 20,
                  marginLeft: -6,
                  backgroundColor: '#ffcefe',
                  paddingHorizontal: 6,
                  paddingVertical: 4,
                  borderRadius: 4,
                }}>
                <Text>{item.value}</Text>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}
Notice that we have only added the renderTooltip prop, and just for beautification, I also added the isAnimated prop.

The output of the code is-


The most common issue with tooltip is that it gets truncated or overflown for the rightmost bars. To solve this, we can use the prop leftShiftForLastIndexTooltip. It accepts a number and shifts the tooltip of last bar by the given number.

Apart from the leftShiftForLastIndexTooltip, we now have the leftShiftForTooltip prop which we can add to selected Bars. So, suppose you have 12 bars and the 6th bar reaches to the end of screen, you can add leftShiftForTooltip to 6th, 7th, 8th, 9th, 10th, 11th and 12th bars.

This Git issue might be helpful.

Combined Bar and Line chart
You may want to render a Line along with the Bar chart.
That's really simple. Just add the prop showLine and that's it!

Here's a quick example-

import { BarChart } from "react-native-gifted-charts";
        
const App = () => {
    const barData = [{value: 15}, {value: 30}, {value: 26}, {value: 40}];
    return <BarChart data={barData} showLine/>;
};
The output of the above code is-


See the line appearing along the bars. The line can be styled using the lineConfig prop. The lineConfig prop is an object that allows most of the props allowed by the <LineChart> component.
Jump to this page to know in detail about Line charts.


The properties allowed by the lineConfig prop are-

prop	type	default
initialSpacing	number	initialSpacing
curved	Boolean	false
isAnimated	Boolean	false
delay	number	0
thickness	number	1
color	ColorValue | String | any	'black'
hideDataPoints	Boolean	false
dataPointsShape	String	'circular'
dataPointsWidth	number	2
dataPointsHeight	number	3
dataPointsColor	ColorValue | String | any	'black'
dataPointsRadius	number	3
textColor	ColorValue | String | any	'gray'
textFontSize	number	10
textShiftX	number	0
textShiftY	number	0
shiftY	number	0
startIndex	number	0
endIndex	number	lineData.length - 1
showArrow	boolean	false
arrowConfig	arrowType	defaultArrowConfig

By default the Line will be rendered afront the Bars in case they overlap. However, it can be forced to appear behind the Bars by setting the lineBehindBars prop to true. It's default value is false.
You can also visit the Bar Chart props page to know more about the properties allowed by the lineConfig prop and their default values.

Here's a beautiful chart made by combining a Line chart with a Bar chart. This is done by using the showLine and lineConfig props of the BarChart component.


The code for the above chart is-

import { BarChart } from "react-native-gifted-charts";
        
const App = () => {
  const data = [
    {value: 2500, frontColor: '#006DFF', gradientColor: '#009FFF', spacing: 6, label:'Jan'},
    {value: 2400, frontColor: '#3BE9DE', gradientColor: '#93FCF8'},

    {value: 3500, frontColor: '#006DFF', gradientColor: '#009FFF', spacing: 6, label:'Feb'},
    {value: 3000, frontColor: '#3BE9DE', gradientColor: '#93FCF8'},

    {value: 4500, frontColor: '#006DFF', gradientColor: '#009FFF', spacing: 6, label:'Mar'},
    {value: 4000, frontColor: '#3BE9DE', gradientColor: '#93FCF8'},

    {value: 5200, frontColor: '#006DFF', gradientColor: '#009FFF', spacing: 6, label:'Apr'},
    {value: 4900, frontColor: '#3BE9DE', gradientColor: '#93FCF8'},

    {value: 3000, frontColor: '#006DFF', gradientColor: '#009FFF', spacing: 6, label:'May'},
    {value: 2800, frontColor: '#3BE9DE', gradientColor: '#93FCF8'},
  ];

  return(
    <View
      style={{
        margin: 10,
        padding: 16,
        borderRadius: 20,
        backgroundColor: '#232B5D',
      }}>
      <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>
        Overview
      </Text>
      <View style={{padding: 20, alignItems: 'center'}}>
        <BarChart
          data={data}
          barWidth={16}
          initialSpacing={10}
          spacing={14}
          barBorderRadius={4}
          showGradient
          yAxisThickness={0}
          xAxisType={'dashed'}
          xAxisColor={'lightgray'}
          yAxisTextStyle={{color: 'lightgray'}}
          stepValue={1000}
          maxValue={6000}
          noOfSections={6}
          yAxisLabelTexts={['0', '1k', '2k', '3k', '4k', '5k', '6k']}
          labelWidth={40}
          xAxisLabelTextStyle={{color: 'lightgray', textAlign: 'center'}}
          showLine
          lineConfig={{
            color: '#F29C6E',
            thickness: 3,
            curved: true,
            hideDataPoints: true,
            shiftY: 20,
            initialSpacing: -30,
          }}
        />
      </View>
    </View
  );