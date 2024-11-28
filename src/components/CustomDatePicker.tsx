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

interface CustomDatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  onClose: () => void;
  minimumDate?: Date;
  maximumDate?: Date;
}

const ITEM_HEIGHT = 46; 
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const MOMENTUM_VELOCITY_THRESHOLD = 0.3;
const SCROLL_EVENT_THROTTLE = 16;

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

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const years = Array.from(
    { length: maximumDate.getFullYear() - minimumDate.getFullYear() + 1 },
    (_, i) => minimumDate.getFullYear() + i
  );

  useEffect(() => {
    const scrollToInitialPositions = () => {
      monthScrollRef.current?.scrollTo({
        y: selectedMonth * ITEM_HEIGHT,
        animated: true,
      });
      dayScrollRef.current?.scrollTo({
        y: (selectedDay - 1) * ITEM_HEIGHT,
        animated: true,
      });
      yearScrollRef.current?.scrollTo({
        y: (selectedYear - minimumDate.getFullYear()) * ITEM_HEIGHT,
        animated: true,
      });
    };

    setTimeout(scrollToInitialPositions, 100);
  }, []);

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
    scrollRef: React.RefObject<ScrollView>,
    setter: (value: number) => void,
    isYear = false,
    setScrolling: (value: boolean) => void
  ) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const value = isYear ? minimumDate.getFullYear() + index : index;

    scrollRef.current?.scrollTo({
      y: index * ITEM_HEIGHT,
      animated: true,
    });

    setter(isYear ? value : index);
    setScrolling(false);
  };

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
    setter: (value: number) => void,
    current: number,
    isYear = false
  ) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const value = isYear ? minimumDate.getFullYear() + index : index;

    if (value !== current && index >= 0) {
      setter(isYear ? value : index);
    }
  };

  const handleConfirm = () => {
    const newDate = new Date(selectedYear, selectedMonth, selectedDay);
    onChange(newDate);
    onClose();
  };

  const renderPickerColumn = (
    items: (string | number)[],
    scrollRef: React.RefObject<ScrollView>,
    selectedValue: number,
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void,
    onMomentumEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void,
    onScrollBegin: () => void,
    label: string
  ) => (
    <View style={styles.pickerColumn}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <View style={styles.scrollContainer}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate={Platform.OS === 'ios' ? 'normal' : 0.9}
          scrollEventThrottle={SCROLL_EVENT_THROTTLE}
          onScroll={onScroll}
          onScrollBeginDrag={onScrollBegin}
          onMomentumScrollEnd={onMomentumEnd}
          contentContainerStyle={[
            styles.scrollContent,
            { height: items.length * ITEM_HEIGHT + (PICKER_HEIGHT - ITEM_HEIGHT) }
          ]}
        >
          {items.map((item, index) => (
            <View 
              key={item.toString()} 
              style={[
                styles.pickerItemContainer,
                { height: ITEM_HEIGHT }
              ]}
            >
              <Text style={[
                styles.pickerItemText,
                ((label === 'YEAR' && item === selectedValue) ||
                 (label !== 'YEAR' && index === selectedValue)) &&
                styles.selectedPickerItemText
              ]}>
                {item}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.headerButton}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleConfirm}>
          <Text style={[styles.headerButton, styles.confirmButton]}>Done</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pickerContainer}>
        {renderPickerColumn(
          months,
          monthScrollRef,
          selectedMonth,
          (e) => handleScroll(e, setSelectedMonth, selectedMonth),
          (e) => handleMomentumScrollEnd(e, monthScrollRef, setSelectedMonth, false, setIsMonthScrolling),
          () => setIsMonthScrolling(true),
          'MONTH'
        )}
        {renderPickerColumn(
          Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => i + 1),
          dayScrollRef,
          selectedDay - 1,
          (e) => handleScroll(e, setSelectedDay, selectedDay - 1, false),
          (e) => handleMomentumScrollEnd(e, dayScrollRef, (value) => setSelectedDay(value + 1), false, setIsDayScrolling),
          () => setIsDayScrolling(true),
          'DAY'
        )}
        {renderPickerColumn(
          years,
          yearScrollRef,
          selectedYear,
          (e) => handleScroll(e, setSelectedYear, selectedYear, true),
          (e) => handleMomentumScrollEnd(e, yearScrollRef, setSelectedYear, true, setIsYearScrolling),
          () => setIsYearScrolling(true),
          'YEAR'
        )}
      </View>

      <View style={styles.selectionOverlay}>
        <View style={styles.selectionBox} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  headerButton: {
    fontSize: 17,
    color: '#666666',
    paddingHorizontal: 8,
  },
  confirmButton: {
    color: '#9F7AEA',
    fontWeight: '600',
  },
  pickerContainer: {
    flexDirection: 'row',
    height: PICKER_HEIGHT,
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  pickerColumn: {
    flex: 1,
    height: PICKER_HEIGHT,
  },
  pickerLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginVertical: 8,
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  scrollContainer: {
    height: PICKER_HEIGHT,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingVertical: (PICKER_HEIGHT - ITEM_HEIGHT) / 2,
  },
  pickerItemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: 20,
    color: '#1A1A1A',
    textAlign: 'center',
    opacity: 0.5,
  },
  selectedPickerItemText: {
    color: '#9F7AEA',
    fontWeight: '600',
    fontSize: 22,
    opacity: 1,
  },
  selectionOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: (PICKER_HEIGHT - ITEM_HEIGHT) / 2,
    top: (PICKER_HEIGHT - ITEM_HEIGHT) / 2,
    pointerEvents: 'none',
    backgroundColor: 'rgba(159, 122, 234, 0.05)',
  },
  selectionBox: {
    flex: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
});

export default CustomDatePicker;
