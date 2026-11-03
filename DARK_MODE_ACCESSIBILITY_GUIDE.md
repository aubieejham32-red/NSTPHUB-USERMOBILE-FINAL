# NSTP HUB Real-Time Accessible Dark Mode

## Dark-mode palette

Only these supplied colors are used for dark-mode UI roles:

- `#000D12` — main background
- `#233E47` — elevated cards, navigation, inputs and panels
- `#EFEBE2` — primary readable text/icons
- `#D99202` — high-visibility headings, active states and accents
- `#58761C` — brand green for structural accents, borders and positive actions

## Updated application files

- `contexts/ThemeContext.js`
- `constants/appTheme.js`
- `app/_layout.tsx`
- `app/(tabs)/_layout.tsx`
- `app/(tabs)/AccountSettingsScreen.js`
- `app/(tabs)/HomepageScreen.js`
- `app/(tabs)/AnnouncementsScreen.js`
- `app/(tabs)/AttendanceRecordScreen.js`
- `app/(tabs)/DigitalID.js`
- `app/(tabs)/ExcuseLetterScreen.js`
- `app/(tabs)/ReportScreen.js`
- `app/(tabs)/Schedule.js`
- `app/(tabs)/Profile/ProfileScreen.js`

## Readability changes

- Cream (`#EFEBE2`) is used for normal text and icons on dark surfaces.
- Orange (`#D99202`) is reserved for large/bold headings and active states.
- Green (`#58761C`) is not used for small text on dark teal because that combination has weak contrast; it remains a brand accent, border, and positive-action color.
- The More menu text and icons now explicitly follow the current theme instead of inheriting light-mode colors.
- Signature drawing uses a cream paper area with near-black ink even while the surrounding editor remains dark, making handwriting and instructions substantially easier to see.
- Small metadata/helper labels were enlarged in the most affected screens.
- React Native font scaling remains enabled, so users with larger system text settings can increase text further.

## Real-time behavior

The Dark Mode switch updates the shared `ThemeContext` state synchronously. All subscribed screens re-render immediately. SecureStore persistence runs after the state update, so storage does not delay the visual theme change.
