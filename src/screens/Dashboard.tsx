import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { useTheme } from '../theme/ThemeProvider'
import {
  StatisticsCard,
  StatisticsText,
  ProgressChart,
  ActivityFeedItem
} from '../components/themed/DashboardComponents'
import { useTabBarScroll } from '../hooks/useTabBarScroll'

function Dashboard() {
  const { isDarkMode } = useTheme()
  const theme = isDarkMode ? 'dark' : 'light'
  const { scrollViewRef, handleScroll } = useTabBarScroll()

  // Preserve existing data and logic
  const statistics = {
    // ... your existing statistics data
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      {/* Statistics Section - Maintaining existing layout */}
      <View style={styles.statsSection}>
        <StatisticsCard theme={theme}>
          <StatisticsText theme={theme} variant="header">
            {statistics.title}
          </StatisticsText>
          <StatisticsText theme={theme} variant="body">
            {statistics.value}
          </StatisticsText>
        </StatisticsCard>
      </View>

      {/* Progress Chart Section - Keeping current implementation */}
      <ProgressChart theme={theme} style={styles.chartSection}>
        {/* Your existing chart component with theme prop */}
      </ProgressChart>

      {/* Activity Feed Section - Preserving current structure */}
      <View style={styles.feedSection}>
        {/* Map through your existing activities */}
        <ActivityFeedItem theme={theme}>
          <StatisticsText theme={theme} variant="body">
            {/* Your existing activity content */}
          </StatisticsText>
        </ActivityFeedItem>
      </View>
    </ScrollView>
  )
}

// Maintain existing styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  chartSection: {
    marginVertical: 16,
    height: 200,
  },
  feedSection: {
    paddingHorizontal: 16,
  },
})

export default Dashboard 