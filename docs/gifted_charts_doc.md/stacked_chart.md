Stacked Bar Chartsprops table
Stacked bar chart has bars that have multiple sections stacked one above the other

To make stacked bar charts, we just send the prop stackData instead of data to the <BarChart/> component.

Minimal Stacked Bar Chart

The code for the above chart is-

import { BarChart } from "react-native-gifted-charts";
        
const App = () => {
    const stackData = [
        {
          stacks: [
            {value: 10, color: 'orange'},
            {value: 20, color: '#4ABFF4', marginBottom: 2},
          ],
          label: 'Jan',
        },
        {
          stacks: [
            {value: 10, color: '#4ABFF4'},
            {value: 11, color: 'orange', marginBottom: 2},
            {value: 15, color: '#28B2B3', marginBottom: 2},
          ],
          label: 'Mar',
        },
        {
          stacks: [
            {value: 14, color: 'orange'},
            {value: 18, color: '#4ABFF4', marginBottom: 2},
          ],
          label: 'Feb',
        },
        {
          stacks: [
            {value: 7, color: '#4ABFF4'},
            {value: 11, color: 'orange', marginBottom: 2},
            {value: 10, color: '#28B2B3', marginBottom: 2},
          ],
          label: 'Mar',
        },
      ];
    return(
        <View>
            <BarChart
            width={340}
            rotateLabel
            noOfSections={4}
            stackData={stackData}
            />
        </View>
    );
};
Understanding the stackData
The stackData passed to the BarChart component is an array of objects.
Each object contains a mandatory key named stacks.
The value corresponding to the stacks key is an array of objects, each object representing a section of the stack.

The above stack chart can be styled a bit to create a beutiful stack chart like this-


For this, just reduce the barWidth and set barBorderRadius to half of the barWidth. Also adjust the spacing.
So the modified BarChart component will be like-

<BarChart
width={340}
rotateLabel
barWidth={12}
spacing={40}
noOfSections={4}
barBorderRadius={6}
stackData={stackData}
/>
For this chart, the stackData is same as that for the previous chart.


Stacked Bar Chart with Gradient effect
Below is a sample Stacked Bar chart.


The code for the above chart is-

const stackData = [
  {
    stacks: [
      {
        value: 10,
      },
      {
        value: 20,
        marginBottom: 2,
      },
    ],
    spacing: 15,
    label: 'Jan',
  },
  {
    stacks: [
      {value: 10},
      {
        value: 11,
        marginBottom: 2,
      },
      {
        value: 15,
        marginBottom: 2,
      },
    ],
    label: 'Mar',
  },
  {
    stacks: [{value: 14}, {value: 18, marginBottom: 2}],
    spacing: 15,
    label: 'Feb',
  },
  {
    stacks: [{value: 7}, {value: 11, marginBottom: 2}],
    label: 'Mar',
  },
];

return <BarChart stackData={stackData} />
Now, just add the prop showGradient to the BarChart component, and it results in-


It takes white as the gradient color by default. We can change it using the gradientColor prop.

The different bars can be given different values of gradientColor and color. Similarly, each section of a bar can be given different values of gradientColor and color. Here is an example-


The code for the above chart is-

const stackData = [
  {
    stacks: [
      {
        value: 10,
      },
      {
        value: 20,
        marginBottom: 2,
      },
    ],
    spacing: 15,
    label: 'Jan',
  },
  {
    gradientColor: 'blue',
    stacks: [
      {value: 10},
      {
        value: 11,
        marginBottom: 2,
      },
      {
        value: 15,
        marginBottom: 2,
      },
    ],
    label: 'Mar',
  },
  {
    stacks: [{value: 14}, {value: 18, gradientColor:'yellow', color: 'green', marginBottom: 2}],
    spacing: 15,
    label: 'Feb',
  },
  {
    stacks: [{value: 7}, {value: 11, marginBottom: 2}],
    label: 'Mar',
  },
];

return <BarChart stackData={stackData} showGradient />
