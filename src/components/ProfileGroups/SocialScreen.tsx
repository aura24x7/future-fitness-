import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Text } from 'tamagui';
import { useTheme } from '../../theme/ThemeProvider';
import { IndividualsSection } from './IndividualsSection';
import SharedPlansSection from './SharedPlansSection';

type Tab = 'individuals' | 'sharedPlans';

const SocialScreen: React.FC = () => {
  const { colors, isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('individuals');

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text
          style={{ color: colors.text }}
          fontSize={24}
          fontWeight="700"
        >
          Social
        </Text>
        <Text
          style={{ color: colors.textSecondary }}
          fontSize={16}
        >
          Connect with friends and share plans
        </Text>
      </View>

      <View style={[styles.tabsContainer, { backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.6)' : 'rgba(229, 231, 235, 0.6)' }]}>
        <TouchableOpacity
          style={[
            styles.tabButton, 
            activeTab === 'individuals' && [styles.activeTab, { backgroundColor: isDarkMode ? colors.cardBackground : '#FFFFFF' }]
          ]}
          onPress={() => handleTabChange('individuals')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'individuals' }}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'individuals' ? colors.primary : colors.textSecondary }
            ]}
            fontWeight={activeTab === 'individuals' ? '600' : '400'}
            fontSize={16}
          >
            Individuals
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton, 
            activeTab === 'sharedPlans' && [styles.activeTab, { backgroundColor: isDarkMode ? colors.cardBackground : '#FFFFFF' }]
          ]}
          onPress={() => handleTabChange('sharedPlans')}
          accessibilityRole="tab" 
          accessibilityState={{ selected: activeTab === 'sharedPlans' }}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'sharedPlans' ? colors.primary : colors.textSecondary }
            ]}
            fontWeight={activeTab === 'sharedPlans' ? '600' : '400'}
            fontSize={16}
          >
            Shared Plans
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {activeTab === 'individuals' ? (
          <IndividualsSection />
        ) : (
          <SharedPlansSection />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    padding: 4,
    height: 56,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    height: 48,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
  },
});

export default SocialScreen; 