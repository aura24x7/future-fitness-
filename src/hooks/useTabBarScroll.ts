import { useRef, useEffect } from 'react';
import { ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useTabBar } from '../contexts/TabBarContext';

export const useTabBarScroll = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const { setIsScrolled, setScrollViewRef, setTabBarVisible } = useTabBar();
  const lastOffset = useRef(0);

  useEffect(() => {
    if (scrollViewRef.current) {
      setScrollViewRef(scrollViewRef);
    }
  }, [setScrollViewRef]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const velocity = event.nativeEvent.velocity?.y || 0;

    // Show tab bar when at the top
    if (currentOffset <= 0) {
      setTabBarVisible(true);
      setIsScrolled(false);
      lastOffset.current = currentOffset;
      return;
    }

    // Hide tab bar when scrolling down, show when scrolling up
    if (currentOffset > lastOffset.current && velocity > 0) {
      setTabBarVisible(false);
    } else if (currentOffset < lastOffset.current && velocity < 0) {
      setTabBarVisible(true);
    }

    setIsScrolled(currentOffset > 0);
    lastOffset.current = currentOffset;
  };

  return {
    scrollViewRef,
    handleScroll,
  };
}; 