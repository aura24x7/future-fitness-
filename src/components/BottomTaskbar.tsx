import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Dimensions, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const BottomTaskbar = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

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
          <Ionicons
            name="people"
            size={24}
            color={colors.primary}
          />
          <Text style={[styles.label, { color: colors.text }]}>Groups</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        onPress={() => navigation.navigate('FoodScanner')}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name="scan"
            size={24}
            color={colors.primary}
          />
          <Text style={[styles.label, { color: colors.text }]}>Scan</Text>
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
    paddingVertical: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default BottomTaskbar;
