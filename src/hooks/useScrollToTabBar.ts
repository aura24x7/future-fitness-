import { useCallback, useRef } from 'react';
import { useTabBar } from '../context/TabBarContext';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';

const TIMING_CONFIG = {
  duration: 200,
};

export const useScrollToTabBar = () => {
  const { setTabBarVisible } = useTabBar();
  const scrollViewRef = useRef<ScrollView>(null);
  let lastOffset = 0;
  let lastScrollTime = 0;

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentOffset = event.nativeEvent.contentOffset.y;
      const currentTime = Date.now();
      const velocity = event.nativeEvent.velocity?.y || 0;

      // Always show at top
      if (currentOffset <= 0) {
        setTabBarVisible(true);
        lastOffset = currentOffset;
        lastScrollTime = currentTime;
        return;
      }

      // Calculate real velocity (distance/time)
      const timeDiff = currentTime - lastScrollTime;
      const scrollDiff = currentOffset - lastOffset;
      const effectiveVelocity = timeDiff > 0 ? scrollDiff / timeDiff : 0;

      // Hide when scrolling down
      if (scrollDiff > 0 && (effectiveVelocity > 0.5 || velocity > 0.5)) {
        setTabBarVisible(false);
      } 
      // Show when scrolling up
      else if (scrollDiff < 0 && (effectiveVelocity < -0.5 || velocity < -0.5)) {
        setTabBarVisible(true);
      }
      // Show when stopped scrolling
      else if (Math.abs(effectiveVelocity) < 0.01 && Math.abs(velocity) < 0.01) {
        setTabBarVisible(true);
      }

      lastOffset = currentOffset;
      lastScrollTime = currentTime;
    },
    [setTabBarVisible]
  );

  return {
    handleScroll,
    scrollViewRef,
  };
};
