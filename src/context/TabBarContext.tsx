import React, { createContext, useContext } from 'react';
import { useSharedValue } from 'react-native-reanimated';

type TabBarContextType = {
  tabBarVisible: { value: number };
};

const TabBarContext = createContext<TabBarContextType | undefined>(undefined);

export const TabBarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const tabBarVisible = useSharedValue(1);

  return (
    <TabBarContext.Provider value={{ tabBarVisible }}>
      {children}
    </TabBarContext.Provider>
  );
};

export const useTabBar = () => {
  const context = useContext(TabBarContext);
  if (!context) {
    throw new Error('useTabBar must be used within a TabBarProvider');
  }
  return context;
};
