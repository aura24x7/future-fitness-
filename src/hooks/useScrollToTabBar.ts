import { useCallback } from 'react';
import { useTabBar } from '../context/TabBarContext';
import { withTiming } from 'react-native-reanimated';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

const TIMING_CONFIG = {
  duration: 200,
};

export const useScrollToTabBar = () => {
  const { tabBarVisible } = useTabBar();
  let lastOffset = 0;
  let lastScrollTime = 0;

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentOffset = event.nativeEvent.contentOffset.y;
      const currentTime = Date.now();
      const velocity = event.nativeEvent.velocity?.y || 0;

      // Always show at top
      if (currentOffset <= 0) {
        tabBarVisible.value = withTiming(1, TIMING_CONFIG);
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
        tabBarVisible.value = withTiming(0, TIMING_CONFIG);
      } 
      // Show when scrolling up
      else if (scrollDiff < 0 && (effectiveVelocity < -0.5 || velocity < -0.5)) {
        tabBarVisible.value = withTiming(1, TIMING_CONFIG);
      }
      // Show when stopped scrolling
      else if (Math.abs(effectiveVelocity) < 0.01 && Math.abs(velocity) < 0.01) {
        tabBarVisible.value = withTiming(1, TIMING_CONFIG);
      }

      lastOffset = currentOffset;
      lastScrollTime = currentTime;
    },
    [tabBarVisible]
  );

  return { handleScroll };
};
