import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';

interface CustomDatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  onClose: () => void;
  minimumDate?: Date;
  maximumDate?: Date;
}

const { width } = Dimensions.get('window');
const ITEM_HEIGHT = 42;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const MOMENTUM_VELOCITY_THRESHOLD = 0.3;
const SCROLL_EVENT_THROTTLE = 16;
const COLUMN_WIDTH = width * 0.27; // Equal width for all columns

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  onClose,
  minimumDate = new Date(1900, 0, 1),
  maximumDate = new Date(),
}) => {
  const [selectedMonth, setSelectedMonth] = useState(value.getMonth());
  const [selectedDay, setSelectedDay] = useState(value.getDate());
  const [selectedYear, setSelectedYear] = useState(value.getFullYear());
  
  const monthScrollRef = useRef<ScrollView>(null);
  const dayScrollRef = useRef<ScrollView>(null);
  const yearScrollRef = useRef<ScrollView>(null);
  
  const [isMonthScrolling, setIsMonthScrolling] = useState(false);
  const [isDayScrolling, setIsDayScrolling] = useState(false);
  const [isYearScrolling, setIsYearScrolling] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from(
    { length: maximumDate.getFullYear() - minimumDate.getFullYear() + 1 },
    (_, i) => minimumDate.getFullYear() + i
  );

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const days = Array.from(
    { length: getDaysInMonth(selectedMonth, selectedYear) },
    (_, i) => i + 1
  );

  useEffect(() => {
    // Initial scroll to selected positions
    setTimeout(() => {
      monthScrollRef.current?.scrollTo({
        y: selectedMonth * ITEM_HEIGHT,
        animated: false,
      });
      dayScrollRef.current?.scrollTo({
        y: (selectedDay - 1) * ITEM_HEIGHT,
        animated: false,
      });
      yearScrollRef.current?.scrollTo({
        y: (selectedYear - minimumDate.getFullYear()) * ITEM_HEIGHT,
        animated: false,
      });
    }, 0);
  }, []);

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
    type: 'month' | 'day' | 'year'
  ) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);

    switch (type) {
      case 'month':
        if (!isMonthScrolling) {
          const newMonth = Math.min(Math.max(0, index), 11);
          setSelectedMonth(newMonth);
          onChange(new Date(selectedYear, newMonth, selectedDay));
        }
        break;
      case 'day':
        if (!isDayScrolling) {
          const maxDays = getDaysInMonth(selectedMonth, selectedYear);
          const newDay = Math.min(Math.max(1, index + 1), maxDays);
          setSelectedDay(newDay);
          onChange(new Date(selectedYear, selectedMonth, newDay));
        }
        break;
      case 'year':
        if (!isYearScrolling) {
          const newYear = minimumDate.getFullYear() + index;
          setSelectedYear(newYear);
          onChange(new Date(newYear, selectedMonth, selectedDay));
        }
        break;
    }
  };

  const renderPickerItems = (
    items: (string | number)[],
    selected: number,
    type: 'month' | 'day' | 'year'
  ) => {
    return items.map((item, index) => {
      const isSelected = 
        type === 'month' ? index === selected :
        type === 'day' ? index + 1 === selected :
        +item === selected;

      return (
        <View key={item} style={styles.itemContainer}>
          <Text
            style={[
              styles.itemText,
              isSelected && styles.selectedItemText,
              type === 'month' && styles.monthText,
            ]}
            numberOfLines={1}
          >
            {item}
          </Text>
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.headerButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => {
            onChange(new Date(selectedYear, selectedMonth, selectedDay));
            onClose();
          }}
          style={styles.headerButton}
        >
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pickerContainer}>
        <View style={styles.columnHeaders}>
          <Text style={styles.columnHeader}>MONTH</Text>
          <Text style={styles.columnHeader}>DAY</Text>
          <Text style={styles.columnHeader}>YEAR</Text>
        </View>

        <View style={styles.selectionOverlay}>
          <View style={styles.selectionBar} />
        </View>

        <View style={styles.scrollContainer}>
          <ScrollView
            ref={monthScrollRef}
            style={[styles.scrollColumn, { width: COLUMN_WIDTH }]}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            scrollEventThrottle={SCROLL_EVENT_THROTTLE}
            onScroll={(e) => handleScroll(e, 'month')}
            onMomentumScrollBegin={() => setIsMonthScrolling(true)}
            onMomentumScrollEnd={() => setIsMonthScrolling(false)}
          >
            <View style={styles.paddingView} />
            {renderPickerItems(months, selectedMonth, 'month')}
            <View style={styles.paddingView} />
          </ScrollView>

          <ScrollView
            ref={dayScrollRef}
            style={[styles.scrollColumn, { width: COLUMN_WIDTH }]}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            scrollEventThrottle={SCROLL_EVENT_THROTTLE}
            onScroll={(e) => handleScroll(e, 'day')}
            onMomentumScrollBegin={() => setIsDayScrolling(true)}
            onMomentumScrollEnd={() => setIsDayScrolling(false)}
          >
            <View style={styles.paddingView} />
            {renderPickerItems(days, selectedDay, 'day')}
            <View style={styles.paddingView} />
          </ScrollView>

          <ScrollView
            ref={yearScrollRef}
            style={[styles.scrollColumn, { width: COLUMN_WIDTH }]}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            scrollEventThrottle={SCROLL_EVENT_THROTTLE}
            onScroll={(e) => handleScroll(e, 'year')}
            onMomentumScrollBegin={() => setIsYearScrolling(true)}
            onMomentumScrollEnd={() => setIsYearScrolling(false)}
          >
            <View style={styles.paddingView} />
            {renderPickerItems(years, selectedYear, 'year')}
            <View style={styles.paddingView} />
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    width: width * 0.9,
    maxHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  cancelText: {
    color: '#666666',
    fontSize: 17,
    fontWeight: '400',
  },
  doneText: {
    color: '#6366F1',
    fontSize: 17,
    fontWeight: '600',
  },
  pickerContainer: {
    height: PICKER_HEIGHT + 80,
    position: 'relative',
  },
  columnHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  columnHeader: {
    width: COLUMN_WIDTH,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    letterSpacing: 0.5,
  },
  scrollContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  scrollColumn: {
    height: PICKER_HEIGHT,
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 20,
    color: '#1F2937',
    fontWeight: '400',
  },
  selectedItemText: {
    color: '#6366F1',
    fontWeight: '600',
  },
  monthText: {
    fontSize: 18,
  },
  paddingView: {
    height: PICKER_HEIGHT * 0.4,
  },
  selectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  selectionBar: {
    width: '100%',
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
});

export default CustomDatePicker;
