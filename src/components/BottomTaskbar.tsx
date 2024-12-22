import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Dimensions, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const BottomTaskbar = () => {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.cardBackground,
          paddingBottom: Math.max(insets.bottom, 16),
          borderTopColor: colors.border,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.tab}
        onPress={() => navigation.navigate('ProfileGroups')}
      >
        <View style={styles.iconContainer}>
          <View style={[styles.iconWrapper, {
            backgroundColor: isDarkMode ? 'rgba(34, 197, 94, 0.2)' : '#22C55E20',
          }]}>
            <Ionicons
              name="people"
              size={24}
              color="#22C55E"
            />
          </View>
          <Text style={[styles.label, { 
            color: colors.text,
            fontSize: 13,
            fontWeight: '600',
            marginTop: 4
          }]}>Social</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        onPress={() => navigation.navigate('FoodTextInput')}
      >
        <View style={styles.iconContainer}>
          <View style={[styles.iconWrapper, {
            backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.2)' : '#6366F120',
          }]}>
            <Ionicons
              name="search-outline"
              size={24}
              color="#6366F1"
            />
          </View>
          <Text style={[styles.label, { 
            color: colors.text,
            fontSize: 13,
            fontWeight: '600',
            marginTop: 4
          }]}>Text Log</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        onPress={() => navigation.navigate('FoodScanner')}
      >
        <View style={[styles.iconContainer, styles.scanContainer]}>
          <View style={[styles.scanIconWrapper, {
            backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#EF444420',
          }]}>
            <Ionicons
              name="scan-outline"
              size={24}
              color="#EF4444"
            />
          </View>
          <Text style={[styles.label, { 
            color: colors.text,
            fontSize: 13,
            fontWeight: '600',
            marginTop: 4
          }]}>Scan Food</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 0.5,
    width: width,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  scanContainer: {
    position: 'relative',
  },
  scanIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
});

export default BottomTaskbar;
