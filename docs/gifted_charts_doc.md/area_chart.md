Area Chartsprops table
Pro tip You can convert any line chart into area chart by just passing the areaChart prop to the <LineChart/> component.

Minimal Area Chart
The simplest Area chart can be made with just-
import { LineChart } from "react-native-gifted-charts";
        
const App = () => {
    const data = [{value: 15}, {value: 30}, {value: 26}, {value: 40}];
    return <LineChart areaChart data={data}/>;
};
Output-

Styling the Chart
Area charts look the best with gradient fill. And for this reason, all area charts are given with a gradient by degault. The default gradient colors are gray and white.

So we will start styling the Area chart by changing its gradient color and opacity. For this, we use the following props-

startFillColor
startOpacity
endFillColor
endOpacity
gradientDirection
areaGradientId
areaGradientComponent
import { LineChart } from "react-native-gifted-charts";
        
const App = () => {
    const data = [{value: 15}, {value: 30}, {value: 26}, {value: 40}];
    return (
        <LineChart
        areaChart
        data={data}
        startFillColor="rgb(46, 217, 255)"
        startOpacity={0.8}
        endFillColor="rgb(203, 241, 250)"
        endOpacity={0.3}
        />
    );
};
Output-


Curved Area Chart
Using a combination of the props- areaChart and curved results in a curved Area chart. The above area chart after adding the curved prop-



Custom Gradient component
Area fill colors and gradient direction can be controlled using the startFillColor, endFillColor and gradientDirection props.

Sometimes, we want more than 2 colors for the gradient, or we want a direction other than vertical or horizontal (e.g. slanting).
In such cases, we can use our own custom gradient component using the areaGradientComponent and areaGradientId props.

Here's an example where we need a custom gradient component-


The code for the above chart is-

import {LineChart} from "react-native-gifted-charts";
import {LinearGradient, Stop} from 'react-native-svg';

const App = () => {
  const data = [
    1.3, 10, 20, 80, 50, 30, 35, 45, 30, 24, 23, 21, 19, 17, 16, 15, 14.5, 13,
    13, 13, 13, 13,
  ];

  return (
    <LineChart
      data={data.map(item => {
        return {value: item};
      })}
      areaChart
      curved
      spacing={15}
      color="transparent"
      hideDataPoints
      areaGradientId="ag" // same as the id passed in <LinearGradient> below
      areaGradientComponent={() => {
        return (
          <LinearGradient id="ag" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={'blue'} />
            <Stop offset="0.3" stopColor={'cyan'} />
            <Stop offset="0.6" stopColor={'lightgreen'} />
            <Stop offset="0.8" stopColor={'yellow'} />
            <Stop offset="1" stopColor={'orange'} />
          </LinearGradient>
        );
      }}
    />
  );
}
Note that areaGradientId prop is mandatory when using custom gradient component, and it should have the same value as the id passed in <LinearGradient>.

Labelled Area Chart
Adding the property label in the data array displays labels beside the data points.


Multiple Lines
Area charts are often used to compare 2 or more data sets. Below is an example -


For such type of charts, we pass 2 data sets named data and data2
Here is the code for the above chart -

import { LineChart } from "react-native-gifted-charts"
const App = () => {
    const lineData = [{value: 0},{value: 10},{value: 8},{value: 58},{value: 56},{value: 78},{value: 74},{value: 98}];
    const lineData2 = [{value: 0},{value: 20},{value: 18},{value: 40},{value: 36},{value: 60},{value: 54},{value: 85}];
    return (
        <View>
            <LineChart
            areaChart
            curved
            data={lineData}
            data2={lineData2}
            height={250}
            showVerticalLines
            spacing={44}
            initialSpacing={0}
            color1="skyblue"
            color2="orange"
            textColor1="green"
            hideDataPoints
            dataPointsColor1="blue"
            dataPointsColor2="red"
            startFillColor1="skyblue"
            startFillColor2="orange"
            startOpacity={0.8}
            endOpacity={0.3}
            />
        </View>
    );
};

Animated Area Chart
Adding the prop isAnimated to any chart renders the chart with an animation effect. here's an animated Area chart-


The code for the above chart is-

import { LineChart } from "react-native-gifted-charts"
const App = () => {
const lineData = [{value: 0},{value: 20},{value: 18},{value: 40},{value: 36},{value: 60},{value: 54},{value: 85}];
return (
    <View>
        <LineChart
        areaChart
        hideDataPoints
        isAnimated
        animationDuration={1200}
        startFillColor="#0BA5A4"
        startOpacity={1}
        endOpacity={0.3}
        initialSpacing={0}
        data={lineData}
        spacing={30}
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

Custom Data Points and Vertical strip
Normally, the data points can be circular (default) or rectangular in shape. Their size and color can be controlled through props.
Adding the customDataPoint prop allows you to use your own components as the data points. Similarly, adding the dataPointLabelComponent prop allows you to use your own components as the data point labels.

Data point label component related props-

dataPointLabelComponent
dataPointsHeight
dataPointsWidth
dataPointLabelShiftY
dataPointLabelShiftX
Strip related props-

showStrip
stripHeight
stripWidth
stripColor
stripOpacity
Note:When using customdataPoint, make sure to pass the custom point's height and using the props- dataPointsHeight and dataPointsWidth. Not passing these props might result in an improper alignment of the custom data points.


The code for the above chart is-

import { LineChart } from "react-native-gifted-charts"
const App = () => {
const customDataPoint = () => {
    return (
        <View
        style={{
            width: 20,
            height: 20,
            backgroundColor: 'white',
            borderWidth: 4,
            borderRadius: 10,
            borderColor: '#07BAD1',
        }}
        />
    );
};
const customLabel = val => {
    return (
        <View style={{width: 70, marginLeft: 7}}>
            <Text style={{color: 'white', fontWeight: 'bold'}}>{val}</Text>
        </View>
    );
};
const data = [
    {
        value: 100,
        labelComponent: () => customLabel('22 Nov'),
        customDataPoint: customDataPoint,
    },
    {
        value: 140,
        hideDataPoint: true,
    },
    {
        value: 250,
        customDataPoint: customDataPoint,
    },
    {
        value: 290,
        hideDataPoint: true,
    },
    {
        value: 410,
        labelComponent: () => customLabel('24 Nov'),
        customDataPoint: customDataPoint,
        showStrip: true,
        stripHeight: 190,
        stripColor: 'black',
        dataPointLabelComponent: () => {
        return (
            <View
            style={{
                backgroundColor: 'black',
                paddingHorizontal: 8,
                paddingVertical: 5,
                borderRadius: 4,
            }}>
            <Text style={{color: 'white'}}>410</Text>
            </View>
        );
        },
        dataPointLabelShiftY: -70,
        dataPointLabelShiftX: -4,
    },
    {
        value: 440,
        hideDataPoint: true,
    },
    {
        value: 300,
        customDataPoint: customDataPoint,
    },
    {
        value: 280,
        hideDataPoint: true,
    },
    {
        value: 180,
        labelComponent: () => customLabel('26 Nov'),
        customDataPoint: customDataPoint,
    },
    {
        value: 150,
        hideDataPoint: true,
    },
    {
        value: 150,
        customDataPoint: customDataPoint,
    },
];
return (
    <View style={{
        marginTop: 100,
        paddingVertical: 50,
        backgroundColor: '#414141',
      }}>
        <LineChart
            thickness={6}
            color="#07BAD1"
            maxValue={600}
            noOfSections={3}
            areaChart
            yAxisTextStyle={{color: 'lightgray'}}
            data={data}
            curved
            startFillColor={'rgb(84,219,234)'}
            endFillColor={'rgb(84,219,234)'}
            startOpacity={0.4}
            endOpacity={0.4}
            spacing={38}
            backgroundColor="#414141"
            rulesColor="gray"
            rulesType="solid"
            initialSpacing={10}
            yAxisColor="lightgray"
            xAxisColor="lightgray"
            dataPointsHeight={20}
            dataPointsWidth={20}
        />
    </View>
    );
};

Enabling press, and focusing the respective data point
Many Area/Line charts, specially those in trading apps, allow users to press on any part of the chart, and highlight the respective data point.
Implementing this has been described in the Line chart in the focus section.


pointerConfig
pointerConfig is an object, when passed as a prop, creates a magical effect. It lets the user scroll over chart to move the pointer along the chart.
For the sake of a very simple example, let's try adding the pointerConfig prop to our first example. The pointerConfig prop should be an object. For now, let's use an empty object. So, the code will be-

import { LineChart } from "react-native-gifted-charts";
        
const App = () => {
    const data = [{value: 15}, {value: 30}, {value: 26}, {value: 40}];
    return <LineChart areaChart data={data} pointerConfig={{}}/>;
};
This results in the below chart!


So, this was the simplest example with the magical scroll effect.

Understanding the pointerConfig
The pointerConfig object can have following fields-

type Pointer = {
  height?: number; // default: 0
  width?: number; // default: 0
  radius?: number; // default: 5
  pointerColor?: ColorValue; // default: 'red'
  pointer1Color?: ColorValue; // default: 'red'
  pointer2Color?: ColorValue; // default: 'red'
  pointer3Color?: ColorValue; // default: 'red'
  pointer4Color?: ColorValue; // default: 'red'
  pointer5Color?: ColorValue; // default: 'red'
  pointerComponent?: Function; // default: null
  showPointerStrip?: boolean; // default: true
  pointerStripWidth?: number; // default: containerHeight
  pointerStripHeight?: number; // default: 1
  pointerStripColor?: ColorValue; // default: 'black'
  pointerStripUptoDataPoint?: boolean; // default: false
  pointerLabelComponent?: Function; // default: null
  shiftPointerLabelX?: number; // default: 0
  shiftPointerLabelY?: number; // default: 0
  pointerLabelWidth?: number; // default: 20
  pointerLabelHeight?: number; // default: 20
  autoAdjustPointerLabelPosition?: boolean; // default: false
  pointerVanishDelay?: number; // default: 150
  activatePointersOnLongPress?: boolean; // default: false
  activatePointersDelay?: number; // default: 150
  hidePointer1?: boolean; // default: false
  hidePointer2?: boolean; // default: false
  hidePointer3?: boolean; // default: false
  hidePointer4?: boolean; // default: false
  hidePointer5?: boolean; // default: false
  strokeDashArray?: Array<number>;
  dynamicLegendComponent?: Function; // default null
  dynamicLegendContainerStyle?: Style object; // default null
};
The above properties can be understood with this labelled diagram-


Note:If you are using the pointerConfig prop, the scroll will be disabled automatically. This is because, it's difficult to achive both scrolling line and scrolling pointer simultaneously. So if you want to retain the scroll behaviour even after passing the pointerConfig prop, then set the property activatePointersOnLongPress to true inside the pointerConfig object. This will make the pointers visible only after long press.
So, before the long press, user can scroll the line. Once long pressed, scrolling will be disabled until the release of the long press. The duration after which a press event will be considered as long press can be controlled using the activatePointersDelay property inside the pointerConfig object. The default value of activatePointersDelay is 150.

Here's a beautiful example of an area chart having the magical scroll effect using the pointerConfig prop-


The code for the above chart is-

const data1 = [
        {value: 70},
        {value: 36},
        {value: 50},
        {value: 40},
        {value: 18},
        {value: 38},
      ];
      const data2 = [
        {value: 50},
        {value: 10},
        {value: 45},
        {value: 30},
        {value: 45},
        {value: 18},
      ];
      return (
        <View
          style={{
            paddingVertical: 100,
            paddingLeft: 20,
            backgroundColor: '#1C1C1C',
          }}>
          <LineChart
            areaChart
            curved
            data={data1}
            data2={data2}
            hideDataPoints
            spacing={68}
            color1="#8a56ce"
            color2="#56acce"
            startFillColor1="#8a56ce"
            startFillColor2="#56acce"
            endFillColor1="#8a56ce"
            endFillColor2="#56acce"
            startOpacity={0.9}
            endOpacity={0.2}
            initialSpacing={0}
            noOfSections={4}
            yAxisColor="white"
            yAxisThickness={0}
            rulesType="solid"
            rulesColor="gray"
            yAxisTextStyle={{color: 'gray'}}
            yAxisLabelSuffix="%"
            xAxisColor="lightgray"
            pointerConfig={{
              pointerStripUptoDataPoint: true,
              pointerStripColor: 'lightgray',
              pointerStripWidth: 2,
              strokeDashArray: [2, 5],
              pointerColor: 'lightgray',
              radius: 4,
              pointerLabelWidth: 100,
              pointerLabelHeight: 120,
              pointerLabelComponent: items => {
                return (
                  <View
                    style={{
                      height: 120,
                      width: 100,
                      backgroundColor: '#282C3E',
                      borderRadius: 4,
                      justifyContent:'center',
                      paddingLeft:16,
                    }}>
                    <Text style={{color: 'lightgray',fontSize:12}}>{2018}</Text>
                    <Text style={{color: 'white', fontWeight:'bold'}}>{items[0].value}</Text>
                    <Text style={{color: 'lightgray',fontSize:12,marginTop:12}}>{2019}</Text>
                    <Text style={{color: 'white', fontWeight:'bold'}}>{items[1].value}</Text>
                  </View>
                );
              },
            }}
          />
        </View>
      );
pointerLabelComponent
pointerLabelComponent is a function that returns the component to be rendered as a Label. It takes 3 parameters -
an array of items
secondaryDataItem
pointerIndex.
So, if there are multiple data arrays, the parameter items will have the data item corresponding to each data array. If the chart has secondaryData, the parameter secondaryDataItem will have the corresponding item from the secondaryData.Note: If you have a Pressable / Touchable item in your pointerLabelComponent, then you should set pointerEvents to 'auto' inside the pointerConfig object.
getPointerProps
getPointerProps prop can be used to get the current pointer's index, x and y coordinate values. It is a callback function that accepts a single parameter which is an object. This object has following properties-
pointerIndex
pointerX
pointerY
When the chart is pressed, it returns the index of the data point pressed.
When the chart is scrolled after pressing, it returns the index of the data point currently focused.
When the chart is released, it returns the index -1.
pointerColorsForDataSet
When using pointers with dataSet, you can set pointer colors on each data line using the pointerColorsForDataSet which is an array of color values.
dynamicLegendComponent
dynamicLegendComponent is a property inside the pointerConfig prop, very similar to pointerLabelComponent, the only difference is that it is stationary whereas pointerLabelComponent moves as the pointer moves. You can set the position of the dynamicLegendComponent using thedynamicLegendContainerStyle property in the pointerConfig

You are supposed to assign a callback function todynamicLegendComponent. The callback function receives 2 parameters-
Array of currently selected items (in case you are rendering a single line, the array will have a single item)
Index of the selected item.

Note: The legend component appears only as long as the pointer remains remains on the screen. To make the dynamic legend remain persistently on the screen, you can set the persistPointer property to true. The initialPointerIndexproperty can also be useful.
Here's another beautiful Area chart with pointer


The code for the above chart is-

import { LineChart } from "react-native-gifted-charts";
const App = () => {
  const ptData = [
    {value: 160, date: '1 Apr 2022'},
    {value: 180, date: '2 Apr 2022'},
    {value: 190, date: '3 Apr 2022'},
    {value: 180, date: '4 Apr 2022'},
    {value: 140, date: '5 Apr 2022'},
    {value: 145, date: '6 Apr 2022'},
    {value: 160, date: '7 Apr 2022'},
    {value: 200, date: '8 Apr 2022'},
  
    {value: 220, date: '9 Apr 2022'},
    {
      value: 240,
      date: '10 Apr 2022',
      label: '10 Apr',
      labelTextStyle: {color: 'lightgray', width: 60},
    },
    {value: 280, date: '11 Apr 2022'},
    {value: 260, date: '12 Apr 2022'},
    {value: 340, date: '13 Apr 2022'},
    {value: 385, date: '14 Apr 2022'},
    {value: 280, date: '15 Apr 2022'},
    {value: 390, date: '16 Apr 2022'},
  
    {value: 370, date: '17 Apr 2022'},
    {value: 285, date: '18 Apr 2022'},
    {value: 295, date: '19 Apr 2022'},
    {
      value: 300,
      date: '20 Apr 2022',
      label: '20 Apr',
      labelTextStyle: {color: 'lightgray', width: 60},
    },
    {value: 280, date: '21 Apr 2022'},
    {value: 295, date: '22 Apr 2022'},
    {value: 260, date: '23 Apr 2022'},
    {value: 255, date: '24 Apr 2022'},
  
    {value: 190, date: '25 Apr 2022'},
    {value: 220, date: '26 Apr 2022'},
    {value: 205, date: '27 Apr 2022'},
    {value: 230, date: '28 Apr 2022'},
    {value: 210, date: '29 Apr 2022'},
    {
      value: 200,
      date: '30 Apr 2022',
      label: '30 Apr',
      labelTextStyle: {color: 'lightgray', width: 60},
    },
    {value: 240, date: '1 May 2022'},
    {value: 250, date: '2 May 2022'},
    {value: 280, date: '3 May 2022'},
    {value: 250, date: '4 May 2022'},
    {value: 210, date: '5 May 2022'},
  ];
  
  return(
    <View
      style={{
        paddingVertical: 100,
        paddingLeft: 20,
        backgroundColor: '#1C1C1C',
      }}>
          <LineChart
          areaChart
          data={ptData}
          rotateLabel
          width={300}
          hideDataPoints
          spacing={10}
          color="#00ff83"
          thickness={2}
          startFillColor="rgba(20,105,81,0.3)"
          endFillColor="rgba(20,85,81,0.01)"
          startOpacity={0.9}
          endOpacity={0.2}
          initialSpacing={0}
          noOfSections={6}
          maxValue={600}
          yAxisColor="white"
          yAxisThickness={0}
          rulesType="solid"
          rulesColor="gray"
          yAxisTextStyle={{color: 'gray'}}
          yAxisSide='right'
          xAxisColor="lightgray"
          pointerConfig={{
            pointerStripHeight: 160,
            pointerStripColor: 'lightgray',
            pointerStripWidth: 2,
            pointerColor: 'lightgray',
            radius: 6,
            pointerLabelWidth: 100,
            pointerLabelHeight: 90,
            activatePointersOnLongPress: true,
            autoAdjustPointerLabelPosition: false,
            pointerLabelComponent: items => {
              return (
                <View
                  style={{
                    height: 90,
                    width: 100,
                    justifyContent: 'center',
                    marginTop: -30,
                    marginLeft: -40,
                  }}>
                  <Text style={{color: 'white', fontSize: 14, marginBottom:6,textAlign:'center'}}>
                    {items[0].date}
                  </Text>
  
                  <View style={{paddingHorizontal:14,paddingVertical:6, borderRadius:16, backgroundColor:'white'}}>
                    <Text style={{fontWeight: 'bold',textAlign:'center'}}>
                      {'$' + items[0].value + '.0'}
                    </Text>
                  </View>
                </View>
              );
            },
          }}
        />
      <View>
  );
}

Animate on data change
To make your data representation outstanding, you can consider adding smooth transitions to your chart on data change.

Here's an example-


Surprisingly, this huge feat can be achieved just by adding a prop called animateOnDataChange. And the duration of the transition animation can be controlled using the onDataChangeAnimationDuration prop.


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