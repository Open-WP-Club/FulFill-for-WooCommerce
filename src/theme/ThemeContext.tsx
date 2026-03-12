import React, {createContext, useContext, useMemo} from 'react';
import {useColorScheme} from 'react-native';
import {colors, type ThemeColors} from './colors';
import {useSettingsStore} from '../stores/settingsStore';

const ThemeContext = createContext<ThemeColors>(colors.light);

export function ThemeProvider({children}: {children: React.ReactNode}) {
  const systemScheme = useColorScheme();
  const themeMode = useSettingsStore(s => s.themeMode);

  const theme = useMemo(() => {
    if (themeMode === 'system') {
      return systemScheme === 'dark' ? colors.dark : colors.light;
    }
    return themeMode === 'dark' ? colors.dark : colors.light;
  }, [themeMode, systemScheme]);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeColors {
  return useContext(ThemeContext);
}
