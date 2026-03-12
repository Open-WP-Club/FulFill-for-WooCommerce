import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {RootNavigator} from './navigation/RootNavigator';
import {ErrorBoundary} from './components/common/ErrorBoundary';
import {initSounds, releaseSounds} from './utils/feedback';
import {initNotifications} from './utils/localNotifications';
import {useNewOrderNotifications} from './hooks/useNewOrderNotifications';
import {ThemeProvider, useTheme} from './theme/ThemeContext';

function AppContent() {
  const theme = useTheme();

  useEffect(() => {
    initSounds();
    initNotifications();
    return () => releaseSounds();
  }, []);

  useNewOrderNotifications();

  const navigationTheme = {
    ...(theme.isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.primary,
      background: theme.background,
      card: theme.surface,
      text: theme.textPrimary,
      border: theme.border,
      notification: theme.error,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar
        barStyle={theme.statusBar}
        backgroundColor={theme.primary}
      />
      <RootNavigator />
    </NavigationContainer>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{flex: 1}}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

export default App;
