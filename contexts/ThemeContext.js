import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import * as SecureStore from 'expo-secure-store';

const THEME_STORAGE_KEY = 'nstphub_theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadSavedTheme = async () => {
      try {
        const savedTheme = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
        if (mounted && savedTheme) {
          setIsDarkMode(savedTheme === 'dark');
        }
      } catch (error) {
        console.warn('Unable to load saved theme:', error);
      } finally {
        if (mounted) {
          setThemeLoaded(true);
        }
      }
    };

    void loadSavedTheme();

    return () => {
      mounted = false;
    };
  }, []);

  const setDarkMode = (enabled) => {
    // Update React state first. Every subscribed screen re-renders immediately.
    setIsDarkMode(Boolean(enabled));

    // Persistence happens after the real-time UI update.
    void SecureStore.setItemAsync(
      THEME_STORAGE_KEY,
      enabled ? 'dark' : 'light'
    ).catch(error => {
      console.warn('Unable to save theme:', error);
    });
  };

  const toggleDarkMode = () => {
    setIsDarkMode(current => {
      const next = !current;

      void SecureStore.setItemAsync(
        THEME_STORAGE_KEY,
        next ? 'dark' : 'light'
      ).catch(error => {
        console.warn('Unable to save theme:', error);
      });

      return next;
    });
  };

  const value = useMemo(
    () => ({
      isDarkMode,
      themeLoaded,
      setDarkMode,
      setIsDarkMode: setDarkMode,
      toggleDarkMode,
    }),
    [isDarkMode, themeLoaded]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used inside ThemeProvider.');
  }

  return context;
}
