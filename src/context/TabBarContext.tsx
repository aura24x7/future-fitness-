import React, { createContext, useContext, useState, useCallback } from 'react';
import { ScrollView } from 'react-native';
import { formatDate } from '../utils/dateUtils';

interface TabBarContextType {
  isScrolled: boolean;
  setIsScrolled: (value: boolean) => void;
  isTabBarVisible: boolean;
  setTabBarVisible: (value: boolean) => void;
  scrollViewRef: React.RefObject<ScrollView> | null;
  setScrollViewRef: (ref: React.RefObject<ScrollView>) => void;
  currentDate: string;
}

const TabBarContext = createContext<TabBarContextType | undefined>(undefined);

export const TabBarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isTabBarVisible, setTabBarVisible] = useState(true);
  const [scrollViewRef, setScrollViewRefState] = useState<React.RefObject<ScrollView> | null>(null);
  const currentDate = formatDate(new Date());

  const setScrollViewRef = useCallback((ref: React.RefObject<ScrollView>) => {
    setScrollViewRefState(ref);
  }, []);

  return (
    <TabBarContext.Provider 
      value={{ 
        isScrolled, 
        setIsScrolled,
        isTabBarVisible,
        setTabBarVisible,
        scrollViewRef, 
        setScrollViewRef,
        currentDate
      }}
    >
      {children}
    </TabBarContext.Provider>
  );
};

export const useTabBar = () => {
  const context = useContext(TabBarContext);
  if (!context) {
    throw new Error('useTabBar must be used within TabBarProvider');
  }
  return context;
};
