import React from 'react';
import { View, Dimensions, ScrollView } from 'react-native';
import { VictoryChart, VictoryLine, VictoryBar, VictoryTheme, VictoryAxis, VictoryPie } from 'victory-native';
import { Text } from 'tamagui';

const { width } = Dimensions.get('window');

// Sample data - replace with real data from your app
const weeklyProgress = [
  { x: 'Mon', y: 30 },
  { x: 'Tue', y: 45 },
  { x: 'Wed', y: 28 },
  { x: 'Thu', y: 50 },
  { x: 'Fri', y: 35 },
  { x: 'Sat', y: 60 },
  { x: 'Sun', y: 40 },
];

const workoutDistribution = [
  { x: "Cardio", y: 35 },
  { x: "Strength", y: 40 },
  { x: "Flexibility", y: 15 },
  { x: "HIIT", y: 10 },
];

const monthlyProgress = [
  { x: 1, y: 120 },
  { x: 2, y: 140 },
  { x: 3, y: 135 },
  { x: 4, y: 150 },
  { x: 5, y: 165 },
  { x: 6, y: 155 },
  { x: 7, y: 170 },
  { x: 8, y: 190 },
];

export const WorkoutCharts = () => {
  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ padding: 20 }}>
        {/* Weekly Progress Line Chart */}
        <Text fontSize={20} fontWeight="bold" marginBottom={10}>
          Weekly Workout Duration
        </Text>
        <VictoryChart
          theme={VictoryTheme.material}
          width={width - 40}
          height={300}
        >
          <VictoryLine
            style={{
              data: { stroke: "#c43a31" },
              parent: { border: "1px solid #ccc"}
            }}
            data={weeklyProgress}
          />
          <VictoryAxis
            dependentAxis
            label="Minutes"
            style={{
              axisLabel: { padding: 30 }
            }}
          />
          <VictoryAxis
            style={{
              tickLabels: { angle: -45 }
            }}
          />
        </VictoryChart>

        {/* Monthly Progress Bar Chart */}
        <Text fontSize={20} fontWeight="bold" marginVertical={20}>
          Monthly Progress
        </Text>
        <VictoryChart
          theme={VictoryTheme.material}
          width={width - 40}
          height={300}
          domainPadding={20}
        >
          <VictoryBar
            data={monthlyProgress}
            style={{
              data: { fill: "#4287f5" }
            }}
          />
          <VictoryAxis
            label="Week"
            style={{
              axisLabel: { padding: 30 }
            }}
          />
          <VictoryAxis
            dependentAxis
            label="Total Minutes"
            style={{
              axisLabel: { padding: 40 }
            }}
          />
        </VictoryChart>

        {/* Workout Type Distribution Pie Chart */}
        <Text fontSize={20} fontWeight="bold" marginVertical={20}>
          Workout Distribution
        </Text>
        <VictoryPie
          data={workoutDistribution}
          width={width - 40}
          height={300}
          colorScale={["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"]}
          style={{
            labels: {
              fill: "black",
              fontSize: 12,
              fontWeight: "bold"
            }
          }}
        />
      </View>
    </ScrollView>
  );
};
