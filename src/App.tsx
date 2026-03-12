import React, {useEffect} from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {RootNavigator} from './navigation/RootNavigator';
import {ErrorBoundary} from './components/common/ErrorBoundary';
import {initSounds, releaseSounds} from './utils/feedback';
import {initNotifications} from './utils/localNotifications';
import {useNewOrderNotifications} from './hooks/useNewOrderNotifications';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    initSounds();
    initNotifications();
    return () => releaseSounds();
  }, []);

  useNewOrderNotifications();

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{flex: 1}}>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar
              barStyle={isDarkMode ? 'light-content' : 'dark-content'}
              backgroundColor="#4F46E5"
            />
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

export default App;
