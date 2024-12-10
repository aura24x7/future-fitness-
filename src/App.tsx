import { TabBarProvider } from './context/TabBarContext';

const App = () => {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <AuthProvider>
            <ProfileProvider>
              <OnboardingProvider>
                <TabBarProvider>
                  <MealProvider>
                    <NavigationContainerInner>
                      {/* Rest of your app */}
                    </NavigationContainerInner>
                  </MealProvider>
                </TabBarProvider>
              </OnboardingProvider>
            </ProfileProvider>
          </AuthProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default App; 