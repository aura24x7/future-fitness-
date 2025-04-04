import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, LayoutRectangle } from 'react-native';
import { Text } from 'tamagui';
import { BarChart } from 'react-native-gifted-charts';
import { GiftedBarData, MACRO_COLORS } from '../../utils/transforms/giftedChartTransforms';
import { useTheme } from '../../theme/ThemeProvider';
import MacroTooltip from './MacroTooltip';

interface MacroBarChartProps {
  data: GiftedBarData[];
  title?: string;
  height?: number;
  timeRange?: 'weekly' | 'monthly';
}

interface TooltipData {
  totalCalories: number;
  protein: { grams: number; calories: number };
  carbs: { grams: number; calories: number };
  fat: { grams: number; calories: number };
  position: {
    left: number;
    top: number;
  };
}

const MacroBarChart: React.FC<MacroBarChartProps> = ({
  data,
  title,
  height = 300,
  timeRange = 'weekly',
}) => {
  const { colors, isDarkMode } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 40;
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const chartRef = useRef<View>(null);
  const [chartLayout, setChartLayout] = useState<LayoutRectangle | null>(null);

  // Ensure data is properly formatted
  const validData = React.useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map(item => ({
      ...item,
      stacks: Array.isArray(item.stacks) ? item.stacks : [],
      // Adjust spacing and label width based on timeRange
      spacing: timeRange === 'monthly' ? 24 : 16,
      labelWidth: timeRange === 'monthly' ? 40 : 32,
    }));
  }, [data, timeRange]);

  // Check if data is empty or all values are 0
  const hasValidData = validData.some(item => 
    item.stacks.some(stack => stack.value > 0)
  );

  if (!hasValidData) {
    return (
      <View style={[styles.container, { height }]}>
        {title && (
          <Text style={{ color: colors.text }} fontWeight="600" marginBottom={10}>
            {title}
          </Text>
        )}
        <View style={[styles.chartContainer, { height: height - 60, justifyContent: 'center' }]}>
          <Text style={{ color: colors.text }}>No data available</Text>
        </View>
        <View style={styles.legend}>
          {Object.entries(MACRO_COLORS).map(([macro, color]) => (
            <View key={macro} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: color }]} />
              <Text style={{ color: colors.text }} fontSize={12}>
                {macro.charAt(0).toUpperCase() + macro.slice(1)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  // Calculate maxValue for Y-axis with padding
  const maxValue = Math.max(...validData.map(item => 
    item.stacks.reduce((sum, stack) => sum + (stack.value || 0), 0)
  ));
  const yAxisMaxValue = Math.ceil((maxValue * 1.2) / 100) * 100 || 100;

  const handleBarPress = (item: GiftedBarData, index: number) => {
    if (!item.stacks || item.stacks.length === 0 || !chartLayout) return;

    // Calculate tooltip position based on bar index
    const barWidth = 32;
    const spacing = 16;
    const initialSpacing = 20;
    const barPosition = initialSpacing + (index * (barWidth + spacing));
    
    // Extract macro data
    const [protein, carbs, fat] = item.stacks;
    
    setTooltipData({
      totalCalories: item.value,
      protein: {
        grams: Math.round(protein.value / 4), // Convert calories back to grams
        calories: protein.value
      },
      carbs: {
        grams: Math.round(carbs.value / 4),
        calories: carbs.value
      },
      fat: {
        grams: Math.round(fat.value / 9),
        calories: fat.value
      },
      position: {
        left: barPosition,
        top: chartLayout.height / 2
      }
    });

    // Hide tooltip after 3 seconds
    setTimeout(() => {
      setTooltipData(null);
    }, 3000);
  };

  return (
    <View style={styles.container}>
      {title && (
        <Text style={{ color: colors.text }} fontWeight="600" marginBottom={10}>
          {title}
        </Text>
      )}
      <View 
        ref={chartRef}
        style={[styles.chartContainer, { height: height - 60 }]}
        onLayout={(e) => setChartLayout(e.nativeEvent.layout)}
      >
        <BarChart
          stackData={validData}
          width={chartWidth}
          height={height - 80}
          barWidth={32}
          spacing={16}
          hideRules
          xAxisThickness={1}
          yAxisThickness={1}
          xAxisColor={colors.text}
          yAxisColor={colors.text}
          yAxisTextStyle={{ 
            color: colors.text,
            fontSize: 10,
            marginRight: 4
          }}
          xAxisLabelTextStyle={{
            color: colors.text,
            fontSize: 10,
            marginTop: 4
          }}
          noOfSections={5}
          maxValue={yAxisMaxValue}
          yAxisLabelSuffix="cal"
          showVerticalLines
          verticalLinesColor={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
          verticalLinesThickness={1}
          disableScroll
          rulesType="solid"
          rulesColor={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
          showFractionalValues={false}
          roundToDigits={0}
          initialSpacing={20}
          endSpacing={20}
          barBorderRadius={4}
          onPress={handleBarPress}
        />
        {tooltipData && (
          <View style={[
            styles.tooltipWrapper,
            {
              left: tooltipData.position.left,
              top: tooltipData.position.top - 120,
            }
          ]}>
            <MacroTooltip
              totalCalories={tooltipData.totalCalories}
              protein={tooltipData.protein}
              carbs={tooltipData.carbs}
              fat={tooltipData.fat}
            />
          </View>
        )}
      </View>
      <View style={styles.legendContainer}>
        <View style={styles.legend}>
          {Object.entries(MACRO_COLORS).map(([macro, color]) => (
            <View key={macro} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: color }]} />
              <Text style={{ color: colors.text }} fontSize={12}>
                {macro.charAt(0).toUpperCase() + macro.slice(1)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipWrapper: {
    position: 'absolute',
    zIndex: 999,
  },
  legendContainer: {
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default MacroBarChart; 