# NSTP HUB - Real-Time Comfortable Dark Mode

## Updated files

- `contexts/ThemeContext.js` - global real-time theme state + SecureStore persistence
- `constants/appTheme.js` - shared NSTP HUB light/dark semantic palette
- `app/_layout.tsx` - palette-aware React Navigation dark theme
- `app/(tabs)/_layout.tsx` - dark bottom navigation, More menu, profile navigation
- `app/(tabs)/AccountSettingsScreen.js` - real-time Dark Mode switch and readable dark settings/modal
- `app/(tabs)/HomepageScreen.js`
- `app/(tabs)/AnnouncementsScreen.js`
- `app/(tabs)/AttendanceRecordScreen.js`
- `app/(tabs)/DigitalID.js`
- `app/(tabs)/ExcuseLetterScreen.js`
- `app/(tabs)/ReportScreen.js`
- `app/(tabs)/Schedule.js`
- `app/(tabs)/Profile/ProfileScreen.js`

## Dark-mode color roles

All core dark-mode colors come from the supplied NSTP HUB palette:

- Main background: `#0D171B`
- Deep background/shadows: `#000D12`
- Cards / elevated surfaces: `#233E47`
- Primary readable text: `#EFEBE2`
- Strong text: `#FFFFFF`
- Secondary/muted text and borders: `#BEBEBE`
- Primary dark-mode accent: `#FFBD36`
- Secondary accent: `#D99202`
- Original light-mode brand maroon: `#54100F`
- Original light-mode brand green: `#58761C`

The dark theme intentionally avoids using maroon or green as small body text on dark backgrounds because their contrast is uncomfortable. Yellow/orange are used as dark-mode accents instead, while the original brand colors remain available in the light theme.

## Real-time behavior

The Account Settings switch calls `toggleDarkMode()` from the single `ThemeContext`. React updates `isDarkMode` immediately, so every mounted screen subscribed through `useAppTheme()` re-renders in the same interaction. The preference is then saved through Expo SecureStore and restored on the next app launch.

## Validation

The edited JS/TSX files were parsed successfully with Babel after modification. The included project copy has a pre-existing local ESLint/native optional-dependency issue in its bundled `node_modules`, so Expo lint could not be used as the final validator in this environment.
