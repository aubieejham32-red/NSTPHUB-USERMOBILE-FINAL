# Homepage Dark Mode Text Readability Fix

## File updated
- `app/(tabs)/HomepageScreen.js`

## What was fixed in Dark Mode only
- Student detail values such as Subject, Term, Gender, Contact, and Academic Year now use `#EFEBE2` on dark cards.
- `View all` action text now uses `#EFEBE2` instead of low-contrast green on `#233E47`.
- Announcement date and instructor metadata now use `#EFEBE2`.
- Program/accent text uses `#D99202`.
- Action arrows/icons use `#D99202` where additional contrast is needed.
- The status bar switches to light icons immediately while Dark Mode is active.

## Dark Mode palette used
- `#58761C`
- `#EFEBE2`
- `#000D12`
- `#233E47`
- `#D99202`

## Light Mode
The existing Light Mode palette and visible styling were preserved. Semantic aliases resolve to the same original Light Mode values.

## Real-time behavior
`HomepageScreen.js` already subscribes to `useAppTheme()`. When the global Dark Mode switch changes `isDarkMode`, the screen recreates its theme styles and re-renders immediately. No app restart is required.
