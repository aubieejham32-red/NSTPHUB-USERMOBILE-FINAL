# NSTP HUB - Real-time Dark Mode Update

## Palette used

- `#EFEBE2` cream
- `#54100F` maroon
- `#58761C` green
- `#FFBD36` yellow
- `#D99202` orange
- `#233E47` dark teal
- `#000D12` near black
- `#FFFFFF` white
- `#BEBEBE` gray
- `#0D171B` dark background

## Shared theme files

1. `contexts/ThemeContext.js`
   - Holds one global `isDarkMode` value.
   - `toggleDarkMode()` updates React state immediately.
   - Saves the preference with Expo SecureStore after the UI state changes.
   - Restores the saved preference on app launch.

2. `constants/appTheme.js`
   - Documents the supplied NSTP HUB palette and semantic light/dark colors.

3. `app/_layout.tsx`
   - Wraps the application in the custom `ThemeProvider`.
   - React Navigation switches between `DefaultTheme` and `DarkTheme` in real time.
   - Status bar follows the selected theme.

## Main authenticated screens updated

4. `app/(tabs)/_layout.tsx`
   - Bottom navigation, More menu, profile button and icons react to dark mode.

5. `app/(tabs)/AccountSettingsScreen.js`
   - Dark-mode switch is connected to the global theme.
   - Screen, password modal, inputs, labels and status bar react immediately.

6. `app/(tabs)/HomepageScreen.js`
7. `app/(tabs)/AnnouncementsScreen.js`
8. `app/(tabs)/AttendanceRecordScreen.js`
9. `app/(tabs)/DigitalID.js`
10. `app/(tabs)/ExcuseLetterScreen.js`
11. `app/(tabs)/ReportScreen.js`
12. `app/(tabs)/Schedule.js`
13. `app/(tabs)/Profile/ProfileScreen.js`

These screens now subscribe to `ThemeContext` and rebuild their theme-dependent styles whenever `isDarkMode` changes.

## Real-time flow

`AccountSettingsScreen -> toggleDarkMode() -> ThemeContext state changes -> subscribed screens re-render immediately -> SecureStore saves preference`

No app restart is required for the visual change.
