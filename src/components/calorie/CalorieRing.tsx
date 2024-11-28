import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface Props {
  consumed: number;
  goal: number;
  size?: number;
}

const CalorieRing: React.FC<Props> = ({ consumed, goal, size = 200 }) => {
  const percentage = Math.min((consumed / goal) * 100, 100);
  const strokeWidth = size * 0.1;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} style={styles.ring}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(41, 98, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#2962FF"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.content}>
        <Text style={styles.percentage}>{Math.round(percentage)}%</Text>
        <Text style={styles.label}>of daily goal</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    transform: [{ rotate: '90deg' }],
  },
  content: {
    position: 'absolute',
    alignItems: 'center',
  },
  percentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2962FF',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
});

export default CalorieRing;
